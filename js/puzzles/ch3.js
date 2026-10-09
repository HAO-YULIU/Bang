'use strict';
// ===== 第三章：九份（11 題） =====
// 劇情指定題 c3_route 放最後：沿著豎崎路的階梯，「走過三個轉角，看見三盞紅燈籠，在第四個階梯尋找答案」。
document.head.insertAdjacentHTML('beforeend', `<style>
.c3-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 4px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 8px 0; }
.c3-dict span b { color: #C9332B; }
.c3-wood { background: linear-gradient(180deg, #7A4A2A, #5A321A); color: #FFE8C0; border-radius: 10px; padding: 10px 14px; margin: 8px 0; border: 3px solid #3A2010; box-shadow: 0 3px 0 #2A1608; }
.c3-wood b { color: #FFD06A; }
.c3-frames { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.c3-frames figure { margin: 0; position: relative; }
.c3-frames figcaption { position: absolute; left: 6px; bottom: 4px; background: rgba(0,0,0,.6); color: #fff; font-weight: 900; border-radius: 6px; padding: 0 7px; font-size: 14px; }
.c3-post { background: #FFFDF6; border: 1.5px solid #D8C49A; border-radius: 6px; padding: 12px 14px; font-family: var(--serif); font-size: 15px; line-height: 1.8; box-shadow: 3px 4px 0 #E2D2B0; position: relative; padding-right: 44px; }
.c3-post::after { content: '📮'; position: absolute; right: 10px; top: 6px; font-size: 26px; }
.c3-rcpt { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.c3-rcpt div { background: #fff; border: 1px dashed #9A9A9A; border-radius: 4px; padding: 6px 8px; font-size: 12px; font-family: ui-monospace, Menlo, monospace; }
.c3-rcpt div b { display: block; font-size: 17px; letter-spacing: .06em; color: #1E1A20; }
.c3-tt td, .c3-tt th { font-size: 13px; padding: 3px 6px !important; }
.c3-glass { display: flex; justify-content: center; gap: 18px; align-items: flex-end; margin: 6px 0; }
.c3-glass figure { margin: 0; text-align: center; font-weight: 900; font-size: 13px; }
.c3-tlog { font-size: 12px; color: var(--muted); max-height: 110px; overflow-y: auto; background: #F6EFE2; border-radius: 8px; padding: 6px 8px; }
.c3-cyl .k-cyl-rot { width: 80px; }
.c3-cyl .k-cyl-face { background: linear-gradient(180deg, #E8402E, #B81E18); color: #FFE7A0; border-color: #7A1008; font-size: 30px; font-family: var(--serif); }
.c3-cards .k-choice { gap: 4px; }
.c3-cards .k-opt { padding: 2px; min-width: 0; border-width: 2px; border-radius: 8px; }
.c3-cards .k-card { width: 30px; height: 42px; } .c3-cards .k-card b { font-size: 12px; } .c3-cards .k-card i { font-size: 14px; }
.c3-deal { margin: 4px 0 8px; padding: 6px; background: #1E5A3A; border-radius: 10px; color: #E8F4E8; font-size: 12px; }
.c3-deal .k-card { width: 34px; height: 48px; } .c3-deal .k-card b { font-size: 13px; } .c3-deal .k-card i { font-size: 15px; }
</style>`);

