/**
 * Tests for the published runner (app/lib/), against what the paper says it does.
 * Faults logged as DAI-307 on 27 October 2026, one describe block per fault.
 *
 * Nothing here calls a model or a provider. The runs use a scripted model passed in through
 * runProtocol's `deps.callModel`; the systems name a provider the router does not know, so a
 * call that slipped past the script would throw before any request; and fetch is disabled.
 * The modules are imported as namespaces so that a function still missing makes its own test
 * fail, not the whole file.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import * as P from '../app/lib/protocol.mjs'
import * as D from '../app/lib/draco-dataset.mjs'
import * as perm from '../src/permutation-test.mjs'

globalThis.fetch = async () => { throw new Error('network is disabled in tests/runner.test.mjs') }

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const near = (actual, expected, tolerance) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} (within ${tolerance}), got ${actual}`)
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A weighted rubric in the DRACO task set's form: two dimensions, one error criterion. With
 *  C1 and C3 met the score is (10 + 5) / 20 = 75; with C1, C3 and the error C4, (15 - 3) / 20 = 60. */
const WEIGHTED = {
  id: 'w1',
  title: 'weighted',
  context: '',
  question: 'Weighted question?',
  criteria: ['first', 'second', 'third', 'an error'],
  weights: [10, 5, 5, -3],
  dimensions: [{ id: 'd1', title: 'D1', from: 0, to: 2 }, { id: 'd2', title: 'D2', from: 2, to: 4 }],
}

const CONNECTION = { mode: 'direct', keys: {} }
const system = (id, settings = []) => ({ id, label: id.toUpperCase(), provider: 'scripted', modelId: `model-${id}`, settings })
const JUDGE = { id: 'j1', label: 'Judge', provider: 'scripted', modelId: 'judge-model' }

/** The answers a judging prompt shows, in the order shown. */
function answersIn(user) {
  const batched = [...user.matchAll(/ANSWER ([A-Z]):\n([\s\S]*?)(?=\n\nANSWER [A-Z]:\n|$)/g)].map((m) => m[2])
  if (batched.length) return { batched: true, texts: batched }
  const one = user.match(/ANSWER:\n([\s\S]*)$/)
  return { batched: false, texts: one ? [one[1]] : [] }
}

/**
 * A scripted model. Generation returns "answer of <system> at <setting> #<n>". A judging call
 * asks `verdicts(answerText, callIndex)` for each answer shown: an array of booleans (MET or
 * UNMET per criterion), or null for a refusal of that call. `delay(systemId)` slows generation.
 */
function scriptedModel({ verdicts = () => [true, false, true, false], delay = () => 0, refuse = () => false } = {}) {
  const seen = new Map()
  const calls = { generation: 0, judging: 0, judgingPrompts: [] }
  const fn = async ({ system: s, prompt, effort }) => {
    if (!prompt.system.startsWith('You are an expert grader')) {
      calls.generation++
      const n = (seen.get(s.id + effort) || 0) + 1
      seen.set(s.id + effort, n)
      const ms = delay(s.id)
      if (ms) await new Promise((r) => setTimeout(r, ms))
      return { text: `answer of ${s.id} at ${effort ?? 'default'} #${n}`, inputTokens: 1, outputTokens: 1 }
    }
    const index = calls.judging++
    calls.judgingPrompts.push(prompt.user)
    const { batched, texts } = answersIn(prompt.user)
    if (refuse(texts, index)) return { text: 'I am not able to grade these answers.', inputTokens: 1, outputTokens: 1 }
    const lines = []
    texts.forEach((t, pos) => {
      const v = verdicts(t, index)
      const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[pos]
      v.forEach((met, i) => lines.push(`${batched ? L + '-' : ''}C${i + 1}: ${met ? 'MET' : 'UNMET'}`))
      lines.push(batched ? `SCORE ${L}: ${Math.round((100 * v.filter(Boolean).length) / v.length)}` : `SCORE: ${Math.round((100 * v.filter(Boolean).length) / v.length)}`)
    })
    return { text: lines.join('\n'), inputTokens: 1, outputTokens: 1 }
  }
  return { fn, calls }
}

