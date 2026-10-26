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

## 25 October 2026, 12:14 pass

- Section 1: Arena-Hard and length-controlled AlpacaEval were both called benchmarks "derived from" the crowdsourced leaderboards. Arena-Hard is built from Chatbot Arena prompts; AlpacaEval is not built from Arena but is checked against it (its abstract reports the Spearman correlation with Chatbot Arena rising from 0.94 to 0.98). The sentence now says "built from them or checked against them".
- Section 2.2, mixture of agents: the 57.5% was given for "the strongest single proprietary model at the time". The abstract names GPT-4 Omni and says nothing about it being the strongest; it also says the 65.1% mixture used only open-source models. The sentence now names GPT-4 Omni and says the mixture was built only from open models.
- Section 2.2, Cemri et al.: they were said to trace "a substantial share of failures to evaluation and verification design rather than to the agents' reasoning". Their abstract sorts failures into three categories (system design, inter-agent misalignment, task verification) and makes no comparison with the agents' reasoning. The sentence now gives the three categories.

## 25 October 2026, 14:14 pass

- Section 5, S1, Guedes de Souza et al.: their "generation budget" is the maximum number of output tokens (64 to 4,096), not a reasoning-effort setting, and S1 is about effort settings. The sentence now says what was varied, so the reader can judge how far it carries over.
- Section 5, S1, Frohn et al.: cited only for "varied by model family" and a low-effort configuration being most accurate. Their abstract also reports that higher effort had a significant positive trend overall. The sentence now gives both.
- Section 5, S3: "judge repeats are inexpensive relative to generation (Section 4)". Section 4 defines the costs but does not compare them; the comparison is made in S5. The pointer now goes there and the claim says "usually".

## 25 October 2026, 16:14 pass

- Section 5, S5, Kohli: the nine judges were said to be "drawn from different families". The abstract says nine frontier models from seven families, tested on three natural-language-inference datasets. Both facts are now in the sentence; the second matters because the paper applies the result to open-ended judging.
- Section 5, S6: a DRACO-style benchmark was said to start "from tens of open-ended tasks". DRACO itself has 100 (Section 2.1, Appendix A). Now "about a hundred (DRACO has 100)".
- Section 5, S6, Hofmann et al.: the result was placed on "a large benchmark"; their abstract gives it for MMLU. Named.

## 25 October 2026, 18:14 pass

Every figure in Appendix C was recomputed from the E1 call table and the E3 table: totals, means, pooled and per-prompt ratios, latencies and the \$2.17 spend all hold. Four text faults:

- Appendix A, opening: "All access dates are September 2026." The Microsoft post was re-checked at its new address on 25 October (the 07:15 pass). The sentence and the bibliography note now say so.
- Appendix C.4: "Four explanations ... survive scrutiny", followed by E3, which tests the first of them (task family) and does not support it. Now "four candidate explanations", with a sentence pointing to E3's result.
- Appendix C.3, procedure: the first run was stamped UTC but the retry window (08:55 to 09:10) had no time zone. UTC added.
- Appendix C.5, interpretation: the ratio was said to stay "within a factor of two to three on both task families". The pooled ratios are 1.48, 1.75, 2.67 and 2.83, so the lowest is below two. Now "between about one and a half and three (1.48 to 2.83)".

## 25 October 2026, 20:14 pass

Checked this time: the cost-model algebra of Section 4 (the batching saving and the reduction of the cached formula at c = w = 1 both hold), every figure of Appendix B's call counts, batching factors and the combined-reduction table (all recompute), and the S4 quotations from BatchEval and Batch Prompting against their abstracts (both exact).

