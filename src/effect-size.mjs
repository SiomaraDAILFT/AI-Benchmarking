/**
 * Effect sizes for a paired comparison. Section 7.1 of the paper.
 */

import { mean, sampleStdDev } from './stats-utils.mjs'

/**
 * Cohen's d_z: the paired-samples effect size standardised by the standard
 * deviation of the differences themselves.
 *
 * Distinct from d_av, which standardises by the raw scores' own spread and
 * so ignores the correlation between the paired measurements (Section 7.1).
 * Always report which one you mean.
 *
 * @param {number[]} differences - one paired difference per task (system A
 *   score minus system B score, task by task)
 */
export function cohensDz(differences) {
  if (differences.length < 2) {
    throw new RangeError('Cohen\'s d_z needs at least 2 paired differences')
  }
  return mean(differences) / sampleStdDev(differences)
}

/**
 * The matched-pairs rank-biserial correlation - the natural effect-size
 * companion to the Wilcoxon/permutation test used elsewhere in this
 * package, for when the differences are not well-modelled as normal.
 *
 * r = (W+ - W-) / (W+ + W-), where W+ and W- are the sums of the positive
 * and negative signed ranks of the absolute differences.
 */
export function matchedPairsRankBiserial(differences) {
  const nonZero = differences.filter((d) => d !== 0)
  if (nonZero.length === 0) {
    throw new RangeError('all differences are zero; rank-biserial correlation is undefined')
  }
  const withAbs = nonZero.map((d) => ({ d, abs: Math.abs(d) })).sort((a, b) => a.abs - b.abs)

  // Assign ranks, averaging ties.
  const ranks = new Array(withAbs.length)
  let i = 0
  while (i < withAbs.length) {
    let j = i
    while (j + 1 < withAbs.length && withAbs[j + 1].abs === withAbs[i].abs) j++
    const avgRank = (i + 1 + j + 1) / 2
    for (let k = i; k <= j; k++) ranks[k] = avgRank
    i = j + 1
  }

  let wPos = 0
  let wNeg = 0
  withAbs.forEach((item, idx) => {
    if (item.d > 0) wPos += ranks[idx]
    else wNeg += ranks[idx]
  })

  return (wPos - wNeg) / (wPos + wNeg)
}