/** Score rows for summarise(): one per (system, setting, task, regeneration, judge, repeat). */
function row(systemId, settingIndex, taskId, score, { regeneration = 0, judgeId = 'j1', repeat = 0 } = {}) {
  return { taskId, settingIndex, regeneration, judgeId, repeat, systemId, position: 0, score }
}
const rawOf = (scores) => ({ scores, generations: [], errors: [] })

// ---------------------------------------------------------------------------
// Fault 1
// ---------------------------------------------------------------------------

describe('fault 1: on a weighted rubric, a judge answer that parses to nothing is missing, not 0', () => {
  test('a refusal gives no score', () => {
    const parsed = P.parseJudgeOutput('I am not able to grade this answer.', { batched: false, n: 4 })
    const scored = P.scoreJudgement(WEIGHTED, parsed.A, { scoring: 'weighted' })
    assert.equal(scored.score, null)
  })

  test('in a run, the refused repeat is left out of the median instead of pulling it to half', async () => {
    // Unbatched, K = 2: the first judging call that shows system A's answer refuses; the other
    // marks C1 and C3 met (75). The median of the scorings that exist is 75; with the refusal
    // scored as 0 it was (0 + 75) / 2 = 37.5.
    let refusedOnce = false
    const model = scriptedModel({
      refuse: (texts) => { if (!refusedOnce && texts[0].startsWith('answer of sa')) { refusedOnce = true; return true } return false },
    })
    const config = { systems: [system('sa'), system('sb')], judges: [JUDGE], tasks: [WEIGHTED], R: 1, K: 2, batched: false, concurrency: 1, comparisons: [] }
    const { raw, summary } = await P.runProtocol(config, CONNECTION, () => {}, { callModel: model.fn })
    assert.equal(refusedOnce, true)
    assert.equal(raw.scores.filter((s) => s.systemId === 'sa' && s.score == null).length, 1)
    assert.equal(summary.perTask['sa|0'].w1, 75)
    assert.equal(summary.perTask['sb|0'].w1, 75)
  })
})

// ---------------------------------------------------------------------------
// Fault 2
// ---------------------------------------------------------------------------

describe('fault 2: on a weighted rubric the score line is not a scoring; the verdicts are', () => {
  test('a batched score line with no verdict lines gives no score', () => {
    const parsed = P.parseJudgeOutput('SCORE A: 70\nSCORE B: 40', { batched: true, n: 4 })
    assert.equal(P.scoreJudgement(WEIGHTED, parsed.A).score, null)
    assert.equal(P.scoreJudgement(WEIGHTED, parsed.B).score, null)
  })

  test('verdict lines with no score line are scored from the verdicts', () => {
    const parsed = P.parseJudgeOutput('A-C1: MET\nA-C2: UNMET\nA-C3: MET\nA-C4: UNMET\nB-C1: MET\nB-C3: MET\nB-C4: MET', { batched: true, n: 4 })
    assert.equal(P.scoreJudgement(WEIGHTED, parsed.A).score, 75)
    assert.equal(P.scoreJudgement(WEIGHTED, parsed.B).score, 60)
  })

  test('with both, the verdicts decide on a weighted rubric and the score line on an unweighted one', () => {
    const text = 'A-C1: MET\nA-C2: UNMET\nA-C3: MET\nA-C4: UNMET\nSCORE A: 10'
    assert.equal(P.scoreJudgement(WEIGHTED, P.parseJudgeOutput(text, { batched: true, n: 4 }).A).score, 75)
    const plain = { ...WEIGHTED, weights: undefined, dimensions: undefined }
    assert.equal(P.scoreJudgement(plain, P.parseJudgeOutput(text, { batched: true, n: 4 }).A).score, 10)
    assert.equal(P.scoreJudgement(plain, P.parseJudgeOutput('SCORE A: 70', { batched: true, n: 4 }).A).score, 70)
  })
})

// ---------------------------------------------------------------------------
// Fault 3
// ---------------------------------------------------------------------------

