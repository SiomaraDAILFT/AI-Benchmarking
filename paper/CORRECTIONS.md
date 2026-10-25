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

## 25 October 2026, 02:15 pass

Checked against the raw results in experiments/results/ this time.

- Sections 5 (S1) and Appendix B: the measured alpha was given as "between 1.7 and 3.2". The lowest measured value is 1.75 (Table 4), which does not round to 1.7; both places now say 1.75.
- Appendix C, E3 set-up: "eight calls failed" with HTTP 500. The run log and the results file show six cells failing, all on the first provider, each after three attempts, and all six succeeding on retry.
- Appendix C, E2 caching: the five repeated calls were said to have "an identical full prompt of 1,089 tokens". The prompt was 1,092 tokens, of which 1,089 were reported as cached.

## 25 October 2026, 05:15 pass

The E1 call table was checked row by row against experiments/results/ (all 25 rows match) and every citation used as a sentence subject was checked for verb agreement (all now agree).

- Section 5, S5: generation was said to dominate "when the judge is a cheaper model than the systems it scores". That is not enough: the condition is C g much larger than J K j', and J K is often larger than C (15 against 5 in the worked instance), so a generation call has to cost several times a judging call.
- Appendix C, E1 procedure: "between 07:41 and 08:20 local time". The scripts stamp their results with toISOString(), which is UTC; 07:41 UTC was 09:41 in Delft. It now says UTC.
- Bibliography, van der Maden et al.: month given as January, but its arXiv number 2604.16304 means April 2026. Corrected to April.

## 25 October 2026, 07:15 pass

Checked against the sources themselves this time (arXiv's abstract page and the Microsoft post).

- Bibliography, van der Maden et al.: the 05:15 pass changed its month to April because of the arXiv number 2604.16304. arXiv's own page says "Submitted on 25 Jan 2026", so January was right. Changed back; the 05:15 entry above is wrong on this point. The abstract's "nineteen practitioners" and the quotation are confirmed on that page.
- Table 1, Microsoft row: it gave "+7.0 over single-model baseline, SEM 1.90". The post states the +7.0 points (SEM 1.90) is over Perplexity Deep Research, the best system in the DRACO paper, under the same judge; the comparison with its own single-model version is the separate one with p < 0.0001 on every dimension and significance in 8 of 10 domains. The row now keeps the two apart.
- Bibliography, Microsoft post: the address now redirects (the blog moved from microsoft365copilotblog to microsoft-copilot-blog). Updated to the current address; same post, same date and author (Gaurav Anand, 30 March 2026).

## 25 October 2026, 09:15 pass

Checked against the cited papers' own abstracts on arXiv.

- Appendix A: DRACO's tasks were said to come from "users in 40 countries". The DRACO abstract says the tasks "draw on information sources from 40 countries"; that is what it now says.
- Section 2.1: the tasks were said to be "curated" and the questions "asked by real users". The DRACO abstract says the sampled requests were "filtered and augmented". The text now says so, gives the task count as 100 (Appendix A's figure) rather than "on the order of a hundred", and says the authors edited and augmented each question.
- Section 5, S1: Snell et al. were cited for a smaller model beating one 14 times larger. Their abstract limits this to a FLOPs-matched comparison on problems where the smaller model already has non-trivial success; the condition is now in the sentence.

## 25 October 2026, 11:15 pass

- Section 7.2: "Miller derives the two-sided version ... and decompose the variance". The second verb was missed in the 24 October agreement fix; now "decomposes".
- Section 8, Phase 0: Philipp et al.'s best evaluator was said to reach agreement "at the physicians' own ceiling" (kappa 0.694 against 0.709). Their v2 abstract says "consistent with the physician ceiling ... though wide confidence intervals limit interpretation". The sentence now says consistent with, and keeps their caveat.
- Bibliography, Philipp et al.: the address pointed to the latest version. Version 3 (6 October 2026) has a new title and an abstract without the two passages Section 8 quotes; those are in v2, which the entry already named. The address now pins v2 and the note says what changed in v3.
- Conclusion: the combined reduction was called "a harmonic mean" of the two factors. Section 6 and Equation 11 make it a weighted harmonic mean (weights 1-s and s); the conclusion now says weighted.
