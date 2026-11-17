# Sources considered

Outside sources opened during the correction passes, whether they were used or rejected. One entry per pass.

## 17 November 2026, 03:4x pass

- Used: Wu et al., "Efficient Evaluation of LLM Performance with Statistical Guarantees", arXiv 2601.20251, abstract page read 17 November 2026. Already cited as wu2026faq. Its abstract gives "asymptotic frequentist coverage", "up to 5x effective sample size gains over strong baselines" and "matches the CI width of uniform sampling while using up to 5x fewer queries"; S6 now reports the coverage as asymptotic and the comparison with uniform sampling as the one the abstract makes.
- Checked, kept as cited: Yuan et al., arXiv 2506.09501v2 (yuan2025nondeterminism), abstract and HTML full text read 17 November 2026. The abstract says "up to 9% variation in accuracy"; Section 3.1 defines the measure as the sample standard deviation over 12 runtime configurations and Table 3 gives 9.15% for the 7B distilled reasoning model on AIME 2024 in bfloat16, which is what S2 states.
- Checked, kept as cited: Kim et al., "Correlated Errors in Large Language Models", arXiv 2506.07962 (kim2025correlated), abstract read 17 November 2026: "over 350 LLMs", "models agree 60% of the time when both models err" and "larger and more accurate models have highly correlated errors, even with distinct architectures and providers" match S5.
- Checked, kept as cited: Ballon et al., arXiv 2502.15631 (ballon2026thinksharder), abstract read 17 November 2026: "new generations of reasoning models use test-time compute more effectively" is exact; "even when controlling for difficulty of the questions" and "significantly smaller in more proficient models" support Appendix C.4's paraphrase.
- Rejected: none.