describe('fault 3: an answer whose every scoring is missing does not fail the summary', () => {
  test('the task has no score for that system and is left out of the comparison', () => {
    const config = { systems: [system('sa'), system('sb')], comparisons: [['sa', 'sb']] }
    const scores = []
    for (const [t, a, b] of [['t1', 70, 60], ['t2', 72, null], ['t3', 75, 61], ['t4', 71, 62]]) {
      for (const repeat of [0, 1]) {
        scores.push(row('sa', 0, t, a, { repeat }), row('sb', 0, t, b, { repeat }))
      }
    }
    let summary
    assert.doesNotThrow(() => { summary = P.summarise(config, rawOf(scores)) })
    assert.equal(summary.perTask['sb|0'].t2, null)
    assert.equal(summary.comparisons[0].n, 3)
    near(summary.comparisons[0].meanDiff, mean([10, 14, 9]), 1e-12)
    assert.equal(summary.conditions.find((c) => c.systemId === 'sb').n, 3)
  })
})

// ---------------------------------------------------------------------------
// Fault 4
// ---------------------------------------------------------------------------

describe('fault 4: a comparison that could not be tested stays in Holm\'s family', () => {
  test('three named comparisons, one untested: the thresholds are a/3 and a/2, not a/2 and a', () => {
    // Exact one-sided p: system A, differences 1..10, p = 1/1024; system B, differences
    // 6, 5, 4, 3, -2, 7, 1, -1, -3, 2, p = 47/1024 = 0.0459. System C has two tasks only.
    // With C counted (m = 3) B's threshold is 0.05/2 = 0.025 and B is not rejected; dropping C
    // (m = 2) gave B the threshold 0.05 and a rejection.
    const dA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const dB = [6, 5, 4, 3, -2, 7, 1, -1, -3, 2]
    const scores = []
    dA.forEach((d, i) => {
      const t = `t${i + 1}`
      scores.push(row('base', 0, t, 50), row('sa', 0, t, 50 + d), row('sb', 0, t, 50 + dB[i]))
      if (i < 2) scores.push(row('sc', 0, t, 55))
    })
    const config = { systems: [system('base'), system('sa'), system('sb'), system('sc')], comparisons: [['sa', 'base'], ['sb', 'base'], ['sc', 'base']] }
    const [a, b, c] = P.summarise(config, rawOf(scores), { alpha: 0.05 }).comparisons
    assert.equal(a.p, 1 / 1024)
    assert.equal(b.p, 47 / 1024)
    assert.match(c.error, /fewer than 3 paired tasks/)
    near(a.holmAlpha, 0.05 / 3, 1e-15)
    near(b.holmAlpha, 0.05 / 2, 1e-15)
    assert.equal(a.rejected, true)
    assert.equal(b.rejected, false)
    assert.equal(c.rejected, null)
    assert.equal(a.family, 3)
  })
})

// ---------------------------------------------------------------------------
// Faults 5 and 6
// ---------------------------------------------------------------------------

/** System A swept at two settings, configured in the order high, low; its low-setting rows are
 *  stored first. High scores 80 + i, low 40 + i, B 60 + (i mod 2), on five tasks. */
function sweptFixture() {
  const scores = []
  for (let i = 0; i < 5; i++) scores.push(row('sa', 1, `t${i + 1}`, 40 + i))
  for (let i = 0; i < 5; i++) scores.push(row('sa', 0, `t${i + 1}`, 80 + i))
  for (let i = 0; i < 5; i++) scores.push(row('sb', 0, `t${i + 1}`, 60 + (i % 2)))
  const high = [0, 1, 2, 3, 4].map((i) => 80 + i - (60 + (i % 2)))
  const low = [0, 1, 2, 3, 4].map((i) => 40 + i - (60 + (i % 2)))
  return { scores, high, low }
}

