#!/usr/bin/env node
/**
 * E3 - discriminating measurement for the alpha discrepancy (Appendix D, "Why the two
 * measurements differ"): the SAME two models and settings as E1, but on competition-style
 * mathematics problems (AIME 2025 I, problems 1-5, from the public dataset math-ai/aime25 via
 * the Hugging Face datasets API) instead of analytic prose prompts. If alpha is much larger
 * here than in E1, task family explains most of the gap to the published 23x.
 *
 * Design: 5 problems x {gpt-5.6-sol: low, high} x {claude-opus-5: low, high} = 20 calls,
 * output cap 16,000 tokens (a hit is flagged; it biases alpha downward). Correctness against
 * the dataset's integer answer is recorded as a by-product. Budget stated before running: <= $6.
 */
import fs from 'node:fs'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
import { env } from './keys.mjs'
const MAX_OUT = 16000
const SYSTEM = 'Solve the competition mathematics problem. Show your reasoning briefly, then give the final answer as an integer on the last line in the form "ANSWER: <integer>".'
const MODELS = [
  { provider: 'openai', id: 'gpt-5.6-sol', inUsd: 5, outUsd: 30, efforts: ['low', 'high'] },
  { provider: 'anthropic', id: 'claude-opus-5', inUsd: 5, outUsd: 25, efforts: ['low', 'high'] },
]
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const OUT = path.join(HERE, 'results', `e3-aime-${stamp}.json`)

const rowsRes = await fetch('https://datasets-server.huggingface.co/rows?dataset=math-ai/aime25&config=default&split=test&offset=0&length=5')
const rows = (await rowsRes.json()).rows.map((r) => r.row)
const PROBLEMS = rows.map((r) => ({ id: r.id, problem: r.problem, answer: String(r.answer).trim() }))
fs.writeFileSync(path.join(HERE, 'aime-problems.json'), JSON.stringify(PROBLEMS, null, 2))
console.log('problems:', PROBLEMS.map((p) => p.id).join(', '))

const results = []
const save = () => fs.writeFileSync(OUT, JSON.stringify({ design: { MAX_OUT, SYSTEM, models: MODELS, dataset: 'math-ai/aime25 test rows 0-4 via datasets-server.huggingface.co' }, results }, null, 2))
const extract = (text) => { const m = text.match(/ANSWER:\s*(-?\d+)/i); return m ? m[1] : null }

async function call(model, effort, user) {
  const t0 = Date.now()
  if (model.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: model.id, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], max_completion_tokens: MAX_OUT, reasoning_effort: effort }) })
    const j = await r.json(); if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    const u = j.usage || {}; const text = j.choices?.[0]?.message?.content || ''
    return { ms: Date.now() - t0, inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, finish: j.choices?.[0]?.finish_reason, answer: extract(text), textChars: text.length, rawUsage: u }
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.id, max_tokens: MAX_OUT, system: SYSTEM, messages: [{ role: 'user', content: user }], output_config: { effort } }) })
  const j = await r.json(); if (!r.ok) throw new Error(`anthropic ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
  const u = j.usage || {}; const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
  return { ms: Date.now() - t0, inputTokens: u.input_tokens, outputTokens: u.output_tokens, reasoningTokens: null, finish: j.stop_reason, answer: extract(text), textChars: text.length, rawUsage: u }
}

let spent = 0
for (const model of MODELS) for (const effort of model.efforts) for (const [i, p] of PROBLEMS.entries()) {
  process.stdout.write(`${model.id} effort=${effort} problem ${i + 1}/5 ... `)
  let done = false
  for (let attempt = 1; attempt <= 3 && !done; attempt++) {
    try {
      const res = await call(model, effort, p.problem)
      const cost = (res.inputTokens * model.inUsd + res.outputTokens * model.outUsd) / 1e6
      spent += cost
      results.push({ model: model.id, effort, problem: i, datasetId: p.id, correct: res.answer != null && res.answer === p.answer, expected: p.answer, ...res, costUsd: cost, attempt })
      console.log(`out=${res.outputTokens} (reasoning=${res.reasoningTokens ?? 'n/a'}) finish=${res.finish} answer=${res.answer} (${res.answer === p.answer ? 'correct' : 'wrong'}) ${res.ms}ms $${cost.toFixed(4)} | total $${spent.toFixed(3)}`)
      done = true
    } catch (e) {
      console.log('ERROR', String(e.message).slice(0, 120), attempt < 3 ? '- retrying' : '')
      if (attempt === 3) results.push({ model: model.id, effort, problem: i, error: String(e.message).slice(0, 300) })
      await new Promise((r) => setTimeout(r, 5000 * attempt))
    }
  }
  save()
}
console.log('\n=== summary ===')
for (const model of MODELS) {
  const ok = results.filter((r) => r.model === model.id && !r.error)
  const cell = (eff, p) => ok.find((r) => r.effort === eff && r.problem === p)
  const ps = [0, 1, 2, 3, 4].filter((p) => cell('low', p) && cell('high', p))
  const sum = (eff, k) => ps.reduce((a, p) => a + (cell(eff, p)[k] || 0), 0)
  const per = ps.map((p) => (cell('high', p).outputTokens / cell('low', p).outputTokens).toFixed(2))
  console.log(`${model.id}: paired=${ps.length} alpha high/low tokens=${(sum('high', 'outputTokens') / sum('low', 'outputTokens')).toFixed(2)} per-problem=[${per.join(', ')}] | out low=${sum('low', 'outputTokens')} high=${sum('high', 'outputTokens')} | correct low=${ps.filter((p) => cell('low', p).correct).length}/${ps.length} high=${ps.filter((p) => cell('high', p).correct).length}/${ps.length} | capped: low=${ok.filter((r) => r.effort === 'low' && /length|max_tokens/.test(String(r.finish))).length} high=${ok.filter((r) => r.effort === 'high' && /length|max_tokens/.test(String(r.finish))).length}`)
}
console.log(`total spent: $${spent.toFixed(3)} -> ${OUT}`)
