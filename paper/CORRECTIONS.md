# Corrections to the paper

One entry per pass. Each line says what was wrong and what it is now.

## 24 October 2026

- Appendix B, note under the combined-reduction table: the overstatement was given as 2,625x, which the stated factors do not produce. (1+alpha) E R K beta T/n* is 5,670x without caching and 2,268x with it.
- Sections 7 and Appendix B: alpha and beta each meant two things (the setting-cost ratio and the significance level; the batching factor and the power quantile). The statistics now use a and pi, with one sentence saying why.
- Section 7.2: it pointed to Section 7 from inside Section 7 and said the normal approximation was "only a first approximation". It now points to the test subsection (7.1).
- Sections 5 and 7: single-author citations took plural verbs (Kohli use, Miller derive, Miller give).

Open, larger than a wording fix: the paper cites tests/simplifications.test.mjs and tests/power.test.mjs and a reference implementation that reproduces Tables 2 and the n* figures. Neither the tests nor that code are in this repository. Closed on 27 October 2026: see the entry of that date, "the reference implementation and its tests".

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

## 26 October 2026, 08:19 pass

Read this time: Sections 7.1, 8 and 9 and the conclusion, the experiment files against what the paper says about the runs, and a language sweep of the whole text. Each finding was checked by a second reader, then by hand.

- Section 9, first paragraph: the paired-difference interval of Section 7 was said to generalise over the task facet only. Each task's difference is averaged over that task's own regenerations and repeat scorings, so their variation is part of sigma and is in the interval (Equation 14; Appendix B.6, where going from R = 3 to R = 1 raises n* from 128 to 184). What the interval leaves out is the fixed panel's effect, and the fixed presentation orders and decoding setting, which is why it stays conditional on the judges. The sentence now says so.
- Section 8, Phase 2: every variant, including S6 and the combined one, was to be run on the identical task set of Phase 1, which those two cannot do because they run on only n* tasks. They now run on a pre-registered stratified sample of n* of Phase 1's tasks, drawn as S6 prescribes, so each task they score can be compared with the reference run.
- Appendix C.3, "Quantities counted" and the table "Every call of experiment E1": the second provider's reasoning tokens were said not to be itemised. Every Anthropic usage record in experiments/results/ carries output_tokens_details.thinking_tokens, part of output_tokens; the scripts never read it. The paragraph and caption now say so, and the table gives the ten values (263 to 914 at low effort, 1,717 to 3,093 at high). Alpha and the costs are unchanged, since they use output_tokens.
- Appendix C.1, E2 prompt caching: the shared prefix of the three caching calls was given as roughly 920 tokens, with about 920 fixed and 130 marginal tokens (rho 0.14). The three calls differ only in the answer; their recorded inputs (1,092, 1,050 and 1,154) less the answers (85, 43 and 147 tokens) leave about 1,005 shared tokens, about 20 below the 1,024 minimum; the rubric alone is about 920. The 920 and 130 came from the script's estimate, which treated the answers as equal in length. The text now gives about 1,005 fixed and 90 to 100 marginal tokens, rho about 0.1. The run manifest keeps the old figures as the run's own record.
- Numbers written as words in one place and numerals in another: the E2 rubric's "forty" criteria (Section 4 and Appendix C.1) against "40", DRACO's "ten" domains against "10", E2's "eleven calls" beside "25" and "20" calls in the matching E1 and E3 sentences, and "five times larger" beside "14x larger" in one sentence of S1. These now use numerals.
- Section 6: T_full was used before it was defined and G_full was never defined; only J_full was. Both are now defined where they first appear.

## 26 October 2026, 10:14 pass

Read this time from three angles: the abstract, introduction and section openings against the body after the recent corrections; every number in Sections 4 to 7 and Appendix B not recomputed before; and the bibliography and the claims attached to citations. Each finding was checked by a second reader, then by hand.

- Abstract: "the appendices instantiate the algebra on published runs" is not so: Appendix A records scores, judges and precision and applies no equation. It now says the appendices record the published runs and instantiate the algebra on current commercial terms, as the introduction already said.
- Abstract, second sentence: a faithful run was said to "multiply" six counts, which reads as the cost claim corrected in Section 4 on 25 October. It now says what multiplies: the number of judging calls, when each answer is judged in its own call.
- Introduction, first paragraph: the judge-scored methodology was said to "underlie" HELM and Chatbot Arena. HELM scores with automatic metrics (arXiv 2211.09110) and Arena with crowdsourced human votes (arXiv 2403.04132); only the judge-scored benchmarks built from such leaderboards rest on it. The sentence now says so.
- Introduction, second paragraph: the citation of van der Maden et al. opens a sentence and printed with a lower-case "van"; it is now \Citet.
- Section 3, closing paragraph: "their product" made the cost, contradicting Equation 6. It now says three of the choices multiply the whole cost and each of the other three multiplies one of its two terms.
- Section 4, opening: all eight parameters were called properties of the benchmark independent of any system, but g is a per-system cost (Section 9 treats it per system per setting). Only the first six are design properties; the last two are average costs per call.
- Section 4, prompt caching: the E2 prefix that missed one provider's minimum was described as "a 40-criterion rubric on its own". The prefix was the rubric with its task and question, about 1,005 tokens against a 1,024-token minimum (Appendix C.1).
- Section 4, after the batch-saving equation: the fixed-to-marginal ratio was said not to depend on any system. The marginal term is the cost of reading and scoring an answer, so the systems affect it through answer length; the sentence now says that.
- Section 5, S2: Ouyang et al.'s 48 to 76% was described as tasks with "no two identical outputs". Their measure is tasks with no test on which the programs from five requests at the default temperature all gave the same output; the sentence now says that.
- Section 5, S2: Madaan et al. were quoted as "encourage practitioners"; their abstract says their work "encourages practitioners". The quotation now matches the source.
- Section 5, S3: the third-party replication was said to report a standard deviation like DRACO's. The Microsoft post reports a standard error of its headline difference over five runs per question; the sentence now says so.
- Section 5, S4: listwise prompts were called "the format language models handle least reliably", citing Qin et al., whose quotation covers pointwise and listwise ranking together, in document ranking for search. It now says a format models handle unreliably, and names the setting.
- Section 6, after the cumulative equation: S6's saving was said to need a generation call to cost "several times a judging call" by S5. Recomputed, it needs a generation call to cost much more than the J times K judging calls made on its answer (15 in the worked instance); S5 is not the reason.
- Section 6, the overstatement sentence: the range of 7 to 11 and "below ten from s = 0.3" assume no cache-write premium (w = 1, Google's terms). At w = 1.25 (OpenAI and Anthropic, since the 06:14 correction to Appendix B.1) the range is 8 to 12 and it falls below ten only from s = 0.4 (recomputed: 12.20 to 12.34 at s = 0.1, 10.10 to 10.53 at s = 0.3, 9.05 to 9.62 at s = 0.4). Both are now given.
- Conclusion, second sentence: the task count was said to carry much of the saving, but on the paper's own power inputs n* is 128 or 184, so S6 saves only as far as that floor allows. The sentence now says so.
- Appendix A, opening: "All access dates are September 2026" was no longer true; the Claude Opus 5 system card was read and the Valyu post re-checked on 26 October 2026. Both are now named.
- Appendix A.2, the table "Published DRACO scores": the caption presented it as all published scores, but A.3 reports a higher published score (88.6%, Claude Opus 5) that is not in it. The caption now scopes it to the systems discussed in Section 2.
- Appendix A.2, the same table, Valyu row: "date not stated" is wrong; the post is dated 5 May 2026. What it leaves out is the run date, and the cell now says that. Its bibliography note now gives the publication date and byline.
- Appendix B, opening: the instance was called "dated, sourced values", but alpha = 20, rho = 0.2, the floor n* = 60 and the pilot's sigma are chosen for illustration. The sentence now separates the sourced commercial terms from the illustrative values.
- Appendix B.1: OpenAI's cache-write charge and 30-minute minimum come from the 26 October reading, not the 11 September one; the sentence now says so.
- Appendix B.4, closing sentence: the cache-write overhead was given as a factor of 1.2, true only at w = 1. It is now 1.2 to 1.325, a sixth to a quarter of the judging cost.
- Appendix C, opening: "three premises ... were measured" undercounts what the three experiments measured (caching, rho, test-retest, order sensitivity, alpha and the effort setting). It now says several premises, measured by three experiments.
- Appendix C.2, E1 set-up: each model was said to be queried "at each of its documented reasoning-effort settings"; Anthropic's effort page documents five levels for Claude Opus 5 and E1 used two. It now says some of them.
- Bibliography: three arXiv entries named the wrong version for the date they give (Atil et al. v5, Zhang et al. v3, Wu et al. v3, each checked against the arXiv submission history); Yang et al. has exactly three authors and lost a stray "and others"; two Anthropic documentation URLs pointed at a redirecting /docs/en/docs/ path and now point at the page itself; one access note is capitalised like the rest; the header comment named a CLAIMS-AUDIT.md that is not in the repository and now says where later checks are recorded.

- Section 2.2, consumer parallel-chat products: they were said to publish "a benchmark score of any kind" not at all. The cited product's home page advertises "60% Reduced factual errors" and a "2x Higher depth score", and its benchmarks page (read 26 October 2026) says "We do not run our own internal benchmarks. We aggregate published scores". The sentence now says they publish no benchmark score of their own and what the page does publish; the bibliography note names both pages.

## 26 October 2026, 12:20 pass

Read this time from three angles: Sections 2 and 3 against every source they cite; Appendix C against the experiment scripts, RUNS.json, MANIFEST.tex and the raw result files, every figure recomputed; and Sections 5 to 9 for internal consistency, with the four items left open at the 25 October 22:27 pass. Each finding was checked by a second reader, then by hand; nine were dropped as already right or a matter of style.

- Section 2.1: the Microsoft post was called the only public precision anchor, but DRACO itself reports a standard deviation over five grading runs (Table 1, S3). The sentence now says DRACO reports only that, and the post is the only other precision figure.
- Sections 2.1, 2.2, 5 (S3) and Appendix A.3: the Microsoft post was called a "replication". It scored only Microsoft's own two systems and took every other figure from the DRACO paper ("All results are sourced from the original paper ... except for Researcher with Critique"). All five places now call it a run of the benchmark.
- Section 2.1: the quoted "anonymized, open-ended and complex, objectively evaluable" attached to the domains; DRACO says it of the tasks. The quotation is unchanged and now attaches to the tasks.
- Section 2.1: "the authors edited and augmented" each request. DRACO's pipeline had a language model rewrite each one to remove personal details and reduce ambiguity, with no human seeing the raw queries, and added context partly to keep the evaluation criteria consistent. The sentence now says so.
- Section 2.2: "four kinds of system have reported DRACO scores" left out single models, which DRACO, OpenRouter and Anthropic's Claude Opus 5 system card also score (Appendix A.3). The sentence now sets single models aside explicitly.
- Section 2.2: the lead-in "combining several models' outputs" did not fit its first example, self-consistency, which samples one model. It now says several answers, from one model or several. The debate gain is now "reported", since two sentences later Zhang et al. find debate often fails to beat single-agent baselines.
- Section 2.2: DRACO's arXiv class in the bibliography was cs.CL; arXiv lists it as cs.LG.
- Section 3: "curated benchmarks" was used for the weakness DRACO's sourcing fixes, though Section 2.1 calls DRACO's own set curated. It now says benchmarks built by composing tasks.
- Section 3: "the effect is general", citing one TriviaQA study whose authors call their setup "fairly sterile". The sentence now says what that study of 13 judges found: scores that differ by judge while rankings mostly agree.
- Section 3: "a single run multiplies" six counts, the wording the 10:14 pass corrected in the abstract. It now says the number of judging calls, when each answer is judged in its own call, is their product.
- Abstract and Section 6: "roughly two orders of magnitude" for the worked instance did not say it rests on the assumed floor of 60. Both now say so, and that the floor of 184 from the instance's own power inputs cuts every figure to a third (46 to 74 times, as Appendix B already says).
- Section 4: J alone is the judge count while J with a subscript is a judging cost, in the same equation. One parenthesis now says so.
- Section 5, S1: alpha "between 1.75 and 3.2" did not name the comparison; Table 4 also has 1.12 for low against none. It now says highest setting against a lower one.
- Section 5, S3: judge repeats were "usually" cheap relative to generation "by the argument of S5", but S5 gives a condition, not a usual case (the 20:14 pass removed the same claim from Section 6). It now states the condition. McDonald's omega is now written in words, since omega squared is the between-task variance of Equation 14.
- Section 5, S5: a generation call has to cost several times a "judging call", which Section 4 defines as unbatched; the condition uses the batched price. It now says a batched judging call.
- Section 5, S6: sigma was used before Section 7.2 defines it, and below n* the benchmark "can no longer detect" the effect "at the stated confidence level". It now defines sigma where first used and says the benchmark no longer has the stated power at the stated significance level.
- Section 7.3: the opening said S4 puts blind scoring and calibration in tension, but the same paragraph says blinding works with either format. It now says S4 leaves blinding intact and trades calibration context against independent scoring.
- Section 7.4: "each judge's score on each dimension" is not the finest grain (a dimension score averages binary criteria) and left out the setting facet. It now asks for each verdict on each criterion, for each repeat, regeneration and setting.
- Section 8, Phase 2: one n* was given for variants with different R. It now says n* is computed at each variant's own R (128 at R = 3, 184 at R = 1 on the paper's inputs).
- Section 9: "asks for each to be estimated on a pilot subset" covered the judge facet, but S5 recommends keeping several judges rather than piloting their removal. It now says so.
- Appendix C, opening: MANIFEST.pdf was said to list each run's caveats; it has no such field. The caveats are in RUNS.json, which the sentence now names.
- Appendix C.1, E2: the judge was never named, so E2 could not be reproduced from the text. It is OpenAI's gpt-5.6-sol at its lowest setting (e2-judge-cache.mjs, RUNS.json).
- Appendix C.2, E1 result: the 20:15 pass set the high-setting mean latency to 125 from the call table's rounded figures; the raw timings give 125.52 s, so 126.
- Appendix C.2, E1 interpretation: the effort settings were said to change cost "by a factor of two to three" for "the same two providers". The measured ratios are 1.74, 2.80 and 3.14 (costUsd summed per setting) and the published 23x is one provider's. Both now say so. The task-family claim now rests on E3's within-model comparison (1.48 and 2.67 on competition problems against 2.83 and 1.75 here), not on the gap to the published 23x, which differs in every design dimension.
- Appendix C.3: caching was ruled out "because each prompt was sent once per setting", but the same prompt went to each model at every setting and the retries sent it again. What rules it out is length (125 to 199 input tokens, all usage records reporting zero cached). The 23x is now called a ratio of two totals, not a consumption, and the table's task cell points at the 2025 suite listed in Section C.4, since the cited methodology page now describes a different suite.
- Appendix C.4: the first model's visible answers were "thousands of tokens"; they are about 930 to 1,390 (the second model's 2,970 to 4,040). A per-answer reasoning range of 1,024 to 4,068 was set against a mean output of 3,650; the mean reasoning is about 2,520. "Nearly all" of high-setting output being reasoning is now "most", with E3's 72% and 60%. "The provider that published the suite" now names Artificial Analysis. The effort documentation gives no ratio, so it cannot "predict" 1.75x; the sentence now gives what the records show (thinking up 5.4-fold, visible output 1.23-fold).
- Appendix C.5, E3: "\$0.38 across 20 calls" now says 20 successful calls, as E1 does; 19 calls failed before succeeding.
- Appendix C.3: the long field name output_tokens_details.thinking_tokens ran 71 points into the margin; it now breaks at its dots.