describe('fault 5: a comparison is made at a named setting of each system', () => {
  test('by default each side is at its system\'s first configured setting, whatever was stored first', () => {
    const { scores, high } = sweptFixture()
    const config = { systems: [system('sa', ['high', 'low']), system('sb')], comparisons: [['sa', 'sb']] }
    const [c] = P.summarise(config, rawOf(scores)).comparisons
    near(c.meanDiff, mean(high), 1e-12)
    assert.equal(c.aSetting, 'high')
    assert.equal(c.bSetting, null)
  })

  test('a comparison can name the setting of each side', () => {
    const { scores, low } = sweptFixture()
    const config = { systems: [system('sa', ['high', 'low']), system('sb')], comparisons: [[{ systemId: 'sa', setting: 'low' }, { systemId: 'sb', setting: null }]] }
    const [c] = P.summarise(config, rawOf(scores)).comparisons
    assert.equal(c.error, undefined)
    near(c.meanDiff, mean(low), 1e-12)
    assert.equal(c.a, 'sa')
    assert.equal(c.aSetting, 'low')
  })

  test('a system can carry the setting it is compared at, and a setting that was not run is an error, not a substitute', () => {
    const { scores, low } = sweptFixture()
    const config = { systems: [{ ...system('sa', ['high', 'low']), compareSetting: 'low' }, system('sb')], comparisons: [['sa', 'sb'], [{ systemId: 'sa', setting: 'max' }, 'sb']] }
    const [c, missing] = P.summarise(config, rawOf(scores)).comparisons
    near(c.meanDiff, mean(low), 1e-12)
    assert.equal(c.aSetting, 'low')
    assert.ok(missing.error)
    assert.equal(missing.rejected, null)
  })
})

describe('fault 6: validation compares each system at one named setting, not at its lowest-scoring one', () => {
  test('compareProtocols reports system A at its first configured setting (80 and up), not at low (40 and up)', () => {
    const { scores } = sweptFixture()
    const config = { systems: [system('sa', ['high', 'low']), system('sb')], comparisons: [['sa', 'sb']] }
    const summary = P.summarise(config, rawOf(scores))
    const result = P.compareProtocols({ summary }, { summary })
    const a = result.systems.find((s) => s.systemId === 'sa')
    near(a.reference, 82, 1e-12)
    near(a.reduced, 82, 1e-12)
    assert.equal(result.sameLeader, true)
    assert.equal(result.verdicts[0].agree, true)
  })
})

// ---------------------------------------------------------------------------
// Fault 7
// ---------------------------------------------------------------------------

describe('fault 7: the validation reference is the complete protocol of Section 8, Phase 1', () => {
  const config = { systems: [system('sa', ['low', 'high']), system('sb')], judges: [JUDGE], tasks: [WEIGHTED], R: 1, K: 1, batched: true, concurrency: 4, comparisons: [['sa', 'sb']], reference: { R: 2, K: 2 } }

  test('every configured setting, the R and K given for the reference, unbatched, and the reduced run\'s aggregation rule', () => {
    const ref = P.applyPreset(config, 'reference')
    const red = P.applyPreset(config, 'reduced')
    assert.deepEqual(ref.systems[0].settings, ['low', 'high'])
    assert.equal(ref.R, 2)
    assert.equal(ref.K, 2)
    assert.equal(ref.batched, false)
    assert.equal(ref.aggregation, red.aggregation)
    assert.equal(red.aggregation, 'median')
    // An older configuration without a reference block: the reference takes the run's R and K.
    const old = P.applyPreset({ ...config, reference: undefined, R: 3, K: 4 }, 'reference')
    assert.equal(old.R, 3)
    assert.equal(old.K, 4)
  })

  test('runValidation runs that reference: both settings, both regenerations, one answer per judging call', async () => {
    const model = scriptedModel()
    const out = await P.runValidation(config, CONNECTION, () => {}, { callModel: model.fn })
    const gens = out.reference.raw.generations
    assert.deepEqual([...new Set(gens.filter((g) => g.systemId === 'sa').map((g) => g.setting))].sort(), ['high', 'low'])
    assert.deepEqual([...new Set(gens.map((g) => g.regeneration))].sort(), [0, 1])
    assert.ok(out.reference.raw.scores.every((s) => s.position === 0))
    assert.deepEqual([...new Set(out.reference.raw.scores.map((s) => s.repeat))].sort(), [0, 1])
    assert.equal(out.reference.summary.aggregation, 'median')
    assert.equal(out.reduced.summary.aggregation, 'median')
  })

  test('DRACO as published stays available as a named preset, and is not called the reference', () => {
    assert.equal(P.PROTOCOL_PRESETS.draco.label, 'DRACO as published')
    const draco = P.applyPreset(config, 'draco')
    assert.equal(draco.R, 1)
    assert.equal(draco.K, 5)
    assert.equal(draco.batched, false)
    assert.doesNotMatch(P.PROTOCOL_PRESETS.validate.description, /published protocol once as the reference/)
    assert.doesNotMatch(P.PROTOCOL_PRESETS.draco.description, /The reference protocol/)
  })
})

