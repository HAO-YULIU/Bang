'use strict';
// ===== 第一章：國立故宮博物院（11 題） =====
// 劇情指定題 c1_order 放最後：用前面三題得到的「方向」，在真偽對照特展廳找出真品的順序。
document.head.insertAdjacentHTML('beforeend', `<style>
.c1-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 4px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 8px 0; }
.c1-dict span b { color: #C9332B; }
.c1-label { background: #2E3A33; color: #EADFC4; border-radius: 8px; padding: 8px 12px; font-size: 14px; margin: 8px 0; border-left: 5px solid #B89A5A; }
.c1-label b { color: #FFE2A0; }
.c1-sms { background: #EAF3FF; border-radius: 14px 14px 14px 4px; padding: 10px 12px; font-size: 15px; color: #1E3A68; max-width: 420px; margin: 8px 0; }
.c1-sms small { display: block; color: #6A80A0; font-size: 11px; }
.c1-gift .k-cell { font-size: 12px; line-height: 1.25; padding: 2px; height: 70px; }
.c1-gift .k-cell.on { background: #2E6B4E; border-color: #2E6B4E; }
.c1-views { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
.c1-stamps { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; }
.c1-bi { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.c1-bi button { border: 2.5px solid var(--ink); background: #fff; border-radius: 12px; padding: 4px; }
.c1-bi button b { display: block; font-size: 17px; margin-top: 2px; }
.c1-bi button.set b { color: #1E7A4A; }
.c1-dk .k-dc input { color: #1E5AA8; }
</style>`);

const C1DICT = (words) => `<div class="c1-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// ---------- 1. 找字盤（旅行日誌） ----------
P({
  id: 'c1_ws', ch: 1, t: '展品名牌找字', lv: 1, icon: '🔎', pos: [14, 24],
  body: () => `<p>入口的互動螢幕上是一個找字遊戲：「把下面九件故宮名品的名字全部找出來（直、橫、斜，正反都可以）。」</p>
    <p class="paper" style="font-size:14px">清明上河圖・翠玉白菜・象牙套球・肉形石・毛公鼎・散氏盤・多寶格・宗周鐘・汝窯</p>
    <div class="c1-wsbox"></div>
    <p>找完以後，<b>沒有被用到的字</b>由上而下、由左而右連起來，是有人在這趟旅程中問過的一個問題。</p>
    <p><b>旅行日誌裡，有人回答「可以」之後，下一個說話的人說了什麼？</b></p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const W = ['清明上河圖', '翠玉白菜', '象牙套球', '肉形石', '毛公鼎', '散氏盤', '多寶格', '宗周鐘', '汝窯'];
    const box = K.words($('.c1-wsbox', el), ctx, {
      grid: ['清象牙套球肉', '白明菜毛可形', '翠以上散公石', '玉窯氏河鐘鼎', '白盤汝周圖炒', '菜嗎宗多寶格'],
      accept: (s, cells, found) => { const r = [...s].reverse().join(''); const w = W.includes(s) ? s : W.includes(r) ? r : null; return !!w && !found.includes(s) && !found.includes(r); },
      onFound: (found) => { if (found.length === W.length) $$('.k-wc', box).forEach(b => { if (!b.classList.contains('hit')) b.style.background = '#FFE2A0'; }); },
    });
  },
  ans: ['你不要亂教', '你不要亂教。', '不要亂教'], solve: '你不要亂教', show: '你不要亂教。',
  hint: '剩下的六個字是小羽問的問題。打開旅行日誌，找到那句話，往下看是誰回答「可以」、接著又是誰說了什麼。',
  ok: [['by', '……這句話被做成謎題了。'], ['jz', '代表我教得很好。'], ['xy', '神人。']],
});

