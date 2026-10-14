/* charts: percentile panel, movement profile, heat maps, zone charts, scatter, rolling */
const Charts = (() => {
  const { esc, fmt, isN, pctColor, ptColor, ptName, ptShort, PT_ORDER, divColor, tip } = App;

  // ---------------- percentile rankings panel
  function percentiles(el, groups, pct, val, fmtMap, opts = {}) {
    const rows = groups.map(([cat, keys]) => {
      const head = `<div class="pct-cat"><b>${cat}</b>${cat === groups[0][0] ? '<span class="small" style="color:var(--teal);font-family:var(--cond)">trackman lab</span>' : ''}</div>`;
      const r = keys.map(([k, label]) => {
        const p = pct[k]; const v = val[k];
        if (!isN(p)) return `<div class="pct-row na"><div class="lb">${label}</div><div class="tr"><div class="base"></div></div><div class="vv">${isN(v) ? fmt(v, fmtMap[k] || 'f1') : ''}</div></div>`;
        const c = pctColor(p);
        return `<div class="pct-row" title="${esc(label)}: ${p}th percentile"><div class="lb">${label}</div><div class="tr"><div class="base"></div><div class="fill" style="width:${p}%;background:${c}"></div><div class="mid"></div><div class="ball" style="left:${p}%;background:${c}">${p}</div></div><div class="vv">${fmt(v, fmtMap[k] || 'f1')}</div></div>`;
      }).join('');
      return head + r;
    }).join('');
    el.innerHTML = `<div class="pct-h"><span></span><div class="pct-scale"><span class="p">POOR ▾</span><span class="a">AVERAGE ▾</span><span class="g">GREAT ▾</span></div><span></span></div>${rows}${opts.note ? `<div class="small" style="margin-top:8px">${opts.note}</div>` : ''}`;
  }

  // ---------------- movement profile (Savant circular chart)
  function movement(el, pts, opts = {}) {
    const W = 380, H = 380, cx = W / 2, cy = H / 2, R = 172, MAX = 30;
    const s = v => v / MAX * R;
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H + 20}`);
    const defs = svg.append('defs');
    const pat = defs.append('pattern').attr('id', 'hatch' + (opts.uid || '')).attr('width', 6).attr('height', 6).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', 'rotate(45)');
    pat.append('rect').attr('width', 6).attr('height', 6).attr('fill', 'rgba(255,255,255,0)');
    pat.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 6).attr('stroke', 'rgba(0,0,0,.25)').attr('stroke-width', 2);
    const g = svg.append('g').attr('transform', `translate(0,14)`);
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', R + 8).attr('fill', '#e4f2f5');
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', s(24)).attr('fill', '#fff');
    [6, 12, 18].forEach(r => g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', s(r)).attr('fill', 'none').attr('stroke', '#999').attr('stroke-dasharray', r === 12 ? null : '2,3').attr('stroke-width', r === 12 ? .8 : .6));
    g.append('line').attr('x1', cx - R - 8).attr('x2', cx + R + 8).attr('y1', cy).attr('y2', cy).attr('stroke', '#333').attr('stroke-width', .8);
    g.append('line').attr('y1', cy - R - 8).attr('y2', cy + R + 8).attr('x1', cx).attr('x2', cx).attr('stroke', '#333').attr('stroke-width', .8);
    const lab = (x, y, t) => g.append('text').attr('x', x).attr('y', y).text(t).attr('font-size', 11).attr('fill', '#555').attr('text-anchor', 'middle').attr('font-family', 'Roboto Condensed').attr('paint-order', 'stroke').attr('stroke', '#fff').attr('stroke-width', 3);
    [12, 24].forEach(r => { lab(cx + s(r), cy - 4, r + '"'); lab(cx - s(r), cy - 4, r + '"'); lab(cx + 10, cy - s(r) + 4, r + '"'); lab(cx + 10, cy + s(r) + 4, r + '"'); });
    svg.append('text').attr('x', cx).attr('y', 10).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#666').attr('font-family', 'Roboto Condensed').text('1B ◀  MOVES TOWARD  ▶ 3B');
    svg.append('text').attr('x', 6).attr('y', 70).attr('font-size', 10).attr('fill', '#666').attr('font-family', 'Roboto Condensed').text('▲ MORE RISE');
    svg.append('text').attr('x', 6).attr('y', H).attr('font-size', 10).attr('fill', '#666').attr('font-family', 'Roboto Condensed').text('▼ MORE DROP');
    // league averages
    if (opts.avg) {
      Object.entries(opts.avg).forEach(([p, a]) => {
        if (!a || !isN(a.hb)) return;
        g.append('ellipse').attr('cx', cx + s(a.hb)).attr('cy', cy - s(a.ivb)).attr('rx', s(Math.max(2, a.hb_sd * .6))).attr('ry', s(Math.max(2, a.ivb_sd * .6)))
          .attr('fill', ptColor(p)).attr('fill-opacity', .22).attr('stroke', ptColor(p)).attr('stroke-dasharray', '3,2').attr('stroke-opacity', .6).attr('class', 'lgavg');
        g.append('ellipse').attr('cx', cx + s(a.hb)).attr('cy', cy - s(a.ivb)).attr('rx', s(Math.max(2, a.hb_sd * .6))).attr('ry', s(Math.max(2, a.ivb_sd * .6))).attr('fill', `url(#hatch${opts.uid || ''})`).attr('class', 'lgavg');
      });
    }
    const clip = v => Math.max(-MAX, Math.min(MAX, v));
    g.selectAll('circle.pt').data(pts).enter().append('circle').attr('class', 'pt')
      .attr('cx', d => cx + s(clip(d[1]))).attr('cy', d => cy - s(clip(d[2]))).attr('r', opts.r || 4.2)
      .attr('fill', d => ptColor(d[0])).attr('stroke', 'rgba(0,0,0,.45)').attr('stroke-width', .6).attr('fill-opacity', .85)
      .on('mousemove', (ev, d) => tip(`<b>${ptName(d[0])}</b><br>${d[3] ? d[3] + ' mph<br>' : ''}IVB ${d[2]}" · HB ${d[1]}"${d[4] ? '<br>' + esc(d[4]) : ''}`, ev)).on('mouseleave', () => tip(null));
    if (isN(opts.armAngle)) {
      const ang = opts.armAngle * Math.PI / 180, x0 = W - 58, y0 = H - 16;
      const dir = opts.throws === 'L' ? -1 : 1;
      svg.append('text').attr('x', W - 40).attr('y', H - 52).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#555').attr('font-family', 'Roboto Condensed').text('ARM ANGLE');
      svg.append('text').attr('x', W - 40).attr('y', H - 38).attr('text-anchor', 'middle').attr('font-size', 15).attr('font-weight', 700).attr('font-family', 'Roboto Condensed').text(Math.round(opts.armAngle) + '°');
      svg.append('line').attr('x1', x0).attr('y1', y0).attr('x2', x0 + dir * 34 * Math.cos(ang)).attr('y2', y0 - 34 * Math.sin(ang)).attr('stroke', '#333').attr('stroke-width', 3).attr('stroke-linecap', 'round');
      svg.append('circle').attr('cx', x0).attr('cy', y0).attr('r', 4).attr('fill', '#888');
      svg.append('circle').attr('cx', x0 + dir * 34 * Math.cos(ang)).attr('cy', y0 - 34 * Math.sin(ang)).attr('r', 3).attr('fill', '#fff').attr('stroke', '#333');
    }
    return svg;
  }

  // ---------------- heat map (contour-like density)
  function heat(el, cells, opts = {}) {
    const NX = 16, NZ = 20; const w = opts.w || 230, h = opts.h || 270;
    const grid = new Float32Array(NX * NZ);
    let tot = 0; cells.forEach(([x, z, n]) => { if (x >= 0 && x < NX && z >= 0 && z < NZ) { grid[z * NX + x] += n; tot += n; } });
    // gaussian blur x2
    const blur = g => { const o = new Float32Array(NX * NZ); const k = [.25, .5, .25];
      for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) { let s = 0; for (let d = -1; d <= 1; d++) { const xx = Math.min(NX - 1, Math.max(0, x + d)); s += g[z * NX + xx] * k[d + 1]; } o[z * NX + x] = s; }
      const o2 = new Float32Array(NX * NZ); for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) { let s = 0; for (let d = -1; d <= 1; d++) { const zz = Math.min(NZ - 1, Math.max(0, z + d)); s += o[zz * NX + x] * k[d + 1]; } o2[z * NX + x] = s; } return o2; };
    let gB = blur(blur(grid));
    const mx = Math.max(...gB) || 1;
    const c = document.createElement('canvas'); const dpr = 2; c.width = w * dpr; c.height = h * dpr; c.style.width = '100%'; c.style.aspectRatio = `${w}/${h}`;
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    // ft -> px. x range [-2,2], z range [0,5]
    const X = x => (x + 2) / 4 * w, Z = z => h - z / 5 * h * .92 - h * .06;
    // bilinear upsample to a fine grid, then quantize into contour bands (Savant-style)
    const UP = 6, FX = NX * UP, FZ = NZ * UP;
    const sm = document.createElement('canvas'); sm.width = FX; sm.height = FZ; const sctx = sm.getContext('2d'); const img = sctx.createImageData(FX, FZ);
    const BL = [65, 105, 177], WH = [255, 255, 255], RD = [218, 42, 50];
    const at = (x, z) => gB[Math.min(NZ - 1, Math.max(0, z)) * NX + Math.min(NX - 1, Math.max(0, x))];
    for (let fz = 0; fz < FZ; fz++) for (let fx = 0; fx < FX; fx++) {
      const gx = (fx + .5) / UP - .5, gz = (fz + .5) / UP - .5; const x0 = Math.floor(gx), z0 = Math.floor(gz), tx = gx - x0, tz = gz - z0;
      let v = (at(x0, z0) * (1 - tx) + at(x0 + 1, z0) * tx) * (1 - tz) + (at(x0, z0 + 1) * (1 - tx) + at(x0 + 1, z0 + 1) * tx) * tz;
      v = v / mx; const band = Math.floor(v * 9) / 9;
      const i = ((FZ - 1 - fz) * FX + fx) * 4;
      let col; if (band < .5) { const t = band / .5; col = BL.map((b, j) => b + (WH[j] - b) * t * .85); } else { const t = (band - .5) / .5; col = WH.map((b, j) => b + (RD[j] - b) * (.25 + .75 * t)); }
      img.data[i] = col[0]; img.data[i + 1] = col[1]; img.data[i + 2] = col[2]; img.data[i + 3] = band < 1 / 9 ? 0 : 235;
    }
    sctx.putImageData(img, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sm, X(-2), Z(5), X(2) - X(-2), Z(0) - Z(5));
    // zone
    ctx.setLineDash([3, 2]); ctx.strokeStyle = '#222'; ctx.lineWidth = 1.2; ctx.strokeRect(X(-.83), Z(3.5), X(.83) - X(-.83), Z(1.5) - Z(3.5));
    ctx.setLineDash([]); ctx.strokeStyle = 'rgba(0,0,0,.25)';
    for (let k = 1; k < 3; k++) { const xx = X(-.83 + k * 1.66 / 3); ctx.beginPath(); ctx.moveTo(xx, Z(3.5)); ctx.lineTo(xx, Z(1.5)); ctx.stroke(); const zz = Z(1.5 + k * 2 / 3); ctx.beginPath(); ctx.moveTo(X(-.83), zz); ctx.lineTo(X(.83), zz); ctx.stroke(); }
    // plate
    ctx.fillStyle = '#e6e6e6'; ctx.beginPath(); const py = Z(.35); ctx.moveTo(X(-.71), py); ctx.lineTo(X(.71), py); ctx.lineTo(X(.71), py + 6); ctx.lineTo(X(0), py + 14); ctx.lineTo(X(-.71), py + 6); ctx.closePath(); ctx.fill();
    if (opts.label) { ctx.fillStyle = '#666'; ctx.font = '11px Roboto Condensed'; ctx.fillText(opts.label, 6, 14); }
    if (opts.side) { ctx.fillStyle = '#999'; ctx.font = '10px Roboto Condensed'; ctx.fillText("catcher's view", w - 70, h - 6); }
    el.appendChild(c);
    return tot;
  }

  // ---------------- gameday zone chart (3x3 + 4 outer quadrants)
  function zoneChart(el, zones, metric, opts = {}) {
    const W = 230, H = 250; const o = 20, iw = 150, ih = 170; // outer box
    const ix = o + 30, iy = o + 30, cw = (iw - 60) / 3 * 1, ch = (ih - 60) / 3;
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const cx0 = (W - iw) / 2, cy0 = 22;
    const fmtv = opts.fmt || 'f1';
    const vals = Object.values(zones).map(z => z[metric]).filter(isN);
    const lo = opts.lo ?? Math.min(...vals), hi = opts.hi ?? Math.max(...vals);
    const color = v => opts.colorFn ? opts.colorFn(v) : divColor(v, lo, hi);
    const val = k => zones[k] ? zones[k][metric] : null;
    const n = k => zones[k] ? zones[k].pitches : 0;
    const txt = (x, y, v, k) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-family', 'Roboto Mono').attr('font-size', 12).attr('fill', '#111').text(isN(v) && n(k) >= (opts.minN || 1) ? fmt(v, fmtv) : '');
    // outer quadrants
    const ox = cx0, oy = cy0, ow = iw + 30, oh = ih + 30;
    const OX = W / 2 - ow / 2;
    const quad = [[11, OX, oy, ow / 2, oh / 2], [12, OX + ow / 2, oy, ow / 2, oh / 2], [13, OX, oy + oh / 2, ow / 2, oh / 2], [14, OX + ow / 2, oy + oh / 2, ow / 2, oh / 2]];
    quad.forEach(([k, x, y, w, h]) => {
      svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', isN(val(k)) && n(k) >= (opts.minN || 1) ? color(val(k)) : '#f2f2f2').attr('stroke', '#fff').attr('stroke-width', 2)
        .on('mousemove', ev => tip(`Zone ${k} (out of zone)<br>${n(k)} pitches<br>${opts.label || metric}: ${fmt(val(k), fmtv)}`, ev)).on('mouseleave', () => tip(null));
    });
    const zx = OX + 30, zy = oy + 30, zw = (ow - 60) / 3, zh = (oh - 60) / 3;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const k = 1 + r * 3 + c;
      svg.append('rect').attr('x', zx + c * zw).attr('y', zy + r * zh).attr('width', zw).attr('height', zh).attr('fill', isN(val(k)) && n(k) >= (opts.minN || 1) ? color(val(k)) : '#f2f2f2').attr('stroke', '#fff').attr('stroke-width', 2)
        .on('mousemove', ev => tip(`Zone ${k}<br>${n(k)} pitches<br>${opts.label || metric}: ${fmt(val(k), fmtv)}`, ev)).on('mouseleave', () => tip(null));
      txt(zx + c * zw + zw / 2, zy + r * zh + zh / 2, val(k), k);
    }
    svg.append('rect').attr('x', zx).attr('y', zy).attr('width', zw * 3).attr('height', zh * 3).attr('fill', 'none').attr('stroke', '#222').attr('stroke-width', 1.4);
    [[11, OX + 12, oy + 12], [12, OX + ow - 12, oy + 12], [13, OX + 12, oy + oh - 12], [14, OX + ow - 12, oy + oh - 12]].forEach(([k, x, y]) => txt(x + (x < W / 2 ? 8 : -8), y, val(k), k));
    // plate
    const py = oy + oh + 10; svg.append('path').attr('d', `M${W / 2 - 24},${py} h48 v5 l-24,9 l-24,-9z`).attr('fill', '#ddd');
  }

  // ---------------- attack zones (Savant swing/take graphic)
  function attackZones(el, att, metric = 'rv', fmtv = 'rv') {
    const W = 300, H = 300; const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).style('max-width', '340px').style('margin', '0 auto').style('display', 'block');
    const C = { waste: '#ececec', chase: '#f7dfc4', shadow: '#f4c78c', heart: '#e5915a' };
    const box = [['waste', 0], ['chase', 30], ['shadow', 60], ['heart', 96]];
    box.forEach(([k, ins]) => {
      svg.append('rect').attr('x', 10 + ins).attr('y', 10 + ins).attr('width', W - 20 - 2 * ins).attr('height', H - 20 - 2 * ins).attr('rx', 8).attr('fill', C[k]);
      const v = att[k] ? att[k][metric] : null;
      const y = k === 'heart' ? H / 2 - 4 : 10 + ins + 19;
      const g = svg.append('text').attr('x', W / 2).attr('y', y).attr('text-anchor', 'middle').attr('font-family', 'Roboto Condensed').attr('font-size', 13);
      g.append('tspan').attr('fill', '#333').text(k.toUpperCase() + '  ');
      g.append('tspan').attr('font-family', 'Roboto Mono').attr('font-weight', 600).attr('fill', isN(v) ? (v > 0 ? '#c0223b' : '#2c56a0') : '#999').text(isN(v) ? fmt(v, fmtv) : '—');
      if (k === 'heart' && att[k]) svg.append('text').attr('x', W / 2).attr('y', H / 2 + 16).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', 'Roboto Condensed').attr('fill', '#333').text(`${att[k].pitches} P · ${Math.round(att[k].swing_pct || 0)}% swing`);
    });
  }

  // ---------------- EV / LA scatter
  const EVCOL = { '1B': '#1DBE3A', '2B': '#3C44CD', '3B': '#933F2C', HR: '#D22D49', OUT: '#bbb', FC: '#bbb', SF: '#bbb', SH: '#bbb', ROE: '#FE9D00' };
  function evla(el, pts) {
    const W = 380, H = 300, m = { l: 38, r: 10, t: 10, b: 32 };
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain([40, 120]).range([m.l, W - m.r]), y = d3.scaleLinear().domain([-60, 80]).range([H - m.b, m.t]);
    svg.append('rect').attr('x', x(98)).attr('y', y(50)).attr('width', x(120) - x(98)).attr('height', y(8) - y(50)).attr('fill', '#fde6e9');
    svg.append('rect').attr('x', x(40)).attr('y', y(32)).attr('width', x(120) - x(40)).attr('height', y(8) - y(32)).attr('fill', 'rgba(61,142,155,.07)');
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(8)).attr('font-family', 'Roboto Mono');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(7)).attr('font-family', 'Roboto Mono');
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', 'Roboto Condensed').text('Exit Velocity (mph)');
    svg.append('text').attr('transform', `translate(10,${H / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', 'Roboto Condensed').text('Launch Angle (°)');
    svg.append('text').attr('x', x(99)).attr('y', y(50) + 12).attr('font-size', 10).attr('fill', '#c0223b').attr('font-family', 'Roboto Condensed').text('BARREL ZONE');
    const sorted = pts.slice().sort((a, b) => (a[2] === 'OUT') - (b[2] === 'OUT')).reverse();
    svg.selectAll('circle').data(sorted).enter().append('circle').attr('cx', d => x(Math.max(40, Math.min(120, d[0])))).attr('cy', d => y(Math.max(-60, Math.min(80, d[1])))).attr('r', 3.4)
      .attr('fill', d => EVCOL[d[2]] || '#bbb').attr('fill-opacity', d => ['OUT', 'FC', 'SF', 'SH'].includes(d[2]) ? .45 : .9).attr('stroke', 'rgba(0,0,0,.3)').attr('stroke-width', .5)
      .on('mousemove', (ev, d) => tip(`${d[2]}<br>${d[0]} mph · ${d[1]}°<br>xBA ${App.F.r3(d[3])}`, ev)).on('mouseleave', () => tip(null));
    return `<div class="legend">${[['1B', 'Single'], ['2B', 'Double'], ['3B', 'Triple'], ['HR', 'Home Run'], ['ROE', 'Error'], ['OUT', 'Out']].map(([k, l]) => `<span><span class="ptdot" style="background:${EVCOL[k]}"></span>${l}</span>`).join('')}</div>`;
  }

  // ---------------- release point
  function release(el, pts) {
    const W = 300, H = 260, m = { l: 34, r: 10, t: 10, b: 28 };
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain([-4, 4]).range([m.l, W - m.r]), y = d3.scaleLinear().domain([3, 7.5]).range([H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(8)).attr('font-family', 'Roboto Mono');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6)).attr('font-family', 'Roboto Mono');
    svg.append('rect').attr('x', x(-.75)).attr('y', y(3.3)).attr('width', x(.75) - x(-.75)).attr('height', 4).attr('fill', '#999');
    svg.selectAll('circle').data(pts).enter().append('circle').attr('cx', d => x(d[1])).attr('cy', d => y(d[2])).attr('r', 3).attr('fill', d => ptColor(d[0])).attr('fill-opacity', .75).attr('stroke', 'rgba(0,0,0,.3)').attr('stroke-width', .5);
    svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-family', 'Roboto Condensed').text("Release Side (ft) · pitcher's view: + = 3B side");
  }

  // ---------------- line chart (rolling)
  function lines(el, series, opts = {}) {
    const W = opts.w || 600, H = opts.h || 230, m = { l: 44, r: 12, t: 12, b: 30 };
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const all = series.flatMap(s => s.pts).filter(p => isN(p[1]));
    if (!all.length) { el.innerHTML += '<div class="small" style="padding:20px">Not enough data.</div>'; return; }
    const x = d3.scaleLinear().domain(d3.extent(all, d => d[0])).range([m.l, W - m.r]);
    let [y0, y1] = d3.extent(all, d => d[1]); if (opts.ref !== undefined) { y0 = Math.min(y0, opts.ref); y1 = Math.max(y1, opts.ref); } const pad = (y1 - y0) * .1 || 1;
    const y = d3.scaleLinear().domain([y0 - pad, y1 + pad]).range([H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(8).tickFormat(opts.xfmt || d3.format('d'))).attr('font-family', 'Roboto Mono');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(6).tickFormat(opts.yfmt || null)).attr('font-family', 'Roboto Mono');
    if (opts.ref !== undefined) { svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(opts.ref)).attr('y2', y(opts.ref)).attr('stroke', '#999').attr('stroke-dasharray', '4,3'); svg.append('text').attr('x', W - m.r).attr('y', y(opts.ref) - 4).attr('text-anchor', 'end').attr('font-size', 10).attr('fill', '#888').attr('font-family', 'Roboto Condensed').text(opts.refLabel || 'League Avg'); }
    series.forEach(s => {
      const p = s.pts.filter(q => isN(q[1]));
      svg.append('path').datum(p).attr('fill', 'none').attr('stroke', s.color || '#3d8e9b').attr('stroke-width', 2.2).attr('d', d3.line().x(d => x(d[0])).y(d => y(d[1])));
      svg.selectAll(null).data(p).enter().append('circle').attr('cx', d => x(d[0])).attr('cy', d => y(d[1])).attr('r', 2.6).attr('fill', s.color || '#3d8e9b')
        .on('mousemove', (ev, d) => tip(`${s.name ? '<b>' + s.name + '</b><br>' : ''}${d[2] || ''}<br>${opts.ylabel || ''} ${opts.yfmt ? opts.yfmt(d[1]) : d[1].toFixed(2)}`, ev)).on('mouseleave', () => tip(null));
    });
    if (opts.xlabel) svg.append('text').attr('x', W / 2).attr('y', H - 2).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', 'Roboto Condensed').text(opts.xlabel);
  }

  // ---------------- stacked bars (pitch distribution by count)
  function stacked(el, rows, keys) { // rows: [{label, vals:{pt:n}}]
    const W = 1150, rowH = 26, H = rows.length * rowH + 8, m = { l: 110, r: 10 };
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    rows.forEach((r, i) => {
      const tot = keys.reduce((s, k) => s + (r.vals[k] || 0), 0) || 1; let x0 = m.l;
      svg.append('text').attr('x', m.l - 8).attr('y', i * rowH + 15).attr('text-anchor', 'end').attr('font-size', 12).attr('font-family', 'Roboto Condensed').text(r.label);
      keys.forEach(k => { const w = (r.vals[k] || 0) / tot * (W - m.l - m.r); if (w <= 0) return;
        svg.append('rect').attr('x', x0).attr('y', i * rowH + 3).attr('width', w).attr('height', rowH - 6).attr('fill', ptColor(k)).attr('stroke', '#fff')
          .on('mousemove', ev => tip(`${r.label}: ${ptName(k)} ${(r.vals[k] / tot * 100).toFixed(1)}% (${r.vals[k]})`, ev)).on('mouseleave', () => tip(null));
        if (w > 30) svg.append('text').attr('x', x0 + w / 2).attr('y', i * rowH + 15).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-family', 'Roboto Mono').attr('fill', App.darkText(k) ? '#222' : '#fff').attr('pointer-events', 'none').text(Math.round(r.vals[k] / tot * 100) + '%');
        x0 += w; });
    });
  }

  // ---------------- histogram (velo by pitch)
  function histo(el, pts) { // pts: [pt, velo]
    const W = 600, H = 220, m = { l: 36, r: 10, t: 10, b: 28 };
    const v = pts.filter(p => p[1] > 40);
    if (!v.length) return;
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain([Math.floor(d3.min(v, d => d[1]) - 1), Math.ceil(d3.max(v, d => d[1]) + 1)]).range([m.l, W - m.r]);
    const types = [...new Set(v.map(d => d[0]))];
    const bins = {}; let ymax = 0;
    types.forEach(t => { const b = d3.bin().domain(x.domain()).thresholds(d3.range(x.domain()[0], x.domain()[1], .5))(v.filter(d => d[0] === t).map(d => d[1])); bins[t] = b; ymax = Math.max(ymax, d3.max(b, d => d.length)); });
    const y = d3.scaleLinear().domain([0, ymax]).range([H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(10)).attr('font-family', 'Roboto Mono');
    types.forEach(t => svg.append('path').datum(bins[t]).attr('fill', ptColor(t)).attr('fill-opacity', .45).attr('stroke', ptColor(t)).attr('stroke-width', 1.5)
      .attr('d', d3.area().curve(d3.curveBasis).x(d => x((d.x0 + d.x1) / 2)).y0(y(0)).y1(d => y(d.length))));
    svg.append('text').attr('x', W / 2).attr('y', H - 1).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', 'Roboto Condensed').text('Velocity (mph)');
  }

  // ---------------- scatter (visuals page)
  function scatter(el, pts, o) {
    const W = o.w || 760, H = o.h || 560, m = { l: 50, r: 16, t: 14, b: 40 };
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain(o.xd || d3.extent(pts, d => d.x)).nice().range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain(o.yd || d3.extent(pts, d => d.y)).nice().range([H - m.b, m.t]);
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x)).attr('font-family', 'Roboto Mono');
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y)).attr('font-family', 'Roboto Mono');
    if (o.cross) { svg.append('line').attr('x1', x(0)).attr('x2', x(0)).attr('y1', m.t).attr('y2', H - m.b).attr('stroke', '#bbb'); svg.append('line').attr('y1', y(0)).attr('y2', y(0)).attr('x1', m.l).attr('x2', W - m.r).attr('stroke', '#bbb'); }
    svg.append('text').attr('x', W / 2).attr('y', H - 4).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-family', 'Roboto Condensed').text(o.xl);
    svg.append('text').attr('transform', `translate(13,${H / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('font-size', 12).attr('font-family', 'Roboto Condensed').text(o.yl);
    svg.selectAll('circle').data(pts).enter().append('circle').attr('cx', d => x(d.x)).attr('cy', d => y(d.y)).attr('r', d => d.r || 4).attr('fill', d => d.c).attr('fill-opacity', .7).attr('stroke', 'rgba(0,0,0,.35)').attr('stroke-width', .6).style('cursor', 'pointer')
      .on('mousemove', (ev, d) => tip(d.tip, ev)).on('mouseleave', () => tip(null)).on('click', (ev, d) => d.href && App.go(d.href));
  }

  return { percentiles, movement, heat, zoneChart, attackZones, evla, release, lines, stacked, histo, scatter, EVCOL };
})();
