Benchmarking AI Models Efficiently
==================================

Repository for the paper and its runnable testing mechanism.

A formal methodology, and a reference implementation, for making DRACO-style
multi-system LLM benchmarks cheap enough to run every time the set of systems
under comparison changes — not just once.

Rigorous multi-system benchmarking (comparing several AI systems or
configurations against each other, scored by one or more LLM judges against a
written rubric) is powerful precisely because it is expensive to do honestly:
task count, system count, judge count, repeated scoring, answer regeneration,
and configuration sweeps all multiply together. This repository formalizes
that cost structure, derives six concrete simplifications with closed-form
reduction factors, and shows their combined effect — an exact ratio of total
costs, not a product of factors — is roughly two orders of magnitude in the
worked instance, while being explicit about what each simplification trades
away, and proposing a way to check the theoretical savings against real
fidelity loss before trusting them.

The body of the paper is deliberately model- and provider-agnostic: every
quantity is a symbol, and no provider, model or price is named. The concrete,
dated material lives in three appendices — published DRACO-style runs
(Appendix A), a worked cost instance at current commercial terms
(Appendix B), and the measurements made for the paper (Appendix C). Every claim in the paper is sourced to a cited,
publicly reachable document; every correction made since publication, and
why, is logged in paper/CORRECTIONS.md.

What's here
-----------

- paper/ — the full methodology paper (main.tex, references.bib,
  and a compiled main.pdf). Read this first; the code below is a direct,
  equation-by-equation implementation of it.
- src/ — a dependency-free JavaScript (Node.js) reference
  implementation of the paper's numbered equations:
  - cost-model.mjs — Sections 4 to 6: generation cost; judging cost
    unbatched, batched and unbatched with prompt caching; the total; the
    batching saving; each simplification's factor (S1 to S6, including the
    batching factor beta); the two component factors F_G and F_J; the
    combined reduction as a weighted harmonic mean; and the naive product
    it replaces. Each function names the equation it implements.
  - simplifications.mjs — one convenience function, cumulativeReductionFactor,
    that takes a benchmark's design in plain terms and returns the combined
    reduction
  - power.mjs — Section 7.2: the task floor n*, the variance decomposition
    that links regenerations to it, Holm's smallest per-comparison threshold,
    the power reached at a given task count, and the normal quantile and CDF
    they use
  - effect-size.mjs — Cohen's $d_z$ and the matched-pairs rank-biserial
    correlation
  - permutation-test.mjs — a paired permutation (sign-flip) test, exact
    for small task counts and Monte Carlo above that
  - holm-bonferroni.mjs — the multiple-comparisons step-down correction
  - rank-agreement.mjs — Kendall's tau between two rankings
  - stats-utils.mjs — small shared primitives (inverse normal CDF, mean,
    sample standard deviation)
- tests/ — tests for every module above. tests/simplifications.test.mjs
  reproduces every entry of the paper's combined-reduction table (Appendix B:
  137 to 222 times, depending on the judging share of the full budget and on
  whether prompt caching is available) and the other worked figures of
  Sections 4 to 6 and Appendix C; tests/power.test.mjs reproduces the task
  floors of 128 and 184 and the power of 0.79; tests/stats.test.mjs checks the
  statistics modules against independently computed values;
  tests/runner.test.mjs checks the testing app's runner (app/lib/) against
  what the paper says it does, with a scripted model in place of any provider,
  so it makes no network call. The cited works
  themselves are not stored here; each entry in paper/references.bib gives its
  address and the date it was read.

Using it
--------

    npm test

runs the full test suite (Node's built-in test runner, no dependencies to
install).

To use the framework on your own benchmark, import whichever module you need:

    import { cumulativeReductionFactor } from './src/simplifications.mjs'
    
    const reduction = cumulativeReductionFactor({
      alpha: 10,            // your expensive setting costs 10x your cheap one
      regenerations: 3,     // you regenerate each answer 3x for reliability
      repeats: 5,           // each judge scores each answer 5x
      settingsSwept: 2,     // you sweep 2 settings per system in the full protocol
      systems: 4,           // you're comparing 4 systems
      rho: 0.3,             // reading one answer costs ~30% of the fixed rubric and task text
      fullTasks: 120,
      reducedTasks: 40,     // your own power-analysis floor
      judgingShare: 0.2,    // judging is ~20% of your FULL protocol's cost
      cacheReadDiscount: 0.1, // your provider bills cached prompt prefixes at 10% (1 = no caching)
    })

Every parameter is a property of your own benchmark design or your own
observed/published per-call costs — the framework is agnostic to how any
system under test internally produces its answer.

Reproducing the whole methodology yourself
------------------------------------------

The paper is written so that reproducing it requires no code and no API
integration: for every system you want to compare, you need only know which
questions to put to it, at which settings, using that system's own public
interface (a browser chat UI, a consumer app, or a provider's own API
playground) — record the answer and its cost exactly as that interface
reports it. The code in this repository is for the *statistical and
cost-accounting* side of the methodology (how many tasks you need, how to
combine judge scores, how to test whether one system beat another) — it does
not call any model or system on your behalf.

License
-------

Code (src/, app/, tests/, experiments/): PolyForm Noncommercial License 1.0.0,
copyright 2026 Siomara van Straalen (see LICENSE): free to use, change and share
for non-commercial purposes; commercial use requires a licence from the author.

Paper text: CC BY-NC 4.0, copyright 2026 Siomara van Straalen (see LICENSE-PAPER):
free to share and adapt with attribution for non-commercial use; commercial use
requires a licence from the author.

