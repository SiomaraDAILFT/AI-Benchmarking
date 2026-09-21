#!/usr/bin/env node
/**
 * E2 - three cheap checks of the judging-side premises (Sections 4, 5 S3/S4, 7.3; Appendix B/C).
 *
 *  (a) Prompt-cache hits across judging calls that share a rubric prefix (Equation 5's premise):
 *      three sequential calls, identical ~1.5k-token system prefix, different answers; read the
 *      provider's own cached-token count.
 *  (b) Judge test-retest at the provider's default sampling (S3): one fixed answer scored K=5
 *      times, no memory; report the spread. (The frontier models here reject `temperature`, so
 *      this is the spread a user of the default setting actually gets.)
 *  (c) Position sensitivity of a batched prompt (S4, 7.3): three answers scored together under
 *      three rotations of their order; report how each answer's score moves.
 *  Also yields rho = marginal / fixed judging tokens for the worked instance.
 *
 * Model: gpt-5.6-sol at reasoning_effort "none" (the cheapest configuration the registry has for
 * OpenAI; caching fields are richest there). Budget stated before running: <= $0.50.
 */
import fs from 'node:fs'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
import { env } from './keys.mjs'
const KEY = env.OPENAI_API_KEY
const MODEL = 'gpt-5.6-sol', IN_USD = 5, OUT_USD = 30
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const OUT = path.join(HERE, 'results', `e2-judge-cache-${stamp}.json`)
const log = { calls: [] }
const save = () => fs.writeFileSync(OUT, JSON.stringify(log, null, 2))

