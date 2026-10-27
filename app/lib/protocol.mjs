/**
 * The modified DRACO protocol of the paper, as a runnable engine.
 *
 * Parameters (Section 4): C systems, T tasks, E settings, R regenerations, J judges,
 * K repeat scorings; S4 batching on/off. Judging is blind (systems are shown as letters),
 * absolute (rubric criteria MET/UNMET -> score 0-100) and, when batched, each batch is shown
 * in a seeded random order, rotated one place per repeat so that every C repeats put each
 * answer in each position once and the repeats double as position calibration (Section 7.3).
 * Every scoring is retained with each criterion's verdict and the order shown (Section 7.4).
 * Statistics: task-level paired differences at a named setting of each system, one-sided and
 * two-sided paired permutation tests with the observed pattern counted, Holm correction across
 * every pre-registered comparison, Cohen's d_z and the interval from the inverted test
 * (Section 7.1), using the paper's own src/ modules.
 */
import { callModel } from './providers.mjs'
import { pairedPermutationTest, signFlipConfidenceInterval } from '../../src/permutation-test.mjs'
import { holmBonferroni } from '../../src/holm-bonferroni.mjs'
import { cohensDz } from '../../src/effect-size.mjs'
import { mean, sampleStdDev } from '../../src/stats-utils.mjs'
import { kendallTauB, sameLeader } from '../../src/rank-agreement.mjs'
import { weightedScore, hasPenalties } from './draco-dataset.mjs'

export const DEFAULT_GENERATION_SYSTEM = 'Answer the task thoroughly for a professional reader. State your method, the key assumptions, the most likely failure modes, and what evidence would change your conclusion.'

