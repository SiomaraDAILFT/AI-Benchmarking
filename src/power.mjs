/**
 * The statistics that bound the simplifications, paper/main.tex Section 7.2
 * ("Power and the S6 floor") and Appendix B ("The task floor n*"):
 *
 *   - the task floor n* (Equation \label{eq:power}), one-sided, rounded up;
 *   - the variance decomposition (Equation \label{eq:variance-decomposition});
 *   - Holm's smallest per-comparison threshold a' (Section 7.1 and 7.2);
 *   - the power reached at a given task count n (Appendix B, "a power of only
 *     0.79 at R = 1"), the inverse of Equation power;
 *   - the standard normal CDF and quantile those need.
 *
 * Notation follows the paper: a is the family-wise significance level, a' the
 * Holm-corrected per-comparison level, pi the intended power, sigma the standard
 * deviation of the task-level paired differences, delta the minimum difference
 * in mean score worth detecting. (The paper uses a and pi, not alpha and 1-beta,
 * because alpha and beta are already S1's and S4's factors.)
 *
 * Plain ES module, no dependencies outside this package.
 */

import { inverseNormalCdf } from './stats-utils.mjs'

const SQRT_2PI = Math.sqrt(2 * Math.PI)

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function openUnit(name, value) {
  if (!isNumber(value) || value <= 0 || value >= 1) {
    throw new RangeError(`${name} must lie strictly between 0 and 1; got ${value}`)
  }
  return value
}

function positive(name, value) {
  if (!isNumber(value) || value <= 0) throw new RangeError(`${name} must be a finite number > 0; got ${value}`)
  return value
}

function nonNegative(name, value) {
  if (!isNumber(value) || value < 0) throw new RangeError(`${name} must be a finite number >= 0; got ${value}`)
  return value
}

