/**
 * The published DRACO task set, in the runner's task format.
 *
 * Source: https://huggingface.co/datasets/perplexity-ai/draco (test.jsonl, 100 tasks, MIT
 * licence; a copy and the licence file are in app/data/, retrieved 12 September 2026). Each
 * record carries the task text (`problem`), a domain, and a rubric (`answer`, JSON) of four
 * sections - factual accuracy, breadth and depth of analysis, presentation quality, citation
 * quality - each a list of binary criteria with an integer weight.
 *
 * The runner keeps its criteria as a flat, numbered list so the judge prompt and parser are
 * unchanged; the weights and the section boundaries travel alongside, so a score can be the
 * weight-normalised fraction of criteria met, overall and per dimension, as the rubric format
 * intends. Nothing in the text is altered.
 */
import fs from 'node:fs'
import path from 'node:path'

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
export const DRACO_DATASET_PATH = path.join(HERE, '..', 'data', 'draco-test.jsonl')
export const DRACO_DATASET_SOURCE = 'https://huggingface.co/datasets/perplexity-ai/draco'

const SHORT = { 'factual-accuracy': 'Factual accuracy', 'breadth-and-depth-of-analysis': 'Breadth and depth', 'presentation-quality': 'Presentation', 'citation-quality': 'Citations' }

/** Parse one dataset record into a runner task. Exported for tests. */
export function taskFromRecord(rec, index) {
  const rubric = typeof rec.answer === 'string' ? JSON.parse(rec.answer) : rec.answer
  const criteria = [], weights = [], dimensions = []
  for (const section of rubric.sections || []) {
    const from = criteria.length
    for (const c of section.criteria || []) {
      criteria.push(String(c.requirement || '').trim())
      weights.push(Number.isFinite(Number(c.weight)) ? Number(c.weight) : 1)
    }
    dimensions.push({ id: section.id, title: section.title || SHORT[section.id] || section.id, from, to: criteria.length })
  }
  const firstLine = String(rec.problem || '').split('\n')[0].trim()
  return {
    id: `draco-${rec.id || index}`,
    sourceId: rec.id || null,
    title: `${rec.domain || 'DRACO'}: ${firstLine.slice(0, 80)}${firstLine.length > 80 ? '…' : ''}`,
    domain: rec.domain || null,
    context: '',
    question: String(rec.problem || ''),
    criteria,
    weights,
    dimensions,
  }
}

/** All 100 tasks, in dataset order. */
export function loadDracoTasks(file = DRACO_DATASET_PATH) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim())
  return lines.map((l, i) => taskFromRecord(JSON.parse(l), i))
}

/**
 * A pre-registered stratified sample (S6): `n` tasks drawn across domains in proportion to
 * their share of the set, with a fixed seed so the selection is reproducible and fixed before
 * any system runs. Domains with a rounded share of zero still contribute one task while n allows.
 */
export function stratifiedSample(tasks, n, seed = 1) {
  if (!(n > 0) || n >= tasks.length) return tasks
  let s = (seed * 9301 + 49297) % 233280
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const byDomain = new Map()
  for (const t of tasks) { const d = t.domain || 'other'; if (!byDomain.has(d)) byDomain.set(d, []); byDomain.get(d).push(t) }
  const domains = [...byDomain.entries()].sort((a, b) => b[1].length - a[1].length)
  const quota = new Map(domains.map(([d, list]) => [d, Math.max(1, Math.round((n * list.length) / tasks.length))]))
  let total = [...quota.values()].reduce((a, b) => a + b, 0)
  // trim or top up to exactly n, largest domains first
  for (const [d] of domains) { while (total > n && quota.get(d) > 1) { quota.set(d, quota.get(d) - 1); total-- } }
  for (const [d, list] of domains) { while (total < n && quota.get(d) < list.length) { quota.set(d, quota.get(d) + 1); total++ } }
  const picked = []
  for (const [d, list] of domains) {
    const pool = [...list]
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
    picked.push(...pool.slice(0, quota.get(d)))
  }
  const order = new Map(tasks.map((t, i) => [t.id, i]))
  return picked.sort((a, b) => order.get(a.id) - order.get(b.id))
}

/**
 * The dataset's own scoring rule (its README, "Scoring"):
 *   raw        = sum over criteria of verdict_i * weight_i   (verdict 1 if MET, else 0)
 *   normalised = clamp(raw / sum of the POSITIVE weights, 0, 1) * 100
 * A negative-weight criterion describes an error; MET means the answer contains it and the
 * weight is subtracted. Applied per dimension with the same rule over that dimension's criteria.
 * Tasks without weights score every criterion at 1, which reduces to the percentage met.
 */
export function weightedScore(task, metIndices) {
  const weights = task.weights && task.weights.length === task.criteria.length ? task.weights : task.criteria.map(() => 1)
  const met = new Set(metIndices)
  const score = (from, to) => {
    let positive = 0, raw = 0
    for (let i = from; i < to; i++) { if (weights[i] > 0) positive += weights[i]; if (met.has(i)) raw += weights[i] }
    if (positive <= 0) return null
    return Math.round(1000 * Math.min(1, Math.max(0, raw / positive))) / 10
  }
  const overall = score(0, weights.length)
  const perDimension = {}
  for (const d of task.dimensions || []) perDimension[d.id] = score(d.from, d.to)
  return { overall, perDimension }
}

/** True when any criterion carries a negative weight (describes an error). */
export function hasPenalties(task) {
  return Array.isArray(task.weights) && task.weights.some((w) => w < 0)
}