// ---------------------------------------------------------------------------
// Fault 8
// ---------------------------------------------------------------------------

describe('fault 8: a stratified sample has exactly the number of tasks asked for', () => {
  const all = D.loadDracoTasks()
  const domains = (tasks) => tasks.map((t) => t.domain)

  test('fewer tasks than domains: exactly n, from n different domains', () => {
    for (const n of [1, 3, 5, 8, 9]) {
      const s = D.stratifiedSample(all, n, 1)
      assert.equal(s.length, n, `n = ${n}`)
      assert.equal(new Set(domains(s)).size, n, `n = ${n}`)
    }
  })

  test('at least as many tasks as domains: exactly n, every domain present, proportional', () => {
    const ten = D.stratifiedSample(all, 10, 1)
    assert.equal(ten.length, 10)
    assert.equal(new Set(domains(ten)).size, 10)
    const sixty = D.stratifiedSample(all, 60, 1)
    const counts = {}
    for (const d of domains(sixty)) counts[d] = (counts[d] || 0) + 1
    assert.deepEqual(Object.values(counts).sort((a, b) => b - a), [11, 10, 7, 6, 5, 5, 4, 4, 4, 4])
    for (const n of [11, 20, 37, 99]) assert.equal(D.stratifiedSample(all, n, 1).length, n)
  })

  test('the draw is fixed by its seed', () => {
    const ids = (s) => s.map((t) => t.id).join(',')
    assert.equal(ids(D.stratifiedSample(all, 5, 1)), ids(D.stratifiedSample(all, 5, 1)))
    assert.notEqual(ids(D.stratifiedSample(all, 5, 1)), ids(D.stratifiedSample(all, 5, 2)))
  })
})

// ---------------------------------------------------------------------------
// Fault 9
// ---------------------------------------------------------------------------

