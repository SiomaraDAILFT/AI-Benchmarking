# Corrections to the paper

One entry per pass. Each line says what was wrong and what it is now.

## 24 October 2026

- Appendix B, note under the combined-reduction table: the overstatement was given as 2,625x, which the stated factors do not produce. (1+alpha) E R K beta T/n* is 5,670x without caching and 2,268x with it.
- Sections 7 and Appendix B: alpha and beta each meant two things (the setting-cost ratio and the significance level; the batching factor and the power quantile). The statistics now use a and pi, with one sentence saying why.
- Section 7.2: it pointed to Section 7 from inside Section 7 and said the normal approximation was "only a first approximation". It now points to the test subsection (7.1).
- Sections 5 and 7: single-author citations took plural verbs (Kohli use, Miller derive, Miller give).

Open, larger than a wording fix: the paper cites tests/simplifications.test.mjs and tests/power.test.mjs and a reference implementation that reproduces Tables 2 and the n* figures. Neither the tests nor that code are in this repository.