// ---------- 2. 多寶格（殺手數獨） ----------
const C1_KILLER = (() => {
  const sol = '312654654123531246426531263415145362';
  const cages = [[[11, 10], 5], [[13, 19, 25, 7], 16], [[12, 18], 9], [[6, 0, 1, 2], 12], [[5, 4], 9], [[17, 16, 15], 12], [[29, 23], 6], [[26, 20, 27, 28], 14], [[8, 14], 5], [[35, 34, 33], 11], [[21, 22], 8], [[30, 24, 31, 32], 12], [[9, 3], 7]];
  const of = Array(36); cages.forEach(([c], k) => c.forEach(x => of[x] = k));
  // 給籠子上色（相鄰的籠子不同色）
  const pal = ['#F6E3C0', '#D9EDE0', '#E6DDF3', '#FBD9D3', '#DDE9F6'], col = [];
  cages.forEach(([c], k) => {
    const nb = new Set(); c.forEach(x => { const i = x / 6 | 0, j = x % 6;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const p = i + a, q = j + b; if (p >= 0 && p < 6 && q >= 0 && q < 6 && of[p * 6 + q] !== k) nb.add(of[p * 6 + q]); }); });
    col[k] = pal.findIndex((_, t) => ![...nb].some(n => col[n] === t));
  });
  return { sol, cages, of, col, pal };
})();
P({
  id: 'c1_duobao', ch: 1, t: '乾隆的多寶格', lv: 2, icon: '🗃️', pos: [36, 18],
  body: () => `<p>「多寶格」是乾隆皇帝的百寶箱：一個小木盒裡隔出許多大大小小的格子，每格放一件小寶物。展櫃旁的解說牌出了一道題：</p>
    <div class="paper" style="font-size:14px">① 每一<b>列</b>、每一<b>行</b>、每一個<b>粗框（2×3）</b>裡，1～6 各出現一次。<br>② 同一種顏色連在一起的是一個「小格」，左上角的數字是格子裡所有數字的<b>總和</b>；同一個小格裡的數字不會重複。</div>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const { cages, of, col, pal } = C1_KILLER;
    const box = document.createElement('div'); box.className = 'c1-dk'; box.style.cssText = '--dcell:46px;text-align:center'; el.append(box);
    if (done) { box.innerHTML = '<p class="muted">（多寶格已經全部填好了）</p>'; return; }
    K.digits(box, ctx, {
      r: 6, c: 6, max: 6,
      cage: (i, j) => { const k = of[i * 6 + j], first = Math.min(...cages[k][0]); return { bg: pal[col[k]], label: first === i * 6 + j ? String(cages[k][1]) : '' }; },
      border: (i, j) => {
        const k = of[i * 6 + j], s = {};
        const side = (p, q) => p < 0 || p > 5 || q < 0 || q > 5 ? null : of[p * 6 + q] !== k;
        if (j === 2) s.borderRight = '3px solid #2A2230'; else if (side(i, j + 1)) s.borderRight = '1.5px dashed #8A6A40';
        if (i === 1 || i === 3) s.borderBottom = '3px solid #2A2230'; else if (side(i + 1, j)) s.borderBottom = '1.5px dashed #8A6A40';
        return s;
      },
    });
  },
  ui: 'none', ans: [C1_KILLER.sol], solve: C1_KILLER.sol, show: '多寶格填好了',
  hint: '先找只有一種拆法的小格（例如兩格加起來是 5 或 9），再配合 2×3 粗框裡 1～6 的總和是 21 去推。',
  ok: [['zn', 'Hoàng đế cũng chơi Sudoku à?', '皇帝也玩數獨嗎？'], ['xy', '乾隆是神人。'], ['jz', '他還在每幅畫上蓋章，根本是古代網紅。']],
});

// ---------- 3. 毛公鼎的陶範（反字＋閱讀方向） ----------
const C1_MOLD = (() => {
  const cols = ['毛公告吾子入', '廳勿急先向西', '北行遇第一櫃', '即止白菜在焉', '此後聽玉指路'];
  // 陶範上的字是反的：第 1 行在最左邊，每個字左右相反
  let s = `<rect width="330" height="300" rx="18" fill="#9C5E38"/><rect x="10" y="10" width="310" height="280" rx="12" fill="#B9774A" stroke="#7A4628" stroke-width="3"/>`;
  for (let i = 0; i < 18; i++) s += `<circle cx="${(i * 71) % 300 + 15}" cy="${(i * 47) % 270 + 15}" r="${1 + i % 3}" fill="#8A4E2E" opacity=".5"/>`;
  cols.forEach((c, k) => [...c].forEach((ch, r) => {
    s += `<text transform="translate(${45 + k * 60} ${50 + r * 44}) scale(-1 1)" text-anchor="middle" font-size="34" font-family="serif" font-weight="900" fill="#4A2412" stroke="#E0A070" stroke-width=".6">${ch}</text>`;
  }));
  return `<svg viewBox="0 0 330 300" style="width:100%;max-width:420px;display:block;margin:0 auto">${s}</svg>`;
})();
P({
  id: 'c1_maogong', ch: 1, t: '毛公鼎的陶範', lv: 2, icon: '🏺', pos: [58, 22],
  body: () => `<p>毛公鼎旁邊展示著一塊「陶範」——古人鑄青銅器之前，先把字刻在泥做的模子上，再把銅水倒進去。</p>
    ${C1_MOLD}
    <div class="c1-label">解說牌：鼎上的銘文，和一般古書一樣是<b>直行</b>書寫——一行由上而下，讀完一行再換下一行，<b>第一行在最右邊</b>。<br>陶範是「模子」，所以它上面的東西和鼎上的成品……</div>
    <p><b>毛公要你們進了展廳以後，先往哪個方向走？</b></p>`,
  ans: ['西北', '西北方', '往西北', '向西北', '西北邊', '西北方向'], solve: '西北', ph: '方位',
  hint: '模子跟蓋印章一樣，字是反的。那「第一行在最右邊」這件事，在模子上會變成在哪一邊？',
  ok: [['by', '原來要從另一邊開始讀。'], ['xy', '毛公講話好老派。'], ['jz', '他三千年前就在出謎題了，完全是前輩。']],
});

// ---------- 4. 翠玉白菜上的螽斯（越南語指南針） ----------
const C1_BUG = (x, y, ang, ant, c) => `<g transform="translate(${x} ${y}) rotate(${ang})">
  <g stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round">
    <path d="M2 0 L-4 10 M2 0 L-4 -10 M6 0 L12 9 M6 0 L12 -9"/>
    <path d="M-6 3 L-18 16 L-30 14 M-6 -3 L-18 -16 L-30 -14" stroke-width="2.6"/>
    <path d="M14 2 Q${14 + ant * .5} ${6 + ant * .15} ${14 + ant} ${10 + ant * .1} M14 -2 Q${14 + ant * .5} ${-6 - ant * .15} ${14 + ant} ${-10 - ant * .1}" stroke-width="1.4"/></g>
  <ellipse cx="-12" cy="0" rx="15" ry="5.5" fill="${c}" stroke="#FFF3B0" stroke-width="1.2"/><ellipse cx="4" cy="0" rx="6" ry="5" fill="${c}" stroke="#FFF3B0" stroke-width="1.2"/><circle cx="12" cy="0" r="4.2" fill="${c}" stroke="#FFF3B0" stroke-width="1.2"/></g>`;
const C1_CABBAGE = `<svg viewBox="0 0 400 300" style="width:100%;border-radius:12px;display:block">
  <defs><linearGradient id="c1jade" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F4F1E2"/><stop offset=".45" stop-color="#CFE6C8"/><stop offset=".7" stop-color="#5FA86A"/><stop offset="1" stop-color="#2E7A44"/></linearGradient></defs>
  <rect width="400" height="300" fill="#1E2624"/><rect x="18" y="18" width="364" height="264" rx="10" fill="#2C3631" stroke="#4A5650" stroke-width="2"/>
  <ellipse cx="200" cy="155" rx="150" ry="62" transform="rotate(-28 200 155)" fill="#6E4A2A" opacity=".55"/>
  <path d="M86 236 Q70 214 96 196 Q150 150 214 110 Q262 78 302 62 Q336 52 342 76 Q346 104 318 128 Q270 172 214 198 Q152 228 112 244 Q94 250 86 236Z" fill="url(#c1jade)" stroke="#E8F2D8" stroke-width="1.5"/>
  <path d="M100 232 Q170 180 320 76 M140 214 Q200 150 286 90 M150 216 Q230 170 314 112" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2" fill="none"/>
  <path d="M250 92 Q262 70 296 58 M276 120 Q300 100 334 92 M230 150 Q260 132 300 132" stroke="#1F5A30" stroke-opacity=".55" stroke-width="2" fill="none"/>
  ${C1_BUG(280, 104, -135, 46, '#3C8C3E')}
  ${C1_BUG(150, 205, 45, 7, '#4E7A3A')}
  <g transform="translate(346 246)"><circle r="26" fill="rgba(255,255,255,.88)" stroke="#2A2230" stroke-width="2"/><circle r="2.5" fill="#2A2230"/><path d="M8 0 L22 0" stroke="#E8453C" stroke-width="4"/><text x="-2" y="-8" font-size="0">.</text><text x="13" y="-6" text-anchor="middle" font-size="13" font-weight="900" fill="#E8453C">N</text></g>
  <text x="300" y="285" font-size="11" fill="#9AA8A0">la bàn</text>
  <rect x="26" y="26" width="118" height="22" rx="4" fill="rgba(0,0,0,.4)"/><text x="34" y="42" font-size="12" fill="#fff">📷 chụp từ trên xuống</text></svg>`;
P({
  id: 'c1_cabbage', ch: 1, t: '白菜上的螽斯', lv: 2, icon: '🥬', pos: [80, 20],
  body: () => `<p>甄妮從展櫃<b>正上方往下</b>拍了一張翠玉白菜的照片。她的手機是越南語介面，照片角落的指南針小工具只顯示<b>一個字母</b>。</p>
    ${C1_CABBAGE}
    <div class="c1-label">展品說明：白菜葉上停著兩隻昆蟲。<b>觸角比身體還長</b>的是螽斯，觸角很短的是蝗蟲。<br>傳說：<b>白菜不會說話，但螽斯的頭朝著哪裡，下一件寶物就在哪裡。</b></div>
    ${C1DICT([['chụp', '拍照'], ['từ trên xuống', '從上往下'], ['la bàn', '指南針'], ['Bắc (B)', '北'], ['Nam (N)', '南'], ['Đông (Đ)', '東'], ['Tây (T)', '西']])}
    <p><b>螽斯的頭朝向哪一個方位？</b></p>`,
  ans: ['東北', '東北方', '東北邊', '東北方向'], solve: '東北', ph: '方位',
  hint: '先分清楚哪一隻是螽斯。再想想：越南語的指南針上，「N」是哪個字的開頭？',
  ok: [['zn', 'N là Nam mà!', 'N 是「南」啊！'], ['jz', '我一直以為 N 是北。'], ['xy', '你的人生方向本來就是反的。']],
});

// ---------- 5. 肉形石的毛孔（點字） ----------
const C1_BRAILLE = { A: '1', B: '12', C: '14', D: '145', E: '15', F: '124', G: '1245', H: '125', I: '24', J: '245', K: '13', L: '123', M: '134', N: '1345', O: '135', P: '1234', Q: '12345', R: '1235', S: '234', T: '2345', U: '136', V: '1236', W: '2456', X: '1346', Y: '13456', Z: '1356' };
const C1_MEAT = (() => {
  const msg = 'DONG NAM';
  let dots = '';
  [...msg].forEach((ch, k) => {
    if (ch === ' ') return; const p = C1_BRAILLE[ch], x0 = 104 + k * 25;
    for (const d of p) { const n = +d, cx = x0 + (n > 3 ? 9 : 0), cy = 68 + ((n - 1) % 3) * 9; dots += `<circle cx="${cx}" cy="${cy}" r="2.7" fill="#2A120A"/>`; }
  });
  return `<svg viewBox="0 0 400 260" style="width:100%;border-radius:12px;display:block"><rect width="400" height="260" fill="#2A2026"/>
    <defs><clipPath id="c1stone"><path d="M62 122 Q58 62 132 54 L286 52 Q344 58 346 118 L340 178 Q330 206 290 210 L110 212 Q68 208 64 178 Z"/></clipPath></defs>
    <path d="M110 214 L290 214 L310 236 L90 236 Z" fill="#C9A23A" stroke="#7A5A10" stroke-width="2"/><path d="M96 236 h208" stroke="#7A5A10" stroke-width="3"/>
    <g clip-path="url(#c1stone)"><rect x="50" y="40" width="300" height="60" fill="#7A4120"/><rect x="50" y="96" width="300" height="18" fill="#F0D7A8"/><rect x="50" y="114" width="300" height="22" fill="#B4643A"/><rect x="50" y="136" width="300" height="14" fill="#F3E0B8"/><rect x="50" y="150" width="300" height="30" fill="#A65A33"/><rect x="50" y="180" width="300" height="40" fill="#D9B37E"/>
      <path d="M50 98 Q120 92 200 99 T350 96 M50 136 Q140 130 220 138 T350 134" stroke="#5A2A10" stroke-opacity=".35" stroke-width="2" fill="none"/></g>
    <path d="M62 122 Q58 62 132 54 L286 52 Q344 58 346 118 L340 178 Q330 206 290 210 L110 212 Q68 208 64 178 Z" fill="none" stroke="#3A1A0A" stroke-width="2.5"/>
    ${dots}<text x="200" y="252" text-anchor="middle" font-size="12" fill="#C8B8A8">肉形石（表皮放大）</text></svg>`;
})();
P({
  id: 'c1_meat', ch: 1, t: '肉形石的毛孔', lv: 1, icon: '🥓', pos: [20, 48],
  body: () => `<p>肉形石看起來就像一塊東坡肉，連豬皮上的毛孔都有。俊治把臉貼在玻璃上：「這些毛孔排得也太整齊了吧？」</p>
    ${C1_MEAT}
    <div class="c1-label">導覽員小聲說：「有人在表皮上留了<b>點字</b>。點字一格是<b>左右兩排、上下三點</b>，點的編號如下；越南文的聲調符號點不出來，所以只有字母。」</div>
    <div class="paper" style="font-size:13px"><div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><svg viewBox="0 0 60 70" width="54"><g font-size="11" font-weight="700" fill="#5A3A20" text-anchor="middle">${[1, 2, 3].map(i => `<circle cx="18" cy="${i * 18}" r="7" fill="#F2DDB0"/><text x="18" y="${i * 18 + 4}">${i}</text><circle cx="42" cy="${i * 18}" r="7" fill="#F2DDB0"/><text x="42" y="${i * 18 + 4}">${i + 3}</text>`).join('')}</g></svg>
      <span style="flex:1;min-width:200px">${Object.entries(C1_BRAILLE).map(([k, v]) => `<b>${k}</b>${v}`).join('　')}</span></div></div>
    ${C1DICT([['đông', '東'], ['tây', '西'], ['nam', '南'], ['bắc', '北'], ['dòng', '一行'], ['năm', '5']])}
    <p><b>點字說，看完肉形石要往哪個方位走？</b></p>`,
  ans: ['東南', '東南方', '東南邊', '東南方向'], solve: '東南', ph: '方位',
  hint: '先把點一格一格分開（兩排三列），對照編號表翻成字母。拼出來的是兩個越南字，記得聲調不見了。',
  ok: [['jz', '我就說這些毛孔有問題。'], ['by', '學長終於有一次是對的。'], ['xy', '神人。']],
});

// ---------- 6. 玉塊三視圖（分卡） ----------
const C1_VIEW = (cols, label, sub) => {
  const S = 22, w = cols.length * S, h = 4 * S;
  let s = `<rect x="0" y="0" width="${w + 40}" height="${h + 50}" rx="10" fill="#F4F8F2"/>`;
  cols.forEach((v, i) => { for (let k = 0; k < 4; k++) s += `<rect x="${20 + i * S}" y="${10 + (3 - k) * S}" width="${S}" height="${S}" fill="${k < v ? '#4E9A6A' : 'none'}" stroke="${k < v ? '#1E5A3A' : '#D8E4DA'}" stroke-width="1.5"/>`; });
  s += `<line x1="14" y1="${10 + h}" x2="${26 + w}" y2="${10 + h}" stroke="#5A4A3A" stroke-width="3"/><text x="${20 + w / 2}" y="${h + 30}" text-anchor="middle" font-size="12" font-weight="700" fill="#2A2230">${label}</text><text x="${20 + w / 2}" y="${h + 44}" text-anchor="middle" font-size="11" fill="#7A6E78">${sub}</text>`;
  return `<svg viewBox="0 0 ${w + 40} ${h + 50}" style="width:100%;max-width:220px">${s}</svg>`;
};
const C1_TOP = (() => {
  const t = '1101011101110110', S = 22; let s = `<rect width="140" height="150" rx="10" fill="#F4F8F2"/>`;
  [...t].forEach((v, i) => { const y = i / 4 | 0, x = i % 4; s += `<rect x="${26 + x * S}" y="${24 + y * S}" width="${S}" height="${S}" fill="${v === '1' ? '#4E9A6A' : '#fff'}" stroke="#9AB8A4" stroke-width="1.5"/>`; });
  s += `<text x="70" y="16" text-anchor="middle" font-size="12" font-weight="900">北 ↑</text><text x="70" y="128" text-anchor="middle" font-size="12" font-weight="700">從正上方看</text><text x="70" y="143" text-anchor="middle" font-size="11" fill="#7A6E78">綠色＝有玉塊</text>`;
  return `<svg viewBox="0 0 140 150" style="width:100%;max-width:200px">${s}</svg>`;
})();
P({
  id: 'c1_cong', ch: 1, t: '玉塊三視圖', lv: 2, icon: '🧊', pos: [42, 44],
  body: () => `<p>兒童體驗區有一座用小玉塊（正立方體）堆起來的雕塑，放在 4×4 的方格底座上。玉塊都是從底座往上疊，<b>不會懸空</b>。</p>
    <p>解說牌只給了三張「視圖」——影子是平的，看不出前後。</p>
    <p class="note">視圖分在你們的線索卡上。</p>
    <p><b>這座雕塑最少用了幾塊玉？最多可能用了幾塊？</b>（例如：10-20）</p>`,
  split: [
    `<b>正面圖</b>：站在<b>南邊</b>往北看（左邊是西）。${C1_VIEW([4, 2, 2, 3], '從南邊看', '← 西　　東 →')}`,
    `<b>側面圖</b>：站在<b>東邊</b>往西看。${C1_VIEW([2, 4, 3, 3], '從東邊看', '← 南　　北 →')}`,
    `<b>俯視圖</b>：從正上方往下看。${C1_TOP}`,
  ],
  check: (v) => { const m = String(v).normalize('NFKC').match(/\d+/g); return !!m && m.length === 2 && +m[0] === 19 && +m[1] === 26; },
  ans: ['19-26'], solve: '19-26', show: '最少 19 塊、最多 26 塊', ph: '最少-最多',
  hint: '最多：每一格都疊到「它那一行和那一列允許的最高高度」。最少：每個有玉的格子至少 1 塊，再想辦法讓同一根柱子同時滿足正面和側面的最高點。注意側面圖的左右是南北。',
  ok: [['by', '最少十九、最多二十六。'], ['xy', '那到底是幾塊？'], ['jz', '薛丁格的玉。']],
});

// ---------- 7. 紀念品店（越南語簡訊＋匯率） ----------
const C1_GIFT = [['朕知道了紙膠帶', 120, '📜'], ['白菜鑰匙圈', 180, '🔑'], ['肉形石磁鐵', 150, '🧲'], ['毛公鼎公仔', 380, '🏺'], ['清明上河圖明信片', 90, '🖼️'], ['汝窯杯墊', 260, '🍵'], ['乾隆御批扇子', 210, '🪭'], ['翠玉白菜傘', 340, '☂️']];
P({
  id: 'c1_gift', ch: 1, t: '紀念品店的簡訊', lv: 1, icon: '🛍️', pos: [64, 46],
  body: () => `<p>甄妮在紀念品店買了<b>三樣不同的東西</b>（每樣一個），可是她把收據丟了。她的手機收到一則銀行簡訊：</p>
    <div class="c1-sms"><small>Ngân hàng · 15:42</small>Thẻ của bạn vừa thanh toán <b>năm trăm bốn mươi nghìn đồng</b> tại Bảo tàng Cố Cung.</div>
    ${C1DICT([['thẻ', '卡'], ['của bạn', '你的'], ['vừa', '剛剛'], ['thanh toán', '付款'], ['tại', '在'], ['một / hai / ba', '1 / 2 / 3'], ['bốn / năm', '4 / 5'], ['mươi', '十（二十以上）'], ['trăm', '百'], ['nghìn', '千'], ['đồng', '越南盾']])}
    <table style="width:100%;font-size:14px"><tr><th>商品</th><th>價格（新台幣）</th></tr>${C1_GIFT.map(([n, p, i]) => `<tr><td>${i} ${n}</td><td>${p}</td></tr>`).join('')}</table>
    <div class="paper" style="font-size:14px">🏷️ 本店優惠：單筆消費<b>滿 500 元打九折</b>。<br>💱 今日匯率：1 新台幣 ＝ 800 越南盾。</div>
    <p><b>甄妮買了哪三樣？</b>（點選後送出）</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const w = document.createElement('div'); w.className = 'c1-gift'; w.style.cssText = '--cell:76px;text-align:center'; el.append(w);
    K.grid(w, ctx, { r: 2, c: 4, cell: (i, j) => { const [n, , ic] = C1_GIFT[i * 4 + j]; return `<span style="font-size:20px">${ic}</span><br>${n}`; } });
  },
  ui: 'none', ans: ['00100101'], solve: '00100101', show: '肉形石磁鐵、汝窯杯墊、翠玉白菜傘',
  hint: '先把越南盾換成台幣，再想想：如果那個金額湊不出來，是不是忘了什麼優惠？',
  ok: [['zn', 'Cái ô này đẹp quá!', '這把傘好漂亮！'], ['xy', '她買了一把白菜。'], ['jz', '下雨天頭上頂一顆白菜，很台。']],
});

