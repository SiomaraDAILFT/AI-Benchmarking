/**
 * Provider adapters for the testing mechanism.
 *
 * Two ways to reach a model:
 *  - 'dailft'  (default): every call goes through the DAILFT public API with ONE key.
 *                Plain model ids are answer-only completions (POST /api/v1/completions),
 *                sent as batches of up to 200 when batching is on; effort settings come
 *                from the API's model catalogue (GET /api/v1/models); usage comes back as
 *                token counts and as DAILFT tokens. `quick-panel:` and `full-panel:`
 *                prefixes run a DAILFT panel as one system under test.
 *  - 'direct':  each provider's own API with that provider's key. Supports the effort
 *                setting each provider documents (OpenAI reasoning_effort, Anthropic
 *                output_config.effort, Google thinkingConfig.thinkingLevel); any other
 *                OpenAI-compatible endpoint is reached through 'openai-compatible' with a
 *                base URL.
 *
 * Keys are passed in per call and never persisted by this module.
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function withRetry(fn, { attempts = 4, baseDelayMs = 3000 } = {}) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try { return await fn() } catch (e) {
      last = e
      const msg = String(e.message || e)
      const transient = /\b(429|500|502|503|504|overloaded|ECONNRESET|ETIMEDOUT|fetch failed)\b/i.test(msg)
      if (!transient || i === attempts) throw e
      await sleep(baseDelayMs * i)
    }
  }
  throw last
}

/** Normalised result of one model call. */
function result({ text, inputTokens = null, outputTokens = null, reasoningTokens = null, dailftTokens = null, raw = null, ms }) {
  return { text, inputTokens, outputTokens, reasoningTokens, dailftTokens, raw, ms }
}

// ---------------------------------------------------------------- DAILFT API

const newKey = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)
const authHeaders = (apiKey, json = false) => ({ authorization: `Bearer ${apiKey}`, ...(json ? { 'content-type': 'application/json' } : {}) })
const TERMINAL_BATCH = new Set(['complete', 'failed', 'interrupted'])

/** The body of one POST /api/v1/completions item. The instruction travels as the system prompt
 *  (never folded into the prompt), so a fixed prefix can be served from a provider's cache. */
export function completionBody({ modelId, system, user, context = '', effort, maxOutputTokens }) {
  const body = { model: modelId, prompt: user }
  if (system) body.instructions = system
  if (context) body.context = context
  if (effort) body.effort = effort
  if (maxOutputTokens) body.maxOutputTokens = maxOutputTokens
  return body
}

/** A completion response (single or batch item) as this module's normalised result. */
export function fromCompletion(c, ms) {
  if (!c || !c.ok) throw new Error(`dailft: ${(c && c.model) || 'model'} returned no answer (${(c && c.error) || 'unknown'})`)
  const u = c.usage || {}
  return result({
    text: c.output || '',
    inputTokens: u.inputTokens ?? null,
    outputTokens: u.outputTokens ?? null,
    reasoningTokens: u.reasoningTokens ?? null,
    dailftTokens: c.dailftTokens ?? null,
    raw: { completionId: c.id, batchId: c.batchId || null, effort: c.effort ?? null, temperature: c.temperature ?? null, attempts: c.attempts ?? null, replayed: !!c.replayed, warnings: c.warnings || [] },
    ms,
  })
}

/**
 * Groups calls that arrive within a short window into one POST /api/v1/batches request
 * (up to 200 items), polls the batch, and settles each caller's promise from the item at
 * its position. A batch the server reports as `interrupted` is resubmitted with the same
 * per-item idempotency keys, so completed answers are replayed at no charge and only the
 * missing ones run. One batch is one request against the API's hourly limit, whatever
 * its size, which is what makes a thousands-of-calls protocol practical through DAILFT.
 */
