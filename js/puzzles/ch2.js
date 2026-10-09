'use strict';
// ===== 第二章：台北市立美術館（11 題） =====
// 劇情指定題 c2_painting 放最後：抽象畫裡藏著 △○□☆，依「下筆的順序」得到 3045。
document.head.insertAdjacentHTML('beforeend', `<style>
.c2-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 4px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 8px 0; }
.c2-dict span b { color: #C9332B; }
.c2-label { background: #fff; border: 1.5px solid #2A2230; border-radius: 4px; padding: 8px 12px; font-size: 14px; margin: 8px 0; box-shadow: 3px 3px 0 #2A2230; }
.c2-label h5 { margin: 0 0 4px; font-size: 15px; }
.c2-svgbtn { cursor: pointer; }
.c2-chat { background: #8CABD8; border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
.c2-chat .m { display: flex; flex-direction: column; align-items: flex-start; max-width: 92%; }
.c2-chat .m b { font-size: 11px; color: #1E2A48; }
.c2-chat .m p { margin: 0; background: #fff; border-radius: 4px 12px 12px 12px; padding: 5px 10px; line-height: 1.5; }
.c2-chat .m i { font-style: normal; font-size: 10px; color: #33456A; }
.c2-chat .m.del p { color: #8A8A8A; font-style: italic; background: #E8EEF6; }
.c2-chat .sys { align-self: center; font-size: 11px; background: rgba(0,0,0,.18); color: #fff; border-radius: 999px; padding: 1px 10px; }
.c2-lights { display: flex; gap: 8px; justify-content: center; margin: 8px 0; flex-wrap: wrap; }
.c2-lights button { border: 2.5px solid var(--ink); border-radius: 999px; padding: 8px 14px; font-weight: 900; background: #fff; }
.c2-lights button.on { color: #fff; }
.c2-sky .k-dc.out { background: transparent !important; border-color: transparent !important; }
.c2-sky .k-dc.out b { font-size: 12px; color: #8A3A10; font-family: var(--sans); }
.c2-ruler { touch-action: none; cursor: grab; }
</style>`);

const C2DICT = (words) => `<div class="c2-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// ---------- 1. 像素作品（數織） ----------
const C2_NONO = (() => {
  const pic = ['..######..', '.##....##.', '##..##..##', '#..####..#', '#..####..#', '#...##...#', '##......##', '.##....##.', '..##..##..', '...####...'];
  const cl = (l) => { const r = []; let c = 0; for (const x of l) { if (x === '#') c++; else if (c) { r.push(c); c = 0; } } if (c) r.push(c); return r.length ? r : [0]; };
  return { sol: pic.join('').replace(/#/g, '1').replace(/\./g, '0'), rows: pic.map(r => cl(r).join(' ')), cols: [...Array(10)].map((_, j) => cl(pic.map(r => r[j])).join(' ')) };
})();
P({
  id: 'c2_nono', ch: 2, t: '像素作品《早餐》', lv: 2, icon: '🍳', pos: [14, 24],
  body: () => `<p>一面白牆上只有一張 10×10 的空白方格，和一張說明：</p>
    <div class="c2-label"><h5>《早餐》　互動裝置，2026</h5>「每一列、每一行旁邊的數字，是那一條線上<b>連續塗黑的格子有幾格</b>（依照順序；不同段之間至少隔一格空白）。把它畫完，你就看得到我的早餐。」</div>
    <p class="note">俊治：「我剛剛說要把早餐吐在牆上，結果真的有人這樣做了。」</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const w = document.createElement('div'); w.style.cssText = '--cell:28px;text-align:center'; el.append(w);
    K.grid(w, ctx, { r: 10, c: 10, rowClue: C2_NONO.rows, colClue: C2_NONO.cols });
  },
  ui: 'none', ans: [C2_NONO.sol], solve: C2_NONO.sol, show: '一顆荷包蛋',
  hint: '從數字最大的那幾行下手（像 1 4 1、2 2 2），先確定一定會塗到的格子，再看兩邊不可能塗的地方。',
  ok: [['jz', '一顆荷包蛋。我的早餐比較好吃。'], ['by', '學長，這才是藝術。'], ['xy', '所以你那個不是。']],
});

