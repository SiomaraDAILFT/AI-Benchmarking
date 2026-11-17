# Sources considered

Outside sources opened during the correction passes, whether they were used or rejected. One entry per pass.

## 18 November 2026, 00:2x pass

- None opened. The correction moves the paper's own measured figures from the body to Appendix C; it was checked against the paper's own sections (Sections 4, 5, 6 and 7.3, Appendices B and C.1 to C.2, Table tab:alpha) and tests/simplifications.test.mjs.
- Rejected: none.

## 17 November 2026, 22:4x pass

- None opened. The three findings are internal to the paper: they were checked against the paper's own sections (Sections 1, 3, 8 and 9, Appendix B.1 for the dated rate changes, Appendix C.2, C.5 and Table e1-calls for the latencies).
- Rejected: none.

## 17 November 2026, 19:4x pass

- None opened. The three findings are internal to the paper: they were checked against the paper's own sections (the abstract, Sections 1, 4, 5 (S1 and S6), 8 and 9) and against the repository's own code (app/lib/protocol.mjs for the validation mode's cost ratios, app/lib/draco-dataset.mjs and app/server.mjs for the sampling seed).
- Rejected: none.

## 17 November 2026, 17:3x pass

- None opened. The three findings are internal to the paper: they were checked against the paper's own sections (Section 8, Appendix C.2, C.4 and C.5, Table e1-calls and Table e3) and against the raw result files in experiments/results/ (e1-alpha-2026-09-11T07-41-26.json for the latencies and reasoning tokens, e3-aime-2026-09-11T08-35-02.json for the reasoning and thinking shares), which are the repository's own records.
- Rejected: none.

## 17 November 2026, 07:4x pass

- None opened. The three findings are internal to the paper: they were checked against the paper's own sections (Sections 2.2, 5, 6, 7.2 and 8, Table 1, Table 2 and Table 4).
- Rejected: none.

## 17 November 2026, 05:4x pass

- None opened. The three findings are internal to the paper: they were checked against the paper's own sections, against CORRECTIONS.md (the 12 November 00:1x pass that added the sec:retention label) and against the raw result files in experiments/results/ (e2-judge-cache, e3-aime), which are the repository's own records.
- Rejected: none.

## 17 November 2026, 03:4x pass

- Used: Wu et al., "Efficient Evaluation of LLM Performance with Statistical Guarantees", arXiv 2601.20251, abstract page read 17 November 2026. Already cited as wu2026faq. Its abstract gives "asymptotic frequentist coverage", "up to 5x effective sample size gains over strong baselines" and "matches the CI width of uniform sampling while using up to 5x fewer queries"; S6 now reports the coverage as asymptotic and the comparison with uniform sampling as the one the abstract makes.
- Checked, kept as cited: Yuan et al., arXiv 2506.09501v2 (yuan2025nondeterminism), abstract and HTML full text read 17 November 2026. The abstract says "up to 9% variation in accuracy"; Section 3.1 defines the measure as the sample standard deviation over 12 runtime configurations and Table 3 gives 9.15% for the 7B distilled reasoning model on AIME 2024 in bfloat16, which is what S2 states.
- Checked, kept as cited: Kim et al., "Correlated Errors in Large Language Models", arXiv 2506.07962 (kim2025correlated), abstract read 17 November 2026: "over 350 LLMs", "models agree 60% of the time when both models err" and "larger and more accurate models have highly correlated errors, even with distinct architectures and providers" match S5.
- Checked, kept as cited: Ballon et al., arXiv 2502.15631 (ballon2026thinksharder), abstract read 17 November 2026: "new generations of reasoning models use test-time compute more effectively" is exact; "even when controlling for difficulty of the questions" and "significantly smaller in more proficient models" support Appendix C.4's paraphrase.
- Rejected: none.
