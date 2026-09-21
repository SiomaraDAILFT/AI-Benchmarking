#!/usr/bin/env node
/**
 * Local web application for the DRACO-style testing mechanism.
 *
 *   npm run app          -> http://localhost:4173
 *
 * No dependencies. Serves app/public and a small JSON API:
 *   GET  /api/defaults          starter tasks, provider list, protocol defaults
 *   POST /api/plan              call counts for a configuration (Equations 1-3)
 *   POST /api/run               start a run; body = { config, connection }
 *   GET  /api/run/:id           status, progress events, and when done the summary
 *   GET  /api/run/:id/raw.json  the retained raw table (JSON)
 *   GET  /api/run/:id/raw.csv   the retained scores as CSV
 *
 * API keys arrive in the POST body from the browser on localhost, are held in this
 * process's memory for the duration of the run, and are never written to disk or logged.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { runProtocol, runValidation, applyPreset, planCounts, scoresCsv, PROTOCOL_PRESETS } from './lib/protocol.mjs'
import { DIRECT_PROVIDERS, fetchDailftModels } from './lib/providers.mjs'
import { loadDracoTasks, stratifiedSample, DRACO_DATASET_SOURCE } from './lib/draco-dataset.mjs'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const PUBLIC = path.join(HERE, 'public')
const PORT = Number(process.env.PORT || 4173)
const runs = new Map()

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' }
const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)) }
const readBody = (req) => new Promise((resolve, reject) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 20e6) reject(new Error('body too large')) }); req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}) } catch (e) { reject(e) } }); req.on('error', reject) })

function defaults() {
  const tasks = JSON.parse(fs.readFileSync(path.join(HERE, 'lib', 'tasks-default.json'), 'utf8'))
  const providers = Object.fromEntries(Object.entries(DIRECT_PROVIDERS).map(([id, p]) => [id, { label: p.label, keyName: p.keyName, baseUrl: p.baseUrl || '', efforts: p.efforts }]))
  return {
    tasks,
    providers,
    /* Fallback suggestions until the model list is loaded from the API (GET /api/v1/models). */
    dailftModelSuggestions: ['gpt-5.6-sol', 'claude-opus-5', 'gemini-3.8-flash', 'deepseek-v4-flash', 'kimi-k3', 'grok-4.5', 'glm-5.2', 'mistral-medium-3.5', 'quick-panel:gpt-5.6-sol,claude-opus-5,deepseek-v4-flash', 'full-panel:gpt-5.6-sol,claude-opus-5,deepseek-v4-flash'],
    protocol: { R: 1, K: 3, batched: true, alpha: 0.05, concurrency: 3 },
    presets: Object.values(PROTOCOL_PRESETS),
    dracoDataset: { source: DRACO_DATASET_SOURCE, tasks: 100, licence: 'MIT (app/data/DRACO-DATASET-LICENSE)' },
    notes: {
      dailft: 'Through the DAILFT API every plain model id is an answer-only completion with one key; calls are sent as batches of up to 200 (one request each against the hourly limit) and usage comes back as token counts and DAILFT tokens. Load the model list to choose each model\'s documented effort settings (E > 1). quick-panel:<ids> and full-panel:<ids> run a DAILFT panel as one system.',
      direct: 'Direct mode calls each provider with its own key and supports that provider\'s documented effort settings, so a system can be swept across settings (E > 1).',
    },
  }
}