// ---------- 2. 蒙德里安（越南語分卡＋上色） ----------
const C2_MOND = [[0, 0, 2, 3], [2, 0, 3, 1], [5, 0, 1, 2], [2, 1, 2, 2], [4, 1, 1, 2], [5, 2, 1, 2], [0, 3, 3, 3], [3, 3, 2, 1], [3, 4, 1, 2], [4, 4, 2, 2]];
P({
  id: 'c2_mondrian', ch: 2, t: '還沒上色的格子畫', lv: 2, icon: '🟥', pos: [36, 18],
  body: () => `<p>一幅只有黑線、還沒上色的「格子畫」。旁邊放著四張越南文的小卡——原來畫家是越南人。</p>
    <div class="c2-label"><h5>規則</h5>每一格只能塗<b>紅、黃、藍、白</b>其中一種。<b>共用一段邊</b>的兩格一定不同色（只碰到角不算）。</div>
    ${C2DICT([['ô', '格子'], ['lớn nhất', '最大的'], ['màu', '顏色'], ['đỏ', '紅'], ['vàng', '黃'], ['xanh', '藍'], ['trắng', '白'], ['chỉ có', '只有'], ['hai / bốn', '2 / 4'], ['góc', '角'], ['đều', '都'], ['không phải', '不是'], ['không có', '沒有'], ['các', '（複數）那些'], ['ở', '在'], ['chạm', '碰到'], ['cạnh', '邊'], ['trên', '上'], ['phải', '右']])}
    <p><b>點格子換顏色，全部塗好再送出。</b></p>`,
  split: ['“Ô lớn nhất màu đỏ.”', '“Chỉ có hai ô màu trắng.”', '“Các ô ở bốn góc đều không phải màu trắng.”', '“Các ô chạm cạnh trên không có màu xanh. Các ô chạm cạnh phải không có màu đỏ.”'],
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const COL = ['#FFFFFF', '#D8352A', '#F2C230', '#1F4FA0'], CODE = ['W', 'R', 'Y', 'B'], st = C2_MOND.map(() => -1), S = 56;
    const box = document.createElement('div'); el.append(box);
    const draw = () => {
      box.innerHTML = `<svg viewBox="-6 -6 ${6 * S + 12} ${6 * S + 12}" style="width:100%;max-width:380px;display:block;margin:0 auto">${C2_MOND.map(([x, y, w, h], k) => `<g class="c2-svgbtn" data-k="${k}"><rect x="${x * S}" y="${y * S}" width="${w * S}" height="${h * S}" fill="${st[k] < 0 ? '#F4F1EA' : COL[st[k]]}" stroke="#141414" stroke-width="7"/>${st[k] < 0 ? `<text x="${(x + w / 2) * S}" y="${(y + h / 2) * S + 6}" text-anchor="middle" font-size="16" fill="#B8B0A0">?</text>` : ''}</g>`).join('')}</svg>`;
      $$('g', box).forEach(g => g.onclick = () => { if (done) return; const k = +g.dataset.k; st[k] = (st[k] + 1) % 4; sfx('click'); draw(); });
    };
    draw(); if (done) return;
    const go = document.createElement('div'); go.className = 'k-row'; go.innerHTML = '<span class="muted small">每點一次：白 → 紅 → 黃 → 藍</span><button type="button" class="btn gold sm">確定送出</button>';
    $('button', go).onclick = () => { if (st.some(x => x < 0)) { toast('每一格都要塗色喔'); return; } ctx.submit(st.map(x => CODE[x]).join('')); };
    el.append(go);
  },
  ui: 'none', ans: ['YWYBRBRWBY'], solve: 'YWYBRBRWBY', show: '畫完了：黃白黃／藍紅藍／紅白藍黃',
  hint: '先翻譯四張卡。最大的格子是左下那塊；「四個角」是碰到畫框四個角的那四格。白色只有兩格，大部分的格子都要靠「相鄰不同色」推出來。',
  ok: [['zn', 'Đẹp như tranh thật!', '跟真的畫一樣漂亮！'], ['xy', '這我也畫得出來。'], ['by', '可是你剛剛畫了半小時。']],
});

