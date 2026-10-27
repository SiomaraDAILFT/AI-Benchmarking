/**
 * Tests for the statistics modules of Section 7.1 ("Test, aggregation, and
 * multiple comparisons") and Section 8 (rank agreement): src/stats-utils.mjs,
 * src/effect-size.mjs, src/permutation-test.mjs, src/holm-bonferroni.mjs and
 * src/rank-agreement.mjs. Reference values were computed independently in
 * Python (statistics.NormalDist, exact enumeration of sign patterns with
 * fractions.Fraction, Kendall's tau-b from its definition); each is quoted
 * beside its assertion.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { inverseNormalCdf, mean, sampleStdDev } from '../src/stats-utils.mjs'
import { cohensDz, matchedPairsRankBiserial } from '../src/effect-size.mjs'
import { pairedPermutationTest } from '../src/permutation-test.mjs'
import { holmBonferroni } from '../src/holm-bonferroni.mjs'
import { kendallTauB, ranks, sameLeader } from '../src/rank-agreement.mjs'

const near = (actual, expected, tolerance) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} (within ${tolerance}), got ${actual}`)

// Ten task-level paired differences used across the tests below.
const DIFFS = [3, -1, 4, 1, -5, 9, 2, -6, 5, 3]

// ---------------------------------------------------------------------------
// src/stats-utils.mjs
// ---------------------------------------------------------------------------

describe('src/stats-utils.mjs', () => {
  test('inverseNormalCdf is within its documented 1.15e-9 relative error, in the centre and both tails', () => {
    // Python statistics.NormalDist().inv_cdf(p).
    const reference = [
      [1e-10, -6.361340902404056],
      [1e-5, -4.2648907939228256],
      [0.001, -3.090232306167813],
      [0.02, -2.0537489106318225],
      [0.02425, -1.9729610513118845],
      [0.1, -1.2815515655446008],
      [0.3, -0.5244005127080407],
      [0.7, 0.5244005127080407],
      [0.9, 1.2815515655446008],
      [0.975, 1.9599639845400536],
      [0.98, 2.053748910631822],
      [0.999, 3.090232306167813],
      [1 - 1e-6, 4.753424308817089],
    ]
    for (const [p, x] of reference) {
      const relative = Math.abs(inverseNormalCdf(p) - x) / Math.abs(x)
      assert.ok(relative <= 1.15e-9, `p = ${p}: relative error ${relative}`)
    }
    assert.equal(inverseNormalCdf(0.5), 0)
    assert.throws(() => inverseNormalCdf(0), RangeError)
    assert.throws(() => inverseNormalCdf(1), RangeError)
  })

  test('mean, and the sample standard deviation with n - 1 in the denominator', () => {
    assert.equal(mean([2, 4, 4, 4, 5, 5, 7, 9]), 5)
    // Python statistics.stdev: sqrt(32 / 7) = 2.138089935299395.
    near(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9]), Math.sqrt(32 / 7), 1e-15)
    assert.throws(() => mean([]), RangeError)
    assert.throws(() => sampleStdDev([1]), RangeError)
  })
})

// ---------------------------------------------------------------------------
// src/effect-size.mjs
// ---------------------------------------------------------------------------

describe('src/effect-size.mjs', () => {
  test('Section 7.1: Cohen\'s d_z is "standardised by the standard deviation of the differences themselves and equal to t/sqrt(n) for the paired t-statistic over n tasks"', () => {
    // Python: mean 1.5, stdev 4.527692569068709, d_z 0.3312945782245396.
    near(cohensDz(DIFFS), 0.3312945782245396, 1e-15)
    const n = DIFFS.length
    const t = mean(DIFFS) / (sampleStdDev(DIFFS) / Math.sqrt(n))
    near(cohensDz(DIFFS), t / Math.sqrt(n), 1e-15)
    assert.throws(() => cohensDz([1]), RangeError)
  })

  test('the matched-pairs rank-biserial correlation, (W+ - W-) / (W+ + W-), drops zero differences and averages tied ranks', () => {
    // |d| = 1..5, ranks 1..5: W+ = 1 + 3 + 4 = 8, W- = 2 + 5 = 7, r = 1/15.
    near(matchedPairsRankBiserial([1, -2, 3, 4, -5, 0]), 1 / 15, 1e-15)
    // |d| = 1, 1, 2, 2, 3, ranks 1.5, 1.5, 3.5, 3.5, 5: W+ = 8.5, W- = 6.5, r = 2/15.
    near(matchedPairsRankBiserial([1, -1, 2, 2, -3]), 2 / 15, 1e-15)
    assert.equal(matchedPairsRankBiserial([1, 2, 3]), 1)
    assert.equal(matchedPairsRankBiserial([-1, -2, -3]), -1)
    assert.throws(() => matchedPairsRankBiserial([0, 0]), RangeError)
  })
})

// ---------------------------------------------------------------------------
// src/permutation-test.mjs
// ---------------------------------------------------------------------------

describe('src/permutation-test.mjs: the one-sided paired sign-flip test of Section 7.1', () => {
  test('at small n every one of the 2^n sign patterns is enumerated: the exact p-value', () => {
    // All 1,024 patterns of DIFFS, counted with fractions: 181 have a mean of at least 1.5.
    const result = pairedPermutationTest(DIFFS)
    assert.equal(result.exact, true)
    assert.equal(result.permutations, 1024)
    assert.equal(result.observedMean, 1.5)
    assert.equal(result.pValueOneSided, 181 / 1024)
    // The observed pattern is among those enumerated, so p is never below 1 / 2^n.
    assert.equal(pairedPermutationTest([1, 2, 3]).pValueOneSided, 1 / 8)
  })

  test('above 20 tasks the p-value is estimated from sampled patterns; "the published runner draws 100,000"', () => {
    // 25 integer differences; exact p from the distribution of signed sums (dynamic
    // programming over all 2^25 patterns): 0.07273530960083008.
    const d25 = [3, -1, 4, 1, -5, 9, 2, -6, 5, 3, 5, -8, 9, 7, -9, 3, 2, 3, -8, 4, 6, -2, 6, 4, 3]
    const result = pairedPermutationTest(d25)
    assert.equal(result.exact, false)
    assert.equal(result.permutations, 100000)
    // Four standard errors of a proportion near 0.073 from 100,000 draws is about 0.0033.
    near(result.pValueOneSided, 0.07273530960083008, 0.004)
    // Seeded: the same draw twice.
    assert.equal(pairedPermutationTest(d25).pValueOneSided, result.pValueOneSided)
  })

  test('"The published runner adds neither, so its p-value can be zero"; countObserved adds one to both, so the test "stays exact"', () => {
    const allLarge = Array.from({ length: 30 }, (_, i) => 10 + i)
    // Default (the runner's behaviour): no sampled pattern reaches the observed mean.
    assert.equal(pairedPermutationTest(allLarge, { iterations: 1000 }).pValueOneSided, 0)
    // Counting the observed pattern with the sample: (0 + 1) / (1000 + 1).
    const counted = pairedPermutationTest(allLarge, { iterations: 1000, countObserved: true })
    assert.equal(counted.pValueOneSided, 1 / 1001)
    assert.equal(counted.permutations, 1000)
    // In general (count + 1) / (iterations + 1), from the same seeded draw.
    const d25 = [3, -1, 4, 1, -5, 9, 2, -6, 5, 3, 5, -8, 9, 7, -9, 3, 2, 3, -8, 4, 6, -2, 6, 4, 3]
    const plain = pairedPermutationTest(d25, { iterations: 5000 })
    const withObserved = pairedPermutationTest(d25, { iterations: 5000, countObserved: true })
    near(withObserved.pValueOneSided, (plain.pValueOneSided * 5000 + 1) / 5001, 1e-15)
    // The exact branch already counts the observed pattern; the option leaves it alone.
    assert.equal(pairedPermutationTest(DIFFS, { countObserved: true }).pValueOneSided, 181 / 1024)
  })

  test('refuses an empty set of differences', () => {
    assert.throws(() => pairedPermutationTest([]), RangeError)
  })
})

// ---------------------------------------------------------------------------
// src/holm-bonferroni.mjs
// ---------------------------------------------------------------------------

describe('src/holm-bonferroni.mjs: Holm\'s step-down correction (Section 7.1)', () => {
  test('thresholds a/m, a/(m-1), ..., a; stops at the first p above its threshold; results in input order', () => {
    // Sorted: 0.005 <= 0.05/4 reject; 0.01 <= 0.05/3 reject; 0.03 > 0.05/2 stop; 0.04 not rejected.
    const results = holmBonferroni([0.01, 0.04, 0.03, 0.005], 0.05)
    assert.deepEqual(results.map((r) => r.reject), [true, false, false, true])
    assert.deepEqual(results.map((r) => r.adjustedAlpha), [0.05 / 3, 0.05 / 1, 0.05 / 2, 0.05 / 4])
    assert.deepEqual(results.map((r) => r.index), [0, 1, 2, 3])
    assert.deepEqual(holmBonferroni([]), [])
  })

  test('"uniformly more powerful than Bonferroni": it rejects whatever Bonferroni rejects, and here more', () => {
    // Bonferroni's 0.05/2 = 0.025 rejects only 0.01; Holm then tests 0.04 against 0.05.
    const pValues = [0.01, 0.04]
    const bonferroni = pValues.map((p) => p <= 0.05 / pValues.length)
    const holm = holmBonferroni(pValues, 0.05).map((r) => r.reject)
    assert.deepEqual(bonferroni, [true, false])
    assert.deepEqual(holm, [true, true])
  })
})

// ---------------------------------------------------------------------------
// src/rank-agreement.mjs
// ---------------------------------------------------------------------------

describe('src/rank-agreement.mjs: rank agreement between two protocols (Section 8, Phase 2)', () => {
  test('Kendall\'s tau-b, (C - D) / sqrt((n0 - n1)(n0 - n2)), with and without ties', () => {
    // Python, from the definition: 0.4, 0.6842105263157895, 0.8888888888888888.
    near(kendallTauB([1, 2, 3, 4, 5], [3, 1, 2, 5, 4]), 0.4, 1e-15)
    near(kendallTauB([1, 2, 2, 3, 4, 4, 5], [2, 1, 3, 3, 5, 4, 4]), 0.6842105263157895, 1e-15)
    near(kendallTauB([0.61, 0.55, 0.55, 0.48, 0.4], [0.58, 0.57, 0.5, 0.5, 0.41]), 0.8888888888888888, 1e-15)
    assert.equal(kendallTauB([1, 2, 3], [1, 2, 3]), 1)
    assert.equal(kendallTauB([1, 2, 3], [3, 2, 1]), -1)
    assert.equal(kendallTauB([1], [1]), null)
    assert.equal(kendallTauB([1, 1], [2, 3]), null)
    assert.throws(() => kendallTauB([1, 2], [1]), Error)
  })

  test('ranks, highest score first, ties averaged; and whether the leader is the same', () => {
    assert.deepEqual(ranks([10, 20, 20, 5]), [3, 1.5, 1.5, 4])
    assert.equal(sameLeader([3, 5, 1], [2, 9, 0]), true)
    assert.equal(sameLeader([3, 5, 1], [9, 2, 0]), false)
    // A tie at the top agrees only when the same set of systems ties.
    assert.equal(sameLeader([5, 5, 1], [5, 5, 0]), true)
    assert.equal(sameLeader([3, 5, 5], [3, 5, 1]), false)
  })
})