// ---------- 8. 算籌竹簡 ----------
const C1_ROD = (() => {
  // 縱式：1-5 直槓；6-9 上面一橫(5)＋下面直槓。橫式：1-5 橫槓；6-9 上面一直(5)＋下面橫槓。
  const V = (n, x, y) => { let s = ''; const k = n > 5 ? n - 5 : n, gx = 8; const w = (k - 1) * gx; for (let i = 0; i < k; i++) s += `<line x1="${x - w / 2 + i * gx}" y1="${y + (n > 5 ? 2 : -14)}" x2="${x - w / 2 + i * gx}" y2="${y + 16}" />`; if (n > 5) s += `<line x1="${x - 13}" y1="${y - 8}" x2="${x + 13}" y2="${y - 8}"/>`; return s; };
  const Hh = (n, x, y) => { let s = ''; const k = n > 5 ? n - 5 : n, gy = 7; const h = (k - 1) * gy, top = n > 5 ? y + 4 : y; for (let i = 0; i < k; i++) s += `<line x1="${x - 14}" y1="${top - h / 2 + i * gy + (n > 5 ? 4 : 0)}" x2="${x + 14}" y2="${top - h / 2 + i * gy + (n > 5 ? 4 : 0)}"/>`; if (n > 5) s += `<line x1="${x}" y1="${y - 18}" x2="${x}" y2="${y - 4 - h / 2}"/>`; return s; };
  const num = (digits, y, slots) => { let s = ''; const L = digits.length; for (let p = 0; p < slots; p++) { const x = 60 + p * 56; s += `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" fill="none" stroke="#C9B080" stroke-dasharray="3 3"/>`; } [...digits].forEach((d, i) => { const place = L - 1 - i, x = 60 + (slots - L + i) * 56; if (d !== '0') s += place % 2 === 0 ? V(+d, x, y) : Hh(+d, x, y); }); return s; };
  const table = (f, y, lab) => `<text x="8" y="${y + 5}" font-size="12" font-weight="700" fill="#5A3A20">${lab}</text>` + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<g transform="translate(${44 + (n - 1) * 34} 0)"><g stroke="#2A2230" stroke-width="2.4" stroke-linecap="round" transform="scale(.62) translate(0 ${y / .62})">${f(n, 22, 0)}</g><text x="14" y="${y + 26}" font-size="10" text-anchor="middle" fill="#7A6E78">${n}</text></g>`).join('');
  return {
    slip: `<svg viewBox="0 0 300 200" style="width:100%;max-width:420px;display:block;margin:0 auto;border-radius:10px"><rect width="300" height="200" fill="#E8D3A2"/>${[0, 1, 2, 3, 4].map(i => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="200" stroke="#C7A970" stroke-width="2"/>`).join('')}
      <text x="10" y="58" font-size="13" font-weight="900" fill="#5A3A20">甲</text><text x="10" y="148" font-size="13" font-weight="900" fill="#5A3A20">乙</text>
      <g stroke="#2A2230" stroke-width="4" stroke-linecap="round" transform="translate(20 0)">${num('36', 52, 4)}${num('1072', 142, 4)}</g></svg>`,
    rule: `<svg viewBox="0 0 360 96" style="width:100%;max-width:440px">${table(V, 12, '縱式')}${table(Hh, 60, '橫式')}</svg>`,
  };
})();
P({
  id: 'c1_rods', ch: 1, t: '竹簡上的算籌', lv: 1, icon: '🎋', pos: [86, 46],
  body: () => `<p>一片竹簡上寫著：「<b>今有玉璧甲枚，枚直錢乙。問：共直錢幾何？</b>」（有甲個玉璧，每個值乙錢，總共值多少錢？）甲和乙是用古代的「算籌」擺的：</p>
    ${C1_ROD.slip}
    <div class="paper" style="font-size:14px">算籌記數：<b>個位用縱式、十位用橫式、百位用縱式、千位用橫式……</b>（縱橫交錯）；<b>零就空一格</b>。<br>${C1_ROD.rule}<br><span class="muted small">6～9：上面那一根代表 5。</span></div>
    <p><b>共值多少錢？</b></p>`,
  ans: ['38592'], solve: '38592', num: true, ph: '數字',
  hint: '先數格子：每個數字佔一格，空的格子是 0。再看每一格是縱式還是橫式、上面有沒有代表 5 的那一根。',
  ok: [['by', '三萬八千五百九十二錢。'], ['xy', '換成台幣多少？'], ['jz', '換成芋圓多少碗比較重要。']],
});

// ---------- 9. 集章卡（分卡疊圖） ----------
const C1_STAMP = (() => {
  const F = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111' };
  const code = '4917', on = [];
  [...code].forEach((d, k) => [...F[d]].forEach((b, i) => { if (b === '1') on.push([i / 3 | 0, k * 4 + i % 3]); }));
  // 固定的打散：分成四張章
  let s = 20260208; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const sh = on.slice(); for (let i = sh.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[sh[i], sh[j]] = [sh[j], sh[i]]; }
  const parts = [[], [], [], []]; sh.forEach((p, i) => parts[i % 4].push(p));
  const card = (k) => {
    const flip = k === 3, pts = parts[k].map(([r, c]) => flip ? [4 - r, 14 - c] : [r, c]);
    let g = `<rect x="4" y="4" width="232" height="132" rx="18" fill="#FFF8F2" stroke="#C9332B" stroke-width="3"/>`;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 15; c++) g += `<circle cx="${18 + c * 14.5}" cy="${30 + r * 17}" r="2" fill="#EAD8D0"/>`;
    pts.forEach(([r, c]) => g += `<circle cx="${18 + c * 14.5}" cy="${30 + r * 17}" r="6" fill="#C9332B" opacity=".9"/>`);
    const lab = `故宮集章・${'ABCD'[k]}`;
    g += flip ? `<text transform="translate(120 20) rotate(180)" text-anchor="middle" font-size="11" font-weight="900" fill="#C9332B">${lab}</text>` : `<text x="120" y="20" text-anchor="middle" font-size="11" font-weight="900" fill="#C9332B">${lab}</text>`;
    g += flip ? `<text transform="translate(120 122) rotate(180)" text-anchor="middle" font-size="9" fill="#C9332B">National Palace Museum</text>` : `<text x="120" y="130" text-anchor="middle" font-size="9" fill="#C9332B">National Palace Museum</text>`;
    return `<svg viewBox="0 0 240 140" style="width:100%;max-width:260px">${g}</svg>`;
  };
  return [0, 1, 2, 3].map(card);
})();
P({
  id: 'c1_stamps', ch: 1, t: '四個集章站', lv: 1, icon: '🔴', pos: [16, 74],
  body: () => `<p>故宮裡有四個集章站，每個章都只刻了一些紅點。集章卡背面寫著：「<b>四個章蓋在同一個位置</b>，就會出現兌換禮物的密碼。」</p>
    <p>你們四個人各蓋了一個章，但是蓋在不同的紙上……</p>
    <p class="note">每個人手上的章印在線索卡上。有一個章，好像被人蓋得怪怪的？</p>`,
  split: C1_STAMP.map((s, k) => `<b>集章站 ${'ABCD'[k]}</b> 的章印：${s}`),
  ans: ['4917'], solve: '4917', num: true, ph: '四位數',
  hint: '把四張章印的紅點疊在同一張 5×15 的點陣上。仔細看每張章上的字——有一張是倒著蓋的，要先轉回來。',
  ok: [['zn', 'Đẹp quá!', '好漂亮！'], ['xy', '俊治那個章是你蓋反的吧。'], ['jz', '我在測試大家的觀察力。']],
});

