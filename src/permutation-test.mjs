/**
 * A one-sided paired permutation (sign-flip) test, Section 7.1 of the
 * paper: pre-specified in place of a normality-test-then-branch procedure,
 * since that two-stage procedure is a documented source of inflated
 * Type I error and also invalidates a power calculation derived for one
 * specific downstream test.
 *
 * Under the null hypothesis (no true difference between the two systems),
 * each task's paired difference is equally likely to have occurred with
 * either sign. The test statistic is the mean of the observed differences;
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
 * @returns {{ observedMean: number, pValueOneSided: number, exact: boolean,
 *   permutations: number }}
 */
export function pairedPermutationTest(differences, options = {}) {
  const { iterations = 100000, exactThreshold = 20, seed = 1 } = options
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
    pValueOneSided: countGreaterOrEqual / permutations,
    exact: false,
    permutations,
  }
}