const C3DICT = (words) => `<div class="c3-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// ---------- 1. 夕陽的照片（排序） ----------
const C3_FRAME = (st) => {
  const [sunY, lit, step, cloud, night] = st;
  const sky = night ? ['#1E2448', '#3A3A6A'] : cloud ? ['#9AA0A8', '#C8C4BC'] : sunY < 50 ? ['#7EB6E8', '#F6D9A0'] : ['#E89A5A', '#F6C27A'];
  let s = `<defs><linearGradient id="c3s${sunY}${lit}${step}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="200" height="150" fill="url(#c3s${sunY}${lit}${step})"/>`;
  if (!night && !cloud) s += `<circle cx="40" cy="${sunY}" r="13" fill="#FFE07A"/>`;
  if (cloud) s += `<ellipse cx="44" cy="40" rx="40" ry="16" fill="#E8E8EC"/><ellipse cx="70" cy="34" rx="26" ry="13" fill="#F2F2F4"/>`;
  s += `<rect x="0" y="96" width="80" height="54" fill="${night ? '#141A34' : '#4A7AA8'}"/>`;
  s += `<path d="M70 150 L70 70 L200 50 L200 150Z" fill="${night ? '#3A2A2A' : '#8A5A3A'}"/>`;
  for (let i = 0; i < 7; i++) { const x = 86 + i * 16, y = 74 - i * 2.5; s += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y - 2}" stroke="#2A1A10"/><ellipse cx="${x}" cy="${y + 4}" rx="5.5" ry="7" fill="${i < lit ? '#FF4A2E' : '#6A2A20'}" ${i < lit ? 'stroke="#FFD06A" stroke-width="1.5"' : ''}/>`; }
  for (let k = 0; k < 8; k++) s += `<rect x="${120 - k * 6}" y="${140 - k * 8}" width="80" height="8" fill="${night ? '#5A4A44' : '#C8B08A'}" stroke="#6A5A40" stroke-width=".6"/>`;
  const fx = 124 - step * 6 + 30, fy = 140 - step * 8;
  s += `<circle cx="${fx}" cy="${fy - 16}" r="4" fill="#2A2230"/><rect x="${fx - 3}" y="${fy - 12}" width="6" height="12" rx="2" fill="#5BAF7A"/>`;
  if (!night && !cloud) { const L = (sunY - 20) * .9 + 8; s += `<line x1="180" y1="40" x2="180" y2="${80 - 2}" stroke="#2A2230" stroke-width="3"/><circle cx="180" cy="38" r="4" fill="#F2E2A0"/><path d="M180 78 L${180 + L} ${78 - L * .08}" stroke="rgba(0,0,0,.35)" stroke-width="4"/>`; }
  else s += `<line x1="180" y1="40" x2="180" y2="78" stroke="#2A2230" stroke-width="3"/><circle cx="180" cy="38" r="${night ? 6 : 4}" fill="${night ? '#FFE07A' : '#F2E2A0'}"/>`;
  return `<svg viewBox="0 0 200 150" style="width:100%;display:block;border-radius:6px">${s}</svg>`;
};
// 時間順序 t1..t6 的狀態：[太陽高度, 亮的燈籠數, 博育在第幾階, 雲, 夜]
const C3_T = [[24, 0, 1, 0, 0], [44, 1, 2, 0, 0], [66, 3, 3, 0, 0], [0, 3, 5, 1, 0], [86, 5, 6, 0, 0], [0, 7, 7, 0, 1]];
const C3_LET = { A: 1, B: 3, C: 5, D: 0, E: 4, F: 2 };   // 照片字母 → 第幾個時間
P({
  id: 'c3_sunset', ch: 3, t: '傍晚的六張照片', lv: 1, icon: '🌇', pos: [14, 24],
  body: () => `<p>甄妮在豎崎路口拍了六張照片，可是上傳到雲端以後，拍攝時間全部不見了。博育那時候一直在<b>往上爬</b>樓梯。</p>
    <div class="c3-frames">${Object.keys(C3_LET).map(k => `<figure>${C3_FRAME(C3_T[C3_LET[k]])}<figcaption>${k}</figcaption></figure>`).join('')}</div>
    <p><b>把六張照片從最早排到最晚。</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.seq(el, ctx, Object.keys(C3_LET).map(t => ({ t, v: t })), { len: 6 }); },
  ui: 'none', ans: ['D-A-F-B-E-C'], solve: 'D-A-F-B-E-C', show: 'D → A → F → B → E → C',
  hint: '太陽越低、影子越長、燈籠越亮越多。有一張看不到太陽，就看別的東西：博育只會往上爬。',
  ok: [['zn', 'Đèn lồng đẹp quá!', '燈籠好漂亮！'], ['xy', '博育在每一張都在爬樓梯。'], ['by', '因為九份。']],
});

// ---------- 2. 芋圓店老闆（分卡＋旅行日誌） ----------
P({
  id: 'c3_taro', ch: 3, t: '芋圓分九份', lv: 2, icon: '🍡', pos: [36, 18],
  body: () => `<p>芋圓店的老闆聽說他們是來解謎的，笑著說：「猜中我今天煮了幾顆芋圓，就送你們一碗。」</p>
    <div class="c3-wood">🍡 <b>阿嬤的芋圓</b>　手工現做・一碗 60 元・<b>不准打包</b></div>
    <p class="note">老闆說的話分在你們的線索卡上。📓 旅行日誌記錄了你們到目前為止說過的每一句話。</p>
    <p><b>老闆今天煮了幾顆芋圓？</b></p>`,
  split: ['老闆：「九份九份，我煮的芋圓剛好可以平分成 <b>9</b> 碗，一顆都不剩。」',
    '老闆：「如果每碗裝的顆數，等於你們旅行日誌裡到現在一共出現了幾句<b>「神人。」</b>，最後會剩 <b>3</b> 顆。」',
    '老闆：「如果每碗裝的顆數，等於博育說了幾句<b>「……」</b>（整句只有刪節號的那種），最後會剩 <b>1</b> 顆。」',
    '老闆：「我今天煮了超過 100 顆，但是不到 300 顆。」'],
  ans: ['153', '153顆'], solve: '153', num: true, ph: '顆數',
  hint: '先去旅行日誌數：「神人。」不只小羽說過；博育的「……」從第一章開始算。再找同時符合四個條件的數。',
  ok: [['xy', '一百五十三顆。我要吃一百顆。'], ['zn', 'Ngon quá!', '好好吃！'], ['by', '老闆真的送了一碗……']],
});

// ---------- 3. 阿妹茶樓的沙漏 ----------
P({
  id: 'c3_tea', ch: 3, t: '茶要燜九分鐘', lv: 2, icon: '⏳', pos: [58, 22],
  body: () => `<p>阿妹茶樓的老闆娘說：「我們的『九份特調』要燜<b>剛好 9 分鐘</b>，多一秒少一秒都不行。」可是桌上沒有時鐘，只有兩個沙漏：<b>4 分鐘</b>和 <b>7 分鐘</b>。</p>
    <div class="c3-wood">☕ 規則：沙漏一開始都是空的（沙全部在下面）。<b>翻轉</b>沙漏不花時間。「等待」會一直等到<b>某一個沙漏漏完</b>為止。你可以在任何時候「開始燜茶」，再在某個時間點「倒茶」。</div>
    <p class="note">倒茶的時候如果不是剛好 9 分鐘，老闆娘會搖頭（算答錯一次）。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const box = document.createElement('div'); el.append(box);
    let t, g, start, log;
    const reset = () => { t = 0; g = [{ cap: 4, top: 0 }, { cap: 7, top: 0 }]; start = null; log = ['00:00 坐下來，兩個沙漏都是空的。']; draw(); };
    const glass = (x) => { const f = x.top / x.cap; return `<svg viewBox="0 0 60 100" width="56"><path d="M8 6 h44 M8 94 h44" stroke="#6A4A2A" stroke-width="5"/><path d="M12 8 L48 8 L32 50 L48 92 L12 92 L28 50 Z" fill="#EAF4FA" stroke="#5A6A7A" stroke-width="2"/><path d="M${12 + 16 * (1 - f)} ${8 + 42 * (1 - f)} L${48 - 16 * (1 - f)} ${8 + 42 * (1 - f)} L32 50 Z" fill="#E2B85A"/><path d="M${12 + 16 * f} ${92 - 42 * (1 - f)} L${48 - 16 * f} ${92 - 42 * (1 - f)} L48 92 L12 92 Z" fill="#E2B85A" opacity="${x.top < x.cap ? 1 : 0}"/>${x.top > 0 ? '<line x1="32" y1="50" x2="32" y2="90" stroke="#E2B85A" stroke-width="1.5"/>' : ''}</svg>`; };
    const mm = (v) => `00:${String(v).padStart(2, '0')}`;
    function draw() {
      box.innerHTML = `<div class="c3-glass">${g.map((x, i) => `<figure>${glass(x)}<br>${x.cap} 分鐘<br><span class="muted small">上面還有 ${x.top} 分</span></figure>`).join('')}<figure style="font-size:22px">🕰️<br>${mm(t)}<br><span class="muted small">${start == null ? '還沒開始燜' : `從 ${mm(start)} 開始燜`}</span></figure></div>
        <div class="k-row" style="justify-content:center"><button type="button" class="btn ghost sm" data-a="f0">翻轉 4 分</button><button type="button" class="btn ghost sm" data-a="f1">翻轉 7 分</button><button type="button" class="btn sm" data-a="w">⏩ 等待</button></div>
        <div class="k-row" style="justify-content:center"><button type="button" class="btn ghost sm" data-a="s" ${start != null ? 'disabled' : ''}>🍵 開始燜茶</button><button type="button" class="btn gold sm" data-a="p">倒茶！</button><button type="button" class="btn ghost sm" data-a="r">重來</button></div>
        <div class="c3-tlog">${log.slice().reverse().join('<br>')}</div>`;
      $$('[data-a]', box).forEach(b => b.onclick = () => act(b.dataset.a));
    }
    function act(a) {
      if (a === 'r') return reset();
      if (a[0] === 'f') { const x = g[+a[1]]; x.top = x.cap - x.top; log.push(`${mm(t)} 翻轉 ${x.cap} 分鐘沙漏`); sfx('click'); }
      if (a === 'w') {
        const run = g.filter(x => x.top > 0); if (!run.length) { toast('兩個沙漏都沒有在漏，等不到東西'); return; }
        const dt = Math.min(...run.map(x => x.top)); if (t + dt > 40) { toast('茶都涼了，重來吧'); return; }
        t += dt; run.forEach(x => x.top -= dt); log.push(`${mm(t)} ${g.filter(x => x.top === 0 && run.includes(x)).map(x => x.cap + ' 分鐘沙漏').join('、')}漏完了`);
      }
      if (a === 's') { start = t; log.push(`${mm(t)} 開始燜茶`); }
      if (a === 'p') { if (start == null) { toast('還沒開始燜茶'); return; } log.push(`${mm(t)} 倒茶（燜了 ${t - start} 分鐘）`); draw(); ctx.submit('T' + (t - start)); return; }
      draw();
    }
    reset();
  },
  ui: 'none', ans: ['T9'], solve: 'T9', show: '剛好燜了 9 分鐘',
  hint: '兩個一起翻。4 分鐘的漏完時，7 分鐘的還剩幾分？想辦法讓某一個沙漏「只剩 1 分鐘」或「剛好用到 2 分鐘」。',
  ok: [['zn', 'Trà thơm quá!', '茶好香！'], ['jz', '九分鐘，我已經渴死了。'], ['by', '這叫儀式感。']],
});

