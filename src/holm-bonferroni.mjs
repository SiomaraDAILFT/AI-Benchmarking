/**
 * The Holm-Bonferroni step-down correction, applied across the specific,
 * named comparisons of interest - not across every pairing a full C x C
 * comparison matrix could generate. Section 7.1 of the paper.
 */

/**
 * @param {number[]} pValues - raw, uncorrected p-values, one per
 *   pre-registered comparison
 * @param {number} [familyWiseAlpha=0.05]
 * @returns {{ index: number, pValue: number, adjustedAlpha: number, reject: boolean }[]}
 *   one entry per input p-value, in the ORIGINAL input order, each carrying
 *   the alpha threshold Holm's procedure applied to it and whether it was
 *   rejected
 */
export function holmBonferroni(pValues, familyWiseAlpha = 0.05) {
  const m = pValues.length
  if (m === 0) return []

  const indexed = pValues.map((p, index) => ({ p, index }))
  indexed.sort((a, b) => a.p - b.p)

  const results = new Array(m)
  let stillRejecting = true
  for (let rank = 0; rank < m; rank++) {
    const alphaForRank = familyWiseAlpha / (m - rank)
    const { p, index } = indexed[rank]
    if (stillRejecting && p <= alphaForRank) {
      results[index] = { index, pValue: p, adjustedAlpha: alphaForRank, reject: true }
    } else {
      stillRejecting = false
      results[index] = { index, pValue: p, adjustedAlpha: alphaForRank, reject: false }
    }
  }
  return results
}
