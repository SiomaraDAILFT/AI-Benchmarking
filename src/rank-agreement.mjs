/**
 * Rank agreement between two orderings of the same systems (Section 8, Phase 2 of the paper:
 * "Phase 2 should report ... Kendall's tau over the systems under comparison").
 *
 * Kendall's tau-b: concordant minus discordant pairs, normalised so that ties in either
 * ranking do not inflate agreement. Two means that tie in one protocol and not in the other
 * are counted as neither concordant nor discordant, which is the conservative reading.
 *
 * Inputs are parallel arrays of scores (higher is better) for the same items in the same
 * order, for example each system's mean score under the full protocol and under the
 * reduced one. Returns null when fewer than two items are given.
 */
export function kendallTauB(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) throw new Error('kendallTauB: two arrays of equal length are required')
  const n = a.length
  if (n < 2) return null
  let concordant = 0, discordant = 0, tiesA = 0, tiesB = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const da = Math.sign(a[i] - a[j])
      const db = Math.sign(b[i] - b[j])
      if (da === 0 && db === 0) continue
      if (da === 0) { tiesA++; continue }
      if (db === 0) { tiesB++; continue }
      if (da === db) concordant++
      else discordant++
    }
  }
  const denom = Math.sqrt((concordant + discordant + tiesA) * (concordant + discordant + tiesB))
  if (denom === 0) return null
  return (concordant - discordant) / denom
}

/** 1-based ranks with ties averaged, highest score first. */
export function ranks(scores) {
  const idx = scores.map((s, i) => [s, i]).sort((p, q) => q[0] - p[0])
  const out = new Array(scores.length)
  let i = 0
  while (i < idx.length) {
    let j = i
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++
    const r = (i + 1 + j + 1) / 2
    for (let k = i; k <= j; k++) out[idx[k][1]] = r
    i = j + 1
  }
  return out
}

/** True when the item ranked first is the same under both orderings (ties at the top count as agreement only if the same set). */
export function sameLeader(a, b) {
  const ra = ranks(a), rb = ranks(b)
  const topA = ra.map((r, i) => (r === Math.min(...ra) ? i : -1)).filter((i) => i >= 0)
  const topB = rb.map((r, i) => (r === Math.min(...rb) ? i : -1)).filter((i) => i >= 0)
  return topA.length === topB.length && topA.every((i, k) => i === topB[k])
}
