#!/usr/bin/env node
/**
 * E1 retry: re-run only the (model, effort, prompt) cells that errored (transient provider
 * 500s) in the most recent e1-alpha-*.json, and merge the results into that file in place.
 * Same design, same budget accounting; nothing that succeeded is re-run.
 */
import fs from 'node:fs'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
import { env } from './keys.mjs'
const files = fs.readdirSync(path.join(HERE, 'results')).filter((f) => /^e1-alpha-.*\.json$/.test(f)).sort()
const FILE = path.join(HERE, 'results', files[files.length - 1])
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'))
const PROMPTS = JSON.parse(fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'))
const { MAX_OUT, SYSTEM, models } = data.design
const byId = Object.fromEntries(models.map((m) => [m.id, m]))

async function call(model, effort, user) {
  const t0 = Date.now()
  if (model.provider === 'openai') {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: model.id, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], max_completion_tokens: MAX_OUT, reasoning_effort: effort }) })
    const j = await r.json(); if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    const u = j.usage || {}
    return { ms: Date.now() - t0, inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, cachedTokens: u.prompt_tokens_details?.cached_tokens ?? null, finish: j.choices?.[0]?.finish_reason, textChars: (j.choices?.[0]?.message?.content || '').length, rawUsage: u }
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: model.id, max_tokens: MAX_OUT, system: SYSTEM, messages: [{ role: 'user', content: user }], output_config: { effort } }) })
  const j = await r.json(); if (!r.ok) throw new Error(`anthropic ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
  const u = j.usage || {}
  return { ms: Date.now() - t0, inputTokens: u.input_tokens, outputTokens: u.output_tokens, reasoningTokens: null, cachedTokens: u.cache_read_input_tokens ?? null, finish: j.stop_reason, textChars: (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').length, rawUsage: u }
}

let spent = 0
for (const [idx, r] of data.results.entries()) {
  if (!r.error) continue
  const model = byId[r.model]; const p = PROMPTS[r.prompt]
  const user = `${p.context}\n\nQuestion: ${p.question}`
  for (let attempt = 1; attempt <= 3; attempt++) {
    process.stdout.write(`retry ${r.model} effort=${r.effort} prompt ${r.prompt + 1} (attempt ${attempt}) ... `)
    try {
      const res = await call(model, r.effort, user)
      const cost = (res.inputTokens * model.inUsd + res.outputTokens * model.outUsd) / 1e6
      spent += cost
      data.results[idx] = { model: r.model, effort: r.effort, prompt: r.prompt, industry: r.industry, ...res, costUsd: cost, retried: attempt }
      console.log(`out=${res.outputTokens} (reasoning=${res.reasoningTokens ?? 'n/a'}) finish=${res.finish} ${res.ms}ms $${cost.toFixed(4)}`)
      break
    } catch (e) {
      console.log('ERROR', String(e.message).slice(0, 160))
      if (attempt === 3) data.results[idx] = { ...r, error: String(e.message).slice(0, 300), retriedAttempts: 3 }
      await new Promise((res) => setTimeout(res, 5000 * attempt))
    }
  }
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}
console.log(`retry spend: $${spent.toFixed(3)} -> ${FILE}`)