// ---------- 10. 璧、瑗、環（好與肉） ----------
const C1_DISCS = [[9, 3], [4, 2], [10, 2], [8, 2], [6, 2], [12, 6]];
P({
  id: 'c1_bi', ch: 1, t: '玉的「好」與「肉」', lv: 2, icon: '⭕', pos: [38, 72],
  body: () => `<p>玉器展區有六片圓形的玉，放在一公分一格的方格紙上。解說牌引用了古書《爾雅》：</p>
    <div class="c1-label">「<b>肉倍好謂之璧，好倍肉謂之瑗，肉好若一謂之環。</b>」<br>古人把中間的孔叫做「<b>好</b>」（量的是孔的直徑），把玉本身叫做「<b>肉</b>」（量的是從孔邊到外緣的<b>寬度</b>）。<br>肉是好的兩倍＝璧；好是肉的兩倍＝瑗；肉和好一樣＝環。都不是的，就只是普通的玉片。</div>
    <p class="note">原來「肉形石」不是唯一有肉的玉。點每一片玉，切換它的名字，六片都選好再送出。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const NM = ['？', '璧', '瑗', '環', '都不是'], CODE = ['', 'B', 'Y', 'H', 'X'], st = C1_DISCS.map(() => 0);
    const wrap = document.createElement('div'); wrap.className = 'c1-bi';
    C1_DISCS.forEach(([D, d], k) => {
      const S = 13, n = 14, c = n * S / 2; let g = `<rect width="${n * S}" height="${n * S}" fill="#FDFBF4"/>`;
      for (let i = 0; i <= n; i++) g += `<line x1="${i * S}" y1="0" x2="${i * S}" y2="${n * S}" stroke="${i % 5 === 2 ? '#9CC0D8' : '#D4E4EE'}" stroke-width="${i % 5 === 2 ? 1.2 : .8}"/><line x1="0" y1="${i * S}" x2="${n * S}" y2="${i * S}" stroke="${i % 5 === 2 ? '#9CC0D8' : '#D4E4EE'}" stroke-width="${i % 5 === 2 ? 1.2 : .8}"/>`;
      g += `<circle cx="${c}" cy="${c}" r="${(D / 2) * S}" fill="#7DBE9A" fill-opacity=".85" stroke="#2E6B4E" stroke-width="1.5"/><circle cx="${c}" cy="${c}" r="${(d / 2) * S}" fill="#FDFBF4" stroke="#2E6B4E" stroke-width="1.5"/>`;
      const b = document.createElement('button'); b.type = 'button';
      b.innerHTML = `<svg viewBox="0 0 ${n * S} ${n * S}" style="width:100%;display:block">${g}</svg><b>${'一二三四五六'[k]}・${NM[0]}</b>`;
      b.onclick = () => { if (done) return; st[k] = st[k] % 4 + 1; $('b', b).textContent = `${'一二三四五六'[k]}・${NM[st[k]]}`; b.classList.add('set'); sfx('click'); };
      wrap.append(b);
    });
    el.append(wrap);
    if (done) return;
    const go = document.createElement('div'); go.className = 'k-row'; go.innerHTML = '<button type="button" class="btn gold sm">確定送出</button>';
    $('button', go).onclick = () => { if (st.some(x => !x)) { toast('六片都要選好喔'); return; } ctx.submit(st.map(x => CODE[x]).join('')); };
    el.append(go);
  },
  ui: 'none', ans: ['HYBXHY'], solve: 'HYBXHY', show: '環、瑗、璧、都不是、環、瑗',
  hint: '量孔的直徑（好）和玉邊的寬度（肉）。注意「肉」不是整片玉的直徑，也不是外徑減內徑。',
  ok: [['xy', '所以肉形石應該叫「肉肉石」。'], ['by', '不是這樣用的。'], ['jz', '我現在看到甜甜圈都會想到璧。']],
});

// ---------- 11. 劇情指定：真正的順序 ----------
const C1_HALL = [
  [1, 0, '白瓷嬰兒枕'], [2, 0, '象牙套球'], [4, 0, '玉璧'], [6, 0, '毛公鼎'],
  [3, 1, '肉形石'], [6, 1, '翠玉白菜'],
  [0, 2, '玉辟邪'],
  [1, 3, '翠玉白菜'], [3, 3, '翠玉白菜'], [5, 3, '玉琮'],
  [0, 4, '肉形石'], [4, 4, '汝窯水仙盆'],
].map(([x, y, n], i) => ({ x, y, n, no: i + 1 }));
const C1_HALLSVG = (() => {
  const S = 58, ox = 10, oy = 26; let s = `<rect width="${7 * S + 20}" height="${5 * S + 80}" rx="14" fill="#EFE6D2"/><rect x="${ox}" y="${oy}" width="${7 * S}" height="${5 * S}" fill="#FBF7EE" stroke="#8A7A5A" stroke-width="3"/>`;
  for (let i = 1; i < 7; i++) s += `<line x1="${ox + i * S}" y1="${oy}" x2="${ox + i * S}" y2="${oy + 5 * S}" stroke="#E6DCC6"/>`;
  for (let j = 1; j < 5; j++) s += `<line x1="${ox}" y1="${oy + j * S}" x2="${ox + 7 * S}" y2="${oy + j * S}" stroke="#E6DCC6"/>`;
  C1_HALL.forEach(c => {
    const x = ox + c.x * S, y = oy + c.y * S, nm = c.n.length > 3 ? [c.n.slice(0, 3), c.n.slice(3)] : [c.n];
    s += `<rect x="${x + 4}" y="${y + 4}" width="${S - 8}" height="${S - 8}" rx="7" fill="#2E3A33" stroke="#B89A5A" stroke-width="2"/><text x="${x + 10}" y="${y + 17}" font-size="11" font-weight="900" fill="#FFE2A0">${c.no}</text>`;
    nm.forEach((t, k) => s += `<text x="${x + S / 2}" y="${y + (nm.length > 1 ? 32 + k * 13 : 38)}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#F4ECD8">${t}</text>`);
  });
  const ex = ox + 3 * S;
  s += `<rect x="${ex + 6}" y="${oy + 5 * S - 3}" width="${S - 12}" height="6" fill="#FBF7EE"/><path d="M${ex + S / 2} ${oy + 5 * S + 30} v-22 m-8 8 l8 -8 l8 8" stroke="#E8453C" stroke-width="3" fill="none"/><text x="${ex + S / 2}" y="${oy + 5 * S + 46}" text-anchor="middle" font-size="12" font-weight="900" fill="#E8453C">入口</text>`;
  s += `<g transform="translate(${7 * S - 10} ${oy + 5 * S + 30})"><text text-anchor="middle" font-size="12" font-weight="900">北</text><path d="M0 4 v14 M-5 9 L0 4 L5 9" stroke="#2A2230" stroke-width="2" fill="none"/></g><text x="${ox}" y="18" font-size="12" font-weight="900" fill="#5A3A20">真偽對照特展廳・平面圖（北在上）</text>`;
  return `<svg viewBox="0 0 ${7 * S + 20} ${5 * S + 80}" style="width:100%;display:block">${s}</svg>`;
})();
P({
  id: 'c1_order', ch: 1, t: '真正的順序', lv: 2, icon: '🟩', pos: [62, 74],
  need: ['c1_ws', 'c1_maogong', 'c1_cabbage', 'c1_meat'],
  body: () => `<div class="paper">「玉不會說話，但懂得指引方向。<b>白、肉、玉</b>，找出<b>真正的</b>順序。」</div>
    <p>紙條指向最後一個展廳：「真偽對照特展」。這裡每一件名品旁邊都放了幾件<b>仿製品</b>，展櫃上不寫哪一件才是真的。</p>
    ${C1_HALLSVG}
    <p class="note">每一格是一個位置。走路的時候只能直直往一個方向走（八個方位都可以），<b>經過的第一個展櫃</b>就是你走到的地方。你們在這一章解開的謎題裡，有人告訴過你們怎麼走。</p>
    <p><b>依序點出你們走到的三個展櫃：真的白菜、真的肉形石、真的玉器。</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.seq(el, ctx, C1_HALL.map(c => ({ t: `${c.no} ${c.n}`, v: String(c.no) })), { len: 3 }); },
  ui: 'none', ans: ['8-5-10'], solve: '8-5-10', show: '8 翠玉白菜 → 5 肉形石 → 10 玉琮（玉器）',
  hint: '入口那一步的方向在毛公鼎那裡；走到白菜以後，聽螽斯的；走到肉形石以後，聽毛孔的。',
  item: 'jade',
  ok: [['by', '白菜、肉形石、玉琮……玉櫃底下有一塊玉牌！'], ['zn', 'Đẹp quá! Có chữ ở mặt sau!', '好美！背面有字！'], ['xy', '神人。'], ['jz', 'Bang!']],
});