- Section 4 and S4, the symbol w: it was called "the cache-write premium on the first call" and "cache-write premium", but the formulas use it as the price of that call as a multiple of the standard input price (they reduce to the uncached case at w = 1, and Appendix B gives w = 1 for OpenAI and Google, 1.25 for Anthropic). A premium in that sense would be 0.25. Now "the price of the first, cache-writing call as a multiple of the standard input price (w = 1 where no write premium is charged)" and "cache-write multiple".
- Section 4, after the total: "cost is the product of six design choices". The total is E R T (C g + J K j'): three choices multiply the whole cost and the other three each multiply one of its two terms. The sentence now says that; the call counts that follow were right.
- Section 6: generation dominating the budget was called "the usual case by the argument of S5". Since the 05:15 pass, S5 makes it conditional (a generation call has to cost several times a judging call, because J K is often larger than C). The sentence now states the condition instead of calling it usual.

## 25 October 2026, 22:27 pass

Checked this time, each claim by two independent readers and then by hand: the E1 call table against its prices and the stated total ($2.17 recomputes), the E2 run log (experiments/results/e2-judge-cache-run.log) against the order-sensitivity paragraph, and the Thinking Machines post against S2.

- Appendix C, E2 order sensitivity, and Section 7.3: the ranking of the three answers was said to be the same in all three orderings and "intact". The run log gives the strongest answer 60, 65 and 48 and the middle one 45, 55 and 50 by rotation, so in the third rotation the top two swap (48 against 50). All three places now say the ranking held in two of three orderings and the top two swapped in the third. The 17-point spread (65 to 48) was right.
- Appendix C, E1 result and C.3 analysis: cost ratios were said to equal token ratios "to two decimals, as they must". A fixed input cost added at both settings pulls the cost ratio towards one. From the E1 call table at the stated prices the cost ratios are 2.80, 3.14 and 1.74 against token ratios of 2.83, 3.18 and 1.75 (both 1.12 for low against none), which the run log also prints (1.75 by tokens, 1.74 by cost). Both sentences now say the cost ratio is slightly lower, by at most 0.04.
- Section 5, S2: the 80 distinct completions in 1,000 requests were attributed to "a production endpoint", with the next source said to reproduce the mechanism "in open-weight models". The Thinking Machines post measured an open-weight model, Qwen3-235B, sampled 1,000 times at temperature zero. The sentence now names the model, and the second source is described as a reasoning model in which the same cause moves accuracy.
- Appendix C.3, the comparison table with the published 23x: the Result row gave 1.75x first and 2.83x second, while the Model and Settings rows list gpt-5.6-sol first. 2.83x (3.18x against none) is gpt-5.6-sol and 1.75x is claude-opus-5, so the row is now in the same order as the rows above it.
- Section 2.2, last paragraph: "Section 7 treats the judge as a source of variance". It does not; its variance decomposition has a task term and a regeneration term only, and Section 9 says the interval is conditional on the judges. The sentence now points to S5, which argues for keeping several judges, and to Section 9.

Found in this pass and not yet changed, because each needs a source read or a decision about the worked numbers first:
- Appendix B: the worked instance uses n* = 60 and calls it "power-derived", but the power calculation two subsections later gives n* = 128 for the same inputs. The combined-reduction table rests on T_full/n* = 3.
- Appendix A, A.1 and A.2: the DRACO paper is said to give the direction of the judge difference "without a point estimate". Its Appendix D may include a table of every system's score under each judge, which would make the aggregator's 10 to 25 point range a summary of the paper's own figures. To be checked against the paper itself.
- Section 5, S1: Zhao et al.'s result is applied to "knowledge-intensive tasks of DRACO's kind". To be checked whether their result is limited to closed-book questions, which DRACO's research tasks are not.
- "The pilot of Section 8" is referred to in S1, S2, Section 7.2 and Appendix C, but Section 8 never describes a pilot; its phases are 0 to 3.

## 26 October 2026, 00:14 pass

The four findings left open by the 22:27 pass, each settled against its source by one reader and checked again by a second.

- Appendix B, the combined reduction: the worked instance called n* = 60 "power-derived", but nothing in the paper derives 60. The task-floor subsection's own inputs give n* = 128 at R = 3 and 184 at R = 1 (recomputed: 127.35 and 183.79), and the instance applies S2, so on those inputs the floor is above T_full = 180 and S6 saves nothing. The floor is now called assumed, and one added sentence says that with the power-derived floor every reduction in the combined-reduction table falls to a third, 46 to 74x. The table and the figures resting on it are unchanged, since they describe the instance as defined.
- Section 2 and Appendix A (A.1 and A.2): the DRACO paper was cited as "Appendix D" and said to give the judge difference "without quantifying the gap". The paper (arXiv 2602.11685, v1) has no Appendix D; its Appendix A and Table 15 give all seven systems' scores under each judge, with GPT-5.2 14.8 to 23.9 points below Gemini 3 Pro and 16.4 to 27.4 below Sonnet 4.5. The citations now say Appendix A, A.1 gives the gaps, and A.2 reads the aggregator's "10--25 point" range as a rough summary of the authors' own figures. The quoted phrases were already exact and are unchanged.
- Section 5, S1, "What is lost": Zhao et al.'s result was applied to "knowledge-intensive tasks of DRACO's kind". Their abstract and set-up limit it to closed-book questions with no search, and their own search experiment goes the other way (GPT-5-mini with a search tool: accuracy 41.2% to 53.0%, hallucinations 16.6% to 8.0%). The sentence now says closed-book and adds the search result; the quotation is unchanged.
- Section 8, Phase 1: S1 to S3, S6, Sections 6, 7.2 and 9 and Appendices B and C rely on "the pilot", four of them as "the pilot of Section 8", but Section 8 never said what it was. One sentence now says the full reference run of Phase 1 is that pilot: it holds the two-setting, multi-regeneration and repeat-scoring subsets of S1 to S3, and its data give the variance estimates for n* and alpha on the benchmark's own tasks.

## 26 October 2026, 02:14 pass

Read this time for consistency between the summaries and the body after the last two passes, for the bibliography against its sources, and for Sections 7 to 9. Each finding was checked by a second reader and then by hand.

- Conclusion, first sentence: it still said the cost is "a product of six design choices", the claim corrected in Section 4 on 25 October. It now matches Section 4: three choices multiply the whole cost and the other three each multiply one of its two terms (Equation 6, the total).
- Section 6: S2 and S6 were called the two simplifications whose cost to validity the pilot can measure, but S1, S3, Phase 1 and Section 9 say the pilot measures S1's and S3's losses too. The sentence now says what does set S2 and S6 apart: their cost enters the power calculation directly, S2 through the regeneration term of the variance decomposition and S6 through n*.
- Section 7.2: Equation 13 uses z_{a'} but only z_pi was defined, as the quantile at pi; read the same way z_{a'} would be negative and n* would come out near 24 instead of 128. Both are now defined: the standard normal quantiles at 1 - a' and at pi (2.13 and 0.84, as Appendix B uses).
- Section 9, first paragraph: the task-to-task spread of the generation cost g was said to be absorbed into sigma, but sigma is the spread of paired score differences and has no cost term. The spread is absorbed by taking g as an average over tasks (Section 4); the sentence now says that, and that the framework does not say how far actual spend can differ from the average.
- Bibliography, OckBench (du2025ockbench): three of its five authors were listed with no "and others"; Tushar Krishna and Ligeng Zhu are added (arXiv 2511.05722).
- Bibliography, the Korean Journal of Radiology editorial (kim2026kjr): the second author is Joon-Yong Jung (Crossref, PubMed), not Joon Yul Jung.

## 26 October 2026, 04:14 pass

Read this time: Sections 1 to 3 against their sources, S3 to S6, and the parts of Appendix C not checked before (E3, C.4, C.5, the appendix captions). Each finding was checked by a second reader against the source or the results files, then by hand.

- Section 2.2, Zhang et al.: they were said to "argue that reported debate gains are often confounded with extra compute or more diverse models". Their abstract says debate often fails to beat chain-of-thought and self-consistency even with more computation, and calls model heterogeneity "a universal antidote"; diversity is their remedy, not a confound. The sentence now says what they found.
- Section 3, Prometheus 2: judging against user-defined criteria was said to have "become the standard design of purpose-built evaluator models". The cited abstract presents it as something existing open evaluators "often do not possess" and Prometheus 2 adds. The sentence now says that.
- Section 5, S6: task count was called "the one dimension" where cost and statistical validity trade off directly, "unlike S1--S5". Section 6, Section 7.2 (Equation 14) and Appendix B.6 say S2 does too: dropping R from 3 to 1 raises n* from 128 to 184 (recomputed 127.35 and 183.79). The sentence now says fewer regenerations also cost power, and that S6 is the dimension the floor bounds directly.
- Section 5, S3: repeated sampling "at non-zero temperature" was called a Monte Carlo approximation of one call's score-probability mean, so that one call replaces the K repeats. That holds at temperature one and for a judge that states its score without reasoning first. Wang et al. find that after reasoning the score distribution often sharpens, "making the mean judgment similar to the mode", and DRACO's judges write a short justification before each verdict (DRACO Section 4.2 and its grading prompt). The sentence now draws that distinction and keeps K > 1 for judges that reason before they score.
- Appendix C.5, E3 interpretation: the low setting was said to spend reasoning where needed while high "adds little where it does not". The results file (experiments/results/e3-aime-2026-09-11T08-35-02.json) shows the three largest per-problem ratios in the E3 table (72.7, 2.12 and 2.02) on problems low had already answered correctly, and on the one problem low got wrong high used slightly fewer tokens (358 against 370). The text now says high adds little on most items and that the large additions did not come where low fell short.
- Appendix C.5, E3 set-up: total spend was $0.39. The 20 recorded calls sum to $0.3845 (run logs $0.264 and $0.120), which rounds to $0.38; 0.39 came from rounding the three-decimal 0.385 a second time. The run manifest (experiments/MANIFEST.tex, RUNS.json) still says 0.39 by the same double rounding and is left as the run's own record.

## 26 October 2026, 06:14 pass

Read this time: Section 4 and Section 6 with their equations, Appendix A against its sources, and Appendix B's caching terms and the abstract. Each finding was checked by a second reader against the source or by recomputation, then by hand.

- Section 6 and the abstract: both said the naive product of the per-component factors overstates the saving by more than an order of magnitude, Section 6 "for typical values". The overstatement is (1 - s) E K beta + s (1 + alpha): 13 to 29 at the worked instance's alpha of 20, but 7.4 to 11.2 at the measured setting-cost ratios with cached-read pricing, and below ten from s = 0.3. Section 6 now gives the formula and both ranges; the abstract says about seven to thirty times.
- Section 4, prompt caching, and S4: the C calls that score "one task's answers" were said to fall within one cache lifetime. One judge makes C E R K calls on a task (150 in Appendix B), all with the same prefix, and Equation 5 charges a fresh cache write every C calls; in E2 the repeated calls read the cache (1,089 of 1,092 tokens). The sentence now names the grouping Equation 5 assumes and what one write per task and judge would give (the cached F_J of Appendix B falls from 108 to about 69, the cached row of the table "Combined reduction from S1--S4 and S6" from 176, 154 and 137x to about 161, 124 and 101x). S4's cached ceiling of 1 + (C - 1) c is now stated as holding under that grouping.
- Appendix A.3 and Section 2.2: A.3 said the second tracker's 88.6% appears in none of the primary sources, and Section 2.2 said the retrieval-centred products report the highest published DRACO scores. Anthropic's Claude Opus 5 system card of 24 July 2026 (Figure 8.10.4.A) reports 88.6% for that model at its highest reasoning effort, graded by Claude Opus 4.6 as the mean of five runs, above every score in the table "Published DRACO scores as of September 2026". A.3 now names that source, Section 2.2 says the highest of the scores in that table, and the system card is in the bibliography.
- Appendix A.2, the Microsoft paragraph: the per-dimension gains (+3.33, +3.04, +2.58) were credited to Computerworld and had no baseline, so they read as a breakdown of the +7.0 over Perplexity Deep Research. They come from the Microsoft post and compare Critique with Microsoft's own single-model Researcher under the same GPT-5.2 judge; the sentence now says so.
- Appendix B.1, OpenAI's caching terms: OpenAI was given no cache-write charge (w = 1) and a reuse window of "up to 30 minutes". The cited page, re-read on 26 October 2026 because the September copy could not be retrieved, bills the cache-writing call at 1.25x the uncached input rate for GPT-5.6 and later, and 30 minutes is a minimum lifetime; the gpt-5.6-sol responses of 11 September already counted cache writes separately. OpenAI is now w = 1.25 like Anthropic, only Google is w = 1, and the window is "at least 30 minutes". The w = 1 figures in B.4 and in the cached row of the combined-reduction table therefore describe Google's terms; beta = 1.325 applies to OpenAI and Anthropic. The bibliography note is updated.
- Appendix B.1, Google's storage charge: given as $0.50 to $1.80 per million tokens per hour; that range covers the Flash and Flash-Lite models only. The Pro models are charged $4.50 ($8.10 at priority); both ranges are now given.