export function createDailftBatcher({ baseUrl, apiKey, fetchImpl = fetch, windowMs = 300, maxItems = 200, pollMs = 3000, timeoutMs = 3600000, maxResubmits = 5 }) {
  let pending = []
  let timer = null
  const submissions = []

  const schedule = () => { if (!timer) timer = setTimeout(flush, windowMs) }
  const flush = () => {
    timer = null
    const items = pending.splice(0, maxItems)
    if (pending.length) schedule()
    if (items.length) submissions.push(submit(items))
  }

  const settle = (it, res) => {
    it.settled = true
    try { it.resolve(fromCompletion(res, Date.now() - it.t0)) } catch (e) { it.reject(e) }
  }

  async function submit(items) {
    let batchItems = items
    try {
      for (let round = 0; round <= maxResubmits && batchItems.length; round++) {
        const created = await withRetry(async () => {
          const r = await fetchImpl(`${baseUrl}/api/v1/batches`, {
            method: 'POST',
            headers: { ...authHeaders(apiKey, true), 'idempotency-key': newKey() },
            body: JSON.stringify({ items: batchItems.map((it) => ({ ...it.body, idempotencyKey: it.key })) }),
          })
          const j = await r.json().catch(() => ({}))
          if (!r.ok) throw new Error(`dailft batch ${r.status}: ${j.error || ''}${j.detail ? ' ' + j.detail : ''}${j.position != null ? ` (item ${j.position})` : ''}`)
          return j
        })
        const deadline = Date.now() + timeoutMs
        let b = null
        while (Date.now() < deadline) {
          const r = await fetchImpl(`${baseUrl}/api/v1/batches/${created.id}`, { headers: authHeaders(apiKey) })
          b = await r.json().catch(() => ({}))
          if (!r.ok) throw new Error(`dailft batch poll ${r.status}: ${b.error || ''}`)
          if (TERMINAL_BATCH.has(b.status)) break
          await sleep(pollMs)
        }
        if (!b || !TERMINAL_BATCH.has(b.status)) throw new Error(`dailft batch ${created.id} did not finish within ${timeoutMs / 1000}s`)
        const remaining = []
        for (let p = 0; p < batchItems.length; p++) {
          const it = batchItems[p]
          const res = (b.items || []).find((x) => x.position === p)
          if (res && (res.status === 'complete' || res.status === 'failed')) settle(it, res)
          else remaining.push(it)
        }
        if (!remaining.length) return
        if (b.status !== 'interrupted') { for (const it of remaining) it.reject(new Error(`dailft batch ${b.status}: item was not processed`)); return }
        batchItems = remaining
      }
      for (const it of batchItems) if (!it.settled) it.reject(new Error('dailft batch: interrupted repeatedly; give up'))
    } catch (e) {
      for (const it of batchItems) if (!it.settled) it.reject(e)
    }
  }

  return {
    enqueue(body) {
      return new Promise((resolve, reject) => {
        pending.push({ body, key: newKey(), resolve, reject, t0: Date.now(), settled: false })
        schedule()
      })
    },
    /** Send whatever is waiting now, without waiting for the window. */
    flushNow() { if (timer) { clearTimeout(timer); timer = null } flush() },
    get pendingCount() { return pending.length },
    async drain() { await Promise.allSettled(submissions) },
  }
}

const batchers = new Map()
export function dailftBatcherFor(opts) {
  const k = `${opts.baseUrl}|${opts.apiKey}`
  if (!batchers.has(k)) batchers.set(k, createDailftBatcher(opts))
  return batchers.get(k)
}

/**
 * One call through the DAILFT public API.
 *   - plain model id:                 POST /api/v1/completions (or a batch item when `batch` is on)
 *   - quick-panel:<idA>,<idB>,...:    a quick run plus one challenge round; the synthesised answer is scored
 *   - full-panel:<idA>,<idB>,...:     a full run plus the full-panel loop; the final answer is scored
 * Every single call carries an idempotency key, so a retry after a transient failure never
 * runs or charges twice.
 */