function validateConfig(c) {
  const errs = []
  if (!Array.isArray(c.systems) || c.systems.length < 2) errs.push('at least two systems under test')
  if (!Array.isArray(c.judges) || c.judges.length < 1) errs.push('at least one judge')
  if (!Array.isArray(c.tasks) || c.tasks.length < 1) errs.push('at least one task')
  for (const t of c.tasks || []) { if (!t.question) errs.push(`task ${t.id || '?'} has no question`); if (!Array.isArray(t.criteria) || t.criteria.length < 1) errs.push(`task ${t.id || '?'} has no rubric criteria`) }
  for (const s of [...(c.systems || []), ...(c.judges || [])]) if (!s.modelId) errs.push(`${s.label || s.id} has no model id`)
  const R = Number(c.R), K = Number(c.K)
  if (!(R >= 1 && R <= 10)) errs.push('R must be 1-10'); if (!(K >= 1 && K <= 10)) errs.push('K must be 1-10')
  return errs
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  try {
    if (url.pathname === '/api/defaults' && req.method === 'GET') return json(res, 200, defaults())
    if (url.pathname === '/api/models' && req.method === 'POST') {
      /* The model catalogue from the DAILFT API, fetched server-side so the browser never
         talks to dailft.com directly; the key is used for this one request and not kept. */
      const { baseUrl, apiKey } = await readBody(req)
      try {
        const models = await fetchDailftModels({ baseUrl: baseUrl || 'https://dailft.com', apiKey })
        return json(res, 200, { models })
      } catch (e) {
        return json(res, 502, { error: String(e.message) })
      }
    }
    if (url.pathname === '/api/draco-tasks' && req.method === 'GET') {
      /* The published DRACO task set (MIT, app/data/): all 100 tasks, or a reproducible
         stratified sample of `sample` tasks with `seed`, fixed before any system runs (S6). */
      const sample = Number(url.searchParams.get('sample') || 0)
      const seed = Number(url.searchParams.get('seed') || 1)
      const all = loadDracoTasks()
      const tasks = sample > 0 ? stratifiedSample(all, sample, seed) : all
      return json(res, 200, { tasks, total: all.length, source: DRACO_DATASET_SOURCE })
    }
    if (url.pathname === '/api/plan' && req.method === 'POST') {
      const { config } = await readBody(req)
      const plan = (cfg) => {
        const E = Math.max(1, ...(cfg.systems || []).map((s) => (s.settings?.length || 1)))
        return planCounts({ C: (cfg.systems || []).length, T: (cfg.tasks || []).length, E, R: Number(cfg.R) || 1, J: (cfg.judges || []).length, K: Number(cfg.K) || 1, batched: !!cfg.batched })
      }
      if (config.protocol === 'draco') return json(res, 200, plan(applyPreset(config, 'draco')))
      if (config.protocol === 'validate') {
        const reference = plan(applyPreset(config, 'draco')), reduced = plan(applyPreset(config, 'reduced'))
        return json(res, 200, { generation: reference.generation + reduced.generation, judging: reference.judging + reduced.judging, total: reference.total + reduced.total, reference, reduced })
      }
      return json(res, 200, plan(config))
    }
    if (url.pathname === '/api/run' && req.method === 'POST') {
      const { config, connection } = await readBody(req)
      const errs = validateConfig(config || {})
      if (connection?.mode === 'dailft' && !connection.dailftKey) errs.push('DAILFT API key missing')
      if (connection?.mode === 'direct') for (const s of [...(config.systems || []), ...(config.judges || [])]) if (!connection.keys?.[s.provider]) errs.push(`no key for provider ${s.provider}`)
      if (errs.length) return json(res, 400, { errors: errs })
      const id = randomUUID()
      const entry = { id, status: 'running', startedAt: new Date().toISOString(), events: [], summary: null, raw: null, config: { ...config }, error: null }
      runs.set(id, entry)
      /* In batched DAILFT mode the workers only hand calls to the batcher, which groups them into
         requests of up to 200; many workers therefore means full batches, not many connections. */
      const batchedDailft = connection?.mode === 'dailft' && connection.dailftBatch !== false
      const concurrency = batchedDailft ? Math.max(Number(config.concurrency) || 1, 200) : Number(config.concurrency) || 3
      const onEvent = (evt) => { entry.events.push(evt); if (entry.events.length > 5000) entry.events.splice(0, 1000) }
      const base = { ...config, R: Number(config.R), K: Number(config.K), concurrency }
      /* Protocol presets (docs in lib/protocol.mjs): 'draco' fixes the published protocol's
         parameters, 'validate' runs the reference and the reduced protocol back to back and
         reports their agreement, anything else is the reduced protocol as configured. */
      const job = config.protocol === 'validate'
        ? runValidation(base, connection, onEvent).then(({ reference, reduced, summary }) => ({ raw: { reference: reference.raw, reduced: reduced.raw }, summary }))
        : runProtocol(applyPreset(base, config.protocol === 'draco' ? 'draco' : 'reduced'), connection, onEvent)
      job
        .then(({ raw, summary }) => { entry.raw = raw; entry.summary = summary; entry.status = 'done'; entry.finishedAt = new Date().toISOString() })
        .catch((e) => { entry.status = 'failed'; entry.error = String(e.message); entry.finishedAt = new Date().toISOString() })
      return json(res, 202, { id })
    }
    const m = url.pathname.match(/^\/api\/run\/([0-9a-f-]+)(?:\/(raw\.json|raw\.csv))?$/)
    if (m && req.method === 'GET') {
      const entry = runs.get(m[1]); if (!entry) return json(res, 404, { error: 'not_found' })
      if (m[2] === 'raw.json') { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="draco-run-${entry.id}.json"` }); return res.end(JSON.stringify({ config: entry.config, startedAt: entry.startedAt, finishedAt: entry.finishedAt, raw: entry.raw, summary: entry.summary }, null, 2)) }
      if (m[2] === 'raw.csv') {
        /* A validation run keeps two raw tables; the CSV carries both, with a `phase` column. */
        const csv = !entry.raw ? '' : entry.raw.scores ? scoresCsv(entry.raw) : ['phase,' + scoresCsv({ scores: [] }), ...['reference', 'reduced'].flatMap((phase) => scoresCsv(entry.raw[phase]).split('\n').slice(1).map((line) => `${phase},${line}`))].join('\n')
        res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="draco-scores-${entry.id}.csv"` }); return res.end(csv)
      }
      const since = Number(url.searchParams.get('since') || 0)
      return json(res, 200, { id: entry.id, status: entry.status, error: entry.error, startedAt: entry.startedAt, finishedAt: entry.finishedAt, events: entry.events.slice(since), nextEvent: entry.events.length, summary: entry.summary })
    }
    // static
    let file = url.pathname === '/' ? '/index.html' : url.pathname
    const fp = path.normalize(path.join(PUBLIC, file))
    if (!fp.startsWith(PUBLIC) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end('not found') }
    res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'application/octet-stream' })
    fs.createReadStream(fp).pipe(res)
  } catch (e) {
    json(res, 500, { error: String(e.message) })
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`DRACO-style testing mechanism: http://localhost:${PORT}`))