export function buildGenerationPrompt(task) {
  return { system: DEFAULT_GENERATION_SYSTEM, user: `${task.context ? task.context + '\n\n' : ''}Question: ${task.question}`, context: '' }
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Rubric text: criteria numbered continuously, grouped under their dimension where the task has
 *  dimensions (the DRACO task set's four sections), MET only when fully satisfied. */
export function rubricText(task) {
  /* A negative-weight criterion describes an error (the DRACO task set's convention): it is
     marked so the judge reads "MET" as "the answer contains this error". */
  const line = (c, i) => `C${i + 1}. ${task.weights && task.weights[i] < 0 ? '[error, MET if present] ' : ''}${c}`
  const head = hasPenalties(task)
    ? 'RUBRIC (mark each criterion MET only if fully satisfied; a criterion marked [error, MET if present] describes a mistake, and MET means the answer contains that mistake):'
    : 'RUBRIC (score each criterion MET only if fully satisfied):'
  if (task.dimensions && task.dimensions.length) {
    const blocks = task.dimensions.map((d) => `${d.title}:\n${task.criteria.slice(d.from, d.to).map((c, k) => line(c, d.from + k)).join('\n')}`)
    return `${head}\n${blocks.join('\n')}`
  }
  const lines = task.criteria.map(line).join('\n')
  return `${head}\n${lines}`
}

/**
 * Judge prompt for one call. `answers` = [{ key, text }] in the order to be shown.
 * Batched: several answers, each scored independently against the absolute rubric.
 * Unbatched: one answer. The judge never sees system names.
 */
export function buildJudgePrompt(task, answers, { batched }) {
  const n = task.criteria.length
  const system = batched
    ? `You are an expert grader. You will see a TASK, a RUBRIC of ${n} criteria and ${answers.length} candidate ANSWERS labelled ${answers.map((_, i) => LETTERS[i]).join(', ')}. Grade EACH answer independently against the absolute rubric, not relative to the other answers. For each answer output one line per criterion "X-C<i>: MET" or "X-C<i>: UNMET" (X = the answer letter), then one line "SCORE X: <0-100>" equal to the percentage of criteria MET. Output nothing else.`
    : `You are an expert grader. You will see a TASK, a RUBRIC of ${n} criteria and one ANSWER. For each criterion output one line "C<i>: MET" or "C<i>: UNMET", then one line "SCORE: <0-100>" equal to the percentage of criteria MET. Output nothing else.`
  const body = answers.map((a, i) => (batched ? `ANSWER ${LETTERS[i]}:\n${a.text}` : `ANSWER:\n${a.text}`)).join('\n\n')
  const user = `TASK:\n${task.context ? task.context + '\n\n' : ''}Question: ${task.question}\n\n${rubricText(task)}\n\n${body}`
  return { system, user, context: '' }
}

/**
 * Parse a judge's output into { [letter]: { score, met, unmet, metIndices, verdicts } }; unbatched
 * uses letter 'A'. `score` is the judge's own score line (null if it wrote none), `metIndices`
 * (0-based criterion numbers marked MET) is what weighted scoring needs, and `verdicts` is the
 * verdict on each criterion in rubric order, 'MET', 'UNMET' or null where none was read (a
 * criterion marked both counts as MET, as in the weighted score). A letter appears when its
 * output has a score line or at least one verdict line; an output with neither, such as a
 * refusal, gives no entry at all.
 */
export function parseJudgeOutput(text, { batched, n }) {
  const out = {}
  const indices = (re) => [...text.matchAll(re)].map((m) => Number(m[1]) - 1).filter((i) => i >= 0 && i < n)
  const verdictsFor = (prefix) => {
    const verdicts = Array.from({ length: n }, () => null)
    for (const m of text.matchAll(new RegExp(`\\b${prefix}C(\\d+)\\s*:\\s*(UNMET|MET)\\b`, 'gi'))) {
      const i = Number(m[1]) - 1
      if (i < 0 || i >= n) continue
      const v = m[2].toUpperCase()
      if (v === 'MET' || verdicts[i] == null) verdicts[i] = v
    }
    return verdicts
  }
  if (!batched) {
    const m = text.match(/SCORE\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)
    const metIndices = [...new Set(indices(/\bC(\d+)\s*:\s*MET\b/gi))]
    const met = metIndices.length
    const unmet = (text.match(/\bC\d+\s*:\s*UNMET\b/gi) || []).length
    if (!m && met + unmet === 0) return out
    const score = m ? Number(m[1]) : (met + unmet === n && n > 0 ? Math.round((100 * met) / n) : null)
    out.A = { score, met, unmet, metIndices, verdicts: verdictsFor('') }
    return out
  }
  /* Every letter with a score line or a verdict line: on a weighted rubric the verdicts are the
     scoring, so a letter whose score line is missing still has one. */
  const letters = new Set()
  for (const [, letter] of text.matchAll(/SCORE\s+([A-Z])\s*:\s*[0-9]/gi)) letters.add(letter.toUpperCase())
  for (const [, letter] of text.matchAll(/\b([A-Z])-C\d+\s*:\s*(?:UN)?MET\b/gi)) letters.add(letter.toUpperCase())
  for (const L of [...letters].sort()) {
    const lines = [...text.matchAll(new RegExp(`SCORE\\s+${L}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`, 'gi'))]
    const metIndices = [...new Set(indices(new RegExp(`\\b${L}-C(\\d+)\\s*:\\s*MET\\b`, 'gi')))]
    const unmet = (text.match(new RegExp(`\\b${L}-C\\d+\\s*:\\s*UNMET\\b`, 'gi')) || []).length
    out[L] = { score: lines.length ? Number(lines[lines.length - 1][1]) : null, met: metIndices.length, unmet, metIndices, verdicts: verdictsFor(`${L}-`) }
  }
  return out
}

/**
 * One retained scoring from one judge's parsed output for one answer (`entry` is the letter's
 * entry from parseJudgeOutput, or undefined when the output had none).
 *
 * Where the task carries criterion weights (the DRACO task set) the scoring is computed from
 * the verdicts alone (Section 7.1): the weight-normalised fraction of criteria met, overall and
 * per dimension. An answer with no verdict the parser can read, such as a refusal or a score
 * line without verdict lines, has no scoring: its score is null, and the summary leaves it out
 * of the median instead of counting it as 0. The judge's own score line is kept as judgeScore.
 * Otherwise the score is the judge's own score line.
 */
export function scoreJudgement(task, entry, { scoring = 'weighted' } = {}) {
  const p = entry
  const verdicts = p?.verdicts ?? null
  const kept = { judgeScore: p ? p.score : null, met: p ? p.met : null, unmet: p ? p.unmet : null, verdicts }
  if (scoring === 'weighted' && task.weights) {
    const read = !!p && (verdicts ? verdicts.some((v) => v != null) : p.met + p.unmet > 0)
    const weighted = read ? weightedScore(task, p.metIndices || []) : null
    return { score: weighted ? weighted.overall : null, ...kept, dimensionScores: weighted ? weighted.perDimension : null }
  }
  return { score: p ? p.score : null, ...kept, dimensionScores: null }
}

/** FNV-1a, 32 bits: a batch's name to a seed. */
function hash32(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}

/** mulberry32, the generator src/permutation-test.mjs uses. */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The order in which repeat k (0-based) of one batch shows its n answers, as a permutation of
 * 0..n-1 (position -> answer index, answers in configuration order). Each block of n repeats
 * draws a random order from the fixed `seed` and the batch's name (task, setting,
 * regeneration, judge) and rotates it one place per repeat, so every repeat's order is a
 * seeded random permutation, the order differs between batches even at K = 1, and any n
 * consecutive repeats from the start of a block put each answer in each position once, the
 * balanced position calibration of Section 7.3. The same seed and batch give the same order.
 */
export function orderForRepeat(n, k, seed = 1, batchKey = '') {
  const base = Array.from({ length: n }, (_, i) => i)
  if (n < 2) return base
  const rnd = mulberry32(hash32(`${seed}|${batchKey}|${Math.floor(k / n)}`))
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [base[i], base[j]] = [base[j], base[i]] }
  const shift = k % n
  return base.map((_, i) => base[(i + shift) % n])
}

