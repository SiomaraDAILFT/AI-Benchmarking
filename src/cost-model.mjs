/**
 * The cost model of paper/main.tex, Sections 4 to 6: one exported function per
 * equation, named after the paper's quantity, with the equation's \label beside
 * it. Appendix B ("A Worked Cost Instance at Current Commercial Terms") evaluates
 * these functions; tests/simplifications.test.mjs reproduces its figures.
 *
 * Notation (Section 4):
 *   C  systems or configurations under comparison
 *   T  tasks
 *   E  configuration-setting variants swept per system
 *   R  answer regenerations per (system, task, setting)
 *   J  independent judges
 *   K  repeated scorings per (judge, answer)
 *   g  average cost of one generation call
 *   j  average cost of one unbatched judging call, j = jFixed + jMarginal
 *   j' (jPrime) cost of one batched judging call, j' ~ jFixed + C * jMarginal
 *   c  cached-read price as a fraction of the standard input price
 *   w  price of the first, cache-writing call as a multiple of the standard input price
 *   rho = jMarginal / jFixed (Equation s4)
 *   alpha  setting-cost ratio of S1 (expensive setting over the cheap one)
 *   s  judging share of the full protocol's cost (Section 6)
 *
 * Every function checks its inputs and throws a RangeError on a value the model
 * cannot take: a count that is not a whole number of at least 1, a negative
 * price, a share outside 0..1, a cached-read fraction outside 0..1, a write
 * multiple below 1, a setting-cost ratio below 1.
 *
 * Plain ES module, no dependencies.
 */

// ---------------------------------------------------------------------------
// Input checks
// ---------------------------------------------------------------------------

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/** A count of systems, tasks, settings, regenerations, judges or repeats: a whole number, at least 1. */
function count(name, value) {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} is a count and must be a whole number of at least 1; got ${value}`)
  }
  return value
}

/** A price or cost: finite and not negative. */
function nonNegative(name, value) {
  if (!isNumber(value) || value < 0) {
    throw new RangeError(`${name} is a price or cost and must be a finite number >= 0; got ${value}`)
  }
  return value
}

/** A strictly positive finite number (a divisor, or a reduction factor). */
function positive(name, value) {
  if (!isNumber(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite number > 0; got ${value}`)
  }
  return value
}