export async function callDailft({ baseUrl = 'https://dailft.com', apiKey, modelId, system, user, context = '', effort, maxOutputTokens, batch = true, fetchImpl = fetch, pollMs = 2500, timeoutMs = 600000 }) {
  if (!apiKey) throw new Error('DAILFT API key missing')
  const id = String(modelId)
  for (const mode of ['full', 'quick']) {
    const prefix = `${mode}-panel:`
    if (id.startsWith(prefix)) {
      const models = id.slice(prefix.length).split(',').map((s) => s.trim()).filter(Boolean)
      return callDailftPanel({ mode, baseUrl, apiKey, models, system, user, context, effort, fetchImpl, pollMs, timeoutMs: Math.max(timeoutMs, 1200000) })
    }
  }
  const body = completionBody({ modelId: id, system, user, context, effort, maxOutputTokens })
  if (batch) return dailftBatcherFor({ baseUrl, apiKey, fetchImpl }).enqueue(body)
  const t0 = Date.now()
  const key = newKey()
  const c = await withRetry(async () => {
    const r = await fetchImpl(`${baseUrl}/api/v1/completions`, { method: 'POST', headers: { ...authHeaders(apiKey, true), 'idempotency-key': key }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`dailft ${r.status}: ${j.error || JSON.stringify(j).slice(0, 200)}${j.detail ? ' ' + j.detail : ''}`)
    return j
  })
  return fromCompletion(c, Date.now() - t0)
}

/**
 * A DAILFT panel as one system under test: a run over several models (POST /api/v1/runs), then
 * one challenge round (quick-panel) or the full-panel loop (full-panel). The system's usage is
 * the per-model usage of the initial answers plus the panel's final answer, as the API reports it.
 */
export async function callDailftPanel({ mode, baseUrl, apiKey, models, system, user, context = '', effort, fetchImpl = fetch, pollMs = 2500, timeoutMs = 1200000 }) {
  if (models.length < 2) throw new Error(`${mode}-panel needs at least two underlying model ids`)
  const t0 = Date.now()
  const question = system ? `${system}\n\n${user}` : user
  const create = await withRetry(async () => {
    const body = { question, context, models, runMode: mode }
    if (effort) body.effort = effort
    const r = await fetchImpl(`${baseUrl}/api/v1/runs`, { method: 'POST', headers: authHeaders(apiKey, true), body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`dailft ${r.status}: ${j.error || JSON.stringify(j).slice(0, 200)}${j.detail ? ' ' + j.detail : ''}`)
    return j
  })
  const id = create.id
  let run = null
  while (Date.now() - t0 < timeoutMs) {
    const r = await fetchImpl(`${baseUrl}/api/v1/runs/${id}`, { headers: authHeaders(apiKey) })
    run = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`dailft poll ${r.status}: ${run.error || ''}`)
    if (run.status === 'complete' || run.status === 'failed') break
    await sleep(pollMs)
  }
  if (!run || run.status !== 'complete') throw new Error(`dailft ${mode} panel: initial answers did not complete (status ${run && run.status})`)
  const fp = await withRetry(async () => {
    const r = await fetchImpl(`${baseUrl}/api/v1/runs/${id}/${mode}-panel`, { method: 'POST', headers: authHeaders(apiKey) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`dailft ${mode}-panel ${r.status}: ${j.error || ''}`)
    return j
  }, { attempts: 2, baseDelayMs: 5000 })
  const final = mode === 'full' ? fp.fullPanelFinal : fp.quickPanelFinal
  if (!final || !final.ok) throw new Error(`dailft ${mode} panel: no final answer returned`)
  const results = fp.results || []
  const sum = (k) => results.reduce((a, x) => a + ((x.usage && x.usage[k]) || 0), 0) + ((final.usage && final.usage[k]) || 0)
  const dailftTokens = results.reduce((a, x) => a + (x.dailftTokens || 0), 0)
  return result({ text: final.output || '', inputTokens: sum('inputTokens'), outputTokens: sum('outputTokens'), reasoningTokens: sum('reasoningTokens'), dailftTokens, raw: { runId: id, mode, iterations: fp.fullPanelIterations, leadModelId: final.modelId }, ms: Date.now() - t0 })
}

/** Kept for callers of the first version; a full panel is `callDailftPanel` with mode 'full'. */
export const callDailftFullPanel = (args) => callDailftPanel({ ...args, mode: 'full' })

/** GET /api/v1/models: the callable models, their documented effort settings, and list prices in DAILFT tokens. */
export async function fetchDailftModels({ baseUrl = 'https://dailft.com', apiKey, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('DAILFT API key missing')
  const r = await fetchImpl(`${baseUrl}/api/v1/models`, { headers: authHeaders(apiKey) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`dailft models ${r.status}: ${j.error || ''}`)
  return Array.isArray(j.models) ? j.models : []
}

// ---------------------------------------------------------------- Direct providers

export async function callOpenAI({ baseUrl = 'https://api.openai.com/v1', apiKey, modelId, system, user, effort, maxOutputTokens = 16000, temperature }) {
  if (!apiKey) throw new Error('OpenAI API key missing')
  const t0 = Date.now()
  const body = { model: modelId, messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: user }], max_completion_tokens: maxOutputTokens }
  if (effort) body.reasoning_effort = effort
  if (temperature != null) body.temperature = temperature
  const j = await withRetry(async () => {
    const r = await fetch(`${baseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`openai ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    return j
  })
  const u = j.usage || {}
  return result({ text: j.choices?.[0]?.message?.content || '', inputTokens: u.prompt_tokens ?? null, outputTokens: u.completion_tokens ?? null, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, raw: { finish: j.choices?.[0]?.finish_reason, usage: u }, ms: Date.now() - t0 })
}

export async function callOpenAICompatible(args) {
  // DeepSeek, xAI, Mistral, Moonshot, Together, Z.ai and others expose the same wire shape.
  // Some reject max_completion_tokens; fall back to max_tokens on a 400.
  try { return await callOpenAI(args) } catch (e) {
    if (!/400/.test(String(e.message))) throw e
    const t0 = Date.now()
    const body = { model: args.modelId, messages: [...(args.system ? [{ role: 'system', content: args.system }] : []), { role: 'user', content: args.user }], max_tokens: args.maxOutputTokens || 16000 }
    if (args.effort) body.reasoning_effort = args.effort
    const r = await fetch(`${args.baseUrl}/chat/completions`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${args.apiKey}` }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`${args.baseUrl} ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    const u = j.usage || {}
    return result({ text: j.choices?.[0]?.message?.content || '', inputTokens: u.prompt_tokens ?? null, outputTokens: u.completion_tokens ?? null, reasoningTokens: u.completion_tokens_details?.reasoning_tokens ?? null, raw: { usage: u }, ms: Date.now() - t0 })
  }
}

export async function callAnthropic({ apiKey, modelId, system, user, effort, maxOutputTokens = 16000 }) {
  if (!apiKey) throw new Error('Anthropic API key missing')
  const t0 = Date.now()
  const body = { model: modelId, max_tokens: maxOutputTokens, messages: [{ role: 'user', content: user }] }
  if (system) body.system = system
  if (effort) body.output_config = { effort }
  const j = await withRetry(async () => {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`anthropic ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    return j
  })
  const u = j.usage || {}
  const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
  return result({ text, inputTokens: u.input_tokens ?? null, outputTokens: u.output_tokens ?? null, raw: { stop: j.stop_reason, usage: u }, ms: Date.now() - t0 })
}

export async function callGoogle({ apiKey, modelId, system, user, effort, maxOutputTokens = 16000 }) {
  if (!apiKey) throw new Error('Google API key missing')
  const t0 = Date.now()
  const body = { contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens } }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (effort) body.generationConfig.thinkingConfig = { thinkingLevel: effort }
  const j = await withRetry(async () => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey }, body: JSON.stringify(body) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(`google ${r.status}: ${JSON.stringify(j).slice(0, 200)}`)
    return j
  })
  const u = j.usageMetadata || {}
  const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  return result({ text, inputTokens: u.promptTokenCount ?? null, outputTokens: u.candidatesTokenCount ?? null, reasoningTokens: u.thoughtsTokenCount ?? null, raw: { usage: u }, ms: Date.now() - t0 })
}

/** Known direct providers and the key each needs. Model ids are free text; these are only defaults. */
export const DIRECT_PROVIDERS = {
  openai: { label: 'OpenAI', keyName: 'OPENAI_API_KEY', call: callOpenAI, efforts: ['none', 'low', 'medium', 'high', 'xhigh', 'max'] },
  anthropic: { label: 'Anthropic', keyName: 'ANTHROPIC_API_KEY', call: callAnthropic, efforts: ['low', 'medium', 'high', 'xhigh', 'max'] },
  google: { label: 'Google', keyName: 'GOOGLE_API_KEY', call: callGoogle, efforts: ['minimal', 'low', 'medium', 'high'] },
  deepseek: { label: 'DeepSeek', keyName: 'DEEPSEEK_API_KEY', baseUrl: 'https://api.deepseek.com/v1', call: callOpenAICompatible, efforts: ['low', 'high', 'max'] },
  xai: { label: 'xAI', keyName: 'XAI_API_KEY', baseUrl: 'https://api.x.ai/v1', call: callOpenAICompatible, efforts: ['low', 'medium', 'high'] },
  mistral: { label: 'Mistral', keyName: 'MISTRAL_API_KEY', baseUrl: 'https://api.mistral.ai/v1', call: callOpenAICompatible, efforts: [] },
  moonshot: { label: 'Moonshot', keyName: 'MOONSHOT_API_KEY', baseUrl: 'https://api.moonshot.ai/v1', call: callOpenAICompatible, efforts: ['low', 'high', 'max'] },
  together: { label: 'Together', keyName: 'TOGETHER_API_KEY', baseUrl: 'https://api.together.xyz/v1', call: callOpenAICompatible, efforts: [] },
  zai: { label: 'Z.ai', keyName: 'ZAI_API_KEY', baseUrl: 'https://api.z.ai/api/paas/v4', call: callOpenAICompatible, efforts: ['none', 'low', 'high', 'max'] },
  /* Added 14 Sept 2026, the day these four accounts were funded. Endpoints are the ones the
     DAILFT product calls (web/src/lib/models.ts): Alibaba's Singapore region, MiniMax direct,
     NVIDIA's hosted catalogue, Cohere's OpenAI-compatible route. Thinking switches: Alibaba takes
     enable_thinking:false, MiniMax takes thinking:{type:'disabled'}; the runner's plain
     OpenAI-compatible caller sends neither, so a run that wants them off passes the model's
     documented effort setting through `settings` where the provider supports reasoning_effort,
     or accepts the model's default. Recorded per run in the raw table either way. */
  alibaba: { label: 'Alibaba (Qwen), Singapore', keyName: 'ALIBABA_API_KEY', baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', call: callOpenAICompatible, efforts: [] },
  minimax: { label: 'MiniMax', keyName: 'MINIMAX_API_KEY', baseUrl: 'https://api.minimax.io/v1', call: callOpenAICompatible, efforts: [] },
  nvidia: { label: 'NVIDIA (hosted catalogue)', keyName: 'NVIDIA_API_KEY', baseUrl: 'https://integrate.api.nvidia.com/v1', call: callOpenAICompatible, efforts: [] },
  cohere: { label: 'Cohere', keyName: 'COHERE_API_KEY', baseUrl: 'https://api.cohere.ai/compatibility/v1', call: callOpenAICompatible, efforts: [] },
  'openai-compatible': { label: 'Other (OpenAI-compatible)', keyName: 'CUSTOM_API_KEY', baseUrl: '', call: callOpenAICompatible, efforts: [] },
}

/**
 * Route one call. `system` = { id, provider, modelId, baseUrl? }, `connection` =
 * { mode: 'dailft'|'direct', dailftKey, dailftBaseUrl, keys: {provider: key} }.
 */
export async function callModel({ system, connection, prompt, effort, maxOutputTokens }) {
  if (connection.mode === 'dailft') {
    return callDailft({ baseUrl: connection.dailftBaseUrl || 'https://dailft.com', apiKey: connection.dailftKey, modelId: system.modelId, system: prompt.system, user: prompt.user, context: prompt.context || '', effort: effort || undefined, maxOutputTokens, batch: connection.dailftBatch !== false })
  }
  const spec = DIRECT_PROVIDERS[system.provider]
  if (!spec) throw new Error(`unknown provider ${system.provider}`)
  const apiKey = connection.keys?.[system.provider]
  return spec.call({ apiKey, modelId: system.modelId, baseUrl: system.baseUrl || spec.baseUrl, system: prompt.system, user: prompt.user, effort: effort || undefined, maxOutputTokens })
}
