/* core: data loading, formatting, routing, header/search, table component */
const App = (() => {
  const cache = {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function getJSON(url) {
    if (!cache[url]) cache[url] = fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
    return cache[url];
  }
  async function table(name) {
    const key = 'T:' + name;
    if (!cache[key]) cache[key] = getJSON(`data/${name}.json`).then(t => t.rows.map(r => { const o = {}; t.cols.forEach((c, i) => o[c] = r[i]); return o; }));
    return cache[key];
  }
  function shardOf(id) { let h = 5381; for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h % 256; }
  async function player(id) { const s = await getJSON(`data/ps/${shardOf(id)}.json`); return s[id]; }
  const meta = () => getJSON('data/meta.json');

  // ---------- names / teams
  let TEAMS = {};
  const pname = n => { if (!n) return ''; const i = n.indexOf(','); return i < 0 ? n : (n.slice(i + 1).trim() + ' ' + n.slice(0, i).trim()); };
  const tname = c => TEAMS[c] || (c || '').replace(/_/g, ' ');
  const tshort = c => { const n = tname(c); return n; };
  const plink = (id, name) => `<a class="plink" href="#/player/${id}">${esc(pname(name))}</a>`;
  const tlink = c => `<a class="plink" href="#/team/${c}">${esc(tname(c))}</a>`;
  const initials = n => pname(n).split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // ---------- pitch types
  const PT = {
    FF: ['4-Seam Fastball', '#D22D49', '4-Seam'], SI: ['Sinker', '#FE9D00', 'Sinker'], FC: ['Cutter', '#933F2C', 'Cutter'],
    SL: ['Slider', '#EEE716', 'Slider'], ST: ['Sweeper', '#DDB33A', 'Sweeper'], CU: ['Curveball', '#00D1ED', 'Curve'],
    CH: ['Changeup', '#1DBE3A', 'Change'], FS: ['Split-Finger', '#3BACAC', 'Split'], KN: ['Knuckleball', '#3C44CD', 'Knuckle'],
    OT: ['Other', '#888888', 'Other']
  };
  const PT_ORDER = ['FF', 'SI', 'FC', 'SL', 'ST', 'CU', 'CH', 'FS', 'KN', 'OT'];
  const ptName = p => (PT[p] || [p])[0];
  const ptColor = p => (PT[p] || [0, '#888'])[1];
  const ptShort = p => (PT[p] || [0, 0, p])[2];
  const darkText = p => ['SL', 'ST', 'CU'].includes(p);
  const ptPill = p => `<span class="ptpill" style="background:${ptColor(p)};${darkText(p) ? 'color:#222;text-shadow:none' : ''}">${ptName(p)}</span>`;
  const ptDot = p => `<span class="ptdot" style="background:${ptColor(p)}"></span>`;

  // ---------- formatting
  const isN = v => v !== null && v !== undefined && !Number.isNaN(v);
  const F = {
    i: v => isN(v) ? String(Math.round(v)) : '',
    r3: v => isN(v) ? (v < 0 ? '-' : '') + Math.abs(v).toFixed(3).replace(/^0/, '') : '',
    f0: v => isN(v) ? v.toFixed(0) : '',
    f1: v => isN(v) ? v.toFixed(1) : '',
    f2: v => isN(v) ? v.toFixed(2) : '',
    p: v => isN(v) ? v.toFixed(1) : '',
    rv: v => isN(v) ? (v > 0 ? '+' : '') + v.toFixed(1) : '',
    rv0: v => isN(v) ? (Math.round(v) > 0 ? '+' : '') + Math.round(v) : '',
    rv2: v => isN(v) ? (v > 0 ? '+' : '') + v.toFixed(2) : '',
    s: v => v ?? '',
    ip: v => isN(v) ? v.toFixed(1) : '',
  };
  const fmt = (v, f = 'f1') => (typeof f === 'function' ? f(v) : (F[f] || F.f1)(v));

  // ---------- colors
  const lerp = (a, b, t) => a + (b - a) * t;
  function mix(c1, c2, t) { return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`; }
  const BLUE = [50, 90, 161], GREYC = [168, 193, 195], RED = [210, 45, 73];
  function pctColor(p) { if (!isN(p)) return '#ccc'; return p <= 50 ? mix(BLUE, GREYC, p / 50) : mix(GREYC, RED, (p - 50) / 50); }
  const CB = [65, 105, 177], CR = [218, 42, 50], W = [255, 255, 255];
  function shade(p) { // table cell shading (Savant style): white in the middle, saturated at extremes
    if (!isN(p)) return '';
    const t = Math.abs(p - 50) / 50; const k = Math.pow(t, 1.35);
    if (k < 0.08) return '';
    const bg = p > 50 ? mix(W, CR, k) : mix(W, CB, k);
    return `background:${bg};${k > 0.62 ? 'color:#fff' : ''}`;
  }
  function divColor(v, lo, hi) { // diverging color for zone charts, value relative to range
    if (!isN(v)) return '#eee'; const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
    return t < .5 ? mix(CB, W, t * 2) : mix(W, CR, (t - .5) * 2);
  }
  function rankPct(sortedArr, v) {
    if (!isN(v) || !sortedArr.length) return null;
    let lo = 0, hi = sortedArr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sortedArr[m] < v) lo = m + 1; else hi = m; }
    let lo2 = lo, hi2 = sortedArr.length; while (lo2 < hi2) { const m = (lo2 + hi2) >> 1; if (sortedArr[m] <= v) lo2 = m + 1; else hi2 = m; }
    return ((lo + lo2) / 2) / sortedArr.length * 100;
  }

  // ---------- tooltip
  const tipEl = () => $('#tip');
  function tip(html, ev) { const t = tipEl(); if (!html) { t.style.display = 'none'; return; } t.innerHTML = html; t.style.display = 'block'; const x = ev.clientX + 14, y = ev.clientY + 12; t.style.left = Math.min(x, innerWidth - t.offsetWidth - 8) + 'px'; t.style.top = Math.min(y, innerHeight - t.offsetHeight - 8) + 'px'; }

  // ---------- table component
  /* cols: {k, l, f, s (1 higher=red,-1 lower=red,0 none), c (class), get(row), html(row), t (tooltip)} */
  function renderTable(el, opt) {
    const st = { sort: opt.sort, dir: opt.dir ?? -1, page: 0, ps: opt.pageSize || 0 };
    const cols = opt.cols;
    const val = (r, c) => c.get ? c.get(r) : r[c.k];
    // shading references
    const ref = {};
    const refRows = opt.refRows || opt.rows;
    cols.forEach(c => { if (c.s) ref[c.k] = refRows.map(r => val(r, c)).filter(isN).sort((a, b) => a - b); });
    function draw() {
      let rows = opt.rows.slice();
      if (st.sort) {
        const c = cols.find(x => x.k === st.sort) || { k: st.sort };
        rows.sort((a, b) => { const va = val(a, c), vb = val(b, c); const na = !isN(va) || va === '', nb = !isN(vb) || vb === ''; if (na && nb) return 0; if (na) return 1; if (nb) return -1; return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * st.dir; });
      }
      const total = rows.length;
      if (st.ps) rows = rows.slice(st.page * st.ps, (st.page + 1) * st.ps);
      const head = (opt.rank ? '<th class="l">#</th>' : '') + cols.map(c => `<th class="${c.c === 'l' || c.c === 'nm' || c.c === 'tm' ? 'l' : ''} ${st.sort === c.k ? 'sorted' + (st.dir > 0 ? ' asc' : '') : ''}" data-k="${c.k}" ${c.t ? `title="${esc(c.t)}"` : ''}>${c.l}</th>`).join('');
      const body = rows.map((r, i) => {
        const tds = cols.map(c => {
          const v = val(r, c);
          let style = '';
          if (c.s && opt.shade !== false && (!opt.shadeIf || opt.shadeIf(r))) { const p = rankPct(ref[c.k], v); if (p !== null) style = shade(c.s > 0 ? p : 100 - p); }
          const inner = c.html ? c.html(r) : esc(fmt(v, c.f));
          return `<td class="${c.c || ''}" style="${style}">${inner}</td>`;
        }).join('');
        const cls = (opt.rowClass ? opt.rowClass(r) : '') + (opt.onRow ? ' click' : '');
        return `<tr class="${cls}" data-i="${i}">${opt.rank ? `<td class="rk l">${st.page * st.ps + i + 1}</td>` : ''}${tds}</tr>`;
      }).join('');
      const foot = opt.footRows ? opt.footRows.map(r => `<tr class="tot">${opt.rank ? '<td></td>' : ''}${cols.map(c => `<td class="${c.c || ''}">${c.footHtml ? c.footHtml(r) : esc(fmt(val(r, c), c.f))}</td>`).join('')}</tr>`).join('') : '';
      const pages = st.ps ? Math.ceil(total / st.ps) : 1;
      let pager = '';
      if (pages > 1) {
        const btns = []; const P = st.page;
        const add = p => btns.push(`<button data-p="${p}" class="${p === P ? 'on' : ''}">${p + 1}</button>`);
        for (let p = 0; p < pages; p++) { if (p < 2 || p >= pages - 2 || Math.abs(p - P) <= 2) add(p); else if (btns[btns.length - 1] !== '…') btns.push('…'); }
        pager = `<div class="pager"><button data-p="${Math.max(0, P - 1)}">‹ Prev</button>${btns.join('')}<button data-p="${Math.min(pages - 1, P + 1)}">Next ›</button><span class="small">&nbsp;${total.toLocaleString()} rows</span></div>`;
      }
      el.innerHTML = `<div class="tw"${opt.maxH ? ` style="max-height:${opt.maxH}px"` : ''}><table class="st"><thead><tr>${head}</tr></thead><tbody>${body}${foot}</tbody></table></div>${pager}`;
      $$('th[data-k]', el).forEach(th => th.onclick = () => { const k = th.dataset.k; if (st.sort === k) st.dir *= -1; else { st.sort = k; const c = cols.find(x => x.k === k); st.dir = (c && (c.c === 'nm' || c.c === 'tm' || c.c === 'l')) ? 1 : -1; } st.page = 0; draw(); });
      $$('.pager button[data-p]', el).forEach(b => b.onclick = () => { st.page = +b.dataset.p; draw(); el.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
      if (opt.onRow) $$('tbody tr[data-i]', el).forEach(tr => tr.onclick = e => { if (e.target.closest('a')) return; opt.onRow(rows[+tr.dataset.i]); });
      opt.state = st; opt.sortedRows = () => { const c = cols.find(x => x.k === st.sort) || {}; return opt.rows; };
    }
    draw();
    return { redraw: draw, state: st, rows: () => opt.rows };
  }
  function csv(rows, cols, name) {
    const val = (r, c) => c.get ? c.get(r) : r[c.k];
    const lines = [cols.map(c => '"' + c.l.replace(/<[^>]+>/g, '').replace(/"/g, '') + '"').join(',')];
    rows.forEach(r => lines.push(cols.map(c => { let v = val(r, c); if (c.c === 'nm' && typeof v === 'string') v = pname(v); if (c.c === 'tm') v = tname(v); return typeof v === 'string' ? '"' + v.replace(/"/g, '""') + '"' : (isN(v) ? v : ''); }).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.csv'; a.click();
  }

  // ---------- section helper
  const sec = (title, tipText, id) => `<div class="sec"${id ? ` id="${id}"` : ''}><h3>${title}${tipText ? `<span class="q" title="${esc(tipText)}">?</span>` : ''}</h3></div>`;

  // ---------- routing
  const routes = {};
  function route(name, fn) { routes[name] = fn; }
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    return { parts, q };
  }
  function go(h) { location.hash = h; }
  function setQuery(q) { const { parts } = parseHash(); const s = new URLSearchParams(q).toString(); history.replaceState(null, '', '#/' + parts.map(encodeURIComponent).join('/') + (s ? '?' + s : '')); }
  let lastPath = null;
  async function dispatch() {
    const { parts, q } = parseHash();
    const name = parts[0] || 'home';
    const fn = routes[name] || routes.notfound;
    const app = $('#app');
    const pathKey = parts.join('/');
    if (pathKey !== lastPath) { window.scrollTo(0, 0); }
    lastPath = pathKey;
    $$('#nav a[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === name));
    app.innerHTML = '<div class="loading">Loading…</div>';
    try { await fn(app, parts.slice(1), q); }
    catch (e) { console.error(e); app.innerHTML = `<div class="loading" style="color:#a00">Couldn't load this page (${esc(e.message)}).</div>`; }
    tip(null);
  }

  // ---------- nav / mega menu
  function navHtml() {
    const L = (window.BOARDS || []);
    const groups = {};
    L.forEach(b => (groups[b.group] = groups[b.group] || []).push(b));
    const mega = Object.entries(groups).map(([g, list]) => `<div><h5>${g}</h5>${list.map(b => `<a href="#/leaderboard/${b.id}">${b.title}</a>`).join('')}</div>`).join('');
    return `<a href="#/" data-r="home">Home</a>
      <div class="dd" id="lbdd"><span>Leaderboards <span class="badge">NEW</span> ▾</span><div class="mega">${mega}</div></div>
      <a href="#/scoreboard" data-r="scoreboard">Scoreboard</a>
      <a href="#/teams" data-r="teams">Teams</a>
      <a href="#/players" data-r="players">Players</a>
      <a href="#/movement" data-r="movement">Visuals</a>
      <a href="#/compare" data-r="compare">Compare Players</a>
      <a href="#/glossary" data-r="glossary">Glossary</a>`;
  }

  // ---------- search
  let SIDX = null;
  async function searchIndex() {
    if (SIDX) return SIDX;
    const [s, m] = await Promise.all([getJSON('data/search.json'), meta()]);
    const map = new Map();
    s.forEach(([id, n, t, role, vol]) => {
      const e = map.get(id) || { id, n, t, roles: [], vol: 0 }; e.roles.push(role); e.vol += vol; map.set(id, e);
    });
    const players = [...map.values()].map(e => ({ ...e, key: (pname(e.n) + ' ' + e.n + ' ' + tname(e.t)).toLowerCase() }));
    const teams = Object.entries(m.teams).map(([c, n]) => ({ id: c, n, team: true, key: (n + ' ' + c).toLowerCase().replace(/_/g, ' '), vol: 1e6 }));
    SIDX = { players, teams };
    return SIDX;
  }
  async function search(qs, limit = 12) {
    const idx = await searchIndex();
    const toks = qs.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!toks.length) return [];
    const hit = e => toks.every(t => e.key.includes(t));
    const score = e => { const nm = pname(e.n).toLowerCase(); return (toks.some(t => nm.startsWith(t)) ? 2 : 0) + (toks.every(t => nm.includes(t)) ? 3 : 0); };
    const t = idx.teams.filter(hit).slice(0, 4);
    const p = idx.players.filter(hit).sort((a, b) => score(b) - score(a) || b.vol - a.vol).slice(0, limit);
    return [...t, ...p];
  }
  function bindSearch() {
    const inp = $('#q'), ac = $('#ac'); let items = [], sel = 0;
    const show = () => {
      if (!items.length) { ac.hidden = true; return; }
      ac.innerHTML = items.map((e, i) => e.team
        ? `<div data-i="${i}" class="${i === sel ? 'on' : ''}"><span><span class="tag T">TEAM</span>${esc(e.n)}</span><span class="t">${e.id}</span></div>`
        : `<div data-i="${i}" class="${i === sel ? 'on' : ''}"><span>${e.roles.map(r => `<span class="tag ${r}">${r === 'P' ? 'P' : 'BAT'}</span>`).join('')}${esc(pname(e.n))}</span><span class="t">${esc(tname(e.t))}</span></div>`).join('');
      ac.hidden = false;
      $$('div[data-i]', ac).forEach(d => d.onmousedown = ev => { ev.preventDefault(); pick(items[+d.dataset.i]); });
    };
    const pick = e => { if (!e) return; ac.hidden = true; inp.value = ''; inp.blur(); go(e.team ? `#/team/${e.id}` : `#/player/${e.id}`); };
    inp.oninput = async () => { const v = inp.value; items = await search(v); if (inp.value !== v) return; sel = 0; show(); };
    inp.onkeydown = e => {
      if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); show(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); show(); e.preventDefault(); }
      else if (e.key === 'Enter') { if (items[sel]) pick(items[sel]); else if (inp.value.trim()) go('#/players?q=' + encodeURIComponent(inp.value.trim())); }
      else if (e.key === 'Escape') { ac.hidden = true; inp.blur(); }
    };
    inp.onblur = () => setTimeout(() => ac.hidden = true, 150);
    inp.onfocus = () => { if (items.length) show(); };
    document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); inp.focus(); } });
  }

  // ---------- scoreboard strip
  async function strip(date) {
    const m = await meta();
    const dates = m.dates; let i = date ? dates.indexOf(date) : dates.length - 1; if (i < 0) i = dates.length - 1;
    const el = $('#strip');
    const draw = async () => {
      const d = dates[i];
      el.innerHTML = `<div class="strip"><div class="d" title="Open scoreboard">${d.slice(5).replace('-', '/')}</div><div class="gms"><div class="gm small">Loading…</div></div><div class="arr"><button data-d="-1" aria-label="Previous day">‹</button><button data-d="1" aria-label="Next day">›</button></div></div>`;
      $('.d', el).onclick = () => go('#/scoreboard/' + d);
      $$('button', el).forEach(b => b.onclick = () => { i = Math.max(0, Math.min(dates.length - 1, i + +b.dataset.d)); draw(); });
      const g = await getJSON(`data/g/${d}.json`);
      $('.gms', el).innerHTML = g.games.map(x => {
        const aw = x.ar > x.hr, hw = x.hr > x.ar;
        return `<div class="gm" data-s="${x.sid}" title="${esc(tname(x.away))} at ${esc(tname(x.home))}"><div class="r"><span class="${aw ? 'w' : ''}">${esc(shortTeam(x.away, x.an))}</span><b>${x.ar ?? ''}</b></div><div class="r"><span class="${hw ? 'w' : ''}">${esc(shortTeam(x.home, x.hn))}</span><b>${x.hr ?? ''}</b></div></div>`;
      }).join('') || '<div class="gm small">No games</div>';
      $$('.gm[data-s]', el).forEach(gm => gm.onclick = () => go(`#/game/${d}/${gm.dataset.s}`));
    };
    draw();
  }
  function shortTeam(code, name) {
    const n = TEAMS[code] || name || code || '';
    return n.length > 18 ? n.split(' ').slice(0, -1).join(' ').slice(0, 18) || n.slice(0, 18) : n;
  }

  async function start() {
    const m = await meta();
    TEAMS = m.teams;
    $('#nav').innerHTML = navHtml();
    const dd = $('#lbdd'); dd.querySelector('span').onclick = () => dd.classList.toggle('open');
    document.addEventListener('click', e => { if (!e.target.closest('#lbdd')) dd.classList.remove('open'); });
    dd.querySelectorAll('.mega a').forEach(a => a.addEventListener('click', () => dd.classList.remove('open')));
    $('#foot').innerHTML = `Built from ${m.n_pitches.toLocaleString()} tracked pitches across ${m.n_games.toLocaleString()} games (${m.dates[0]} – ${m.dates[m.dates.length - 1]}). Expected stats, run values and fielding metrics are estimated from TrackMan fields — see the <a class="lk" href="#/glossary">Glossary</a> for methods. Press <span class="kbd">/</span> anywhere to search.`;
    bindSearch();
    strip();
    window.addEventListener('hashchange', dispatch);
    dispatch();
  }

  return { $, $$, esc, getJSON, table, player, meta, pname, tname, tshort, plink, tlink, initials, PT, PT_ORDER, ptName, ptColor, ptShort, ptPill, ptDot, darkText,
    F, fmt, isN, pctColor, shade, divColor, rankPct, tip, renderTable, csv, sec, route, go, parseHash, setQuery, start, strip, search, shortTeam, get TEAMS() { return TEAMS; } };
})();