/** Call counts for the plan (Equations 1-3). */
export function planCounts({ C, T, E, R, J, K, batched }) {
  const generation = C * E * R * T
  const judging = batched ? E * R * T * J * K : C * E * R * T * J * K
  return { generation, judging, total: generation + judging }
}

/**
 * Run the protocol. `config` = { systems:[{id,label,provider,modelId,baseUrl?,settings:[effort|null]}],
 * judges:[{id,label,provider,modelId,baseUrl?}], tasks:[{id,title,context,question,criteria:[]}],
 * R, K, batched, comparisons:[[sideA, sideB]] (pre-registered, one-sided A>B; each side a system id
 * or { systemId, setting }, see summarise), alpha, concurrency, orderSeed (default 1) }.
 * `onEvent(evt)` receives progress; returns { raw, summary }. Each retained scoring carries the
 * verdict on each criterion and the order the judging call showed the answers in.
 */
export async function runProtocol(config, connection, onEvent = () => {}, deps = {}) {
  /* deps.callModel replaces the provider router; the tests pass a scripted model so that no
     call leaves the machine. */
  const call = deps.callModel || callModel
  const { systems, judges, tasks, R = 1, K = 1, batched = true, alpha = 0.05, concurrency = 3, scoring = 'weighted' } = config
  const orderSeed = config.orderSeed == null || config.orderSeed === '' || !Number.isFinite(Number(config.orderSeed)) ? 1 : Number(config.orderSeed)
  const raw = { generations: [], scores: [], errors: [], orderSeed }
  const emit = (type, data) => onEvent({ type, at: new Date().toISOString(), ...data })
  const cells = []
  for (const s of systems) for (const [ei, setting] of (s.settings?.length ? s.settings : [null]).entries()) for (const [ti, task] of tasks.entries()) for (let r = 0; r < R; r++) cells.push({ s, setting, ei, task, ti, r })
  const counts = planCounts({ C: systems.length, T: tasks.length, E: Math.max(1, ...systems.map((s) => s.settings?.length || 1)), R, J: judges.length, K, batched })
  emit('start', { counts })

  // --- generation, limited concurrency, no shared state across systems
  let done = 0
  const gens = new Map() // key task|setting|r -> [{systemId, text, ...}]
  async function worker(queue) {
    for (;;) {
      const cell = queue.shift(); if (!cell) return
      const prompt = buildGenerationPrompt(cell.task)
      try {
        const res = await call({ system: cell.s, connection, prompt, effort: cell.setting || undefined })
        const row = { systemId: cell.s.id, settingIndex: cell.ei, setting: cell.setting, taskId: cell.task.id, regeneration: cell.r, text: res.text, inputTokens: res.inputTokens, outputTokens: res.outputTokens, reasoningTokens: res.reasoningTokens, dailftTokens: res.dailftTokens, ms: res.ms }
        raw.generations.push(row)
        const key = `${cell.task.id}|${cell.ei}|${cell.r}`
        if (!gens.has(key)) gens.set(key, [])
        gens.get(key).push(row)
      } catch (e) {
        raw.errors.push({ stage: 'generation', systemId: cell.s.id, taskId: cell.task.id, setting: cell.setting, regeneration: cell.r, error: String(e.message) })
        emit('error', { stage: 'generation', systemId: cell.s.id, taskId: cell.task.id, error: String(e.message) })
      }
      done++
      emit('progress', { stage: 'generation', done, total: cells.length })
    }
  }
  const queue = [...cells]
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker(queue)))

  // --- judging
  /* A batch's answers start in configuration order, not in the order their generation calls
     happened to finish, so that the seeded order shown (orderForRepeat) is reproducible. */
  const place = new Map(systems.map((s, i) => [s.id, i]))
  const judgeJobs = []
  for (const [key, finished] of gens) {
    const [taskId, ei, r] = key.split('|')
    const task = tasks.find((t) => t.id === taskId)
    const rows = [...finished].sort((x, y) => place.get(x.systemId) - place.get(y.systemId))
    for (const judge of judges) for (let k = 0; k < K; k++) {
      if (batched) judgeJobs.push({ task, ei: Number(ei), r: Number(r), judge, k, rows })
      else for (const row of rows) judgeJobs.push({ task, ei: Number(ei), r: Number(r), judge, k, rows: [row] })
    }
  }
  let jdone = 0
  async function judgeWorker(q) {
    for (;;) {
      const job = q.shift(); if (!job) return
      const order = orderForRepeat(job.rows.length, job.k, orderSeed, `${job.task.id}|${job.ei}|${job.r}|${job.judge.id}`)
      const shown = order.map((i) => job.rows[i])
      const shownOrder = shown.map((row) => row.systemId)
      const prompt = buildJudgePrompt(job.task, shown.map((row) => ({ key: row.systemId, text: row.text })), { batched })
      try {
        const res = await call({ system: job.judge, connection, prompt, maxOutputTokens: 4000 })
        const parsed = parseJudgeOutput(res.text, { batched, n: job.task.criteria.length })
        shown.forEach((row, pos) => {
          const scored = scoreJudgement(job.task, parsed[LETTERS[pos]], { scoring })
          raw.scores.push({ taskId: job.task.id, settingIndex: job.ei, regeneration: job.r, judgeId: job.judge.id, repeat: job.k, systemId: row.systemId, position: pos, shownOrder, ...scored, judgeInputTokens: res.inputTokens, judgeOutputTokens: res.outputTokens, judgeDailftTokens: res.dailftTokens })
        })
      } catch (e) {
        raw.errors.push({ stage: 'judging', judgeId: job.judge.id, taskId: job.task.id, repeat: job.k, error: String(e.message) })
        emit('error', { stage: 'judging', judgeId: job.judge.id, taskId: job.task.id, error: String(e.message) })
      }
      jdone++
      emit('progress', { stage: 'judging', done: jdone, total: judgeJobs.length })
    }
  }
  const jq = [...judgeJobs]
  await Promise.all(Array.from({ length: Math.min(concurrency, jq.length) }, () => judgeWorker(jq)))

  const summary = summarise(config, raw, { alpha, aggregation: config.aggregation })
  emit('done', { summary })
  return { raw, summary }
}

