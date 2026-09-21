/**
 * The modified DRACO protocol of the paper, as a runnable engine.
 *
 * Parameters (Section 4): C systems, T tasks, E settings, R regenerations, J judges,
 * K repeat scorings; S4 batching on/off. Judging is blind (systems are shown as letters),
 * absolute (rubric criteria MET/UNMET -> score 0-100) and, when batched, the order of the
 * answers is rotated across the K repeats so that repeats double as position calibration
 * (Section 7.3). Every raw score is retained (Section 7.4). Statistics: task-level paired
 * differences, one-sided/two-sided paired permutation tests, Holm correction across the
 * pre-registered comparisons, Cohen's d_z (Section 7.1), using the paper's own src/ modules.
 */
import { callModel } from './providers.mjs'
import { pairedPermutationTest } from '../../src/permutation-test.mjs'
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

/** Parse a judge's output into { [letter]: { score, met, unmet, metIndices } }; unbatched uses letter 'A'.
 *  `metIndices` (0-based criterion numbers marked MET) is what weighted scoring needs. */
export function parseJudgeOutput(text, { batched, n }) {
  const out = {}
  const indices = (re) => [...text.matchAll(re)].map((m) => Number(m[1]) - 1).filter((i) => i >= 0 && i < n)
  if (!batched) {
    const m = text.match(/SCORE\s*:\s*([0-9]+(?:\.[0-9]+)?)/i)
    const metIndices = [...new Set(indices(/\bC(\d+)\s*:\s*MET\b/gi))]
    const met = metIndices.length
    const unmet = (text.match(/\bC\d+\s*:\s*UNMET\b/gi) || []).length
    const score = m ? Number(m[1]) : (met + unmet === n && n > 0 ? Math.round((100 * met) / n) : null)
    out.A = { score, met, unmet, metIndices }
    return out
  }
  for (const [, letter, val] of text.matchAll(/SCORE\s+([A-Z])\s*:\s*([0-9]+(?:\.[0-9]+)?)/gi)) {
    const L = letter.toUpperCase()
    const metIndices = [...new Set(indices(new RegExp(`\\b${L}-C(\\d+)\\s*:\\s*MET\\b`, 'gi')))]
    const unmet = (text.match(new RegExp(`\\b${L}-C\\d+\\s*:\\s*UNMET\\b`, 'gi')) || []).length
    out[L] = { score: Number(val), met: metIndices.length, unmet, metIndices }
  }
  return out
}

/** Deterministic rotation of an order for repeat k (0-based); a real shuffle for k >= n. */
export function orderForRepeat(n, k, seed = 1) {
  const idx = Array.from({ length: n }, (_, i) => i)
  if (k < n) return idx.map((_, i) => idx[(i + k) % n])
  let s = seed * 9301 + k * 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
  return idx
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
 * R, K, batched, comparisons:[[sysA, sysB]] (pre-registered, one-sided A>B), alpha, concurrency }.
 * `onEvent(evt)` receives progress; returns { raw, summary }.
 */