describe('fault 9: every repeat shows the answers in a seeded random order', () => {
  const isPermutation = (o, n) => o.length === n && [...o].sort((a, b) => a - b).every((v, i) => v === i)

  test('at K = 1 the order differs from batch to batch, so it is not generation order', () => {
    const orders = Array.from({ length: 40 }, (_, b) => P.orderForRepeat(3, 0, 1, `task-${b}|0|0|j1`))
    for (const o of orders) assert.ok(isPermutation(o, 3))
    assert.ok(new Set(orders.map((o) => o.join(''))).size > 1)
    // Each answer comes first in some batch.
    assert.deepEqual([...new Set(orders.map((o) => o[0]))].sort(), [0, 1, 2])
  })

  test('each block of C repeats puts each answer in each position once', () => {
    for (const n of [2, 3, 5]) {
      for (const block of [0, 1]) {
        const seen = Array.from({ length: n }, () => new Set())
        for (let k = block * n; k < (block + 1) * n; k++) {
          const o = P.orderForRepeat(n, k, 1, 'batch')
          assert.ok(isPermutation(o, n))
          o.forEach((answer, pos) => seen[pos].add(answer))
        }
        for (const s of seen) assert.equal(s.size, n, `n = ${n}, block ${block}`)
      }
    }
  })

  test('the same seed and batch give the same order; another seed gives other orders', () => {
    const keys = Array.from({ length: 20 }, (_, b) => `batch-${b}`)
    const draw = (seed) => keys.map((key) => P.orderForRepeat(4, 0, seed, key).join('')).join(' ')
    assert.equal(draw(1), draw(1))
    assert.notEqual(draw(1), draw(2))
  })

  test('a run keeps the order shown with each scoring, and the order does not depend on which generation finished first', async () => {
    const tasks = [WEIGHTED, { ...WEIGHTED, id: 'w2' }, { ...WEIGHTED, id: 'w3' }]
    const config = { systems: [system('sa'), system('sb'), system('sc')], judges: [JUDGE], tasks, R: 1, K: 2, batched: true, concurrency: 3, comparisons: [] }
    const shape = (raw) => raw.scores.map((s) => `${s.taskId}|${s.repeat}|${s.systemId}|${s.position}|${(s.shownOrder || []).join(',')}`).sort()
    const slowA = await P.runProtocol(config, CONNECTION, () => {}, { callModel: scriptedModel({ delay: (id) => (id === 'sa' ? 15 : 0) }).fn })
    const slowC = await P.runProtocol(config, CONNECTION, () => {}, { callModel: scriptedModel({ delay: (id) => (id === 'sc' ? 15 : 0) }).fn })
    for (const s of slowA.raw.scores) {
      assert.ok(Array.isArray(s.shownOrder) && s.shownOrder.length === 3)
      assert.equal(s.shownOrder[s.position], s.systemId)
    }
    assert.deepEqual(shape(slowA.raw), shape(slowC.raw))
  })
})

// ---------------------------------------------------------------------------
// Fault 10
// ---------------------------------------------------------------------------

describe('fault 10: README.txt and the app say how the starter tasks are scored', () => {
  test('the code takes the judge\'s score line on an unweighted rubric, and the text says so', () => {
    const parsed = P.parseJudgeOutput('C1: MET\nC2: UNMET\nSCORE: 75', { batched: false, n: 2 })
    assert.equal(P.scoreJudgement({ id: 's', criteria: ['a', 'b'] }, parsed.A).score, 75)
    const readme = fs.readFileSync(path.join(ROOT, 'README.txt'), 'utf8')
    assert.doesNotMatch(readme, /Scores\s+are\s+the\s+percentage\s+of\s+criteria\s+MET/)
    assert.match(readme, /score\s+line/)
    const page = fs.readFileSync(path.join(ROOT, 'app', 'public', 'index.html'), 'utf8')
    assert.doesNotMatch(page, /the score is the percentage MET/)
  })
})

// ---------------------------------------------------------------------------
// Fault 11
// ---------------------------------------------------------------------------

/** Two-sided sign-flip p-value by plain enumeration of every sign pattern, written separately
 *  from src/ so the interval below is checked against an independent computation. */
function bruteTwoSided(values) {
  const n = values.length
  const abs = values.map(Math.abs)
  const obs = mean(values)
  let ge = 0, le = 0
  for (let mask = 0; mask < 2 ** n; mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) sum += (mask >> i) & 1 ? -abs[i] : abs[i]
    if (sum / n >= obs - 1e-12) ge++
    if (sum / n <= obs + 1e-12) le++
  }
  return Math.min(1, (2 * Math.min(ge, le)) / 2 ** n)
}