/**
 * Aggregate to one score per (system, setting, task).
 *   aggregation 'median' (the paper's default): median over repeats -> median over judges -> mean over regenerations.
 *   aggregation 'mean' (DRACO as published): mean over repeats -> mean over judges -> mean over regenerations.
 * A missing scoring (a failed judging call, or one with no score) is left out of its median; a
 * regeneration with no scoring at all is left out of the mean, and a task with no regeneration
 * scored has no score (null) for that system and setting.
 *
 * Each pre-registered comparison is made at one setting of each system. A side of
 * config.comparisons is a system id, or { systemId, setting } naming the setting. A bare id
 * means the system's compareSetting if it carries one that was run, otherwise its first
 * configured setting, in configuration order. Holm's correction runs across every named
 * comparison: one that could not be tested still counts in the family, with p = 1, so it is
 * never rejected and the thresholds of the others do not loosen (Section 7.1).
 */
export function summarise(config, raw, { alpha = 0.05, aggregation = 'median' } = {}) {
  const med = (xs) => { const a = xs.filter((x) => x != null).sort((p, q) => p - q); if (!a.length) return null; return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2 }
  const avg = (xs) => { const a = xs.filter((x) => x != null); return a.length ? mean(a) : null }
  const median = aggregation === 'mean' ? avg : med
  const perTask = {} // system|setting -> taskId -> score
  const groups = {}
  for (const s of raw.scores) {
    const g = `${s.systemId}|${s.settingIndex}|${s.taskId}|${s.regeneration}|${s.judgeId}`
    ;(groups[g] = groups[g] || []).push(s.score)
  }
  const judgeLevel = {}
  for (const [g, scores] of Object.entries(groups)) { const [sys, ei, task, r] = g.split('|'); const k2 = `${sys}|${ei}|${task}|${r}`; (judgeLevel[k2] = judgeLevel[k2] || []).push(median(scores)) }
  const regenLevel = {}
  for (const [k2, meds] of Object.entries(judgeLevel)) { const [sys, ei, task] = k2.split('|'); const k3 = `${sys}|${ei}|${task}`; (regenLevel[k3] = regenLevel[k3] || []).push(median(meds)) }
  for (const [k3, vals] of Object.entries(regenLevel)) { const [sys, ei, task] = k3.split('|'); const key = `${sys}|${ei}`; const scored = vals.filter((v) => v != null); (perTask[key] = perTask[key] || {})[task] = scored.length ? mean(scored) : null }

  const systemsById = new Map((config.systems || []).map((s) => [s.id, s]))
  const conditions = Object.keys(perTask).map((key) => {
    const [systemId, settingIndex] = key.split('|')
    const scores = Object.values(perTask[key]).filter((v) => v != null && !Number.isNaN(v))
    const sys = systemsById.get(systemId)
    return { key, systemId, settingIndex: Number(settingIndex), label: sys?.label || systemId, setting: sys?.settings?.[Number(settingIndex)] ?? null, n: scores.length, mean: scores.length ? mean(scores) : null, sd: scores.length > 1 ? sampleStdDev(scores) : null }
  }).sort((a, b) => (b.mean ?? -1) - (a.mean ?? -1))

  // The setting each system is compared at when a comparison names none.
  const settingsOf = (sys) => (sys?.settings?.length ? sys.settings : [null])
  const defaultIndex = (sys) => { const i = sys && sys.compareSetting != null ? settingsOf(sys).indexOf(sys.compareSetting) : -1; return i >= 0 ? i : 0 }
  const operatingPoints = Object.fromEntries((config.systems || []).map((s) => { const i = defaultIndex(s); return [s.id, { settingIndex: i, setting: settingsOf(s)[i] ?? null, key: `${s.id}|${i}` }] }))
  const side = (x) => {
    const systemId = typeof x === 'string' ? x : x?.systemId
    const sys = systemsById.get(systemId)
    const settings = settingsOf(sys)
    let index = defaultIndex(sys)
    if (x && typeof x === 'object' && Number.isInteger(x.settingIndex)) index = x.settingIndex
    else if (x && typeof x === 'object' && x.setting != null) index = settings.indexOf(x.setting)
    const setting = index >= 0 && index < settings.length ? settings[index] : x?.setting ?? null
    return { systemId, setting, key: `${systemId}|${index}`, configured: index >= 0 && index < settings.length }
  }

  // Pre-registered comparisons (one-sided A > B) on task-level paired differences; Holm across them.
  const comps = (config.comparisons || []).map(([x, y]) => {
    const A = side(x), B = side(y)
    const named = { a: A.systemId, b: B.systemId, aSetting: A.setting, bSetting: B.setting }
    if (!A.configured || !B.configured) return { ...named, error: 'setting not configured for this system' }
    if (!perTask[A.key] || !perTask[B.key]) return { ...named, error: 'condition missing' }
    const tasks = Object.keys(perTask[A.key]).filter((t) => perTask[B.key][t] != null && perTask[A.key][t] != null)
    const diffs = tasks.map((t) => perTask[A.key][t] - perTask[B.key][t])
    if (diffs.length < 3) return { ...named, n: diffs.length, error: 'fewer than 3 paired tasks' }
    const test = pairedPermutationTest(diffs, { countObserved: true })
    const ci = signFlipConfidenceInterval(diffs, { alpha, countObserved: true })
    return { ...named, n: diffs.length, meanDiff: mean(diffs), dz: cohensDz(diffs), p: test.pValueOneSided, exact: test.exact, ci: [ci.lower, ci.upper], ciLevel: ci.level }
  })
  const tested = comps.filter((c) => !c.error)
  const holm = holmBonferroni([...tested.map((c) => c.p), ...comps.filter((c) => c.error).map(() => 1)], alpha)
  tested.forEach((c, i) => { c.holmAlpha = holm[i].adjustedAlpha; c.rejected = holm[i].reject })
  for (const c of comps) { c.family = comps.length; if (c.error) { c.holmAlpha = null; c.rejected = null } }

  // Exploratory: all pairs, two-sided, reported separately (Section 7.4).
  const keys = Object.keys(perTask)
  const exploratory = []
  for (let x = 0; x < keys.length; x++) for (let y = x + 1; y < keys.length; y++) {
    const tasks = Object.keys(perTask[keys[x]]).filter((t) => perTask[keys[y]][t] != null && perTask[keys[x]][t] != null)
    const diffs = tasks.map((t) => perTask[keys[x]][t] - perTask[keys[y]][t])
    if (diffs.length < 3) continue
    const pG = pairedPermutationTest(diffs, { countObserved: true }).pValueOneSided, pL = pairedPermutationTest(diffs.map((d) => -d), { countObserved: true }).pValueOneSided
    exploratory.push({ a: keys[x], b: keys[y], n: diffs.length, meanDiff: mean(diffs), dz: cohensDz(diffs), pTwoSided: Math.min(1, 2 * Math.min(pG, pL)) })
  }

  const judgeAgreement = judgeAgreementSummary(raw)
  const usage = { generationOutputTokens: raw.generations.reduce((a, g) => a + (g.outputTokens || 0), 0), dailftTokens: raw.generations.reduce((a, g) => a + (g.dailftTokens || 0), 0) + judgeDailftTokens(raw), calls: { generation: raw.generations.length, judging: new Set(raw.scores.map((s) => `${s.taskId}|${s.settingIndex}|${s.regeneration}|${s.judgeId}|${s.repeat}|${config.batched ? '' : s.systemId}`)).size } }
  return { conditions, comparisons: comps, exploratory, judgeAgreement, usage, errors: raw.errors.length, perTask, aggregation, operatingPoints }
}