/** A share or fraction: between 0 and 1 inclusive. */
function fraction(name, value) {
  if (!isNumber(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must lie between 0 and 1; got ${value}`)
  }
  return value
}

/**
 * c, the cached-read price as a fraction of the standard input price
 * (Equation judging-cached): a discount, so 0..1; c = 1 is no caching.
 */
function cachedReadFraction(value) {
  return fraction('c (cached-read fraction)', value)
}

/**
 * w, the cache-writing call's price as a multiple of the standard input price
 * (Equation judging-cached): w = 1 where no write premium is charged, so w >= 1.
 */
function writeMultiple(value) {
  if (!isNumber(value) || value < 1) {
    throw new RangeError(`w (cache-write multiple) must be >= 1 (w = 1 is no write premium); got ${value}`)
  }
  return value
}

/**
 * alpha, the setting-cost ratio of S1: "one setting's generation cost is alpha
 * times a cheaper baseline setting's cost", so alpha >= 1 (alpha = 1 when the
 * two settings cost the same). A ratio below 1 means the settings are the other
 * way round.
 */
function settingCostRatio(value) {
  if (!isNumber(value) || value < 1) {
    throw new RangeError(`alpha (setting-cost ratio, expensive over cheap) must be >= 1; got ${value}`)
  }
  return value
}

/** Which setting S1 keeps: 'cheap' (Equation s1) or 'expensive' ((1+alpha)/alpha). */
function keptSetting(value) {
  if (value !== 'cheap' && value !== 'expensive') {
    throw new RangeError(`kept must be 'cheap' or 'expensive'; got ${value}`)
  }
  return value
}

// ---------------------------------------------------------------------------
// Section 4: a general cost model
// ---------------------------------------------------------------------------

/**
 * Generation cost, G = C * E * R * T * g.
 * Equation \label{eq:generation}.
 */
export function generationCost({ C, E, R, T, g }) {
  return count('C', C) * count('E', E) * count('R', R) * count('T', T) * nonNegative('g', g)
}

/**
 * The per-call prices of Section 4, from a fixed and a marginal component:
 * j = jFixed + jMarginal (one answer per call) and j' ~ jFixed + C * jMarginal
 * (all C answers in one call). Text between Equations judging-batched and
 * batch-saving.
 */
export function judgingCallPrices({ C, jFixed, jMarginal }) {
  count('C', C)
  nonNegative('jFixed', jFixed)
  nonNegative('jMarginal', jMarginal)
  return { j: jFixed + jMarginal, jPrime: jFixed + C * jMarginal }
}

/**
 * Judging cost, unbatched, J_u = C * E * R * T * J * K * j.
 * Equation \label{eq:judging-unbatched}.
 */
export function judgingCostUnbatched({ C, E, R, T, J, K, j }) {
  return count('C', C) * count('E', E) * count('R', R) * count('T', T) * count('J', J) * count('K', K) * nonNegative('j', j)
}

/**
 * Judging cost, batched, J_b = E * R * T * J * K * j'.
 * Equation \label{eq:judging-batched}.
 */
export function judgingCostBatched({ E, R, T, J, K, jPrime }) {
  return count('E', E) * count('R', R) * count('T', T) * count('J', J) * count('K', K) * nonNegative('jPrime', jPrime)
}

/**
 * The batching saving, J_u - J_b = E * R * T * J * K * (C - 1) * jFixed.
 * Equation \label{eq:batch-saving} (with j' = jFixed + C * jMarginal).
 */
export function batchingSaving({ C, E, R, T, J, K, jFixed }) {
  return count('E', E) * count('R', R) * count('T', T) * count('J', J) * count('K', K) * (count('C', C) - 1) * nonNegative('jFixed', jFixed)
}

/**
 * Judging cost, unbatched, with prompt caching:
 * J_u^cached = E * R * T * J * K * [ (w + (C - 1) c) jFixed + C * jMarginal ].
 * One cache write per group of C calls (one judge, one repeat, one task,
 * setting and regeneration). Reduces to Equation judging-unbatched at c = w = 1.
 * Equation \label{eq:judging-cached}.
 */
export function judgingCostCached({ C, E, R, T, J, K, jFixed, jMarginal, c, w = 1 }) {
  count('C', C)
  cachedReadFraction(c)
  writeMultiple(w)
  nonNegative('jFixed', jFixed)
  nonNegative('jMarginal', jMarginal)
  const perGroup = (w + (C - 1) * c) * jFixed + C * jMarginal
  return count('E', E) * count('R', R) * count('T', T) * count('J', J) * count('K', K) * perGroup
}

/**
 * The variant Section 4 describes in words, not as a numbered equation: "Where
 * all the calls one judge makes on a task fall within one lifetime, the write is
 * paid once per task and judge". All C * E * R * K calls one judge makes on a
 * task share the prefix, so per task and judge one call pays w and the other
 * C * E * R * K - 1 pay c on the fixed component:
 * T * J * [ (w + (C*E*R*K - 1) c) jFixed + C*E*R*K * jMarginal ].
 * Derived here from that sentence (Section 4, "Effect of prompt caching");
 * the paper evaluates it only as F_J "about 69".
 */
export function judgingCostCachedOncePerTaskAndJudge({ C, E, R, T, J, K, jFixed, jMarginal, c, w = 1 }) {
  const callsPerTaskAndJudge = count('C', C) * count('E', E) * count('R', R) * count('K', K)
  cachedReadFraction(c)
  writeMultiple(w)
  nonNegative('jFixed', jFixed)
  nonNegative('jMarginal', jMarginal)
  const perTaskAndJudge = (w + (callsPerTaskAndJudge - 1) * c) * jFixed + callsPerTaskAndJudge * jMarginal
  return count('T', T) * count('J', J) * perTaskAndJudge
}

/**
 * Total cost with batched judging, Total = G + J_b = E * R * T * (C * g + J * K * j').
 * Equation \label{eq:total}.
 */
export function totalCost({ C, E, R, T, J, K, g, jPrime }) {
  return count('E', E) * count('R', R) * count('T', T) * (count('C', C) * nonNegative('g', g) + count('J', J) * count('K', K) * nonNegative('jPrime', jPrime))
}

/**
 * Call counts before any price is attached (Section 4, after Equation total;
 * Appendix B, "Call counts for a modest configuration"): C*E*R*T generation
 * calls, that times J*K unbatched judging calls, E*R*T*J*K batched judging calls.
 */
export function callCounts({ C, E, R, T, J, K }) {
  const generation = count('C', C) * count('E', E) * count('R', R) * count('T', T)
  return {
    generation,
    judgingUnbatched: generation * count('J', J) * count('K', K),
    judgingBatched: E * R * T * J * K,
  }
}

// ---------------------------------------------------------------------------
// Section 5: the six simplifications
// ---------------------------------------------------------------------------

/**
 * S1's generation-side factor at E = 2: (1 + alpha) when the cheap setting is
 * kept (Equation \label{eq:s1}), (1 + alpha) / alpha when the expensive one is
 * kept (the text after Equation s1).
 */
export function s1GenerationFactor(alpha, kept = 'cheap') {
  settingCostRatio(alpha)
  return keptSetting(kept) === 'cheap' ? 1 + alpha : (1 + alpha) / alpha
}

/**
 * S1's generation-side factor in the general form of Equation \label{eq:s1}:
 * the sum of the per-setting generation costs g_e over the cost of the setting
 * kept, g_min for the cheap one (the equation) or the highest for the expensive
 * one. At E = 2 with costs [g, alpha * g] this is s1GenerationFactor(alpha, kept).
 */
export function s1GenerationFactorFromCosts(costs, kept = 'cheap') {
  if (!Array.isArray(costs) || costs.length < 1) {
    throw new RangeError('costs must be a non-empty array of per-setting generation costs g_e')
  }
  costs.forEach((g, e) => positive(`g_${e + 1}`, g))
  const sum = costs.reduce((a, b) => a + b, 0)
  return sum / (keptSetting(kept) === 'cheap' ? Math.min(...costs) : Math.max(...costs))
}

/** S1's judging-side factor: E, fewer conditions to judge (Section 5, S1). */
export function s1JudgingFactor(E) {
  return count('E', E)
}

/** S2's factor: R, on generation and judging cost alike (Section 5, S2). */
export function s2Factor(R) {
  return count('R', R)
}

/** S3's factor: K, on judging cost only (Section 5, S3). */
export function s3Factor(K) {
  return count('K', K)
}

/** rho = jMarginal / jFixed, the per-answer reading cost over the fixed overhead (Equation \label{eq:s4}). */
export function rho({ jFixed, jMarginal }) {
  return nonNegative('jMarginal', jMarginal) / positive('jFixed', jFixed)
}

/**
 * S4's batching factor,
 * beta = J_u^cached / J_b = (w + (C - 1) c + C rho) / (1 + C rho).
 * Without caching (c = w = 1) this is C (1 + rho) / (1 + C rho).
 * Equation \label{eq:s4}.
 */
export function s4Beta({ C, rho, c = 1, w = 1 }) {
  count('C', C)
  nonNegative('rho', rho)
  cachedReadFraction(c)
  writeMultiple(w)
  return (w + (C - 1) * c + C * rho) / (1 + C * rho)
}

/**
 * The limit of beta as rho -> 0, w + (C - 1) c: C without caching, and the
 * ceiling 1 + (C - 1) c under caching with no write premium (Section 5, S4,
 * the text after Equation s4).
 */
export function s4BetaCeiling({ C, c = 1, w = 1 }) {
  count('C', C)
  cachedReadFraction(c)
  writeMultiple(w)
  return w + (C - 1) * c
}

/**
 * S5's absolute saving from reducing J judges to 1,
 * Delta_J = E * R * T * (J - 1) * K * j'.
 * Equation \label{eq:s5}.
 */
export function s5Saving({ E, R, T, J, K, jPrime }) {
  return count('E', E) * count('R', R) * count('T', T) * (count('J', J) - 1) * count('K', K) * nonNegative('jPrime', jPrime)
}

/**
 * S5's saving as a fraction of the total (Equation total),
 * Delta_J / Total = (J - 1) K j' / (C g + J K j').
 * Equation \label{eq:s5frac}.
 */
export function s5SavingFraction({ C, J, K, g, jPrime }) {
  count('C', C)
  count('J', J)
  count('K', K)
  nonNegative('g', g)
  nonNegative('jPrime', jPrime)
  const denominator = C * g + J * K * jPrime
  if (denominator === 0) throw new RangeError('C * g + J * K * jPrime is 0: the total is zero and the fraction undefined')
  return ((J - 1) * K * jPrime) / denominator
}

/**
 * S6's factor, T_full / n*: the full protocol's task count over the floor.
 * When the floor exceeds T_full the reduced protocol keeps all T_full tasks and
 * the factor is 1, not T_full / n* (Appendix B, "The combined reduction": "S6
 * saves nothing (the reduced protocol keeps all 180 tasks, a factor of 1, not 3)";
 * Section 8, Phase 2).
 */
export function s6Factor({ Tfull, nStar }) {
  count('Tfull', Tfull)
  count('nStar', nStar)
  return Tfull / Math.min(nStar, Tfull)
}

// ---------------------------------------------------------------------------
// Section 6: cumulative effect
// ---------------------------------------------------------------------------

/**
 * S1's generation-side factor as Equation component-factors and the
 * overstatement use it. Exactly one of:
 *   - alpha (with kept): the E = 2 form, (1 + alpha) or (1 + alpha) / alpha.
 *     Section 6 calls (1 + alpha) "the E = 2 case of sum_e g_e / g_min", so an
 *     alpha together with any E other than 2 is refused: it would pair an F_G
 *     for two settings with an F_J for E.
 *   - s1G: the factor itself, for any E, e.g. s1GenerationFactorFromCosts(costs,
 *     kept); s1G = 1 (with E = 1 in F_J) when S1 is not applied.
 */
function s1GenerationSide({ alpha, kept, s1G, E }) {
  if ((alpha === undefined) === (s1G === undefined)) {
    throw new RangeError(
      "give exactly one of alpha (the E = 2 form, (1 + alpha) or (1 + alpha)/alpha) or s1G (S1's generation-side factor itself, for any E; 1 if S1 is not applied)",
    )
  }
  if (s1G !== undefined) {
    if (kept !== undefined) {
      throw new RangeError('kept goes with alpha; s1G already reflects which setting is kept (s1GenerationFactorFromCosts(costs, kept))')
    }
    if (!isNumber(s1G) || s1G < 1) {
      throw new RangeError(`s1G (S1's generation-side factor, the sum of the per-setting costs over the kept one's) must be >= 1; got ${s1G}`)
    }
    return s1G
  }
  if (E !== undefined && E !== 2) {
    throw new RangeError(
      `(1 + alpha) is S1's factor at E = 2 (Equation s1); got E = ${E}. For another E pass s1G = s1GenerationFactorFromCosts(costs, kept); if S1 is not applied pass s1G = 1 and E = 1.`,
    )
  }
  return s1GenerationFactor(alpha, kept)
}

