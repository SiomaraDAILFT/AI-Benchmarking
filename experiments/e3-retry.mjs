#!/usr/bin/env node
/** E3 retry: re-run only the errored cells in the latest e3-aime-*.json and merge in place. */
import fs from 'node:fs'
import path from 'node:path'
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
import { env } from './keys.mjs'
const files = fs.readdirSync(path.join(HERE, 'results')).filter((f) => /^e3-aime-.*\.json$/.test(f)).sort()
const FILE = path.join(HERE, 'results', files[files.length - 1])
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'))
const PROBLEMS = JSON.parse(fs.readFileSync(path.join(HERE, 'aime-problems.json'), 'utf8'))
const { MAX_OUT, SYSTEM, models } = data.design
const byId = Object.fromEntries(models.map((m) => [m.id, m]))
const extract = (text) => { const m = text.match(/ANSWER:\s*(-?\d+)/i); return m ? m[1] : null }
async function call(model, effort, user) {
  const t0 = Date.now()
  if (model.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: model.id, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], max_completion_tokens: MAX_OUT, reasoning_effort: effort }) })
    const j = await r.json(); if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 160)}`)
    const u = j.usage || {}; const text = j.choices?.[0]?.message?.content || ''
    return { ms: Date.now() - t0, inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, finish: j.choices?.[0]?.finish_reason, answer: extract(text), textChars: text.length, rawUsage: u }
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.id, max_tokens: MAX_OUT, system: SYSTEM, messages: [{ role: 'user', content: user }], output_config: { effort } }) })
  const j = await r.json(); if (!r.ok) throw new Error(`anthropic ${r.status}: ${JSON.stringify(j).slice(0, 160)}`)
  const u = j.usage || {}; const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
  return { ms: Date.now() - t0, inputTokens: u.input_tokens, outputTokens: u.output_tokens, reasoningTokens: null, finish: j.stop_reason, answer: extract(text), textChars: text.length, rawUsage: u }
}
let spent = 0
for (const [idx, r] of data.results.entries()) {
  if (!r.error) continue
  const model = byId[r.model]; const p = PROBLEMS[r.problem]
  for (let attempt = 1; attempt <= 4; attempt++) {
    process.stdout.write(`retry ${r.model} effort=${r.effort} problem ${r.problem + 1} (attempt ${attempt}) ... `)
    try {
      const res = await call(model, r.effort, p.problem)
      const cost = (res.inputTokens * model.inUsd + res.outputTokens * model.outUsd) / 1e6
      spent += cost
      data.results[idx] = { model: r.model, effort: r.effort, problem: r.problem, datasetId: p.id, correct: res.answer != null && res.answer === p.answer, expected: p.answer, ...res, costUsd: cost, retried: attempt }
      console.log(`out=${res.outputTokens} (reasoning=${res.reasoningTokens ?? 'n/a'}) answer=${res.answer} (${res.answer === p.answer ? 'correct' : 'wrong'}) ${res.ms}ms $${cost.toFixed(4)}`)
      break
    } catch (e) {
      console.log('ERROR', String(e.message).slice(0, 100))
      if (attempt === 4) data.results[idx] = { ...r, error: String(e.message).slice(0, 300), retriedAttempts: 4 }
      await new Promise((res) => setTimeout(res, 15000 * attempt))
    }
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}
console.log(`retry spend: $${spent.toFixed(3)}; still missing: ${data.results.filter((r) => r.error).length}`)