// ---------- 4. 夢魘・燈籠上的緞帶（K.cyl ＋ 密碼棒 ＋ 越南語 ＋ 數燈籠） ----------
const C3_RIBBON = (() => { const M = 'SODENDONHANSODENVANGCONGMOT'; let r = ''; for (let w = 0; w < 3; w++) for (let f = 0; f < 9; f++) r += M[f * 3 + w]; return r; })();
const C3_STREET = (() => {
  let s = `<rect width="420" height="220" fill="#22224A"/><rect y="170" width="420" height="50" fill="#4A3A34"/>`;
  s += `<path d="M0 60 L60 30 L140 50 L200 20 L290 44 L360 24 L420 40 L420 170 L0 170Z" fill="#3A2A2A"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${20 + i * 68}" y="${100 + (i % 2) * 8}" width="34" height="40" fill="${i % 3 ? '#F2C86A' : '#E89A4A'}" opacity=".55"/>`;
  s += `<path d="M0 62 Q210 110 420 58" stroke="#1A1010" stroke-width="2" fill="none"/>`;
  // 掛著的燈籠：r 紅 y 黃 w 白
  const L = ['r', 'y', 'r', 'w', 'r', 'y', 'r', 'r', 'y', 'w', 'r', 'y', 'r'];
  L.forEach((c, i) => { const x = 18 + i * 32, y = 62 + Math.sin(Math.PI * x / 420) * 34 + 8; const col = { r: '#E8302A', y: '#F2C230', w: '#F4F0E6' }[c];
    s += `<line x1="${x}" y1="${y - 10}" x2="${x}" y2="${y - 4}" stroke="#1A1010" stroke-width="1.5"/><rect x="${x - 6}" y="${y - 5}" width="12" height="3" fill="#2A1A10"/><ellipse cx="${x}" cy="${y + 8}" rx="10" ry="13" fill="${col}" stroke="#2A1A10" stroke-width="1"/><path d="M${x - 9} ${y + 4} h18 M${x - 9} ${y + 12} h18" stroke="#2A1A10" stroke-opacity=".3"/><rect x="${x - 6}" y="${y + 20}" width="12" height="3" fill="#2A1A10"/><line x1="${x}" y1="${y + 23}" x2="${x}" y2="${y + 31}" stroke="${col}" stroke-width="2"/>`; });
  // 水窪倒影
  s += `<ellipse cx="300" cy="196" rx="70" ry="13" fill="#2A3A5A" stroke="#5A6A8A"/><g opacity=".55"><ellipse cx="290" cy="196" rx="7" ry="8" fill="#E8302A"/><ellipse cx="322" cy="194" rx="7" ry="8" fill="#F2C230"/></g>`;
  s += `<text x="10" y="212" font-size="10" fill="#C8B8A8">基山街・晚上 7 點</text>`;
  return `<svg viewBox="0 0 420 220" style="width:100%;display:block;border-radius:10px">${s}</svg>`;
})();
P({
  id: 'c3_lantern', ch: 3, t: '夢魘・燈籠上的緞帶', lv: 3, icon: '🏮', pos: [80, 20],
  body: () => `<p>一間燈籠店門口，掛著一盞會轉的大燈籠。燈籠下面的地上，掉了一條寫滿字母的緞帶：</p>
    <svg viewBox="0 0 440 40" style="width:100%;display:block"><path d="M2 8 h436 l-6 12 l6 12 h-436 l6 -12z" fill="#F2E2B0" stroke="#C9A040"/>${[...C3_RIBBON].map((c, i) => `<text x="${14 + i * 15.6}" y="25" text-anchor="middle" font-size="13" font-weight="900" font-family="ui-monospace,Menlo,monospace" fill="#8A2A10">${c}</text>`).join('')}</svg>
    <div class="c3-wood">店門口的牌子：「這條緞帶本來<b>一圈一圈</b>纏在燈籠上，燈籠的<b>每一面剛好一個字母</b>，纏了好幾圈。纏回去以後，沿著每一面<b>由上往下</b>讀，就知道燈籠想說什麼。」</div>
    <div class="c3-cylbox"></div>
    ${C3DICT([['số', '數量'], ['đèn', '燈籠'], ['đỏ', '紅'], ['vàng', '黃'], ['trắng', '白'], ['đen', '黑'], ['nhân', '乘'], ['chia', '除'], ['cộng', '加'], ['trừ', '減'], ['với', '和、跟'], ['một / hai / ba', '1 / 2 / 3']])}
    <p class="note">緞帶上沒有越南文的聲調符號。下面是燈籠店門外那條街現在的樣子：</p>
    ${C3_STREET}
    <p><b>燈籠想要的答案是多少？</b></p>`,
  build(el, ctx) {
    el.innerHTML = this.body(ctx);
    const w = $('.c3-cylbox', el); w.className = 'c3-cyl';
    K.cyl(w, { faces: ['九', '份', '山', '城', '夜', '燈', '茶', '香', '雨'], r: 112 });
  },
  ans: ['29'], solve: '29', num: true, ph: '數字',
  hint: '先轉燈籠，數清楚它有幾面——那就是緞帶一圈有幾個字母。把緞帶照這個長度一段一段排好，再直的讀。最後數燈籠時，水窪裡的不算。',
  ok: [['zn', 'Số đèn đỏ nhân với số đèn vàng, cộng một!', '紅燈籠的數量乘黃燈籠的數量，再加一！'], ['xy', '這題是給神人做的。'], ['jz', '我只看到燈籠很漂亮。'], ['by', '學長，你又在提供氣氛了。']],
});