The four items logged at 22:27 on 25 October: n* = 60 against 128 is handled (Appendix B and now the abstract and Section 6); DRACO's Table 15, Zhao et al.'s scope and "the pilot of Section 8" were resolved in the 26 October 00:14 pass above.

## 26 October 2026, 14:21 pass

Read this time from three angles: Section 4 and Appendix B equation by equation, with every price term re-read on the providers' pages; the introduction and Appendix A against their sources; and every table and caption against its text, with a language pass over the whole paper. Each finding was checked by a second reader, then by hand; five were dropped as already right or style.

- Abstract, first sentence: debate was listed beside DRACO and judge-based evaluation as a tradition of benchmarks; Du et al. and Liang et al. describe debate as a way of producing answers. It is now among the systems such benchmarks score.
- Introduction, first paragraph: the reliability literature was said to supply "what each simplification costs"; it covers the judging-side ones, and the work on test-time compute, nondeterminism and benchmark compression cited in Section 5 covers the rest. It now says so.
- Section 3, closing paragraph: after the 12:20 change the paragraph counts calls for a run that judges each answer in its own call, where four counts (systems, tasks, regenerations, settings) multiply the whole cost and two multiply the judging term; it still cited the batched total, where three do. Both are now stated with their equations.
- Section 4, parameter K: "test-retest" now matches the paper's "test--retest" elsewhere.
- Section 5, S6: the closing clause repeated "once several rounds of retained raw data exist" from two sentences earlier; removed.
- Sections 2.2 and 7.1 to 7.4: five subsection headings in title case among twenty in sentence case; now sentence case.
- Section 7.3: "the remedy those authors propose" followed a sentence naming three sets of authors; it now names Wang et al., whose paper proposes balanced position calibration.
- Section 9: "the interval reported here" had no referent (the paper reports no interval of its own); it now points to Section 7's.
- Conclusion: "roughly two orders of magnitude" for the worked instance now carries the same floor caveat as the abstract and Section 6.
- Title block: the date now says the paper was revised on 26 October 2026, since it reports sources read on 25 and 26 October.
- Appendix A.1: the company's blog post on DRACO was said not to be retrievable; read on 26 October it is dated 4 February 2026, reports four systems, and its figures for the company's product are those of the Opus 4.5 version in the paper's Tables 12 and 10, not of the Opus 4.6 version the appendix reports. Now stated; the paper's tables stay the cited source.
- Appendix A.2, table "Published DRACO scores": the Microsoft row's 57.4 was the only score without a percent sign; the caption listed four of the OpenRouter post's seven solo scores and left out the budget panel's own members, which Section 2.2's comparison needs. The caption now gives Kimi K2.6 at 53.7% and Gemini 3 Flash at 43.1%, and notes Fable 5's score is over the 93 tasks it completed.
- Appendix A.2, OpenRouter paragraph: the post graded each response three times, where the DRACO paper used five; now stated.
- Appendix B.1: OpenAI's newest model reads cache at 0.05x, Anthropic's Opus 5.5 and Sonnet 5.5 at 0.05x, and Google's flagship Gemini 4 Argon at 0.05x (pages read 26 October 2026); each was given only the general rate. The opening "at the time of writing (September 2026)" now says which provider was re-read in October.
- Appendix B.2: alpha "between 1.75 and 3.2" left out Table 4's 1.12 for low against none (the same fix as S1 at 12:20); it now names the comparison.
- Appendix B.5 and the table of combined reductions: F_J = 108 holds only with no cache-write premium (w = 1, Google's terms). At OpenAI's and Anthropic's w = 1.25 it is about 119 and the cached row becomes about 179, 161 and 146 times; the text gives both and the row label says w = 1.
- Appendix C.1, E2 order sensitivity: "moved them within one judge" referred back to published DRACO scores; it now says scores. The swap of the top two answers was stated twice in the paragraph; the repeat is gone.
- Appendix C.2 and C.3, E1: "six calls failed" counted cells, not calls; the run logs show ten failed calls in six cells. The call table's caption now says it lists every successful call, and the alpha table's column holding "first provider" is headed Provider, not Model. "Model identifiers and prices are the providers' list prices" now says they are as the providers listed them.
- Appendix C.4: "none of them is a contradiction" now says each explanation would let both figures stand.
- Appendix C.5, E3: "six calls ... (three attempts each)" now counts the calls for six cells; the table caption names the low and high settings (E3 did not run none) and defines Out as summed over the five problems.
- Bibliography, llmstatsdraco: the note gave three entries on 10 September, against Appendix A.3's one on 10 and three on 11 September; it now matches.

## 26 October 2026, 16:22 pass

Read this time from three angles not used before: the statistics of Section 7 and Appendix B's task floor, with every power figure recomputed (normal approximation, python); Section 6's combination of the savings against Section 5's factors; and Sections 8 to 10 against the body, with their bibliography entries checked against the sources. Each finding was checked by a second reader trying to refute it; 19 of 21 survived (one repeated another, one was already said in four places).

- Section 6, opening paragraph: S1's factor (1+alpha) is now named as the E = 2 case of Equation 7, which is where the general form is given.
- Section 6, same paragraph: a single product of all factors was said to credit the whole budget with a saving "only its judging share" can deliver; it also credits the judging share with S1's (1+alpha), which only the generation share can deliver. Both directions are now stated.
- Section 6, the weighted-harmonic-mean sentence: the form given holds when S1 keeps the cheap setting; when it keeps the expensive one the second term is s(1+alpha)/alpha, as lines 402-403 already allow. Now stated.
- Section 7.1: the sign-flip test's null hypothesis was "exchangeable signs"; the test needs each task's difference to be symmetric about zero, which is what exchangeable labels within a task give. Corrected.
- Section 7.1: n in d_z = t/sqrt(n) was used before it was defined (the paper counts tasks as T, and n* comes later); now "over n tasks".
- Section 7.1: d_z was said to be "often confused with" d_av; the cited source (Lakens 2013) says d_av ignores the correlation but not that the two are confused. The unsupported clause is gone.
- Section 7.2: delta was "the minimum effect size worth detecting", but Section 7.1 had just used effect size for the standardised d_z, while Equation 13 and Appendix B (delta = 5 points) need a raw score difference, as in Miller (2024). Now a difference in mean score, in score points, with delta/sigma as the matching d_z.
- Section 7.2: Miller's stopping rule for regenerations is stated in the source for one model's score (Section 3.1); the paper applied it to the paired difference without saying so. Now said.
- Section 8, Phase 2: the stratified sample of n* tasks did not say at which R n* is computed, or what happens when n* exceeds the task set (184 against 180 for the combined variant on Appendix B's inputs). Both are now stated.
- Section 8, Phase 2: "the same statistic, Kendall's tau" was attributed to both cited works; SubLIME reports Spearman's rank correlation (the word Kendall does not appear in it). Each work is now matched to its statistic.
- Section 8, Phase 3: the table of cost against fidelity was said to let a user select any combination; Phase 2 measures each simplification alone and all together, not the combinations between, so a different combination must itself be run against the Phase 1 reference. Now stated.
- Section 9, nested measurement: averaging was said to "remove real variance" at each step, while the same paragraph (and Equation 14) keeps the regeneration and repeat variance inside sigma^2, divided by R. Averaging shrinks that variance and leaves out only the variance due to the choice of judges. Corrected.
- Section 9, generalisability: "a fully crossed pilot" cannot hold, because a regeneration belongs to one system's answer to one task and a repeat to one judge's scoring of one answer; now a pilot in which every facet varies.
- Section 9, mixed model: regenerations and repeats were both "nested within" task and judge; regenerations are nested within task and system and crossed with judge, repeats within judge and answer. Corrected.
- Section 9: the interval is conditional on any presentation orders that were not randomised; Section 7.3 recommends randomising them, and randomised orders are generalised over. Corrected.
- Conclusion, first sentence: "three of its six design choices multiply the whole cost" holds for batched judging; DRACO judges each answer in its own call, where four do (Section 3, as corrected at 14:21). Both are now given.
- Conclusion, second sentence: the sweep carries the saving only when the cheap setting is kept (S1), and fewer regenerations raise n* (S2, S6); both qualifications now appear.
- Appendix B.6, after the worked factors: "T_full/n* is at most 1" hid that the floor of 184 exceeds the 180 tasks available, so at R = 1 even the full task set reaches a power of only 0.79 (recomputed: Phi(5 x sqrt(180)/sqrt(521) - 2.128) = 0.791). Now stated.
- Appendix C.3, the consequence for the worked instance: "the measured values" pointed to the cost ratios (1.74 to 3.14) while the factors that follow (F_G of 25 to 38) use the token ratios of Table "alpha" (1.75 to 3.18); it now names the token ratios and the table.

## 26 October 2026, 18:22 pass

Read this time from three angles not used before: the title, abstract and contribution list against the body as it now stands; notation and cross-references across the whole paper, with a scratch build; and every bibliography entry cited in Sections 1 to 5 and Appendix A, against its source. Each finding was checked by a second reader trying to refute it; 19 of 24 survived. Two the second reader set aside as the author's own choices and they are left as they are: the title ("AI Models" against "AI Systems") and the author macro in the abstract's last sentence.

- Abstract, the worked-instance sentence; Section 6, closing paragraph; Conclusion; Appendix B.5, first sentence: the "roughly two orders of magnitude" holds only when S1 keeps the cheap setting (F_G = 21 x 3 x 3 = 189 is the 1 + alpha form). With the expensive setting kept F_G is 1.05 x 3 x 3 = 9.45 and Equation 12 gives 10 to 18 times. All four places now say which setting is kept; Section 6 gives the other figure.
- Section 5, S5, opening: "usually not by much" stated a usual case where the next sentences give a condition; now "not by much when generation dominates the budget", as the 20:14 and 12:20 passes did for Section 6 and S3.
- Section 6, the overstatement sentence: the measured ratios behind "7 to 11" are those between the highest setting and a lower one (1.75 to 3.18); at the 1.12 of low against none the sentence's "falling below ten once s reaches 0.4" fails at s = 0.3 (recomputed 9.91). Now limited as S1 and Appendix B.2 already are.
- Conclusion, first sentence: after the 16:22 insertion the last clause sat inside the "because" list; it is now its own sentence.
- Section 9: "the minimum effect size delta" now matches Section 7.2's definition of delta as a difference in mean score, not a standardised effect size.
- Section 7.1: d_av's subscript now set in roman like the paper's other word subscripts.
- Appendix B.1: the access-date line said only OpenAI's page was read on 26 October; Anthropic's and Google's rates in the same subsection are dated that day too. Both sentences now say so.
- Appendix A, opening: the list of later access dates left out Perplexity's DRACO blog post, which A.1 reports as read on 26 October; added.
- Appendix B and C: five subsection headings with mathematics made the PDF's bookmarks fail (twelve "Token not allowed in a PDF string" warnings); each heading now carries a plain-text form for the bookmark. The build has no warnings left.
- Section 2.1: "objective evaluability" was in quotation marks, but the DRACO paper (arXiv 2602.11685v1) does not use that phrase; the sentence now describes the selection without quoting it.
- Section 5, S1: the measurement service was said to report "per-task token usage for every model it evaluates"; its methodology page says only that it reports the token counts and cost of running its suite. Corrected.
- Section 5, S1: Kim et al. ask medical studies of language models to report the effort setting, its rationale and whether it was the vendor default, because differing settings can confound comparisons between models; the sentence had dropped the scope. Restored.
- Bibliography, perplexity2026explainer: now gives the post's date (4 February 2026), its byline and the 26 October access, and says the per-system scores come from the DRACO paper's Table 8.
- Bibliography, the 12 June 2026 article: the byline and the 13 July update added, as the page shows them.
- Bibliography, llmstatsdraco: the access line now says both days (10 and 11 September), matching Appendix A.3.

## 26 October 2026, 20:14 pass

Read this time from three angles not used before: every number that appears in more than one place, checked for agreement; points the paper makes twice; and Appendix C against the experiment scripts and raw result files. Each finding was checked by a second reader trying to refute it; 18 of the 28 distinct findings survived (one was found from two angles). The ten set aside were correct as written (Appendix B.3's T = 60 is stated where it is used, for example) or the author's own choices of paragraphing and emphasis.

- Appendix B.2: the measurement service was still said to publish "per-task token usage for each model it evaluates", the wording the 18:22 pass corrected in S1 but not here. Now matches S1.
- Appendix B.2: the published 23x is a ratio of output tokens; called "a measured alpha", it overstated alpha, which S1 defines on costs. Its long-context benchmark sends about 100,000 input tokens per question at both settings, which pulls the cost ratio below the token ratio. Now stated as an upper bound, with the reason.
- Appendix C.2, Interpretation: the published token ratio was set against E1's cost ratios (1.74 to 3.14) in a sentence whose own parenthesis uses token ratios. Now gives the token ratios (1.75 to 3.18) with the cost ratios beside them.
- Appendix C.2, Result: 2.8 and 3.2 in the first sentences are 2.83 and 3.18 everywhere else, including six lines later in the same paragraph (recomputed: 18,286 / 6,461 = 2.83; 18,286 / 5,749 = 3.18).
- Section 5, S1; Appendix B.2; Appendix C.4: the range "1.75 to 3.2" rounded its two ends differently; now "1.75 to 3.18", as in Section 6 and Appendix C.2.
- Appendix C.1, E2 test-retest: the raw records hold six identical scorings of the answer, not five: the first caching call sent the same prompt and scored it 53, inside the reported range. Added, with the mean (51.0) and deviation (5.5) over all six.
- Appendix C.1, order sensitivity: "the strongest answer" now "the answer written to be strongest", since the scores themselves do not rank it first; the sentence now also gives its scores when read alone.
- Appendix C.2, Interpretation: the E3 comparison put the two models' figures side by side without saying which was which; each is now set against its own E1 ratio, and the second model's E3 figure is said to rest on one problem.
- Appendix C.4, task family: the E3 shares are now set beside the E1 shares (69% and 39%).
- Appendix C.2, Result: the mean answer lengths (3,600 and 6,300 tokens) include thinking; now said.
- Appendix C.2, Set-up: "one from each of the two largest providers" is a ranking the paper does not support; now "one from OpenAI and one from Anthropic" (the result file's models are gpt-5.6-sol and claude-opus-5).
- Appendix C.3, comparison table: the instruction row put in quotation marks words that are not in the instruction, which the same subsection quotes in full; now describes it without quoting.
- Bibliography, anthropic2026caching, openai2026caching, google2026pricing: Appendix B.1 says all three pages were re-read on 11 September and 26 October and cites them for rates dated 26 October; the notes now record both re-reads and the rate each was cited for.

The build has one LaTeX note, "'h' float specifier changed to 'ht'", which the 18:22 build also had; no warnings otherwise, no undefined references.

## 26 October 2026, 22:14 pass

Read this time from three angles not used before: every equation and worked number in Sections 4, 6 and 7 and Appendix B recomputed by hand from the inputs stated at that point; every table and figure caption against what it shows and how the text cites it; and terminology and first use (abbreviations, symbols, one name per thing, sentences a reader has to read twice). Each finding was checked by a second reader trying to refute it; 20 of 36 survived. Two were found from two angles each (the 3.18 figure and the definition of g_e) and went in once, and one could not be applied safely because its text occurs twice and was left, which leaves 17 corrections. The 16 set aside were right as written or the author's choice of phrasing.

- Section 6, the overstatement sentence: every figure after the colon (13 to 29, 7 to 11, 8 to 12, and the two points where it falls below ten) comes from the cheap-setting form; with the expensive setting kept the range and both thresholds differ (recomputed: 6.5 to 27 for the worked instance). The sentence now says "with the cheap setting kept".
- Section 5, S1: Equation 7 and Section 6 used g_e and g_min without defining them; both are now defined before the equation.
- Appendix C.4, arithmetic of the ratio: 3.2 is 3.18 everywhere else (18,286 / 5,749 = 3.181); the 20:14 pass missed this one. In the same sentence, the high-setting mean rounds to about 3,660 at the sentence's own precision, not 3,650.
- Appendix C.3, caption of "Every successful call of experiment E1": In, Out and Reasoning are now said to be token counts, the two providers' fields are named by model rather than "the first" and "the second", and the caption now says what the "retry n" marks in the Stop column count.
- Appendix A.2, caption of "Published DRACO scores": "the budget panel's other two members" named only two of its three members; DeepSeek V4 Pro is now named as the third.
- Appendix C.2, interpretation: the range 1.75 to 3.18 is of the highest setting against a lower one; the table cited also holds 1.12 (low against none). The qualifier earlier passes added in S1, B.2 and Section 6 is now here too.
- Appendix B.5, caption of "Combined reduction from S1--S4 and S6": the cached figure of 2,268 holds at w = 1; the caption now says so and gives 2,504 at w = 1.25.
- Appendix C.3, analysis: alpha is defined on cost in S1; here it is now said to be estimated by the token ratio, not defined by it.
- Section 5, S1: "DRACO's setting" read as DRACO's effort level in a paragraph about effort settings; now "the conditions of DRACO's tasks". A 139-word sentence chaining seven results is split into three, so its last "it" no longer reaches back a hundred words.
- Section 5, S6: the power floor's target is now "the difference in mean score", as delta is defined everywhere else since the 16:22 pass.
- Section 1: HELM is now named where the paper is first cited, since S6 later refers to results "on HELM".
- Section 6, after Equation 10: a 25-word "which" clause that interrupted the sentence is now its own sentence.
- Section 5, S5: "LLM-as-judge" was the only use of the abbreviation in the paper's own words; now "evaluation with language-model judges".
- Section 5, S3 heading: "repeat-scorings" now "repeat scorings"; the hyphen belongs only in the adjective form.

The build has the same one float-placement note as before; no warnings otherwise, no undefined references.

## 27 October 2026, 00:14 pass

Read this time from three angles not used before: every quotation checked word for word against its source, and against the run logs where the paper quotes a provider; every bibliography entry cited from Section 7 onwards and in the appendices checked against the publisher's or arXiv's own record; and every statistical method and every attribution in Sections 7 and 8 checked against what the cited authors actually say and what the published runner actually computes. Each finding was checked by a second reader trying to refute it; 17 of 21 survived and all 17 went in. The 4 set aside were right as written or the author's choice of phrasing (among them "conclude" for Schroeder and Wood-Doughty, which their abstract and conclusions do support).

- Appendix C.3, procedure: ``server error'' was in quotation marks, but no run log holds those words; the provider returned the error type server_error, now written as that field value.
- Section 5, S6: Perlitz et al. say evaluation compute is "often" reduced by x100 or more; the qualifier is restored around the unchanged quotation.
- Appendix C.4, task family: Ballon et al. offer "new generations of reasoning models use test-time compute more effectively" as an inference from a smaller accuracy drop in stronger models, not as a finding; the sentence now separates the two.
- Bibliography, wang2023unfair: the arXiv preprint was published at ACL 2024 (with an eleventh author, Lingpeng Kong); the published version is now named with its pages and link.
- Bibliography, lee2025critical: the paper appeared in the IJCNLP-AACL 2025 proceedings; the entry is now that publication, not an arXiv preprint.
- Bibliography, ballon2026thinksharder: volume, article number and DOI added from the journal's record.
- Bibliography, du2025ockbench: "revised 3 June 2026" is now "v3, 3 June 2026", as arXiv lists it.
- Appendix B.1 and bibliography openai2026caching: OpenAI's cached-input rate of 0.05 times applies to GPT-6.1 Terra as well as GPT-6.1 Sol; both are now named.
- Section 7.1: the paired difference now says what a system's score on a task is (median of each judge's K scorings, median over the J judges, mean over the R regenerations), as the published runner computes it.
- Section 7.1, sign-flip test: at the paper's task counts the 2^n sign patterns cannot all be enumerated; the text now says the p-value is estimated from a random sample (100,000 in the runner) and stays exact only when the observed pattern is counted with the sample.
- Section 7.1, effect size: the confidence interval for the mean paired difference is now said to come from inverting the same sign-flip test, so it rests on the same symmetry assumption.
- Section 7.2, after Equation 14: S3 also raises n*, because fewer repeat scorings raise the within-task variances; the sentence named only S2.
- Section 7.3: Zheng et al. report verbosity bias but say their data cannot settle whether their judges show self-enhancement bias; the sentence now says so and cites a study that does find it (Philipp et al., evaluators that "preferentially scored architectural siblings").
- Section 7.3: balanced position calibration is one of three remedies Wang et al. propose, not "the remedy".
- Section 8, Phase 2: a variant's n* is computed at its own K as well as its own R, and the combined variant's 184 against 180 comes from its R = 1 alone, rising once its K = 1 is counted.
- Section 8, Phase 2, below-power rule: any variant whose n* exceeds the tasks it runs on is reported as below the stated power, S2 alone among them (184 on the same inputs), not only the combined variant.

The build has the same one float-placement note as before; no warnings otherwise, no undefined references.

## 27 October 2026, 02:14 pass

Read this time from three angles not used before: the experiment scripts themselves (experiments/*.mjs, RUNS.json, MANIFEST.tex) read against what the paper says the experiments did; the strength of each claim against the evidence the paper gives for it, and sections that say incompatible things in words; and typography and consistency at the LaTeX level. Each finding was checked by a second reader trying to refute it; 43 of 49 survived. Two pairs reached the same sentences from two angles (E2's order paragraph and its echo in Section 7.3) and went in once each, which leaves 41 corrections. The 6 set aside were right as written, unproven, or a style choice.

The experiment code against the method (E2 and E3):
- Appendix C.1, E2: rho was computed from input tokens only (about 0.1). Equation (s4) defines it on cost, and each scored answer also produced about 230 to 270 output tokens of verdicts at six times the input rate, so on these calls rho is between about 1.5 and 1.7. The 0.2 used in Appendix B stays, as it is labelled illustrative.
- Appendix C.1, E2 order paragraph, and Section 7.3: "order alone moved an absolute score by up to 17 points" claimed a cause the design cannot isolate. Each ordering was scored once, and five unchanged repeats of one prompt also spanned 17 points; both places now say so.
- Appendix C.1, E2 test-retest: the scores are the judge's own final score lines, which in three of five calls do not equal the share of criteria it marked met (21 of 40 scored 50, 18 of 40 scored 43); the verdicts themselves span 15 points. Now stated.
- Appendix C.1, E2 set-up: the rubric was generated in the script from ten generic criteria with four qualifiers each, not written for the task, so "in the DRACO style" overstated it; the candidate answers were generic too, and the strongest assumed a self-reported outcome where the task has account-level data; the judge was told to give only verdicts and a score line, with no reasoning first, unlike DRACO's judges.
- Appendix C.1, E2 spend: $0.19 prices every input token at the full rate, as the script does; at the cached-read rate on the five calls that read 1,089 cached tokens it is about $0.16.
- Section 4: "repeated calls were measured reading the cache" now says "with an identical prompt", since only the five identical calls read it.
- Appendix C.5, E3: on the problem where high used fewer tokens in all (358 against 370), its thinking rose from 9 to 218 tokens; the sentence now says so, as C.4 already counts E3's thinking tokens.

Claims against evidence:
- Section 6 and the conclusion: DRACO judges one criterion per call, not each answer in one call; both now say each answer is judged separately, without batching.
- Appendix C.5: the claim that GPT-5's effort levels "behaved as coarse switches" had no source and E3 used later models; now "may have behaved", with that caveat.
- Section 5, S1: alpha's dependence on the model and the task family is measured, its dependence on how a provider implements effort is one candidate explanation; the sentence now separates the two and points to C.4.
- Section 5, S5: "reducing J saves little in absolute terms" now holds where generation dominates, as the two sentences before it already say.
- Section 8, Phase 2: rank agreement is one criterion the compression literature uses, not the criterion (tinyBenchmarks measures estimation accuracy).
- Appendix C.4: a setting that behaves this way "is unlikely to", not "cannot", produce a 23x ratio; the documentation quoted puts no bound on it.
- Section 4: a rubric with its task and question "can fall on either side of" the minimum prefix lengths, not "will usually exceed" them (by a rough count of DRACO's 100 tasks, characters divided by four, about 85% clear OpenAI's 1,024 tokens and none clears the 4,096 some Anthropic models need).
- Section 3: "no sample-size or statistical-power methodology has been published for DRACO" is now "we found no ...", as Section 2.1 already words it.
- Section 5, S4: G-Eval is described as its authors report it, well ahead of earlier methods, not as "the best-known judge protocol".

Typography and consistency:
- Section 3: a sentence ending on "DRACO." gets the end-of-sentence space (\@).
- Section 5, S3: a reference range broke across a line; now tied as elsewhere.
- Section 1: "Sections ... to ..." made a range like the two others in the paper.
- Section 6 and Appendix B: "ten" and "three" written as numerals beside the other figures in the same sentences.
- Appendix C.3: the two output caps written as code literals beside the other request values.
- Section 7.2: sigma^2_{A,B}, never defined and easily read as a covariance, is now sigma_A^2 and sigma_B^2 as defined.
- Section 7.2: "paired-sample size formula" now "sample-size formula for paired samples".
- Appendix C.3: the two time ranges of the E1 runs written the same way.
- Appendix C.2: the per-prompt ranges given to two decimals (1.52 to 3.99, 1.48 to 2.00), as in the table and the pooled figures beside them.
- Appendix C.5: AIME introduced where its full name is given.
- Bibliography: Chatbot Arena, Arena-Hard, MT-Bench, "Towards" and OpenRouter's Fusion protected from lower-casing; Ballon et al.'s versions written as "v1, ...; v2, ..."; tinyBenchmarks' ICML proceedings given their year, as the other ICML entries are; Zhao et al.'s COLM 2026 named the Third Conference on Language Modeling, as the other COLM entries are.

The build has the same one float-placement note as before; no warnings otherwise, no undefined references.

## 27 October 2026, 04:14 pass

Read this time from three angles not used before: everything the paper tells a reader to run, open or find, read against the repository (paths, scripts, what the runner computes and keeps); every URL, DOI, arXiv id and access date, each opened; and every date, version and "at the time of writing", checked against its source and the git history. Each finding was checked by a second reader trying to refute it: 21 of 23 survived, three of them the same fix; two were refuted (the Hugging Face "datasets API" wording, which names the right service loosely, and Wu et al.'s year, which is ICLR 2025 as the entry says).

The paper against the published runner:
- Section 7.1: the add-one rule for the Monte Carlo p-value sat beside the runner's 100,000 draws, so a reader would assume the runner applies it. It does not (src/permutation-test.mjs returns the count over the draws); the sentence now says so, and that its p-value can then be zero.
- Section 7.1: the confidence interval found by inverting the test is not computed by the runner, which reports the mean difference, d_z and the p-value; now stated.
- Section 7.4: the runner keeps each judge's score and the numbers of criteria met and unmet, not the verdict on each criterion the section asks to keep; now stated.
- Appendix C: RUNS.json and MANIFEST.pdf were pointed to without saying that some of their headline figures (E2's prefix and prompt lengths, rho and ranking; E3's eight retried cells and $0.39) were later corrected against the result files; the appendix now says they are the runs' own record and that its figures replace them.

Links, identifiers and access dates:
- Title block: revised 27 October 2026, not 26 October; two passes changed the text on 27 October.
- Bibliography, AllChat: the benchmarks address is now a link (\url), like every other address in a note.
- Bibliography, van der Maden et al.: the CHI 2026 publication and its DOI (10.1145/3772318.3791069), as the arXiv page links it.
- Bibliography, Ouyang et al.: the TOSEM 34(2) 2025 publication and its DOI (10.1145/3697010), as the arXiv page links it.
- Bibliography, Cheng et al. (batch prompting): pages 792 to 810 and the DOI from the ACL Anthology, as the other Anthology entries carry.
- Bibliography, Liang et al.: the DOI from the ACL Anthology.
- Bibliography, the Microsoft DRACO post: the blog is "Microsoft Copilot Blog", as the page names it, not "Microsoft 365 Copilot Blog".
- Bibliography, Computerworld, Thinking Machines, Not Diamond and Martian: the four web sources without an access date now carry one (10 September 2026, the date this file's header records; Thinking Machines also its 25 October re-read).
- Bibliography header: entries were re-verified on 10 or 11 September 2026, not all on the 10th (Anthropic's effort page says 11 September).

Dates and versions:
- Appendix C.3 table: the Intelligence Index had eight evaluations in August 2025 (version 2.2), not through 2025; version 3.0 from 2 September had ten (Artificial Analysis methodology page, version history).
- Appendix B.1: OpenAI's caching terms apply to GPT-5.6 and later, as its page says, not to "its current model generation", which could be read as excluding gpt-5.6-sol, the model E1 and E2 used.
- Section 4: the caching terms are those in force when the providers' pages were read, on 11 September and 26 October 2026, not "at the time of writing".

For the runner's next version (the paper now describes it as it is; the tool should match the method): add one to the count and the draws in the Monte Carlo p-value; compute the confidence interval by inverting the test; keep each judge's verdict on each criterion in the raw table.

The build has the same one float-placement note as before; no warnings otherwise, no undefined references.

## 27 October 2026, 06:14 pass

Read this time from three angles not used before: every mathematical symbol and its meaning across the paper; every pointer inside the paper (each \ref and each "see above" in words) against what it points to; and sentences a careful reader has to read twice (an unclear "this" or "it", a comparison missing its second term, two claims packed into one sentence). Each finding was checked by a second reader trying to refute it: 29 of 40 survived, two of them the same fix, so 28 corrections. The refuted ones were right as written or a phrasing preference.

Symbols and their meaning:
- Appendix C.4: alpha is defined on cost (Section 5, S1); this paragraph's ratio of total output tokens is how it is estimated here, as Appendix C.3 already says.
- Appendix B.2, Section 5 (S1) and Section 6: the measured 1.75 to 3.18 are ratios of output tokens; by cost they are 1.74 to 3.14 (the cost ratios Appendix C.2 already gives), now stated beside them. Every figure and threshold in Section 6's overstatement sentence holds on either set (recomputed).
- Section 7.2: sigma_A^2 and sigma_B^2 are the variances of a system's score in a single regeneration; "across regenerations" read as the score Section 7.1 already averages over the R regenerations, which has no such variance, and the equation divides them by R.
- Section 8, Phase 0: kappa named as Cohen's kappa, as the cited study reports it.
- Appendix B.6: delta is "a minimum difference in mean score", as Section 7.2 and Section 9 call it; "effect" is kept for d_z.

Pointers inside the paper:
- Section 5, S4: prompt caching is offered by the three largest providers and is on by default at OpenAI only (Appendix B.1); "the default behaviour of several large providers" claimed more than Section 4 and the cited pages say.
- Section 9: Equation 13 takes sigma^2 as an input; the sentence said it calculated a variance. Now "before sigma^2 is estimated for Equation 13".
- Section 5, S6: fewer repeat scorings (S3) also cost power, as Section 7.2 and Phase 2 already say; S6 named only S2.

Sentences read twice:
- Section 7.4: "This" now names what it refers to (retaining every measurement at its finest grain).
- Appendix C.1, E2 order paragraph: scored alone, the two answers came out "as in the third ordering", not "the other way round" (checked against the run log), and the answer is "the answer written to be strongest", as elsewhere since the 20:14 pass of 24 October.
- Section 6: "it equals" now "that factor equals"; and "every figure falls to a third (46 to 74x)" now says that range is the one with the cheap setting kept.
- Section 2.2: "more computation" now "than the baselines"; "Both are reasons" now "Both findings are reasons".
- Section 5, S6: "Until then" now "Until such data exist".
- Section 4, caching: the sentence on one cache write per task now says which calls ("all the calls one judge makes on a task") and stands on its own.
- Appendix C.2: the two mean outputs labelled by setting (3,600 at low, 6,300 at high; recomputed from the table).
- Abstract and conclusion: "a ratio of total costs" and "roughly two orders of magnitude" now attach to the combined reduction, not to one of its factors.
- Appendix A.1: "It" now "The post".
- Section 2.1: the precision figure is a standard error, which a third-party run reports; the sentence had called the run itself a figure.
- Section 8: "both versions" now "the full and the simplified protocol", "the two" now "the two cases".
- Section 3, Section 8 Phase 2 and Appendix C.5: three long sentences split where they joined two separate claims; no claim or number changed.

The build has the same one float-placement note as before; no warnings otherwise, no undefined references.

## 27 October 2026, 08:13 pass

Read this time from three angles not used before: the abstract, the list of contributions and the conclusion checked sentence by sentence against the body; every number that carries a unit or a precision; and every parameter a reader needs to repeat the work, against the experiment files. Each finding was checked by a second reader trying to refute it: 23 of 32 survived. The refuted ones were right as written, a phrasing preference, or (for the power at the floor) already stated in Appendix B.5, Appendix B.6 and Section 8.

Abstract and conclusion against the body:
- Abstract: "judge count is usually the wrong place to economise" lost its "usually". Section 5 (S5), the conclusion and Appendix C.2 all say it without condition; the sentence now gives the two reasons S5 gives.
- Abstract and Section 3: "where each answer is judged in its own call, the number of judging calls" now reads "judged separately, without batching, the number of judge scorings". DRACO scores each rubric criterion independently (DRACO, Section 4.2), so a run makes more calls than the product counts; the product counts scorings.
- Abstract: "the cheaper setting" is "the cheap setting", the term S1 defines and the paper uses everywhere else.
- Section 3: "too costly to repeat" is "expensive to repeat". The introduction states only as a premise that cost keeps teams from re-running, and no run is priced in the paper.
- Conclusion: "its unbatched arithmetic" is "its uncached arithmetic", with a pointer to S4. Batching's saving is always measured against unbatched judging; what shrinks it is caching (Section 4 on Equation 4, Appendix B.4).
- Conclusion, last sentence: "a benchmark cheap enough to re-run" is "a benchmark that can be re-run for a fraction of the full protocol's cost", since the paper attaches no prices to its call counts.
- Appendix C.1 (experiment E2): the measured rho is now carried into the batching factor, as Appendix C.2 carries the measured alpha. At C = 5 and rho of 1.4 to 1.7, beta is about 1.4 to 1.5 without caching and 1.04 to 1.08 with it (Equation S4: 12/8 = 1.50 and 13.5/9.5 = 1.42 uncached; 8.4/8 = 1.05 to 10.15/9.5 = 1.07 cached with w of 1 or 1.25), against 3.0 and 1.2 to 1.325 at the illustrative rho = 0.2.
- Appendix C.2 (experiment E1): the combined reductions at the assumed floor of 60 now say what happens at the floor of 184 the instance's own power inputs give: S6 saves nothing and both ranges fall to a third, 9 to 22x and 4 to 9x (26.8/3, 66.0/3, 13.0/3, 26.9/3).
- Appendix B.5: the power of 0.79 at the power-derived floor is computed with the judging variance of K = 5; the combined variant runs K = 1, which raises that variance (Section 7), so the sentence now adds "and less once its K = 1 is counted".
- Section 5 (S4) and Appendix B.1: Google applies prompt caching automatically on Gemini 2.5 and later models (Google's caching page, read 27 October 2026, now cited in a footnote); the paper had named only OpenAI as caching by default.

Units and rounding:
- Appendix A.2, table "Published DRACO scores", Microsoft row: "+7.0" is "+7.0 points", as Microsoft's post gives it ("+7.0 points (SEM ±1.90)"); the post also gives the same gain as a 13.88% relative figure, so the unit matters.
- Appendix C.1 (experiment E2): the single-answer verdicts ran 224 to 239 output tokens, so the range is 220 to 270, not 230 to 270, and rho on cost is about 1.4 to 1.7, not 1.5 to 1.7 (from experiments/results/e2-judge-cache-2026-09-11T07-41-29.json).
- Appendix C.5, caption of the table "Experiment E3": the pooled alpha is a ratio of output tokens; the caption now also gives it by cost, 1.46 for gpt-5.6-sol and 2.53 for claude-opus-5 (summed costUsd, low against high, from experiments/results/e3-aime-2026-09-11T08-35-02.json).
- Appendix C.5, Interpretation: "the pooled ratio" is "the pooled ratio of high to low", because the prose family it is compared with has three pooled ratios.
- Appendix A.3: the tracker's top score of 0.772 is on a 0 to 1 scale; the sentence now says 77.2%, the form of the other tracker's 88.6% beside it.
- Section 2.2: AllChat's "60% fewer factual errors" and "depth score twice as high" now say "without naming a baseline"; its home page and the linked benchmark page name none.

Parameters stated consistently:
- Section 5 (S1), Section 6, Appendix B.2 and Appendix C.2: E1's "highest setting" is its high setting. Both models offer xhigh and max above it (experiments/e1-alpha.mjs runs none, low and high only), while the published GPT-5 comparison did run that model's highest setting. Each place now names high.
- Appendix C.3, the table comparing the published 23x with E1, Settings row: the published column now says minimal and high are the lowest and highest of GPT-5's four settings, and the E1 column that xhigh and max were not run.

Rebuilt with latexmk: no errors, no undefined references.

## 27 October 2026, the reference implementation and its tests

The gap logged on 24 October is closed. The paper said a reference implementation reproduces the table "Combined reduction from S1--S4 and S6" (tests/simplifications.test.mjs) and both task floors (tests/power.test.mjs); neither existed. Now in the repository:

- src/cost-model.mjs: one function per numbered equation of Sections 4 to 6 and Appendix B, each naming its equation label. src/power.mjs: the task floor n*, the variance decomposition, Holm's smallest threshold, the power at a given task count, and a normal quantile and CDF written from scratch (agreeing with published values to about 1e-15). src/simplifications.mjs: the cumulativeReductionFactor that README.txt documents.
- tests/simplifications.test.mjs: every entry of the combined-reduction table (195, 208, 222; 176, 154, 137), the w = 1.25 row (179, 161, 146), F_G = 189, F_J = 270, 108 and about 119, beta = 3.0, 1.2 and 1.325 with the ceiling 1.4, the naive products 5,670, 2,268 and 2,504, Section 6's overstatement ranges, the expensive-setting figures, Appendix C.2's ranges and Appendix B's call counts. The measured setting-cost ratios are computed from the 25 rows of the table "Every successful call of experiment E1", not typed in. tests/power.test.mjs: n* = 128 and 184, z of about 2.13 and 0.84, the power of 0.79 at 180 tasks. tests/stats.test.mjs: the five statistics modules, against values computed independently.
- 92 tests, all passing (npm test). Each was shown able to fail: the code was broken eleven ways on a scratch copy and every break failed between one and eight tests.
- The equations were checked against the code one by one by a second reader, and every printed number by a third, recomputed by hand and with high-precision arithmetic. No figure in the paper fails to follow from its stated inputs.

Two sentences corrected on the way, found by those checks:
- Section 6, the overstatement sentence: it fell below 10 "once s reaches 0.3" (w = 1) and "0.4" (w = 1.25), which holds only in steps of 0.1. The exact crossings are s = 2/(11 - alpha) and 3.25/(12.25 - alpha): about 0.22 to 0.26 and 0.31 to 0.36 for alpha of 1.75 to 3.18. Now stated.
- Appendix B, call counts: the counts are for T = 60; the full protocol of the worked instance (T_full = 180) makes three times as many (5,400, 81,000 and 16,200). Now said, so the two are not confused.

Also: README.txt pointed to a claims ledger (paper/CLAIMS-AUDIT.md) and a sources/ folder with a fetch script, none of which is in the repository, described rho the wrong way round in its example, and named the paper licence file wrongly; corrected. The permutation test gained an option (countObserved, off by default) that adds one to both counts of the sampled p-value, the form Section 7.1 calls exact; the published runner does not use it, so Section 7.1's "the published runner adds neither" stays true.

Rebuilt with latexmk: no errors, no undefined references.

## 27 October 2026, 10:14 pass (applied 17:3x)

Three new angles: every worked number put through the reference implementation, the typeset result (build log and PDF layout), and the modelling assumptions. Each finding was checked by a second reader who tried to refute it. Applied at 17:3x because the account's weekly usage limit stopped all work from about 10:40 to 17:00.

Numbers through the code (the code reproduces every printed figure; these are the gaps it showed):
- Section 1, footnote on the repository: it listed "the paper, the protocol runner and the measurement scripts", while the caption of the table "Combined reduction from S1--S4 and S6" and Appendix B.6 refer to "the reference implementation". The footnote now names the reference implementation and the tests that reproduce the worked figures.
- Section 4, "Effect of prompt caching", and Appendix B.1, first sentence: the dates the providers' pages were read left out 27 October 2026, the date of Google's caching page cited in Appendix B.1's footnote. Both now include it.

Typeset result:
- Preamble: the cmap package is loaded before fontenc, so the PDF's text can be copied and searched; the title used to come out of the PDF as "Eciently", with the ligature lost.
- Appendix A.2, table "Published DRACO scores", and Appendix C.3, the table comparing the published 23x with E1: the text columns are set ragged right, which removes the badly stretched lines in those cells.
- References: the bibliography is set ragged right, for the same reason with long URLs.
- Preamble: a widow penalty, so a paragraph no longer leaves its last line alone at the top of the next page (Section 8 did).
- After these the build log shows no overfull and no underfull boxes.

Assumptions stated where used:
- Section 4, definition of J: "the number of independent judges" is now "the number of judges", with a pointer to S5, which explains why their errors cannot be assumed independent.
- Section 4, definition of j: one judge scoring one answer once is counted as one judging call; DRACO scores each criterion independently (its Section 4.2, "scores assigned independently for each criterion"), which can take one call per criterion, so j then covers all the calls of one scoring.
- Section 5, S1: the factor E for judging holds if an answer costs the same to judge at every setting; where the expensive setting's answers are longer, it is above E when the cheap setting is kept and below it when the expensive one is.
- Section 7.1, the permutation test: the null hypothesis now also states that the task-level differences are independent of one another, which the sign-flip test relies on.
- Section 7.2, Equation 14: it holds if the two systems' scores vary independently within a task; S4, which scores both answers in one call, does not ensure that. Now said.
- Section 9, generalisability: it generalises over tasks as far as they are a random sample of the tasks a conclusion is meant to cover; DRACO's are a curated sample from a filtered stratum.
- Section 9, first sentence on g: Equations 1 and 6 use one average g over every system and setting, not a number per system per setting; the sentence now says so.
- Section 9, last sentence: the full reference run is made once, on one set of systems, so reusing its sigma, alpha and measured fidelity losses after that set changes assumes they carry over; alpha already differs between the two models of Appendix C.

Also, in the reference implementation (no paper change): src/effect-size.mjs said d_z is "routinely confused with" d_av and pointed to a note the paper removed on 26 October (Lakens 2013 does not support it); src/permutation-test.mjs justified the test by the two-stage procedure's inflated Type I error, which Section 7.1 calls mixed evidence, and stated the null differently from Section 7.1; two test names in tests/simplifications.test.mjs quoted the old "reaches 0.3" and "0.4". All three now follow the paper. 92 of 92 tests pass.

Rebuilt with latexmk: no errors, no undefined references.

## 27 October 2026, 18:16 pass

Two angles: the sentences changed earlier today, read in their paragraphs, and every statement tied to a date or to "now". Each finding was checked by a second reader who tried to refute it.

Today's edits in context:
- Section 4, definition of j: the clause added at 10:14 said the judging-call counts below "are multiplied by the number of criteria", which none of them is. It now says j counts one scoring as one call, and the number of calls actually sent is each count times the number of criteria; "unbatched" is back beside the cost it qualifies.
- Section 5, S1: the sentence after the new caveat still said S1 saves "only the factor E on judging" when the expensive setting is kept; it now adds "or less where the expensive setting's answers are longer", as the caveat says.
- Conclusion, last sentence: re-running the reduced protocol after the systems change now also needs what the reference check measured to hold for the new systems, as Section 9's last sentence now says.
- Section 7.1, the confidence interval: it rests on the same independence and symmetry assumptions as the test, not only on symmetry.
- Section 9, generalisability: the 10:14 insertion made one 108-word sentence; the caveat about DRACO's tasks now stands in its own sentence, and the conditionality on judges in another, directly before "That is the sense of the argument in S5".
- Section 9, first sentence on g: a colon and a comma, so "Equations 1 and 6, one average over every system and setting" reads as a sentence.
- Appendix B.3, call counts: the list for the full protocol now names each number (5,400 generation calls, 81,000 unbatched and 16,200 batched judging calls); the sentence before ends on a different 5,400.
- Appendix C.1 (E2), order sensitivity: "that is the reason" Section 7.3 varies the order treated this run's movement as an order effect, which the previous sentence says this run cannot separate from test-retest noise. It now says the scores moved as they would under position bias.

Dates and "now":
- Appendix B.1, first sentence: the terms were read on 11 September and again on 26 October 2026 (27 October where stated), as the same paragraph's last sentences say; the opening said "September 2026, and 26 or 27 October 2026 where stated below".
- Appendix B.1, Google's caching: the minimum prefix Google's page gives, 2,048 to 4,096 tokens depending on model, is added beside the other two providers' minimums (ai.google.dev/gemini-api/docs/caching, read 27 October 2026).
- Appendix A.3: the 88.6% figure is the one read on 10 September; the paragraph says both trackers were read on 10 and 11 September and the other figure is from the 11th.
- References, Artificial Analysis methodology page: the note now records the re-reads of 26 and 27 October 2026, in the form the other re-read entries use.

Left as they are: two findings asked to date the Artificial Analysis GPT-5 run in the text; the citation already prints the year.

Rebuilt with latexmk: no errors, no undefined references, no overfull or underfull boxes. 92 of 92 tests pass.

## 27 October 2026, 20:14 pass

Two angles: how numbers are written across the paper, and whether each claim's verb is as strong as its evidence. Each finding was checked by a second reader who tried to refute it.

How numbers are written:
- Appendix C.3, table "Every successful call of experiment E1": the 35 Out and Reasoning cells of four or more digits now carry thousands separators, as every other such number in the paper does (45 of 47 outside this table; the prose quoting these rows already wrote 1,024 and 4,068). No value changed.
- Appendix C.4, effort semantics: "rose 5.4-fold and its visible output only 1.23-fold" is now "5.38× ... 1.23×", one precision for the two ratios and the times sign the paper uses elsewhere (12,208 / 2,269 thinking tokens = 5.38, from the E1 table).
- Appendix C.2 (E1), result: "low added only 12% over none" is now "low consumed only 1.12× the output tokens of none", the figure and form of the ratio table and the next sentences (6,461 / 5,749 = 1.12).
- Appendix C.1 (E2), prompt caching: "six times the input rate" is now "6× the input rate", as every other price multiple is written.
- References, Google pricing note: "one tenth of standard input" is now "0.1× standard input", as the same note writes the later rate.

Claim strength:
- Section 3: the weakness "that matters most" is now the one "we take to matter most"; the introduction states it as a premise, not a measured fact.
- Section 5, S1: "saves almost nothing on generation" now holds "once alpha is large"; at the measured ratios it saves 24% to 36% of generation cost.
- Section 5, S3: the reliability a judge's repeats measure is "mainly" a property of the judge and can differ between the answers it scores; the categorical "not of the systems under test" had no support.
- Section 5, S4: the cost case is weak "wherever the judging prefix clears the provider's minimum", since the cached ceiling rests on Equation 5, which holds only then.
- Section 5, S5: S5 removes the one thing "only" judge count provides; the paper itself gives judge count other roles.
- Section 6: the overstatement grows with alpha "with the cheap setting kept"; with the expensive setting kept it falls as alpha grows. The closing sentence of that paragraph now names S3 beside S2 and S6 as the simplifications whose cost the power calculation expresses, as Sections 7.2 and 8 now say.
- Section 7.3, blind scoring: it guards against a judge told which system wrote an answer, not against one that recognises a system from the answer itself.
- Section 7.4: what makes post-hoc analysis possible is retaining the measurements and not only their per-system summaries; the finest grain is needed for other uses, not for this one.
- Appendix C.1 (E2): the 40-criterion rubric (about 920 tokens) does not clear this provider's 1,024-token minimum, though it would clear some Anthropic models' 512.
- Appendix C.2 (E1), interpretation: alpha "appears to be" a property of a model on a task family (Appendix C.5 does not support task family as the explanation), and the size of the saving is set by alpha and by the task floor, both from the pilot.
- Appendix C.4: the reasoning-length literature shows variation by problem type and between models, and suggests a change across generations (Ballon et al. infer it).
- Appendix C.5: the pilot can supply unseen problems only where the benchmark's tasks have not been published; DRACO's are public.

Left as they are: "8--22 points" (most ranges in the prose use the en dash), "a factor of 3" (exactly 3), "per-dimension gains ... in points" (the source could not be checked from here), and "Both providers now document adaptive behaviour that narrows the gap" (it follows from the quoted documentation).

Rebuilt with latexmk: no errors, no undefined references, no overfull or underfull boxes. 92 of 92 tests pass.

## 27 October 2026, 22:14 pass

Three angles (whether a reader could reimplement each method from the text; spelling, hyphenation and capitals; every inference in words) gave 20 findings that survived a second reader who tried to refute each one, and all 20 are applied.

Reimplementing from the text:
- Section 7.1 (Test, aggregation, and multiple comparisons), the aggregation sentence: two sentences now say what one scoring is. On a rubric with criterion weights, such as DRACO's, the runner scores from the judge's verdicts: the summed weights of the criteria marked met, an error criterion carrying a negative weight, over the summed positive weights, as a percentage clamped to 0 to 100 and rounded to one decimal; on an unweighted rubric it takes the judge's score line, which need not equal the share of criteria met (pointing to Appendix C). The paper never said, and the two readings give different numbers: with weights 10, 5, 5 and -3, verdicts met, unmet, met, met and the line "SCORE: 75", the runner stores 60.
- Section 7.1, the same sentence: a system's score on a task is now the median "at a given setting". With more than one setting each system has one score per setting on each task, and the text did not say which enters the paired difference; S1 treats a comparison as made at one operating point.
- Section 7.1, after Miller's sentence on paired differences: a new sentence says how the runner treats failures. A failed or scoreless judging call is left out of the median, a failed generation call out of the mean, a task on which either system then has no score is left out of that comparison, and a comparison left with fewer than 3 paired tasks is not tested. The paper was silent, and scoring a failure as 0, or dropping the task from every comparison, changes the paired differences and n. The case in which every scoring of a regeneration fails is not described, because the runner then fails on an empty mean.
- Section 7.1, the permutation test: "test on the task-level differences" is now "test of the mean task-level difference". The statistic was never named, and a signed-rank statistic is also a sign-flip test: on the differences 12, -1, -2, -1.5, 9, -0.5, 8, -3, 1 and -2.5 the one-sided p is 0.1445 with the mean, which src/permutation-test.mjs uses, and 0.4229 with signed ranks. The power formula and the interval in the same section also assume the mean.
- Section 7.2 (Power and the S6 floor), after the sample-size equation: n* is now "rounded up to a whole number of tasks". On Appendix B's inputs the equation gives 127.35 and the paper prints 128; rounding to the nearest gives 127, where the power is 0.7989, below the stated 0.8 (0.8021 at 128).
- Section 7.3 (Blind and calibrated scoring), end of the paragraph recommending order-randomised presentation: a new sentence says the published runner does not randomise the order for the first C repeats. It rotates the answers one place per repeat, starting from the order in which their generation calls finished, and shuffles them from a fixed seed only for later repeats, so at K = 1 every batch is shown in that order. The paper recommends randomised order and calls the tooling the runner of its protocol; a reader who randomises gets other positions and so other scores.
- Section 5, S6: the stratified sample is now drawn "in proportion to each domain's share of the tasks and with at least one task from each", as the runner allocates it (60 tasks on DRACO's domain counts gives 11, 10, 7, 6, 5, 5, 4, 4, 4 and 4). The allocation was not stated, and equal allocation, the other common reading, gives a different task set whose unweighted mean no longer estimates the full-set mean that Section 8's Phase 2 compares against.

Spelling, hyphenation and capitals:
- Section 7.3, balanced position calibration: "judge calls" is now "judging calls", the unit Section 4 defines and the form used everywhere else in the paper.
- Appendix A.1 (The benchmark), the task pipeline: "deep-research product" is now "Deep Research product". It is the product the same subsection later calls "the company's own Deep Research product" (the DRACO abstract: "Tasks are sampled from a de-identified dataset of Perplexity Deep Research requests"). The lower-case, hyphenated form stays where the paper means the general category.

Inferences in words:
- Section 2.2, last paragraph: Cemri et al. are now introduced as observing "that the gains of multi-agent systems on popular benchmarks are often minimal" before their annotation of 1,600 traces. "Both findings are reasons to take the statistics of the scoring ... seriously" did not follow from a failure taxonomy alone; small gains are what need careful statistics to detect. The sentence is a paraphrase, not a quotation; the abstract's exact wording in its latest version ("often minimal"; the first version has "remain minimal") should be re-checked when arxiv.org is reachable.
- Section 5, S1, second paragraph: the billing evidence now says a call at a high setting "pays the same rate on whatever extra tokens it uses", not "on a much larger token count". The billing rule shows only that cost follows token count; how much larger the count is, is what the next sentence and E1 measure, and the paper's own figures include 1.12× (low against none) and 1.23× (visible output of the second model).
- Section 5, S1, the same paragraph: "so alpha can be looked up. It should also be measured." is now "so alpha on that suite can be looked up; on the benchmark's own tasks it has to be measured." The service publishes its own suite's totals, which give alpha for that suite only; the paper's figures (23× there against 1.75 to 3.18 here) and Appendices C.2 and C.4 say alpha must be measured on the tasks of interest.
- Section 5, S4, "What is added rather than lost": "That this helps has been measured:" is now "A method built on this, run iteratively in two stages over heterogeneous batches, has been measured to help:". The 10.5% gain and 64% cost belong to BatchEval's whole method, not to calibration context alone, and S4's batch (the C systems' answers to one task) is not the heterogeneous batch that method uses. The quotation that follows is unchanged.
- Section 7.3, blind scoring: "The concern is documented:" is now "The biases cited here mostly act through the answer itself, which blinding does not hide:". Since the 20:14 pass the sentence before it names two concerns, a label that blinding removes and recognition from the answer that it does not; every bias then cited (verbosity, self-enhancement in anonymous pairs, architectural siblings, lower perplexity) acts through the answer, so the colon read as evidence for the first.
- Appendix B.2 (The setting-cost ratio alpha): "alpha should be looked up or measured for the systems under comparison" now has alpha "measured on the benchmark's own tasks for the systems under comparison, since the published figures hold for that suite only". It is the same gap as in S1; the same paragraph calls the suite's 23 an upper bound on alpha there.
- Appendix C.2 (E1), Interpretation: the parenthesis comparing E1 with E3 now adds that E3 asked for brief reasoning where E1 asked for a thorough answer, so the two differ in instruction as well as task family. Appendix C.4 shows that visible answer length moves the ratio, so this is the same kind of confound the paper names for the 23× comparison. The output caps also differ, but neither was reached, so they are not mentioned.
- Appendix C.3 (Full method for E1), Analysis: the five-prompt estimate is now offered "as evidence that alpha is not a constant of the effort setting", not that it is task-dependent. E1 has one task family and one call per cell, so its per-prompt spread (1.52 to 3.99) cannot be told apart from call-to-call variation; what it does show is that the same named settings give 2.83 for one model and 1.75 for the other, which is Appendix C.5's conclusion.
- Appendix C.4, Arithmetic of the ratio: "Because alpha is estimated here as a ratio of total output tokens" is now "Because alpha is a ratio of whole-call costs, estimated here by the ratio of total output tokens". The compression by a long visible answer is in alpha itself, since visible output is billed at the thinking rate; it is not an artefact of the estimator. The cost ratios (1.74 to 3.14) are compressed slightly more than the token ratios, and the paragraph closes "This follows from the definition".
- Appendix C.5 (E3), Interpretation: "adds little on most items, so the pooled ratio" is now "adds little on most items of E3, and the pooled ratio". The premise is shown on E3's problems only, while the range after it covers both task families; E1's 2.83 is measured directly, and the second model's 2.67 on E3 comes from one item.
- Appendix C.5, the same paragraph: "The published 23× is therefore best read as a property of a particular 2025 model" is now "may therefore be a property". E3 ran only the 2026 models, the same sentence says it cannot show the 2025 model's behaviour, and the measurement that would isolate model generation was not run. The closing "and not a constant of the effort setting" now reads as hedged too; E1's two models support that part more firmly.

Nothing skipped: each old passage was found exactly once and no two corrections touched the same words. Code faults the second readers found in the runner, for the runner rather than the paper: a regeneration whose scorings all fail makes it throw on an empty mean; a comparison left untested shrinks Holm's family; with more than one setting a comparison takes whichever setting was stored first; stratified sampling returns 10 tasks when asked for 5 or 8.

Rebuilt with latexmk: no errors, no undefined references or citations, no overfull or underfull boxes. 92 of 92 tests pass.

## 27 October 2026, the runner brought into line with the paper

The 22:14 pass made the paper describe the published runner as it was, faults included, and named four of those faults for the runner (faults 3, 4, 5 and 8 below); the 04:14 pass named three more for its next version (fault 11). With six more found since, they were logged as DAI-307, as eleven faults, before any fix. Each is now fixed in the runner (app/lib/, and src/ where the statistics live), with tests in tests/runner.test.mjs that were run first and seen to fail for the reason stated, and every sentence of the paper that described a fault now describes the runner as fixed. The tests drive the runner with a scripted model and make no network call.

The runner:
- Fault 1: on a weighted rubric, such as DRACO's, a judge's answer that parses to nothing, such as a refusal, was scored 0, the weighted score of no criteria met; in a median of two repeats that halved the score (75 became 37.5 in the test). It is now a missing scoring, left out of the median. parseJudgeOutput gives no entry for such an answer, and scoreJudgement, taken out of runProtocol so that it can be tested, scores a weighted rubric only when at least one verdict was read.
- Fault 2: a batched answer with a score line ("SCORE A: 70") and no verdict line the parser could read was also scored 0 on a weighted rubric; it now has no score. The reverse case is fixed with it: the batched parser found answers by their score lines, so verdict lines without a score line were dropped; they are now scored from the verdicts.
- Fault 3: when every scoring of an answer was missing and there was no other regeneration, the summary took the mean of nothing and failed as a whole. That regeneration is now left out of the mean, and a task with none left has no score for that system and setting and is left out of its comparisons.
- Fault 4: a comparison that could not be tested (fewer than 3 paired tasks, or a missing condition) was dropped from Holm's family, so m shrank and the other thresholds loosened. It now stays in the family with p = 1, so it is never rejected. In the test, three named comparisons with one untested give thresholds of a/3 and a/2, and the second (p = 47/1024) is no longer rejected at a.
- Fault 5: with more than one setting, a comparison took whichever (system, setting) pair the summary had stored first, and the configuration named systems only. A side of a comparison can now be { systemId, setting }; a bare system id means the system's own compareSetting if that setting was run, else its first configured setting, in configuration order. The app sends each comparison with its settings and offers a "compared at" choice for a system with two or more settings ticked; a saved configuration without one loads with the first setting.
- Fault 6: in validation, compareProtocols ranked each system by whichever of its conditions came last in a list sorted by mean, which is its lowest-scoring setting. It now takes each system at the setting it is compared at, and the reference at that same setting, and matches the verdicts on settings as well as systems.
- Fault 7: the validation mode took DRACO as published (R = 1, K = 5, unbatched, means, one setting) as its reference, while Section 8's Phase 1 is the complete, unsimplified protocol. The reference (referenceConfig) is now every configured setting, each answer judged in its own call, the reference's own R and K (new fields shown in validation; a configuration without them uses the run's R and K) and the same median rule as the reduced run. DRACO as published stays a preset of its own and is no longer described as the reference.
- Fault 8: asking for fewer tasks than there are domains returned 10 (n = 5 and n = 8 both gave 10), because trimming stopped at one task per domain. The sample now has exactly n tasks: in proportion to the domains with at least one from each when n is at least the number of domains (60 still gives 11, 10, 7, 6, 5, 5, 4, 4, 4 and 4), and otherwise one task from each of n domains chosen with the same seed.
- Fault 9: the answers were rotated one place per repeat from the order in which their generation calls finished, and shuffled only beyond the first C repeats, so at K = 1 the order never varied. Each batch's order is now a random permutation drawn from a fixed seed (1 unless set) and the batch's task, setting, regeneration and judge, rotated one place per repeat with a new draw after every C repeats, so each block of C repeats still puts every answer once in each position. The answers start in configuration order, so the same seed gives the same orders whichever call finishes first, and each scoring records the order shown (shownOrder).
- Fault 10: README.txt said the starter tasks are scored as "the percentage of criteria MET", but the code takes the judge's own score line on an unweighted rubric. README.txt, and the same claim in the app's tooltip, now say what the code does.
- Fault 11, the 04:14 pass's "For the runner's next version": the sampled p-value now counts the observed pattern (countObserved in src/permutation-test.mjs, still off by default there, is on in the runner for the pre-registered and the exploratory tests), so it is never zero: 1/100,001 in the test where it was 0. The confidence interval for the mean paired difference is computed by inverting the two-sided sign-flip test (signFlipConfidenceInterval and signFlipTwoSidedP, new in src/permutation-test.mjs and checked against plain enumeration of the sign patterns) and reported at level 1 - a with each pre-registered comparison. Each scoring keeps the verdict on each criterion, in the JSON and as a verdicts column in the CSV.

Also: tests/stats.test.mjs named one test after "The published runner adds neither", which is no longer true; the name now says what the module does by default and that the runner turns the option on. README.txt now also describes the validation reference, the sample, the order, the p-value, the interval and the raw table as they are.

Paper sentences changed:
- Section 5, S6: "in proportion to each domain's share of the tasks and with at least one task from each" now continues "(a sample smaller than the number of domains takes one task from each of that many domains, chosen with a fixed seed)".
- Section 7.1, after the aggregation sentence, a new sentence: "Each comparison is made at one setting of each of its two systems: the setting named for that system or, where none is named, its first configured setting."
- Section 7.1, failed calls: "Where a judging call fails or gives no score, the published runner leaves that scoring out of the median, and where a generation call fails it leaves that regeneration out of the mean; a task on which either system then has no score is left out of that comparison, and a comparison left with fewer than 3 paired tasks is not tested." is now "Where a judging call fails or gives no score, the published runner leaves that scoring out of the median; on a weighted rubric a judge's answer with no verdict the runner can read, such as a refusal, gives no score, whatever score line it writes. Where a generation call fails, or every scoring of a regeneration is missing, the runner leaves that regeneration out of the mean; a task on which either system then has no score is left out of that comparison, and a comparison left with fewer than 3 paired tasks is not tested but still counts among the comparisons the Holm correction below is applied across." (faults 1 to 4)
- Section 7.1, the sampled p-value: "The published runner adds neither, so its p-value can be zero and its test is not exact in this sense." is now "The published runner counts the observed pattern in this way, so its p-value is never zero."
- Section 7.1, the interval: "The published runner does not compute this interval; it reports the mean difference, d_z and the p-value of each comparison." is now "The published runner computes this interval at the level 1-a for each pre-registered comparison and reports it with the mean difference, d_z and the p-value; with 5 tasks or fewer at a = 0.05 no value can be rejected and the interval is unbounded." (At 5 tasks the smallest two-sided p is 2/32 = 0.0625.)
- Section 7.3 (Blind and calibrated scoring), last sentence: "The published runner does not randomise the order for the first C repeats: it rotates the answers one place per repeat, starting from the order in which their generation calls finished, and shuffles them, from a fixed seed, only for later repeats, so at K = 1 every batch is shown in that order." is now "The published runner draws a random order for each batch from a fixed seed and rotates it one place per repeat, drawing a new order after every C repeats, so that the order is random even at K = 1 and each block of C repeats shows every answer once in each position; the order shown is kept with each scoring."
- Section 7.4 (Data retention): "The published runner keeps less than this: for each judging call and answer it stores the score and the numbers of criteria met and unmet (and per-dimension scores for weighted rubrics), not the verdict on each criterion." is now "The published runner keeps this: for each judging call and answer it stores the verdict on each criterion, the score, the numbers of criteria met and unmet, the order in which the answers were shown and, for weighted rubrics, the per-dimension scores."

No sentence of the paper describes the runner's validation mode or how it ranks systems in it, so faults 6 and 7 change none; Section 8's Phase 1 already says what the reference now is.

The 22:14 pass could not reach arXiv for Cemri et al.; their abstract (arXiv 2503.13657, read 27 October 2026 at 22:4x) says "their performance gains on popular benchmarks are often minimal", which the corrected sentence now follows.

Rebuilt with latexmk: no errors, no undefined references or citations, no overfull or underfull boxes; the one float-placement note as before. 120 of 120 tests pass: the 92 before, and 28 in tests/runner.test.mjs, of which 25 failed before the fixes. Of the three that passed, two (fault 8's proportional sample and its seed) check behaviour that was already right; the third, fault 9's run test, passed only because the old runner ignored the scripted model and kept no scoring, so it compared two empty lists. Corrected in the review entry below, which makes that test count the scorings first: 26 of the 28 now fail on the old code.

## 27 October 2026, review of the runner fixes

Two second readers checked the runner fixes of the entry above, one of them by undoing each fault in a copy of the code and running the tests again. They raised fourteen points, two of them the same. Each was reproduced, with a test in tests/runner.test.mjs that failed on the code as committed for the reason given, or, for the wording, from the code itself. All were real, and each is now fixed.

The tests:
- Fault 9's run test ("a run keeps the order shown with each scoring") never checked that the run kept any scorings. On the code before the fixes the runner ignored the scripted model, every call failed with "unknown provider scripted", and the test passed by comparing two empty lists. It now requires the 18 scorings (3 tasks, 2 repeats, 3 answers) in both runs. The entry above said three of its tests check behaviour that was already right; that holds for two, and its last paragraph now says so.
- No test fixed the batch name that a run passes to orderForRepeat. With the name replaced by an empty string, so that at K = 1 every batch of the same size is shown in one order, all 28 tests still passed. Fault 9's run test now requires each scoring's order to be the one drawn from seed 1 and its batch's task, setting, regeneration and judge, and the batches not to share one order.

The runner:
- On a weighted rubric, an answer with some verdicts but not all, such as a judge's output cut off partway, was scored with the missing criteria counted as unmet: their weight was lost, and a missing error criterion counted as absent, which raises the score. Judging is capped at 4,000 output tokens and a DRACO task has 16 to 77 criteria (median 38), so a batch of five answers can need 385 verdict lines. A weighted scoring now needs a verdict on every criterion; without one it is missing, marked incomplete, and left out of the median. In the test the cut-off scoring was 50 and pulled a median of two repeats down to 62.5; the score is now 75.
- On an unweighted rubric, an unbatched judge that wrote no score line but marked every criterion was scored by the share it marked met, while a batched one got no score; and the unbatched rule counted verdict lines, so a repeated line could stand in for a missing criterion. Both now take the share met, and only when every criterion has a verdict.
- The validation reference could be simpler than the reduced run it checks. The page started both at R = 1 and K = 3, so by default the two differed only in batching, and a reference R or K below the reduced run's was accepted. The server now refuses such a configuration, the reference is never run with fewer regenerations or repeats than the reduced run, the page keeps the reference fields at least at the reduced run's values, and they start at R = 3 and K = 5, the full protocol of Appendix B. validateConfig moved from app/server.mjs into app/lib/protocol.mjs, unchanged otherwise, so that it can be tested.
- The DAILFT tokens of judging were counted wrongly. In a batched run every answer after the first added its call's tokens again, and in an unbatched run only the first system's call of each group was counted. The reference is unbatched and the reduced run usually batched, so validation reported the cost the wrong way round: in the test (3 systems at 2 settings, 2 judges, K = 2) the reference cost 282 and the reduced run 122, and they were reported as 122 and 282. Each judging call is now counted once. The run also records whether it batched, so a configuration that leaves batching unset, which the runner batches, is no longer counted as one call per answer.
- The summary followed the order in which calls finished. Two runs with the same seed could report an exploratory pair the other way round, and above 20 tasks the sampled p-value and interval changed too, since the tasks' order decides which sampled sign falls on which task. The scorings are now taken in configuration order, so the same raw table gives the same summary.
- The interval's bisection ran on the server's main thread, which stopped answering the page's polls meanwhile: 0.9 s for one comparison at 40 tasks in the test, and 2.6 s at 184 tasks by one reader's measure. The summary is now computed in a worker thread, and in place only if the thread fails.
- An interval bound the test cannot reach was written as null in the JSON, which reads as "not computed". Each comparison now carries ciUnbounded, which says which bound is unbounded.
- The page did not restore a saved baseline, so after a reload every comparison was made against the first system. And its "compared at" choice showed the first ticked setting in the provider's list while the run used the first in the stored order, so the page could say low while the run was compared at high. Both now follow the server's rule. Checked in a headless browser before and after.
- README.txt's list of files now says that src/permutation-test.mjs also gives the two-sided test and the interval found by inverting it.

Paper sentences changed:
- Section 7.1, scoring: "On an unweighted rubric it takes the score line the judge writes, which need not equal the share of criteria marked met (Appendix C)." now continues ", or, where the judge writes no score line but gives a verdict on every criterion, that share."
- Section 7.1, missing scorings: "on a weighted rubric a judge's answer with no verdict the runner can read, such as a refusal, gives no score, whatever score line it writes" is now "on a weighted rubric a judge's answer that leaves any criterion without a verdict the runner can read, such as a refusal or an answer cut off partway, gives no score, whatever score line it writes".
- Section 7.3 (Blind and calibrated scoring), last sentence: "drawing a new order after every C repeats, so that the order is random even at K = 1 and each block of C repeats shows every answer once in each position" said C where the runner counts the answers in the batch, which are fewer when a generation call failed or at a setting only some systems have. It is now "drawing a new order after as many repeats as the batch has answers (C when every system's answer is in it), so that the order is random even at K = 1 and each such block of repeats shows every answer once in each position".

No sentence of the paper describes how the runner counts tokens, in what order it builds its summary, on which thread, or what its page shows, so the other points change none.

Rebuilt with latexmk: no errors, no undefined references or citations, no overfull or underfull boxes; the one float-placement note as before. 135 of 135 tests pass: the 120 before, and 15 new in tests/runner.test.mjs, each of which fails on the code as committed before this review.

## 28 October 2026, 00:14 pass

Three angles (tonight's runner sentences read in their paragraphs; the bibliography as printed; every assumption checked where the paper relies on it) gave 40 findings that survived a second reader who tried to refute each one, and all 40 are applied.

Tonight's runner sentences, read in their paragraphs:
- Appendix B.2 (The setting-cost ratio alpha): "Appendix C reports such a measurement on analytic prompts" is now "reports a measurement on analytic prompts". Since the 22:14 pass the sentence before says alpha "should be measured on the benchmark's own tasks for the systems under comparison", so "such a measurement" pointed back to a measurement on the benchmark's own tasks, and E1 ran five analytic prompts, not DRACO tasks. The range that follows still says what was measured.
- Section 5, S4 (Batching judging across systems), "What is added rather than lost", the BatchEval sentence: "and that presenting a batch of samples in one prompt, so that in-batch comparison serves as a second reference alongside the rubric, ``outperforms ...''" is now "and that their method, which presents a batch of samples in one prompt so that in-batch comparison serves as a second reference alongside the rubric, ``outperforms ...''". The 22:14 lead-in gives the 10.5% gain to the whole two-stage iterative method, while the clause after the colon still made batch presentation alone the subject of "outperforms state-of-the-art methods by 10.5%"; in the BatchEval abstract the subject is BatchEval. The quotation is unchanged.
- Appendix C.2 (The setting-cost ratio alpha, experiment E1), Interpretation: alpha is now "a property not of a model alone but of a model on a task family under a given instruction". Since the 22:14 pass the sentence's own parenthesis says E3 and E1 differ in instruction as well as task family (e3-aime.mjs asks for brief reasoning, e1-alpha.mjs for a thorough answer), so its evidence cannot separate the two causes, and the claim now names both.
- Section 7.1 (Test, aggregation, and multiple comparisons), the scoring sentence for unweighted rubrics, changed in c1d69dc: "On an unweighted rubric it takes the score line the judge writes, which need not equal the share of criteria marked met (Appendix C), or, where the judge writes no score line but gives a verdict on every criterion, that share." is now "On an unweighted rubric it takes the score line the judge writes or, where the judge writes none but gives a verdict on every criterion, the share of criteria marked met; a score line need not equal that share (Appendix C)." The added alternative first read as part of the relative clause "which need not equal ...", and "that share" sat about 25 words from what it named. The new order follows the code (parseJudgeOutput takes the score line, otherwise shareMet, which needs a verdict on every criterion, and scoreJudgement returns that score on an unweighted rubric) and keeps the pointer to Appendix C on the caveat it supports.
- Section 2.2 (Related and competing multi-system approaches), last paragraph: Cemri et al. are now introduced by their annotation of more than 1,600 traces, the three groups of failures follow, and then "they also observe that the gains of multi-agent systems on popular benchmarks are often minimal. Gains this small are reasons to take the statistics of the scoring ... as seriously as the comparison itself." Since the 22:14 pass that sentence held two findings of Cemri et al., so "Both findings" after it could be read as those two, which brought back the inference the 22:14 pass removed (a failure taxonomy as a reason for careful statistics). Small gains are the reason, and they also cover Zhang et al., whose debate methods often fail to beat single-agent baselines.

The bibliography as printed:
- Schroeder and Wood-Doughty (schroeder2024reliability), title: "? Reliability" is now "? {R}eliability". plainnat lower-cases every unbraced letter of a title except the first and the one after a colon, so the PDF printed "Can you trust LLM judgments? reliability of LLM-as-a-judge"; chen2024morecalls, perlitz2024benchbench and tripathi2025pairwise already brace the capital after a question mark.
- Zhao et al. (zhao2026care), authors: the five authors are now written out, adding Satya Sai Srinath Namburi Gnvv and Frederic Sala, as PMLR's BibTeX and arXiv 2603.00039 list them. It printed three names and "et al." for a five-author paper, while every other entry of five to fifteen authors is written out. The in-text label stays "Zhao et al.".
- Zhao et al., venue: series Proceedings of Machine Learning Research, volume 306 and pages 162114--162150 added, from the PMLR v306 index (published 29 September 2026), as the two ICML 2024 entries print theirs.
- Cemri et al. (cemri2025mast), authors: all 13 now written out, from arXiv 2503.13657v3 and Crossref; Zheng et al. and Atil et al., also 13 authors each, already were. The in-text label stays "Cemri et al.".
- Cemri et al., venue: pages 135676--135729 added, from Crossref's record for DOI 10.52202/085713-4082 (Advances in Neural Information Processing Systems 38).
- Zheng et al. (zheng2023judging), venue: pages 46595--46623 added, from the NeurIPS 36 proceedings BibTeX.
- Li et al., From Generation to Judgment (li2025generationjudgment), authors: all 13 now written out, from the ACL Anthology (2025.emnlp-main.138) and arXiv 2411.16594v7. Short labels are unchanged (Li et al. 2024a and 2024b keep their order).
- The same entry: month November, pages 2757--2791, DOI 10.18653/v1/2025.emnlp-main.138 and the Anthology link replace the unversioned arXiv link, as the other EMNLP entries carry (the 27 October 04:14 pass added the same to Cheng et al. and Liang et al.).
- Hofmann et al. (hofmann2025fluid), authors: all 10 now written out, from arXiv 2509.11106v1, as the other ten-author entries (DRACO, Prometheus 2, Yuan et al. 2025) are.
- Li et al., LLMs-as-Judges survey (li2024judgessurvey), authors: all 8 now written out, from arXiv 2412.05579v2, as every other eight-author entry is.
- The same entry: note "v2, 10 December 2024" added. Every other preprint with an arXiv version after v1 names it in its note; the preprints with no note were each checked and have only v1.
- Kim et al., Correlated Errors (kim2025correlated), venue: series Proceedings of Machine Learning Research, volume 267 and pages 30038--30066 added, from the PMLR v267 index (published 6 October 2025).
- Bowyer et al. (bowyer2025clt), venue: the same series, volume 267 and pages 81143--81184 added, from the same index.
- Kim et al., Prometheus 2 (kim2024prometheus2): month November, pages 4334--4353, DOI 10.18653/v1/2024.emnlp-main.248 and the Anthology link replace the arXiv link, as Liang et al., from the same EMNLP 2024 proceedings, carry.
- Wang, Zhang and Choi (wang2025judgmentdist): month November, pages 23173--23199, DOI 10.18653/v1/2025.findings-emnlp.1259 and the Anthology link replace the arXiv link, as the other Findings entry (Qin et al., Findings of NAACL 2024) carries.
- Thakur et al. (thakur2025judging), venue: month July and pages 404--430 added, from the Anthology (2025.gem-1.33, which gives no DOI). The arXiv link stays, since the note names arXiv v6.
- Lee, Rush and Vafa (lee2025critical): the link is now the Anthology page (2025.ijcnlp-long.57) in place of an unversioned arXiv link printed beside the Anthology DOI; every other entry with an Anthology DOI links its Anthology page. The 27 October 00:14 pass changed the venue but not the link.
- Liang et al. (liang2024encouraging): the conference city "Miami, Florida, USA" is replaced by the month, November. It was the only proceedings entry printing a city and the only Anthology entry with no month; it now prints "pages 17889--17904, November 2024."
- Perlitz et al., Efficient Benchmarking (perlitz2024efficient): month June added, from the Anthology; it printed "pages 2519--2536, 2024a." where the other Anthology entries print a month.
- Vivek et al. (vivek2024anchor): month March added, as Liusie et al., from the same EACL 2024 proceedings, print.
- Cheng, Kasai and Yu (cheng2023batch): month December added, as Liu et al. (G-Eval), from EMNLP 2023, print.
- Atil et al. (atil2024nondeterminism): month August added, the month of the first arXiv version (6 August 2024). 25 of the 30 arXiv preprints print the month of their first version.
- Chen et al., More LLM Calls (chen2024morecalls): month March added (first version 4 March 2024).
- Ouyang et al. (ouyang2023nondeterminism): month August added (first version 5 August 2023).
- Wang et al., Not Fair Evaluators (wang2023unfair): month May added (first version 29 May 2023). plainnat does not sort on month, so the label 2023a is unchanged.
- Wu et al. (wu2025inference), note: "v3, 3 March 2025" now continues "; published as ``Inference Scaling Laws: An Empirical Analysis of Compute-Optimal Inference for LLM Problem-Solving'' in The Thirteenth International Conference on Learning Representations (ICLR 2025), pages 55824--55845", with the ICLR proceedings link. It was the only preprint whose printed year (2025) is not that of its first version (1 August 2024), and the 27 October 04:14 pass kept 2025 because the paper is ICLR 2025 "as the entry says", but the entry has never named a venue. The note now names it, as those of Ouyang et al., van der Maden et al. and Wang et al. (2023) name their later publications, and quotes the ICLR title, which differs from the preprint's. The second reader added the pages and the link, which the other three such notes give, from the ICLR page's metadata.
- Valyu (valyu2026): month May added. The note already gave 5 May 2026, and every other dated web post prints its month.
- Perplexity AI, the DRACO explainer (perplexity2026explainer): month February added; the note already gives 4 February 2026. It now prints "Perplexity blog, February 2026b."
- Artificial Analysis, GPT-5 Benchmarks and Analysis (aagpt5benchmarks2025), note: "7 August 2025." is now "Published 7 August 2025.", as every other web note with a publication date says. The bare date beside "Accessed 10 September 2026" could be read as another access date.
- Yang, Hou and Yang (yang2026judgechanges): note "Submitted 9 July 2026" added, as the other 2026 preprints with a single arXiv version carry their submission date (arXiv 2607.08535v1).

Every assumption, checked where the paper relies on it:
- Section 7.1 (Test, aggregation, and multiple comparisons), the sign-flip test: after the null hypothesis and its citation, the sentence now continues "; read as a test of the mean, it also needs the differences to be symmetric about their mean, since skewed differences with a mean of zero lie outside that null and can be rejected more often than the stated level allows. The test does not rely on the central-limit approximation ...". The research question is directional and about the mean, and the test is exact only under symmetry about zero; a rejection shows a mean difference only if the differences are symmetric about their mean. In the second reader's simulation (one-sided, a = 0.05, observed pattern counted, 3,000 sampled patterns and 3,000 replications) differences distributed as 1 - Exp(1), with a mean of zero, were rejected 11.1% of the time at n = 20 and 8.1% at n = 60.
- Section 7.1, the confidence interval: "so it rests on the same independence and symmetry assumptions" is now "so it rests on the same independence assumption, on each difference being symmetric about the mean difference rather than about zero, and not on the central-limit approximation". Inverting the test at each shifted value covers the true mean only if each difference is symmetric about the mean difference; symmetry about zero is the test's null, which the interval does not need. The runner's own comment above signFlipConfidenceInterval already says "each symmetric about its centre". With Exp(1) - 1 differences the second reader found coverage of 0.925 at n = 20 and 0.933 at n = 60 against a nominal 0.95.
- Section 5, S3 (Reducing judge repeat scorings), the judgment-distribution paragraph: "one call replaces the K repeats for the purpose of averaging out sampling noise" is now "one call replaces the mean of the K repeats for the purpose of averaging out sampling noise, though not their median, which Section 7.1 takes and which can differ from that mean where the judge's scores are skewed". The expected score over the judgment distribution is the limit of the mean of repeated samples, while Section 7.1 aggregates the K repeats by their median. The finding proposed that one call matches the median "only where the judge's scores are symmetric"; the second reader weakened this, since symmetry is sufficient for mean and median to coincide but not necessary.
- Appendix B.4 (The batching factor beta): "with w = 1.25, beta = 1.325" now continues ", on the assumption that the batched call itself pays no cache write, which holds where caching is requested call by call, as at Anthropic, but not where it is automatic, as at OpenAI (above)". Equation s4, and s4Beta in the runner, price each batched call at the standard input rate. Appendix B.1 says OpenAI caches prefixes of at least 1,024 tokens automatically and bills the writing call at 1.25 times; in the reduced protocol (E = R = K = 1) each batched call is the only call carrying its prefix, so at OpenAI it would itself be a writing call, and beta would be 2.65/2.25 = 1.178. The second reader named both providers in the wording.
- Section 8 (Empirical Validation of the Reduction Factors), Phase 2, the per-variant outcomes: after "... in the reference run but not in the simplified one, or vice versa." a new sentence: "Such a crossing can happen by chance alone, more often the lower a variant's power, so one crossing does not by itself show that the simplification changed the result." Phase 3 reads these outcomes as fidelity lost, but two tests below full power can disagree by chance: on Appendix B's inputs the reference has power of about 0.92 and a variant at the S6 floor 0.8. The finding's wording implied that chance crossings need unequal power and that lower power costs no fidelity; the second reader kept the substance as a separate sentence so that the "record:" list does not run on.

Nothing skipped: each old passage was found exactly once and no two corrections touched the same words; the two corrections each to Zhao et al., Cemri et al., Li et al. (2025) and the LLMs-as-Judges survey touch different fields. Left for a later pass: Appendix B.5 (The combined reduction) still says "at OpenAI's and Anthropic's w = 1.25 it is about 119", which rests on the assumption Appendix B.4 now states and which that appendix says does not hold at OpenAI.

Rebuilt with latexmk: no errors, no undefined references or citations, no BibTeX warnings, no overfull or underfull boxes; the one float-placement note as before. 135 of 135 tests pass.

## 28 October 2026, 01:33: the item left by the 00:14 pass

The 00:14 pass left one item open: Appendix B.5 still applied Anthropic's batching factor to OpenAI. Five corrections, and the runner now prices the OpenAI case.

- Appendix B.4 (The batching factor beta): after "but not where it is automatic, as at OpenAI (above)." a new sentence: "Where the batched call writes its prefix too, the denominator 1 + C rho of Equation s4 becomes w + C rho, and at OpenAI's w = 1.25, beta = 2.65/2.25, about 1.18." The closing sentence's "a factor of 1.2 to 1.325, about a sixth to a quarter" is now "a factor of 1.18 to 1.325, about a seventh to a quarter". At 1.18 batching saves 15% of the judging cost (1 - 1/1.178), about a seventh.
- Appendix B.5 (The combined reduction): "at OpenAI's and Anthropic's w = 1.25 it is about 119, and the cached row ... becomes about 179, 161 and 146x" is now "at Anthropic's w = 1.25, where the batched call pays no write, it is about 119, and the cached row ... becomes about 179, 161 and 146x; at OpenAI's, where the batched call pays the write too (beta about 1.18, above), it is 106, and that row becomes about 175, 153 and 136x, within two of Google's." F_J = 90 x 2.65/2.25 = 106 exactly; the reductions at s = 0.1, 0.3 and 0.5 are 175.3, 153.0 and 135.8, against Google's 176, 154 and 137.
- Table tab:cumulative, caption: "(2,504x at w = 1.25)" is now "(2,504x at Anthropic's w = 1.25, 2,226x at OpenAI's)". 1,890 x 1.1778 = 2,226.
- Section 6 (the overstatement of the naive product): "8 to 12 at a write multiple of w = 1.25" now says "where the batched call pays no write (Anthropic's terms)", since those figures use beta = 1.325.
- Appendix C.1 (experiment E2): "against 3.0 and 1.2 to 1.325 at the illustrative rho = 0.2" is now "1.18 to 1.325". The sentence's measured range, beta of 1.04 to 1.08 with caching at rho of 1.4 to 1.7, holds unchanged with OpenAI's case included (8.65/8.25 = 1.048 and 10.15/9.75 = 1.041).

Runner: s4Beta in src/cost-model.mjs takes batchedWrite (default false, so every existing figure is unchanged); with it the denominator is w + C rho. Five tests in tests/simplifications.test.mjs quote the new sentences, and the test of "1.04 to 1.08" now includes the OpenAI case. 138 of 138 tests pass.
