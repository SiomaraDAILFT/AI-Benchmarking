/**
 * A one-sided paired permutation (sign-flip) test, Section 7.1 of the
 * paper: pre-specified in place of a normality-test-then-branch procedure,
 * because choosing the test after seeing the data is a researcher degree of
 * freedom and invalidates a power calculation derived for one specific
 * downstream test. (Whether the two-stage procedure also inflates the
 * Type I error rate is mixed in the simulation evidence; Section 7.1 does
 * not rest on it.)
 *
 * Under the null hypothesis that the task-level differences are independent
 * and each symmetric about zero (as when the two systems' labels are
 * exchangeable within each task), each task's paired difference is equally
 * likely to have occurred with either sign. The test statistic is the mean of the observed differences;
 * its null distribution is built by independently flipping each
 * difference's sign at random (or, for a small task count, by exhaustive
 * enumeration of every possible sign pattern) and recomputing the mean each
 * time.
 */

/** A small, seedable PRNG (mulberry32) so tests are reproducible. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function meanOf(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/**
 * @param {number[]} differences - one paired difference per task
 * @param {object} [options]
 * @param {number} [options.iterations=100000] - Monte Carlo sign-flips to draw
 *   when exhaustive enumeration is impractical (n > exactThreshold)
 * @param {number} [options.exactThreshold=20] - enumerate all 2^n sign
 *   patterns exactly when n is at or below this; Monte Carlo above it
 * @param {number} [options.seed=1] - PRNG seed, for reproducible test runs
 * @param {boolean} [options.countObserved=false] - in the Monte Carlo branch,
 *   count the observed sign pattern with the sample, adding one to both the
 *   number of patterns at least as extreme and the number drawn:
 *   p = (count + 1) / (iterations + 1). Section 7.1: the sampled test "stays
 *   exact only if the observed pattern is counted with the sample". Off by
 *   default here; the published runner (app/lib/protocol.mjs) turns it on for
 *   every comparison, so its p-value is never zero. The exact branch already
 *   counts the observed pattern among the 2^n it enumerates, so the option
 *   does not change it.
 * @returns {{ observedMean: number, pValueOneSided: number, exact: boolean,
 *   permutations: number }} permutations is the number of sign patterns
 *   enumerated or drawn (not counting the observed one added by countObserved)
 */
export function pairedPermutationTest(differences, options = {}) {
  const { iterations = 100000, exactThreshold = 20, seed = 1, countObserved = false } = options
  const n = differences.length
  if (n < 1) throw new RangeError('need at least one paired difference')

  const observedMean = meanOf(differences)
  const absDiffs = differences.map((d) => Math.abs(d))

  let countGreaterOrEqual = 0
  let permutations

  if (n <= exactThreshold) {
    permutations = 2 ** n
    for (let mask = 0; mask < permutations; mask++) {
      let sum = 0
      for (let i = 0; i < n; i++) {
        const sign = (mask >> i) & 1 ? -1 : 1
        sum += sign * absDiffs[i]
      }
      if (sum / n >= observedMean - 1e-12) countGreaterOrEqual++
    }
    return {
      observedMean,
      pValueOneSided: countGreaterOrEqual / permutations,
      exact: true,
      permutations,
    }
  }

  const rand = mulberry32(seed)
  permutations = iterations
  for (let it = 0; it < iterations; it++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      const sign = rand() < 0.5 ? -1 : 1
      sum += sign * absDiffs[i]
    }
    if (sum / n >= observedMean - 1e-12) countGreaterOrEqual++
  }
  return {
    observedMean,
    pValueOneSided: countObserved ? (countGreaterOrEqual + 1) / (permutations + 1) : countGreaterOrEqual / permutations,
    exact: false,
    permutations,
  }
}

/**
 * Counts, over the same sign patterns, how many give a mean at least and at most the observed
 * one. Exact (all 2^n patterns, visited in Gray-code order so that each step flips one sign and
 * the sum is updated rather than recomputed; it is recomputed from scratch every 1,024 steps so
 * rounding cannot build up) at or below exactThreshold; otherwise the `iterations` patterns that
 * pairedPermutationTest draws from the same seed, drawn once and reused for every set of values.
 */