// ---------- 5. 給媽媽的明信片（越南語分卡） ----------
P({
  id: 'c3_postcard', ch: 3, t: '寄給媽媽的明信片', lv: 2, icon: '💌', pos: [20, 48],
  body: () => `<p>甄妮在九份的郵局寫了一張明信片寄回越南。博育偷看了一眼：</p>
    <div class="c3-post">Mẹ ơi! Hôm nay con đến Cửu Phần. Ở đây có <b>ba trăm sáu mươi lăm</b> bậc thang!<br>Con ăn <b>hai</b> bát khoai môn viên. Tiểu Vũ ăn <b>gấp đôi</b> con. Tuấn Trị ăn <b>ít hơn</b> Tiểu Vũ <b>một</b> bát. Bác Dục <b>không</b> ăn, vì anh ấy phải chụp ảnh cho chúng con.</div>
    <p>郵局的明信片有一格「郵遞區號」，甄妮笑著寫了一個數字：「<b>階梯的數量，加上我們四個人一共吃了幾碗芋圓。</b>」</p>
    <p class="note">甄妮的小抄被分成好幾張，在你們的線索卡上。</p>
    <p><b>她寫了什麼數字？</b></p>`,
  split: [
    `數字：${C3DICT([['một', '1'], ['hai', '2'], ['ba', '3'], ['sáu', '6'], ['mươi', '十（二十以上）'], ['lăm', '十位後面的 5'], ['trăm', '百']])}`,
    `吃東西：${C3DICT([['ăn', '吃'], ['bát', '碗'], ['khoai môn viên', '芋圓'], ['không', '不、沒有']])}`,
    `比較：${C3DICT([['gấp đôi', '…的兩倍'], ['ít hơn', '比…少'], ['vì', '因為'], ['phải', '必須']])}`,
    `人和地方：${C3DICT([['mẹ ơi', '媽媽啊'], ['con', '我（對爸媽說）'], ['hôm nay', '今天'], ['đến', '到'], ['ở đây có', '這裡有'], ['Cửu Phần', '九份'], ['bậc thang', '階梯'], ['Tiểu Vũ', '小羽'], ['Tuấn Trị', '俊治'], ['Bác Dục', '博育'], ['chụp ảnh', '拍照']])}`,
  ],
  ans: ['374'], solve: '374', num: true, ph: '數字',
  hint: '先把階梯數翻出來（注意 lăm）。再一個人一個人算：小羽是甄妮的幾倍？俊治比誰少？博育吃了沒？',
  ok: [['zn', 'Mẹ sẽ thích lắm!', '媽媽一定會很喜歡！'], ['xy', '她跟媽媽告狀我吃四碗。'], ['jz', '你本來就吃四碗。']],
});

