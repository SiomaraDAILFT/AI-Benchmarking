# Corrections to the paper

One entry per pass. Each line says what was wrong and what it is now.

## 24 October 2026

- Appendix B, note under the combined-reduction table: the overstatement was given as 2,625x, which the stated factors do not produce. (1+alpha) E R K beta T/n* is 5,670x without caching and 2,268x with it.
- Sections 7 and Appendix B: alpha and beta each meant two things (the setting-cost ratio and the significance level; the batching factor and the power quantile). The statistics now use a and pi, with one sentence saying why.
- Section 7.2: it pointed to Section 7 from inside Section 7 and said the normal approximation was "only a first approximation". It now points to the test subsection (7.1).
- Sections 5 and 7: single-author citations took plural verbs (Kohli use, Miller derive, Miller give).

Open, larger than a wording fix: the paper cites tests/simplifications.test.mjs and tests/power.test.mjs and a reference implementation that reproduces Tables 2 and the n* figures. Neither the tests nor that code are in this repository.

## 24 October 2026, 20:15 pass

- Appendix C, E1 result: mean latency at the high setting for the first model is 125.4 seconds (calls of 138, 126, 73, 160 and 130 s in the call table), so 125, not 126. The sentence now also names the settings each pair of figures compares.
- Appendix C, E1 interpretation: with the expensive setting retained, the combined reduction across the stated range of judging shares and caching assumptions is 13 to 27 times, not 13 to 15 (recomputed with Equation 10 for alpha from 1.75 to 3.18; 13 is s = 0.1 with caching, 27 is s = 0.5 without).
- Appendix C, E3 result: the second model's median of 1.76 was called "the same as its prose value"; its pooled prose ratio is 1.75 (per-prompt median 1.78), so the text now says close to 1.75.

## 24 October 2026, 22:15 pass

- Section 5, S4: the cached batching ceiling 1 + (C-1)c was called "only slightly above one" and said not to scale with C. It is 1.4 at C = 5 and c = 0.1, and it does grow with C, by c per system. The sentence now gives the figure and the rate, against C = 5 without caching.
- Appendix B, batching factor: with caching, beta = 1.2 divides judging cost by 1.2, a saving of about a sixth (17%), not "roughly one fifth".
- Appendix C, E2 set-up: it named "the first of the five E1 prompts" before E1 is described, with no pointer; it now points to Section C.3, where the prompts are listed.

## 25 October 2026, 00:15 pass

- Section 2.2, the mixture-of-agents sentence: it ran three clauses together, said "benchmark" twice and pointed at Section 7 for a reliability question it never named. It now says why that benchmark is length-controlled (its judge favours longer answers) and why that matters here.
- Section 5, S6: "unlike" appeared twice in one sentence (unlike S1 to S5, unlike the others). The second is gone; the sentence keeps its meaning.
- Appendix C, E2 order sensitivity: it said it reproduced "the pattern Section 2.2 notes", ranking kept while scores move. Section 2.2 only says that the judge moves published scores; it says nothing about rankings. The sentence now states only what Section 2.2 says.
