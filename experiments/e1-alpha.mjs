#!/usr/bin/env node
/**
 * E1 — measure the setting-cost ratio alpha (Section 5, S1; Appendix B).
 *
 * Question: for the SAME prompt, how many more output tokens (and dollars) does a
 * frontier model consume at a high reasoning-effort setting than at a low one?
 *
 * Design: N research-style prompts (the product's own example set, experiments/prompts.json)
 * x two models x effort settings. Sequential calls; every raw usage block is kept.
 * Output tokens are capped (MAX_OUT) to bound spend; a capped call is flagged, because a
 * cap biases alpha DOWNWARD - it can only make the ratio look smaller than it is.
 *
 * Permission: the owner, 11 Sept 2026 - "limited model calls where needed to verify basic
 * assumptions with measurements". Budget stated before running: <= $8.
 *
 * Keys are read from web/.env.local and never printed.
 */
import fs from 'node:fs'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
import { env } from './keys.mjs'
const OPENAI_KEY = env.OPENAI_API_KEY, ANTHROPIC_KEY = env.ANTHROPIC_API_KEY
if (!OPENAI_KEY || !ANTHROPIC_KEY) throw new Error('missing provider key(s) in .env.local')

const MAX_OUT = Number(process.env.E1_MAX_OUT || 24000)
const PROMPTS = JSON.parse(fs.readFileSync(path.join(HERE, 'prompts.json'), 'utf8'))
const N = Number(process.env.E1_N || PROMPTS.length)
const SYSTEM = 'You are a careful analyst. Answer the question thoroughly for a professional reader: state your method, the key assumptions, the most likely failure modes, and what evidence would change your conclusion. Use headings and be concrete.'

// Prices from the product registry (src/lib/models.ts), USD per 1M tokens, 11 Sept 2026.
const MODELS = [
  { provider: 'openai', id: 'gpt-5.6-sol', inUsd: 5, outUsd: 30, efforts: ['none', 'low', 'high'] },
  { provider: 'anthropic', id: 'claude-opus-5', inUsd: 5, outUsd: 25, efforts: ['low', 'high'] },
]

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const OUT = path.join(HERE, 'results', `e1-alpha-${stamp}.json`)
const results = []
const save = () => fs.writeFileSync(OUT, JSON.stringify({ design: { MAX_OUT, N, SYSTEM, models: MODELS }, results }, null, 2))

async function callOpenAI(model, effort, user) {
  const body = { model: model.id, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }], max_completion_tokens: MAX_OUT, reasoning_effort: effort }
  const t0 = Date.now()
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_KEY}` }, body: JSON.stringify(body) })
  const j = await r.json()
  if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
  const u = j.usage || {}
  return { ms: Date.now() - t0, inputTokens: u.prompt_tokens, outputTokens: u.completion_tokens, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, cachedTokens: u.prompt_tokens_details?.cached_tokens ?? null, finish: j.choices?.[0]?.finish_reason, textChars: (j.choices?.[0]?.message?.content || '').length, rawUsage: u }
}

async function callAnthropic(model, effort, user) {
  const body = { model: model.id, max_tokens: MAX_OUT, system: SYSTEM, messages: [{ role: 'user', content: user }], output_config: { effort } }
  const t0 = Date.now()
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) })
  const j = await r.json()
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${JSON.stringify(j).slice(0, 300)}`)
  const u = j.usage || {}
  const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
  return { ms: Date.now() - t0, inputTokens: u.input_tokens, outputTokens: u.output_tokens, reasoningTokens: null, cachedTokens: u.cache_read_input_tokens ?? null, finish: j.stop_reason, textChars: text.length, rawUsage: u }
}

let spent = 0
for (const model of MODELS) {
  for (const effort of model.efforts) {
    for (let i = 0; i < N; i++) {
      const p = PROMPTS[i]
      const user = `${p.context}\n\nQuestion: ${p.question}`
      process.stdout.write(`${model.id} effort=${effort} prompt ${i + 1}/${N} ... `)
      try {
        const res = model.provider === 'openai' ? await callOpenAI(model, effort, user) : await callAnthropic(model, effort, user)
        const cost = (res.inputTokens * model.inUsd + res.outputTokens * model.outUsd) / 1e6
        spent += cost
        results.push({ model: model.id, effort, prompt: i, industry: p.industry, ...res, costUsd: cost })
        console.log(`out=${res.outputTokens} (reasoning=${res.reasoningTokens ?? 'n/a'}) finish=${res.finish} ${res.ms}ms $${cost.toFixed(4)} | running total $${spent.toFixed(3)}`)
      } catch (e) {
        results.push({ model: model.id, effort, prompt: i, industry: p.industry, error: String(e.message).slice(0, 300) })
        console.log('ERROR', String(e.message).slice(0, 200))
      }
      save()
    }
  }
}

// Summary: alpha per model = sum(output tokens at high) / sum(output tokens at low), same prompts.
console.log('\n=== summary ===')
for (const model of MODELS) {
  const rows = results.filter((r) => r.model === model.id && !r.error)
  const sum = (eff, k) => rows.filter((r) => r.effort === eff).reduce((a, r) => a + (r[k] || 0), 0)
  for (const eff of model.efforts) {
    const n = rows.filter((r) => r.effort === eff).length
    const capped = rows.filter((r) => r.effort === eff && /length|max_tokens/.test(String(r.finish))).length
    console.log(`${model.id} ${eff.padEnd(5)} n=${n} outTokens=${sum(eff, 'outputTokens')} cost=$${sum(eff, 'costUsd').toFixed(3)} capped=${capped}`)
  }
  const lo = model.efforts.includes('low') ? 'low' : model.efforts[0]
  const aTok = sum('high', 'outputTokens') / Math.max(1, sum(lo, 'outputTokens'))
  const aUsd = sum('high', 'costUsd') / Math.max(1e-9, sum(lo, 'costUsd'))
  console.log(`${model.id} alpha(high/${lo}) by output tokens = ${aTok.toFixed(2)}; by cost = ${aUsd.toFixed(2)}`)
}
console.log(`total spent: $${spent.toFixed(3)}  -> ${OUT}`)
