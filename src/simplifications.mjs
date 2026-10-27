/**
 * The six simplifications (paper/main.tex Section 5) and their cumulative effect
 * (Section 6), as README.txt documents them. Every formula lives in
 * src/cost-model.mjs, which this module re-exports; cumulativeReductionFactor is
 * the one-call form the README's usage example shows.
 */

import { s4Beta, componentFactors, combinedReduction } from './cost-model.mjs'

export {
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
} from './cost-model.mjs'

/**
 * The combined reduction of Equation \label{eq:cumulative} from a benchmark's
 * design, applying S1 (two settings to one), S2 (R to 1), S3 (K to 1), S4
 * (batched judging, beta from Equation s4) and S6 (fullTasks to reducedTasks).
 *
 * @param {object} p
 * @param {number} p.alpha - setting-cost ratio, expensive over cheap (>= 1)
 * @param {'cheap'|'expensive'} [p.keep='cheap'] - which setting S1 keeps
 * @param {number} p.regenerations - R in the full protocol
 * @param {number} p.repeats - K in the full protocol
 * @param {number} p.settingsSwept - E in the full protocol; must be 2, the case
 *   (1 + alpha) describes (use s1GenerationFactorFromCosts for other E)
 * @param {number} p.systems - C
 * @param {number} p.rho - jMarginal / jFixed
 * @param {number} p.fullTasks - T_full
 * @param {number} p.reducedTasks - n*, the floor (a factor of 1 if it is not below fullTasks)
 * @param {number} p.judgingShare - s, judging's share of the FULL protocol's cost
 * @param {number} [p.cacheReadDiscount=1] - c, the cached-read fraction (1 = no caching)
 * @param {number} [p.cacheWriteMultiple=1] - w, the cache-write multiple (1 = no premium)
 * @param {boolean} [p.batch=true] - whether S4 is applied (beta = 1 if not)
 * @returns {number} the combined reduction, a ratio of total costs
 */
export function cumulativeReductionFactor({
  alpha,
  keep = 'cheap',
  regenerations,
  repeats,
  settingsSwept,
  systems,
  rho,
  fullTasks,
  reducedTasks,
  judgingShare,
  cacheReadDiscount = 1,
  cacheWriteMultiple = 1,
  batch = true,
}) {
  if (settingsSwept !== 2) {
    throw new RangeError(`settingsSwept must be 2, the case (1 + alpha) describes (Equation s1); got ${settingsSwept}. For other E, compose s1GenerationFactorFromCosts with factorFJ and combinedReduction.`)
  }
  const beta = batch ? s4Beta({ C: systems, rho, c: cacheReadDiscount, w: cacheWriteMultiple }) : 1
  const { FG, FJ } = componentFactors({
    alpha,
    kept: keep,
    E: settingsSwept,
    R: regenerations,
    K: repeats,
    beta,
    Tfull: fullTasks,
    nStar: reducedTasks,
  })
  return combinedReduction({ s: judgingShare, FG, FJ })
}
