/* home, teams, scoreboard/game, compare, visuals, glossary */
(() => {
  const { $, $$, esc, fmt, isN, pname, tname, tlink, plink, ptPill, ptName, ptColor, PT_ORDER, renderTable, sec, F, route, go } = App;
  const { mkCol, nameCol, teamCol } = Boards;

  // ---------------- home
  route('home', async app => {
    const [m, hit, pit, top, teams] = await Promise.all([App.meta(), App.table('hitters'), App.table('pitchers'), App.getJSON('data/top.json'), App.table('teams')]);
    document.title = 'trackman lab · 2026 College Statcast';
    const qh = hit.filter(r => r.pa >= m.qual.b), qp = pit.filter(r => r.bf >= m.qual.p);
    const L = m.league;
    const leaders = (rows, k, f, dir = -1, n = 8) => rows.filter(r => isN(r[k])).sort((a, b) => (a[k] - b[k]) * dir).slice(0, n);
    const card = (title, href, rows, k, f, sub) => `<div class="lbcard"><h4>${title}<a href="${href}">View all ›</a></h4><table>${rows.map((r, i) => `<tr><td class="r">${i + 1}</td><td>${plink(r.id, r.name)}<span class="s">${esc(tname(r.team))}</span></td><td class="v">${fmt(r[k], f)}</td></tr>`).join('')}</table></div>`;
    const groups = {}; Boards.B.forEach(b => (groups[b.group] = groups[b.group] || []).push(b));
    app.innerHTML = `
      <div class="hero-s"><div><h2>2026 College Statcast</h2><p>Every tracked pitch of the 2026 college season — leaderboards, player pages, pitch arsenals, team defense and game feeds.</p></div>
        <div class="kpis"><div><b>${(m.n_pitches / 1e6).toFixed(2)}M</b><span>Pitches</span></div><div><b>${m.n_games.toLocaleString()}</b><span>Games</span></div><div><b>${pit.length.toLocaleString()}</b><span>Pitchers</span></div><div><b>${hit.length.toLocaleString()}</b><span>Hitters</span></div><div><b>${Object.keys(m.teams).length}</b><span>Teams</span></div></div></div>
      <div class="grid4" style="margin-bottom:6px">
        <div class="lbcard"><h4>League Averages</h4><table>${[['AVG / OBP / SLG', `${F.r3(L.avg)} / ${F.r3(L.obp)} / ${F.r3(L.slg)}`], ['wOBA · xwOBA', `${F.r3(L.woba)} · ${F.r3(L.xwoba)}`], ['K% · BB%', `${fmt(L.k_pct, 'p')} · ${fmt(L.bb_pct, 'p')}`], ['Avg EV · LA', `${fmt(L.ev, 'f1')} mph · ${fmt(L.la, 'f1')}°`], ['Barrel% · HardHit%', `${fmt(L.barrel_pct, 'p')} · ${fmt(L.hard_pct, 'p')}`], ['Whiff% · Chase%', `${fmt(L.whiff_pct, 'p')} · ${fmt(L.chase_pct, 'p')}`], ['Zone% · CSW%', `${fmt(L.zone_pct, 'p')} · ${fmt(L.csw_pct, 'p')}`], ['Runs / 9', fmt(L.ra9, 'f2')]].map(([a, b]) => `<tr><td>${a}</td><td class="v">${b}</td></tr>`).join('')}</table></div>
        ${card('xwOBA Leaders', '#/leaderboard/expected?role=b', leaders(qh, 'xwoba'), 'xwoba', 'r3')}
        ${card('Avg Exit Velocity', '#/leaderboard/exit-velocity?role=b', leaders(qh, 'ev'), 'ev', 'f1')}
        ${card('Barrel %', '#/leaderboard/exit-velocity?role=b', leaders(qh, 'barrel_pct'), 'barrel_pct', 'p')}
        ${card('Pitching Run Value', '#/leaderboard/run-value?role=p', leaders(qp, 'rv_p'), 'rv_p', 'rv')}
        ${card('Whiff %', '#/leaderboard/plate-discipline?role=p', leaders(qp, 'whiff_pct'), 'whiff_pct', 'p')}
        ${card('Fastball Velocity', '#/leaderboard/velocity', leaders(qp, 'fb_velo'), 'fb_velo', 'f1')}
        ${card('Lowest xRA9', '#/leaderboard/expected?role=p', leaders(qp, 'xra9', 'f2', 1), 'xra9', 'f2')}
      </div>
      <div class="grid2">
        <div><div class="sec"><h3>Hardest-Hit Balls</h3></div><div id="tb"></div></div>
        <div><div class="sec"><h3>Fastest Pitches</h3></div><div id="tv"></div></div>
      </div>
      <div class="grid2">
        <div><div class="sec"><h3>Team Outs Above Expected</h3></div><div id="td"></div></div>
        <div><div class="sec"><h3>Team xwOBA (Offense)</h3></div><div id="to"></div></div>
      </div>
      ${sec('All Leaderboards')}
      <div class="linkgrid">${Object.entries(groups).map(([g, l]) => `<h5>${g}</h5>${l.map(b => `<a href="#/leaderboard/${b.id}">${b.title}</a>`).join('')}`).join('')}
        <h5>More</h5><a href="#/scoreboard">Scoreboard & Game Feeds</a><a href="#/teams">Team Pages</a><a href="#/players">Player Directory</a><a href="#/movement">Pitch Movement Visual</a><a href="#/compare">Compare Players</a><a href="#/glossary">Glossary & Methods</a></div>`;
    const N = top.names;
    renderTable($('#tb'), { rows: top.bb.slice(0, 15).map(r => ({ id: r[0], pid: r[1], date: r[2], ev: r[3], la: r[4], res: r[5], pt: r[6] })), cols: [{ k: 'name', l: 'Batter', c: 'nm', html: r => plink(r.id, N[r.id]) }, { k: 'p', l: 'Pitcher', c: 'nm', html: r => plink(r.pid, N[r.pid]) }, { k: 'date', l: 'Date', c: 'l', f: 's' }, { k: 'ev', l: 'EV', f: 'f1' }, { k: 'la', l: 'LA', f: 'f0' }, { k: 'res', l: 'Result', c: 'l', f: 's' }, { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }], shade: false, rank: true });
    renderTable($('#tv'), { rows: top.velo.slice(0, 15).map(r => ({ id: r[0], bid: r[1], date: r[2], velo: r[3], pt: r[4], call: r[5], spin: r[6] })), cols: [{ k: 'name', l: 'Pitcher', c: 'nm', html: r => plink(r.id, N[r.id]) }, { k: 'b', l: 'Batter', c: 'nm', html: r => plink(r.bid, N[r.bid]) }, { k: 'date', l: 'Date', c: 'l', f: 's' }, { k: 'velo', l: 'MPH', f: 'f1' }, { k: 'spin', l: 'Spin', f: 'f0' }, { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }, { k: 'call', l: 'Result', c: 'l', get: r => r.call.replace(/([A-Z])/g, ' $1').trim(), f: 's' }], shade: false, rank: true });
    const tcol = { k: 'name', l: 'Team', c: 'nm', html: r => tlink(r.id) };
    renderTable($('#td'), { rows: teams.slice().sort((a, b) => b.d_oae - a.d_oae).slice(0, 10), cols: [tcol, { k: 'd_bip', l: 'BIP', f: 'i' }, { k: 'd_oae', l: 'OAE', f: 'rv', s: 1 }, { k: 'd_drv', l: 'Fielding RV', f: 'rv', s: 1 }, { k: 'd_der', l: 'DER', f: 'r3', s: 1 }], refRows: teams, rank: true });
    renderTable($('#to'), { rows: teams.slice().sort((a, b) => b.b_xwoba - a.b_xwoba).slice(0, 10), cols: [tcol, { k: 'b_pa', l: 'PA', f: 'i' }, { k: 'b_xwoba', l: 'xwOBA', f: 'r3', s: 1 }, { k: 'b_woba', l: 'wOBA', f: 'r3', s: 1 }, { k: 'b_ev', l: 'EV', f: 'f1', s: 1 }, { k: 'b_barrel_pct', l: 'Barrel%', f: 'p', s: 1 }], refRows: teams, rank: true });
  });

  // ---------------- teams index
  route('teams', async app => {
    const teams = await App.table('teams');
    app.innerHTML = `<h1 class="pg"><span class="stc">TEAMS</span><span class="bar"></span>2026 Team Directory</h1>
      <div class="ctrls"><input id="f" type="search" placeholder="Find a team" style="width:260px"></div><div id="t"></div>`;
    const cols = [{ k: 'name', l: 'Team', c: 'nm', html: r => tlink(r.id) }, { k: 'rec', l: 'W-L', c: 'l', get: r => `${r.w}-${r.l}`, f: 's' }, { k: 'b_pa', l: 'PA', f: 'i' }, { k: 'b_ops', l: 'OPS', f: 'r3', s: 1 }, { k: 'b_xwoba', l: 'Off. xwOBA', f: 'r3', s: 1 }, { k: 'b_ev', l: 'Off. EV', f: 'f1', s: 1 },
      { k: 'p_ipd', l: 'IP', f: 'ip' }, { k: 'p_ra9', l: 'RA9', f: 'f2', s: -1 }, { k: 'p_xwoba', l: 'Pitch xwOBA', f: 'r3', s: -1 }, { k: 'p_k_pct', l: 'Pitch K%', f: 'p', s: 1 }, { k: 'p_fb_velo', l: 'FB Velo', f: 'f1', s: 1 }, { k: 'd_oae', l: 'Def. OAE', f: 'rv', s: 1 }, { k: 'f_saa', l: 'Framing', f: 'rv', s: 1 }];
    const draw = (f = '') => renderTable($('#t'), { rows: teams.filter(t => t.name.toLowerCase().includes(f.toLowerCase())), cols, sort: 'name', dir: 1, refRows: teams, onRow: r => go('#/team/' + r.id) });
    draw(); $('#f').oninput = e => draw(e.target.value);
  });

  // ---------------- team page
  route('team', async (app, parts, q) => {
    const code = parts[0]; const tab = parts[1] || 'overview';
    const [teams, hit, pit, sched, m, ars] = await Promise.all([App.table('teams'), App.table('hitters'), App.table('pitchers'), App.getJSON('data/schedule.json'), App.meta(), App.table('arsenal')]);
    const T = teams.find(t => t.id === code);
    if (!T) { app.innerHTML = '<div class="loading">Team not found (or too little tracked data).</div>'; return; }
    document.title = `${T.name} | trackman lab`;
    const pct = (k, dir = 1) => { const v = teams.map(t => t[k]).filter(isN).sort((a, b) => a - b); const p = App.rankPct(v, T[k]); return p === null ? null : Math.max(1, Math.round(dir > 0 ? p : 100 - p)); };
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/teams">Teams</a> › ${esc(T.name)}</div>
      <div class="top3"><div class="panel bio"><div class="hero"></div><div class="av">${esc(App.initials(T.name.split(' ').slice(0, 2).join(', ')))}</div><div class="nm">${esc(T.name)}</div><div class="tm">${T.w}-${T.l} in tracked games</div>
        <table class="mini"><tr><th></th><th>AVG</th><th>OBP</th><th>SLG</th><th>xwOBA</th><th>RA9</th><th>xRA9</th></tr><tr><td>2026</td><td>${F.r3(T.b_avg)}</td><td>${F.r3(T.b_obp)}</td><td>${F.r3(T.b_slg)}</td><td>${F.r3(T.b_xwoba)}</td><td>${fmt(T.p_ra9, 'f2')}</td><td>${fmt(T.p_xra9, 'f2')}</td></tr></table></div>
        <div class="panel"><h4><b>Team</b> Percentile Rankings<span class="dots"></span></h4><div id="pct"></div></div>
        <div class="panel"><h4><b>Recent</b> Results<span class="dots"></span></h4><div id="res" style="max-height:470px;overflow:auto"></div></div></div>
      <div class="tabs">${[['overview', 'Roster Stats'], ['statcast', 'Statcast'], ['arsenal', 'Pitch Arsenals'], ['schedule', 'Schedule']].map(([k, l]) => `<a href="#/team/${code}/${k}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}</div><div id="body"></div>`;
    const keys = [['Offense', [['b_xwoba', 'xwOBA', 1, 'r3'], ['b_ev', 'Avg Exit Velo', 1, 'f1'], ['b_barrel_pct', 'Barrel %', 1, 'p'], ['b_hard_pct', 'Hard-Hit %', 1, 'p'], ['b_k_pct', 'K %', -1, 'p'], ['b_bb_pct', 'BB %', 1, 'p'], ['b_chase_pct', 'Chase %', -1, 'p']]],
      ['Pitching', [['p_xra9', 'xRA9', -1, 'f2'], ['p_xwoba', 'xwOBA', -1, 'r3'], ['p_k_pct', 'K %', 1, 'p'], ['p_bb_pct', 'BB %', -1, 'p'], ['p_whiff_pct', 'Whiff %', 1, 'p'], ['p_fb_velo', 'Fastball Velo', 1, 'f1'], ['p_barrel_pct', 'Barrel %', -1, 'p']]],
      ['Defense', [['d_oae', 'Outs Above Expected', 1, 'rv'], ['d_der', 'Def. Efficiency', 1, 'r3'], ['f_saa', 'Framing (Strikes +/-)', 1, 'rv']]]];
    const pv = {}, vv = {}, fm = {};
    keys.forEach(([, ks]) => ks.forEach(([k, , d, f]) => { pv[k] = pct(k, d); vv[k] = T[k]; fm[k] = f; }));
    Charts.percentiles($('#pct'), keys.map(([g, ks]) => [g, ks.map(([k, l]) => [k, l])]), pv, vv, fm, { note: `Percentiles vs. ${teams.length} teams.` });
    const games = sched.filter(s => s[2] === code || s[3] === code).reverse();
    $('#res').innerHTML = `<table class="mini">${games.map(s => { const home = s[2] === code; const us = home ? s[4] : s[5], them = home ? s[5] : s[4]; const w = us > them; return `<tr style="cursor:pointer" onclick="App.go('#/game/${s[1]}/${s[0]}')"><td>${s[1].slice(5)}</td><td style="text-align:left">${home ? 'vs' : '@'} ${esc(tname(home ? s[3] : s[2]))}</td><td style="color:${w ? '#1a7f37' : '#b42318'};font-weight:700">${us === them ? 'T' : (w ? 'W' : 'L')}</td><td>${us}-${them}</td></tr>`; }).join('')}</table>`;
    const body = $('#body');
    const H = hit.filter(r => r.team === code), P = pit.filter(r => r.team === code);
    const qh = hit.filter(r => r.pa >= m.qual.b), qp = pit.filter(r => r.bf >= m.qual.p);
    if (tab === 'overview') {
      body.innerHTML = `${sec('Hitters')}<div id="h"></div>${sec('Pitchers')}<div id="p"></div>`;
      renderTable($('#h'), { rows: H, cols: [nameCol, { k: 'bats', l: 'B', c: 'l', f: 's' }, ...['g', 'pa', 'avg', 'obp', 'slg', 'ops', 'hr', 'bb_pct', 'k_pct', 'woba', 'xwoba', 'xba', 'xslg', 'ev', 'ev_max', 'barrel_pct', 'hard_pct', 'sweet_pct', 'chase_pct', 'whiff_pct', 'rv'].map(k => mkCol(k, 'b'))], sort: 'pa', refRows: qh, shadeIf: r => r.pa >= 30, onRow: r => go('#/player/' + r.id) });
      renderTable($('#p'), { rows: P, cols: [nameCol, { k: 'throws', l: 'T', c: 'l', f: 's' }, ...['g', 'gs', 'ipd', 'bf', 'ra9', 'xra9', 'fip', 'whip', 'k_pct', 'bb_pct', 'woba', 'xwoba', 'ev', 'barrel_pct', 'gb_pct', 'whiff_pct', 'csw_pct', 'chase_pct', 'fb_velo', 'ext', 'rv_p'].map(k => mkCol(k, 'p'))], sort: 'bf', refRows: qp, shadeIf: r => r.bf >= 30, onRow: r => go('#/player/' + r.id) });
    } else if (tab === 'statcast') {
      body.innerHTML = `${sec('Team Statcast — Offense')}<div id="a"></div>${sec('Team Statcast — Pitching')}<div id="b"></div>${sec('Team Defense & Framing')}<div id="c"></div>${sec('Running Game')}<div id="d"></div>`;
      const L = m.league;
      const lgRow = pre => ({ name: 'League Avg', ...Object.fromEntries(Object.entries(L).map(([k, v]) => [pre + k, v])) });
      const tcol = { k: 'name', l: '', c: 'l', f: 's' };
      const bk = ['pa', 'avg', 'obp', 'slg', 'woba', 'xwoba', 'xba', 'xslg', 'k_pct', 'bb_pct', 'ev', 'ev_max', 'la', 'barrel_pct', 'hard_pct', 'sweet_pct', 'gb_pct', 'ld_pct', 'fb_pct', 'chase_pct', 'whiff_pct', 'z_contact_pct', 'swing_pct'];
      renderTable($('#a'), { rows: [T], cols: [tcol, ...bk.map(k => ({ ...mkCol(k, 'b'), k: 'b_' + k }))], footRows: [lgRow('b_')], refRows: teams });
      const pk = ['bf', 'ipd', 'ra9', 'xra9', 'fip', 'whip', 'woba', 'xwoba', 'xba', 'k_pct', 'bb_pct', 'ev', 'barrel_pct', 'hard_pct', 'gb_pct', 'chase_pct', 'whiff_pct', 'csw_pct', 'zone_pct', 'fps_pct', 'putaway_pct', 'fb_velo'];
      renderTable($('#b'), { rows: [T], cols: [tcol, ...pk.map(k => ({ ...mkCol(k, 'p'), k: 'p_' + k }))], footRows: [{ ...lgRow('p_'), p_ra9: L.ra9, p_xra9: L.ra9 }], refRows: teams });
      renderTable($('#c'), { rows: [T], cols: [tcol, { k: 'd_bip', l: 'Tracked BIP', f: 'i' }, { k: 'd_outs', l: 'Outs', f: 'i' }, { k: 'd_xouts', l: 'Exp. Outs', f: 'f1' }, { k: 'd_oae', l: 'OAE', f: 'rv', s: 1 }, { k: 'd_oae_gb', l: 'OAE GB', f: 'rv', s: 1 }, { k: 'd_oae_ld', l: 'OAE LD', f: 'rv', s: 1 }, { k: 'd_oae_fb', l: 'OAE FB', f: 'rv', s: 1 }, { k: 'd_oae_pu', l: 'OAE PU', f: 'rv', s: 1 }, { k: 'd_drv', l: 'Fielding RV', f: 'rv', s: 1 }, { k: 'd_der', l: 'DER', f: 'r3', s: 1 }, { k: 'd_errors', l: 'Errors', f: 'i', s: -1 }, { k: 'f_saa', l: 'Framing Strikes', f: 'rv', s: 1 }, { k: 'f_frv', l: 'Framing Runs', f: 'rv', s: 1 }], refRows: teams });
      renderTable($('#d'), { rows: [T], cols: [tcol, { k: 'sb', l: 'SB', f: 'i' }, { k: 'cs', l: 'CS', f: 'i' }, { k: 'sb_against', l: 'SB Allowed', f: 'i' }, { k: 'cs_against', l: 'Runners Caught', f: 'i' }], shade: false });
    } else if (tab === 'arsenal') {
      body.innerHTML = `${sec('Pitch Arsenals')}<div id="a"></div>`;
      const A = ars.filter(r => r.team === code);
      renderTable($('#a'), { rows: A, cols: [nameCol, { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }, ...['pitches', 'usage', 'velo', 'velo_max', 'spin', 'ivb', 'hb', 'ivb_vs', 'hb_vs', 'ext', 'whiff_pct', 'csw_pct', 'chase_pct', 'xwoba', 'rv100_p', 'rv_p'].map(k => mkCol(k, 'p'))], sort: 'pitches', refRows: ars.filter(r => r.pitches >= 100), onRow: r => go('#/player/' + r.id) });
    } else {
      body.innerHTML = `${sec('Schedule & Results (tracked games)')}<div id="a"></div>`;
      renderTable($('#a'), { rows: games.map(s => { const home = s[2] === code; return { sid: s[0], date: s[1], opp: home ? s[3] : s[2], ha: home ? 'Home' : 'Away', us: home ? s[4] : s[5], them: home ? s[5] : s[4] }; }),
        cols: [{ k: 'date', l: 'Date', c: 'l', f: 's' }, { k: 'ha', l: 'H/A', c: 'l', f: 's' }, { k: 'opp', l: 'Opponent', c: 'nm', html: r => tlink(r.opp) }, { k: 'res', l: 'Result', c: 'l', get: r => (r.us > r.them ? 'W ' : r.us < r.them ? 'L ' : 'T ') + r.us + '-' + r.them, f: 's' }, { k: 'g', l: '', c: 'l', html: r => `<a class="lk" href="#/game/${r.date}/${r.sid}">Game feed ›</a>` }], sort: 'date', shade: false });
    }
  });

  // ---------------- players directory
  route('players', async (app, parts, q) => {
    const [hit, pit] = await Promise.all([App.table('hitters'), App.table('pitchers')]);
    const map = new Map();
    pit.forEach(r => map.set(r.id, { id: r.id, name: r.name, team: r.team, role: 'P', bf: r.bf, ipd: r.ipd, pa: null, t: r.throws }));
    hit.forEach(r => { const e = map.get(r.id); if (e) { e.role = 'P / Bat'; e.pa = r.pa; e.b = r.bats; } else map.set(r.id, { id: r.id, name: r.name, team: r.team, role: 'Batter', pa: r.pa, b: r.bats }); });
    const all = [...map.values()];
    app.innerHTML = `<h1 class="pg"><span class="stc">PLAYERS</span><span class="bar"></span>Player Directory</h1>
      <div class="ctrls"><input id="f" type="search" placeholder="Name or team…" value="${esc(q.q || '')}" style="width:300px"><select id="r"><option value="">All roles</option><option>P</option><option>Batter</option><option>P / Bat</option></select><span class="small" id="cnt"></span></div><div id="t"></div>`;
    const draw = () => { const f = $('#f').value.toLowerCase(), r = $('#r').value; const rows = all.filter(x => (!r || x.role === r) && (pname(x.name) + ' ' + x.name + ' ' + tname(x.team)).toLowerCase().includes(f)); $('#cnt').textContent = rows.length.toLocaleString() + ' players';
      renderTable($('#t'), { rows, cols: [nameCol, teamCol, { k: 'role', l: 'Role', c: 'l', f: 's' }, { k: 'pa', l: 'PA', f: 'i' }, { k: 'bf', l: 'BF', f: 'i' }, { k: 'ipd', l: 'IP', f: 'ip' }], sort: 'name', dir: 1, pageSize: 100, onRow: x => go('#/player/' + x.id), shade: false }); };
    draw(); $('#f').oninput = draw; $('#r').onchange = draw;
  });

  // ---------------- scoreboard
  route('scoreboard', async (app, parts) => {
    const m = await App.meta();
    const d = parts[0] && m.dates.includes(parts[0]) ? parts[0] : m.dates[m.dates.length - 1];
    const g = await App.getJSON(`data/g/${d}.json`);
    App.strip(d);
    const i = m.dates.indexOf(d);
    app.innerHTML = `<h1 class="pg"><span class="stc">SCOREBOARD</span><span class="bar"></span>${new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h1>
      <div class="ctrls"><a class="btn ghost" style="display:inline-flex;align-items:center" href="#/scoreboard/${m.dates[Math.max(0, i - 1)]}">‹ Previous day</a><select id="d">${m.dates.map(x => `<option ${x === d ? 'selected' : ''}>${x}</option>`).join('')}</select><a class="btn ghost" style="display:inline-flex;align-items:center" href="#/scoreboard/${m.dates[Math.min(m.dates.length - 1, i + 1)]}">Next day ›</a><span class="small">${g.games.length} tracked games</span></div>
      <div class="grid3" id="gs"></div>`;
    $('#d').onchange = e => go('#/scoreboard/' + e.target.value);
    $('#gs').innerHTML = g.games.map(x => lineHtml(x, d)).join('');
    $$('.game', app).forEach(el => el.onclick = () => go(`#/game/${d}/${el.dataset.s}`));
  });
  function lineHtml(x, d) {
    const n = Math.max(9, x.line.length);
    const inn = i => x.line[i] || [null, null];
    const aw = x.ar > x.hr;
    return `<div class="game" data-s="${x.sid}"><table><tr><th></th>${Array.from({ length: n }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>R</th><th>H</th><th>E</th></tr>
      <tr class="${aw ? 'w' : ''}"><td title="${esc(tname(x.away))}">${esc(App.shortTeam(x.away, x.an))}</td>${Array.from({ length: n }, (_, i) => `<td>${inn(i)[0] ?? (i < x.line.length ? 0 : '')}</td>`).join('')}<td class="rhe">${x.ar}</td><td class="rhe">${x.ah}</td><td class="rhe">${x.ae}</td></tr>
      <tr class="${!aw ? 'w' : ''}"><td title="${esc(tname(x.home))}">${esc(App.shortTeam(x.home, x.hn))}</td>${Array.from({ length: n }, (_, i) => `<td>${inn(i)[1] ?? (i < x.line.length && i < x.line.length - 1 ? 0 : (i < x.line.length ? 'x' : ''))}</td>`).join('')}<td class="rhe">${x.hr}</td><td class="rhe">${x.hh}</td><td class="rhe">${x.he}</td></tr></table></div>`;
  }

  // ---------------- game feed
  const RES = { K: 'Strikeout', BB: 'Walk', IBB: 'Intent. Walk', HBP: 'Hit By Pitch', '1B': 'Single', '2B': 'Double', '3B': 'Triple', HR: 'Home Run', OUT: 'Out', FC: "Fielder's Choice", ROE: 'Reached on Error', SF: 'Sac Fly', SH: 'Sac Bunt' };
  route('game', async (app, parts) => {
    const [d, sid] = parts; const g = await App.getJSON(`data/g/${d}.json`);
    const x = g.games.find(y => y.sid === sid);
    if (!x) { app.innerHTML = '<div class="loading">Game not found.</div>'; return; }
    App.strip(d);
    const names = {}; x.pit.forEach(r => names[r.id] = r.n); x.bat.forEach(r => names[r.id] = r.n);
    app.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <a href="#/scoreboard/${d}">Scoreboard ${d}</a> › ${esc(tname(x.away))} @ ${esc(tname(x.home))}</div>
      <h1 class="pg"><span class="stc">GAMEFEED</span><span class="bar"></span>${tlink(x.away)}&nbsp;${x.ar} &nbsp;@&nbsp; ${tlink(x.home)}&nbsp;${x.hr}</h1>
      <div style="max-width:720px">${lineHtml(x, d)}</div>
      <div class="tabs" id="gt"><a data-t="feed" class="on">Pitch-by-PA Feed</a><a data-t="box">Box Score</a><a data-t="ev">Exit Velocity</a><a data-t="mix">Pitch Mix</a></div><div id="gb"></div>`;
    const show = t => {
      $$('#gt a').forEach(a => a.classList.toggle('on', a.dataset.t === t));
      const gb = $('#gb');
      const pas = x.pas.map(r => ({ inn: r[0], half: r[1], bid: r[2], pid: r[3], ev_: r[4], ev: r[5], la: r[6], cnt: r[7], np: r[8], pt: r[9], velo: r[10], xba: r[11], rv: r[12], outs: r[13] }));
      if (t === 'feed') {
        gb.innerHTML = sec('Plate Appearances') + '<div id="f"></div>';
        renderTable($('#f'), { rows: pas, cols: [{ k: 'inn', l: 'Inn', c: 'l', get: r => (r.half === 'T' ? '▲' : '▼') + r.inn, f: 's' }, { k: 'b', l: 'Batter', c: 'nm', html: r => plink(r.bid, names[r.bid]) }, { k: 'p', l: 'Pitcher', c: 'nm', html: r => plink(r.pid, names[r.pid]) },
          { k: 'ev_', l: 'Result', c: 'l', get: r => RES[r.ev_] || r.ev_, f: 's' }, { k: 'cnt', l: 'Count', c: 'l', f: 's' }, { k: 'np', l: 'Pitches', f: 'i' }, { k: 'pt', l: 'Last Pitch', c: 'l', html: r => ptPill(r.pt) }, { k: 'velo', l: 'MPH', f: 'f1' },
          { k: 'ev', l: 'Exit Velo', f: 'f1', s: 1 }, { k: 'la', l: 'LA', f: 'f0' }, { k: 'xba', l: 'xBA', f: 'r3', s: 1 }, { k: 'rv', l: 'Batter RV', f: 'rv2', s: 1 }], shade: true, rowClass: r => '' });
      } else if (t === 'box') {
        gb.innerHTML = [x.away, x.home].map(tm => `${sec(esc(tname(tm)) + ' Batting')}<div id="b_${tm}"></div>${sec(esc(tname(tm)) + ' Pitching')}<div id="p_${tm}"></div>`).join('');
        [x.away, x.home].forEach(tm => {
          renderTable($(`#b_${tm}`), { rows: x.bat.filter(r => r.t === tm), cols: [{ k: 'n', l: 'Batter', c: 'nm', html: r => plink(r.id, r.n) }, ...['pa', 'ab', 'h', '2B', '3B', 'hr', 'bb', 'k'].map(k => mkCol(k, 'b')), { k: 'ev_max', l: 'Max EV', f: 'f1' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }], sort: 'pa', shade: false });
          renderTable($(`#p_${tm}`), { rows: x.pit.filter(r => r.t === tm), cols: [{ k: 'n', l: 'Pitcher', c: 'nm', html: r => plink(r.id, r.n) }, ...['ipd', 'bf', 'pitches', 'h', 'runs', 'bb', 'k', 'hr'].map(k => mkCol(k, 'p')), { k: 'whiff_pct', l: 'Whiff %', f: 'p' }, { k: 'csw_pct', l: 'CSW %', f: 'p' }, { k: 'velo_max', l: 'Max Velo', f: 'f1' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }], sort: 'pitches', shade: false });
        });
      } else if (t === 'ev') {
        gb.innerHTML = sec('Batted Balls by Exit Velocity') + '<div class="grid2"><div class="card" id="sc"></div><div id="tt"></div></div>';
        const bb = pas.filter(r => isN(r.ev));
        $('#sc').insertAdjacentHTML('beforeend', Charts.evla($('#sc'), bb.map(r => [r.ev, r.la, r.ev_, r.xba])));
        renderTable($('#tt'), { rows: bb, cols: [{ k: 'b', l: 'Batter', c: 'nm', html: r => plink(r.bid, names[r.bid]) }, { k: 'inn', l: 'Inn', f: 'i' }, { k: 'ev', l: 'EV', f: 'f1' }, { k: 'la', l: 'LA', f: 'f0' }, { k: 'xba', l: 'xBA', f: 'r3' }, { k: 'ev_', l: 'Result', c: 'l', get: r => RES[r.ev_] || r.ev_, f: 's' }], sort: 'ev', shade: false, maxH: 420 });
      } else {
        gb.innerHTML = sec('Pitch Mix by Pitcher') + '<div id="mx"></div>';
        renderTable($('#mx'), { rows: x.mix.map(r => ({ id: r[0], pt: r[1], n: r[2], v: r[3], vm: r[4], wh: r[5] })), cols: [{ k: 'p', l: 'Pitcher', c: 'nm', html: r => plink(r.id, names[r.id]) }, { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }, { k: 'n', l: 'Count', f: 'i' }, { k: 'v', l: 'Avg Velo', f: 'f1' }, { k: 'vm', l: 'Max Velo', f: 'f1' }, { k: 'wh', l: 'Whiffs', f: 'i' }], sort: 'n', shade: false });
      }
    };
    $$('#gt a').forEach(a => a.onclick = () => show(a.dataset.t));
    show('feed');
  });

  // ---------------- compare
  route('compare', async (app, parts, q) => {
    const ids = (q.ids || '').split(',').filter(Boolean).slice(0, 4);
    const m = await App.meta();
    const players = (await Promise.all(ids.map(id => App.player(id)))).filter(Boolean);
    const role = q.role || (players[0] && players[0].pitching && (!players[0].hitting || players[0].pitching.std.bf >= players[0].hitting.std.pa) ? 'p' : 'b');
    app.innerHTML = `<h1 class="pg"><span class="stc">COMPARE</span><span class="bar"></span>Compare Players</h1>
      <div class="note">Add up to four players. Percentile bars are vs. qualified players; the table below lines up their full Statcast profiles.</div>
      <div class="ctrls"><div class="seg" id="role"><a data-r="b" class="${role === 'b' ? 'on' : ''}">Hitting</a><a data-r="p" class="${role === 'p' ? 'on' : ''}">Pitching</a></div>
      <div class="gsearch" style="width:340px"><input id="cq" placeholder="Add a player…" style="height:38px;font-size:14px"><div class="ac" id="cac" hidden style="top:38px"></div></div></div>
      <div class="cmp-pick">${players.map(p => `<span class="chip">${esc(pname(p.name))} <span class="small">${esc(tname(p.team))}</span><b data-id="${p.id}">✕</b></span>`).join('')}</div>
      <div class="grid${Math.max(2, Math.min(4, players.length))}" id="cp" style="${players.length ? '' : 'display:none'}"></div><div id="ct"></div>`;
    const url = (list, r = role) => `#/compare?ids=${list.join(',')}&role=${r}`;
    $$('#role a').forEach(a => a.onclick = () => go(url(ids, a.dataset.r)));
    $$('.chip b').forEach(b => b.onclick = () => go(url(ids.filter(i => i !== b.dataset.id))));
    const inp = $('#cq'), ac = $('#cac');
    inp.oninput = async () => { const r = (await App.search(inp.value, 10)).filter(e => !e.team); ac.innerHTML = r.map(e => `<div data-id="${e.id}"><span>${esc(pname(e.n))}</span><span class="t">${esc(tname(e.t))}</span></div>`).join(''); ac.hidden = !r.length; $$('div', ac).forEach(d => d.onmousedown = () => go(url([...ids, d.dataset.id].slice(0, 4)))); };
    inp.onblur = () => setTimeout(() => ac.hidden = true, 150);
    const spec = role === 'p' ? m.pct_p : m.pct_b;
    const fmtOf = k => (Boards.C[k] || [0, 'f1'])[1];
    players.forEach((p, i) => {
      const R = role === 'p' ? p.pitching : p.hitting;
      const d = document.createElement('div'); d.className = 'panel'; $('#cp').appendChild(d);
      d.innerHTML = `<h4><a class="lk" href="#/player/${p.id}">${esc(pname(p.name))}</a><span class="dots"></span></h4><div class="small" style="text-align:center">${esc(tname(p.team))}</div><div></div>`;
      if (!R) { d.lastChild.innerHTML = `<div class="small" style="padding:20px;text-align:center">No ${role === 'p' ? 'pitching' : 'hitting'} data.</div>`; return; }
      Charts.percentiles(d.lastChild, [['Percentiles', spec.map(([k, l]) => [k, l])]], R.pct || {}, R.val || {}, Object.fromEntries(spec.map(([k]) => [k, fmtOf(k)])));
    });
    if (players.length) {
      const keys = role === 'p' ? ['bf', 'ipd', 'ra9', 'xra9', 'fip', 'k_pct', 'bb_pct', 'woba', 'xwoba', 'xba', 'ev', 'barrel_pct', 'hard_pct', 'gb_pct', 'whiff_pct', 'chase_pct', 'csw_pct', 'zone_pct', 'fb_velo', 'ext'] : ['pa', 'avg', 'obp', 'slg', 'woba', 'xwoba', 'xba', 'xslg', 'k_pct', 'bb_pct', 'ev', 'ev_max', 'la', 'barrel_pct', 'hard_pct', 'sweet_pct', 'chase_pct', 'whiff_pct', 'z_contact_pct'];
      const rows = players.filter(p => role === 'p' ? p.pitching : p.hitting).map(p => { const R = role === 'p' ? p.pitching : p.hitting; return { id: p.id, name: p.name, team: p.team, ...R.disc, ...R.bbp, ...R.sc, ...R.std, ...(R.misc || {}) }; });
      $('#ct').innerHTML = sec('Side by Side') + '<div id="ctt"></div>';
      renderTable($('#ctt'), { rows, cols: [nameCol, teamCol, ...keys.map(k => mkCol(k, role))], shade: false });
    }
  });

  // ---------------- visuals: pitch movement
  route('movement', async (app, parts, q) => {
    const ars = await App.table('arsenal');
    const pt = q.pt || 'FF', hand = q.hand || 'R', min = +(q.min || 150);
    app.innerHTML = `<h1 class="pg"><span class="stc">VISUALS</span><span class="bar"></span>Pitch Movement</h1>
      <div class="note">Every qualified pitcher's average movement for one pitch type. Hover a dot for details; click to open the player. Induced vertical break removes gravity; horizontal break is positive toward the 3B side (arm side for RHP). Color = run value per 100 pitches (red = better for the pitcher).</div>
      <div class="ctrls"><select id="pt">${PT_ORDER.filter(p => p !== 'OT').map(p => `<option value="${p}" ${p === pt ? 'selected' : ''}>${ptName(p)}</option>`).join('')}</select>
      <div class="seg" id="h"><a data-h="R" class="${hand === 'R' ? 'on' : ''}">RHP</a><a data-h="L" class="${hand === 'L' ? 'on' : ''}">LHP</a></div>
      <input id="min" type="number" value="${min}" style="width:90px"><span class="small">Min pitches</span>
      <div class="seg" id="ax"><a data-a="mv" class="on">IVB vs HB</a><a data-a="vs">Velo vs IVB</a></div></div><div class="card" id="ch" style="padding:8px"></div><div id="t"></div>`;
    const go2 = o => go(`#/movement?pt=${o.pt ?? pt}&hand=${o.hand ?? hand}&min=${o.min ?? min}`);
    $('#pt').onchange = e => go2({ pt: e.target.value }); $('#min').onchange = e => go2({ min: e.target.value });
    $$('#h a').forEach(a => a.onclick = () => go2({ hand: a.dataset.h }));
    const rows = ars.filter(r => r.pt === pt && r.throws === hand && r.pitches >= min);
    const ref = rows.map(r => r.rv100_p).filter(isN).sort((a, b) => a - b);
    const mk = mode => { $('#ch').innerHTML = ''; Charts.scatter($('#ch'), rows.map(r => { const p = App.rankPct(ref, r.rv100_p); return { x: mode === 'mv' ? r.hb : r.velo, y: r.ivb, c: App.pctColor(p ?? 50), r: 3 + Math.sqrt(r.pitches) / 6, href: '#/player/' + r.id, tip: `<b>${esc(pname(r.name))}</b><br>${esc(tname(r.team))}<br>${r.pitches} ${ptName(pt)}s · ${fmt(r.velo, 'f1')} mph<br>IVB ${fmt(r.ivb, 'f1')}" · HB ${fmt(r.hb, 'f1')}"<br>Whiff ${fmt(r.whiff_pct, 'p')}% · RV/100 ${F.rv2(r.rv100_p)}` }; }),
      mode === 'mv' ? { xl: 'Horizontal Break (in) — 1B ◀ ▶ 3B', yl: 'Induced Vertical Break (in)', cross: true, xd: [-25, 25], yd: [-25, 25] } : { xl: 'Velocity (mph)', yl: 'Induced Vertical Break (in)' }); };
    mk('mv');
    $$('#ax a').forEach(a => a.onclick = () => { $$('#ax a').forEach(x => x.classList.toggle('on', x === a)); mk(a.dataset.a); });
    renderTable($('#t'), { rows, cols: [nameCol, teamCol, ...['pitches', 'velo', 'ivb', 'ivb_vs', 'hb', 'hb_vs', 'spin', 'whiff_pct', 'rv100_p'].map(k => mkCol(k, 'p'))], sort: 'ivb', rank: true, pageSize: 50, onRow: r => go('#/player/' + r.id) });
  });

  // ---------------- glossary
  route('glossary', async app => {
    const m = await App.meta();
    const cv = m.count_rv;
    app.innerHTML = `<h1 class="pg"><span class="stc">GLOSSARY</span><span class="bar"></span>Metrics & Methods</h1>
    <div class="note">Everything on this site is computed from the TrackMan pitch file (one row per pitch). A few Statcast metrics need fields TrackMan exports don't carry (spray direction, fielder positions, catcher IDs, sprint speed, bat tracking). Where possible those are approximated as described below; where not, they're left out rather than invented.</div>
    <dl class="gloss">
      <dt>Data coverage</dt><dd>${m.n_pitches.toLocaleString()} pitches in ${m.n_games.toLocaleString()} games from ${m.dates[0]} to ${m.dates[m.dates.length - 1]}. Bullpen/scrimmage sessions (under 5 innings) and duplicate feeds were dropped. Pitch types use the tagged type when present, otherwise TrackMan's auto-classification; a generic "Fastball" tag that TrackMan classifies as a sinker is shown as a sinker.</dd>
      <dt>Expected stats (xBA, xSLG, xwOBA, xwOBAcon)</dt><dd>Each tracked batted ball is assigned the league-wide hit, total-base and wOBA rates of balls with similar exit velocity and launch angle (2 mph × 2° bins, shrunk toward coarser bins when sample is thin). Strikeouts, walks and HBP count at their actual values. Untracked balls in play use the actual outcome.</dd>
      <dt>wOBA</dt><dd>Linear weights: BB .689, HBP .720, 1B .882, 2B 1.254, 3B 1.590, HR 2.050; denominator AB + BB − IBB + SF + HBP. Sacrifices are split into flies vs bunts by launch angle (≥15° = fly).</dd>
      <dt>Run Value</dt><dd>Each pitch gets the change in run expectancy from the count before to the count after (or the event's run value when the plate appearance ends). Count values were derived from this season's data — e.g. 3-0: ${F.rv2(cv['3-0'])}, 0-2: ${F.rv2(cv['0-2'])} runs vs. an average PA. Base/out state isn't in the data, so this is the count-only version. Pitcher run value is the negative of batter run value.</dd>
      <dt>RA9 / xRA9 / FIP</dt><dd>Runs allowed per nine innings (earned vs unearned isn't in the feed). xRA9 maps xwOBA allowed to the RA9 scale with a fit across pitchers (RA9 ≈ ${m.xra9[0]} + ${m.xra9[1]} × xwOBA). FIP uses the standard formula with a constant that puts it on the league RA9 scale (${fmt(m.league.ra9, 'f2')}).</dd>
      <dt>Barrel</dt><dd>Exit velocity ≥ 98 mph with launch angle in a window that starts at 26–30° and widens as EV rises (to 8–50° at 116+ mph).</dd>
      <dt>Hard-Hit %, Sweet-Spot %</dt><dd>Share of batted balls at 95+ mph; share with launch angle 8–32°.</dd>
      <dt>Batted-ball types & Quality of Contact</dt><dd>GB &lt;10°, LD 10–25°, FB 25–50°, PU &gt;50°. Contact buckets: Weak (&lt;60 mph), Topped, Under, Flare/Burner, Solid, Barrel — approximations of Statcast's EV/LA buckets.</dd>
      <dt>Plate discipline zones</dt><dd>Strike zone: ±0.83 ft from plate center, 1.5–3.5 ft high (batter heights aren't in the data). Attack regions: Heart (inner core), Shadow (±~4" around the zone edge, "Edge %"), Chase, Waste.</dd>
      <dt>Gameday zones</dt><dd>Zones 1–9 split the strike zone 3×3; 11–14 are the outside quadrants. All location charts are from the catcher's perspective.</dd>
      <dt>Pitch movement</dt><dd>IVB = induced vertical break (gravity removed); HB = horizontal break, positive toward the 3B side (arm side for a RHP). "vs comp" compares to the same pitch type and hand within the same 2-mph band.</dd>
      <dt>Arm angle (est.)</dt><dd>atan(release height − 4.27 ft, |release side|). TrackMan doesn't record shoulder position, so this uses an average shoulder height; treat it as relative.</dd>
      <dt>Outs Above Expected (team)</dt><dd>Probability each tracked ball in play (excluding HR) becomes an out, from EV/LA. OAE = actual outs − expected outs; errors are non-outs. Without spray direction or fielder positions, credit goes to the team defense, not individual fielders.</dd>
      <dt>Framing (team)</dt><dd>Called-strike probability for each taken pitch from location (0.1 ft bins) and batter side. Strikes above average are credited to the defensive team, ≈0.125 runs per strike.</dd>
      <dt>Percentiles</dt><dd>Vs. qualified players: ${m.qual.b}+ PA for hitters, ${m.qual.p}+ BF for pitchers. Players with at least ${m.qual.show} are placed on the same scale. Red = great, blue = poor, adjusted so lower-is-better stats still show red when good.</dd>
      <dt>Not available in this data</dt><dd>Spray charts and pull/oppo rates, individual fielder OAA, catcher pop time, sprint speed, bat tracking, spin axis/active spin, and pitch tempo.</dd>
    </dl>`;
  });

  route('notfound', app => { app.innerHTML = '<div class="loading">Page not found. <a class="lk" href="#/">Go home</a></div>'; });
})();