/**
 * The generation-side component factor, F_G = (1 + alpha) * R * T_full / n*,
 * with (1 + alpha) replaced by (1 + alpha) / alpha when S1 keeps the expensive
 * setting. Equation \label{eq:component-factors}, whose (1 + alpha) is the E = 2
 * case: pass E to have any other value refused, or pass s1G in place of alpha
 * (see s1GenerationSide). Pass R = 1 if S2 is not applied; T_full / n* comes
 * from s6Factor (1 when n* >= T_full).
 */
export function factorFG({ alpha, kept, s1G, E, R, Tfull, nStar }) {
  return s1GenerationSide({ alpha, kept, s1G, E }) * s2Factor(R) * s6Factor({ Tfull, nStar })
}

/**
 * The judging-side component factor, F_J = E * R * K * beta * T_full / n*,
 * with beta from Equation s4 (beta = 1 if S4 is not applied) and E = 1 if S1 is
 * not applied. Equation \label{eq:component-factors}.
 */
export function factorFJ({ E, R, K, beta = 1, Tfull, nStar }) {
  return s1JudgingFactor(E) * s2Factor(R) * s3Factor(K) * positive('beta', beta) * s6Factor({ Tfull, nStar })
}

/**
 * Both component factors of Equation \label{eq:component-factors}. With alpha,
 * E must be 2, the case (1 + alpha) describes; for another E, or with S1 not
 * applied, pass s1G (see s1GenerationSide).
 */