function count(name, value) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} is a count and must be a whole number of at least 1; got ${value}`)
  }
  return value
}

// ---------------------------------------------------------------------------
// Standard normal distribution
// ---------------------------------------------------------------------------

/** The standard normal density phi(x). */
export function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / SQRT_2PI
}

/**
 * Upper tail Q(x) = P(Z > x) for x >= 0, accurate in relative terms.
 *
 * Below x = 3: the everywhere-convergent series
 *   Phi(x) = 1/2 + phi(x) * (x + x^3/3 + x^5/(3*5) + x^7/(3*5*7) + ...),
 * whose terms are all positive for x > 0, so the sum loses nothing to cancellation.
 * From x = 3: Laplace's continued fraction
 *   Q(x) = phi(x) / (x + 1/(x + 2/(x + 3/(x + ...)))),
 * evaluated from the bottom up at a fixed depth that converges to double
 * precision for x >= 3 (checked against the series in tests/power.test.mjs).
 */
function upperTail(x) {
  if (x < 3) {
    const x2 = x * x
    let term = x
    let sum = x
    for (let k = 1; k < 500; k++) {
      term *= x2 / (2 * k + 1)
      sum += term
      if (term < 1e-17 * sum) break
    }
    return 0.5 - normalPdf(x) * sum
  }
  let fractionValue = x
  for (let k = 300; k >= 1; k--) fractionValue = x + k / fractionValue
  return normalPdf(x) / fractionValue
}

/**
 * The standard normal CDF Phi(x). Absolute error below 1e-15 across the line
 * (tests/power.test.mjs checks it against published values to 1e-12).
 */
export function normalCdf(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) throw new RangeError(`x must be a number; got ${x}`)
  if (x === Infinity) return 1
  if (x === -Infinity) return 0
  return x >= 0 ? 1 - upperTail(x) : upperTail(-x)
}

/**
 * The standard normal quantile Phi^-1(p). Starts from Acklam's rational
 * approximation (src/stats-utils.mjs, relative error about 1.15e-9) and applies
 * Halley's correction twice against normalCdf, computing the residual on the
 * tail nearer to p so that p close to 0 or 1 keeps its precision.
 */
export function normalQuantile(p) {
  openUnit('p', p)
  if (p === 0.5) return 0
  let x = inverseNormalCdf(p)
  for (let step = 0; step < 2; step++) {
    // e = Phi(x) - p, from whichever tail is smaller.
    const e = p < 0.5 ? upperTail(-x) - p : (1 - p) - upperTail(x)
    const u = e * SQRT_2PI * Math.exp(0.5 * x * x)
    x -= u / (1 + 0.5 * x * u)
  }
  return x
}

// ---------------------------------------------------------------------------
// Holm, the floor, and power
// ---------------------------------------------------------------------------

/**
 * Holm's smallest per-comparison threshold, a' = a / m, for m pre-registered
 * comparisons at family-wise level a: the threshold Holm's procedure applies to
 * the smallest p-value (src/holm-bonferroni.mjs, first rank). Section 7.2: a' is
 * "the smallest threshold the correction procedure can demand across the
 * pre-registered comparisons"; Appendix B: "Holm's smallest per-comparison
 * threshold is a' = 0.05/3".
 */
export function holmSmallestThreshold(a, m) {
  return openUnit('a (family-wise significance level)', a) / count('m (pre-registered comparisons)', m)
}

/** z_{a'}, the standard normal quantile at 1 - a' (one-sided), Section 7.2. */
export function zAPrime(aPrime) {
  return -normalQuantile(openUnit("a'", aPrime))
}

/** z_pi, the standard normal quantile at the intended power pi, Section 7.2. */
export function zPi(power) {
  return normalQuantile(openUnit('pi (intended power)', power))
}

/**
 * The variance of an observed task-level paired difference averaged over R
 * regenerations, sigma^2 = omega^2 + (sigma_A^2 + sigma_B^2) / R.
 * Equation \label{eq:variance-decomposition}.
 */
export function varianceDecomposition({ omega2, sigmaA2, sigmaB2, R }) {
  return nonNegative('omega2', omega2) + (nonNegative('sigmaA2', sigmaA2) + nonNegative('sigmaB2', sigmaB2)) / count('R', R)
}

function sigmaSquaredFrom({ sigma, sigma2 }) {
  if ((sigma === undefined) === (sigma2 === undefined)) {
    throw new RangeError('give exactly one of sigma (standard deviation) or sigma2 (variance)')
  }
  return sigma !== undefined ? positive('sigma', sigma) ** 2 : positive('sigma2', sigma2)
}

/**
 * Equation \label{eq:power} before rounding:
 * (z_{a'} + z_pi)^2 sigma^2 / delta^2, one-sided.
 */
export function nStarUnrounded({ aPrime, power, sigma, sigma2, delta }) {
  const variance = sigmaSquaredFrom({ sigma, sigma2 })
  const z = zAPrime(aPrime) + zPi(power)
  return (z * z * variance) / positive('delta', delta) ** 2
}

/**
 * The task floor n*, Equation \label{eq:power}, rounded up to a whole number of
 * tasks: the smallest whole n whose power (powerAtN) reaches pi. Plain
 * Math.ceil, with no tolerance. A tolerance that let a value slightly above a
 * whole number round down would return a floor whose power falls short of pi;
 * without one, floating-point noise can only move a value that is mathematically
 * a whole number one task up, the conservative direction (more tasks, power at
 * or above pi).
 */
export function nStar(args) {
  return Math.ceil(nStarUnrounded(args))
}

/**
 * The one-sided power reached with n tasks, the inverse of Equation power:
 * pi(n) = Phi( sqrt(n) * delta / sigma - z_{a'} ).
 * Appendix B: the reduced protocol that keeps all 180 tasks "reaches a power of
 * only 0.79 at R = 1".
 */
export function powerAtN({ n, aPrime, sigma, sigma2, delta }) {
  const sd = Math.sqrt(sigmaSquaredFrom({ sigma, sigma2 }))
  return normalCdf((Math.sqrt(count('n', n)) * positive('delta', delta)) / sd - zAPrime(aPrime))
}