// A rubric long enough to exceed the 1,024-token caching minimum (about 40 criteria, DRACO-like).
const CRITERIA = Array.from({ length: 40 }, (_, i) => `C${i + 1}. The answer ${['states the method explicitly', 'names the key assumption', 'quantifies uncertainty', 'identifies the most likely failure mode', 'distinguishes correlation from causation', 'cites what evidence would change the conclusion', 'avoids unsupported numerical claims', 'addresses selection bias', 'addresses measurement error', 'gives a concrete next step'][i % 10]} (${['clearly', 'partially', 'implicitly', 'with an example', 'with a caveat', 'for the main scenario', 'for the edge case', 'for a sceptical reader', 'without jargon', 'in the conclusion'][Math.floor(i / 10) + (i % 4)]}), scored MET only if fully satisfied.`).join('\n')
const RUBRIC = `You are an expert grader. Grade the ANSWER to the TASK against the rubric below. For each criterion output MET or UNMET, then a final line "SCORE: <0-100>" equal to the percentage of criteria MET. Be strict and consistent. Output only the criterion verdicts and the score line.\n\nRUBRIC:\n${CRITERIA}`
const TASK = JSON.parse(fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'))[0]
const ANSWERS = [
  'Method: a difference-in-differences comparison between exposed and matched unexposed units, with pre-trend checks. Key assumption: parallel trends. Most likely failure: the exposed group was selected on a pre-period shock, so trends were never parallel; check by placebo tests on earlier periods. Uncertainty: report a bootstrap interval over units. Evidence that would change the conclusion: a placebo effect of similar size before exposure.',
  'I would fit a regression of the outcome on the treatment indicator with controls. The result is probably fine. If it is wrong it is because of confounders. I would present the coefficient and its p-value.',
  'Approach: (1) define the estimand precisely (average effect on the treated over the first quarter); (2) build a synthetic control from unexposed units, weighting to match pre-period outcomes; (3) quantify uncertainty with permutation over donor units; (4) the most likely way this misleads is interference - unexposed units respond to the exposed ones - so test with a spatially separated donor pool; (5) measurement: the outcome is self-reported, so validate a subsample against records; (6) what would change my mind: a permutation p-value above 0.2 or a pre-period fit that is no better than random donors; next step: pre-register the donor pool.',
]

async function judge(messages) {
  const t0 = Date.now()
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` }, body: JSON.stringify({ model: MODEL, messages, max_completion_tokens: 1500, reasoning_effort: 'none' }) })
  const j = await r.json()
  if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
  const u = j.usage || {}
  const text = j.choices?.[0]?.message?.content || ''
  const m = text.match(/SCORE:\s*([0-9]+(?:\.[0-9]+)?)/i)
  const call = { ms: Date.now() - t0, inputTokens: u.prompt_tokens, cachedTokens: u.prompt_tokens_details?.cached_tokens ?? null, outputTokens: u.completion_tokens, score: m ? Number(m[1]) : null, met: (text.match(/\bMET\b/g) || []).length, unmet: (text.match(/\bUNMET\b/g) || []).length, costUsd: ((u.prompt_tokens || 0) * IN_USD + (u.completion_tokens || 0) * OUT_USD) / 1e6, textHead: text.slice(0, 120) }
  log.calls.push(call); save()
  return call
}
const single = (answer) => [{ role: 'system', content: RUBRIC }, { role: 'user', content: `TASK:\n${TASK.context}\n\nQuestion: ${TASK.question}\n\nANSWER:\n${answer}` }]

// (a) cache hits: three calls, same prefix, different answers
console.log('(a) caching: three calls sharing the rubric prefix')
const cacheRuns = []
for (let i = 0; i < 3; i++) { const c = await judge(single(ANSWERS[i])); cacheRuns.push(c); console.log(`  call ${i + 1}: input=${c.inputTokens} cached=${c.cachedTokens} output=${c.outputTokens} score=${c.score}`) }
log.a_cache = cacheRuns

// (b) test-retest: answer 0, five independent scorings
console.log('(b) test-retest: five scorings of the same answer')
const rep = []
for (let k = 0; k < 5; k++) { const c = await judge(single(ANSWERS[0])); rep.push(c.score); console.log(`  repeat ${k + 1}: score=${c.score} (met ${c.met}/${c.met + c.unmet}) cached=${c.cachedTokens}`) }
const mean = rep.reduce((a, b) => a + b, 0) / rep.length
const sd = Math.sqrt(rep.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rep.length - 1))
log.b_retest = { scores: rep, mean, sd }
console.log(`  mean=${mean.toFixed(1)} sd=${sd.toFixed(2)} range=${Math.min(...rep)}-${Math.max(...rep)}`)

// (c) batched, three orderings
console.log('(c) batched scoring under three orderings')
const orders = [[0, 1, 2], [1, 2, 0], [2, 0, 1]]
const byAnswer = { 0: [], 1: [], 2: [] }
for (const ord of orders) {
  const body = ord.map((a, pos) => `ANSWER ${String.fromCharCode(65 + pos)}:\n${ANSWERS[a]}`).join('\n\n')
  const msgs = [{ role: 'system', content: RUBRIC.replace('Grade the ANSWER', 'Grade EACH of the three ANSWERS independently against the absolute rubric (not relative to each other)').replace('then a final line "SCORE: <0-100>"', 'then for each answer a line "SCORE A|B|C: <0-100>"') }, { role: 'user', content: `TASK:\n${TASK.context}\n\nQuestion: ${TASK.question}\n\n${body}` }]
  const t0 = Date.now()
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` }, body: JSON.stringify({ model: MODEL, messages: msgs, max_completion_tokens: 3000, reasoning_effort: 'none' }) })
  const j = await r.json(); const u = j.usage || {}; const text = j.choices?.[0]?.message?.content || ''
  const scores = {}
  for (const [re, letter] of [[/SCORE\s*A\s*:\s*([0-9.]+)/i, 'A'], [/SCORE\s*B\s*:\s*([0-9.]+)/i, 'B'], [/SCORE\s*C\s*:\s*([0-9.]+)/i, 'C']]) { const m = text.match(re); scores[letter] = m ? Number(m[1]) : null }
  ord.forEach((a, pos) => byAnswer[a].push(scores[String.fromCharCode(65 + pos)]))
  const call = { ms: Date.now() - t0, order: ord, inputTokens: u.prompt_tokens, cachedTokens: u.prompt_tokens_details?.cached_tokens ?? null, outputTokens: u.completion_tokens, scores, costUsd: ((u.prompt_tokens || 0) * IN_USD + (u.completion_tokens || 0) * OUT_USD) / 1e6 }
  log.calls.push(call); save()
  console.log(`  order ${ord.join('')}: input=${u.prompt_tokens} output=${u.completion_tokens} scores=${JSON.stringify(scores)}`)
}
log.c_positions = byAnswer
console.log('  per-answer scores across orderings:', JSON.stringify(byAnswer))

// rho: fixed tokens ~ prefix (rubric+task) ; marginal ~ per-answer tokens (from single vs batched input sizes)
const singleIn = cacheRuns.map((c) => c.inputTokens)
const batchedIn = log.calls.filter((c) => c.order).map((c) => c.inputTokens)
const marginal = (Math.max(...batchedIn) - Math.min(...singleIn)) / 2
const fixed = Math.min(...singleIn) - marginal
log.rho = { fixedTokensApprox: fixed, marginalTokensApprox: marginal, rho: marginal / fixed }
const total = log.calls.reduce((a, c) => a + (c.costUsd || 0), 0)
log.totalUsd = total; save()
console.log(`rho ~ ${(marginal / fixed).toFixed(2)} (fixed~${fixed.toFixed(0)} tok, marginal~${marginal.toFixed(0)} tok) | total spent $${total.toFixed(3)} -> ${OUT}`)