// ---------- 6. 芋圓店的招牌（算式密碼） ----------
P({
  id: 'c3_sign', ch: 3, t: '招牌上的算式', lv: 1, icon: '🪧', pos: [42, 44],
  body: () => `<p>隔壁的芋圓店不甘示弱，招牌上寫著兩行算式，說猜中的人打九折。</p>
    <div class="c3-wood" style="text-align:center;font-size:24px;line-height:1.7;font-family:var(--serif)">芋圓 × 圓 ＝ 好吃吃<br>吃 ＋ 吃 ＝ 圓</div>
    <div class="paper" style="font-size:14px">每一個字代表 0～9 其中一個數字；<b>不同的字是不同的數字</b>，同一個字一定是同一個數字。多位數的第一個字不會是 0。</div>
    <p><b>「芋圓好吃」四個字依序是哪四個數字？</b></p>`,
  ans: ['6854'], solve: '6854', num: true, ph: '四位數',
  hint: '第二行告訴你「圓」一定是偶數，而且是「吃」的兩倍。把可能的圓一個一個代進第一行試試看。',
  ok: [['xy', '六八五四，芋圓好吃。'], ['jz', '我覺得招牌應該寫「好吃吃吃」。'], ['by', '那就不能解了。']],
});

// ---------- 7. 射燈籠（小遊戲＋越南語） ----------
P({
  id: 'c3_shoot', ch: 3, t: '老街射燈籠', lv: 1, icon: '🎯', pos: [64, 46],
  body: () => `<p>老街的童玩攤：燈籠一顆一顆往上飄，用彈弓打。老闆只會講越南話（他太太是越南人），規則寫在牌子上：</p>
    <div class="c3-wood" style="font-size:17px">“Chỉ bắn đèn <b>màu đỏ</b>. Tổng các số phải <b>bằng chín</b>.”</div>
    ${C3DICT([['chỉ', '只'], ['bắn', '射'], ['đèn', '燈籠'], ['màu', '顏色'], ['đỏ', '紅'], ['vàng', '黃'], ['tổng', '總和'], ['các số', '那些數字'], ['phải', '必須'], ['bằng', '等於'], ['chín', '9']])}
    <p class="note">準星固定在畫面中間，燈籠飄到準星上的時候按「發射」。打錯燈籠、或加起來超過，都算失敗（答錯一次）。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    let sum = 0;
    const lanes = [[70, 'đỏ', 2], [130, 'vàng', 9], [190, 'đỏ', 4], [250, 'vàng', 3], [310, 'đỏ', 6], [370, 'vàng', 1], [430, 'đỏ', 5], [490, 'vàng', 6], [550, 'đỏ', 8]];
    const targets = lanes.map(([x0, c, v], i) => ({ label: String(v), v, red: c === 'đỏ', color: c === 'đỏ' ? '#E8302A' : '#E8B020', r: 28, f: (t) => { const sp = 40 + (i % 3) * 14; return { x: (x0 + t * 22) % 620 - 10, y: 330 - ((t * sp + i * 71) % 380) }; } }));
    K.aim(el, ctx, {
      targets, bg: '#1E2448', balloon: true, btn: '發射！', info: '總和：0',
      onHit: (b) => { if (!b.red) return 'fail'; sum += b.v; if (sum > 9) return 'fail'; if (sum === 9) return { done: true, token: 'NINE' }; $('.k-aim-s', el).textContent = `總和：${sum}`; return undefined; },
    });
  },
  ui: 'none', ans: ['NINE'], solve: 'NINE', show: '打中的紅燈籠加起來剛好是 9',
  hint: '只看紅色的燈籠：哪幾顆加起來會剛好是 9？先想好再開槍，黃色的那顆 9 是陷阱。',
  ok: [['jz', 'Bang!'], ['xy', '他終於有一次 Bang 對地方。'], ['zn', 'Giỏi quá!', '好厲害！']],
});

// ---------- 8. 發票對獎 ----------
P({
  id: 'c3_receipt', ch: 3, t: '一疊發票', lv: 2, icon: '🧾', pos: [86, 46],
  body: () => `<p>大家把這兩天的發票都塞在博育的包包裡。博育打開手機查到最新一期的中獎號碼：</p>
    <table style="width:100%;font-size:13px"><tr><th colspan="2">統一發票 9–10 月 中獎號碼</th></tr>
      <tr><td>特別獎</td><td class="mono"><b>64071239</b>　8 碼全中：1000 萬</td></tr>
      <tr><td>特獎</td><td class="mono"><b>25810476</b>　8 碼全中：200 萬</td></tr>
      <tr><td>頭獎</td><td class="mono"><b>39174625</b>・<b>80536147</b>・<b>12708893</b><br>8 碼全中：20 萬</td></tr>
      <tr><td colspan="2" style="text-align:left">和<b>頭獎</b>號碼的末 7 碼相同：二獎 4 萬・末 6 碼：三獎 1 萬・末 5 碼：四獎 4 千・末 4 碼：五獎 1 千・末 3 碼：六獎 200 元<br><span class="muted">一張發票只能領最高的那一個獎。只有開立日期在 9、10 月的發票可以兌這一期。</span></td></tr></table>
    <div class="c3-rcpt">${[['10/08 阿嬤的芋圓', '77074625'], ['10/08 阿妹茶樓', '98201239'], ['10/08 草仔粿', '46536147'], ['08/27 便利商店', '30708893'], ['10/08 陶笛店', '03548893'], ['10/08 燈籠店', '25810467']].map(([a, b]) => `<div>電子發票證明聯<br>${a.split(' ')[1]}<b>${b.slice(0, 2)}-${b.slice(2)}</b>開立：2026/${a.split(' ')[0]}</div>`).join('')}</div>
    <p><b>這疊發票一共可以領多少錢？</b></p>`,
  ans: ['15000', '15000元', '1萬5千'], solve: '15000', num: true, ph: '元',
  hint: '一張一張對：先看日期能不能兌，再只跟頭獎三組號碼「從最後一碼往前」比；特別獎和特獎要全中才算。',
  ok: [['by', '一萬五千元！'], ['xy', '我請客。'], ['jz', '用博育的發票請客。']],
});

// ---------- 9. 去十分的車（時刻表） ----------
P({
  id: 'c3_bus', ch: 3, t: '去十分的最後一段路', lv: 1, icon: '🚌', pos: [16, 74],
  body: () => `<p>博育查好了路線：先搭公車下山到瑞芳車站，再轉平溪線火車到十分。現在是 <b>18:05</b>，大家已經站在九份老街的公車站牌下面。<b>今天是平日。</b></p>
    <table class="c3-tt" style="width:100%"><tr><th>九份老街 → 瑞芳車站（公車）</th></tr><tr><td class="mono">17:58・18:12・18:27・18:40・18:52・19:05</td></tr>
      <tr><td style="text-align:left">車程 15 分鐘。<b>18:00～19:00 下山塞車</b>，車程多 10 分鐘。</td></tr></table>
    <table class="c3-tt" style="width:100%"><tr><th>瑞芳 → 十分（平溪線）</th><th>備註</th></tr>
      ${[['18:21', ''], ['18:44', ''], ['18:58', '假日加開'], ['19:26', ''], ['20:02', '']].map(([a, b]) => `<tr><td class="mono">${a}</td><td>${b}</td></tr>`).join('')}
      <tr><td colspan="2" style="text-align:left">火車車程 22 分鐘。瑞芳車站的公車站走到月台要 <b>8 分鐘</b>。</td></tr></table>
    <p><b>他們最早幾點可以到十分？</b>（24 小時制）</p>`,
  ans: ['1948', '19:48', '7:48', '晚上7:48'], solve: '1948', ph: '例如 20:15',
  hint: '一段一段算，每一段都有陷阱：現在的時間、塞車、走去月台的時間，還有今天是星期幾。',
  ok: [['by', '七點四十八分到十分。'], ['xy', '那還有時間再吃一碗芋圓。'], ['by', '沒有。']],
});

// ---------- 10. 老街魔術師（撲克牌＋越南語） ----------
const C3_DEALS = [[['QS', '4D', 'QH', '8S', '6D', '5H', '7H'], ['AC', 'QC', 'JS', 'KC', '8C', 'KS', '8H'], ['9S', '10D', '9C', '3D', '7D', '7S', 'JH']], [['QS', '8S', '7H', 'JS', 'KS', '10D', '7D'], ['4D', '6D', 'AC', 'KC', '8H', '9C', '7S'], ['QH', '5H', 'QC', '8C', '9S', '3D', 'JH']], [['QS', 'JS', '7D', 'QC', '3D', '6D', '8H'], ['8S', 'KS', 'QH', '8C', 'JH', 'AC', '9C'], ['7H', '10D', '5H', '9S', '4D', 'KC', '7S']]];
const C3_SAY = ['cột giữa', 'cột phải', 'cột giữa'];
P({
  id: 'c3_magic', ch: 3, t: '老街魔術師', lv: 1, icon: '🃏', pos: [38, 72],
  body: () => `<p>老街上有個魔術師請甄妮「心裡記住一張牌」，然後把 21 張牌發成三直行，問她那張牌在哪一行。他一共發了三次，甄妮每次都用越南話回答。</p>
    ${C3_DEALS.map((cols, d) => `<div class="c3-deal"><b>第 ${d + 1} 次發牌</b>　甄妮：「${C3_SAY[d]}」${cols.map((c, k) => `<div>${['左', '中', '右'][k]}　${K.cards(c)}</div>`).join('')}</div>`).join('')}
    ${C3DICT([['cột', '直行'], ['trái', '左'], ['giữa', '中間'], ['phải', '右']])}
    <p class="note">為了方便看，每一直行的七張牌在這裡排成一橫排。</p>
    <p><b>甄妮心裡記的是哪一張牌？</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (done) return; const w = document.createElement('div'); w.className = 'c3-cards'; el.append(w); K.choice(w, ctx, C3_DEALS[0].flat().map(c => ({ t: K.card(c), v: c })), { cols: 7 }); },
  ui: 'none', ans: ['8C'], solve: '8C', show: '梅花 8',
  hint: '她的牌一定同時在三次她說的那一行裡。把三行的牌拿來比，只會剩一張。',
  ok: [['zn', 'Sao anh biết?!', '你怎麼知道？！'], ['jz', '我們也是魔術師。'], ['xy', '神人。']],
});