/** Judge usage in DAILFT tokens, counted once per judging call (batched calls share one usage figure across their rows). */
function judgeDailftTokens(raw) {
  const seen = new Set(); let total = 0
  for (const s of raw.scores) { const k = `${s.taskId}|${s.settingIndex}|${s.regeneration}|${s.judgeId}|${s.repeat}|${s.position === 0 ? '' : s.systemId}`; if (s.position !== 0 && seen.has(k)) continue; if (s.position === 0) { if (seen.has(k)) continue; seen.add(k) } total += s.judgeDailftTokens || 0 }
  return total
}

/** Test-retest spread per judge (SD across K repeats of the same item) and between-judge spread. */
export function judgeAgreementSummary(raw) {
  const byItemJudge = {}
  for (const s of raw.scores) { if (s.score == null) continue; const k = `${s.taskId}|${s.settingIndex}|${s.regeneration}|${s.systemId}|${s.judgeId}`; (byItemJudge[k] = byItemJudge[k] || []).push(s.score) }
  const retest = Object.values(byItemJudge).filter((v) => v.length > 1).map((v) => sampleStdDev(v))
  const byItem = {}
  for (const [k, v] of Object.entries(byItemJudge)) { const item = k.split('|').slice(0, 4).join('|'); (byItem[item] = byItem[item] || []).push(mean(v)) }
  const between = Object.values(byItem).filter((v) => v.length > 1).map((v) => sampleStdDev(v))
  return { testRetestSdMean: retest.length ? mean(retest) : null, betweenJudgeSdMean: between.length ? mean(between) : null, itemsWithRepeats: retest.length, itemsWithMultipleJudges: between.length }
}