// ---------- 3. 拼貼《誰說的》（旅行日誌） ----------
const C2_FRAG = [
  ['你不要自己騙自己', 'xy'], ['那你導個屁。', 'by'], ['我怎麼有種不祥的預感……', 'by'], ['那可以炒嗎？', 'jz'], ['先不要謝。', 'jz'], ['一個正常人。', 'xy'], ['這就是我們學弟。', 'xy'],
  ['如果是藝術家吐的呢？', 'xy'], ['藝術不一定有標準答案。', 'by'], ['你怎麼知道？', 'xy'], ['但感覺很重要。', 'xy'], ['我們負責提供氣氛。', 'by'], ['這是什麼？', 'zn'],
];
P({
  id: 'c2_collage', ch: 2, t: '拼貼《誰說的》', lv: 2, icon: '✂️', pos: [58, 22],
  body: () => {
    const C = { xy: '#2F7BC4', jz: '#1E1E24', by: '#2E9A5A', zn: '#E0507E' };
    const items = C2_FRAG.map(([t, c], i) => `<div style="display:inline-block;margin:4px;padding:5px 9px;background:${i % 3 ? '#FFFDF6' : '#F3EBDD'};transform:rotate(${((i * 37) % 9) - 4}deg);box-shadow:1px 2px 0 rgba(0,0,0,.2);font-weight:900;color:${C[c]};font-family:var(--serif)"><small style="color:#A08A70;font-weight:400">${i + 1}</small> ${t}</div>`).join('');
    return `<p>一幅拼貼畫：藝術家把一群觀光客這兩天說過的話剪下來，用不同顏色重新印出來貼在畫布上。</p>
    <div style="background:#D8CDB8;border:10px solid #3A2A1E;padding:8px;text-align:center;line-height:1.4">${items}</div>
    <div class="c2-label"><h5>《誰說的》　拼貼，2026</h5>顏色代表說話的人：<b style="color:#2F7BC4">藍＝小羽</b>、<b>黑＝俊治</b>、<b style="color:#2E9A5A">綠＝博育</b>、<b style="color:#E0507E">粉紅＝甄妮</b>（甄妮的話印的是中文翻譯）。<br>可是印刷廠把其中幾張的<b>顏色印錯了</b>。</div>
    <p class="note">📓 每一句話都在旅行日誌裡。</p>
    <p><b>哪幾張印錯了？把它們的號碼全部寫出來</b>（例如：1 5 9）。</p>`;
  },
  check: (v) => { const m = (String(v).normalize('NFKC').match(/\d+/g) || []).map(Number).sort((a, b) => a - b); return m.join(',') === '2,4,7,12'; },
  ans: ['2 4 7 12'], solve: '2 4 7 12', show: '2、4、7、12', ph: '號碼，用空白分開',
  hint: '一張一張去旅行日誌裡找原句，看是誰說的。手機訊息也算；甄妮說的話要看括號裡的翻譯。',
  ok: [['jz', '「那你導個屁」被印成博育說的？'], ['by', '我才不會講這種話。'], ['xy', '……還不會。']],
});