function signFlipCounter(n, { iterations, exactThreshold, seed }) {
  if (n <= exactThreshold) {
    const total = 2 ** n
    return (abs, observedMean, tol) => {
      const negative = new Uint8Array(n)
      let sum = 0
      for (let i = 0; i < n; i++) sum += abs[i]
      let atLeast = 0
      let atMost = 0
      for (let k = 0; k < total; k++) {
        if (k > 0) {
          const bit = 31 - Math.clz32(k & -k)
          if (negative[bit]) { negative[bit] = 0; sum += 2 * abs[bit] } else { negative[bit] = 1; sum -= 2 * abs[bit] }
          if ((k & 1023) === 0) { sum = 0; for (let i = 0; i < n; i++) sum += negative[i] ? -abs[i] : abs[i] }
        }
        const m = sum / n
        if (m >= observedMean - tol) atLeast++
        if (m <= observedMean + tol) atMost++
      }
      return { atLeast, atMost, total, exact: true }
    }
  }
  /* Up to 20 million signs are kept (20 MB); beyond that they are drawn again from the seed on
     each call, which gives the same patterns. */
  const keep = iterations * n <= 2e7
  let signs = null
  if (keep) {
    signs = new Int8Array(iterations * n)
    const rand = mulberry32(seed)
    for (let j = 0; j < signs.length; j++) signs[j] = rand() < 0.5 ? -1 : 1
  }
  return (abs, observedMean, tol) => {
    const rand = keep ? null : mulberry32(seed)
    let atLeast = 0
    let atMost = 0
    for (let it = 0, j = 0; it < iterations; it++) {
      let sum = 0
      for (let i = 0; i < n; i++, j++) sum += (keep ? signs[j] : rand() < 0.5 ? -1 : 1) * abs[i]
      const m = sum / n
      if (m >= observedMean - tol) atLeast++
      if (m <= observedMean + tol) atMost++
    }
    return { atLeast, atMost, total: iterations, exact: false }
  }
}

function twoSidedFrom({ atLeast, atMost, total, exact }, countObserved) {
  const add = !exact && countObserved ? 1 : 0
  return Math.min(1, (2 * Math.min(atLeast + add, atMost + add)) / (total + add))
}

/** Ties within this distance of the observed mean count as at least as extreme: rounding, not data. */
const tieTolerance = (abs) => 1e-9 * (1 + abs.reduce((a, b) => a + b, 0) / abs.length)

/**
 * The two-sided p-value of the same sign-flip test of the mean, min(1, 2 min(p_greater,
 * p_less)), the form the runner's exploratory comparisons use, with both tails counted over
 * one set of sign patterns. Options as pairedPermutationTest.
 */
export function signFlipTwoSidedP(values, options = {}) {
  const { iterations = 100000, exactThreshold = 20, seed = 1, countObserved = false } = options
  const n = values.length
  if (n < 1) throw new RangeError('need at least one paired difference')
  const abs = values.map((v) => Math.abs(v))
  const count = signFlipCounter(n, { iterations, exactThreshold, seed })
  return twoSidedFrom(count(abs, meanOf(values), tieTolerance(abs)), countObserved)
}

/**
 * The confidence interval for the mean paired difference obtained by inverting the sign-flip
 * test, Section 7.1: it holds every value delta that, subtracted from each task's difference,
 * leaves the two-sided test unable to reject at level alpha. It rests on the test's own
 * assumptions (independent differences, each symmetric about its centre), not on the
 * central-limit approximation.
 *
 * Each bound is found by bisection between the mean difference, which the test never rejects
 * (the shifted differences then have mean zero, so p = 1), and a value below (above) every
 * difference, to within `tolerance`; the bound returned is the last value the test did not
 * reject. Below the smallest difference every shifted difference is positive and the p-value no
 * longer changes, so if the test cannot reject there (with the exact test, n <= 5 at alpha =
 * 0.05, where the smallest two-sided p is 2/2^n), that side of the interval is unbounded and
 * the bound is -Infinity (or Infinity).
 *
 * @param {number[]} differences - one paired difference per task
 * @param {object} [options] - alpha (default 0.05), tolerance (default 1e-6 times the range
 *   of the differences, at least 1e-6), and the options of pairedPermutationTest
 * @returns {{ lower: number, upper: number, level: number, exact: boolean }}
 */
export function signFlipConfidenceInterval(differences, options = {}) {
  const { alpha = 0.05, iterations = 100000, exactThreshold = 20, seed = 1, countObserved = false } = options
  const n = differences.length
  if (n < 1) throw new RangeError('need at least one paired difference')
  const lo = Math.min(...differences)
  const hi = Math.max(...differences)
  const span = Math.max(1, hi - lo)
  const tolerance = options.tolerance ?? 1e-6 * span
  const count = signFlipCounter(n, { iterations, exactThreshold, seed })
  const pAt = (delta) => {
    const shifted = differences.map((d) => d - delta)
    const abs = shifted.map((v) => Math.abs(v))
    return twoSidedFrom(count(abs, meanOf(shifted), tieTolerance(abs)), countObserved)
  }
  const accepted = (delta) => pAt(delta) > alpha
  const centre = meanOf(differences)
  const bound = (outside) => {
    if (accepted(outside)) return outside < centre ? -Infinity : Infinity
    let inside = centre
    let out = outside
    while (Math.abs(inside - out) > tolerance) {
      const mid = (inside + out) / 2
      if (accepted(mid)) inside = mid
      else out = mid
    }
    return inside
  }
  return { lower: bound(lo - span), upper: bound(hi + span), level: 1 - alpha, exact: n <= exactThreshold }
}
