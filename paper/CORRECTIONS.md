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
- Section 4: a rubric with its task and question "can fall on either side of" the minimum prefix lengths, not "will usually exceed" them (about 85% of DRACO's tasks clear OpenAI's 1,024 tokens and none clears 4,096).
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
