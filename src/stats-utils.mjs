/**
 * Small, self-contained statistical primitives with no external
 * dependencies, used by power.mjs and effect-size.mjs.
 */

/**
 * Inverse standard normal CDF (the quantile function), Acklam's rational
 * approximation. Accurate to about 1.15e-9 relative error, which is more
 * than sufficient for a sample-size calculation.
 *
 * Reference: Peter Acklam, "An algorithm for computing the inverse normal
 * cumulative distribution function," https://web.archive.org/web/20151030215612/http://home.online.no/~pjacklam/notes/invnorm/
 */
export function inverseNormalCdf(p) {
  if (p <= 0 || p >= 1) {
    throw new RangeError('p must be strictly between 0 and 1')
  }

  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]

  const pLow = 0.02425
  const pHigh = 1 - pLow

  let q, r
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
  if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  }
  q = Math.sqrt(-2 * Math.log(1 - p))
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  )
}

export function mean(xs) {
  if (xs.length === 0) throw new RangeError('mean of an empty array is undefined')
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/** Sample standard deviation (n-1 denominator). */
export function sampleStdDev(xs) {
  if (xs.length < 2) throw new RangeError('sample standard deviation needs at least 2 values')
  const m = mean(xs)
  const sumSq = xs.reduce((acc, x) => acc + (x - m) ** 2, 0)
  return Math.sqrt(sumSq / (xs.length - 1))
}
