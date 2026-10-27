/**
 * Reproduces, from src/power.mjs, the statistical figures of paper/main.tex
 * Section 7.2 and Appendix B ("The task floor n*", and the power figure in "The
 * combined reduction"), and checks the normal CDF and quantile those rest on.
 * Each assertion quotes the sentence it checks.
 */

import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import {
  normalCdf,
  normalPdf,
  normalQuantile,
  holmSmallestThreshold,
  zAPrime,
  zPi,
  varianceDecomposition,
  nStar,
  nStarUnrounded,
  powerAtN,
} from '../src/power.mjs'
import { holmBonferroni } from '../src/holm-bonferroni.mjs'
import { s6Factor } from '../src/cost-model.mjs'

const decimals = (x, d) => Math.round(x * 10 ** d) / 10 ** d
const near = (actual, expected, tolerance) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${expected} (within ${tolerance}), got ${actual}`)

// Appendix B, "The task floor n*": "three pre-registered comparisons at
// family-wise a = 0.05 ... At power pi = 0.8 ... sigma = 19 points ... delta = 5
// points ... sigma_A^2 = sigma_B^2 = 120 and between-task variance omega^2 = 281".
const A = 0.05
const M = 3
const PI = 0.8
const DELTA = 5
const OMEGA2 = 281
const SIGMA_A2 = 120
const SIGMA_B2 = 120
const A_PRIME = holmSmallestThreshold(A, M)

// ---------------------------------------------------------------------------
// The standard normal distribution
// ---------------------------------------------------------------------------

describe('standard normal CDF and quantile (accuracy required: 1e-6)', () => {
  test('CDF against published values, to 1e-12', () => {
    // Reference values: R's pnorm, which agree with Abramowitz and Stegun Table 26.1.
    const reference = [
      [0, 0.5],
      [1, 0.8413447460685429],
      [2, 0.9772498680518208],
      [-3, 0.001349898031630094],
      [-5, 2.866515718791939e-7],
      [1.959963984540054, 0.975],
    ]
    for (const [x, p] of reference) near(normalCdf(x), p, 1e-12)
    assert.equal(normalCdf(Infinity), 1)
    assert.equal(normalCdf(-Infinity), 0)
  })

  test('quantile against published values, to 1e-12', () => {
    // Reference values: R's qnorm.
    const reference = [
      [0.5, 0],
      [0.8, 0.8416212335729143],
      [0.95, 1.644853626951472],
      [0.975, 1.959963984540054],
      [0.99, 2.326347874040841],
      [0.05, -1.644853626951472],
    ]
    for (const [p, x] of reference) near(normalQuantile(p), x, 1e-12)
  })

  test('CDF agrees with an independent Simpson integration of the density, to 1e-10', () => {
    const simpson = (x, n = 20000) => {
      const h = x / n
      let sum = normalPdf(0) + normalPdf(x)
      for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * normalPdf(i * h)
      return 0.5 + (sum * h) / 3
    }
    for (let x = -6; x <= 6; x += 0.25) near(normalCdf(x), simpson(x), 1e-10)
  })

  test('the series and the continued fraction meet at x = 3 without a jump', () => {
    near(normalCdf(3) - normalCdf(3 - 1e-12), 0, 1e-13)
    near(normalCdf(-3) - normalCdf(-3 + 1e-12), 0, 1e-13)
  })

  test('quantile and CDF are inverses, to 1e-14', () => {
    for (let i = 1; i < 1000; i++) {
      const p = i / 1000
      near(normalCdf(normalQuantile(p)), p, 1e-14)
    }
  })

  test('the quantile refuses p outside (0, 1)', () => {
    assert.throws(() => normalQuantile(0), RangeError)
    assert.throws(() => normalQuantile(1), RangeError)
    assert.throws(() => normalQuantile(-0.1), RangeError)
  })
})

// ---------------------------------------------------------------------------
// Appendix B, "The task floor n*"
// ---------------------------------------------------------------------------

describe('Appendix B: the task floor n*', () => {
  test('"For three pre-registered comparisons at family-wise a = 0.05, Holm\'s smallest per-comparison threshold is a\' = 0.05/3"', () => {
    assert.equal(holmSmallestThreshold(0.05, 3), 0.05 / 3)
    // It is the threshold Holm's procedure (src/holm-bonferroni.mjs) applies to the smallest p-value.
    const thresholds = holmBonferroni([0.001, 0.02, 0.04], A).map((r) => r.adjustedAlpha)
    assert.equal(Math.min(...thresholds), A_PRIME)
  })

  test('"one-sided, z_{a\'} ~ 2.13"', () => {
    assert.equal(decimals(zAPrime(A_PRIME), 2), 2.13)
  })

  test('"At power pi = 0.8, z_pi ~ 0.84"', () => {
    assert.equal(decimals(zPi(PI), 2), 0.84)
  })

  test('"if that sigma was measured at R = 3 ... dropping to R = 1 (S2) raises sigma^2 from 361 to 521"', () => {
    const at3 = varianceDecomposition({ omega2: OMEGA2, sigmaA2: SIGMA_A2, sigmaB2: SIGMA_B2, R: 3 })
    const at1 = varianceDecomposition({ omega2: OMEGA2, sigmaA2: SIGMA_A2, sigmaB2: SIGMA_B2, R: 1 })
    assert.equal(at3, 361)
    assert.equal(at1, 521)
    // "a pilot standard deviation of task-level paired differences sigma = 19 points"
    assert.equal(Math.sqrt(at3), 19)
  })

  test('"sigma = 19 points ... delta = 5 points, Equation power gives n* = 128 tasks"', () => {
    assert.equal(nStar({ aPrime: A_PRIME, power: PI, sigma: 19, delta: DELTA }), 128)
    assert.equal(nStar({ aPrime: A_PRIME, power: PI, sigma2: 361, delta: DELTA }), 128)
  })

  test('"... and n* from 128 to 184, the interaction Section 7.2 describes"', () => {
    const sigma2 = varianceDecomposition({ omega2: OMEGA2, sigmaA2: SIGMA_A2, sigmaB2: SIGMA_B2, R: 1 })
    assert.equal(nStar({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA }), 184)
  })

  test('the same floors follow from the rounded quantiles 2.13 and 0.84 the appendix prints', () => {
    const z = 2.13 + 0.84
    assert.equal(Math.ceil((z * z * 361) / DELTA ** 2), 128)
    assert.equal(Math.ceil((z * z * 521) / DELTA ** 2), 184)
  })

  test('n* is the smallest task count that reaches the intended power (Equation power is the inverse of the power function)', () => {
    for (const sigma2 of [361, 521]) {
      const n = nStar({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA })
      assert.ok(powerAtN({ n, aPrime: A_PRIME, sigma2, delta: DELTA }) >= PI)
      assert.ok(powerAtN({ n: n - 1, aPrime: A_PRIME, sigma2, delta: DELTA }) < PI)
      // At the unrounded floor the power is exactly pi: Phi(sqrt(n*) delta / sigma - z_{a'}) = pi.
      const exact = nStarUnrounded({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA })
      near(normalCdf((Math.sqrt(exact) * DELTA) / Math.sqrt(sigma2) - zAPrime(A_PRIME)), PI, 1e-12)
    }
  })

  test('n* rounds strictly up: a floor a hair above a whole number goes to the next one, whose power reaches pi', () => {
    // sigma^2 chosen so that Equation power gives 128 + 5e-11 tasks.
    const z = zAPrime(A_PRIME) + zPi(PI)
    const sigma2 = ((128 + 5e-11) * DELTA ** 2) / (z * z)
    const exact = nStarUnrounded({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA })
    assert.ok(exact > 128, `unrounded floor ${exact}`)
    const n = nStar({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA })
    assert.equal(n, 129)
    assert.ok(powerAtN({ n: 128, aPrime: A_PRIME, sigma2, delta: DELTA }) < PI)
    assert.ok(powerAtN({ n, aPrime: A_PRIME, sigma2, delta: DELTA }) >= PI)
  })

  test('Section 7.2: "using the uncorrected family-wise a here systematically understates the requirement"', () => {
    assert.ok(nStar({ aPrime: A, power: PI, sigma: 19, delta: DELTA }) < nStar({ aPrime: A_PRIME, power: PI, sigma: 19, delta: DELTA }))
  })
})

describe('Appendix B: the floor above T_full, and the power reached', () => {
  test('"the floor exceeds T_full = 180, S6 saves nothing (the reduced protocol keeps all 180 tasks, a factor of 1, not 3)"; Section 8: "184 against 180 from its R = 1 alone"', () => {
    const sigma2 = varianceDecomposition({ omega2: OMEGA2, sigmaA2: SIGMA_A2, sigmaB2: SIGMA_B2, R: 1 })
    const floor = nStar({ aPrime: A_PRIME, power: PI, sigma2, delta: DELTA })
    assert.ok(floor > 180)
    assert.equal(s6Factor({ Tfull: 180, nStar: floor }), 1)
  })

  test('"and even so reaches a power of only 0.79 at R = 1"', () => {
    const sigma2 = varianceDecomposition({ omega2: OMEGA2, sigmaA2: SIGMA_A2, sigmaB2: SIGMA_B2, R: 1 })
    assert.equal(decimals(powerAtN({ n: 180, aPrime: A_PRIME, sigma2, delta: DELTA }), 2), 0.79)
  })
})

describe('input checks throw on impossible values', () => {
  test('a significance level or power outside (0, 1), a count below 1, a negative variance', () => {
    assert.throws(() => holmSmallestThreshold(0.05, 0), RangeError)
    assert.throws(() => holmSmallestThreshold(1.5, 3), RangeError)
    assert.throws(() => zPi(1), RangeError)
    assert.throws(() => varianceDecomposition({ omega2: -1, sigmaA2: 120, sigmaB2: 120, R: 3 }), RangeError)
    assert.throws(() => varianceDecomposition({ omega2: 281, sigmaA2: 120, sigmaB2: 120, R: 0 }), RangeError)
    assert.throws(() => powerAtN({ n: -5, aPrime: A_PRIME, sigma: 19, delta: DELTA }), RangeError)
  })

  test('both or neither of sigma and sigma2, or a non-positive delta', () => {
    assert.throws(() => nStar({ aPrime: A_PRIME, power: PI, sigma: 19, sigma2: 361, delta: DELTA }), RangeError)
    assert.throws(() => nStar({ aPrime: A_PRIME, power: PI, delta: DELTA }), RangeError)
    assert.throws(() => nStar({ aPrime: A_PRIME, power: PI, sigma: 19, delta: 0 }), RangeError)
  })
})
