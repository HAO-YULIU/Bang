'use strict';
// ===== 謎題元件 =====
// 每個元件都把結果交給 ctx.submit(value)，由引擎判斷對錯（答錯扣地圖）。
const K = (() => {
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const add = (el, html) => { el.insertAdjacentHTML('beforeend', html); return el.lastElementChild; };

  // 選擇題
  function choice(el, ctx, opts, o = {}) {
    const box = h('div', 'k-choice'); box.style.gridTemplateColumns = `repeat(${o.cols || 2}, 1fr)`;
    opts.forEach(op => { const b = h('button', 'k-opt', op.t); b.type = 'button'; b.onclick = () => { if (ctx.solved(o.id)) return; ctx.submit(op.v ?? op.t); }; box.append(b); });
    el.append(box); return box;
  }
  // 依序點選（排序／挑選）
  function seq(el, ctx, items, o = {}) {
    const sep = o.sep ?? '-', wrap = h('div', 'k-seq');
    const pick = h('div', 'k-seq-pick'), out = h('div', 'k-seq-out', '<span class="muted">（依序點選）</span>'), ctl = h('div', 'k-seq-ctl');
    let cur = [];
    const draw = () => { out.innerHTML = cur.length ? cur.map((v, i) => `<span>${i + 1}. ${items.find(x => (x.v ?? x.t) === v).t}</span>`).join('') : '<span class="muted">（依序點選）</span>';
      $$('button', pick).forEach(b => b.disabled = !o.repeat && cur.includes(b.dataset.v)); };
    items.forEach(it => { const b = h('button', 'k-opt', it.t); b.type = 'button'; b.dataset.v = it.v ?? it.t; b.onclick = () => { if (o.len && cur.length >= o.len) return; cur.push(b.dataset.v); sfx('click'); draw(); }; pick.append(b); });
    ctl.innerHTML = `<button type="button" class="btn ghost sm k-undo">↶ 退一步</button><button type="button" class="btn ghost sm k-clr">清除</button><button type="button" class="btn gold sm k-go">確定送出</button>`;
    $('.k-undo', ctl).onclick = () => { cur.pop(); draw(); }; $('.k-clr', ctl).onclick = () => { cur = []; draw(); };
    $('.k-go', ctl).onclick = () => { if (!cur.length) return; ctx.submit(cur.join(sep)); cur = []; draw(); };
    wrap.append(pick, out, ctl); el.append(wrap); return wrap;
  }
  // 方格（開關）：送出 0/1 字串（列優先）
  function grid(el, ctx, o) {
    const { r, c } = o, st = o.start ? o.start.split('').map(Number) : Array(r * c).fill(0);
    const wrap = h('div', 'k-grid-wrap');
    const tbl = h('div', 'k-grid'); tbl.style.gridTemplateColumns = `${o.rowClue ? 'auto ' : ''}repeat(${c}, var(--cell, 34px))`;
    if (o.colClue) { if (o.rowClue) tbl.append(h('span', 'k-gc')); o.colClue.forEach(t => tbl.append(h('span', 'k-gc col', String(t).replace(/ /g, '<br>')))); }
    for (let i = 0; i < r; i++) {
      if (o.rowClue) tbl.append(h('span', 'k-gc row', o.rowClue[i]));
      for (let j = 0; j < c; j++) {
        const k = i * c + j, b = h('button', 'k-cell' + (st[k] ? ' on' : ''), o.cell ? o.cell(i, j) : ''); b.type = 'button';
        b.onclick = () => { if (o.lock && o.lock(i, j)) return; st[k] = st[k] ? 0 : 1; b.classList.toggle('on', !!st[k]); sfx('click'); o.onChange && o.onChange(st, i, j, tbl); };
        tbl.append(b);
      }
    }
    wrap.append(tbl);
    const go = h('div', 'k-row', `<button type="button" class="btn ghost sm">清除</button><button type="button" class="btn gold sm">確定送出</button>`);
    $$('button', go)[0].onclick = () => { st.fill(0); $$('.k-cell', tbl).forEach(b => b.classList.remove('on')); };
    $$('button', go)[1].onclick = () => ctx.submit(st.join(''));
    if (!o.noSubmit) wrap.append(go);
    el.append(wrap); return { wrap, st };
  }
  // 數字格（數獨類）：送出列優先的數字字串，空格算 0
  function digits(el, ctx, o) {
    const { r, c } = o, given = o.given || {}, max = o.max || 9;
    const wrap = h('div', 'k-dig'); wrap.style.gridTemplateColumns = `repeat(${c}, var(--dcell, 42px))`;
    const vals = [];
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) {
      const k = `${i},${j}`, cell = h('div', 'k-dc');
      if (o.cage) { const cg = o.cage(i, j); if (cg) { cell.style.background = cg.bg || ''; if (cg.label) cell.insertAdjacentHTML('beforeend', `<small>${cg.label}</small>`); } }
      if (o.border) { const bd = o.border(i, j); if (bd) Object.assign(cell.style, bd); }
      if (given[k] != null) { cell.classList.add('given'); cell.insertAdjacentHTML('beforeend', `<b>${given[k]}</b>`); vals.push(() => String(given[k])); }
      else { const inp = h('input'); inp.maxLength = 1; inp.inputMode = 'numeric'; inp.oninput = () => { inp.value = inp.value.replace(new RegExp(`[^1-${max}]`, 'g'), '').slice(-1); }; cell.append(inp); vals.push(() => inp.value || '0'); }
      wrap.append(cell);
    }
    el.append(wrap);
    const go = h('div', 'k-row', `<button type="button" class="btn gold sm">確定送出</button>`); $('button', go).onclick = () => ctx.submit(vals.map(f => f()).join('')); el.append(go);
    return wrap;
  }
  // 路線（捷運／地圖）：點相鄰的點，送出 id 串
  function route(el, ctx, o) {
    const W = o.w || 600, H = o.h || 400, N = o.nodes, adj = {};
    o.edges.forEach(([a, b]) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); });
    let path = [o.start];
    const box = h('div', 'k-route');
    const draw = () => {
      const pe = path.slice(1).map((id, i) => `<line x1="${N[path[i]].x}" y1="${N[path[i]].y}" x2="${N[id].x}" y2="${N[id].y}" stroke="#E8453C" stroke-width="9" stroke-linecap="round" opacity=".8"/>`).join('');
      box.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${o.bg || ''}${o.edges.map(([a, b]) => `<line x1="${N[a].x}" y1="${N[a].y}" x2="${N[b].x}" y2="${N[b].y}" stroke="${o.edgeColor ? o.edgeColor(a, b) : '#B8AE9C'}" stroke-width="${o.edgeW || 6}" stroke-linecap="round"/>`).join('')}${pe}
        ${Object.entries(N).map(([id, n]) => `<g class="k-node ${path[path.length - 1] === id ? 'cur' : ''} ${path.includes(id) ? 'on' : ''}" data-id="${id}"><circle cx="${n.x}" cy="${n.y}" r="${n.r || 13}" fill="${path.includes(id) ? '#E8453C' : '#fff'}" stroke="#2A2230" stroke-width="3"/><text x="${n.x + (n.dx ?? 0)}" y="${n.y + (n.dy ?? -20)}" text-anchor="middle" font-size="${n.fs || 15}" font-weight="700" fill="#2A2230">${n.label ?? id}</text></g>`).join('')}</svg>
        <div class="k-row"><span class="muted small">${path.map(id => N[id].label ?? id).join(' → ')}</span><button type="button" class="btn ghost sm">↶</button><button type="button" class="btn ghost sm">重來</button><button type="button" class="btn gold sm">確定送出</button></div>`;
      $$('.k-node', box).forEach(g => g.onclick = () => { const id = g.dataset.id, last = path[path.length - 1]; if ((adj[last] || []).includes(id) && (o.revisit || !path.includes(id) || (path.length > 1 && path[path.length - 2] === id && false))) { path.push(id); sfx('click'); draw(); } });
      const bs = $$('.k-row button', box); bs[0].onclick = () => { if (path.length > 1) path.pop(); draw(); }; bs[1].onclick = () => { path = [o.start]; draw(); }; bs[2].onclick = () => ctx.submit(path.join('-'));
    };
    draw(); el.append(box); return box;
  }
  // 旋轉天燈：文字環繞在燈籠上，拖曳旋轉
  function cyl(el, o) {
    const n = o.faces.length, box = h('div', 'k-cyl');
    box.innerHTML = `<div class="k-cyl-stage"><div class="k-cyl-rot">${o.faces.map((f, i) => `<div class="k-cyl-face" style="transform:rotateY(${i * 360 / n}deg) translateZ(${o.r || 110}px)">${f}</div>`).join('')}</div></div><p class="muted small" style="text-align:center">← 拖曳或滑動旋轉天燈 →</p>`;
    el.append(box);
    let a = 0, sx = null; const rot = $('.k-cyl-rot', box);
    const set = () => rot.style.transform = `rotateY(${a}deg)`;
    const st = box.querySelector('.k-cyl-stage');
    st.onpointerdown = (e) => { sx = e.clientX; st.setPointerCapture(e.pointerId); };
    st.onpointermove = (e) => { if (sx == null) return; a += (e.clientX - sx) * .6; sx = e.clientX; set(); };
    st.onpointerup = st.onpointercancel = () => { sx = null; };
    return box;
  }
  // 麻將牌（題目用，小張）
  const TS = { m: '萬', p: '筒', s: '條' }, HON = { E: '東', S: '南', W: '西', N: '北', C: '中', F: '發', P: '　' };
  const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function tile(t, cls = '') {
    if (HON[t]) return `<span class="k-tile hon ${t === 'C' ? 'red' : t === 'F' ? 'grn' : t === 'P' ? 'wht' : ''} ${cls}">${t === 'P' ? '<i></i>' : HON[t]}</span>`;
    const n = +t[0], s = t[1];
    if (s === 'm') return `<span class="k-tile t-man ${cls}"><b>${CN[n]}</b><em>萬</em></span>`;
    if (s === 'p') return `<span class="k-tile t-pin ${cls}">${pinSvg(n)}</span>`;
    return `<span class="k-tile t-sou ${cls}">${souSvg(n)}</span>`;
  }
  const PINPOS = { 1: [[20, 26]], 2: [[20, 14], [20, 38]], 3: [[10, 10], [20, 26], [30, 42]], 4: [[11, 14], [29, 14], [11, 38], [29, 38]], 5: [[11, 12], [29, 12], [20, 26], [11, 40], [29, 40]], 6: [[12, 10], [28, 10], [12, 26], [28, 26], [12, 42], [28, 42]], 7: [[9, 9], [20, 15], [31, 21], [12, 32], [28, 32], [12, 44], [28, 44]], 8: [[12, 8], [28, 8], [12, 20], [28, 20], [12, 32], [28, 32], [12, 44], [28, 44]], 9: [[9, 10], [20, 10], [31, 10], [9, 26], [20, 26], [31, 26], [9, 42], [20, 42], [31, 42]] };
  const pinSvg = (n) => `<svg viewBox="0 0 40 52">${PINPOS[n].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${n === 1 ? 12 : n < 5 ? 7.5 : 5.6}" fill="none" stroke="${n === 1 ? '#C9332B' : (n === 7 && i < 3) || (n !== 7 && n !== 1 && i % 2) ? '#C9332B' : '#1E6AA8'}" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="${n === 1 ? 4 : 2}" fill="${(i % 2) ? '#1E6AA8' : '#2BA670'}"/>`).join('')}</svg>`;
  const souSvg = (n) => {
    if (n === 1) return `<svg viewBox="0 0 40 52"><path d="M20 6 C30 14 30 26 20 30 C10 26 10 14 20 6Z" fill="#2BA670"/><path d="M12 30 L20 46 L28 30" fill="#C9332B"/><circle cx="20" cy="18" r="3" fill="#C9332B"/></svg>`;
    const P = { 2: [[20, 14], [20, 38]], 3: [[20, 12], [12, 38], [28, 38]], 4: [[12, 14], [28, 14], [12, 38], [28, 38]], 5: [[11, 14], [29, 14], [20, 26], [11, 38], [29, 38]], 6: [[10, 14], [20, 14], [30, 14], [10, 38], [20, 38], [30, 38]], 7: [[20, 9], [10, 26], [20, 26], [30, 26], [10, 43], [20, 43], [30, 43]], 8: [[9, 14], [17, 14], [23, 14], [31, 14], [9, 38], [17, 38], [23, 38], [31, 38]], 9: [[10, 9], [20, 9], [30, 9], [10, 26], [20, 26], [30, 26], [10, 43], [20, 43], [30, 43]] }[n];
    const lh = n >= 7 ? 13 : 20;
    return `<svg viewBox="0 0 40 52">${P.map(([x, y], i) => `<rect x="${x - 2.6}" y="${y - lh / 2}" width="5.2" height="${lh}" rx="2.6" fill="${(n === 5 || n === 7 || n === 9) && i === (n === 7 ? 0 : (n === 5 ? 2 : 4)) ? '#C9332B' : '#2BA670'}"/><path d="M${x - 2.6} ${y} h5.2" stroke="#fff" stroke-width="1"/>`).join('')}</svg>`;
  };
  const tiles = (codes, cls) => `<span class="k-tiles">${codes.map(t => tile(t, cls)).join('')}</span>`;
  const ALLT = [...'123456789'].map(n => n + 'm').concat([...'123456789'].map(n => n + 'p'), [...'123456789'].map(n => n + 's'), ['E', 'S', 'W', 'N', 'C', 'F', 'P']);
  function tilePick(el, ctx, o = {}) {
    const pool = o.pool || ALLT, sel = new Set(), box = h('div', 'k-tpick');
    box.innerHTML = pool.map(t => `<button type="button" data-t="${t}">${tile(t)}</button>`).join('');
    $$('button', box).forEach(b => b.onclick = () => { const t = b.dataset.t; if (!o.multi) sel.clear(), $$('button', box).forEach(x => x.classList.remove('on')); sel.has(t) ? sel.delete(t) : sel.add(t); b.classList.toggle('on', sel.has(t)); sfx('tile'); });
    el.append(box);
    const go = h('div', 'k-row', `<span class="muted small">${o.multi ? '可以選很多張' : '選一張'}</span><button type="button" class="btn gold sm">確定送出</button>`);
    $('button', go).onclick = () => { if (!sel.size) return; ctx.submit([...sel].sort((a, b) => ALLT.indexOf(a) - ALLT.indexOf(b)).join(',')); };
    el.append(go); return box;
  }
  // 撲克牌
  const SUIT = { S: '♠', H: '♥', D: '♦', C: '♣' };
  function card(c, cls = '') {
    if (c === 'JK') return `<span class="k-card jk ${cls}"><b>JOKER</b><i>🃏</i></span>`;
    const s = c.slice(-1), r = c.slice(0, -1), red = s === 'H' || s === 'D';
    return `<span class="k-card ${red ? 'red' : ''} ${cls}"><b>${r}</b><i>${SUIT[s]}</i></span>`;
  }
  const cards = (list, cls) => `<span class="k-cards">${list.map(c => card(c, cls)).join('')}</span>`;
  // 射氣球／套圈圈：移動目標，在對的時候按下去
  function aim(el, ctx, o) {
    const box = h('div', 'k-aim');
    box.innerHTML = `<canvas width="600" height="300"></canvas><div class="k-row"><span class="muted small k-aim-s">${o.info || ''}</span><button type="button" class="btn red sm">${o.btn || '發射！'}</button></div>`;
    el.append(box);
    const cv = $('canvas', box), g = cv.getContext('2d'), btn = $('button', box), info = $('.k-aim-s', box);
    let t0 = performance.now(), hits = 0, shots = 0, stop = false, flash = 0;
    const tg = o.targets;  // [{label, color, f(t)->{x,y}, r, good}]
    function frame(now) {
      if (stop || !document.body.contains(cv)) return;
      const t = (now - t0) / 1000; g.clearRect(0, 0, 600, 300);
      g.fillStyle = o.bg || '#2A2052'; g.fillRect(0, 0, 600, 300);
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect((i * 97) % 600, (i * 53) % 300, 2, 2); }
      tg.forEach(b => { if (b.dead) return; const p = b.f(t); b.p = p; g.beginPath(); g.fillStyle = b.color; g.arc(p.x, p.y, b.r, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#fff'; g.font = 'bold 15px Noto Sans TC'; g.textAlign = 'center'; g.fillText(b.label, p.x, p.y + 5); if (o.balloon) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.moveTo(p.x, p.y + b.r); g.lineTo(p.x, p.y + b.r + 26); g.stroke(); } });
      // 準星（固定在中央，或沿著 o.cross(t) 移動）
      const c = o.cross ? o.cross(t) : { x: 300, y: 150 };
      g.strokeStyle = flash > 0 ? '#FFD978' : '#FF6A5A'; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, 16, 0, 7); g.moveTo(c.x - 26, c.y); g.lineTo(c.x + 26, c.y); g.moveTo(c.x, c.y - 26); g.lineTo(c.x, c.y + 26); g.stroke();
      flash--; box._c = c; requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    btn.onclick = () => {
      const c = box._c; shots++; flash = 8; sfx('hit');
      const b = tg.find(b => !b.dead && b.p && Math.hypot(b.p.x - c.x, b.p.y - c.y) < b.r + 4);
      if (!b) { info.textContent = `沒打中（${shots} 發）`; return; }
      b.dead = true; sfx('pop');
      const r = o.onHit(b, hits, tg);
      if (r === 'fail') { stop = true; ctx.submit('__miss__'); return; }
      hits++; info.textContent = `打中「${b.label}」！`;
      if (r && r.done) { stop = true; ctx.submit(r.token); }
    };
    return box;
  }
  // 找字（直、橫、斜，八個方向都可以）：拖曳或點頭尾兩格
  function words(el, ctx, o) {
    const g = o.grid, R = g.length, C = g[0].length, box = h('div', 'k-ws'); box.style.gridTemplateColumns = `repeat(${C}, var(--wcell, 32px))`;
    let a = null; const found = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { const b = h('button', 'k-wc', g[i][j]); b.type = 'button'; b.dataset.i = i; b.dataset.j = j; box.append(b); }
    const cell = (i, j) => box.children[i * C + j];
    box.onclick = (e) => {
      const b = e.target.closest('.k-wc'); if (!b) return; const i = +b.dataset.i, j = +b.dataset.j;
      if (!a) { a = [i, j]; b.classList.add('sel'); return; }
      const [i0, j0] = a; cell(i0, j0).classList.remove('sel'); a = null;
      const di = Math.sign(i - i0), dj = Math.sign(j - j0), len = Math.max(Math.abs(i - i0), Math.abs(j - j0)) + 1;
      if (!(i === i0 || j === j0 || Math.abs(i - i0) === Math.abs(j - j0))) return;
      let s = '', cells = []; for (let k = 0; k < len; k++) { s += g[i0 + di * k][j0 + dj * k]; cells.push(cell(i0 + di * k, j0 + dj * k)); }
      if (o.accept(s, cells, found)) { cells.forEach(c => c.classList.add('hit')); found.push(s); sfx('good'); o.onFound && o.onFound(found, ctx); }
      else sfx('miss');
    };
    el.append(box); return box;
  }
  return { choice, seq, grid, digits, route, cyl, tile, tiles, tilePick, card, cards, aim, words, ALLT };
})();