// ---------- 4. 錯覺室（拖曳尺＋排序） ----------
const C2_SEG = [['甲', 6, 1], ['乙', 7, -1], ['丙', 5.5, 1], ['丁', 6.5, -1], ['戊', 7.5, -1], ['己', 5, 1]];
P({
  id: 'c2_ruler', ch: 2, t: '錯覺室', lv: 1, icon: '📏', pos: [80, 20],
  body: () => `<p>錯覺室的牆上畫了六條線，每條線兩端都加了箭頭。旁邊掛著一把可以拿下來用的尺。</p>
    <div class="c2-label"><h5>《眼見為憑？》</h5>「把六條線從<b>最長排到最短</b>。只准相信尺，不准相信眼睛。」</div>
    <p class="note">拖曳那把尺去量（尺上一格是 0.5）。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const U = 30, X0 = [70, 120, 60, 95, 50, 140];
    let s = `<rect width="400" height="420" rx="12" fill="#F7F3EA"/>`;
    C2_SEG.forEach(([n, L, f], i) => {
      const y = 40 + i * 58, x1 = X0[i], x2 = x1 + L * U, a = 16 * f;
      s += `<text x="20" y="${y + 6}" font-size="18" font-weight="900" fill="#2A2230">${n}</text><g stroke="#2A2230" stroke-width="3" stroke-linecap="round" fill="none"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><path d="M${x1 - a} ${y - 13} L${x1} ${y} L${x1 - a} ${y + 13} M${x2 + a} ${y - 13} L${x2} ${y} L${x2 + a} ${y + 13}"/></g>`;
    });
    let r = `<rect x="0" y="0" width="${10 * U + 20}" height="34" rx="4" fill="#F2D27A" fill-opacity=".82" stroke="#8A6A10"/>`;
    for (let k = 0; k <= 20; k++) r += `<line x1="${10 + k * U / 2}" y1="0" x2="${10 + k * U / 2}" y2="${k % 2 ? 9 : 16}" stroke="#5A3A10" stroke-width="1.5"/>${k % 2 ? '' : `<text x="${10 + k * U / 2}" y="28" text-anchor="middle" font-size="10" fill="#5A3A10">${k / 2}</text>`}`;
    const box = document.createElement('div'); box.innerHTML = `<svg viewBox="0 0 400 420" style="width:100%;display:block;touch-action:none">${s}<g class="c2-ruler" transform="translate(40 372)">${r}</g></svg>`; el.append(box);
    const svg = $('svg', box), ru = $('.c2-ruler', box); let pos = { x: 40, y: 372 }, drag = null;
    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    ru.onpointerdown = (e) => { const p = pt(e); drag = { dx: p.x - pos.x, dy: p.y - pos.y }; ru.setPointerCapture(e.pointerId); };
    ru.onpointermove = (e) => { if (!drag) return; const p = pt(e); pos = { x: Math.max(-300, Math.min(390, p.x - drag.dx)), y: Math.max(0, Math.min(390, p.y - drag.dy)) }; ru.setAttribute('transform', `translate(${pos.x} ${pos.y})`); };
    ru.onpointerup = ru.onpointercancel = () => { drag = null; };
    if (!done) K.seq(el, ctx, C2_SEG.map(([n]) => ({ t: n, v: n })), { len: 6 });
  },
  ui: 'none', ans: ['戊-乙-丁-甲-丙-己'], solve: '戊-乙-丁-甲-丙-己', show: '戊 > 乙 > 丁 > 甲 > 丙 > 己',
  hint: '只量中間那條直線，從一端的尖點量到另一端的尖點，不要把向外張開的箭頭算進去。',
  ok: [['xy', '箭頭往外的看起來比較長，騙人。'], ['jz', '就跟我的身高一樣。'], ['by', '學長你是穿增高鞋墊。']],
});

// ---------- 5. 動力雕塑（齒輪） ----------
const C2_GEAR = (cx, cy, teeth, k, col, rot = 0) => {
  const r = teeth * k, ro = r + 5, ri = r - 5; let d = '';
  for (let i = 0; i < teeth; i++) { const a = (i / teeth) * Math.PI * 2 + rot, w = Math.PI / teeth; const pts = [[ri, a - w * .55], [ro, a - w * .3], [ro, a + w * .3], [ri, a + w * .55]]; pts.forEach(([rr, aa], j) => d += `${i === 0 && j === 0 ? 'M' : 'L'}${(cx + rr * Math.cos(aa)).toFixed(1)} ${(cy + rr * Math.sin(aa)).toFixed(1)} `); }
  return `<path d="${d}Z" fill="${col}" stroke="#2A2230" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${Math.max(6, r * .18)}" fill="#F7F3EA" stroke="#2A2230" stroke-width="1.5"/>`;
};
const C2_GEARS = (() => {
  const k = 3.2, A = [58, 214], B = [173, 214], C = [213, 145], D = [325, 145];
  const sym = ['★', '●', '▲', '■', '◆', '♥', '♣', '☾'];
  let s = `<rect width="420" height="300" rx="12" fill="#ECE8E0"/>`;
  s += C2_GEAR(...B, 24, k, '#9AB8D8') + C2_GEAR(...A, 12, k, '#E8A26A') + C2_GEAR(...B, 10, k, '#3E6A9E', .1) + C2_GEAR(...C, 15, k, '#7AB88A', .2) + C2_GEAR(...D, 20, k, '#D8C060');
  const lab = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="900" fill="#2A2230" stroke="#fff" stroke-width="3" paint-order="stroke">${t}</text>`;
  s += lab(A[0], A[1] + 4, 'A 12齒') + lab(B[0] + 52, B[1] + 52, 'B 24齒') + lab(B[0], B[1] + 4, "B' 10齒") + lab(C[0], C[1] + 4, 'C 15齒') + lab(D[0], D[1] + 92, 'D 20齒');
  // D 上的指針與錶盤
  sym.forEach((t, i) => { const a = -Math.PI / 2 + i * Math.PI / 4; s += `<text x="${D[0] + 46 * Math.cos(a)}" y="${D[1] + 46 * Math.sin(a) + 6}" text-anchor="middle" font-size="16" fill="#2A2230">${t}</text>`; });
  s += `<line x1="${D[0]}" y1="${D[1]}" x2="${D[0]}" y2="${D[1] - 32}" stroke="#C9332B" stroke-width="5" stroke-linecap="round"/><circle cx="${D[0]}" cy="${D[1]}" r="6" fill="#C9332B"/>`;
  s += `<path d="M${A[0] - 30} ${A[1] - 50} A 40 40 0 0 1 ${A[0] + 32} ${A[1] - 48}" stroke="#C9332B" stroke-width="3" fill="none" marker-end="url(#c2ar)"/><text x="${A[0]}" y="${A[1] - 62}" text-anchor="middle" font-size="12" font-weight="900" fill="#C9332B">搖把</text>`;
  return `<svg viewBox="0 0 420 300" style="width:100%;display:block"><defs><marker id="c2ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#C9332B"/></marker></defs>${s}</svg>`;
})();
P({
  id: 'c2_gears', ch: 2, t: '動力雕塑', lv: 2, icon: '⚙️', pos: [20, 48],
  body: () => `<p>一座用齒輪做的動力雕塑。牌子上寫：「請勿觸摸。想知道會發生什麼，請用腦袋轉。」</p>${C2_GEARS}
    <div class="c2-label"><h5>《轉》　動力雕塑</h5>A 咬著 B。<b>B 和 B' 鎖在同一根軸上</b>（B' 疊在 B 前面，一起轉）。B' 咬著 C，C 咬著 D。指針固定在 D 上，現在指著 ★。<br>把搖把 A <b>順時針轉 5 圈</b>。</div>
    <p><b>轉完以後，指針指著哪一個符號？</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.choice(el, ctx, ['★', '●', '▲', '■', '◆', '♥', '♣', '☾'].map(t => ({ t, v: t })), { cols: 4 }); },
  ui: 'none', ans: ['♣'], solve: '♣', show: '♣（逆時針轉了一又四分之一圈）',
  hint: '咬在一起的齒輪：轉過的「齒數」一樣、方向相反。同一根軸上的兩個齒輪：轉過的「圈數」一樣、方向也一樣。',
  ok: [['by', '轉一又四分之一圈，逆時針。'], ['jz', '我只看懂它在轉。'], ['xy', '神人。']],
});