export function componentFactors({ alpha, kept, s1G, E, R, K, beta = 1, Tfull, nStar }) {
  return {
    FG: factorFG({ alpha, kept, s1G, E, R, Tfull, nStar }),
    FJ: factorFJ({ E, R, K, beta, Tfull, nStar }),
  }
}

/** The judging share of the full protocol's cost, s = J_full / (G_full + J_full) (Section 6). */
export function judgingShare({ Gfull, Jfull }) {
  nonNegative('Gfull', Gfull)
  nonNegative('Jfull', Jfull)
  if (Gfull + Jfull === 0) throw new RangeError('Gfull + Jfull is 0: the share is undefined')
  return Jfull / (Gfull + Jfull)
}

/**
 * The combined reduction, the weighted harmonic mean of F_G and F_J:
 * Reduction = ((1 - s) / F_G + s / F_J)^-1.
 * Equation \label{eq:cumulative}, right-hand form.
 */
export function combinedReduction({ s, FG, FJ }) {
  fraction('s (judging share)', s)
  positive('FG', FG)
  positive('FJ', FJ)
  return 1 / ((1 - s) / FG + s / FJ)
}

/**
 * The same reduction as a ratio of totals,
 * (G_full + J_full) / (G_full / F_G + J_full / F_J).
 * Equation \label{eq:cumulative}, left-hand form.
 */