// ---------- 11. 劇情指定：沒有捷徑 ----------
const C3_MAP = (() => {
  const N = {
    S: { x: 40, y: 580, label: '起點', r: 11 },
    p1: { x: 110, y: 580, label: '12' }, p2: { x: 180, y: 580, label: '47' }, C1: { x: 260, y: 580, label: '', r: 9 },
    p3: { x: 260, y: 515, label: '35', dx: -26, dy: 5 }, p4: { x: 260, y: 450, label: '81', dx: -26, dy: 5 }, C2: { x: 260, y: 385, label: '', r: 9 },
    p5: { x: 180, y: 385, label: '26' }, p6: { x: 110, y: 385, label: '63' }, C3: { x: 40, y: 385, label: '', r: 9 },
    p7: { x: 40, y: 330, label: '58', dx: -26, dy: 5 }, p8: { x: 40, y: 280, label: '19', dx: -26, dy: 5 }, p9: { x: 40, y: 230, label: '74', dx: -26, dy: 5 }, p10: { x: 40, y: 180, label: '40', dx: -26, dy: 5 }, p11: { x: 40, y: 130, label: '92', dx: -26, dy: 5 },
    C4: { x: 40, y: 70, label: '', r: 9 }, p12: { x: 120, y: 70, label: '37' }, p13: { x: 200, y: 70, label: '85' }, E: { x: 290, y: 70, label: '基山街', r: 11 },
    k1: { x: 180, y: 480, label: '66', dx: -24, dy: 5 },
    t1: { x: 330, y: 450, label: '' }, T: { x: 370, y: 450, label: '', r: 10 },
    q1: { x: 110, y: 230, label: '' }, Q: { x: 170, y: 230, label: '', r: 10 },
  };
  const E = [['S', 'p1'], ['p1', 'p2'], ['p2', 'C1'], ['C1', 'p3'], ['p3', 'p4'], ['p4', 'C2'], ['C2', 'p5'], ['p5', 'p6'], ['p6', 'C3'], ['C3', 'p7'], ['p7', 'p8'], ['p8', 'p9'], ['p9', 'p10'], ['p10', 'p11'], ['p11', 'C4'], ['C4', 'p12'], ['p12', 'p13'], ['p13', 'E'],
    ['p2', 'k1'], ['k1', 'p5'], ['p4', 't1'], ['t1', 'T'], ['p9', 'q1'], ['q1', 'Q']];
  const LAN = [['p1', 'p2', 'r'], ['C1', 'p3', 'r'], ['p7', 'p8', 'r'], ['k1', 'p5', 'r'], ['t1', 'T', 'r'], ['p12', 'p13', 'r'], ['S', 'p1', 'y'], ['p3', 'p4', 'y'], ['p5', 'p6', 'y'], ['p9', 'p10', 'y'], ['q1', 'Q', 'y'], ['p6', 'C3', 'w'], ['p10', 'p11', 'w'], ['C2', 'p5', 'w']];
  let bg = `<rect width="400" height="620" fill="#EFE6D2"/>`;
  // 房子
  [[80, 410, 160, 140], [290, 300, 110, 130], [80, 100, 300, 260], [290, 470, 110, 90], [300, 600, 100, 20]].forEach(([x, y, w, h]) => bg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D9C8A8" stroke="#B8A27A"/>`);
  for (let i = 0; i < 14; i++) bg += `<rect x="${92 + (i * 53) % 280}" y="${120 + (i * 37) % 220}" width="14" height="18" fill="#F6E7B8" stroke="#B8A27A"/>`;
  bg += `<rect x="345" y="420" width="52" height="60" fill="#6A2A20" stroke="#C99A40" stroke-width="2"/><text x="371" y="440" text-anchor="middle" font-size="10" font-weight="900" fill="#FFD06A">阿妹</text><text x="371" y="476" text-anchor="middle" font-size="10" font-weight="900" fill="#FFD06A">茶樓</text>`;
  bg += `<rect x="150" y="205" width="44" height="50" fill="#5A3A6A" stroke="#C99A40"/><text x="172" y="268" text-anchor="middle" font-size="10" fill="#E8D8F0">芋圓店</text>`;
  bg += `<text x="192" y="470" font-size="11" font-weight="900" fill="#2E8A78" transform="rotate(-90 192 470)">捷徑 →</text>`;
  // 階梯紋路（直的路段）
  [[260, 580, 385], [40, 385, 70], [180, 580, 385]].forEach(([x, y1, y2]) => { for (let y = y2 + 8; y < y1; y += 9) bg += `<line x1="${x - 11}" y1="${y}" x2="${x + 11}" y2="${y}" stroke="#C8B898" stroke-width="2"/>`; });
  // 燈籠
  LAN.forEach(([a, b, c]) => {
    const A = N[a], B = N[b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, vert = Math.abs(A.x - B.x) < 5, x = vert ? mx + (A.x < 100 ? 24 : 24) : mx, y = vert ? my : my - 30;
    const col = { r: '#E8302A', y: '#F2C230', w: '#F4F0E6' }[c];
    bg += `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y - 9}" stroke="#5A4A3A"/><ellipse cx="${x}" cy="${y}" rx="7" ry="9" fill="${col}" stroke="#1A1010"/><rect x="${x - 4}" y="${y - 10}" width="8" height="2.5" fill="#1A1010"/><rect x="${x - 4}" y="${y + 8}" width="8" height="2.5" fill="#1A1010"/>`;
  });
  return { N, E, bg };
})();
P({
  id: 'c3_route', ch: 3, t: '沒有捷徑', lv: 2, icon: '🪙', pos: [62, 74],
  need: ['c3_sunset', 'c3_taro', 'c3_tea', 'c3_postcard'],
  body: () => `<div class="paper">「九份沒有捷徑。走過三個轉角，看見三盞紅燈籠，在第四個階梯尋找答案。」</div>
    <p>這是豎崎路一帶的地圖。每一階都鋪著一塊刻了號碼的石頭（白點上的數字）；沒有號碼的點是轉角的平台或店門口。燈籠掛在兩階之間，<b>走過那一段才算看見</b>。</p>
    <p class="note">從「起點」開始，點相鄰的點往上走。走到你認為藏著答案的那一階就停下來，按「確定送出」。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    K.route(el, ctx, { w: 400, h: 620, nodes: C3_MAP.N, edges: C3_MAP.E, start: 'S', bg: C3_MAP.bg, edgeColor: (a, b) => (a === 'k1' || b === 'k1') ? '#7AB8A8' : '#B8AE9C' });
  },
  check: (v) => { const p = String(v).split('-'); return p[p.length - 1] === 'p11' && !p.includes('k1') && p[0] === 'S'; },
  ui: 'none', solve: 'S-p1-p2-C1-p3-p4-C2-p5-p6-C3-p7-p8-p9-p10-p11', show: '刻著 92 的那一階',
  hint: '不要走那條綠色的小巷。轉角和紅燈籠要「兩個條件都滿足了」才開始數階梯；黃的、白的燈籠不算，店裡面的也沒走過。',
  item: 'coin',
  ok: [['by', '92 號那一階的石縫裡……有一枚銅幣！'], ['zn', 'Đồng xu cổ!', '古老的銅幣！'], ['xy', '這遊戲真的在帶我們跑景點。'], ['jz', 'Bang!']],
});
