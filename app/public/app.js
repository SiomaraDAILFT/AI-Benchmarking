/* Front end for the DRACO-style benchmark runner. Vanilla JS; state persists in localStorage EXCEPT keys. */
(() => {
  const $ = (s, el = document) => el.querySelector(s)
  const $$ = (s, el = document) => [...el.querySelectorAll(s)]
  const state = { defaults: null, systems: [], judges: [], tasks: [], runId: null, poll: null, nextEvent: 0, catalogue: null }
  const uid = () => Math.random().toString(36).slice(2, 8)

  const save = () => localStorage.setItem('draco-runner', JSON.stringify({ systems: state.systems, judges: state.judges, tasks: state.tasks, R: $('#R').value, K: $('#K').value, refR: $('#refR').value, refK: $('#refK').value, alpha: $('#alpha').value, concurrency: $('#concurrency').value, batched: $('#batched').checked, baseline: $('#baseline').value, mode: mode(), dailftBaseUrl: $('#dailftBaseUrl').value, dailftBatch: $('#dailftBatch').checked, protocol: protocol() }))
  const mode = () => $('input[name=mode]:checked').value
  const protocol = () => $('#protocol-preset').value || 'reduced'

  /* Protocol presets (lib/protocol.mjs): 'draco' fixes R = 1, K = 5, unbatched judging and no
     setting sweep, so those controls lock; 'reduced' frees them; 'validate' runs both. */
  function protocolChanged() {
    const p = protocol()
    const preset = (state.defaults.presets || []).find((x) => x.id === p)
    $('#protocol-tip').textContent = preset ? preset.description : ''
    const lock = p === 'draco'
    const wasLocked = $('#R').disabled
    /* The published preset fixes R, K and batching. Remember what the person had set before it
       locked them, and give it back when they leave the preset: without this, switching from
       'DRACO as published' to 'Validation' carried K = 5 and unbatched judging into the reduced
       arm, so the validation compared the reference protocol with itself (120 calls against
       120) and could prove nothing. Found in the smoke test of the public copy, 13 Sept 2026. */
    if (lock && !wasLocked) state.reducedSettings = { R: $('#R').value, K: $('#K').value, batched: $('#batched').checked }
    if (lock) { $('#R').value = 1; $('#K').value = 5; $('#batched').checked = false }
    else if (wasLocked) { const r = state.reducedSettings || { R: 1, K: 3, batched: true }; $('#R').value = r.R; $('#K').value = r.K; $('#batched').checked = r.batched }
    for (const s of ['#R', '#K', '#batched']) { $(s).disabled = lock; $(s).closest('label').classList.toggle('locked', lock) }
    /* The reference run of a validation (Section 8, Phase 1) has its own R and K; every ticked
       setting is run and each answer is judged alone. */
    $$('.ref-only').forEach((el) => el.classList.toggle('hidden', p !== 'validate'))
    renderSystems()
  }
  async function loadDraco() {
    const n = Number($('#draco-sample').value) || 0
    $('#draco-status').textContent = 'Loading…'
    try {
      const r = await fetch(`/api/draco-tasks?sample=${n}&seed=1`)
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || r.status)
      state.tasks = j.tasks
      const penalties = j.tasks.reduce((a, t) => a + (t.weights || []).filter((w) => w < 0).length, 0)
      $('#draco-status').textContent = `${j.tasks.length} of ${j.total} DRACO tasks loaded (${j.tasks.reduce((a, t) => a + t.criteria.length, 0).toLocaleString('en-US')} criteria, ${penalties} penalties).`
      renderTasks(); save(); estimate()
    } catch (e) { $('#draco-status').textContent = 'Could not load: ' + e.message }
  }

  /* The DAILFT model catalogue (GET /api/v1/models via the local server): id -> entry. Cached
     in localStorage without any key; reload it whenever the registry may have changed. */
  const catalogueEntry = (modelId) => (state.catalogue || []).find((m) => m.id === modelId) || null
  const catalogueEfforts = (modelId) => catalogueEntry(modelId)?.documentedEfforts || []
  function showCatalogueStatus() {
    const n = state.catalogue ? state.catalogue.length : 0
    $('#models-status').textContent = n ? `${n} models loaded${state.catalogueAt ? ' at ' + new Date(state.catalogueAt).toLocaleTimeString() : ''}.` : 'No model list loaded.'
  }
  async function loadModels() {
    const btn = $('#load-models'); btn.disabled = true; $('#models-status').textContent = 'Loading…'
    try {
      const r = await fetch('/api/models', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ baseUrl: $('#dailftBaseUrl').value, apiKey: $('#dailftKey').value }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || r.status)
      state.catalogue = j.models; state.catalogueAt = Date.now()
      localStorage.setItem('draco-runner-catalogue', JSON.stringify({ at: state.catalogueAt, models: j.models }))
      showCatalogueStatus(); renderSystems(); renderJudges(); estimate()
    } catch (e) {
      $('#models-status').textContent = 'Could not load the model list: ' + e.message + ' (is the key right, and does this DAILFT deployment have GET /api/v1/models yet?)'
    } finally { btn.disabled = false }
  }

  /* "?" hints: CSS shows the tip on hover and keyboard focus; a click or tap toggles it
     (touch has no hover), Escape or a click elsewhere closes it, and a tip that would run
     off the right edge is flipped to open leftwards. */
  function wireHints() {
    const placeTip = (h) => { const tip = $('.tip', h); if (!tip) return; h.classList.remove('flip'); const r = tip.getBoundingClientRect(); if (r.right > window.innerWidth - 8) h.classList.add('flip') }
    $$('.hint').forEach((h) => {
      h.addEventListener('mouseenter', () => placeTip(h))
      h.addEventListener('focusin', () => placeTip(h))
      const b = $('.hint-btn', h)
      if (b) b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const open = h.classList.contains('open'); $$('.hint.open').forEach((x) => x.classList.remove('open')); if (!open) { h.classList.add('open'); placeTip(h) } })
    })
    document.addEventListener('click', () => $$('.hint.open').forEach((x) => x.classList.remove('open')))
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.hint.open').forEach((x) => x.classList.remove('open')) })
  }

  async function init() {
    state.defaults = await (await fetch('/api/defaults')).json()
    $('#note-dailft').textContent = state.defaults.notes.dailft
    $('#note-direct').textContent = state.defaults.notes.direct
    wireHints()
    const saved = JSON.parse(localStorage.getItem('draco-runner') || 'null')
    if (saved) {
      state.systems = saved.systems || []; state.judges = saved.judges || []; state.tasks = saved.tasks || []
      $('#R').value = saved.R || 1; $('#K').value = saved.K || 3; $('#refR').value = saved.refR || saved.R || 1; $('#refK').value = saved.refK || saved.K || 3; $('#alpha').value = saved.alpha || 0.05; $('#concurrency').value = saved.concurrency || 3; $('#batched').checked = saved.batched !== false
      if (saved.mode) $(`input[name=mode][value=${saved.mode}]`).checked = true
      if (saved.dailftBaseUrl) $('#dailftBaseUrl').value = saved.dailftBaseUrl
      if (saved.dailftBatch === false) $('#dailftBatch').checked = false
    }
    const cat = JSON.parse(localStorage.getItem('draco-runner-catalogue') || 'null')
    if (cat && Array.isArray(cat.models)) { state.catalogue = cat.models; state.catalogueAt = cat.at }
    showCatalogueStatus()
    $('#load-models').onclick = loadModels
    $('#load-draco').onclick = loadDraco
    const sel = $('#protocol-preset'); sel.innerHTML = (state.defaults.presets || []).map((p) => `<option value="${p.id}">${esc(p.label)}</option>`).join('')
    /* A launcher can open the page on a preset: "?protocol=draco" (the published protocol) or
       "?protocol=reduced" (the efficient one). That wins over what was saved last time. */
    const fromUrl = new URLSearchParams(location.search).get('protocol')
    sel.value = fromUrl || saved?.protocol || 'reduced'; if (!sel.value) sel.value = 'reduced'
    sel.addEventListener('change', () => { protocolChanged(); save(); estimate() })
    protocolChanged()
    if (!state.tasks.length) state.tasks = state.defaults.tasks.map((t) => ({ ...t }))
    if (!state.systems.length) state.systems = [
      { id: uid(), label: 'System A', provider: 'openai', modelId: 'gpt-5.6-sol', settings: [] },
      { id: uid(), label: 'System B', provider: 'anthropic', modelId: 'claude-opus-5', settings: [] },
    ]
    if (!state.judges.length) state.judges = [{ id: uid(), label: 'Judge 1', provider: 'google', modelId: 'gemini-3.8-flash' }]
    renderProviderKeys(); renderSystems(); renderJudges(); renderTasks(); renderBaseline(); modeChanged(); estimate()
    $$('input[name=mode]').forEach((r) => r.addEventListener('change', () => { modeChanged(); renderSystems(); save(); estimate() }))
    ;['#R', '#K', '#refR', '#refK', '#alpha', '#concurrency', '#batched', '#baseline', '#dailftBaseUrl', '#dailftBatch'].forEach((s) => $(s).addEventListener('change', () => { save(); estimate() }))
    $('#add-system').onclick = () => { state.systems.push({ id: uid(), label: `System ${String.fromCharCode(65 + state.systems.length)}`, provider: 'openai', modelId: '', settings: [] }); renderSystems(); renderBaseline(); save(); estimate() }
    $('#add-judge').onclick = () => { state.judges.push({ id: uid(), label: `Judge ${state.judges.length + 1}`, provider: 'openai', modelId: '' }); renderJudges(); save(); estimate() }
    $('#add-task').onclick = () => { state.tasks.push({ id: 't' + uid(), title: 'New task', context: '', question: '', criteria: [] }); renderTasks(); save(); estimate() }
    $('#export-tasks').onclick = () => download('draco-tasks.json', JSON.stringify(state.tasks, null, 2), 'application/json')
    $('#import-tasks').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const arr = JSON.parse(await f.text()); if (!Array.isArray(arr)) throw new Error('not an array'); state.tasks = arr.map((t, i) => ({ id: t.id || 't' + (i + 1), title: t.title || `Task ${i + 1}`, context: t.context || '', question: t.question || '', criteria: Array.isArray(t.criteria) ? t.criteria : String(t.criteria || '').split('\n').filter(Boolean) })); renderTasks(); save(); estimate() } catch (err) { alert('Import failed: ' + err.message) } }
    $('#start').onclick = startRun
  }

  function modeChanged() { const m = mode(); $('#dailft-keys').classList.toggle('hidden', m !== 'dailft'); $('#direct-keys').classList.toggle('hidden', m !== 'direct') }

  function renderProviderKeys() {
    const box = $('#provider-keys'); box.innerHTML = ''
    for (const [id, p] of Object.entries(state.defaults.providers)) {
      const l = document.createElement('label'); l.innerHTML = `${p.label} key <input type="password" data-key="${id}" autocomplete="off" placeholder="${p.keyName}">`; box.appendChild(l)
      if (id === 'openai-compatible') { const b = document.createElement('label'); b.innerHTML = `Other provider base URL <input type="text" id="custom-base" placeholder="https://api.example.com/v1">`; box.appendChild(b) }
    }
  }

  function providerSelect(current, onChange) {
    const s = document.createElement('select')
    const m = mode()
    if (m === 'dailft') { const o = document.createElement('option'); o.value = 'dailft'; o.textContent = 'DAILFT'; s.appendChild(o); s.disabled = true; return s }
    for (const [id, p] of Object.entries(state.defaults.providers)) { const o = document.createElement('option'); o.value = id; o.textContent = p.label; if (id === current) o.selected = true; s.appendChild(o) }
    s.onchange = () => onChange(s.value)
    return s
  }

  function renderSystems() {
    const tb = $('#systems-table tbody'); tb.innerHTML = ''
    for (const sys of state.systems) {
      const tr = document.createElement('tr')
      const tdL = document.createElement('td'); const iL = Object.assign(document.createElement('input'), { type: 'text', value: sys.label }); iL.oninput = () => { sys.label = iL.value; renderBaseline(); save() }; tdL.appendChild(iL)
      const tdP = document.createElement('td'); tdP.appendChild(providerSelect(sys.provider, (v) => { sys.provider = v; sys.settings = []; renderSystems(); save(); estimate() }))
      const tdM = document.createElement('td'); const iM = Object.assign(document.createElement('input'), { type: 'text', value: sys.modelId, placeholder: 'model id' }); iM.setAttribute('list', 'model-suggestions'); iM.oninput = () => { sys.modelId = iM.value; save() }; iM.onchange = () => { if (mode() === 'dailft') { sys.settings = sys.settings.filter((e) => catalogueEfforts(sys.modelId).includes(e)); renderSystems(); estimate() } }; tdM.appendChild(iM)
      const tdS = document.createElement('td'); const box = document.createElement('div'); box.className = 'settings-box'
      const efforts = protocol() === 'draco' ? [] : mode() === 'direct' ? (state.defaults.providers[sys.provider]?.efforts || []) : catalogueEfforts(sys.modelId)
      if (protocol() === 'draco') box.innerHTML = '<span class="muted">one setting (DRACO as published)</span>'
      else if (!efforts.length) box.innerHTML = `<span class="muted">${mode() === 'dailft' ? (state.catalogue ? (catalogueEntry(sys.modelId) ? 'model default (no documented effort dial)' : 'model default (id not in the loaded list)') : 'model default; load the model list to choose settings') : 'provider default'}</span>`
      for (const e of efforts) { const l = document.createElement('label'); const c = Object.assign(document.createElement('input'), { type: 'checkbox', checked: sys.settings.includes(e) }); c.onchange = () => { sys.settings = efforts.filter((x) => x === e ? c.checked : sys.settings.includes(x)); renderSystems(); save(); estimate() }; l.append(c, ' ' + e); box.appendChild(l) }
      /* With two or more settings ticked, the setting this system is compared at (Section 7.1):
         its first ticked setting unless another is chosen. Saved configurations without a
         choice load with the first. */
      const ticked = efforts.filter((e) => sys.settings.includes(e))
      if (ticked.length > 1) {
        const l = document.createElement('label'); l.className = 'compare-at'
        const sel = document.createElement('select'); sel.style.width = 'auto'
        sel.innerHTML = ticked.map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join('')
        sel.value = ticked.includes(sys.compareSetting) ? sys.compareSetting : ticked[0]
        sel.onchange = () => { sys.compareSetting = sel.value; save() }
        l.append('compared at ', sel); box.appendChild(l)
      }
      tdS.appendChild(box)
      const tdX = document.createElement('td'); const del = Object.assign(document.createElement('button'), { className: 'btn link', textContent: 'remove' }); del.onclick = () => { state.systems = state.systems.filter((x) => x !== sys); renderSystems(); renderBaseline(); save(); estimate() }; tdX.appendChild(del)
      tr.append(tdL, tdP, tdM, tdS, tdX); tb.appendChild(tr)
    }
    let dl = $('#model-suggestions'); if (!dl) { dl = document.createElement('datalist'); dl.id = 'model-suggestions'; document.body.appendChild(dl) }
    const ids = state.catalogue ? [...state.catalogue.map((m) => m.id), ...state.defaults.dailftModelSuggestions.filter((m) => m.includes('-panel:'))] : state.defaults.dailftModelSuggestions
    dl.innerHTML = ids.map((m) => `<option value="${m}">`).join('')
  }

  function renderJudges() {
    const tb = $('#judges-table tbody'); tb.innerHTML = ''
    for (const j of state.judges) {
      const tr = document.createElement('tr')
      const tdL = document.createElement('td'); const iL = Object.assign(document.createElement('input'), { type: 'text', value: j.label }); iL.oninput = () => { j.label = iL.value; save() }; tdL.appendChild(iL)
      const tdP = document.createElement('td'); tdP.appendChild(providerSelect(j.provider, (v) => { j.provider = v; save() }))
      const tdM = document.createElement('td'); const iM = Object.assign(document.createElement('input'), { type: 'text', value: j.modelId, placeholder: 'model id' }); iM.setAttribute('list', 'model-suggestions'); iM.oninput = () => { j.modelId = iM.value; save() }; tdM.appendChild(iM)
      const tdX = document.createElement('td'); const del = Object.assign(document.createElement('button'), { className: 'btn link', textContent: 'remove' }); del.onclick = () => { state.judges = state.judges.filter((x) => x !== j); renderJudges(); save(); estimate() }; tdX.appendChild(del)
      tr.append(tdL, tdP, tdM, tdX); tb.appendChild(tr)
    }
  }

  function renderTasks() {
    const list = $('#tasks-list'); list.innerHTML = ''
    state.tasks.forEach((t, i) => {
      const d = document.createElement('div'); d.className = 'task'
      /* A task from the DRACO set carries criterion weights and dimensions; its rubric is shown
         read-only so the weights cannot silently detach from the lines they belong to. */
      const weighted = Array.isArray(t.weights) && t.weights.length === t.criteria.length
      const rubricLines = weighted ? t.criteria.map((c, k) => `${t.weights[k] < 0 ? '[penalty ' + t.weights[k] + '] ' : '[' + t.weights[k] + '] '}${c}`).join('\n') : t.criteria.join('\n')
      d.innerHTML = `<div class="head"><span class="pill">${i + 1}</span><input type="text" data-f="title" value="${esc(t.title || '')}" placeholder="title"><button class="btn link" data-act="dup">duplicate</button><button class="btn link" data-act="del">remove</button></div>
        <label>Context (optional)<textarea data-f="context">${esc(t.context || '')}</textarea></label>
        <label>Question<textarea data-f="question">${esc(t.question || '')}</textarea></label>
        <label>${weighted ? `Weighted rubric from the DRACO set (${t.criteria.length} criteria, ${t.dimensions?.length || 0} dimensions${t.weights.some((w) => w < 0) ? ', with penalties' : ''}; read-only)` : `Rubric criteria, one per line (${t.criteria.length})`}<textarea ${weighted ? 'readonly' : 'data-f="criteria"'} style="min-height:120px">${esc(rubricLines)}</textarea></label>`
      $$('[data-f]', d).forEach((el) => el.addEventListener('input', () => { const f = el.dataset.f; if (f === 'criteria') t.criteria = el.value.split('\n').map((s) => s.trim()).filter(Boolean); else t[f] = el.value; save(); estimate() }))
      $('[data-act=del]', d).onclick = () => { state.tasks.splice(i, 1); renderTasks(); save(); estimate() }
      $('[data-act=dup]', d).onclick = () => { state.tasks.splice(i + 1, 0, { ...t, id: 't' + uid(), title: t.title + ' (copy)' }); renderTasks(); save(); estimate() }
      list.appendChild(d)
    })
  }

  function renderBaseline() { const s = $('#baseline'); const cur = s.value; s.innerHTML = state.systems.map((x) => `<option value="${x.id}">${esc(x.label)}</option>`).join(''); if ([...s.options].some((o) => o.value === cur)) s.value = cur }

  async function estimate() {
    const cfg = config()
    const r = await fetch('/api/plan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ config: cfg }) })
    const p = await r.json()
    const E = Math.max(1, ...cfg.systems.map((s) => s.settings.length || 1))
    const secs = Math.round((p.total * 40) / Math.max(1, cfg.concurrency))
    const batching = $('#dailftBatch').checked
    const rate = mode() === 'dailft'
      ? (batching
          ? ` <span class="pill ok">Sent as ${Math.ceil(p.total / 200)} batch${Math.ceil(p.total / 200) === 1 ? '' : 'es'} of up to 200 calls; each batch is one request against the DAILFT API's hourly limit of 30.</span>`
          : ` <span class="pill warn">Batching is off: ${p.total} separate requests against a limit of 30 per hour per key would take about ${Math.ceil(p.total / 30)} hours.</span>`)
      : ''
    const shape = cfg.protocol === 'draco'
      ? `C = ${cfg.systems.length} systems, E = 1, T = ${cfg.tasks.length} tasks, R = 1, J = ${cfg.judges.length}, K = 5, unbatched judging (DRACO as published)`
      : cfg.protocol === 'validate'
        ? `reference (complete protocol: E = ${E}, R = ${cfg.reference.R}, K = ${cfg.reference.K}, unbatched): ${p.reference.total} calls; reduced (R = ${cfg.R}, K = ${cfg.K}, ${cfg.batched ? 'batched' : 'unbatched'}): ${p.reduced.total} calls; together`
        : `C = ${cfg.systems.length} systems, E = ${E}, T = ${cfg.tasks.length} tasks, R = ${cfg.R}, J = ${cfg.judges.length}, K = ${cfg.K}, ${cfg.batched ? 'batched' : 'unbatched'} judging`
    $('#estimate').innerHTML = `<strong>Plan.</strong> ${shape} → <strong>${p.generation}</strong> generation calls + <strong>${p.judging}</strong> judging calls = <strong>${p.total}</strong> (Equations 1–3). At ~40 s per call and ${cfg.concurrency} in parallel, roughly ${Math.round(secs / 60)} minutes.${rate}`
  }

  function config() {
    const systems = state.systems.map((s) => ({ ...s, provider: mode() === 'dailft' ? 'dailft' : s.provider, settings: mode() === 'dailft' ? s.settings.filter((e) => catalogueEfforts(s.modelId).includes(e)) : s.settings, baseUrl: s.provider === 'openai-compatible' ? ($('#custom-base')?.value || '') : undefined }))
    /* Each side of a comparison names the setting it is made at: the system's chosen
       compareSetting if it is still ticked, else its first ticked setting (Section 7.1). */
    const side = (s) => ({ systemId: s.id, setting: s.settings.includes(s.compareSetting) ? s.compareSetting : (s.settings[0] ?? null) })
    const base = systems.find((s) => s.id === $('#baseline').value)
    const comparisons = base ? systems.filter((s) => s.id !== base.id).map((s) => [side(s), side(base)]) : []
    return { protocol: protocol(), systems, judges: state.judges.map((j) => ({ ...j, provider: mode() === 'dailft' ? 'dailft' : j.provider, baseUrl: j.provider === 'openai-compatible' ? ($('#custom-base')?.value || '') : undefined })), tasks: state.tasks, R: Number($('#R').value), K: Number($('#K').value), reference: { R: Number($('#refR').value) || Number($('#R').value), K: Number($('#refK').value) || Number($('#K').value) }, batched: $('#batched').checked, alpha: Number($('#alpha').value), concurrency: Number($('#concurrency').value), comparisons }
  }
  function connection() {
    const keys = {}; $$('[data-key]').forEach((i) => { if (i.value) keys[i.dataset.key] = i.value })
    return { mode: mode(), dailftKey: $('#dailftKey').value, dailftBaseUrl: $('#dailftBaseUrl').value, dailftBatch: $('#dailftBatch').checked, keys }
  }

  async function startRun() {
    save()
    const r = await fetch('/api/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ config: config(), connection: connection() }) })
    const j = await r.json()
    if (!r.ok) { $('#run-status').textContent = 'Not started: ' + (j.errors || [j.error]).join('; '); return }
    state.runId = j.id; state.nextEvent = 0; $('#log').textContent = ''; $('#run-status').textContent = 'Running…'; $('#start').disabled = true
    clearInterval(state.poll); state.poll = setInterval(pollRun, 2000)
  }
  async function pollRun() {
    const r = await fetch(`/api/run/${state.runId}?since=${state.nextEvent}`); const j = await r.json()
    state.nextEvent = j.nextEvent
    for (const e of j.events) {
      const phase = e.phase ? `[${e.phase}] ` : ''
      if (e.type === 'progress') { const bar = e.stage === 'generation' ? '#bar-gen' : '#bar-judge'; $(bar).style.width = `${(100 * e.done) / e.total}%`; $(e.stage === 'generation' ? '#gen-count' : '#judge-count').textContent = `${phase}${e.done}/${e.total}` }
      else if (e.type === 'error') log(`${e.at.slice(11, 19)} ${phase}error in ${e.stage}: ${e.error}`)
      else if (e.type === 'start') log(`${e.at.slice(11, 19)} ${phase}started: ${e.counts.generation} generation + ${e.counts.judging} judging calls`)
      else if (e.type === 'done') log(`${e.at.slice(11, 19)} ${phase}done`)
      else if (e.type === 'validation') log(`${e.at.slice(11, 19)} validation: Kendall's tau ${e.comparison.kendallTau == null ? '–' : e.comparison.kendallTau.toFixed(2)}, ${e.comparison.sameLeader ? 'same leader' : 'different leader'}`)
    }
    if (j.status !== 'running') { clearInterval(state.poll); $('#start').disabled = false; $('#run-status').textContent = j.status === 'done' ? 'Complete.' : 'Failed: ' + j.error; if (j.summary) renderResults(j.summary) }
  }
  function log(s) { const el = $('#log'); el.textContent += s + '\n'; el.scrollTop = el.scrollHeight }

  function renderResults(sm) {
    const fmt = (x, d = 1) => (x == null || Number.isNaN(x) ? '–' : Number(x).toFixed(d))
    const label = (key) => { const [sid, ei] = key.split('|'); const s = state.systems.find((x) => x.id === sid); return (s?.label || sid) + (s?.settings?.[Number(ei)] ? ` @ ${s.settings[Number(ei)]}` : '') }
    const byId = (id) => state.systems.find((x) => x.id === id)?.label || id
    const at = (id, setting) => byId(id) + (setting ? ` @ ${setting}` : '')
    /* The interval from the inverted test; a bound the test can never reach (too few tasks) comes back as null. */
    const ci = (c) => (Array.isArray(c.ci) ? `${c.ci[0] == null ? '−∞' : fmt(c.ci[0])} to ${c.ci[1] == null ? '∞' : fmt(c.ci[1])}` : '–')
    let h = ''
    if (sm.validation) {
      const v = sm.validation
      h += `<h3>Validation: the reduced protocol against the complete reference run (Section 8)</h3>`
      h += `<p>Rank agreement over the systems, Kendall's τ: <strong>${fmt(v.kendallTau, 2)}</strong>. ${v.sameLeader ? 'The same system leads under both protocols.' : 'A different system leads under the reduced protocol.'} Pre-registered verdicts agreeing: <strong>${v.verdictsAgree ?? '–'}</strong> of ${v.verdicts.length}. Calls: ${v.cost.referenceCalls} reference vs ${v.cost.reducedCalls} reduced (<strong>${fmt(v.cost.callRatio, 1)}×</strong> fewer)${v.cost.tokenRatio ? `; DAILFT tokens ${Math.round(v.cost.referenceDailftTokens).toLocaleString('en-US')} vs ${Math.round(v.cost.reducedDailftTokens).toLocaleString('en-US')} (<strong>${fmt(v.cost.tokenRatio, 1)}×</strong>)` : ''}.</p>`
      h += `<table class="res-table"><tr><th>System</th><th>Reference mean</th><th>Reduced mean</th><th>Difference</th></tr>`
      for (const s of v.systems) h += `<tr><td>${esc(at(s.systemId, s.setting))}</td><td>${fmt(s.reference)}</td><td>${fmt(s.reduced)}</td><td>${fmt(s.reduced - s.reference)}</td></tr>`
      h += `</table><table class="res-table"><tr><th>Comparison</th><th>Reference</th><th>Reduced</th><th>Agree</th></tr>`
      for (const c of v.verdicts) h += `<tr><td>${esc(at(c.a, c.aSetting))} vs ${esc(at(c.b, c.bSetting))}</td><td>${c.referenceRejected ? 'significant' : 'not significant'} (${fmt(c.referenceMeanDiff)})</td><td>${c.reducedRejected == null ? '–' : c.reducedRejected ? 'significant' : 'not significant'} (${fmt(c.reducedMeanDiff)})</td><td>${c.agree ? '<span class="pill ok">yes</span>' : '<span class="pill bad">no</span>'}</td></tr>`
      h += `</table><h3>Reduced protocol, in detail</h3>`
    }
    h += `<h3>Scores by condition</h3><table class="res-table"><tr><th>Condition</th><th>Tasks</th><th>Mean score</th><th>SD across tasks</th><th>SE</th></tr>`
    for (const c of sm.conditions) h += `<tr><td>${esc(c.label)}${c.setting ? ' @ ' + c.setting : ''}</td><td>${c.n}</td><td>${fmt(c.mean)}</td><td>${fmt(c.sd)}</td><td>${c.sd != null && c.n ? fmt(c.sd / Math.sqrt(c.n)) : '–'}</td></tr>`
    const level = sm.comparisons.find((c) => c.ciLevel)?.ciLevel
    h += `</table><h3>Pre-registered comparisons (one-sided, paired permutation test, Holm-corrected)</h3><table class="res-table"><tr><th>System</th><th>vs baseline</th><th>n tasks</th><th>Mean difference</th><th>${level ? Math.round(level * 1000) / 10 + '% ' : ''}interval</th><th>d<sub>z</sub></th><th>p</th><th>Holm threshold</th><th>Verdict</th></tr>`
    for (const c of sm.comparisons) h += c.error ? `<tr><td>${esc(at(c.a, c.aSetting))}</td><td>${esc(at(c.b, c.bSetting))}</td><td colspan="7" class="muted">${c.error}; counted in Holm's family of ${c.family ?? sm.comparisons.length}</td></tr>` : `<tr><td>${esc(at(c.a, c.aSetting))}</td><td>${esc(at(c.b, c.bSetting))}</td><td>${c.n}</td><td>${fmt(c.meanDiff)}</td><td>${ci(c)}</td><td>${fmt(c.dz, 2)}</td><td>${fmt(c.p, 4)}${c.exact ? '' : ' (MC)'}</td><td>${fmt(c.holmAlpha, 4)}</td><td>${c.rejected ? '<span class="pill ok">significant</span>' : '<span class="pill">not significant</span>'}</td></tr>`
    h += `</table><h3>Exploratory (all pairs, two-sided, not corrected)</h3><table class="res-table"><tr><th>A</th><th>B</th><th>n</th><th>Mean difference</th><th>d<sub>z</sub></th><th>p (two-sided)</th></tr>`
    for (const c of sm.exploratory) h += `<tr><td>${esc(label(c.a))}</td><td>${esc(label(c.b))}</td><td>${c.n}</td><td>${fmt(c.meanDiff)}</td><td>${fmt(c.dz, 2)}</td><td>${fmt(c.pTwoSided, 4)}</td></tr>`
    const ja = sm.judgeAgreement
    h += `</table><h3>Judge reliability</h3><p>Test–retest SD within a judge (mean over ${ja.itemsWithRepeats} items with repeats): <strong>${fmt(ja.testRetestSdMean)}</strong> points. Between-judge SD (mean over ${ja.itemsWithMultipleJudges} items): <strong>${fmt(ja.betweenJudgeSdMean)}</strong> points.</p>`
    h += `<h3>Usage</h3><p>${sm.usage.calls.generation} generation calls, ${sm.usage.calls.judging} judging calls. ${mode() === 'dailft' ? `<strong>${Math.round(sm.usage.dailftTokens).toLocaleString('en-US')} DAILFT tokens</strong>.` : `${sm.usage.generationOutputTokens.toLocaleString('en-US')} generation output tokens.`} ${sm.errors ? `<span class="pill bad">${sm.errors} failed calls</span>` : '<span class="pill ok">no failed calls</span>'}</p>`
    h += `<div class="row"><a class="btn secondary" href="/api/run/${state.runId}/raw.json" download>Download raw table (JSON)</a><a class="btn secondary" href="/api/run/${state.runId}/raw.csv" download>Download scores (CSV)</a></div>`
    $('#results-body').innerHTML = h
  }

  function download(name, text, type) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) }
  init()
})()
