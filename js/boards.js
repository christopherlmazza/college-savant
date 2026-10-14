/* leaderboards */
const Boards = (() => {
  const { $, $$, esc, fmt, isN, plink, tlink, pname, tname, ptPill, ptName, PT_ORDER, renderTable, csv, sec, setQuery, pctColor } = App;

  // catalog: key -> [label, fmt, hitterDir, pitcherDir, tooltip]
  const C = {
    g: ['G', 'i'], gs: ['GS', 'i'], pa: ['PA', 'i'], bf: ['BF', 'i'], ab: ['AB', 'i'], h: ['H', 'i'], '1B': ['1B', 'i'], '2B': ['2B', 'i'], '3B': ['3B', 'i'], hr: ['HR', 'i', 1, -1],
    bb: ['BB', 'i'], ibb: ['IBB', 'i'], hbp: ['HBP', 'i'], k: ['SO', 'i'], sf: ['SF', 'i'], sh: ['SH', 'i'], roe: ['ROE', 'i'], runs: ['R', 'i'], ipd: ['IP', 'ip'], pitches: ['Pitches', 'i'],
    avg: ['AVG', 'r3', 1, -1], obp: ['OBP', 'r3', 1, -1], slg: ['SLG', 'r3', 1, -1], ops: ['OPS', 'r3', 1, -1], iso: ['ISO', 'r3', 1, -1], babip: ['BABIP', 'r3'],
    woba: ['wOBA', 'r3', 1, -1], xwoba: ['xwOBA', 'r3', 1, -1, 'Expected wOBA from exit velocity & launch angle'], xba: ['xBA', 'r3', 1, -1], xslg: ['xSLG', 'r3', 1, -1],
    xwobacon: ['xwOBAcon', 'r3', 1, -1], wobacon: ['wOBAcon', 'r3', 1, -1],
    k_pct: ['K %', 'p', -1, 1], bb_pct: ['BB %', 'p', 1, -1], kbb_pct: ['K-BB %', 'p', -1, 1],
    bbe: ['BBE', 'i'], ev: ['Avg EV (MPH)', 'f1', 1, -1], ev_max: ['Max EV', 'f1', 1, -1], ev90: ['EV90', 'f1', 1, -1, '90th percentile exit velocity'], la: ['LA (°)', 'f1'],
    barrels: ['Barrels', 'i', 1, -1], barrel_pct: ['Barrel %', 'p', 1, -1], barrel_pa: ['Brl/PA', 'p', 1, -1], hard_pct: ['Hard Hit %', 'p', 1, -1, 'Batted balls 95+ mph'], sweet_pct: ['LA Sweet-Spot %', 'p', 1, -1, 'Launch angle 8-32°'],
    gb_pct: ['GB %', 'p', 0, 1], ld_pct: ['LD %', 'p', 1, -1], fb_pct: ['FB %', 'p'], pu_pct: ['PU %', 'p', -1, 1], air_pct: ['AIR %', 'p'],
    weak_pct: ['Weak %', 'p'], topped_pct: ['Topped %', 'p'], under_pct: ['Under %', 'p'], flare_pct: ['Flare/Burner %', 'p', 1, -1], solid_pct: ['Solid %', 'p', 1, -1],
    zone_pct: ['Zone %', 'p', 0, 1], swing_pct: ['Swing %', 'p'], z_swing_pct: ['Z-Swing %', 'p'], z_contact_pct: ['Z-Contact %', 'p', 1, -1], chase_pct: ['Chase %', 'p', -1, 1],
    chase_contact_pct: ['O-Contact %', 'p', 1, -1], contact_pct: ['Contact %', 'p', 1, -1], whiff_pct: ['Whiff %', 'p', -1, 1], swstr_pct: ['SwStr %', 'p', -1, 1], csw_pct: ['CSW %', 'p', -1, 1],
    cstr_pct: ['Called Str %', 'p', -1, 1], strike_pct: ['Strike %', 'p', 0, 1], edge_pct: ['Edge %', 'p', 0, 1], fps_pct: ['F-Strike %', 'p', 0, 1], fp_swing_pct: ['1st Pitch Swing %', 'p'],
    meatball_pct: ['Meatball %', 'p', 0, -1], meatball_swing_pct: ['Meatball Swing %', 'p', 1, 0], putaway_pct: ['PutAway %', 'p', -1, 1],
    heart_swing_pct: ['Heart Swing %', 'p', 1, 0], shadow_swing_pct: ['Shadow Swing %', 'p'], chase_swing_pct: ['Chase-zone Swing %', 'p', -1, 1], waste_swing_pct: ['Waste Swing %', 'p', -1, 1],
    heart_rv: ['Heart RV', 'rv', 1, 1], shadow_rv: ['Shadow RV', 'rv', 1, 1], chase_rv: ['Chase RV', 'rv', 1, 1], waste_rv: ['Waste RV', 'rv', 1, 1],
    rv: ['Run Value', 'rv', 1, 1], rv100: ['RV/100', 'rv2', 1, 1], rv_p: ['Run Value', 'rv', 1, 1], rv100_p: ['RV/100', 'rv2', 1, 1],
    rv_fb: ['Fastball RV', 'rv', 1, 1], rv_br: ['Breaking RV', 'rv', 1, 1], rv_os: ['Offspeed RV', 'rv', 1, 1],
    ra9: ['RA9', 'f2', 0, -1, 'Runs allowed per 9 (earned/unearned not tracked)'], xra9: ['xRA9', 'f2', 0, -1, 'Expected RA9 from xwOBA allowed'], fip: ['FIP', 'f2', 0, -1, 'Fielding-independent pitching, RA9 scale'], whip: ['WHIP', 'f2', 0, -1],
    fb_velo: ['FB Velo', 'f1', 0, 1, 'Avg 4-seam/sinker velocity'], velo_max: ['Max Velo', 'f1', 0, 1], fb_spin: ['FB Spin', 'f0', 0, 1], fb_ivb: ['FB IVB', 'f1', 0, 1], cu_spin: ['CU Spin', 'f0', 0, 1],
    ext: ['Extension (ft)', 'f1', 0, 1], relh: ['Rel Height', 'f2'], rels: ['Rel Side', 'f2'], arm_angle: ['Arm Angle (est.)', 'f0'], vaa: ['VAA', 'f1'],
    sb: ['SB', 'i'], cs: ['CS', 'i'], called_saa: ['Called Str +/-', 'rv', 1, 1, 'Called strikes above expected on taken pitches (location model)'],
    // arsenal
    usage: ['Usage %', 'p'], use_r: ['% vs RHB', 'p'], use_l: ['% vs LHB', 'p'], n_r: ['# RHB', 'i'], n_l: ['# LHB', 'i'], velo: ['MPH', 'f1', 0, 1], spin: ['Spin', 'f0', 0, 1],
    hb: ['HB (in)', 'f1'], ivb: ['IVB (in)', 'f1'], hb_comp: ['HB comp', 'f1'], ivb_comp: ['IVB comp', 'f1'], hb_vs: ['HB vs comp', 'rv'], ivb_vs: ['IVB vs comp', 'rv'],
  };
  const col = (k, role, extra = {}) => {
    const c = C[k] || [k, 'f1'];
    const dir = role === 'p' ? c[3] : c[2];
    return { k, l: c[0], f: c[1], s: dir || 0, t: c[4], ...extra };
  };
  const nameCol = { k: 'name', l: 'Player', c: 'nm', html: r => plink(r.id, r.name) };
  const teamCol = { k: 'team', l: 'Team', c: 'tm', html: r => tlink(r.team), get: r => App.tname(r.team) };
  const ptCol = { k: 'pt', l: 'Pitch', c: 'l', html: r => ptPill(r.pt) };

  // board definitions
  const B = [
    { id: 'custom', group: 'Batting & Pitching', title: 'Custom Leaderboard', desc: 'Build your own table: choose any combination of the 90+ metrics below. Click any column to sort, any row to open the player page.', roles: true, cols: { b: ['pa', 'xwoba', 'xba', 'xslg', 'ev', 'barrel_pct', 'hard_pct', 'k_pct', 'bb_pct', 'whiff_pct', 'chase_pct', 'rv'], p: ['bf', 'ipd', 'xra9', 'xwoba', 'fb_velo', 'k_pct', 'bb_pct', 'whiff_pct', 'csw_pct', 'chase_pct', 'barrel_pct', 'rv_p'] }, sort: { b: 'xwoba', p: 'rv_p' }, picker: true },
    { id: 'percentile', group: 'Batting & Pitching', title: 'Percentile Rankings', desc: 'Each player\'s percentile vs. qualified players. Red = great, blue = poor, regardless of whether a high or low raw number is better.', roles: true, pct: true },
    { id: 'expected', group: 'Batting & Pitching', title: 'Expected Statistics', desc: 'Expected outcomes are calculated from each batted ball\'s exit velocity and launch angle (league outcome rates of similar balls), with strikeouts, walks and HBP counted as they happened.', roles: true,
      cols: { b: ['pa', 'bbe', 'avg', 'xba', 'd_ba', 'slg', 'xslg', 'd_slg', 'woba', 'xwoba', 'd_woba'], p: ['bf', 'bbe', 'avg', 'xba', 'd_ba', 'slg', 'xslg', 'd_slg', 'woba', 'xwoba', 'd_woba', 'ra9', 'xra9', 'd_ra9'] }, sort: { b: 'xwoba', p: 'xwoba' }, dir: { p: 1 } },
    { id: 'exit-velocity', group: 'Batting & Pitching', title: 'Exit Velocity & Barrels', desc: 'Barrels are batted balls with the exit velocity / launch angle combination that historically produces the best outcomes (98+ mph with a launch-angle window that widens as EV rises).', roles: true,
      cols: { b: ['bbe', 'la', 'sweet_pct', 'ev_max', 'ev', 'ev90', 'barrels', 'barrel_pct', 'barrel_pa', 'hard_pct'], p: ['bbe', 'la', 'sweet_pct', 'ev_max', 'ev', 'barrels', 'barrel_pct', 'barrel_pa', 'hard_pct'] }, sort: { b: 'ev', p: 'ev' }, dir: { p: 1 } },
    { id: 'batted-ball', group: 'Batting & Pitching', title: 'Batted Ball Profile', desc: 'Batted ball types by launch angle: GB < 10°, LD 10-25°, FB 25-50°, PU > 50°. Quality of contact buckets use exit velocity and launch angle. Spray direction isn\'t in this export, so Pull/Oppo are not available.', roles: true,
      cols: { b: ['bbe', 'gb_pct', 'air_pct', 'ld_pct', 'fb_pct', 'pu_pct', 'weak_pct', 'topped_pct', 'under_pct', 'flare_pct', 'solid_pct', 'barrel_pct'], p: ['bbe', 'gb_pct', 'air_pct', 'ld_pct', 'fb_pct', 'pu_pct', 'weak_pct', 'topped_pct', 'under_pct', 'flare_pct', 'solid_pct', 'barrel_pct'] }, sort: { b: 'ld_pct', p: 'gb_pct' } },
    { id: 'plate-discipline', group: 'Batting & Pitching', title: 'Plate Discipline', desc: 'Zone is a standard 17" plate (+ ball) from 1.5 to 3.5 ft. Chase % = swings at pitches outside the zone. Edge = shadow zone; Meatball = heart of the zone.', roles: true,
      cols: { b: ['pitches', 'zone_pct', 'z_swing_pct', 'z_contact_pct', 'chase_pct', 'chase_contact_pct', 'edge_pct', 'fp_swing_pct', 'swing_pct', 'whiff_pct', 'swstr_pct', 'meatball_pct', 'meatball_swing_pct'], p: ['pitches', 'zone_pct', 'z_swing_pct', 'z_contact_pct', 'chase_pct', 'chase_contact_pct', 'edge_pct', 'fps_pct', 'swing_pct', 'whiff_pct', 'swstr_pct', 'csw_pct', 'meatball_pct', 'putaway_pct'] }, sort: { b: 'chase_pct', p: 'whiff_pct' }, dir: { b: 1 } },
    { id: 'swing-take', group: 'Batting & Pitching', title: 'Swing / Take', desc: 'Run value by attack region (Heart, Shadow, Chase, Waste) — what a hitter gained or lost by swinging or taking in each part of the zone. Pitcher values are from the pitcher\'s perspective.', roles: true,
      cols: { b: ['pitches', 'heart_swing_pct', 'heart_rv', 'shadow_swing_pct', 'shadow_rv', 'chase_swing_pct', 'chase_rv', 'waste_swing_pct', 'waste_rv', 'rv'], p: ['pitches', 'heart_swing_pct', 'p_heart_rv', 'shadow_swing_pct', 'p_shadow_rv', 'chase_swing_pct', 'p_chase_rv', 'waste_swing_pct', 'p_waste_rv', 'rv_p'] }, sort: { b: 'rv', p: 'rv_p' } },
    { id: 'run-value', group: 'Batting & Pitching', title: 'Run Value', desc: 'Run value credits every pitch with the change in run expectancy based on the count before and after it (and the event value when the plate appearance ends). Positive is good for the player shown.', roles: true,
      cols: { b: ['pa', 'pitches', 'rv', 'rv100', 'rv_fb', 'rv_br', 'rv_os', 'woba', 'xwoba', 'k_pct', 'whiff_pct'], p: ['bf', 'pitches', 'rv_p', 'rv100_p', 'rv_fb', 'rv_br', 'rv_os', 'woba', 'xwoba', 'k_pct', 'whiff_pct'] }, sort: { b: 'rv', p: 'rv_p' } },
    { id: 'standard', group: 'Batting & Pitching', title: 'Standard Stats', desc: 'Traditional counting stats from tracked games. Runs allowed are all runs (earned vs unearned isn\'t in the data), so pitchers show RA9.', roles: true,
      cols: { b: ['g', 'pa', 'ab', 'h', '1B', '2B', '3B', 'hr', 'bb', 'hbp', 'k', 'sf', 'sh', 'roe', 'avg', 'obp', 'slg', 'ops', 'iso', 'babip', 'woba'], p: ['g', 'gs', 'ipd', 'bf', 'h', '2B', '3B', 'hr', 'runs', 'bb', 'hbp', 'k', 'ra9', 'fip', 'whip', 'avg', 'obp', 'slg', 'babip', 'k_pct', 'bb_pct', 'kbb_pct'] }, sort: { b: 'ops', p: 'ipd' } },
    { id: 'pitch-arsenal-stats', group: 'Pitch Tracking', title: 'Pitch Arsenal Stats', desc: 'Outcomes split by pitch type, for pitchers (as thrown) or batters (as faced). Run Value and Whiff % are per pitch; all other stats are per plate appearance ending on that pitch type.', roles: true, src: { p: 'arsenal', b: 'batter_types' },
      cols: { b: ['pt', 'pitches', 'usage', 'pa', 'ab', 'h', 'hr', 'k', 'avg', 'xba', 'slg', 'xslg', 'woba', 'xwoba', 'ev', 'la', 'whiff_pct', 'k_pct', 'putaway_pct', 'hard_pct', 'rv', 'rv100'], p: ['pt', 'pitches', 'usage', 'pa', 'ab', 'h', 'hr', 'k', 'avg', 'xba', 'slg', 'xslg', 'woba', 'xwoba', 'ev', 'la', 'whiff_pct', 'k_pct', 'putaway_pct', 'hard_pct', 'rv_p', 'rv100_p'] }, sort: { b: 'rv', p: 'rv_p' }, minDefault: { p: 100, b: 75 }, minLabel: 'Min Pitches', minKey: 'pitches', ptFilter: true },
    { id: 'pitch-arsenals', group: 'Pitch Tracking', title: 'Pitch Arsenals', desc: 'Each pitcher\'s full arsenal on one row. Pick a metric to show for every pitch type.', arsenals: true },
    { id: 'pitch-movement', group: 'Pitch Tracking', title: 'Pitch Movement', desc: 'Induced vertical break (gravity removed) and horizontal break, compared to pitchers with the same pitch type and handedness thrown within ±1 mph. Positive HB = toward the 3B side (arm side for RHP).', src: { p: 'arsenal' }, rolesFixed: 'p',
      cols: { p: ['pt', 'pitches', 'usage', 'velo', 'ivb', 'ivb_comp', 'ivb_vs', 'hb', 'hb_comp', 'hb_vs', 'spin', 'vaa', 'whiff_pct', 'rv100_p'] }, sort: { p: 'ivb_vs' }, minDefault: { p: 100 }, minLabel: 'Min Pitches', minKey: 'pitches', ptFilter: true, ptDefault: 'FF' },
    { id: 'spin', group: 'Pitch Tracking', title: 'Spin Rate', desc: 'Average spin rate by pitch type. "Bauer Units" = spin ÷ velocity.', src: { p: 'arsenal' }, rolesFixed: 'p',
      cols: { p: ['pt', 'pitches', 'velo', 'spin', 'bu', 'ivb', 'hb', 'whiff_pct', 'rv100_p'] }, sort: { p: 'spin' }, minDefault: { p: 100 }, minLabel: 'Min Pitches', minKey: 'pitches', ptFilter: true },
    { id: 'velocity', group: 'Pitch Tracking', title: 'Velocity', desc: 'Average and max velocity by pitch type.', src: { p: 'arsenal' }, rolesFixed: 'p',
      cols: { p: ['pt', 'pitches', 'usage', 'velo', 'velo_max', 'ext', 'est_pv', 'whiff_pct', 'xwoba', 'rv100_p'] }, sort: { p: 'velo' }, minDefault: { p: 75 }, minLabel: 'Min Pitches', minKey: 'pitches', ptFilter: true, ptDefault: 'FF' },
    { id: 'release', group: 'Pitch Tracking', title: 'Release, Extension & Arm Angle', desc: 'Release point and extension averaged over all pitches. Arm angle is estimated from release height and side assuming an average shoulder height (TrackMan doesn\'t record body landmarks).', rolesFixed: 'p',
      cols: { p: ['throws', 'pitches', 'fb_velo', 'ext', 'relh', 'rels', 'arm_angle', 'vaa', 'fb_ivb', 'whiff_pct'] }, sort: { p: 'ext' } },
    { id: 'team-defense', group: 'Fielding & Running', title: 'Team Outs Above Expected', desc: 'For every tracked ball in play (no HR), the chance it becomes an out is estimated from its exit velocity and launch angle. Outs Above Expected = actual outs − expected outs; Fielding Run Value ≈ OAE × 0.78. Errors count as non-outs.', team: 'defense' },
    { id: 'framing', group: 'Fielding & Running', title: 'Team Catcher Framing', desc: 'Called-strike probability for every taken pitch, by location and batter side. Strikes Above Average = called strikes − expected. Catcher IDs aren\'t in this export, so framing is credited to the defensive team (catchers + pitchers). Runs ≈ 0.125 per strike.', team: 'framing' },
    { id: 'running-game', group: 'Fielding & Running', title: 'Running Game', desc: 'Stolen bases and caught stealing on tracked pitches, by pitcher (allowed) and by team (offense and defense).', running: true },
    { id: 'team-batting', group: 'Teams', title: 'Team Batting', desc: 'Team offense on tracked pitches.', team: 'batting' },
    { id: 'team-pitching', group: 'Teams', title: 'Team Pitching', desc: 'Team pitching staffs on tracked pitches.', team: 'pitching' },
  ];
  window.BOARDS = B;

  // derived columns
  const DER = {
    d_ba: { l: 'BA − xBA', f: 'r3', get: r => isN(r.avg) && isN(r.xba) ? r.avg - r.xba : null },
    d_slg: { l: 'SLG − xSLG', f: 'r3', get: r => isN(r.slg) && isN(r.xslg) ? r.slg - r.xslg : null },
    d_woba: { l: 'wOBA − xwOBA', f: 'r3', get: r => isN(r.woba) && isN(r.xwoba) ? r.woba - r.xwoba : null },
    d_ra9: { l: 'RA9 − xRA9', f: 'f2', get: r => isN(r.ra9) && isN(r.xra9) ? r.ra9 - r.xra9 : null },
    p_heart_rv: { l: 'Heart RV', f: 'rv', s: 1, get: r => isN(r.heart_rv) ? -r.heart_rv : null },
    p_shadow_rv: { l: 'Shadow RV', f: 'rv', s: 1, get: r => isN(r.shadow_rv) ? -r.shadow_rv : null },
    p_chase_rv: { l: 'Chase RV', f: 'rv', s: 1, get: r => isN(r.chase_rv) ? -r.chase_rv : null },
    p_waste_rv: { l: 'Waste RV', f: 'rv', s: 1, get: r => isN(r.waste_rv) ? -r.waste_rv : null },
    bu: { l: 'Bauer Units', f: 'f1', s: 1, get: r => isN(r.spin) && r.velo ? r.spin / r.velo : null },
    est_pv: { l: 'Est. Perceived Velo', f: 'f1', s: 1, t: 'Velocity adjusted for extension: +~1.7 mph per foot above league avg', get: r => isN(r.velo) && isN(r.ext) ? r.velo + 1.7 * (r.ext - 5.82) : null },
  };
  function mkCol(k, role) {
    if (k === 'pt') return ptCol;
    if (k === 'throws') return { k: 'throws', l: 'Throws', c: 'l', f: 's' };
    if (DER[k]) return { k, ...DER[k] };
    return col(k, role);
  }

  // custom picker groups
  const PICK = {
    'Standard': ['g', 'gs', 'pa', 'bf', 'ab', 'ipd', 'h', '1B', '2B', '3B', 'hr', 'runs', 'bb', 'ibb', 'hbp', 'k', 'sf', 'sh', 'roe', 'avg', 'obp', 'slg', 'ops', 'iso', 'babip', 'ra9', 'fip', 'whip', 'k_pct', 'bb_pct', 'kbb_pct'],
    'Expected': ['woba', 'xwoba', 'xba', 'xslg', 'xwobacon', 'wobacon', 'xra9'],
    'Batted Ball': ['bbe', 'ev', 'ev_max', 'ev90', 'la', 'barrels', 'barrel_pct', 'barrel_pa', 'hard_pct', 'sweet_pct', 'gb_pct', 'ld_pct', 'fb_pct', 'pu_pct', 'air_pct', 'weak_pct', 'topped_pct', 'under_pct', 'flare_pct', 'solid_pct'],
    'Plate Discipline': ['pitches', 'zone_pct', 'swing_pct', 'z_swing_pct', 'z_contact_pct', 'chase_pct', 'chase_contact_pct', 'contact_pct', 'whiff_pct', 'swstr_pct', 'csw_pct', 'cstr_pct', 'strike_pct', 'edge_pct', 'fps_pct', 'fp_swing_pct', 'meatball_pct', 'meatball_swing_pct', 'putaway_pct'],
    'Run Value': ['rv', 'rv100', 'rv_p', 'rv100_p', 'rv_fb', 'rv_br', 'rv_os', 'heart_rv', 'shadow_rv', 'chase_rv', 'waste_rv', 'called_saa'],
    'Pitch Characteristics': ['fb_velo', 'velo_max', 'fb_spin', 'fb_ivb', 'cu_spin', 'ext', 'relh', 'rels', 'arm_angle', 'vaa'],
    'Running': ['sb', 'cs'],
  };
  const P_ONLY = new Set(['gs', 'bf', 'ipd', 'runs', 'ra9', 'fip', 'whip', 'xra9', 'kbb_pct', 'rv_p', 'rv100_p', 'csw_pct', 'cstr_pct', 'strike_pct', 'fps_pct', 'putaway_pct', 'fb_velo', 'velo_max', 'fb_spin', 'fb_ivb', 'cu_spin', 'ext', 'relh', 'rels', 'arm_angle', 'vaa', 'cs', 'sb']);
  const B_ONLY = new Set(['pa', 'ab', '1B', 'sf', 'sh', 'roe', 'ops', 'iso', 'wobacon', 'ev90', 'air_pct', 'fp_swing_pct', 'meatball_swing_pct', 'rv', 'rv100']);

  async function render(app, parts, q) {
    const id = parts[0] || 'custom';
    const b = B.find(x => x.id === id);
    if (!b) { app.innerHTML = '<div class="loading">Unknown leaderboard</div>'; return; }
    if (b.team) return teamBoard(app, b, q);
    if (b.arsenals) return arsenalsBoard(app, b, q);
    if (b.running) return runningBoard(app, b, q);
    const m = await App.meta();
    let role = b.rolesFixed || (q.role === 'b' || q.role === 'batters' ? 'b' : (q.role === 'p' || q.role === 'pitchers' ? 'p' : (b.id === 'percentile' ? 'b' : 'b')));
    if (!b.rolesFixed && !q.role) role = (b.id === 'pitch-arsenal-stats' ? 'p' : 'b');
    const srcName = b.src ? b.src[role] : (role === 'p' ? 'pitchers' : 'hitters');
    const data = await App.table(srcName);
    const isArs = srcName === 'arsenal' || srcName === 'batter_types';
    const qual = role === 'p' ? m.qual.p : m.qual.b;
    const volKey = isArs ? 'pitches' : (role === 'p' ? 'bf' : 'pa');
    const minDef = b.minDefault ? b.minDefault[role] : qual;
    const st = { team: q.team || '', hand: q.hand || '', min: q.min !== undefined ? +q.min : minDef, name: q.name || '', pt: q.pt || b.ptDefault || '', cols: q.cols ? q.cols.split(',') : null };
    let colKeys = st.cols || (b.cols ? b.cols[role] : null);
    const teams = [...new Set(data.map(r => r.team))].sort((a, c) => App.tname(a).localeCompare(App.tname(c)));
    const handKey = role === 'p' ? 'throws' : 'bats';
    app.innerHTML = `
      <h1 class="pg"><span class="stc">STATCAST</span><span class="bar"></span>${b.title}${/Leaderboard$/.test(b.title) ? "" : " Leaderboard"}</h1>
      <div class="note">${b.desc}<br><b>Qualifier:</b> ${isArs ? 'minimum pitches of that type (adjust below)' : `${qual} ${role === 'p' ? 'batters faced' : 'plate appearances'} for percentiles & shading; table shows players above the minimum you set`}.</div>
      <div class="ctrls">
        ${b.rolesFixed ? '' : `<div class="seg" id="role"><a data-r="b" class="${role === 'b' ? 'on' : ''}">${isArs || b.src ? 'Batters' : 'Batters'}</a><a data-r="p" class="${role === 'p' ? 'on' : ''}">Pitchers</a></div>`}
        ${b.ptFilter ? `<select id="pt"><option value="">All Pitch Types</option>${PT_ORDER.map(p => `<option value="${p}" ${st.pt === p ? 'selected' : ''}>${ptName(p)}</option>`).join('')}</select>` : ''}
        <select id="team"><option value="">All Teams</option>${teams.map(t => `<option value="${t}" ${st.team === t ? 'selected' : ''}>${esc(App.tname(t))}</option>`).join('')}</select>
        ${isArs ? '' : `<select id="hand"><option value="">${role === 'p' ? 'Throws: All' : 'Bats: All'}</option><option value="R" ${st.hand === 'R' ? 'selected' : ''}>R</option><option value="L" ${st.hand === 'L' ? 'selected' : ''}>L</option>${role === 'b' ? `<option value="S" ${st.hand === 'S' ? 'selected' : ''}>S</option>` : ''}</select>`}
        <input id="min" type="number" min="0" step="5" value="${st.min}" title="${b.minLabel || (role === 'p' ? 'Min BF' : 'Min PA')}" style="width:110px" placeholder="${b.minLabel || 'Min'}">
        <span class="small">${b.minLabel || (role === 'p' ? 'Min BF' : 'Min PA')}</span>
        <input id="nm" type="search" placeholder="Filter by name" value="${esc(st.name)}" style="width:170px">
        ${b.picker ? '<button class="btn ghost" id="pick">Choose Columns</button>' : ''}
        <button class="btn" id="dl">Download CSV</button>
      </div>
      <div id="picker" hidden></div>
      <div id="tbl"></div>`;
    const refRows = data.filter(r => (r[volKey] || 0) >= (isArs ? minDef : qual));
    let tbl;
    const build = () => {
      let rows = data.filter(r => (r[volKey] || 0) >= st.min);
      if (st.team) rows = rows.filter(r => r.team === st.team);
      if (st.hand && !isArs) rows = rows.filter(r => r[handKey] === st.hand);
      if (st.pt) rows = rows.filter(r => r.pt === st.pt);
      if (st.name) { const t = st.name.toLowerCase(); rows = rows.filter(r => (pname(r.name) + ' ' + r.name).toLowerCase().includes(t)); }
      let cols;
      if (b.pct) {
        const spec = role === 'p' ? m.pct_p : m.pct_b;
        cols = [nameCol, teamCol, mkCol(volKey, role), ...spec.map(([k, l]) => ({ k: 'p_' + k, l, f: 'i', html: r => { const p = r['p_' + k]; return isN(p) ? `<span style="display:inline-block;min-width:30px;text-align:center;border-radius:10px;padding:1px 6px;color:#fff;background:${pctColor(p)}">${p}</span>` : ''; } }))];
      } else {
        const base = [nameCol, teamCol];
        if (!isArs && !colKeys.includes(volKey) && b.id !== 'release') base.push(mkCol(volKey, role));
        cols = [...base, ...colKeys.filter(k => !(role === 'p' ? B_ONLY : P_ONLY).has(k) || !b.picker).map(k => mkCol(k, role))];
      }
      const sortKey = b.pct ? (role === 'p' ? 'p_rv_p' : 'p_xwoba') : (st.sortKey || (b.sort ? b.sort[role] : cols[2].k));
      const sref = isArs && st.pt ? refRows.filter(r => r.pt === st.pt) : refRows;
      tbl = renderTable(App.$('#tbl'), { rows, cols, sort: sortKey, dir: b.dir && b.dir[role] ? b.dir[role] : -1, rank: true, pageSize: 100, refRows: sref, onRow: r => App.go('#/player/' + r.id) });
      App.$('#dl').onclick = () => csv(rows, cols, `${b.id}-${role}`);
      const qq = { role }; if (st.team) qq.team = st.team; if (st.hand) qq.hand = st.hand; if (st.min !== minDef) qq.min = st.min; if (st.pt && st.pt !== b.ptDefault) qq.pt = st.pt; if (st.name) qq.name = st.name; if (b.picker && st.cols) qq.cols = st.cols.join(',');
      setQuery(qq);
    };
    build();
    $$('#role a', app).forEach(a => a.onclick = () => { App.go(`#/leaderboard/${b.id}?role=${a.dataset.r}`); });
    const on = (sel, ev, fn) => { const e = App.$(sel, app); if (e) e[ev] = fn; };
    on('#team', 'onchange', e => { st.team = e.target.value; build(); });
    on('#hand', 'onchange', e => { st.hand = e.target.value; build(); });
    on('#pt', 'onchange', e => { st.pt = e.target.value; build(); });
    on('#min', 'onchange', e => { st.min = +e.target.value || 0; build(); });
    let tmo; on('#nm', 'oninput', e => { clearTimeout(tmo); tmo = setTimeout(() => { st.name = e.target.value; build(); }, 200); });
    on('#pick', 'onclick', () => {
      const pk = App.$('#picker'); pk.hidden = !pk.hidden; if (pk.hidden) return;
      const excl = role === 'p' ? B_ONLY : P_ONLY;
      pk.innerHTML = `<div class="colpick">${Object.entries(PICK).map(([g, ks]) => `<h6>${g}</h6>` + ks.filter(k => !excl.has(k)).map(k => `<label><input type="checkbox" value="${k}" ${colKeys.includes(k) ? 'checked' : ''}>${(C[k] || [k])[0]}</label>`).join('')).join('')}</div>`;
      $$('input', pk).forEach(i => i.onchange = () => { colKeys = $$('input:checked', pk).map(x => x.value); st.cols = colKeys; build(); });
    });
  }

  // ---------------- team boards
  async function teamBoard(app, b) {
    const rows = await App.table('teams');
    const m = await App.meta();
    const tcol = { k: 'name', l: 'Team', c: 'nm', html: r => tlink(r.id) };
    const rec = { k: 'rec', l: 'W-L', c: 'l', get: r => `${r.w}-${r.l}`, f: 's' };
    let cols, sort;
    if (b.team === 'defense') {
      cols = [tcol, { k: 'd_bip', l: 'Tracked BIP', f: 'i' }, { k: 'd_outs', l: 'Outs', f: 'i' }, { k: 'd_xouts', l: 'Exp. Outs', f: 'f1' }, { k: 'd_oae', l: 'Outs Above Expected', f: 'rv', s: 1 }, { k: 'd_oae100', l: 'OAE / 100 BIP', f: 'rv2', s: 1 },
        { k: 'd_drv', l: 'Fielding Run Value', f: 'rv', s: 1 }, { k: 'd_der', l: 'Def. Efficiency', f: 'r3', s: 1 }, { k: 'd_xder', l: 'Exp. DER', f: 'r3' },
        { k: 'd_oae_gb', l: 'OAE on GB', f: 'rv', s: 1 }, { k: 'd_oae_ld', l: 'OAE on LD', f: 'rv', s: 1 }, { k: 'd_oae_fb', l: 'OAE on FB', f: 'rv', s: 1 }, { k: 'd_oae_pu', l: 'OAE on PU', f: 'rv', s: 1 }, { k: 'd_errors', l: 'Errors (ROE)', f: 'i', s: -1 }];
      sort = 'd_oae';
    } else if (b.team === 'framing') {
      cols = [tcol, { k: 'f_taken', l: 'Called Pitches', f: 'i' }, { k: 'f_saa', l: 'Strikes Above Avg', f: 'rv', s: 1 }, { k: 'f_saa100', l: 'Strikes +/- per 100', f: 'rv2', s: 1 }, { k: 'f_frv', l: 'Framing Runs', f: 'rv', s: 1 }, { k: 'f_shadow_cs', l: 'Shadow Zone Strike %', f: 'p', s: 1 }];
      sort = 'f_saa';
    } else if (b.team === 'batting') {
      cols = [tcol, rec, ...['pa', 'avg', 'obp', 'slg', 'ops', 'woba', 'xwoba', 'xba', 'xslg', 'hr', 'k_pct', 'bb_pct', 'ev', 'ev_max', 'la', 'barrel_pct', 'hard_pct', 'sweet_pct', 'chase_pct', 'whiff_pct', 'z_contact_pct', 'gb_pct', 'ld_pct', 'rv'].map(k => ({ ...col(k, 'b'), k: 'b_' + k })), { k: 'sb', l: 'SB', f: 'i', s: 1 }, { k: 'cs', l: 'CS', f: 'i' }];
      sort = 'b_xwoba';
    } else {
      cols = [tcol, rec, ...['ipd', 'bf', 'ra9', 'xra9', 'fip', 'whip', 'woba', 'xwoba', 'xba', 'k_pct', 'bb_pct', 'kbb_pct', 'hr', 'ev', 'barrel_pct', 'hard_pct', 'gb_pct', 'chase_pct', 'whiff_pct', 'csw_pct', 'zone_pct', 'fps_pct', 'putaway_pct', 'fb_velo', 'rv_p'].map(k => ({ ...col(k, 'p'), k: 'p_' + (k === 'rv_p' ? 'rv' : k) }))];
      sort = 'p_xwoba';
    }
    app.innerHTML = `<h1 class="pg"><span class="stc">STATCAST</span><span class="bar"></span>${b.title}</h1><div class="note">${b.desc}</div>
      <div class="ctrls"><input id="nm" type="search" placeholder="Filter teams" style="width:200px"><button class="btn" id="dl">Download CSV</button></div><div id="tbl"></div>`;
    const draw = (f = '') => { const r = rows.filter(x => x.name.toLowerCase().includes(f.toLowerCase())); renderTable(App.$('#tbl'), { rows: r, cols, sort, dir: b.team === 'pitching' ? 1 : -1, rank: true, refRows: rows, onRow: x => App.go('#/team/' + x.id) }); App.$('#dl').onclick = () => csv(r, cols, b.id); };
    draw(); App.$('#nm').oninput = e => draw(e.target.value);
  }

  // ---------------- arsenals (pivot)
  async function arsenalsBoard(app, b, q) {
    const ars = await App.table('arsenal');
    const metric = q.m || 'usage';
    const opts = { usage: ['Usage %', 'p'], velo: ['Velocity', 'f1'], spin: ['Spin', 'f0'], ivb: ['IVB', 'f1'], hb: ['HB', 'f1'], whiff_pct: ['Whiff %', 'p'], xwoba: ['xwOBA', 'r3'], rv100_p: ['RV/100', 'rv2'] };
    const by = new Map();
    ars.forEach(r => { const e = by.get(r.id) || { id: r.id, name: r.name, team: r.team, throws: r.throws, pitches: 0 }; e[r.pt] = r; e.pitches += r.pitches; by.set(r.id, e); });
    const minP = q.min ? +q.min : 300;
    const rows = [...by.values()].filter(r => r.pitches >= minP);
    const types = PT_ORDER.filter(p => p !== 'OT');
    app.innerHTML = `<h1 class="pg"><span class="stc">STATCAST</span><span class="bar"></span>Pitch Arsenals Leaderboard</h1><div class="note">${b.desc} Pitch types with fewer than 15 pitches are hidden.</div>
      <div class="ctrls"><div class="seg" id="mseg">${Object.entries(opts).map(([k, v]) => `<a data-m="${k}" class="${k === metric ? 'on' : ''}">${v[0]}</a>`).join('')}</div>
      <input id="min" type="number" value="${minP}" style="width:100px"><span class="small">Min total pitches</span><input id="nm" type="search" placeholder="Filter by name / team" style="width:190px"><button class="btn" id="dl">Download CSV</button></div><div id="tbl"></div>`;
    const [lbl, f] = opts[metric];
    const cols = [nameCol, teamCol, { k: 'throws', l: 'Throws', c: 'l', f: 's' }, { k: 'pitches', l: 'Pitches', f: 'i' },
      ...types.map(p => ({ k: p, l: `<span class="ptdot" style="background:${App.ptColor(p)}"></span>${App.ptShort(p)}`, f, s: metric === 'usage' ? 0 : (metric === 'xwoba' ? -1 : 1), get: r => r[p] && r[p].pitches >= 15 ? r[p][metric] : null }))];
    const draw = (flt = '') => { const rr = rows.filter(r => (pname(r.name) + ' ' + App.tname(r.team)).toLowerCase().includes(flt.toLowerCase())); renderTable(App.$('#tbl'), { rows: rr, cols, sort: types.includes('FF') ? 'FF' : 'pitches', rank: true, pageSize: 100, onRow: r => App.go('#/player/' + r.id) }); App.$('#dl').onclick = () => csv(rr, cols, 'pitch-arsenals-' + metric); };
    draw();
    $$('#mseg a', app).forEach(a => a.onclick = () => App.go(`#/leaderboard/pitch-arsenals?m=${a.dataset.m}&min=${App.$('#min').value}`));
    App.$('#min').onchange = e => App.go(`#/leaderboard/pitch-arsenals?m=${metric}&min=${e.target.value}`);
    App.$('#nm').oninput = e => draw(e.target.value);
  }

  // ---------------- running game
  async function runningBoard(app, b) {
    const [pit, teams] = await Promise.all([App.table('pitchers'), App.table('teams')]);
    app.innerHTML = `<h1 class="pg"><span class="stc">STATCAST</span><span class="bar"></span>Running Game Leaderboard</h1><div class="note">${b.desc}</div>
      ${sec('Pitchers: Stolen Bases Allowed')}<div id="t1"></div>${sec('Teams')}<div id="t2"></div>`;
    const prow = pit.filter(r => (r.sb + r.cs) > 0).map(r => ({ ...r, att: r.sb + r.cs, cs_rate: r.cs / (r.sb + r.cs) * 100, sb_per9: r.ipd ? r.sb / (r.outs / 27) : null }));
    renderTable(App.$('#t1'), { rows: prow, cols: [nameCol, teamCol, { k: 'throws', l: 'Throws', c: 'l', f: 's' }, col('ipd', 'p'), { k: 'att', l: 'SB Att', f: 'i' }, { k: 'sb', l: 'SB', f: 'i', s: -1 }, { k: 'cs', l: 'CS', f: 'i', s: 1 }, { k: 'cs_rate', l: 'CS %', f: 'p', s: 1 }, { k: 'sb_per9', l: 'SB / 9', f: 'f2', s: -1 }], sort: 'att', rank: true, pageSize: 50, onRow: r => App.go('#/player/' + r.id) });
    const trow = teams.map(r => ({ ...r, off_att: r.sb + r.cs, off_rate: r.sb + r.cs ? r.sb / (r.sb + r.cs) * 100 : null, def_att: r.sb_against + r.cs_against, def_rate: (r.sb_against + r.cs_against) ? r.cs_against / (r.sb_against + r.cs_against) * 100 : null }));
    renderTable(App.$('#t2'), { rows: trow, cols: [{ k: 'name', l: 'Team', c: 'nm', html: r => tlink(r.id) }, { k: 'off_att', l: 'Offense SB Att', f: 'i' }, { k: 'sb', l: 'SB', f: 'i', s: 1 }, { k: 'cs', l: 'CS', f: 'i' }, { k: 'off_rate', l: 'SB Success %', f: 'p', s: 1 },
      { k: 'def_att', l: 'Defense SB Att', f: 'i' }, { k: 'sb_against', l: 'SB Allowed', f: 'i', s: -1 }, { k: 'cs_against', l: 'CS (thrown out)', f: 'i', s: 1 }, { k: 'def_rate', l: 'Caught Stealing %', f: 'p', s: 1 }], sort: 'off_att', rank: true, onRow: r => App.go('#/team/' + r.id) });
  }

  return { render, B, C, col, mkCol, nameCol, teamCol, ptCol };
})();
App.route('leaderboard', Boards.render);
App.route('leaderboards', (app) => App.go('#/leaderboard/custom'));