/**
 * Raw table as CSV (one row per retained score). `verdicts` is one character per criterion in
 * rubric order, M (met), U (unmet) or - (no verdict read); `shownOrder` is the system ids in the
 * order the judging call showed them, separated by spaces.
 */
export function scoresCsv(raw) {
  const cols = ['taskId', 'settingIndex', 'regeneration', 'judgeId', 'repeat', 'systemId', 'position', 'score', 'judgeScore', 'met', 'unmet', 'judgeInputTokens', 'judgeOutputTokens', 'judgeDailftTokens', 'verdicts', 'shownOrder']
  const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
  const cell = (s, c) => {
    if (c === 'verdicts') return Array.isArray(s.verdicts) ? s.verdicts.map((v) => (v === 'MET' ? 'M' : v === 'UNMET' ? 'U' : '-')).join('') : null
    if (c === 'shownOrder') return Array.isArray(s.shownOrder) ? s.shownOrder.join(' ') : null
    return s[c]
  }
  return [cols.join(','), ...raw.scores.map((s) => cols.map((c) => esc(cell(s, c))).join(','))].join('\n')
}

// ---------------------------------------------------------------- Protocol presets and validation

/**
 * Protocol presets. `draco` follows the published DRACO protocol as the benchmark paper describes it
 * (Appendix A of the paper): every answer graded in its own call against the full weighted rubric,
 * five grading runs averaged, the four dimensions reported, one setting, one generation per task;
 * the judge prompt is this runner's absolute rubric prompt, since DRACO's own prompt text is not
 * published. It is there for running DRACO as its authors did; it is not the reference of a
 * validation. `reduced` is the paper's protocol with whatever R, K and batching the user set.
 * `validate` runs the complete protocol of Section 8, Phase 1 (referenceConfig) and then the
 * reduced protocol on the same systems and tasks, and reports their agreement (Phase 2).
 */