// ---------- 6. 點與線（摩斯密碼＋越南語） ----------
const C2_MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
const C2_DOTS = (() => {
  const words = ['BAY', 'HAI', 'TAM', 'BON'], pal = ['#D8352A', '#1F4FA0', '#F2C230', '#2A2230', '#2E9A5A'];
  let s = `<rect width="420" height="250" fill="#F6F1E6"/>`, ci = 0;
  words.forEach((w, r) => {
    let x = 24; const y = 42 + r * 56;
    [...w].forEach((ch) => { for (const m of C2_MORSE[ch]) { const c = pal[ci++ % pal.length]; if (m === '.') { s += `<circle cx="${x + 6}" cy="${y}" r="7" fill="${c}"/>`; x += 22; } else { s += `<rect x="${x}" y="${y - 6}" width="30" height="12" rx="3" fill="${c}"/>`; x += 40; } } x += 40; });
  });
  return `<svg viewBox="0 0 420 250" style="width:100%;display:block;border:8px solid #2A2230">${s}</svg>`;
})();
P({
  id: 'c2_morse', ch: 2, t: '點與線', lv: 1, icon: '➖', pos: [42, 44],
  body: () => `<p>一幅很像小朋友亂點的畫，只有圓點和短棒，排成四行。</p>${C2_DOTS}
    <div class="c2-label"><h5>《點與線》　甄妮的同鄉藝術家，2025</h5>「我用故鄉的語言，在畫裡藏了四個數字。」</div>
    <div class="paper" style="font-size:13px">📡 摩斯電碼（● 短、▬ 長）：${Object.entries(C2_MORSE).map(([k, v]) => `<span style="white-space:nowrap;display:inline-block;margin-right:10px"><b>${k}</b> ${v.replace(/\./g, '●').replace(/-/g, '▬')}</span>`).join('')}</div>
    ${C2DICT([['một', '1'], ['hai', '2'], ['ba', '3'], ['bốn', '4'], ['năm', '5'], ['sáu', '6'], ['bảy', '7'], ['tám', '8'], ['chín', '9']])}
    <p class="note">摩斯電碼沒有越南文的聲調符號。</p><p><b>四個數字依序是？</b></p>`,
  ans: ['7284'], solve: '7284', num: true, ph: '四位數',
  hint: '每一行是一個字，字母和字母之間有比較寬的空隙。先翻成英文字母，再對照甄妮的小抄。',
  ok: [['zn', 'Bảy, hai, tám, bốn!', '七、二、八、四！'], ['xy', '她唸起來像在唱歌。'], ['jz', '我唸起來像在罵人。']],
});

// ---------- 7. 拍賣會（分卡） ----------
P({
  id: 'c2_auction', ch: 2, t: '一元起標', lv: 1, icon: '🔨', pos: [64, 46],
  body: () => `<p>美術館的慈善拍賣會：一幅叫《這也是藝術》的畫（看起來就是一張衛生紙）。四個人都偷偷寫了價錢投進箱子裡。</p>
    <div class="c2-label"><h5>拍賣規則（密封競標）</h5>每人只能出一個價。出價<b>最高</b>的人得標，但他只要付<b>第二高</b>的那個價錢。</div>
    <p class="note">每個人的出價線索在你們的線索卡上。</p>
    <p><b>誰得標？他要付多少錢？</b>（例如：小羽 300）</p>`,
  split: ['小羽：「我出的比博育多 150 元。」', '博育：「我出的剛好是俊治的一半。」', `甄妮的出價單（越南文）：<b>bốn trăm năm mươi</b> Đài tệ<br><span class="small muted">bốn 4・năm 5・trăm 百・mươi 十（二十以上）・Đài tệ 新台幣</span>`, '俊治：「我們四個人的出價加起來，剛好 2000 元。」'],
  check: (v) => { const s = String(v).normalize('NFKC'), m = s.match(/\d+/g) || []; return s.includes('俊治') && m.length === 1 && +m[0] === 500; },
  ans: ['俊治 500'], solve: '俊治 500', show: '俊治得標，付 500 元', ph: '名字 金額',
  hint: '把四句話寫成算式，先求出博育的出價。最後別忘了得標的人付的不是自己出的價。',
  ok: [['jz', '我花五百買了一張衛生紙。'], ['xy', '是藝術。'], ['by', '是做善事。']],
});

