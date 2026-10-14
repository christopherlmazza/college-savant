/* player page */
const Player = (() => {
  const { $, $$, esc, fmt, isN, pname, tname, tlink, plink, ptPill, ptName, ptColor, ptShort, PT_ORDER, renderTable, sec, initials, F } = App;
  const { col, mkCol } = Boards;

  const COUNTING = new Set(['pitches', 'bbe', 'barrels', 'pa', 'ab', 'h', 'hr', 'bb', 'k', 'ev_max', 'g', 'gs', 'bf', 'ipd', 'runs']);
  const one = (el, row, keys, role, lg, extra = []) => {
    if (lg) lg = Object.fromEntries(Object.entries(lg).filter(([k]) => !COUNTING.has(k)));
    const cols = [{ k: 'season', l: 'Season', c: 'l', f: 's' }, ...extra, ...keys.map(k => mkCol(k, role))];
    renderTable(el, { rows: [{ season: '2026', ...row }], cols, footRows: lg ? [{ season: 'League Avg', ...lg }] : null, shade: false });
  };
  const PFMT = { rv_p: 'rv0', rv_fb: 'rv0', rv_br: 'rv0', rv_os: 'rv0', rv: 'rv0', xra9: 'f2', xba: 'r3', xwoba: 'r3', xslg: 'r3', fb_velo: 'f1', ev: 'f1', ev90: 'f1', ev_max: 'f1', chase_pct: 'p', whiff_pct: 'p', k_pct: 'p', bb_pct: 'p', barrel_pct: 'p', hard_pct: 'p', gb_pct: 'p', ext: 'f1', fb_spin: 'f0', cu_spin: 'f0', csw_pct: 'p', fb_ivb: 'f1', sweet_pct: 'p', z_contact_pct: 'p' };

  async function render(app, parts, q) {
    const id = parts[0];
    const [p, m] = await Promise.all([App.player(id), App.meta()]);
    if (!p) { app.innerHTML = `<div class="loading">Player not found.</div>`; return; }
    const roles = [p.pitching ? 'p' : null, p.hitting ? 'b' : null].filter(Boolean);
    // primary role = more volume
    let role = q.role || parts[2];
    if (!roles.includes(role)) role = (p.pitching && p.hitting) ? ((p.pitching.std.bf || 0) >= (p.hitting.std.pa || 0) ? 'p' : 'b') : roles[0];
    const tab = parts[1] || 'statcast';
    const view = q.view || 'overview';
    const R = role === 'p' ? p.pitching : p.hitting;
    const LG = m.league;
    document.title = `${pname(p.name)} Stats: Statcast, Visuals & Advanced Metrics | trackman lab`;

    const posLabel = role === 'p' ? 'P' : 'Batter';
    const hand = p.bats && p.throws ? `Bats/Throws: ${p.bats}/${p.throws}` : (p.throws ? `Throws: ${p.throws}` : `Bats: ${p.bats}`);
    const mini = role === 'p'
      ? `<table class="mini"><tr><th></th><th>G</th><th>GS</th><th>IP</th><th>RA9</th><th>SO</th><th>BB</th><th>WHIP</th><th>xRA9</th></tr><tr><td>2026</td><td>${R.std.g ?? ''}</td><td>${R.std.gs ?? ''}</td><td>${fmt(R.std.ipd, 'ip')}</td><td>${fmt(R.std.ra9, 'f2')}</td><td>${R.std.k ?? 0}</td><td>${R.std.bb ?? 0}</td><td>${fmt(R.std.whip, 'f2')}</td><td>${fmt(R.std.xra9, 'f2')}</td></tr></table>`
      : `<table class="mini"><tr><th></th><th>PA</th><th>AVG</th><th>OBP</th><th>SLG</th><th>HR</th><th>BB</th><th>SO</th><th>xwOBA</th></tr><tr><td>2026</td><td>${R.std.pa}</td><td>${F.r3(R.std.avg)}</td><td>${F.r3(R.std.obp)}</td><td>${F.r3(R.std.slg)}</td><td>${R.std.hr ?? 0}</td><td>${R.std.bb ?? 0}</td><td>${R.std.k ?? 0}</td><td>${F.r3(R.sc.xwoba)}</td></tr></table>`;
    const qualN = role === 'p' ? m.qual.p : m.qual.b, vol = role === 'p' ? R.std.bf : R.std.pa;
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Home</a> › <a href="#/team/${p.team}">${esc(tname(p.team))}</a> › ${esc(pname(p.name))}</div>
      <div class="top3">
        <div class="panel bio">
          <div class="hero"><svg class="pat" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M0 80 Q100 -20 200 80" stroke="#fff" stroke-width="2" fill="none"/><path d="M0 100 Q100 0 200 100" stroke="#fff" stroke-width="1" fill="none"/><circle cx="100" cy="72" r="18" fill="none" stroke="#fff"/></svg></div>
          <div class="av">${esc(initials(p.name))}</div>
          <div class="nm">${esc(pname(p.name))}</div>
          <div class="tm">${posLabel} | ${tlink(p.team)}</div>
          <div class="ln">${hand} &nbsp;|&nbsp; ${role === 'p' ? `${R.std.bf} BF · ${R.std.pitches} pitches` : `${R.std.pa} PA · ${R.disc.pitches} pitches`}</div>
          ${roles.length > 1 ? `<div class="ln"><b>Two-way player</b> — <a class="lk" href="#/player/${id}/${tab}/${role === 'p' ? 'b' : 'p'}">view ${role === 'p' ? 'hitting' : 'pitching'}</a></div>` : ''}
          ${mini}
          <div id="usage"></div>
          <div class="ln" style="margin-top:10px;text-align:left;font-size:13px;line-height:1.7">
            <a class="lk" href="#/compare?ids=${id}">Compare with other players</a> ·
            <a class="lk" href="#/team/${p.team}">Team page</a> ·
            <a class="lk" href="#/leaderboard/${role === 'p' ? 'pitch-arsenal-stats?role=p&team=' + p.team : 'custom?role=b&team=' + p.team}">Team leaderboard</a>
          </div>
        </div>
        <div class="panel"><h4><b>2026</b> College Percentile Rankings<span class="dots"></span></h4><div id="pct"></div></div>
        <div class="panel"><h4 id="rtitle"></h4><div id="rchart"></div></div>
      </div>
      <div class="tabs">${[['statcast', 'Statcast'], ['standard', 'Standard'], ['splits', 'Splits'], ['gamelogs', 'Game Logs']].map(([k, l]) => `<a href="#/player/${id}/${k}/${role}" class="${tab === k ? 'on' : ''}">${l}</a>`).join('')}</div>
      <div class="subtabs">${roles.map(r => `<a href="#/player/${id}/${tab}/${r}" class="${r === role ? 'on' : ''}">${r === 'p' ? 'Pitching' : 'Hitting'}</a>`).join('')}
        ${tab === 'statcast' ? `<span class="sep"></span>${[['overview', 'Overview'], ['breakdowns', 'Breakdowns'], ['zones', 'Zones'], ['rolling', 'Rolling']].map(([k, l]) => `<a href="#/player/${id}/statcast/${role}?view=${k}" class="${view === k ? 'on' : ''}">${l}</a>`).join('')}` : ''}</div>
      <div id="body"></div>`;

    // percentile panel
    const groups = role === 'p'
      ? [['Value', [['rv_p', 'Pitching Run Value'], ['rv_fb', 'Fastball Run Value'], ['rv_br', 'Breaking Run Value'], ['rv_os', 'Offspeed Run Value']]],
         ['Pitching', [['xra9', 'xRA9'], ['xba', 'xBA'], ['fb_velo', 'Fastball Velo'], ['ev', 'Avg Exit Velo'], ['chase_pct', 'Chase %'], ['whiff_pct', 'Whiff %'], ['k_pct', 'K %'], ['bb_pct', 'BB %'], ['barrel_pct', 'Barrel %'], ['hard_pct', 'Hard-Hit %'], ['gb_pct', 'GB %'], ['ext', 'Extension'], ['fb_spin', 'Fastball Spin'], ['cu_spin', 'Curve Spin'], ['fb_ivb', 'Fastball IVB'], ['csw_pct', 'CSW %']]]]
      : [['Value', [['rv', 'Batting Run Value']]],
         ['Batting', [['xwoba', 'xwOBA'], ['xba', 'xBA'], ['xslg', 'xSLG'], ['ev', 'Avg Exit Velocity'], ['ev90', 'EV90'], ['ev_max', 'Max Exit Velocity'], ['barrel_pct', 'Barrel %'], ['hard_pct', 'Hard-Hit %'], ['sweet_pct', 'LA Sweet-Spot %']]],
         ['Plate Discipline', [['chase_pct', 'Chase %'], ['whiff_pct', 'Whiff %'], ['k_pct', 'K %'], ['bb_pct', 'BB %'], ['z_contact_pct', 'Zone Contact %']]]];
    Charts.percentiles($('#pct'), groups, R.pct || {}, R.val || {}, PFMT, { note: vol < qualN ? `Below the ${qualN} ${role === 'p' ? 'BF' : 'PA'} qualifier — percentiles shown vs. qualified players, small sample.` : `Percentiles vs. ${role === 'p' ? 'pitchers with ' + qualN + '+ BF' : 'hitters with ' + qualN + '+ PA'}.` });

    // right chart + usage widget
    if (role === 'p') {
      $('#rtitle').innerHTML = `<b>2026</b> Movement Profile (Induced Break)<span class="dots"></span>`;
      const avg = {}; const ars = R.arsenal.filter(a => a.pitches >= 10);
      ars.forEach(a => { const x = (m.pt_avg[a.pt] || {})[p.throws]; if (x) avg[a.pt] = x; });
      const box = $('#rchart');
      Charts.movement(box, R.mov || [], { avg, armAngle: R.misc.arm_angle, throws: p.throws, uid: 'top' });
      const shown = ars.slice(0, 7);
      box.insertAdjacentHTML('beforeend', `<div class="mv-foot" style="grid-template-columns:70px repeat(${shown.length},1fr)">
        <span></span>${shown.map(a => `<span style="font-size:13px">${ptShort(a.pt)}</span>`).join('')}
        <span></span>${shown.map(a => `<span><span style="display:inline-block;width:34px;height:12px;border-radius:6px;background:${ptColor(a.pt)};border:1px solid rgba(0,0,0,.2)"></span></span>`).join('')}
        <span class="k">USAGE</span>${shown.map(a => `<span>${Math.round(a.usage)}%</span>`).join('')}
        <span class="k">MPH</span>${shown.map(a => `<span>${fmt(a.velo, 'f1')}</span>`).join('')}
        <span class="k i">${p.throws}HP AVG</span>${shown.map(a => `<span style="font-style:italic">${fmt(((m.pt_avg[a.pt] || {})[p.throws] || {}).velo, 'f1')}</span>`).join('')}
      </div>`);
      // usage widget
      const tot = { L: 0, R: 0 }; (R.arsenal_hand || []).forEach(x => tot[x.h] = (tot[x.h] || 0) + x.pitches);
      const uh = (pt, h) => { const x = (R.arsenal_hand || []).find(y => y.pt === pt && y.h === h); return x && tot[h] ? x.pitches / tot[h] * 100 : 0; };
      $('#usage').innerHTML = `<h4 style="margin:14px 0 2px;font-family:var(--cond);font-weight:400;font-size:19px"><b>2026</b> Pitch Usage</h4>
        <div class="use"><span></span><span class="hd">Usage vs. LHH</span><span class="hd" style="grid-column:span 2">Pitch Run Value</span><span class="hd">Usage vs. RHH</span><span></span>
        ${ars.slice(0, 8).map(a => { const l = uh(a.pt, 'L'), r = uh(a.pt, 'R'); const rv = a.rv_p;
          return `<span style="text-align:right">${Math.round(l)}%</span><span class="bl"><span class="bar" style="width:${Math.max(4, l)}%;background:${ptColor(a.pt)}"></span></span>
          <span class="rv ${rv > 0 ? 'pos' : 'neg'}">${F.rv0(rv)}</span><span class="pill" style="background:${ptColor(a.pt)};${App.darkText(a.pt) ? 'color:#222' : ''}">${ptShort(a.pt)}</span>
          <span class="br"><span class="bar" style="width:${Math.max(4, r)}%;background:${ptColor(a.pt)}"></span></span><span>${Math.round(r)}%</span>`; }).join('')}</div>`;
    } else {
      $('#rtitle').innerHTML = `<b>2026</b> Batted Ball Chart<span class="dots"></span>`;
      const box = $('#rchart');
      if (R.bb) { const lg = Charts.evla(box, R.bb); box.insertAdjacentHTML('beforeend', lg); }
      box.insertAdjacentHTML('beforeend', `<div class="mv-foot" style="grid-template-columns:repeat(5,1fr);margin-top:4px">${[['EV', fmt(R.sc.ev, 'f1')], ['Max EV', fmt(R.sc.ev_max, 'f1')], ['LA', fmt(R.sc.la, 'f1') + '°'], ['Barrel%', fmt(R.sc.barrel_pct, 'p')], ['Hard%', fmt(R.sc.hard_pct, 'p')]].map(([a, b]) => `<span><span class="k" style="display:block;text-align:center">${a}</span>${b}</span>`).join('')}</div>`);
      $('#usage').innerHTML = R.top_ev ? `<h4 style="margin:14px 0 4px;font-family:var(--cond);font-weight:400;font-size:19px"><b>Hardest-Hit</b> Balls</h4><table class="mini"><tr><th>Date</th><th>EV</th><th>LA</th><th>Result</th><th>Pitch</th></tr>${R.top_ev.slice(0, 6).map(t => `<tr><td>${t[0].slice(5)}</td><td>${t[1]}</td><td>${t[2]}°</td><td>${t[3]}</td><td style="text-align:left">${App.ptDot(t[4])}${ptShort(t[4])}</td></tr>`).join('')}</table>` : '';
    }

    const body = $('#body');
    if (tab === 'statcast') {
      if (view === 'overview') overview(body, p, role, R, m);
      else if (view === 'zones') zones(body, p, role, R, m);
      else if (view === 'breakdowns') breakdowns(body, p, role, R, m);
      else if (view === 'rolling') rolling(body, p, role, R, m);
    } else if (tab === 'standard') standard(body, p, role, R, m);
    else if (tab === 'splits') splits(body, p, role, R, m);
    else if (tab === 'gamelogs') gamelogs(body, p, role, R, m);
  }

  function overview(body, p, role, R, m) {
    const LG = m.league;
    if (role === 'p') {
      body.innerHTML = `
        ${sec('Statcast Statistics', 'Batted-ball quality and expected stats allowed')}<div id="s1"></div>
        ${sec('Statcast Pitch Arsenal')}<div id="ars" class="charts" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))"></div>
        ${sec('Pitch Tracking', 'Outcomes by pitch type (per PA ending on that pitch)')}<div id="s2"></div>
        ${sec('Batted Ball Profile')}<div id="s3"></div>
        ${sec('Quality of Contact')}<div id="s4"></div>
        ${sec('Pitch Movement', 'Compared to same pitch type & hand within ±1 mph')}<div id="s5"></div>
        ${sec('Run Values by Pitch Type')}<div id="s6"></div>
        ${sec('Statcast Pitching Run Value', 'Run value by attack region — pitcher perspective')}<div class="grid2"><div id="att"></div><div id="s7"></div></div>
        ${sec('Plate Discipline')}<div id="s8"></div>
        ${sec('Percentile Rankings')}<div id="s9"></div>
        ${sec('Release Point & Velocity')}<div class="grid2"><div class="card"><div class="ch"><b>Release Point</b><small>${(R.rel || []).length} pitch sample</small></div><div id="rel"></div></div><div class="card"><div class="ch"><b>Velocity Distribution</b><small>by pitch type</small></div><div id="hist"></div></div></div>
        ${sec('Exit Velocity & Launch Angle Allowed')}<div class="grid2"><div class="card"><div id="evla"></div></div><div id="s10"></div></div>`;
      one($('#s1'), R.sc, ['pitches', 'bbe', 'barrels', 'barrel_pct', 'barrel_pa', 'ev', 'ev_max', 'la', 'sweet_pct', 'xba', 'xslg', 'woba', 'xwoba', 'xwobacon', 'hard_pct', 'k_pct', 'bb_pct', 'ra9', 'xra9'], 'p', { ...LG, ra9: LG.ra9, xra9: LG.ra9 });
      // arsenal cards
      $('#ars').innerHTML = R.arsenal.filter(a => a.pitches >= 10).map(a => `<div class="card" style="text-align:center;padding:8px"><div>${ptPill(a.pt)}</div>
        <div style="font-family:var(--mono);font-size:24px;margin:6px 0 0">${fmt(a.velo, 'f1')}</div><div class="small">MPH (max ${fmt(a.velo_max, 'f1')})</div>
        <div style="font-family:var(--mono);font-size:16px;margin-top:6px">${fmt(a.spin, 'f0')}</div><div class="small">RPM</div>
        <div class="small" style="margin-top:6px">${fmt(a.ivb, 'f1')}" IVB · ${fmt(a.hb, 'f1')}" HB</div><div class="small">${Math.round(a.usage)}% · ${a.pitches} pitches</div></div>`).join('');
      const ar = R.arsenal.map(a => ({ ...a }));
      renderTable($('#s2'), { rows: ar, cols: [{ k: 'pt', l: 'Pitch Type', c: 'l', html: r => ptPill(r.pt) }, ...['pitches', 'n_r', 'n_l', 'usage', 'velo', 'pa', 'ab', 'h', '1B', '2B', '3B', 'hr', 'k', 'bbe', 'avg', 'xba', 'slg', 'xslg', 'woba', 'xwoba', 'ev', 'la', 'spin', 'ext', 'whiff_pct', 'putaway_pct'].map(k => mkCol(k, 'p'))], sort: 'pitches', shade: false });
      one($('#s3'), R.bbp, ['bbe', 'gb_pct', 'air_pct', 'fb_pct', 'ld_pct', 'pu_pct'], 'p', LG);
      one($('#s4'), R.bbp, ['bbe', 'weak_pct', 'topped_pct', 'under_pct', 'flare_pct', 'solid_pct', 'barrel_pct', 'barrel_pa'], 'p', LG);
      renderTable($('#s5'), { rows: ar, cols: [{ k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }, { k: 'hand', l: 'Hand', c: 'l', get: () => p.throws, f: 's' }, ...['pitches', 'velo', 'ivb', 'ivb_comp', 'ivb_vs', 'hb', 'hb_comp', 'hb_vs', 'hb_avg', 'ivb_avg', 'vaa', 'relh', 'rels'].map(k => mkCol(k, 'p'))].map(c => ({ ...c, l: { hb_avg: 'HB Lg Avg', ivb_avg: 'IVB Lg Avg' }[c.k] || c.l })), sort: 'pitches', shade: false });
      renderTable($('#s6'), { rows: ar, cols: [{ k: 'pt', l: 'Pitch Type', c: 'l', html: r => ptPill(r.pt) }, ...['rv100_p', 'rv_p', 'pitches', 'usage', 'pa', 'avg', 'slg', 'woba', 'whiff_pct', 'k_pct', 'putaway_pct', 'xba', 'xslg', 'xwoba', 'hard_pct', 'csw_pct', 'chase_pct'].map(k => mkCol(k, 'p'))], sort: 'pitches', shade: false });
      const attP = Object.fromEntries(Object.entries(R.att || {}).map(([k, v]) => [k, { ...v, rv: isN(v.rv) ? -v.rv : null }]));
      Charts.attackZones($('#att'), attP, 'rv', 'rv');
      renderTable($('#s7'), { rows: ['heart', 'shadow', 'chase', 'waste'].map(k => ({ zone: k[0].toUpperCase() + k.slice(1), ...(attP[k] || {}) })), cols: [{ k: 'zone', l: 'Region', c: 'l', f: 's' }, { k: 'pitches', l: 'Pitches', f: 'i' }, { k: 'swing_pct', l: 'Swing %', f: 'p' }, { k: 'whiff_pct', l: 'Whiff %', f: 'p' }, { k: 'woba', l: 'wOBA', f: 'r3' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }, { k: 'ev', l: 'EV', f: 'f1' }, { k: 'rv', l: 'Runs', f: 'rv' }], shade: false, footRows: [{ zone: 'Total', pitches: R.rv.pitches, rv: R.rv.rv_p }] });
      one($('#s8'), R.disc, ['pitches', 'zone_pct', 'z_swing_pct', 'z_contact_pct', 'chase_pct', 'chase_contact_pct', 'edge_pct', 'fps_pct', 'swing_pct', 'whiff_pct', 'csw_pct', 'meatball_pct', 'meatball_swing_pct'], 'p', LG);
      pctTable($('#s9'), R, m.pct_p);
      if (R.rel) Charts.release($('#rel'), R.rel);
      if (R.mov) Charts.histo($('#hist'), R.mov.map(x => [x[0], x[3]]));
      if (R.bb) $('#evla').insertAdjacentHTML('beforeend', Charts.evla($('#evla'), R.bb));
      renderTable($('#s10'), { rows: [{ k: 'Running game', sb: R.std.sb, cs: R.std.cs, saa: R.rv.called_saa }], cols: [{ k: 'k', l: '', c: 'l', f: 's' }, { k: 'sb', l: 'SB Allowed', f: 'i' }, { k: 'cs', l: 'Caught Stealing', f: 'i' }, { k: 'saa', l: 'Called Strikes +/-', f: 'rv', t: 'Called strikes above expected on his taken pitches (pitcher + catcher)' }], shade: false });
    } else {
      body.innerHTML = `
        ${sec('Statcast Statistics')}<div id="s1"></div>
        ${sec('Pitch Tracking', 'Results by pitch type faced')}<div id="s2"></div>
        ${sec('Batted Ball Profile')}<div id="s3"></div>
        ${sec('Quality of Contact')}<div id="s4"></div>
        ${sec('Run Values by Pitch Type')}<div id="s6"></div>
        ${sec('Statcast Swing/Take Run Value', 'Batter perspective: runs gained by swing decisions in each attack region')}<div class="grid2"><div id="att"></div><div id="s7"></div></div>
        ${sec('Plate Discipline')}<div id="s8"></div>
        ${sec('Percentile Rankings')}<div id="s9"></div>
        ${sec('Hardest-Hit Balls')}<div id="s10"></div>`;
      one($('#s1'), R.sc, ['pitches', 'bbe', 'barrels', 'barrel_pct', 'barrel_pa', 'ev', 'ev_max', 'ev90', 'la', 'sweet_pct', 'xba', 'xslg', 'woba', 'xwoba', 'xwobacon', 'hard_pct', 'k_pct', 'bb_pct'], 'b', LG);
      const vs = R.vs.map(v => ({ ...v }));
      renderTable($('#s2'), { rows: vs, cols: [{ k: 'pt', l: 'Pitch Type', c: 'l', html: r => ptPill(r.pt) }, ...['pitches', 'usage', 'pa', 'ab', 'h', '1B', '2B', '3B', 'hr', 'k', 'bbe', 'avg', 'xba', 'slg', 'xslg', 'woba', 'xwoba', 'ev', 'la', 'whiff_pct', 'putaway_pct'].map(k => mkCol(k, 'b'))], sort: 'pitches', shade: false });
      one($('#s3'), R.bbp, ['bbe', 'gb_pct', 'air_pct', 'fb_pct', 'ld_pct', 'pu_pct'], 'b', LG);
      one($('#s4'), R.bbp, ['bbe', 'weak_pct', 'topped_pct', 'under_pct', 'flare_pct', 'solid_pct', 'barrel_pct', 'barrel_pa'], 'b', LG);
      renderTable($('#s6'), { rows: vs, cols: [{ k: 'pt', l: 'Pitch Type', c: 'l', html: r => ptPill(r.pt) }, ...['rv100', 'rv', 'pitches', 'usage', 'pa', 'avg', 'slg', 'woba', 'whiff_pct', 'k_pct', 'putaway_pct', 'xba', 'xslg', 'xwoba', 'hard_pct', 'chase_pct'].map(k => mkCol(k, 'b'))], sort: 'pitches', shade: false });
      Charts.attackZones($('#att'), R.att || {}, 'rv', 'rv');
      renderTable($('#s7'), { rows: ['heart', 'shadow', 'chase', 'waste'].map(k => ({ zone: k[0].toUpperCase() + k.slice(1), ...((R.att || {})[k] || {}) })), cols: [{ k: 'zone', l: 'Region', c: 'l', f: 's' }, { k: 'pitches', l: 'Pitches', f: 'i' }, { k: 'swing_pct', l: 'Swing %', f: 'p' }, { k: 'whiff_pct', l: 'Whiff %', f: 'p' }, { k: 'woba', l: 'wOBA', f: 'r3' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }, { k: 'ev', l: 'EV', f: 'f1' }, { k: 'hard_pct', l: 'Hard %', f: 'p' }, { k: 'rv', l: 'Runs', f: 'rv' }], shade: false, footRows: [{ zone: 'Total', pitches: R.rv.pitches, rv: R.rv.rv }] });
      one($('#s8'), R.disc, ['pitches', 'zone_pct', 'z_swing_pct', 'z_contact_pct', 'chase_pct', 'chase_contact_pct', 'edge_pct', 'fp_swing_pct', 'swing_pct', 'whiff_pct', 'meatball_pct', 'meatball_swing_pct'], 'b', LG);
      pctTable($('#s9'), R, m.pct_b);
      renderTable($('#s10'), { rows: (R.top_ev || []).map(t => ({ date: t[0], ev: t[1], la: t[2], res: t[3], pt: t[4] })), cols: [{ k: 'date', l: 'Date', c: 'l', f: 's' }, { k: 'ev', l: 'Exit Velo', f: 'f1' }, { k: 'la', l: 'Launch Angle', f: 'f0' }, { k: 'res', l: 'Result', c: 'l', f: 's' }, { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }], sort: 'ev', shade: false });
    }
  }

  function pctTable(el, R, spec) {
    const row = { season: '2026', ...Object.fromEntries(spec.map(([k]) => ['p_' + k, (R.pct || {})[k]])) };
    renderTable(el, { rows: [row], cols: [{ k: 'season', l: 'Season', c: 'l', f: 's' }, ...spec.map(([k, l]) => ({ k: 'p_' + k, l, html: r => isN(r['p_' + k]) ? `<span style="display:inline-block;min-width:30px;text-align:center;border-radius:10px;padding:1px 6px;color:#fff;background:${App.pctColor(r['p_' + k])}">${r['p_' + k]}</span>` : '' }))], shade: false });
  }

  function zones(body, p, role, R, m) {
    const metrics = role === 'p'
      ? [['pitches', 'Pitches', 'i'], ['xwoba', 'xwOBA', 'r3'], ['woba', 'wOBA', 'r3'], ['avg', 'BA', 'r3'], ['swing_pct', 'Swing %', 'p'], ['whiff_pct', 'Whiff %', 'p'], ['csw_pct', 'CSW %', 'p'], ['ev', 'Exit Velo', 'f1'], ['rv', 'Run Value', 'rv']]
      : [['pitches', 'Pitches', 'i'], ['xwoba', 'xwOBA', 'r3'], ['woba', 'wOBA', 'r3'], ['avg', 'BA', 'r3'], ['slg', 'SLG', 'r3'], ['swing_pct', 'Swing %', 'p'], ['whiff_pct', 'Whiff %', 'p'], ['ev', 'Exit Velo', 'f1'], ['rv', 'Run Value', 'rv']];
    body.innerHTML = `${sec('Statcast Zone Charts', "Gameday zones 1–9 inside the strike zone, 11–14 outside. Catcher's perspective.")}
      <div class="ctrls" style="justify-content:center">${metrics.map(([k, l]) => `<a class="btn ghost zm" data-k="${k}" style="display:inline-flex;align-items:center">${l}</a>`).join('')}</div>
      <div class="zones" id="zc"></div>
      ${sec(role === 'p' ? 'Pitch Location Heat Maps' : 'Heat Maps', "Pitch density, catcher's perspective")}<div class="zones" id="hm"></div>`;
    const drawZ = k => {
      const [_, l, f] = metrics.find(x => x[0] === k);
      $$('.zm', body).forEach(a => a.style.background = a.dataset.k === k ? 'var(--teal)' : '', $$('.zm', body).forEach(a => a.style.color = a.dataset.k === k ? '#fff' : ''));
      const zc = $('#zc'); zc.innerHTML = '';
      const lg = m.league;
      const rng = { xwoba: [lg.xwoba - .15, lg.xwoba + .15], woba: [lg.woba - .15, lg.woba + .15], avg: [lg.avg - .12, lg.avg + .12], slg: [lg.slg - .25, lg.slg + .25], swing_pct: [20, 80], whiff_pct: [5, 45], csw_pct: [10, 50], ev: [80, 93], rv: null, pitches: null };
      const goodHigh = role === 'b' ? { xwoba: 1, woba: 1, avg: 1, slg: 1, ev: 1, rv: 1, whiff_pct: -1 } : { xwoba: -1, woba: -1, avg: -1, ev: -1, rv: -1, whiff_pct: 1, csw_pct: 1 };
      const box = document.createElement('div'); box.className = 'zbox'; box.innerHTML = `<b>${l}${role === 'p' ? ' allowed' : ''}</b>`; zc.appendChild(box);
      let lo = null, hi = null; if (rng[k]) [lo, hi] = rng[k];
      if (k === 'rv') { const v = Object.values(R.zones).map(z => Math.abs(z.rv || 0)); const a = Math.max(...v, 1); lo = -a; hi = a; }
      const dir = 1;
      Charts.zoneChart(box, R.zones, k, { fmt: f, label: l, lo: dir > 0 ? lo : hi, hi: dir > 0 ? hi : lo, minN: k === 'pitches' ? 1 : 5,
        colorFn: k === 'pitches' ? (v => { const mx = Math.max(...Object.values(R.zones).map(z => z.pitches)); return App.divColor(v, 0, mx * 1.0); }) : null });
      // per-zone table
      const t = document.createElement('div'); t.className = 'zbox'; t.style.gridColumn = 'span 3'; zc.appendChild(t);
      const rows = Object.entries(R.zones).map(([z, v]) => ({ z: +z, ...v })).sort((a, b) => a.z - b.z);
      renderTable(t, { rows, cols: [{ k: 'z', l: 'Zone', f: 'i' }, ...metrics.map(([kk, ll, ff]) => ({ k: kk, l: ll, f: ff }))], shade: false });
    };
    $$('.zm', body).forEach(a => a.onclick = () => drawZ(a.dataset.k));
    drawZ('xwoba');
    const hm = $('#hm');
    const add = (title, sub, cells) => { const b = document.createElement('div'); b.className = 'card'; b.innerHTML = `<div class="ch"><span><b style="color:inherit">${title}</b><small>${sub}</small></span></div>`; hm.appendChild(b); const d = document.createElement('div'); d.style.padding = '6px'; b.appendChild(d); Charts.heat(d, cells || [], { side: true }); };
    if (role === 'p') {
      R.arsenal.filter(a => a.pitches >= 10).forEach(a => { const tn = document.createElement('div'); add(`<span style="color:${ptColor(a.pt)}">${ptName(a.pt)}</span>`, `${a.pitches} Pitches (${fmt(a.usage, 'p')}%)`, R.heat[a.pt]); });
      add('Whiffs', 'all pitch types', R.heat.whiff);
    } else {
      add('All Pitches Seen', `${R.disc.pitches} pitches`, R.heat.all); add('Swings', `${fmt(R.disc.swing_pct, 'p')}% swing rate`, R.heat.swing); add('Whiffs', `${fmt(R.disc.whiff_pct, 'p')}% whiff rate`, R.heat.whiff); add('Hard-Hit Balls', '95+ mph', R.heat.hard);
    }
  }

  function breakdowns(body, p, role, R, m) {
    if (role === 'p') {
      body.innerHTML = `${sec('Pitch Distribution by Count Situation')}<div class="card" style="padding:10px"><div id="pd"></div><div class="legend" id="pdl"></div></div>
        ${sec('Pitch Usage & Results by Batter Handedness')}<div id="ph"></div>
        ${sec('Run Value by Count')}<div id="rc"></div>`;
      const keys = PT_ORDER.filter(k => R.arsenal.some(a => a.pt === k));
      const situ = ['0-0 count', 'Pitcher ahead', 'Even', 'Batter ahead', '2 strikes'];
      const rows = situ.map(s => ({ label: s, vals: Object.fromEntries((R.usage_count || []).filter(u => u[0] === s).map(u => [u[1], u[2]])) }));
      Charts.stacked($('#pd'), rows, keys);
      $('#pdl').innerHTML = keys.map(k => `<span>${App.ptDot(k)}${ptName(k)}</span>`).join('');
      const tot = { L: 0, R: 0 }; (R.arsenal_hand || []).forEach(x => tot[x.h] += x.pitches);
      renderTable($('#ph'), { rows: (R.arsenal_hand || []).map(x => ({ ...x, use: tot[x.h] ? x.pitches / tot[x.h] * 100 : null, hn: x.h === 'L' ? 'vs LHB' : 'vs RHB' })), cols: [{ k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) }, { k: 'hn', l: 'Batter', c: 'l', f: 's' }, { k: 'pitches', l: 'Pitches', f: 'i' }, { k: 'use', l: 'Usage %', f: 'p' }, { k: 'velo', l: 'MPH', f: 'f1' }, { k: 'whiff_pct', l: 'Whiff %', f: 'p' }, { k: 'woba', l: 'wOBA', f: 'r3' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }], sort: 'pitches', shade: false });
    } else {
      body.innerHTML = `${sec('Results by Pitch Type')}<div class="card" style="padding:10px"><div id="pd"></div><div class="legend" id="pdl"></div></div>${sec('Run Value by Count')}<div id="rc"></div>`;
      const keys = R.vs.map(v => v.pt);
      Charts.stacked($('#pd'), [{ label: 'Pitches seen', vals: Object.fromEntries(R.vs.map(v => [v.pt, v.pitches])) }, { label: 'Hits', vals: Object.fromEntries(R.vs.map(v => [v.pt, v.h || 0])) }, { label: 'Strikeouts', vals: Object.fromEntries(R.vs.map(v => [v.pt, v.k || 0])) }, { label: 'Home Runs', vals: Object.fromEntries(R.vs.map(v => [v.pt, v.hr || 0])) }], keys);
      $('#pdl').innerHTML = keys.map(k => `<span>${App.ptDot(k)}${ptName(k)}</span>`).join('');
    }
    const order = ['0-0', '1-0', '0-1', '2-0', '1-1', '0-2', '3-0', '2-1', '1-2', '3-1', '2-2', '3-2'];
    const sign = role === 'p' ? -1 : 1;
    renderTable($('#rc'), { rows: order.filter(c => R.counts[c]).map(c => ({ c, ...R.counts[c], rv: isN(R.counts[c].rv) ? sign * R.counts[c].rv : null })), cols: [{ k: 'c', l: 'Count', c: 'l', f: 's' }, { k: 'pitches', l: 'Pitches', f: 'i' }, { k: 'pa', l: 'PA ended', f: 'i' }, { k: 'swing_pct', l: 'Swing %', f: 'p' }, { k: 'whiff_pct', l: 'Whiff %', f: 'p' }, { k: 'woba', l: 'wOBA', f: 'r3' }, { k: 'xwoba', l: 'xwOBA', f: 'r3' }, { k: 'rv', l: 'Run Value', f: 'rv', s: 1 }], shade: true });
  }

  function rolling(body, p, role, R, m) {
    const log = R.log || [];
    body.innerHTML = `${sec(role === 'p' ? 'Pitching Rolling Stats Line Charts' : 'Hitting Rolling Stats Line Charts', 'Rolling over the last N games')}
      <div class="ctrls" style="justify-content:center"><span class="small">Window:</span><div class="seg" id="win">${[3, 5, 10].map(n => `<a data-n="${n}" class="${n === 5 ? 'on' : ''}">${n} games</a>`).join('')}</div></div>
      <div class="grid2" id="rl"></div>`;
    const draw = N => {
      const rl = $('#rl'); rl.innerHTML = '';
      const mk = (title, fn, opt) => { const c = document.createElement('div'); c.className = 'card'; c.innerHTML = `<div class="ch"><b>${title}</b></div>`; rl.appendChild(c); const d = document.createElement('div'); c.appendChild(d);
        const pts = log.map((g, i) => { const w = log.slice(Math.max(0, i - N + 1), i + 1); return [i + 1, fn(w), g.date]; });
        Charts.lines(d, [{ pts, color: '#3d8e9b' }], { ...opt, xlabel: 'Game #' }); };
      const sum = (w, k) => w.reduce((s, g) => s + (g[k] || 0), 0);
      const wavg = (w, k, wk) => { const d = sum(w, wk); return d ? w.reduce((s, g) => s + (g[k] || 0) * (g[wk] || 0), 0) / d : null; };
      const lg = m.league;
      if (role === 'p') {
        mk('xwOBA allowed', w => wavg(w, 'xwoba', 'bf'), { ref: lg.xwoba, yfmt: F.r3, ylabel: 'xwOBA' });
        mk('K %', w => sum(w, 'bf') ? sum(w, 'k') / sum(w, 'bf') * 100 : null, { ref: lg.k_pct, yfmt: v => v.toFixed(1), ylabel: 'K%' });
        mk('Whiff %', w => wavg(w, 'whiff_pct', 'pitches'), { ref: lg.whiff_pct, yfmt: v => v.toFixed(1), ylabel: 'Whiff%' });
        mk('Fastball Velocity (per game)', w => w[w.length - 1].fbv ?? null, { yfmt: v => v.toFixed(1), ylabel: 'mph' });
        mk('Max Velocity (per game)', w => w[w.length - 1].velo_max ?? null, { yfmt: v => v.toFixed(1), ylabel: 'mph' });
        mk('Pitches per game', w => w[w.length - 1].pitches ?? null, { yfmt: v => v.toFixed(0), ylabel: 'pitches' });
      } else {
        mk('xwOBA', w => wavg(w, 'xwoba', 'pa'), { ref: lg.xwoba, yfmt: F.r3, ylabel: 'xwOBA' });
        mk('wOBA', w => wavg(w, 'woba', 'pa'), { ref: lg.woba, yfmt: F.r3, ylabel: 'wOBA' });
        mk('Avg Exit Velocity', w => wavg(w, 'ev', 'bbe'), { ref: lg.ev, yfmt: v => v.toFixed(1), ylabel: 'mph' });
        mk('K %', w => sum(w, 'pa') ? sum(w, 'k') / sum(w, 'pa') * 100 : null, { ref: lg.k_pct, yfmt: v => v.toFixed(1), ylabel: 'K%' });
      }
    };
    $$('#win a', body).forEach(a => a.onclick = () => { $$('#win a', body).forEach(x => x.classList.toggle('on', x === a)); draw(+a.dataset.n); });
    draw(5);
  }

  function standard(body, p, role, R, m) {
    if (role === 'p') {
      body.innerHTML = `${sec('Standard Pitching Statistics')}<div id="s1"></div>${sec('By Month')}<div id="s2"></div>`;
      one($('#s1'), R.std, ['g', 'gs', 'ipd', 'bf', 'pitches', 'h', '2B', '3B', 'hr', 'runs', 'bb', 'hbp', 'k', 'ra9', 'xra9', 'fip', 'whip', 'avg', 'obp', 'slg', 'babip', 'k_pct', 'bb_pct', 'kbb_pct'], 'p');
    } else {
      body.innerHTML = `${sec('Standard Batting Statistics')}<div id="s1"></div>${sec('By Month')}<div id="s2"></div>`;
      one($('#s1'), R.std, ['g', 'pa', 'ab', 'h', '1B', '2B', '3B', 'hr', 'bb', 'ibb', 'hbp', 'k', 'sf', 'sh', 'roe', 'avg', 'obp', 'slg', 'ops', 'iso', 'babip', 'k_pct', 'bb_pct'], 'b');
    }
    splitTable($('#s2'), R.splits.month, role, 'Month');
  }
  const MONTHS = { '02': 'February', '03': 'March', '04': 'April', '05': 'May', '06': 'June' };
  function splitTable(el, rows, role, label) {
    const cols = [{ k: 'k', l: label, c: 'l', get: r => MONTHS[r.k] || r.k, f: 's' }, ...['pa', 'ab', 'h', 'hr', 'bb', 'k', 'avg', 'obp', 'slg', 'woba', 'xwoba', 'xba', 'xslg', 'k_pct', 'bb_pct', 'ev', 'la', 'barrel_pct', 'hard_pct', 'whiff_pct', 'chase_pct', 'csw_pct', 'gb_pct', 'pitches'].map(k => mkCol(k, role))];
    renderTable(el, { rows: rows || [], cols, shade: false });
  }
  function splits(body, p, role, R, m) {
    const S = R.splits;
    const hl = role === 'p' ? 'Platoon Splits (vs. batter side)' : 'Platoon Splits (vs. pitcher hand)';
    body.innerHTML = `${sec(hl)}<div id="a"></div>${sec('Count Splits')}<div id="b"></div>${role === 'p' ? sec('Times Through the Order') + '<div id="c"></div>' : ''}${sec('Inning Splits')}<div id="d"></div>${sec('Monthly Splits')}<div id="e"></div>`;
    splitTable($('#a'), (S.hand || []).map(r => ({ ...r, k: (role === 'p' ? 'vs ' : 'vs ') + (r.k === 'L' ? 'LH' : 'RH') + (role === 'p' ? 'B' : 'P') })), role, 'Split');
    splitTable($('#b'), S.count, role, 'Count');
    if (role === 'p') splitTable($('#c'), S.tto, role, 'TTO');
    splitTable($('#d'), S.inning, role, 'Innings');
    splitTable($('#e'), S.month, role, 'Month');
  }
  function gamelogs(body, p, role, R, m) {
    body.innerHTML = `${sec('Game Logs')}<div id="g"></div>`;
    const opp = r => { const home = r.home === p.team; return (home ? 'vs ' : '@ ') + App.tname(home ? r.away : r.home); };
    const base = [{ k: 'date', l: 'Date', c: 'l', html: r => `<a class="lk" href="#/game/${r.date}/${r.sid}">${r.date.slice(5)}</a>` }, { k: 'opp', l: 'Opponent', c: 'tm', get: opp, f: 's' }];
    const keys = role === 'p' ? ['bf', 'ipd', 'pitches', 'h', 'hr', 'runs', 'bb', 'k', 'whiff_pct', 'csw_pct', 'woba', 'xwoba', 'ev', 'fbv', 'velo_max', 'rv'] : ['pa', 'ab', 'h', '2B', '3B', 'hr', 'bb', 'k', 'pitches', 'bbe', 'ev', 'ev_max', 'la', 'barrels', 'woba', 'xwoba', 'rv'];
    const cols = [...base, ...keys.map(k => k === 'fbv' ? { k, l: 'FB Velo', f: 'f1' } : (k === 'rv' ? { k, l: 'Run Value', f: 'rv', get: r => role === 'p' ? -r.rv : r.rv, s: 1 } : mkCol(k, role)))];
    const tot = role === 'p' ? { date: 'Total', ...R.std, ...R.sc, whiff_pct: R.disc.whiff_pct, csw_pct: R.disc.csw_pct, rv: -R.rv.rv_p } : { date: 'Total', ...R.std, ...R.sc, rv: R.rv.rv };
    renderTable($('#g'), { rows: (R.log || []).slice().reverse(), cols, footRows: [tot], shade: true, refRows: R.log || [] });
    $('#g tr.tot td').innerHTML = 'Total';
  }

  return { render };
})();
App.route('player', Player.render);