export const PROTOCOL_PRESETS = {
  draco: { id: 'draco', label: 'DRACO as published', R: 1, K: 5, batched: false, scoring: 'weighted', aggregation: 'mean', settingsSwept: false, description: 'Each answer graded alone against the full weighted rubric, five grading runs averaged, four dimensions, one setting, one generation per task: DRACO as its authors ran it.' },
  reduced: { id: 'reduced', label: 'Reduced (this paper)', scoring: 'weighted', aggregation: 'median', settingsSwept: true, description: 'The simplifications of Sections 5 to 7 with the R, K and batching you set: blind, order-randomised, batched judging by default; median over repeats and judges.' },
  validate: { id: 'validate', label: 'Validation: run both', description: 'Runs the complete protocol once as the reference (every ticked setting, each answer judged alone, the reference R and K, the same median rule) and the reduced protocol on the same systems and tasks, then reports rank agreement, per-comparison verdicts and the cost saved (Section 8).' },
}

const sideId = (x) => (typeof x === 'string' ? x : x?.systemId)

/** The config a preset actually runs. `reduced` keeps the user's choices; `draco` fixes them;
 *  `reference` is the Phase 1 run of a validation (referenceConfig). */
export function applyPreset(config, presetId) {
  if (presetId === 'reference') return referenceConfig(config)
  const p = PROTOCOL_PRESETS[presetId] || PROTOCOL_PRESETS.reduced
  if (p.id === 'draco') {
    /* One setting per system, so a comparison side that names a setting falls back to the
       system itself. */
    return { ...config, R: 1, K: 5, batched: false, scoring: 'weighted', aggregation: 'mean', systems: (config.systems || []).map((s) => ({ ...s, settings: [] })), comparisons: (config.comparisons || []).map((pair) => pair.map(sideId)), protocol: 'draco' }
  }
  return { ...config, scoring: config.scoring || 'weighted', aggregation: 'median', protocol: 'reduced' }
}

/**
 * Section 8, Phase 1: the complete, unsimplified protocol on the same systems and tasks, run
 * once as the reference. Every configured setting of every system (E), the reference's own
 * regenerations and repeat scorings (config.reference.R and .K; the run's R and K where a
 * configuration has none), every answer judged in its own call (no S4), and the same scoring
 * and aggregation rule as the reduced run, so the two differ only in the simplifications.
 */