describe('fault 11: add-one p-value, the interval from the inverted test, and every verdict kept', () => {
  test('the runner\'s sampled p-value counts the observed pattern, so it is never zero', () => {
    const scores = []
    for (let i = 0; i < 25; i++) scores.push(row('sa', 0, `t${i}`, 51 + i), row('base', 0, `t${i}`, 50))
    const config = { systems: [system('sa'), system('base')], comparisons: [['sa', 'base']] }
    const summary = P.summarise(config, rawOf(scores))
    const [c] = summary.comparisons
    assert.equal(c.exact, false)
    assert.equal(c.p, 1 / 100001)
    assert.ok(summary.exploratory[0].pTwoSided > 0)
  })

  test('signFlipConfidenceInterval holds exactly the shifts the two-sided test does not reject', () => {
    const d = [3, -1, 4, 1, -5, 9, 2, -6, 5, 3]
    const ci = perm.signFlipConfidenceInterval(d, { alpha: 0.05 })
    assert.equal(ci.level, 0.95)
    assert.ok(ci.lower < mean(d) && mean(d) < ci.upper)
    const p = (delta) => bruteTwoSided(d.map((x) => x - delta))
    assert.ok(p(ci.lower) > 0.05, `p at the lower bound ${p(ci.lower)}`)
    assert.ok(p(ci.lower - 1e-3) <= 0.05, `p below the lower bound ${p(ci.lower - 1e-3)}`)
    assert.ok(p(ci.upper) > 0.05, `p at the upper bound ${p(ci.upper)}`)
    assert.ok(p(ci.upper + 1e-3) <= 0.05, `p above the upper bound ${p(ci.upper + 1e-3)}`)
    // Its two-sided p agrees with the published one-sided test run both ways (exact branch).
    const x = d.map((v) => v - 1)
    const both = Math.min(1, 2 * Math.min(perm.pairedPermutationTest(x).pValueOneSided, perm.pairedPermutationTest(x.map((v) => -v)).pValueOneSided))
    assert.equal(perm.signFlipTwoSidedP(x), both)
  })

  test('with too few tasks for the test ever to reject, the interval is unbounded', () => {
    // Four tasks: the smallest two-sided p is 2/16 = 0.125, above 0.05.
    const ci = perm.signFlipConfidenceInterval([2, 3, 5, 8], { alpha: 0.05 })
    assert.equal(ci.lower, -Infinity)
    assert.equal(ci.upper, Infinity)
  })

  test('the runner reports the interval with each pre-registered comparison', () => {
    const d = [3, -1, 4, 1, -5, 9, 2, -6, 5, 3]
    const scores = []
    d.forEach((x, i) => scores.push(row('sa', 0, `t${i}`, 50 + x), row('base', 0, `t${i}`, 50)))
    const config = { systems: [system('sa'), system('base')], comparisons: [['sa', 'base']] }
    const [c] = P.summarise(config, rawOf(scores), { alpha: 0.05 }).comparisons
    assert.ok(Array.isArray(c.ci), `the comparison carries no interval: ${JSON.stringify(c)}`)
    assert.equal(c.ciLevel, 0.95)
    const ci = perm.signFlipConfidenceInterval(d, { alpha: 0.05 })
    assert.deepEqual(c.ci, [ci.lower, ci.upper])
  })

  test('parseJudgeOutput keeps the verdict on each criterion', () => {
    assert.deepEqual(P.parseJudgeOutput('C1: MET\nC3: UNMET\nSCORE: 50', { batched: false, n: 4 }).A.verdicts, ['MET', null, 'UNMET', null])
    const batched = P.parseJudgeOutput('A-C2: MET\nB-C1: UNMET\nSCORE A: 25\nSCORE B: 0', { batched: true, n: 3 })
    assert.deepEqual(batched.A.verdicts, [null, 'MET', null])
    assert.deepEqual(batched.B.verdicts, ['UNMET', null, null])
  })

  test('every retained scoring carries the verdicts, and the CSV keeps them', async () => {
    const config = { systems: [system('sa'), system('sb')], judges: [JUDGE], tasks: [WEIGHTED], R: 1, K: 1, batched: true, concurrency: 2, comparisons: [] }
    const { raw } = await P.runProtocol(config, CONNECTION, () => {}, { callModel: scriptedModel().fn })
    assert.equal(raw.scores.length, 2)
    for (const s of raw.scores) assert.deepEqual(s.verdicts, ['MET', 'UNMET', 'MET', 'UNMET'])
    const [head, first] = P.scoresCsv(raw).split('\n')
    const cols = head.split(',')
    assert.ok(cols.includes('verdicts'))
    assert.ok(cols.includes('shownOrder'))
    assert.equal(first.split(',')[cols.indexOf('verdicts')], 'MUMU')
  })
})