// ---------- 8. 館員群組（聊天紀錄推理） ----------
P({
  id: 'c2_chat', ch: 2, t: '鑰匙在誰手上', lv: 1, icon: '🔑', pos: [86, 46],
  body: () => {
    const M = (n, t, tm, cls = '') => `<div class="m ${cls}"><b>${n}</b><p>${t}</p><i>${tm}</i></div>`;
    return `<p>抽象畫的畫框鎖著。博育去服務台問，館員給他看了工作群組的對話：</p>
    <div class="c2-chat"><span class="sys">北美館展務組（8）</span>
      ${M('阿凱', '畫框鑰匙我先拿去 3F 換燈。', '09:02')}${M('小真', '阿凱，你換完給我，我要去 2F 補展籤。', '09:40')}
      ${M('阿凱', '好，我放在 2F 服務台了。', '10:15')}${M('阿凱', '此訊息已收回', '10:16', 'del')}${M('阿凱', '打錯，是 1F 服務台。2F 那句不算。', '10:17')}
      ${M('小真', '拿到了。', '10:30')}${M('主任', '小真，鑰匙等一下交給志工美華，她下午要帶導覽。', '11:05')}
      ${M('小真', '收到。不過王姐要開儲藏室，我先借她。', '11:20')}${M('王姐', '用完了～我交給美華了喔！', '11:50')}
      ${M('美華', '？？我沒有拿到啊', '12:10')}${M('王姐', '啊，我給的是那位長頭髮、戴眼鏡的妹妹', '12:12')}
      ${M('小真', '長頭髮戴眼鏡的是 Linh 吧，越南來的實習生', '12:13')}${M('Linh', 'Vâng, chìa khóa ở chỗ tôi. Nhưng lúc 12 giờ tôi đã đưa cho anh bảo vệ rồi.', '12:20')}
      ${M('主任', '今天早班保全是阿德，11:30 交班給阿明。', '12:22')}</div>
    ${C2DICT([['vâng', '是的'], ['chìa khóa', '鑰匙'], ['ở chỗ tôi', '在我這裡'], ['nhưng', '但是'], ['lúc … giờ', '在…點'], ['đã … rồi', '已經'], ['đưa cho', '交給'], ['anh', '（稱呼男生）'], ['bảo vệ', '保全']])}
    <p><b>現在鑰匙在誰手上？</b></p>`;
  },
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.choice(el, ctx, ['阿凱', '小真', '主任', '王姐', '美華', 'Linh', '阿德', '阿明'].map(t => ({ t, v: t })), { cols: 4 }); },
  ui: 'none', ans: ['阿明'], solve: '阿明', show: '保全阿明',
  hint: '一棒一棒跟著鑰匙走。Linh 那句越南話說了一個時間，再對照主任說的交班時間。',
  ok: [['by', '找到阿明了，他說等我們把畫框的密碼解開就幫我們開。'], ['xy', '所以還是要解。'], ['jz', '完全法克。']],
});

