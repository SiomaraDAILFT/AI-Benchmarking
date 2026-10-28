/**
 * Reproduces, from src/cost-model.mjs, the cost-model figures paper/main.tex
 * prints: Table tab:cumulative and every figure around it (Appendix B), the
 * overstatement ranges of Section 6, Appendix C.2's ranges at the measured
 * setting-cost ratios, and the call counts of Appendix B. The measured ratios
 * are not typed in: they are computed from the 25 calls of Table tab:e1-calls
 * and checked against Table tab:alpha first. Each assertion quotes
 * the sentence it checks. Where the paper prints a whole number the test rounds
 * to a whole number; where it prints decimals, to the same decimals.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import {
  generationCost,
  judgingCallPrices,
  judgingCostUnbatched,
  judgingCostBatched,
  batchingSaving,
  judgingCostCached,
  judgingCostCachedOncePerTaskAndJudge,
  totalCost,
  callCounts,
  s1GenerationFactor,
  s1GenerationFactorFromCosts,
  s1JudgingFactor,
  s2Factor,
  s3Factor,
  rho,
  s4Beta,
  s4BetaCeiling,
  s5Saving,
  s5SavingFraction,
  s6Factor,
  factorFG,
  factorFJ,
  componentFactors,
  judgingShare,
  combinedReduction,
  combinedReductionFromTotals,
  naiveProduct,
  naiveOverstatement,
} from '../src/cost-model.mjs'
import { cumulativeReductionFactor } from '../src/simplifications.mjs'

// ---------------------------------------------------------------------------
// Helpers and the worked instance
// ---------------------------------------------------------------------------

const whole = (x) => Math.round(x)
const decimals = (x, d) => Math.round(x * 10 ** d) / 10 ** d
const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} (within ${tolerance}), got ${actual}`)
const rangeOf = (values) => [Math.min(...values), Math.max(...values)]

// Appendix B, "The combined reduction": "Take alpha = 20 with the cheap setting
// kept (S1), R = 3, K = 5, E = 2, C = 5, rho = 0.2, and a full task count
// T_full = 180 reduced to an assumed floor n* = 60." J = 3 from "Call counts".
const W = { alpha: 20, R: 3, K: 5, E: 2, C: 5, J: 3, rho: 0.2, Tfull: 180, nStar: 60 }

// Table tab:cumulative's judging shares.
const SHARES = [0.1, 0.3, 0.5]

// Appendix B, "Prompt-caching terms": "the representative values are c = 0.1 and
// w = 1 (Google) or w = 1.25 (OpenAI, Anthropic)".
const BETA_UNCACHED = s4Beta({ C: W.C, rho: W.rho })
const BETA_CACHED_W1 = s4Beta({ C: W.C, rho: W.rho, c: 0.1, w: 1 })
const BETA_CACHED_W125 = s4Beta({ C: W.C, rho: W.rho, c: 0.1, w: 1.25 })
// Appendix B, "The batching factor beta": at OpenAI, where caching is automatic,
// the batched call writes its prefix too.
const BETA_CACHED_W125_OPENAI = s4Beta({ C: W.C, rho: W.rho, c: 0.1, w: 1.25, batchedWrite: true })
const ALL_BETAS = [BETA_UNCACHED, BETA_CACHED_W1, BETA_CACHED_W125]
// Every caching case Appendix B.5 evaluates, OpenAI's included.
const EVERY_BETA = [...ALL_BETAS, BETA_CACHED_W125_OPENAI]

const FG_WORKED = factorFG({ alpha: W.alpha, kept: 'cheap', R: W.R, Tfull: W.Tfull, nStar: W.nStar })
const fj = (beta, nStar = W.nStar) => factorFJ({ E: W.E, R: W.R, K: W.K, beta, Tfull: W.Tfull, nStar })

// Section 6: where the overstatement (1 - s) E K beta + s (1 + alpha) of the
// worked instance (E = 2, K = 5) equals 10, solved for s.
const overstatementCrossing = (beta, alpha) => (2 * 5 * beta - 10) / (2 * 5 * beta - (1 + alpha))

// Appendix C, Table tab:e1-calls: every successful call of experiment E1, as
// [model, effort, prompt, input tokens, output tokens, reasoning tokens]
// ("Reasoning is included in Out for both providers").
const E1_CALLS = [
  ['claude-opus-5', 'high', 1, 191, 5704, 1717],
  ['claude-opus-5', 'high', 2, 199, 6641, 2967],
  ['claude-opus-5', 'high', 3, 184, 6702, 3093],
  ['claude-opus-5', 'high', 4, 183, 6071, 2036],
  ['claude-opus-5', 'high', 5, 180, 6298, 2395],
  ['claude-opus-5', 'low', 1, 191, 3370, 326],
  ['claude-opus-5', 'low', 2, 199, 3543, 263],
  ['claude-opus-5', 'low', 3, 184, 3358, 320],
  ['claude-opus-5', 'low', 4, 183, 3413, 446],
  ['claude-opus-5', 'low', 5, 180, 4262, 914],
  ['gpt-5.6-sol', 'high', 1, 129, 2464, 1536],
  ['gpt-5.6-sol', 'high', 2, 133, 4062, 3072],
  ['gpt-5.6-sol', 'high', 3, 125, 2251, 1024],
  ['gpt-5.6-sol', 'high', 4, 128, 5203, 4068],
  ['gpt-5.6-sol', 'high', 5, 125, 4306, 2920],
  ['gpt-5.6-sol', 'low', 1, 129, 1343, 341],
  ['gpt-5.6-sol', 'low', 2, 133, 1166, 139],
  ['gpt-5.6-sol', 'low', 3, 125, 1485, 352],
  ['gpt-5.6-sol', 'low', 4, 128, 1303, 325],
  ['gpt-5.6-sol', 'low', 5, 125, 1164, 100],
  ['gpt-5.6-sol', 'none', 1, 129, 1105, 0],
  ['gpt-5.6-sol', 'none', 2, 133, 1080, 0],
  ['gpt-5.6-sol', 'none', 3, 125, 1105, 0],
  ['gpt-5.6-sol', 'none', 4, 128, 1225, 0],
  ['gpt-5.6-sol', 'none', 5, 125, 1234, 0],
]
const [IN, OUT] = [3, 4]
// Appendix C, "Models and interfaces": "$5 input and $30 output per million
// tokens for the first; $5 and $25 for the second".
const E1_PRICE_PER_M = { 'gpt-5.6-sol': { input: 5, output: 30 }, 'claude-opus-5': { input: 5, output: 25 } }
const e1Calls = (model, effort) => E1_CALLS.filter((row) => row[0] === model && row[1] === effort)
const e1Sum = (model, effort, field) => e1Calls(model, effort).reduce((total, row) => total + row[field], 0)
// "Cost is input tokens times the input price plus output tokens times the output price", in dollars.
const e1Cost = (model, effort) =>
  (e1Sum(model, effort, IN) * E1_PRICE_PER_M[model].input + e1Sum(model, effort, OUT) * E1_PRICE_PER_M[model].output) / 1e6
// "the ratio of the sums of output tokens over the five prompts (pooled ratio) ...
// The cost ratio is computed the same way".
const pooledByTokens = ([model, high, low]) => e1Sum(model, high, OUT) / e1Sum(model, low, OUT)
const pooledByCost = ([model, high, low]) => e1Cost(model, high) / e1Cost(model, low)
const perPromptByTokens = ([model, high, low]) =>
  e1Calls(model, high).map((row) => row[OUT] / e1Calls(model, low).find((other) => other[2] === row[2])[OUT])

// The rows of Table tab:alpha, and the three that compare the high setting with a lower one.
const FIRST_HIGH_LOW = ['gpt-5.6-sol', 'high', 'low']
const FIRST_HIGH_NONE = ['gpt-5.6-sol', 'high', 'none']
const FIRST_LOW_NONE = ['gpt-5.6-sol', 'low', 'none']
const SECOND_HIGH_LOW = ['claude-opus-5', 'high', 'low']
const HIGH_AGAINST_LOWER = [FIRST_HIGH_LOW, FIRST_HIGH_NONE, SECOND_HIGH_LOW]

// Section 6 and Appendix C.2: the measured setting-cost ratios of the high
// setting against a lower one, "1.74 to 3.14, or 1.75 to 3.18 by output tokens",
// derived from the calls, not typed in.
const ALPHA_BY_COST = rangeOf(HIGH_AGAINST_LOWER.map(pooledByCost))
const ALPHA_BY_TOKENS = rangeOf(HIGH_AGAINST_LOWER.map(pooledByTokens))
const MEASURED_ALPHAS = [...ALPHA_BY_COST, ...ALPHA_BY_TOKENS]

// ---------------------------------------------------------------------------
// Section 4: the cost model
// ---------------------------------------------------------------------------

describe('Section 4: a general cost model', () => {
  test('Equations generation, judging-unbatched, judging-batched and total multiply as written', () => {
    const p = { C: 4, E: 2, R: 3, T: 10, J: 2, K: 5 }
    // Equation generation: G = C * E * R * T * g.
    assert.equal(generationCost({ ...p, g: 0.5 }), 4 * 2 * 3 * 10 * 0.5)
    // Equation judging-unbatched: J_u = C * E * R * T * J * K * j.
    assert.equal(judgingCostUnbatched({ ...p, j: 0.25 }), 4 * 2 * 3 * 10 * 2 * 5 * 0.25)
    // Equation judging-batched: J_b = E * R * T * J * K * j'.
    assert.equal(judgingCostBatched({ ...p, jPrime: 1.5 }), 2 * 3 * 10 * 2 * 5 * 1.5)
    // Equation total: "Total = G + J_b = E * R * T * (C * g + J * K * j')".
    assert.equal(
      totalCost({ ...p, g: 0.5, jPrime: 1.5 }),
      generationCost({ ...p, g: 0.5 }) + judgingCostBatched({ ...p, jPrime: 1.5 }),
    )
  })

  test('Equation batch-saving: J_u - J_b = E R T J K (C - 1) j_fixed, with j\' = j_fixed + C j_marginal', () => {
    const p = { C: 5, E: 2, R: 3, T: 60, J: 3, K: 5 }
    const { j, jPrime } = judgingCallPrices({ C: p.C, jFixed: 1, jMarginal: 0.2 })
    near(judgingCostUnbatched({ ...p, j }) - judgingCostBatched({ ...p, jPrime }), batchingSaving({ ...p, jFixed: 1 }))
  })

  test('Equation judging-cached "reduces to Equation judging-unbatched at c = w = 1"', () => {
    const p = { C: 5, E: 2, R: 3, T: 60, J: 3, K: 5 }
    const { j } = judgingCallPrices({ C: p.C, jFixed: 1, jMarginal: 0.2 })
    near(judgingCostCached({ ...p, jFixed: 1, jMarginal: 0.2, c: 1, w: 1 }), judgingCostUnbatched({ ...p, j }))
  })

  test('Appendix B call counts: "1,800 generation calls ... 27,000 unbatched judging calls ... 5,400 batched judging calls"', () => {
    // "For C = 5 systems, T = 60 tasks, E = 2 settings, R = 3 regenerations, J = 3
    // judges and K = 5 repeats, Equation generation implies C E R T = 1,800
    // generation calls, Equation judging-unbatched implies 27,000 unbatched judging
    // calls, and Equation judging-batched implies 5,400 batched judging calls".
    const counts = callCounts({ C: 5, T: 60, E: 2, R: 3, J: 3, K: 5 })
    assert.equal(counts.generation, 1800)
    assert.equal(counts.judgingUnbatched, 27000)
    assert.equal(counts.judgingBatched, 5400)
    // The same counts from the cost equations at a price of 1 per call.
    assert.equal(generationCost({ C: 5, E: 2, R: 3, T: 60, g: 1 }), 1800)
    assert.equal(judgingCostUnbatched({ C: 5, E: 2, R: 3, T: 60, J: 3, K: 5, j: 1 }), 27000)
    assert.equal(judgingCostBatched({ E: 2, R: 3, T: 60, J: 3, K: 5, jPrime: 1 }), 5400)
  })
})

// ---------------------------------------------------------------------------
// Section 5: the simplifications one at a time
// ---------------------------------------------------------------------------

describe('Section 5, S1: the setting-cost ratio', () => {
  test('Equation s1: (1 + alpha) with the cheap setting kept, (1 + alpha)/alpha with the expensive one', () => {
    assert.equal(s1GenerationFactor(20, 'cheap'), 21)
    near(s1GenerationFactor(20, 'expensive'), 1.05, 1e-15)
    // Equation s1's general form, sum of g_e over g_min, at E = 2 with costs g and alpha g.
    near(s1GenerationFactorFromCosts([1, 20], 'cheap'), 21, 1e-12)
    near(s1GenerationFactorFromCosts([1, 20], 'expensive'), 1.05, 1e-12)
    // S1's judging-side factor is E.
    assert.equal(s1JudgingFactor(2), 2)
  })

  test('"If the two settings cost the same (alpha = 1), either choice saves the trivial factor of 2"', () => {
    assert.equal(s1GenerationFactor(1, 'cheap'), 2)
    assert.equal(s1GenerationFactor(1, 'expensive'), 2)
  })

  test('"the generation-side factor is (1+alpha)/alpha, which tends to 1 as alpha grows"', () => {
    near(s1GenerationFactor(1e9, 'expensive'), 1, 1e-8)
    assert.ok(s1GenerationFactor(100, 'expensive') < s1GenerationFactor(10, 'expensive'))
  })

  test('S2 saves a factor of R, S3 a factor of K', () => {
    assert.equal(s2Factor(3), 3)
    assert.equal(s3Factor(5), 5)
  })
})

describe('Section 5, S4 and Appendix B: the batching factor beta', () => {
  test('Appendix B: "Equation s4 gives beta = 3.0 without caching (c = w = 1). With c = 0.1 and w = 1 it gives beta = 1.2 ... with w = 1.25, beta = 1.325"', () => {
    assert.equal(decimals(BETA_UNCACHED, 1), 3.0)
    assert.equal(decimals(BETA_CACHED_W1, 1), 1.2)
    assert.equal(decimals(BETA_CACHED_W125, 3), 1.325)
  })

  test('Appendix B: "the ceiling 1 + (C-1) c is 1.4"; Section 5: "1.4 at C = 5 and c = 0.1, against 5 without caching"', () => {
    near(s4BetaCeiling({ C: 5, c: 0.1 }), 1.4, 1e-12)
    assert.equal(s4BetaCeiling({ C: 5 }), 5)
    // The ceiling is the rho -> 0 limit of Equation s4, and "grows by only c for each system added".
    near(s4Beta({ C: 5, rho: 0, c: 0.1 }), 1.4, 1e-12)
    assert.equal(s4Beta({ C: 5, rho: 0 }), 5)
    near(s4BetaCeiling({ C: 6, c: 0.1 }) - s4BetaCeiling({ C: 5, c: 0.1 }), 0.1, 1e-12)
  })

  test('Section 5: without caching beta is C(1+rho)/(1+C rho), which "approaches 1 as rho -> infinity"', () => {
    near(BETA_UNCACHED, (5 * 1.2) / (1 + 5 * 0.2), 1e-12)
    near(s4Beta({ C: 5, rho: 1e9 }), 1, 1e-8)
    near(s4Beta({ C: 5, rho: 1e9, c: 0.1, w: 1.25 }), 1, 1e-8)
  })

  test('Equation s4 is the ratio J_u^cached / J_b of Equations judging-cached and judging-batched', () => {
    const p = { C: 5, E: 2, R: 3, T: 60, J: 3, K: 5 }
    const { jPrime } = judgingCallPrices({ C: 5, jFixed: 1, jMarginal: 0.2 })
    for (const [c, w] of [[1, 1], [0.1, 1], [0.1, 1.25]]) {
      near(
        judgingCostCached({ ...p, jFixed: 1, jMarginal: 0.2, c, w }) / judgingCostBatched({ ...p, jPrime }),
        s4Beta({ C: 5, rho: rho({ jFixed: 1, jMarginal: 0.2 }), c, w }),
        1e-12,
      )
    }
  })


  test('Appendix C.1 (E2): "rho is between about 1.4 and 1.7" from 1,005 fixed tokens, 90 to 100 marginal input tokens and 220 to 270 output tokens at six times the input rate', () => {
    // "about 1,005 fixed tokens and about 90 to 100 marginal input tokens per
    // additional short answer ... about 220 to 270 output tokens of verdicts,
    // priced at six times the input rate ($30 against $5 per million)".
    const low = rho({ jFixed: 1005 * 5, jMarginal: 90 * 5 + 220 * 30 })
    const high = rho({ jFixed: 1005 * 5, jMarginal: 100 * 5 + 270 * 30 })
    assert.equal(decimals(low, 1), 1.4)
    assert.equal(decimals(high, 1), 1.7)
  })

  test('Appendix C.1 (E2): "At C = 5, a rho of 1.4 to 1.7 gives a batching factor beta of about 1.4 to 1.5 without caching and 1.04 to 1.08 with it"', () => {
    const [uLow, uHigh] = rangeOf([1.4, 1.7].map((r) => s4Beta({ C: 5, rho: r })))
    assert.equal(decimals(uLow, 1), 1.4)
    assert.equal(decimals(uHigh, 1), 1.5)
    // "with it": c = 0.1 at either write multiple of Appendix B (w = 1 or 1.25),
    // and with the batched call paying the write too, as at OpenAI.
    const cached = [1.4, 1.7].flatMap((r) => [
      ...[1, 1.25].map((w) => s4Beta({ C: 5, rho: r, c: 0.1, w })),
      s4Beta({ C: 5, rho: r, c: 0.1, w: 1.25, batchedWrite: true }),
    ])
    const [cLow, cHigh] = rangeOf(cached)
    assert.equal(decimals(cLow, 2), 1.04)
    assert.equal(decimals(cHigh, 2), 1.08)
  })

  test('Appendix C.1 (E2): "against 3.0 and 1.18 to 1.325 at the illustrative rho = 0.2"', () => {
    assert.equal(decimals(BETA_UNCACHED, 1), 3)
    assert.equal(decimals(BETA_CACHED_W125_OPENAI, 2), 1.18)
    assert.equal(decimals(BETA_CACHED_W125, 3), 1.325)
  })
})

describe('Section 5, S5: judge count', () => {
  test('Equation s5frac is Equation s5 over Equation total', () => {
    const p = { C: 5, E: 2, R: 3, T: 60, J: 3, K: 5, g: 4, jPrime: 0.7 }
    near(s5Saving(p) / totalCost(p), s5SavingFraction(p), 1e-12)
    assert.equal(s5Saving({ ...p, J: 1 }), 0)
  })

  test('"J K is often larger than C (15 against 5 in the worked instance of Appendix B), so a generation call has to cost several times a batched judging call"', () => {
    // J K and C as the cost model sees them: unbatched judging calls per answer, and answers per batched call.
    const counts = callCounts({ C: W.C, T: 60, E: W.E, R: W.R, J: W.J, K: W.K })
    assert.equal(counts.judgingUnbatched / counts.generation, 15)
    assert.equal(counts.judgingUnbatched / counts.judgingBatched, 5)
    // Equation s5frac in the worked instance: with a generation call as cheap as a
    // batched judging call (g = j'), dropping to one judge saves half the budget;
    // generation only matches judging (C g = J K j') at g = 3 j', where the saving is
    // still a third; it falls below a tenth only once g exceeds 17 j'.
    const fractionAt = (g) => s5SavingFraction({ C: W.C, J: W.J, K: W.K, g, jPrime: 1 })
    near(fractionAt(1), 1 / 2, 1e-12)
    near(fractionAt(3), 1 / 3, 1e-12)
    near(fractionAt(17), 0.1, 1e-12)
    assert.ok(fractionAt(17.01) < 0.1)
  })

  test('"Whenever generation cost dominates judging cost ... this fraction is small"', () => {
    // C g = 1000 J K j' against J K j' = 15: the J -> 1 saving is under 1% of the total.
    assert.ok(s5SavingFraction({ C: 5, J: 3, K: 5, g: 3000, jPrime: 1 }) < 0.01)
  })
})

describe('Section 5, S6: the task-count factor', () => {
  test('T_full / n* = 3 at the assumed floor of 60', () => {
    assert.equal(s6Factor({ Tfull: 180, nStar: 60 }), 3)
  })

  test('Appendix B: at n* = 184 "S6 saves nothing (the reduced protocol keeps all 180 tasks, a factor of 1, not 3)"', () => {
    assert.equal(s6Factor({ Tfull: 180, nStar: 184 }), 1)
  })
})

// ---------------------------------------------------------------------------
// Section 6 and Appendix B: Table tab:cumulative
// ---------------------------------------------------------------------------

describe('Appendix B, Table tab:cumulative and the component factors', () => {
  test('"Equation component-factors gives F_G = 21 * 3 * 3 = 189"', () => {
    assert.equal(FG_WORKED, 189)
  })

  test('"F_J = 2 * 3 * 5 * 3 * beta = 90 beta, that is 270 with uncached batching and 108 under cached-read pricing with no write premium (w = 1)"', () => {
    near(fj(1), 90, 1e-12)
    assert.equal(whole(fj(BETA_UNCACHED)), 270)
    near(fj(BETA_UNCACHED), 270, 1e-9)
    assert.equal(whole(fj(BETA_CACHED_W1)), 108)
    near(fj(BETA_CACHED_W1), 108, 1e-9)
  })

  test('"at Anthropic\'s w = 1.25, where the batched call pays no write, it is about 119"', () => {
    assert.equal(whole(fj(BETA_CACHED_W125)), 119)
  })

  test('Appendix B: "Where the batched call writes its prefix too, the denominator 1 + C rho of Equation s4 becomes w + C rho, and at OpenAI\'s w = 1.25, beta = 2.65/2.25, about 1.18"', () => {
    near(BETA_CACHED_W125_OPENAI, 2.65 / 2.25, 1e-12)
    assert.equal(decimals(BETA_CACHED_W125_OPENAI, 2), 1.18)
    // batchedWrite changes nothing where there is no write premium.
    near(s4Beta({ C: W.C, rho: W.rho, c: 0.1, w: 1, batchedWrite: true }), BETA_CACHED_W1, 1e-12)
  })

  test('"at OpenAI\'s, where the batched call pays the write too, it is 106, and that row becomes about 175, 153 and 136x, within two of Google\'s"', () => {
    const FJ = fj(BETA_CACHED_W125_OPENAI)
    near(FJ, 106, 1e-9)
    const row = SHARES.map((s) => whole(combinedReduction({ s, FG: FG_WORKED, FJ })))
    assert.deepEqual(row, [175, 153, 136])
    const google = SHARES.map((s) => whole(combinedReduction({ s, FG: FG_WORKED, FJ: fj(BETA_CACHED_W1) })))
    row.forEach((r, i) => assert.ok(Math.abs(r - google[i]) <= 2))
  })

  test('Appendix B: "a factor of 1.18 to 1.325, about a seventh to a quarter of the judging cost"', () => {
    const saved = (beta) => 1 - 1 / beta
    assert.equal(decimals(BETA_CACHED_W125_OPENAI, 2), 1.18)
    assert.equal(decimals(BETA_CACHED_W125, 3), 1.325)
    // The range spans every cached case: OpenAI's (lowest), Google's w = 1, Anthropic's (highest).
    assert.ok(BETA_CACHED_W125_OPENAI < BETA_CACHED_W1 && BETA_CACHED_W1 < BETA_CACHED_W125)
    assert.ok(Math.abs(saved(BETA_CACHED_W125_OPENAI) - 1 / 7) < 0.01)
    assert.equal(decimals(saved(BETA_CACHED_W125), 2), 0.25)
  })

  test('Table row "Reduction, no prompt caching (F_J = 270)": 195x, 208x, 222x at s = 0.1, 0.3, 0.5', () => {
    const FJ = fj(BETA_UNCACHED)
    assert.deepEqual(SHARES.map((s) => whole(combinedReduction({ s, FG: FG_WORKED, FJ }))), [195, 208, 222])
  })

  test('Table row "Reduction, cached-read pricing, w = 1 (F_J = 108)": 176x, 154x, 137x at s = 0.1, 0.3, 0.5', () => {
    const FJ = fj(BETA_CACHED_W1)
    assert.deepEqual(SHARES.map((s) => whole(combinedReduction({ s, FG: FG_WORKED, FJ }))), [176, 154, 137])
  })

  test('"the cached row of Table tab:cumulative becomes about 179, 161 and 146x" at w = 1.25', () => {
    const FJ = fj(BETA_CACHED_W125)
    assert.deepEqual(SHARES.map((s) => whole(combinedReduction({ s, FG: FG_WORKED, FJ }))), [179, 161, 146])
  })

  test('Equation cumulative: the ratio of totals equals the weighted harmonic mean, and both match the table when the full and reduced protocols are costed from Equations generation, judging-cached and judging-batched', () => {
    // Full protocol: E = 2 settings costing g and alpha g, R = 3, K = 5, T = 180,
    // each answer judged separately (Equation judging-cached). Reduced protocol:
    // the cheap setting only (S1), R = 1 (S2), K = 1 (S3), batched (S4), n* = 60 tasks (S6).
    const jFixed = 1
    const jMarginal = 0.2
    const expected = {
      '1,1': [195, 208, 222],
      '0.1,1': [176, 154, 137],
      '0.1,1.25': [179, 161, 146],
    }
    for (const [c, w] of [[1, 1], [0.1, 1], [0.1, 1.25]]) {
      const Jfull = judgingCostCached({ C: 5, E: 2, R: 3, T: 180, J: 3, K: 5, jFixed, jMarginal, c, w })
      const { jPrime } = judgingCallPrices({ C: 5, jFixed, jMarginal })
      const Jreduced = judgingCostBatched({ E: 1, R: 1, T: 60, J: 3, K: 1, jPrime })
      const beta = s4Beta({ C: 5, rho: rho({ jFixed, jMarginal }), c, w })
      const { FG, FJ } = componentFactors({ alpha: 20, kept: 'cheap', E: 2, R: 3, K: 5, beta, Tfull: 180, nStar: 60 })
      near(Jfull / Jreduced, FJ, 1e-9)
      SHARES.forEach((s, i) => {
        // Choose the cheap setting's generation price so that judging is share s of the full cost.
        const Gfull = (Jfull * (1 - s)) / s
        const gCheap = Gfull / (5 * 3 * 180 * (1 + 20))
        near(Gfull, generationCost({ C: 5, E: 2, R: 3, T: 180, g: (gCheap * (1 + 20)) / 2 }), 1e-6)
        const Greduced = generationCost({ C: 5, E: 1, R: 1, T: 60, g: gCheap })
        near(Gfull / Greduced, FG, 1e-9)
        near(judgingShare({ Gfull, Jfull }), s, 1e-12)
        const byTotals = (Gfull + Jfull) / (Greduced + Jreduced)
        near(byTotals, combinedReductionFromTotals({ Gfull, Jfull, FG, FJ }), 1e-9)
        near(byTotals, combinedReduction({ s, FG, FJ }), 1e-9)
        assert.equal(whole(byTotals), expected[`${c},${w}`][i])
      })
    }
  })

  test('Section 6: the reduction is "a weighted harmonic mean of F_G and F_J, which always lies between them" and "As s -> 0 the reduction tends to F_G"', () => {
    for (const beta of ALL_BETAS) {
      const FJ = fj(beta)
      for (const s of [0, 0.1, 0.3, 0.5, 0.9, 1]) {
        const r = combinedReduction({ s, FG: FG_WORKED, FJ })
        assert.ok(r >= Math.min(FG_WORKED, FJ) - 1e-9 && r <= Math.max(FG_WORKED, FJ) + 1e-9)
      }
      near(combinedReduction({ s: 0, FG: FG_WORKED, FJ }), FG_WORKED, 1e-9)
    }
  })

  test('Table caption: the naive product is "5,670x for the same inputs without caching and 2,268x with it at w = 1 (2,504x at Anthropic\'s w = 1.25, 2,226x at OpenAI\'s)"', () => {
    assert.equal(whole(naiveProduct({ FG: FG_WORKED, E: 2, K: 5, beta: BETA_UNCACHED })), 5670)
    assert.equal(whole(naiveProduct({ FG: FG_WORKED, E: 2, K: 5, beta: BETA_CACHED_W1 })), 2268)
    assert.equal(whole(naiveProduct({ FG: FG_WORKED, E: 2, K: 5, beta: BETA_CACHED_W125 })), 2504)
    assert.equal(whole(naiveProduct({ FG: FG_WORKED, E: 2, K: 5, beta: BETA_CACHED_W125_OPENAI })), 2226)
    // The caption's own form, (1 + alpha) E R K beta T_full / n*.
    assert.equal(whole((1 + 20) * 2 * 3 * 5 * BETA_UNCACHED * (180 / 60)), 5670)
  })
})

// ---------------------------------------------------------------------------
// Section 6: how far the naive product overstates the reduction
// ---------------------------------------------------------------------------

describe('Section 6: the overstatement of the naive product', () => {
  test('"S3 and S4 contribute little to the combined figure, provided s is also small against E/(1+alpha) ... (alpha = 20, so that ratio is about 0.1) they still roughly double it at s = 0.1, from about 97 to 175-195x"', () => {
    // F_J without S3 (K = 1) and S4 (beta = 1), over F_G with the cheap setting kept: E / (1 + alpha).
    const FJ0 = factorFJ({ E: 2, R: 3, K: 1, beta: 1, Tfull: 180, nStar: 60 })
    near(FJ0 / FG_WORKED, 2 / 21, 1e-12)
    assert.equal(decimals(FJ0 / FG_WORKED, 1), 0.1)
    const without = combinedReduction({ s: 0.1, FG: FG_WORKED, FJ: FJ0 })
    assert.equal(whole(without), 97)
    // "in the worked instance": every caching case Appendix B.5 evaluates, OpenAI's
    // included (194.8 uncached, 175.8 at w = 1, 178.6 on Anthropic's terms, 175.3 on
    // OpenAI's), not only the table's two rows (which alone would give 176-195x).
    const withThem = EVERY_BETA.map((beta) => combinedReduction({ s: 0.1, FG: FG_WORKED, FJ: fj(beta) }))
    assert.deepEqual(rangeOf(withThem).map(whole), [175, 195])
    near(Math.min(...withThem), combinedReduction({ s: 0.1, FG: FG_WORKED, FJ: fj(BETA_CACHED_W125_OPENAI) }), 1e-12)
    // "roughly double": 1.81 to 2.01 times.
    for (const r of withThem) assert.ok(r / without > 1.8 && r / without < 2.05)
  })

  test('"that factor equals (1-s) E K beta + s (1+alpha) when S1 keeps the cheap setting" (and s (1+alpha)/alpha for the expensive one)', () => {
    for (const kept of ['cheap', 'expensive']) {
      for (const alpha of [1.75, 3.18, 20]) {
        for (const beta of ALL_BETAS) {
          const { FG, FJ } = componentFactors({ alpha, kept, E: 2, R: 3, K: 5, beta, Tfull: 180, nStar: 60 })
          for (const s of SHARES) {
            near(
              naiveProduct({ FG, E: 2, K: 5, beta }) / combinedReduction({ s, FG, FJ }),
              naiveOverstatement({ s, E: 2, K: 5, beta, alpha, kept }),
              1e-9,
            )
          }
        }
      }
    }
  })

  test('"with the cheap setting kept, 13 to 29 in the worked instance"', () => {
    const values = SHARES.flatMap((s) => ALL_BETAS.map((beta) => naiveOverstatement({ s, E: 2, K: 5, beta, alpha: 20 })))
    const [low, high] = rangeOf(values)
    assert.equal(whole(low), 13)
    assert.equal(whole(high), 29)
    // The same range from the table: 2,268 / 176 and 5,670 / 195.
    near(low, 2268 / combinedReduction({ s: 0.1, FG: 189, FJ: 108 }), 1e-9)
    near(high, 5670 / combinedReduction({ s: 0.1, FG: 189, FJ: 270 }), 1e-9)
  })

  test('"(when it keeps the expensive one the second term is s (1+alpha)/alpha, which falls as alpha grows, and that factor is then 6 to 27 in the worked instance)"', () => {
    // alpha = 20, expensive setting kept, s = 0.1, 0.3, 0.5, every caching case of Appendix B.5.
    const values = SHARES.flatMap((s) => EVERY_BETA.map((beta) => naiveOverstatement({ s, E: 2, K: 5, beta, alpha: 20, kept: 'expensive' })))
    const [low, high] = rangeOf(values)
    // Low end 6.414 (OpenAI's beta, s = 0.5), the abstract's "six"; high end 27.105 (uncached, s = 0.1).
    assert.equal(decimals(low, 3), 6.414)
    near(high, 0.9 * 10 * 3 + 0.1 * 21 / 20, 1e-9)
    assert.equal(whole(low), 6)
    assert.equal(whole(high), 27)
  })

  test('"7 to 11 at the setting-cost ratios we measured ... under cached-read pricing with no write premium (w = 1)"', () => {
    for (const alphas of [ALPHA_BY_COST, ALPHA_BY_TOKENS]) {
      const values = alphas.flatMap((alpha) => SHARES.map((s) => naiveOverstatement({ s, E: 2, K: 5, beta: BETA_CACHED_W1, alpha })))
      const [low, high] = rangeOf(values)
      assert.equal(whole(low), 7)
      assert.equal(whole(high), 11)
    }
  })

  test('"falling below 10 once s passes about 0.22 to 0.26" (w = 1): the exact crossing lies above 0.2 and at or below 0.3 for every measured ratio', () => {
    // The overstatement falls with s (E K beta = 12 exceeds 1 + alpha), so it is below 10
    // for every s above the crossing s* = (E K beta - 10) / (E K beta - (1 + alpha)).
    const stars = MEASURED_ALPHAS.map((alpha) => {
      const sStar = overstatementCrossing(BETA_CACHED_W1, alpha)
      near(naiveOverstatement({ s: sStar, E: 2, K: 5, beta: BETA_CACHED_W1, alpha }), 10, 1e-9)
      assert.ok(2 * 5 * BETA_CACHED_W1 > 1 + alpha)
      // 0.3 is the first step of 0.1 at which it is below 10: above 10 at 0.2, below at 0.3.
      assert.ok(sStar > 0.2 && sStar <= 0.3, `alpha ${alpha}: crossing at s = ${sStar}`)
      assert.ok(naiveOverstatement({ s: 0.3, E: 2, K: 5, beta: BETA_CACHED_W1, alpha }) < 10)
      return sStar
    })
    // The exact crossings, which the paper does not print: s = 0.22 to 0.26.
    assert.deepEqual(rangeOf(stars).map((x) => decimals(x, 2)), [0.22, 0.26])
  })

  test('"8 to 12 at a write multiple of w = 1.25"', () => {
    for (const alphas of [ALPHA_BY_COST, ALPHA_BY_TOKENS]) {
      const values = alphas.flatMap((alpha) => SHARES.map((s) => naiveOverstatement({ s, E: 2, K: 5, beta: BETA_CACHED_W125, alpha })))
      const [low, high] = rangeOf(values)
      assert.equal(whole(low), 8)
      assert.equal(whole(high), 12)
    }
  })

  test('"falling below 10 once s passes about 0.31 to 0.36" (w = 1.25): the exact crossing lies above 0.3 and at or below 0.4 for every measured ratio', () => {
    const stars = MEASURED_ALPHAS.map((alpha) => {
      const sStar = overstatementCrossing(BETA_CACHED_W125, alpha)
      near(naiveOverstatement({ s: sStar, E: 2, K: 5, beta: BETA_CACHED_W125, alpha }), 10, 1e-9)
      assert.ok(2 * 5 * BETA_CACHED_W125 > 1 + alpha)
      assert.ok(sStar > 0.3 && sStar <= 0.4, `alpha ${alpha}: crossing at s = ${sStar}`)
      assert.ok(naiveOverstatement({ s: 0.4, E: 2, K: 5, beta: BETA_CACHED_W125, alpha }) < 10)
      return sStar
    })
    // The exact crossings, which the paper does not print: s = 0.31 to 0.36.
    assert.deepEqual(rangeOf(stars).map((x) => decimals(x, 2)), [0.31, 0.36])
  })

  test('"and 7 to 11 on OpenAI\'s terms, where the batched call pays the write too"', () => {
    for (const alphas of [ALPHA_BY_COST, ALPHA_BY_TOKENS]) {
      const values = alphas.flatMap((alpha) => SHARES.map((s) => naiveOverstatement({ s, E: 2, K: 5, beta: BETA_CACHED_W125_OPENAI, alpha })))
      const [low, high] = rangeOf(values)
      assert.equal(whole(low), 7)
      assert.equal(whole(high), 11)
    }
  })

  test('"falling below 10 once s passes about 0.20 to 0.23" (OpenAI\'s terms): the exact crossing lies in 0.19 to 0.24 for every measured ratio', () => {
    const stars = MEASURED_ALPHAS.map((alpha) => {
      const sStar = overstatementCrossing(BETA_CACHED_W125_OPENAI, alpha)
      near(naiveOverstatement({ s: sStar, E: 2, K: 5, beta: BETA_CACHED_W125_OPENAI, alpha }), 10, 1e-9)
      assert.ok(2 * 5 * BETA_CACHED_W125_OPENAI > 1 + alpha)
      assert.ok(naiveOverstatement({ s: 0.3, E: 2, K: 5, beta: BETA_CACHED_W125_OPENAI, alpha }) < 10)
      return sStar
    })
    assert.deepEqual(rangeOf(stars).map((x) => decimals(x, 2)), [0.2, 0.23])
  })

  test('Abstract: the naive product "overstates the saving, by a factor of about six to thirty in the configurations evaluated here"', () => {
    // Every configuration Section 6 and Appendices B and C.2 evaluate: alpha = 20 and
    // the measured ratios, either setting kept, beta uncached, cached at w = 1 and
    // 1.25, and OpenAI's (the batched call pays the write), s = 0.1, 0.3, 0.5.
    // (T_full / n* cancels from the overstatement.)
    const values = [20, ...MEASURED_ALPHAS].flatMap((alpha) =>
      ['cheap', 'expensive'].flatMap((kept) =>
        SHARES.flatMap((s) => EVERY_BETA.map((beta) => naiveOverstatement({ s, E: 2, K: 5, beta, alpha, kept }))),
      ),
    )
    const [low, high] = rangeOf(values)
    // Low end 6.414: alpha = 20, expensive setting kept, beta = 2.65/2.25, s = 0.5
    // (0.5 * 10 * 1.1778 + 0.5 * 1.05); without OpenAI's case it was 6.525 (beta = 1.2).
    near(low, 0.5 * 10 * (2.65 / 2.25) + 0.5 * 1.05, 1e-9)
    assert.equal(decimals(low, 3), 6.414)
    assert.equal(whole(low), 6)
    // High end 29.1: alpha = 20, cheap setting kept, beta = 3, s = 0.1 (27 + 0.1 * 21).
    near(high, 29.1, 1e-9)
    // Section 6 prints it as 29; the abstract's "about thirty" is that figure to the nearest ten.
    assert.equal(whole(high), 29)
    assert.equal(Math.round(high / 10) * 10, 30)
  })
})

// ---------------------------------------------------------------------------
// Section 6 and Appendix B: the expensive setting, and the floor of 184
// ---------------------------------------------------------------------------

describe('Section 6: the expensive setting kept, and the floor its own power inputs give', () => {
  test('"10-18x when it keeps the expensive one, since F_G is then 1.05 * 3 * 3 = 9.45"', () => {
    const FG = factorFG({ alpha: 20, kept: 'expensive', R: 3, Tfull: 180, nStar: 60 })
    assert.equal(decimals(FG, 2), 9.45)
    const values = SHARES.flatMap((s) => ALL_BETAS.map((beta) => combinedReduction({ s, FG, FJ: fj(beta) })))
    const [low, high] = rangeOf(values)
    assert.equal(whole(low), 10)
    assert.equal(whole(high), 18)
  })

  test('"with the floor of 184 that its own power inputs give, S6 saves nothing and every figure falls to a third (45-74x with the cheap setting kept)"', () => {
    const FG184 = factorFG({ alpha: 20, kept: 'cheap', R: 3, Tfull: 180, nStar: 184 })
    assert.equal(FG184, 63)
    // Every entry of the table falls to exactly a third.
    for (const beta of [BETA_UNCACHED, BETA_CACHED_W1]) {
      for (const s of SHARES) {
        near(
          combinedReduction({ s, FG: FG184, FJ: fj(beta, 184) }) * 3,
          combinedReduction({ s, FG: FG_WORKED, FJ: fj(beta) }),
          1e-9,
        )
      }
    }
    // The table's rows (uncached and cached at w = 1) at n* = 184: Appendix B.5's
    // "every reduction in the table falls to a third, 46-74x".
    const values = SHARES.flatMap((s) => [BETA_UNCACHED, BETA_CACHED_W1].map((beta) => combinedReduction({ s, FG: FG184, FJ: fj(beta, 184) })))
    const [low, high] = rangeOf(values)
    assert.equal(whole(low), 46)
    assert.equal(whole(high), 74)
    // Adding the w = 1.25 row leaves that range unchanged.
    const withW125 = [...values, ...SHARES.map((s) => combinedReduction({ s, FG: FG184, FJ: fj(BETA_CACHED_W125, 184) }))]
    assert.deepEqual(rangeOf(withW125).map(whole), [46, 74])
    // Every figure of Appendix B.5, OpenAI's case included (a third of 175, 153 and 136x): 45-74x.
    const every = SHARES.flatMap((s) => EVERY_BETA.map((beta) => combinedReduction({ s, FG: FG184, FJ: fj(beta, 184) })))
    near(combinedReduction({ s: 0.5, FG: FG184, FJ: fj(BETA_CACHED_W125_OPENAI, 184) }) * 3, combinedReduction({ s: 0.5, FG: FG_WORKED, FJ: fj(BETA_CACHED_W125_OPENAI) }), 1e-9)
    assert.deepEqual(rangeOf(every).map(whole), [45, 74])
  })
})

// ---------------------------------------------------------------------------
// Section 4: one cache write per task and judge
// ---------------------------------------------------------------------------

describe('Section 4: the cache write paid once per task and judge', () => {
  test('"the cached judging-side factor F_J of Section 6 at w = 1 falls from 108 to about 69, and the cached reductions of Table tab:cumulative from 137-176x to about 101-161x"', () => {
    const jFixed = 1
    const jMarginal = 0.2
    const Jfull = judgingCostCachedOncePerTaskAndJudge({ C: 5, E: 2, R: 3, T: 180, J: 3, K: 5, jFixed, jMarginal, c: 0.1, w: 1 })
    const { jPrime } = judgingCallPrices({ C: 5, jFixed, jMarginal })
    const Jreduced = judgingCostBatched({ E: 1, R: 1, T: 60, J: 3, K: 1, jPrime })
    const FJ = Jfull / Jreduced
    assert.equal(whole(FJ), 69)
    const [low, high] = rangeOf(SHARES.map((s) => combinedReduction({ s, FG: FG_WORKED, FJ })))
    assert.equal(whole(low), 101)
    assert.equal(whole(high), 161)
    // ... against the per-group write of Equation judging-cached, F_J = 108 and 137-176x.
    const [low108, high108] = rangeOf(SHARES.map((s) => combinedReduction({ s, FG: FG_WORKED, FJ: 108 })))
    assert.equal(whole(low108), 137)
    assert.equal(whole(high108), 176)
  })
})

// ---------------------------------------------------------------------------
// Appendix C (E1): the setting-cost ratios, from the calls of Table tab:e1-calls
// ---------------------------------------------------------------------------

describe('Appendix C (E1): Table tab:alpha and the measured setting-cost ratios, from Table tab:e1-calls', () => {
  test('"25 successful calls" and "Total spend: $2.17"', () => {
    assert.equal(E1_CALLS.length, 25)
    const spend = [['gpt-5.6-sol', 'high'], ['gpt-5.6-sol', 'low'], ['gpt-5.6-sol', 'none'], ['claude-opus-5', 'high'], ['claude-opus-5', 'low']]
      .reduce((total, [model, effort]) => total + e1Cost(model, effort), 0)
    assert.equal(decimals(spend, 2), 2.17)
  })

  test('Table tab:alpha, "alpha by tokens" (pooled ratio of summed output tokens): 2.83, 3.18, 1.12 and 1.75', () => {
    assert.equal(decimals(pooledByTokens(FIRST_HIGH_LOW), 2), 2.83)
    assert.equal(decimals(pooledByTokens(FIRST_HIGH_NONE), 2), 3.18)
    assert.equal(decimals(pooledByTokens(FIRST_LOW_NONE), 2), 1.12)
    assert.equal(decimals(pooledByTokens(SECOND_HIGH_LOW), 2), 1.75)
  })

  test('Table tab:alpha, "Per-prompt range": 1.52-3.99, 2.04-4.25, 0.94-1.34 and 1.48-2.00', () => {
    const range = (pair) => rangeOf(perPromptByTokens(pair)).map((x) => decimals(x, 2))
    assert.deepEqual(range(FIRST_HIGH_LOW), [1.52, 3.99])
    assert.deepEqual(range(FIRST_HIGH_NONE), [2.04, 4.25])
    assert.deepEqual(range(FIRST_LOW_NONE), [0.94, 1.34])
    assert.deepEqual(range(SECOND_HIGH_LOW), [1.48, 2.0])
  })

  test('"Cost ratios are slightly lower than the token ratios (2.80, 3.14 and 1.74 against 2.83, 3.18 and 1.75; both are 1.12 for low against none)" ... "by at most 0.04"', () => {
    assert.equal(decimals(pooledByCost(FIRST_HIGH_LOW), 2), 2.8)
    assert.equal(decimals(pooledByCost(FIRST_HIGH_NONE), 2), 3.14)
    assert.equal(decimals(pooledByCost(SECOND_HIGH_LOW), 2), 1.74)
    assert.equal(decimals(pooledByCost(FIRST_LOW_NONE), 2), 1.12)
    const gaps = [...HIGH_AGAINST_LOWER, FIRST_LOW_NONE].map((pair) => pooledByTokens(pair) - pooledByCost(pair))
    for (const gap of gaps) assert.ok(gap > 0 && gap <= 0.04, `gap ${gap}`)
    assert.equal(decimals(Math.max(...gaps), 2), 0.04)
  })

  test('Section 6 and Appendix C.2 take alpha from the high setting against a lower one: "1.74 to 3.14, or 1.75 to 3.18 by output tokens"', () => {
    assert.deepEqual(ALPHA_BY_COST.map((x) => decimals(x, 2)), [1.74, 3.14])
    assert.deepEqual(ALPHA_BY_TOKENS.map((x) => decimals(x, 2)), [1.75, 3.18])
  })
})

// ---------------------------------------------------------------------------
// Appendix C.2: the measured setting-cost ratios
// ---------------------------------------------------------------------------

describe('Appendix C.2: the worked instance at the measured setting-cost ratios', () => {
  // "across the same range of s and caching assumptions": s = 0.1, 0.3, 0.5;
  // beta uncached, cached at w = 1, at w = 1.25, and OpenAI's (the batched call pays the write).
  const combined = (alpha, kept, nStar = 60) =>
    SHARES.flatMap((s) =>
      EVERY_BETA.map((beta) =>
        combinedReduction({ s, FG: factorFG({ alpha, kept, R: 3, Tfull: 180, nStar }), FJ: fj(beta, nStar) }),
      ),
    )

  test('"replacing its illustrative alpha = 20 with the measured token ratios ... (1.75 to 3.18) gives a generation-side factor F_G of 25 to 38 instead of 189"', () => {
    const [low, high] = ALPHA_BY_TOKENS.map((alpha) => factorFG({ alpha, kept: 'cheap', R: 3, Tfull: 180, nStar: 60 }))
    assert.equal(whole(low), 25)
    assert.equal(whole(high), 38)
  })

  test('"a combined reduction of roughly 27-66x across the same range of s and caching assumptions instead of 136-222x"', () => {
    const [low, high] = rangeOf(ALPHA_BY_TOKENS.flatMap((alpha) => combined(alpha, 'cheap')))
    assert.equal(whole(low), 27)
    assert.equal(whole(high), 66)
    // The worked instance over the same caching cases: OpenAI's s = 0.5 figure (135.8) sets the low end.
    const [lowWorked, highWorked] = rangeOf(SHARES.flatMap((s) => EVERY_BETA.map((beta) => combinedReduction({ s, FG: FG_WORKED, FJ: fj(beta) }))))
    assert.equal(whole(lowWorked), 136)
    assert.equal(whole(highWorked), 222)
    // The table's two rows alone give 137-222x.
    const tableRows = SHARES.flatMap((s) => [BETA_UNCACHED, BETA_CACHED_W1].map((beta) => combinedReduction({ s, FG: FG_WORKED, FJ: fj(beta) })))
    assert.deepEqual(rangeOf(tableRows).map(whole), [137, 222])
  })

  test('"If the expensive setting is the one retained ... the same configuration yields 13-27x"', () => {
    const [low, high] = rangeOf(ALPHA_BY_TOKENS.flatMap((alpha) => combined(alpha, 'expensive')))
    assert.equal(whole(low), 13)
    assert.equal(whole(high), 27)
  })

  test('"at the floor of 184 ... S6 saves nothing and they fall to a third, 9-22x and 4-9x"', () => {
    const [cheapLow, cheapHigh] = rangeOf(ALPHA_BY_TOKENS.flatMap((alpha) => combined(alpha, 'cheap', 184)))
    assert.equal(whole(cheapLow), 9)
    assert.equal(whole(cheapHigh), 22)
    const [expLow, expHigh] = rangeOf(ALPHA_BY_TOKENS.flatMap((alpha) => combined(alpha, 'expensive', 184)))
    assert.equal(whole(expLow), 4)
    assert.equal(whole(expHigh), 9)
  })
})

// ---------------------------------------------------------------------------
// Equation component-factors outside E = 2
// ---------------------------------------------------------------------------

describe('Equation component-factors: (1 + alpha) is the E = 2 case; other E and S1 not applied go through s1G', () => {
  test('an alpha with an E other than 2 is refused, since F_G would assume two settings and F_J would not', () => {
    for (const E of [1, 3]) {
      assert.throws(() => componentFactors({ alpha: 20, E, R: 3, K: 5, Tfull: 180, nStar: 60 }), RangeError)
      assert.throws(() => factorFG({ alpha: 20, E, R: 3, Tfull: 180, nStar: 60 }), RangeError)
      assert.throws(() => naiveOverstatement({ s: 0.3, E, K: 5, beta: 3, alpha: 20 }), RangeError)
    }
    // Exactly one of alpha and s1G; kept goes with alpha only; s1G is at least 1.
    assert.throws(() => factorFG({ alpha: 20, s1G: 21, R: 3, Tfull: 180, nStar: 60 }), RangeError)
    assert.throws(() => factorFG({ R: 3, Tfull: 180, nStar: 60 }), RangeError)
    assert.throws(() => factorFG({ s1G: 21, kept: 'cheap', R: 3, Tfull: 180, nStar: 60 }), RangeError)
    assert.throws(() => factorFG({ s1G: 0.5, R: 3, Tfull: 180, nStar: 60 }), RangeError)
  })

  test('at E = 2, s1G from Equation s1\'s general form gives the same factors as alpha', () => {
    for (const kept of ['cheap', 'expensive']) {
      const s1G = s1GenerationFactorFromCosts([1, 20], kept)
      const byAlpha = componentFactors({ alpha: 20, kept, E: 2, R: 3, K: 5, beta: BETA_CACHED_W1, Tfull: 180, nStar: 60 })
      const byS1G = componentFactors({ s1G, E: 2, R: 3, K: 5, beta: BETA_CACHED_W1, Tfull: 180, nStar: 60 })
      near(byS1G.FG, byAlpha.FG, 1e-9)
      assert.equal(byS1G.FJ, byAlpha.FJ)
    }
  })

  test('at E = 3, with s1G = sum of g_e over the kept g_e, the factors equal the ratios of the full and reduced totals', () => {
    // Full protocol: three settings costing 1, 2 and 20 per answer, R = 3, K = 5,
    // T = 180, each answer judged separately with caching (c = 0.1, w = 1.25).
    // Reduced: one setting, R = 1, K = 1, batched, n* = 60 tasks.
    const costs = [1, 2, 20]
    const jFixed = 1
    const jMarginal = 0.2
    const { jPrime } = judgingCallPrices({ C: 5, jFixed, jMarginal })
    const beta = s4Beta({ C: 5, rho: rho({ jFixed, jMarginal }), c: 0.1, w: 1.25 })
    const Gfull = costs.reduce((total, g) => total + generationCost({ C: 5, E: 1, R: 3, T: 180, g }), 0)
    const Jfull = judgingCostCached({ C: 5, E: 3, R: 3, T: 180, J: 3, K: 5, jFixed, jMarginal, c: 0.1, w: 1.25 })
    const Jreduced = judgingCostBatched({ E: 1, R: 1, T: 60, J: 3, K: 1, jPrime })
    for (const [kept, gKept] of [['cheap', 1], ['expensive', 20]]) {
      const s1G = s1GenerationFactorFromCosts(costs, kept)
      const { FG, FJ } = componentFactors({ s1G, E: 3, R: 3, K: 5, beta, Tfull: 180, nStar: 60 })
      const Greduced = generationCost({ C: 5, E: 1, R: 1, T: 60, g: gKept })
      near(Gfull / Greduced, FG, 1e-9)
      near(Jfull / Jreduced, FJ, 1e-9)
      const s = judgingShare({ Gfull, Jfull })
      const byTotals = (Gfull + Jfull) / (Greduced + Jreduced)
      near(combinedReduction({ s, FG, FJ }), byTotals, 1e-9)
      // The overstatement's general form, (1 - s) E K beta + s s1G.
      near(naiveProduct({ FG, E: 3, K: 5, beta }) / byTotals, naiveOverstatement({ s, E: 3, K: 5, beta, s1G }), 1e-9)
    }
  })

  test('S1 not applied: s1G = 1 and E = 1 give the ratios of totals when both protocols keep both settings', () => {
    const jFixed = 1
    const jMarginal = 0.2
    const { jPrime } = judgingCallPrices({ C: 5, jFixed, jMarginal })
    const beta = s4Beta({ C: 5, rho: rho({ jFixed, jMarginal }) })
    const { FG, FJ } = componentFactors({ s1G: 1, E: 1, R: 3, K: 5, beta, Tfull: 180, nStar: 60 })
    // Both settings (costing 1 and 20) in both protocols; S2, S3, S4 and S6 applied.
    const Gfull = generationCost({ C: 5, E: 1, R: 3, T: 180, g: 1 }) + generationCost({ C: 5, E: 1, R: 3, T: 180, g: 20 })
    const Greduced = generationCost({ C: 5, E: 1, R: 1, T: 60, g: 1 }) + generationCost({ C: 5, E: 1, R: 1, T: 60, g: 20 })
    const Jfull = judgingCostUnbatched({ C: 5, E: 2, R: 3, T: 180, J: 3, K: 5, j: jFixed + jMarginal })
    const Jreduced = judgingCostBatched({ E: 2, R: 1, T: 60, J: 3, K: 1, jPrime })
    near(Gfull / Greduced, FG, 1e-9)
    near(Jfull / Jreduced, FJ, 1e-9)
    assert.equal(FG, 9)
    near(FJ, 135, 1e-9)
  })
})

// ---------------------------------------------------------------------------
// The README's one-call form
// ---------------------------------------------------------------------------

describe('src/simplifications.mjs: cumulativeReductionFactor', () => {
  test('reproduces Table tab:cumulative from the design parameters', () => {
    const base = { alpha: 20, regenerations: 3, repeats: 5, settingsSwept: 2, systems: 5, rho: 0.2, fullTasks: 180, reducedTasks: 60 }
    assert.deepEqual(SHARES.map((s) => whole(cumulativeReductionFactor({ ...base, judgingShare: s }))), [195, 208, 222])
    assert.deepEqual(SHARES.map((s) => whole(cumulativeReductionFactor({ ...base, judgingShare: s, cacheReadDiscount: 0.1 }))), [176, 154, 137])
  })

  test('runs the README example and equals the composed cost-model functions', () => {
    const example = {
      alpha: 10, regenerations: 3, repeats: 5, settingsSwept: 2, systems: 4, rho: 0.3,
      fullTasks: 120, reducedTasks: 40, judgingShare: 0.2, cacheReadDiscount: 0.1,
    }
    const beta = s4Beta({ C: 4, rho: 0.3, c: 0.1 })
    const { FG, FJ } = componentFactors({ alpha: 10, E: 2, R: 3, K: 5, beta, Tfull: 120, nStar: 40 })
    near(cumulativeReductionFactor(example), combinedReduction({ s: 0.2, FG, FJ }), 1e-12)
  })

  test('refuses an E other than 2, which (1 + alpha) does not describe', () => {
    assert.throws(() => cumulativeReductionFactor({ alpha: 10, regenerations: 3, repeats: 5, settingsSwept: 3, systems: 4, rho: 0.3, fullTasks: 120, reducedTasks: 40, judgingShare: 0.2 }), RangeError)
  })
})

// ---------------------------------------------------------------------------
// Input checks
// ---------------------------------------------------------------------------

describe('input checks throw on impossible values', () => {
  test('a share s outside 0..1', () => {
    assert.throws(() => combinedReduction({ s: -0.1, FG: 189, FJ: 270 }), RangeError)
    assert.throws(() => combinedReduction({ s: 1.1, FG: 189, FJ: 270 }), RangeError)
    assert.throws(() => naiveOverstatement({ s: 2, E: 2, K: 5, beta: 3, alpha: 20 }), RangeError)
    assert.doesNotThrow(() => combinedReduction({ s: 0, FG: 189, FJ: 270 }))
    assert.doesNotThrow(() => combinedReduction({ s: 1, FG: 189, FJ: 270 }))
  })

  test('a negative or fractional count', () => {
    assert.throws(() => generationCost({ C: -5, E: 2, R: 3, T: 60, g: 1 }), RangeError)
    assert.throws(() => judgingCostUnbatched({ C: 5, E: 2, R: 3, T: 60, J: -1, K: 5, j: 1 }), RangeError)
    assert.throws(() => callCounts({ C: 5, E: 2, R: 2.5, T: 60, J: 3, K: 5 }), RangeError)
    assert.throws(() => s6Factor({ Tfull: 180, nStar: 0 }), RangeError)
    assert.throws(() => s2Factor(0), RangeError)
  })

  test('a negative price, a cached-read fraction outside 0..1, a write multiple below 1', () => {
    assert.throws(() => generationCost({ C: 5, E: 2, R: 3, T: 60, g: -1 }), RangeError)
    assert.throws(() => s4Beta({ C: 5, rho: -0.2 }), RangeError)
    assert.throws(() => s4Beta({ C: 5, rho: 0.2, c: 1.5 }), RangeError)
    assert.throws(() => s4Beta({ C: 5, rho: 0.2, c: -0.1 }), RangeError)
    assert.throws(() => s4Beta({ C: 5, rho: 0.2, c: 0.1, w: 0.9 }), RangeError)
    assert.throws(() => rho({ jFixed: 0, jMarginal: 1 }), RangeError)
  })

  test('a setting-cost ratio below 1, or an unknown kept setting', () => {
    assert.throws(() => s1GenerationFactor(0.5), RangeError)
    assert.throws(() => s1GenerationFactor(20, 'middle'), RangeError)
    assert.throws(() => s1GenerationFactorFromCosts([1, 0]), RangeError)
  })

  test('a reduction factor that is not positive', () => {
    assert.throws(() => combinedReduction({ s: 0.3, FG: 0, FJ: 270 }), RangeError)
    assert.throws(() => factorFJ({ E: 2, R: 3, K: 5, beta: -1, Tfull: 180, nStar: 60 }), RangeError)
  })
})