Running the testing mechanism (web app)
---------------------------------------

The repository includes a runnable version of the paper's protocol with a local
web interface, so that setting up a rigorous multi-system comparison costs an
afternoon rather than a project.

On Windows, double-click one of the two files in the top folder:

- Run the full DRACO test.exe opens the app on the published DRACO protocol.
- Run the efficient DRACO test.exe opens it on the reduced protocol of this paper.

Both start the same local app and open it in your browser; the choice only sets the
starting protocol, which you can change on the page. If Node.js is not installed the
launcher says so and opens the download page. Start the testing app.cmd does the
same from a console window. On any system:

    npm run app        # then open http://localhost:4173

No dependencies beyond Node.js 20+. Everything runs on your machine; the only
network traffic is to the model APIs you configure.

What you can do in the interface:

1. Connection. Either call every model through the DAILFT API with one key
   (the default: each call is an answer-only completion, sent in batches of up
   to 200 so a whole protocol is a handful of requests; usage comes back as
   token counts and as DAILFT tokens; "Load model list" fetches the callable
   models and their documented effort settings so a system can be swept, E > 1),
   or call each provider directly with that provider's key (OpenAI, Anthropic,
   Google, DeepSeek, xAI, Mistral, Moonshot, Together, Z.ai, or any
   OpenAI-compatible endpoint), which supports each provider's documented
   effort settings. Keys are held in the local server's memory for the run and
   never written to disk. Every DAILFT call carries an idempotency key, so a
   retry after a network failure never runs or charges twice, and an
   interrupted batch is resumed rather than restarted.
2. Systems under test (C) and judge panel (J): model ids are free text. In
   DAILFT mode a multi-model panel is one system: quick-panel:modelA,modelB,modelC
   (one challenge round, one synthesised answer) or full-panel:modelA,modelB,modelC
   (the full deliberation loop).
3. Tasks and rubrics (T): three starter tasks with ten binary criteria each
   are included so the mechanism runs out of the box; edit them, add your own,
   or import/export as JSON. The judge marks each criterion MET or UNMET and
   writes a score line, which it is asked to make the percentage of criteria
   MET; on these unweighted tasks the score is the number on that line, which
   need not equal the share of criteria it marked MET (an unbatched judge that
   writes no score line but marks every criterion is scored by the percentage
   it marked MET). "Load the DRACO task set" replaces them with the 100 published DRACO tasks and
   their expert rubrics (four dimensions, integer criterion weights, negative
   weights for errors), from the MIT-licensed dataset at
   https://huggingface.co/datasets/perplexity-ai/draco; a copy and its licence
   are in app/data/. Weighted tasks are scored from the judge's verdicts by
   the dataset's own rule (raw weighted sum over the positive weights,
   clamped to 0–100, per dimension too), and the rubric shown to the judge
   marks each penalty criterion so that MET means "the error is present". A
   judge answer with no verdict the runner can read, such as a refusal, is a
   missing scoring, left out of the median, not a 0. A sample size draws
   exactly that many tasks as a reproducible stratified sample, fixed before
   any system runs (S6): in proportion to the ten domains with at least one
   task from each, or, for fewer than ten tasks, one task from each of that
   many domains chosen with the same fixed seed.
4. Protocol: a preset first. DRACO as published follows the published
   protocol as the benchmark paper describes it: each answer graded alone
   against the full weighted rubric, five grading runs averaged, four
   dimensions, one setting, one generation per task (the judge prompt is this
   runner's absolute rubric prompt, since DRACO's own prompt text is not
   published). Reduced (this paper) applies the simplifications with the
   regenerations R, repeat scorings K and batched judging (S4) you set; each
   batch is shown in a random order drawn from a fixed seed and rotated one
   place per repeat, so repeats double as position calibration. Validation:
   run both runs the complete protocol of Section 8 (Phase 1) once as the
   reference, with every ticked setting, each answer judged in its own call,
   the reference R and K you set and the same median rule, then the reduced
   protocol on the same systems and tasks, and reports rank agreement
   (Kendall's τ over the systems, each at the setting it is compared at),
   whether the leader is the same, whether each pre-registered comparison
   reaches the same verdict, and the calls and tokens saved. DRACO as
   published stays available as a preset of its own. Family-wise α and the
   baseline system complete the settings; a system with several settings is
   compared at its first ticked setting unless you choose another. The plan
   panel shows the call counts from Equations 1–3 before anything is spent.
5. Run with live progress, then results: per-condition means, the
   pre-registered one-sided paired permutation tests (the sampled p-value
   counts the observed sign pattern, so it is never zero) with Holm
   correction across every pre-registered comparison, including any that
   could not be tested, Cohen's d_z and the confidence interval found by
   inverting the test, all other pairs as exploratory two-sided tests, judge
   test–retest and between-judge spread, usage, and downloads of the complete
   raw table (JSON) and the scores (CSV), with each judge's verdict on each
   criterion and the order the answers were shown in; nothing is averaged
   away before storage (Section 7.4 of the paper).

Judging is blind (systems appear as letters), absolute (rubric criteria
MET/UNMET), and never told which system produced an answer.

The DAILFT API features this tool relies on (answer-only completions, batches,
per-request effort, token-level usage, the model catalogue, idempotency, the
quick-panel round) are listed with their status in
app/DAILFT-API-FEATURE-REQUESTS.md. Against a DAILFT deployment that predates
them, "Load model list" reports the missing endpoint and DAILFT mode falls back
to nothing cleverer than an error; direct mode is unaffected.