// ---------- 9. 柱林（摩天樓，越南語提示）——夢魘 ----------
const C2_SKY = (() => {
  const sol = ['162453', '625341', '354612', '541236', '436125', '213564'];
  const T = [0, 1, 0, 0, 0, 2], B = [4, 5, 0, 0, 1, 3], L = [0, 0, 3, 0, 0, 0], R = [0, 4, 2, 0, 0, 0];
  const giv = { '2,4': 3, '3,3': 4 };  // 外框座標（含提示列）
  const W = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu'];
  const given = {}; let solve = '';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const k = `${i},${j}`, inner = i > 0 && i < 7 && j > 0 && j < 7;
    if (!inner) { const v = i === 0 && inner === false && j > 0 && j < 7 ? T[j - 1] : i === 7 && j > 0 && j < 7 ? B[j - 1] : j === 0 && i > 0 && i < 7 ? L[i - 1] : j === 7 && i > 0 && i < 7 ? R[i - 1] : 0; given[k] = W[v]; solve += W[v]; }
    else if (giv[k]) { given[k] = giv[k]; solve += giv[k]; }
    else solve += sol[i - 1][j - 1];
  }
  return { given, solve };
})();
P({
  id: 'c2_pillars', ch: 2, t: '夢魘・柱林', lv: 3, icon: '🏛️', pos: [16, 74],
  body: () => `<p>中庭有一件裝置藝術《柱林》：6×6 共 36 根白色柱子，高度分別是 1～6 公尺。可是燈光太暗，只看得出兩根柱子的高度。</p>
    <div class="c2-label"><h5>《柱林》　裝置，2026</h5>① 每一橫排、每一直排，1～6 公尺的柱子各有一根。<br>② 外圍的越南字，是站在那個位置往裡面看，<b>看得到幾根柱子</b>（高的柱子會擋住它後面比較矮的）。<br>例：從左邊看 2-5-1-6-3-4 這一排，看得到 2、5、6，共 3 根。</div>
    ${C2DICT([['một', '1'], ['hai', '2'], ['ba', '3'], ['bốn', '4'], ['năm', '5'], ['sáu', '6']])}
    <p><b>把每根柱子的高度填進去。</b></p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    if (done) { el.insertAdjacentHTML('beforeend', '<p class="muted">（柱林的高度已經全部量好了）</p>'); return; }
    const box = document.createElement('div'); box.className = 'c2-sky'; box.style.cssText = '--dcell:40px;text-align:center'; el.append(box);
    const wrap = K.digits(box, ctx, { r: 8, c: 8, max: 6, given: C2_SKY.given, cage: (i, j) => (i > 0 && i < 7 && j > 0 && j < 7) ? { bg: '#FBF8F2' } : null });
    [...wrap.children].forEach((c, k) => { const i = k / 8 | 0, j = k % 8; if (!(i > 0 && i < 7 && j > 0 && j < 7)) c.classList.add('out'); });
    wrap.style.borderColor = 'transparent';
  },
  ui: 'none', ans: [C2_SKY.solve], solve: C2_SKY.solve, show: '柱林的高度全部量好了',
  hint: '「看得到 1 根」代表第一根就是 6 公尺；「看得到 6 根」代表從 1 排到 6。先處理 năm、bốn 這種大數字，再用兩根已知的柱子和每排不重複去推。',
  ok: [['by', '……我量了二十分鐘。', null], ['xy', '神人學弟。'], ['zn', 'Giỏi quá!', '太厲害了！']],
});

// ---------- 10. 三原色光（互動燈光） ----------
const C2_LIGHT = (() => {
  // 每一格：[框的顏色(光的位元), [[數字, 墨水位元], …]]  位元：紅4 綠2 藍1
  const slots = [[4, [['6', 2], ['8', 4], ['0', 5]]], [6, [['1', 1], ['3', 6], ['5', 6]]], [3, [['4', 4], ['9', 3], ['2', 3]]], [5, [['7', 2], ['0', 5], ['8', 5]]]];
  const rgb = (b) => `rgb(${b & 4 ? 255 : 0},${b & 2 ? 255 : 0},${b & 1 ? 255 : 0})`;
  const frame = { 4: '#E8302A', 6: '#F2D200', 3: '#00C8D8', 5: '#D030C0' };
  return (L) => `<svg viewBox="0 0 420 170" style="width:100%;display:block;border-radius:10px"><rect width="420" height="170" fill="${rgb(L)}"/>${slots.map(([f, ds], i) => `<g transform="translate(${18 + i * 100} 20)"><rect width="84" height="120" rx="6" fill="none" stroke="${frame[f]}" stroke-width="7"/>${ds.filter(([, ink]) => (ink & L) !== L).map(([d, ink]) => `<text x="42" y="98" text-anchor="middle" font-size="92" font-weight="900" font-family="Arial,sans-serif" fill="${rgb(ink & L)}">${d}</text>`).join('')}</g>`).join('')}${L ? '' : '<text x="210" y="160" text-anchor="middle" font-size="12" fill="#555">（燈都關了）</text>'}</svg>`;
})();
P({
  id: 'c2_lights', ch: 2, t: '三盞燈', lv: 1, icon: '💡', pos: [38, 72],
  body: () => `<p>暗房裡有一面白牆，牆上用彩色墨水把好幾個數字疊在一起畫，四個數字框的顏色都不一樣。天花板上有<b>紅、綠、藍</b>三盞燈可以開關。</p>
    <div class="c2-label"><h5>《顯影》</h5>「每一格裡，只有一個數字是真的。它只在<b>和框同顏色的光</b>下面才會現形。」</div>
    <div class="c2-light"></div>
    <p><b>四個真的數字依序是？</b></p>`,
  build(el, ctx) {
    el.innerHTML = this.body(ctx);
    let L = 0; const box = $('.c2-light', el);
    const draw = () => { box.innerHTML = C2_LIGHT(L) + `<div class="c2-lights">${[['紅燈', 4, '#D8352A'], ['綠燈', 2, '#2E9A3A'], ['藍燈', 1, '#1F4FA0']].map(([t, b, c]) => `<button type="button" data-b="${b}" class="${L & b ? 'on' : ''}" style="${L & b ? `background:${c};border-color:${c}` : ''}">${t}${L & b ? ' ON' : ' OFF'}</button>`).join('')}</div>`;
      $$('button', box).forEach(b => b.onclick = () => { L ^= +b.dataset.b; sfx('click'); draw(); }); };
    draw();
  },
  ans: ['6147'], solve: '6147', num: true, ph: '四位數',
  hint: '光的顏色是用「加」的：紅＋綠會變成什麼顏色？試著只開兩盞燈。',
  ok: [['xy', '紅加綠是黃？跟美術課教的不一樣。'], ['by', '那是顏料，這是光。'], ['jz', '我國中美術是睡過去的。']],
});

// ---------- 11. 劇情指定：抽象畫的密碼 ----------
const C2_PAINT = (() => {
  const star = (cx, cy, R, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`; } return d + 'Z'; };
  // 依照下筆順序（SVG 先畫的在下面）
  return `<svg viewBox="0 0 420 300" style="width:100%;display:block;border:12px solid #1E1A18;box-shadow:0 0 0 3px #B89A5A">
    <rect width="420" height="300" fill="#EFE7D6"/>
    <ellipse cx="300" cy="230" rx="140" ry="60" fill="#D9C08A"/>
    <rect x="12" y="20" width="150" height="70" fill="#9BB7C9" transform="rotate(-8 87 55)"/>
    <path d="M316 34 L396 196 L236 196 Z" fill="#2F5FA8"/>
    <path d="M150 230 Q210 120 330 150" stroke="#2A2230" stroke-width="6" fill="none"/>
    <path d="M28 150 L120 128 L136 210 L40 236 Z" fill="#C97A5A"/>
    <ellipse cx="340" cy="250" rx="58" ry="28" fill="#E86A3A"/>
    <circle cx="246" cy="196" r="54" fill="#D8352A"/>
    <rect x="300" y="78" width="96" height="42" fill="#F2C230" transform="rotate(12 348 99)"/>
    <ellipse cx="96" cy="60" rx="44" ry="26" fill="#3E8A5A"/>
    <path d="M60 270 Q160 250 260 284" stroke="#1F4FA0" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="148" y="128" width="84" height="84" fill="#F2C230"/>
    <path d="M196 30 L232 44 L226 84 L188 92 L174 58 Z" fill="#8A5AB0"/>
    <rect x="252" y="252" width="110" height="34" fill="#2A2230" transform="rotate(-6 307 269)"/>
    <path d="${star(150, 132, 34, 14)}" fill="#1E1A18"/>
    <path d="M20 108 h100" stroke="#F7F3EA" stroke-width="5"/>
  </svg>`;
})();
P({
  id: 'c2_painting', ch: 2, t: '抽象畫的密碼', lv: 2, icon: '🖼️', pos: [62, 74],
  need: ['c2_nono', 'c2_collage', 'c2_chat', 'c2_lights'],
  body: () => `<p>保全阿明來了，可是畫框上還有一個<b>四位數的密碼鎖</b>。牆上是一幅看起來只是亂畫的抽象畫：</p>${C2_PAINT}
    <div class="c2-label"><h5>《數》　壓克力顏料、畫布</h5>「這幅畫裡藏著一個<b>三角形</b>、一個<b>圓形</b>、一個<b>正方形</b>、一顆<b>星星</b>，其他的都只是長得像而已。<br>三角指向上，是 3。圓形代表零。正方形代表四。星星代表五。<br>我從最底下那一層開始畫，一層一層疊上去。<b>我先畫的，就先唸。</b>」</div>
    <p class="note">小羽：「所以這幅畫是在算數學？」 俊治：「這我也畫得出來。」</p>`,
  ans: ['3045', '3-0-4-5'], solve: '3045', num: true, ph: '四位數',
  hint: '先找出真正的四個形狀（橢圓不是圓、長方形不是正方形）。再看它們互相蓋住的地方：被蓋住的那個比較早畫。',
  item: 'ticket',
  ok: [['by', '三、零、四、五……畫框打開了！裡面夾著一張紅色車票。'], ['jz', '藝術就是密碼。'], ['xy', '神人。'], ['zn', 'Nghệ thuật khó quá!', '藝術好難！']],
});