export async function runProtocol(config, connection, onEvent = () => {}) {
  const { systems, judges, tasks, R = 1, K = 1, batched = true, alpha = 0.05, concurrency = 3, scoring = 'weighted' } = config
  const raw = { generations: [], scores: [], errors: [] }
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
        const res = await callModel({ system: cell.s, connection, prompt, effort: cell.setting || undefined })
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
  const judgeJobs = []
  for (const [key, rows] of gens) {
    const [taskId, ei, r] = key.split('|')
    const task = tasks.find((t) => t.id === taskId)
    for (const judge of judges) for (let k = 0; k < K; k++) {
      if (batched) judgeJobs.push({ task, ei: Number(ei), r: Number(r), judge, k, rows })
      else for (const row of rows) judgeJobs.push({ task, ei: Number(ei), r: Number(r), judge, k, rows: [row] })
    }
  }
  let jdone = 0
  async function judgeWorker(q) {
    for (;;) {
      const job = q.shift(); if (!job) return
      const order = orderForRepeat(job.rows.length, job.k)
      const shown = order.map((i) => job.rows[i])
      const prompt = buildJudgePrompt(job.task, shown.map((row) => ({ key: row.systemId, text: row.text })), { batched })
      try {
        const res = await callModel({ system: job.judge, connection, prompt, maxOutputTokens: 4000 })
        const parsed = parseJudgeOutput(res.text, { batched, n: job.task.criteria.length })
        shown.forEach((row, pos) => {
          const p = parsed[LETTERS[pos]]
          /* Weighted scoring where the task carries criterion weights (the DRACO task set): the
             score is the weight-normalised fraction of criteria met, overall and per dimension.
             Otherwise the judge's own percentage, as before. */
          const weighted = p && scoring === 'weighted' && job.task.weights ? weightedScore(job.task, p.metIndices || []) : null
          raw.scores.push({ taskId: job.task.id, settingIndex: job.ei, regeneration: job.r, judgeId: job.judge.id, repeat: job.k, systemId: row.systemId, position: pos, score: weighted ? weighted.overall : p ? p.score : null, judgeScore: p ? p.score : null, met: p ? p.met : null, unmet: p ? p.unmet : null, dimensionScores: weighted ? weighted.perDimension : null, judgeInputTokens: res.inputTokens, judgeOutputTokens: res.outputTokens, judgeDailftTokens: res.dailftTokens })
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
  for (const [k3, vals] of Object.entries(regenLevel)) { const [sys, ei, task] = k3.split('|'); const key = `${sys}|${ei}`; (perTask[key] = perTask[key] || {})[task] = mean(vals.filter((v) => v != null)) }

  const conditions = Object.keys(perTask).map((key) => {
    const [systemId, settingIndex] = key.split('|')
    const scores = Object.values(perTask[key]).filter((v) => v != null && !Number.isNaN(v))
    const sys = config.systems.find((s) => s.id === systemId)
    return { key, systemId, label: sys?.label || systemId, setting: sys?.settings?.[Number(settingIndex)] ?? null, n: scores.length, mean: scores.length ? mean(scores) : null, sd: scores.length > 1 ? sampleStdDev(scores) : null }
  }).sort((a, b) => (b.mean ?? -1) - (a.mean ?? -1))

  // Pre-registered comparisons (one-sided A > B) on task-level paired differences; Holm across them.
  const comps = (config.comparisons || []).map(([a, b]) => {
    const ka = Object.keys(perTask).find((k) => k.startsWith(a + '|')), kb = Object.keys(perTask).find((k) => k.startsWith(b + '|'))
    if (!ka || !kb) return { a, b, error: 'condition missing' }
    const tasks = Object.keys(perTask[ka]).filter((t) => perTask[kb][t] != null && perTask[ka][t] != null)
    const diffs = tasks.map((t) => perTask[ka][t] - perTask[kb][t])
    if (diffs.length < 3) return { a, b, n: diffs.length, error: 'fewer than 3 paired tasks' }
    const test = pairedPermutationTest(diffs)
    return { a, b, n: diffs.length, meanDiff: mean(diffs), dz: cohensDz(diffs), p: test.pValueOneSided, exact: test.exact }
  })
  const ps = comps.filter((c) => !c.error).map((c) => c.p)
  const holm = ps.length ? holmBonferroni(ps, alpha) : []
  let i = 0
  for (const c of comps) if (!c.error) { const h = holm[i++]; c.holmAlpha = h ? h.adjustedAlpha : null; c.rejected = h ? h.reject : null }

  // Exploratory: all pairs, two-sided, reported separately (Section 7.4).
  const keys = Object.keys(perTask)
  const exploratory = []
  for (let x = 0; x < keys.length; x++) for (let y = x + 1; y < keys.length; y++) {
    const tasks = Object.keys(perTask[keys[x]]).filter((t) => perTask[keys[y]][t] != null && perTask[keys[x]][t] != null)
    const diffs = tasks.map((t) => perTask[keys[x]][t] - perTask[keys[y]][t])
    if (diffs.length < 3) continue
    const pG = pairedPermutationTest(diffs).pValueOneSided, pL = pairedPermutationTest(diffs.map((d) => -d)).pValueOneSided
    exploratory.push({ a: keys[x], b: keys[y], n: diffs.length, meanDiff: mean(diffs), dz: cohensDz(diffs), pTwoSided: Math.min(1, 2 * Math.min(pG, pL)) })
  }

  const judgeAgreement = judgeAgreementSummary(raw)
  const usage = { generationOutputTokens: raw.generations.reduce((a, g) => a + (g.outputTokens || 0), 0), dailftTokens: raw.generations.reduce((a, g) => a + (g.dailftTokens || 0), 0) + judgeDailftTokens(raw), calls: { generation: raw.generations.length, judging: new Set(raw.scores.map((s) => `${s.taskId}|${s.settingIndex}|${s.regeneration}|${s.judgeId}|${s.repeat}|${config.batched ? '' : s.systemId}`)).size } }
  return { conditions, comparisons: comps, exploratory, judgeAgreement, usage, errors: raw.errors.length, perTask }
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

/** Raw table as CSV (one row per retained score). */
export function scoresCsv(raw) {
  const cols = ['taskId', 'settingIndex', 'regeneration', 'judgeId', 'repeat', 'systemId', 'position', 'score', 'judgeScore', 'met', 'unmet', 'judgeInputTokens', 'judgeOutputTokens', 'judgeDailftTokens']
  const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))
  return [cols.join(','), ...raw.scores.map((s) => cols.map((c) => esc(s[c])).join(','))].join('\n')
}

// ---------------------------------------------------------------- Protocol presets and validation

/**
 * Protocol presets. `draco` follows the published DRACO protocol as the benchmark paper describes it
 * (Appendix A of the paper): every answer graded in its own call against the full weighted rubric,
 * five grading runs averaged, the four dimensions reported, one setting, one generation per task;
 * the judge prompt is this runner's absolute rubric prompt, since DRACO's own prompt text is not
 * published. `reduced` is the paper's protocol with whatever R, K and batching the user set.
 * `validate` runs both on the same systems and tasks (Section 8, Phases 1 and 2) and reports rank
 * agreement between them.
 */
export const PROTOCOL_PRESETS = {
  draco: { id: 'draco', label: 'DRACO as published', R: 1, K: 5, batched: false, scoring: 'weighted', aggregation: 'mean', settingsSwept: false, description: 'Each answer graded alone against the full weighted rubric, five grading runs averaged, four dimensions, one setting, one generation per task. The reference protocol.' },
  reduced: { id: 'reduced', label: 'Reduced (this paper)', scoring: 'weighted', aggregation: 'median', settingsSwept: true, description: 'The simplifications of Sections 5 to 7 with the R, K and batching you set: blind, order-rotated, batched judging by default; median over repeats and judges.' },
  validate: { id: 'validate', label: 'Validation: run both', description: 'Runs the published protocol once as the reference and the reduced protocol on the same systems and tasks, then reports rank agreement, per-comparison verdicts and the cost saved (Section 8).' },
}

/** The config a preset actually runs. `reduced` keeps the user's choices; `draco` fixes them. */
export function applyPreset(config, presetId) {
  const p = PROTOCOL_PRESETS[presetId] || PROTOCOL_PRESETS.reduced
  if (p.id === 'draco') {
    return { ...config, R: 1, K: 5, batched: false, scoring: 'weighted', aggregation: 'mean', systems: (config.systems || []).map((s) => ({ ...s, settings: [] })), protocol: 'draco' }
  }
  return { ...config, scoring: config.scoring || 'weighted', aggregation: 'median', protocol: 'reduced' }
}

/**
 * Compare a reduced run against the reference on the same systems: rank agreement over the
 * systems' mean scores, whether the leader is the same, whether each pre-registered comparison
 * reaches the same verdict, and the cost ratio.
 */
export function compareProtocols(reference, reduced) {
  const byId = (sm) => Object.fromEntries(sm.conditions.map((c) => [c.systemId, c.mean]))
  const ref = byId(reference.summary), red = byId(reduced.summary)
  const ids = Object.keys(ref).filter((id) => red[id] != null && ref[id] != null)
  const a = ids.map((id) => ref[id]), b = ids.map((id) => red[id])
  const verdicts = (reference.summary.comparisons || []).map((rc) => {
    const dc = (reduced.summary.comparisons || []).find((x) => x.a === rc.a && x.b === rc.b)
    return { a: rc.a, b: rc.b, referenceRejected: rc.rejected ?? null, reducedRejected: dc ? dc.rejected ?? null : null, referenceMeanDiff: rc.meanDiff ?? null, reducedMeanDiff: dc ? dc.meanDiff ?? null : null, agree: dc ? (rc.rejected ?? null) === (dc.rejected ?? null) : null }
  })
  const calls = (sm) => sm.usage.calls.generation + sm.usage.calls.judging
  const tokens = (sm) => sm.usage.dailftTokens || 0
  return {
    systems: ids.map((id, i) => ({ systemId: id, reference: a[i], reduced: b[i] })),
    kendallTau: ids.length >= 2 ? kendallTauB(a, b) : null,
    sameLeader: ids.length >= 2 ? sameLeader(a, b) : null,
    verdicts,
    verdictsAgree: verdicts.length ? verdicts.filter((v) => v.agree).length : null,
    cost: { referenceCalls: calls(reference.summary), reducedCalls: calls(reduced.summary), callRatio: calls(reduced.summary) ? calls(reference.summary) / calls(reduced.summary) : null, referenceDailftTokens: tokens(reference.summary), reducedDailftTokens: tokens(reduced.summary), tokenRatio: tokens(reduced.summary) ? tokens(reference.summary) / tokens(reduced.summary) : null },
  }
}

/** Section 8: the reference run, then the reduced run, on the same systems and tasks; events carry a `phase`. */
export async function runValidation(config, connection, onEvent = () => {}) {
  const wrap = (phase) => (evt) => onEvent({ ...evt, phase })
  const reference = await runProtocol(applyPreset(config, 'draco'), connection, wrap('reference'))
  const reduced = await runProtocol(applyPreset(config, 'reduced'), connection, wrap('reduced'))
  const comparison = compareProtocols(reference, reduced)
  onEvent({ type: 'validation', at: new Date().toISOString(), comparison })
  return { reference, reduced, comparison, summary: { ...reduced.summary, validation: comparison, reference: reference.summary } }
}