export function combinedReductionFromTotals({ Gfull, Jfull, FG, FJ }) {
  nonNegative('Gfull', Gfull)
  nonNegative('Jfull', Jfull)
  positive('FG', FG)
  positive('FJ', FJ)
  if (Gfull + Jfull === 0) throw new RangeError('Gfull + Jfull is 0: the reduction is undefined')
  return (Gfull + Jfull) / (Gfull / FG + Jfull / FJ)
}

/**
 * The naive product F_G * E * K * beta, every factor applied to the whole budget
 * (Section 6; the caption of Table tab:cumulative writes it as
 * (1 + alpha) * E * R * K * beta * T_full / n*).
 */
export function naiveProduct({ FG, E, K, beta = 1 }) {
  return positive('FG', FG) * s1JudgingFactor(E) * s3Factor(K) * positive('beta', beta)
}

/**
 * How far the naive product exceeds the exact reduction (Section 6):
 * (1 - s) E K beta + s (1 + alpha) when S1 keeps the cheap setting, and
 * (1 - s) E K beta + s (1 + alpha) / alpha when it keeps the expensive one;
 * in general (1 - s) E K beta + s * s1G. As in componentFactors, alpha is the
 * E = 2 form and any other E needs s1G. Equal to naiveProduct /
 * combinedReduction for the same inputs.
 */
export function naiveOverstatement({ s, E, K, beta = 1, alpha, kept, s1G }) {
  fraction('s (judging share)', s)
  return (1 - s) * s1JudgingFactor(E) * s3Factor(K) * positive('beta', beta) + s * s1GenerationSide({ alpha, kept, s1G, E })
}