export function referenceConfig(config) {
  const reduced = applyPreset(config, 'reduced')
  const R = Number(config.reference?.R) || Number(config.R) || 1
  const K = Number(config.reference?.K) || Number(config.K) || 1
  return { ...reduced, R, K, batched: false, protocol: 'reference' }
}

/**
 * Compare a reduced run against the reference on the same systems: rank agreement over the
 * systems' mean scores, whether the leader is the same, whether each pre-registered comparison
 * reaches the same verdict, and the cost ratio. Each system is taken at one setting, the one
 * the reduced run compares it at (its operating point), and the reference at that same
 * setting; a system the reference did not run at that setting is left out.
 */
export function compareProtocols(reference, reduced) {
  const ref = reference.summary, red = reduced.summary
  const indexOf = (c) => (Number.isInteger(c.settingIndex) ? c.settingIndex : Number(String(c.key).split('|')[1]))
  const at = (sm, id) => {
    const op = sm.operatingPoints?.[id]
    return sm.conditions.find((c) => c.systemId === id && (op ? c.key === op.key : indexOf(c) === 0)) || null
  }
  const ids = red.operatingPoints ? Object.keys(red.operatingPoints) : [...new Set(red.conditions.map((c) => c.systemId))]
  const systems = []
  for (const id of ids) {
    const r = at(red, id)
    if (!r || r.mean == null) continue
    const f = ref.conditions.find((c) => c.systemId === id && (c.setting ?? null) === (r.setting ?? null))
    if (!f || f.mean == null) continue
    systems.push({ systemId: id, setting: r.setting ?? null, reference: f.mean, reduced: r.mean })
  }
  const a = systems.map((s) => s.reference), b = systems.map((s) => s.reduced)
  const same = (x, y) => x.a === y.a && x.b === y.b && (x.aSetting ?? null) === (y.aSetting ?? null) && (x.bSetting ?? null) === (y.bSetting ?? null)
  const verdicts = (ref.comparisons || []).map((rc) => {
    const dc = (red.comparisons || []).find((x) => same(x, rc))
    return { a: rc.a, b: rc.b, aSetting: rc.aSetting ?? null, bSetting: rc.bSetting ?? null, referenceRejected: rc.rejected ?? null, reducedRejected: dc ? dc.rejected ?? null : null, referenceMeanDiff: rc.meanDiff ?? null, reducedMeanDiff: dc ? dc.meanDiff ?? null : null, agree: dc ? (rc.rejected ?? null) === (dc.rejected ?? null) : null }
  })
  const calls = (sm) => sm.usage.calls.generation + sm.usage.calls.judging
  const tokens = (sm) => sm.usage.dailftTokens || 0
  return {
    systems,
    kendallTau: systems.length >= 2 ? kendallTauB(a, b) : null,
    sameLeader: systems.length >= 2 ? sameLeader(a, b) : null,
    verdicts,
    verdictsAgree: verdicts.length ? verdicts.filter((v) => v.agree).length : null,
    cost: { referenceCalls: calls(reference.summary), reducedCalls: calls(reduced.summary), callRatio: calls(reduced.summary) ? calls(reference.summary) / calls(reduced.summary) : null, referenceDailftTokens: tokens(reference.summary), reducedDailftTokens: tokens(reduced.summary), tokenRatio: tokens(reduced.summary) ? tokens(reference.summary) / tokens(reduced.summary) : null },
  }
}

/** Section 8: the reference run (Phase 1, referenceConfig), then the reduced run, on the same systems and tasks; events carry a `phase`. */
export async function runValidation(config, connection, onEvent = () => {}, deps = {}) {
  const wrap = (phase) => (evt) => onEvent({ ...evt, phase })
  const reference = await runProtocol(applyPreset(config, 'reference'), connection, wrap('reference'), deps)
  const reduced = await runProtocol(applyPreset(config, 'reduced'), connection, wrap('reduced'), deps)
  const comparison = compareProtocols(reference, reduced)
  onEvent({ type: 'validation', at: new Date().toISOString(), comparison })
  return { reference, reduced, comparison, summary: { ...reduced.summary, validation: comparison, reference: reference.summary } }
}
