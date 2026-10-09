'use strict';
// ===== 第七章：西門町——年輕人的戰場（11 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c7-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 3px 8px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 6px 0; }
.c7-dict span b { color: #C9332B; }
.c7-vn { font-size: 17px; font-weight: 700; color: #1E5AA8; background: #EAF3FF; border-radius: 10px; padding: 10px 12px; margin: 6px 0; line-height: 1.6; }
.c7-neon { background: #15112A; color: #FF7AD9; border-radius: 12px; padding: 14px 10px; text-align: center; font-weight: 900; font-size: 22px; letter-spacing: .06em; text-shadow: 0 0 6px #FF3FC0, 0 0 14px #FF3FC0; margin: 6px 0; }
.c7-neon.b { color: #7AE8FF; text-shadow: 0 0 6px #22C8FF, 0 0 14px #22C8FF; }
.c7-tbl { width: 100%; font-size: 13px !important; }
.c7-tbl td, .c7-tbl th { padding: 3px 4px !important; }
.c7-tbl th { background: #F3E6CC; }
.c7-shows { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 5px; font-size: 13px; margin: 6px 0; }
.c7-shows div { background: #1E1A30; color: #FFE9A8; border-radius: 8px; padding: 5px 8px; font-family: ui-monospace, Menlo, monospace; }
.c7-shows div b { color: #FF8A7A; margin-right: 6px; }
.c7-rcpts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 8px 0; }
.c7-rc { background: #fff; border: 1px solid #CFC6B4; border-radius: 4px; padding: 8px 8px 10px; font-size: 12px; line-height: 1.45; box-shadow: 1px 2px 0 rgba(0,0,0,.12); position: relative; }
.c7-rc::after { content: ''; position: absolute; left: 0; right: 0; bottom: -5px; height: 6px; background: radial-gradient(circle at 4px -1px, transparent 4px, #fff 4.5px) repeat-x; background-size: 8px 6px; }
.c7-rc b { display: block; font-size: 17px; letter-spacing: .08em; font-family: ui-monospace, Menlo, monospace; color: #1E1A20; }
.c7-rc small { color: #8A7A60; }
.c7-win { background: #FFF4E0; border: 2px solid #E0B060; border-radius: 10px; padding: 8px 10px; font-size: 14px; }
.c7-win td { font-family: ui-monospace, Menlo, monospace; }
.c7-win table { width: 100%; }
.c7-menu { background: #2A1A10; color: #FFE7B0; border-radius: 12px; padding: 10px 12px; font-size: 15px; }
.c7-menu h5 { margin: 0 0 6px; font-size: 20px; color: #FFCF5A; text-align: center; letter-spacing: .3em; }
.c7-menu div { display: flex; justify-content: space-between; border-bottom: 1px dashed #6A4A2A; padding: 2px 0; }
.c7-menu .warn { display: block; text-align: center; color: #FF8A6A; border: 0; font-weight: 700; margin-top: 6px; }
.c7-clues { font-size: 14px; columns: 2; column-gap: 14px; }
.c7-clues div { break-inside: avoid; }
.c7-songs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 3px 10px; font-size: 13px; background: #FFF9EC; border: 1.5px solid #E8D8B8; border-radius: 10px; padding: 8px; }
.c7-songs b { font-family: ui-monospace, Menlo, monospace; color: #8A3AA8; margin-right: 4px; }
.k-grid-wrap.c7-nono { --cell: 25px; }
.c7-movs { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; margin: 6px 0; }
.c7-movs div { background: #FFF4E0; border: 1.5px solid #E8C890; border-radius: 10px; padding: 6px 8px; font-size: 12.5px; line-height: 1.5; }
.c7-movs b { display: block; font-size: 15px; color: #8A2A1A; } .c7-movs span { display: block; } .c7-movs em { font-style: normal; color: #C9332B; font-weight: 700; }
@media (max-width: 760px) { .c7-clues { columns: 1; } }
</style>`);

// K.aim 的標籤字固定 15px，在手機上太小：只放大這一個 canvas 的字
const C7_BIGFONT = (cv, px, dy) => { try {
  const g = cv.getContext('2d'), d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font'), ft = CanvasRenderingContext2D.prototype.fillText;
  Object.defineProperty(g, 'font', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, String(v).replace(/\b15px/, px + 'px')); } });
  g.fillText = function (t, x, y, ...r) { return ft.call(this, t, x, y + (/\d+px/.test(this.font) && this.font.includes(px + 'px') ? dy : 0), ...r); };
} catch (e) {} };
const C7DICT = (words) => `<div class="c7-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// 七段顯示器：segs 是亮著的燈管（a 上 b 右上 c 右下 d 下 e 左下 f 左上 g 中）
const C7SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
const C7LCD = (list, o = {}) => {
  const W = 46, H = 78, P = { a: [8, 4, 30, 6], b: [36, 8, 6, 28], c: [36, 42, 6, 28], d: [8, 68, 30, 6], e: [4, 42, 6, 28], f: [4, 8, 6, 28], g: [8, 36, 30, 6] };
  const one = (segs, i) => `<g transform="translate(${8 + i * (W + 8)} 8)">${Object.entries(P).map(([k, [x, y, w, h]]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${segs.includes(k) ? (o.on || '#5CFFB0') : (o.off || '#22332C')}"/>`).join('')}${o.lab ? `<text x="23" y="${H + 16}" text-anchor="middle" font-size="13" fill="#9AB">${o.lab[i]}</text>` : ''}</g>`;
  const w = 8 + list.length * (W + 8), h = H + 16 + (o.lab ? 16 : 0);
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${o.max || 330}px;display:block;margin:6px auto;background:#0E1612;border-radius:10px">${list.map(one).join('')}</svg>`;
};

// ---------------------------------------------------------------------------
P({
  id: 'c7_words', ch: 7, t: '塗鴉牆找地名', lv: 1, icon: '🎨', pos: [14, 24],
  body: () => `<p>一面鐵捲門上噴滿了字。旁邊有人用麥克筆寫：「西門町的九個地方都藏在裡面（直、橫、斜、倒著都有可能）。找完之後，<b>剩下沒被圈到的字</b>，由上到下、由左到右讀，就是今晚的規定。」</p>
    <div class="paper c7-clues">${[['八角形的紅磚老建築', 2], ['一整條都是電影院', 3], ['投十塊、握搖桿、放爪子', 4], ['把圖畫在皮膚上', 2], ['招牌寫鴨，賣的卻是鵝', 3], ['小羽說穿了會變帥的衣服', 2], ['西門町的老商場大樓', 4], ['地底下的車停靠的地方', 3], ['拜媽祖的廟', 3]].map(([t, n], i) => `<div>${i + 1}. ${t}（${n} 字）</div>`).join('')}</div>
    <p class="note">點一個詞的第一個字、再點最後一個字來圈它。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const W = ['紅樓', '電影街', '夾娃娃機', '刺青', '鴨肉扁', '潮牌', '萬年大樓', '捷運站', '天后宮'];
    const wrap = document.createElement('div'); wrap.style.cssText = 'text-align:center;--wcell:42px'; el.append(wrap);
    const msg = document.createElement('p'); msg.className = 'note'; msg.style.textAlign = 'center'; el.append(msg);
    K.words(wrap, ctx, {
      grid: ['青刺站運捷樓', '潮牌鴨肉扁紅', '夾娃娃機博天', '育樓大年萬后', '街影電請客宮'],
      accept: (s, cells, found) => { const r = [...s].reverse().join(''); const w = W.includes(s) ? s : W.includes(r) ? r : null; return !!w && !found.some(f => f === w || [...f].reverse().join('') === w); },
      onFound: (found) => { msg.textContent = found.length >= W.length ? '九個都圈到了！剩下的字是什麼？' : `已經圈到 ${found.length} / 9 個`; },
    });
  },
  ans: ['博育請客', '博育要請客'], solve: '博育請客', ph: '剩下的字',
  hint: '從字數最長的開始找，倒著寫的也要注意。全部圈完再看白色的格子。',
  ok: [['by', '等一下，我什麼時候答應要請客？！', null], ['xy', '牆上寫的，不能違抗。'], ['jz', '神人。']],
});

// ---------------------------------------------------------------------------
const C7_PRIZES = [[9, 'đỏ', 70, 95], [4, 'đỏ', 415, 205], [6, 'vàng', 530, 95], [3, 'vàng', 70, 205], [2, 'xanh', 185, 95], [7, 'xanh', 300, 205], [5, 'trắng', 300, 95], [8, 'đen', 185, 205], [1, 'trắng', 530, 205], [6, 'xanh', 415, 95]];
const C7_COL = { 'đỏ': '#E8453C', 'vàng': '#E8A21C', 'xanh': '#2E7FD8', 'trắng': '#B9B2A4', 'đen': '#2A2230' };
P({
  id: 'c7_claw', ch: 7, t: '夾娃娃機', lv: 1, icon: '🧸', pos: [36, 34],
  body: () => `<p>甄妮在夾娃娃機前站了十分鐘，最後把要夾的娃娃寫在紙上，交給小羽。</p>
    <div class="c7-vn">“Tôi muốn ba con thú bông: ba màu khác nhau, cộng lại bằng mười lăm, không có con màu đen, con lớn nhất là màu vàng. Gắp từ nhỏ đến lớn nhé!”</div>
    ${C7DICT([['tôi muốn', '我想要'], ['con thú bông', '娃娃'], ['ba', '3'], ['màu', '顏色'], ['khác nhau', '不一樣'], ['cộng lại', '加起來'], ['bằng', '等於'], ['mười lăm', '15'], ['không có', '沒有'], ['lớn nhất', '最大的'], ['là', '是'], ['gắp', '夾'], ['từ … đến …', '從…到…'], ['nhỏ / lớn', '小 / 大'], ['đỏ', '紅'], ['vàng', '黃'], ['xanh', '藍'], ['trắng', '白'], ['đen', '黑']])}
    <p class="note">每隻娃娃身上的數字就是它的號碼。爪子會自己晃來晃去，按「放爪子！」夾下去。<b>夾到不該夾的、或順序錯了，算答錯（地圖 -1）</b>；什麼都沒夾到不算。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const seq = ['4đỏ', '5trắng', '6vàng'];
    K.aim(el, ctx, {
      bg: '#3A1E4A', btn: '放爪子！', info: '依序夾三隻',
      targets: C7_PRIZES.map(([n, c, x, y], i) => ({ label: String(n), color: C7_COL[c], r: 27, id: n + c, f: (t) => ({ x: x + 6 * Math.sin(t * 2 + i), y: y + 4 * Math.sin(t * 3 + i * 1.7) }) })),
      cross: (t) => ({ x: 300 + 265 * Math.sin(t * 0.85), y: 150 + 70 * Math.sin(t * 1.9 + 0.6) }),
      onHit: (b, hits) => b.id === seq[hits] ? (hits === 2 ? { done: true, token: 'claw-456' } : undefined) : 'fail',
    });
    C7_BIGFONT(el.querySelector('.k-aim canvas'), 30, 6);
  },
  ui: 'none', ans: ['claw-456'], solve: 'claw-456', show: '紅 4 → 白 5 → 黃 6',
  hint: '先只看「三種不同顏色、加起來 15」，再用「最大的是黃色」刪掉剩下的組合。',
  ok: [['zn', 'Cảm ơn! Dễ thương quá!', '謝謝！好可愛！', 'happy'], ['xy', '三隻一次夾到，我是神人。'], ['jz', '你花了四百塊。']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c7_duck', ch: 7, t: '鴨肉扁的帳單', lv: 2, icon: '🦢', pos: [58, 20],
  body: () => `<p>四個人走進鴨肉扁。甄妮堅持要自己點菜、自己付錢，用越南盾付。她把要點的東西寫在紙上：</p>
    <div class="c7-vn">“Cho bốn người: mỗi người một bát mì, nhưng Tiểu Vũ muốn bún thay mì. Hai đĩa thịt vịt nhỏ và một đĩa thịt vịt lớn. Một đĩa rau. Không lấy canh.”</div>
    ${C7DICT([['cho', '給（點餐）'], ['bốn người', '四個人'], ['mỗi người', '每個人'], ['một / hai', '1 / 2'], ['bát', '碗'], ['đĩa', '盤'], ['mì', '麵（切仔麵）'], ['bún', '米粉'], ['nhưng', '但是'], ['Tiểu Vũ', '小羽'], ['muốn', '想要'], ['thay', '代替'], ['thịt vịt', '鴨肉'], ['nhỏ / lớn', '小 / 大'], ['và', '和'], ['rau', '青菜'], ['không lấy', '不要'], ['canh', '湯'], ['tỷ giá', '匯率'], ['Đài tệ', '台幣'], ['đồng', '越南盾'], ['trăm', '百'], ['mươi', '十（二十以上）'], ['bảy / chín', '7 / 9']])}
    <div class="c7-menu"><h5>鴨肉扁</h5>
      <div><span>鵝肉（小盤）</span><span>180</span></div><div><span>鵝肉（大盤）</span><span>300</span></div><div><span>切仔麵</span><span>45</span></div><div><span>米粉</span><span>40</span></div><div><span>燙青菜</span><span>40</span></div><div><span>下水湯</span><span>50</span></div>
      <span class="warn">⚠ 本店沒有賣鴨肉！點鴨肉一律給你鵝肉，照鵝肉的價錢算。</span></div>
    <div class="paper" style="text-align:center">櫃台旁的換錢小牌子：<b>Tỷ giá: 1 Đài tệ = bảy trăm chín mươi đồng</b></div>
    <p><b>甄妮總共要付多少越南盾？</b>（只寫數字）</p>`,
  ans: ['691250', '691250đ', '691250VND', '691250越南盾', '691250盾'], solve: '691250', num: true, ph: '越南盾',
  hint: '先把紙條翻成中文、算出台幣（記得看紅色的警告），最後再換成越南盾。',
  ok: [['zn', 'Ngỗng?! Không phải vịt à?', '鵝？！不是鴨喔？', 'shock'], ['jz', '鴨肉扁賣鵝，這是台灣的傳統。'], ['xy', '完全法克的傳統。']],
});

// ---------------------------------------------------------------------------
const C7_MOV = [
  ['午夜捷運', '恐怖', '輔12', 104, '—', '國語', '中/越'], ['屁孩聯盟', '喜劇', '普遍', 96, '有', '國語', '中/越'], ['西門町的夏天', '愛情', '保護', 112, '—', '國語', '中/越'],
  ['神人特攻隊', '動作', '輔12', 128, '有', '英語', '中'], ['河內的月亮', '劇情', '保護', 118, '—', '越南語', '中'], ['鬼提款機', '恐怖', '限制', 99, '有', '國語', '中'], ['機車騎士', '動作', '輔15', 121, '有', '台語', '中/越'],
];
const C7_SHOWS = [['A1', '屁孩聯盟', 2, '20:30'], ['A2', '午夜捷運', 3, '20:50'], ['A3', '神人特攻隊', 6, '20:40'], ['A4', '河內的月亮', 1, '19:55'], ['A5', '機車騎士', 7, '21:00'], ['A6', '西門町的夏天', 5, '21:10'], ['A7', '鬼提款機', 2, '21:20'],
  ['A8', '河內的月亮', 3, '21:30'], ['A9', '機車騎士', 1, '20:45'], ['B1', '神人特攻隊', 5, '21:05'], ['B2', '屁孩聯盟', 1, '22:10'], ['B3', '機車騎士', 2, '22:05'], ['B4', '河內的月亮', 6, '22:00'], ['B5', '午夜捷運', 5, '21:45']];
P({
  id: 'c7_cinema', ch: 7, t: '電影街・看哪一場', lv: 2, icon: '🎬', pos: [82, 26],
  body: () => `<p>電影街的售票機前，四個人吵了二十分鐘還沒決定。每個人都有自己的條件（看線索卡），<b>符合所有人條件的場次只有一場</b>。</p>
    <div class="c7-movs">${C7_MOV.map(([t, g, r, len, egg, lang, sub]) => `<div><b>${t}</b><span>${g}・${r}・${len} 分</span><span>語言：${lang}　字幕：${sub}</span><span>片尾彩蛋：${egg === '有' ? '<em>有</em>' : '沒有'}</span></div>`).join('')}</div>
    <div class="c7-shows">${C7_SHOWS.map(([c, m, h, t]) => `<div><b>${c}</b>${t}　${h}廳<br><span style="font-family:var(--sans,sans-serif)">${m}</span></div>`).join('')}</div>
    <div class="paper" style="font-size:14px">🏛️ 廳別：1、2、3、5 廳是一般廳；6 廳是 IMAX、7 廳是 4DX。<br>⏰ 每一場的時間是「開演時間」，開演後先播 <b>15 分鐘廣告</b>，然後才是正片。</div>
    <p><b>他們最後看的是哪一場？</b>（輸入場次代碼，例如 B2）</p>`,
  split: [
    `<b>甄妮：</b><span class="c7-vn" style="display:block;font-size:15px">“Tôi cần phim nói tiếng Việt, hoặc có phụ đề tiếng Việt.”</span><small>小抄：tôi cần 我需要・phim 電影・nói 說・tiếng Việt 越南語・hoặc 或者・có 有・phụ đề 字幕</small>`,
    '<b>小羽：</b>「我們 20:20 才會到電影街。廣告錯過沒關係，<b>正片的開頭</b>絕對不能錯過。還有，普遍級的我不看，太幼稚。」',
    '<b>博育：</b>「西門站的末班捷運是 23:52。片尾有彩蛋的話要看完彩蛋（多 8 分鐘），散場走到捷運站要 10 分鐘。還有俊治看愛情片一定會睡著。」',
    '<b>俊治：</b>「我身上只剩兩百塊，IMAX、4DX 太貴了，不要。博育怕鬼，恐怖片也不行。」',
  ],
  ans: ['A9'], solve: 'A9', ph: '場次代碼',
  hint: '把 14 場一場一場拿四個人的條件去刪。散場時間要把廣告、正片、彩蛋、走路全部加起來。',
  ok: [['xy', '機車騎士，台語配越南字幕。'], ['zn', 'Phim này hay lắm!', '這部好好看！', 'happy'], ['jz', '我聽不懂台語。'], ['by', '學長，你是台灣人。']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c7_crypt', ch: 7, t: '潮牌店的霓虹算式', lv: 2, icon: '🧢', pos: [20, 52],
  body: () => `<p>潮牌店的牆上掛著兩條霓虹燈，店員說：「解得開的人，打九折。」</p>
    <div class="c7-neon">神人 × 神人 ＝ BANG</div>
    <div class="c7-neon b">完全 − 法克 ＝ 人</div>
    <div class="paper">📌 <b>神、人、B、A、N、G、完、全、法、克</b> 這十個符號，剛好代表 <b>0～9</b> 十個不同的數字（每個數字都用到一次）。<br>📌 每個詞最前面的符號都不是 0。</div>
    <p><b>「完全法克」是哪四個數字？</b></p>`,
  ans: ['2319', '2-3-1-9'], solve: '2319', num: true, ph: '四位數',
  hint: '「神人」平方要是四位數，而且四個數字都不一樣、也不能跟神人重複。列出所有可能，再用第二條把剩下的四個數字湊起來。',
  ok: [['jz', '84 的平方是 7056。'], ['xy', '所以我是 84 分的神人。'], ['by', '打九折還是很貴……']],
});

// ---------------------------------------------------------------------------
const C7_RC = [
  ['潮T', '115-08-14', '12208147', 'SUPER BANG'], ['帽子', '115-07-30', '48213561', 'SUPER BANG'], ['球鞋', '115-09-02', '77135726', '神人運動'], ['襪子', '115-08-03', '50481204', '神人運動'],
  ['背包', '115-07-12', '91316942', '西門潮流'], ['飲料', '115-08-21', '23456968', '珍奶研究所'], ['墨鏡', '115-07-05', '80247147', '西門潮流'], ['打火機', '115-08-30', '10035726', '便利商店'],
];
P({
  id: 'c7_invoice', ch: 7, t: '潮牌發票對獎', lv: 2, icon: '🧾', pos: [44, 54],
  body: () => `<p>小羽在潮牌街買了一整晚，口袋裡塞滿了發票。博育剛好查到這一期的中獎號碼。</p>
    <div class="c7-win"><b>115 年 07～08 月 統一發票中獎號碼</b><table>
      <tr><th>特別獎 1000 萬</th><td>48213560</td></tr><tr><th>特獎 200 萬</th><td>07316942</td></tr>
      <tr><th>頭獎 20 萬</th><td>66208147<br>39581204<br>81135726</td></tr><tr><th>增開六獎 200</th><td>302・968</td></tr></table>
      <div style="font-size:13px;margin-top:4px">📜 特別獎、特獎：8 碼<b>全部相同</b>才算。<br>📜 頭獎號碼：8 碼全同＝頭獎；末 7 碼同＝二獎 4 萬；末 6 碼＝三獎 1 萬；末 5 碼＝四獎 4 千；末 4 碼＝五獎 1 千；末 3 碼＝六獎 200。<br>📜 增開六獎：末 3 碼相同＝200 元。<br>📜 一張發票只能領最高的那一個獎，而且<b>只有這一期開立的發票</b>才能對。</div></div>
    <div class="c7-rcpts">${C7_RC.map(([w, d, n, s], i) => `<div class="c7-rc"><small>${s}</small><br>電子發票證明聯<br><small>${d}</small><b>${['QX', 'BN', 'ZT', 'KM', 'XY', 'JZ', 'BY', 'ZN'][i]}-${n}</b><small>品項：${w}</small></div>`).join('')}</div>
    <p><b>小羽這些發票總共可以領多少錢？</b></p>`,
  ans: ['18400', '18400元'], solve: '18400', num: true, ph: '金額',
  hint: '先把日期不對的拿掉；特別獎、特獎差一個數字都不算；每張頭獎號碼都要從末 3 碼開始往前比，比到不一樣為止。',
  ok: [['xy', '一萬八！我是發票之神。'], ['jz', '你買了三萬塊的東西。'], ['xy', '……'], ['by', '這叫完全法克。']],
});

// ---------------------------------------------------------------------------
const C7_DUCK = ['...###....', '..#####...', '..##.###..', '######....', '...####...', '..#######.', '.#########', '.#########', '..#######.', '....#.#...'];
const C7_CL = (l) => { const r = []; let c = 0; for (const x of l) { if (x === '#') c++; else if (c) { r.push(c); c = 0; } } if (c) r.push(c); return r.length ? r.join(' ') : '0'; };
P({
  id: 'c7_tattoo', ch: 7, t: '刺青街的圖稿', lv: 2, icon: '🖋️', pos: [68, 46],
  body: () => `<p>俊治在刺青店門口說他要刺一隻「很霸氣的動物」。刺青師傅沒說話，只給了他一張用數字寫成的圖稿：每一列、每一行的數字，代表那一條上面<b>連續塗黑的格子有幾格</b>（不同段之間至少隔一格空白，順序照數字的順序）。</p>
    <p class="note">把格子塗出來，按「確定送出」交給師傅。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const g = C7_DUCK, R = g.map(r => C7_CL(r).replace(/ /g, '&nbsp;&nbsp;')), C = g[0].split('').map((_, j) => C7_CL(g.map(r => r[j]).join('')));
    if (done) { el.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 100 100" style="width:160px;display:block;margin:6px auto">${g.map((r, i) => [...r].map((x, j) => x === '#' ? `<rect x="${j * 10}" y="${i * 10}" width="10" height="10" fill="#2A2230"/>` : '').join('')).join('')}</svg>`); return; }
    const box = document.createElement('div'); el.append(box);
    const r = K.grid(box, ctx, { r: 10, c: 10, rowClue: R, colClue: C });
    r.wrap.classList.add('c7-nono'); r.wrap.style.textAlign = 'center';
  },
  ui: 'none', ans: [C7_DUCK.join('').replace(/#/g, '1').replace(/\./g, '0')], solve: C7_DUCK.join('').replace(/#/g, '1').replace(/\./g, '0'), show: '一隻鴨子',
  hint: '先找數字加起來很大的列（9、9），它們幾乎整排都是黑的；再用旁邊的行把位置夾出來。',
  ok: [['jz', '……這是鴨子。'], ['xy', '很霸氣啊，鴨肉扁的那種。'], ['zn', 'Con vịt! Dễ thương!', '鴨子！好可愛！', 'happy'], ['jz', '完全法克。']],
});

// ---------------------------------------------------------------------------
const C7_RH = (() => {
  const digits = [3, 8, 1, 6, 0, 9, 4, 7], R = 108, cx = 170, cy = 160;
  const pt = (k) => { const a = (k * 45 - 22.5 - 90) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
  let s = `<rect width="340" height="320" rx="14" fill="#2B2A36"/>`;
  s += `<rect x="150" y="268" width="40" height="52" fill="#4A3A40"/><text x="170" y="300" text-anchor="middle" font-size="11" fill="#C8B8A8">十字樓</text>`;
  s += `<polygon points="${Array.from({ length: 8 }, (_, k) => pt(k).join(',')).join(' ')}" fill="#A8382C" stroke="#5A1A12" stroke-width="4"/>`;
  s += `<polygon points="${Array.from({ length: 8 }, (_, k) => { const [x, y] = pt(k); return [cx + (x - cx) * .55, cy + (y - cy) * .55].join(','); }).join(' ')}" fill="#7A2A20" stroke="#D8A890" stroke-width="2"/>`;
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 - 90) * Math.PI / 180, x = cx + R * .8 * Math.cos(a), y = cy + R * .8 * Math.sin(a);
    s += `<circle cx="${x}" cy="${y}" r="15" fill="#15112A" stroke="#FFD978" stroke-width="2"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="#FFE97A">${digits[k]}</text>`;
  }
  s += `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="16" font-weight="900" fill="#FFE9D8">紅樓</text>`;
  s += `<g transform="translate(288 54)"><circle r="40" fill="#fff" opacity=".94"/><g transform="rotate(135)"><path d="M0 -30 L9 -6 L2 -9 L2 24 L-2 24 L-2 -9 L-9 -6Z" fill="#E8453C"/></g><text x="${-Math.sin(-135 * Math.PI / 180) * 0}" y="0" font-size="0"></text><text x="${(Math.sin(135 * Math.PI / 180) * 16 - 2).toFixed(1)}" y="${(-Math.cos(135 * Math.PI / 180) * 16 - 12).toFixed(1)}" font-size="15" font-weight="900" fill="#E8453C">北</text></g>`;
  return `<svg viewBox="0 0 340 320" style="width:100%;max-width:400px;display:block;margin:6px auto">${s}</svg>`;
})();
P({
  id: 'c7_redhouse', ch: 7, t: '紅樓的八個面', lv: 2, icon: '🏮', pos: [88, 56],
  body: () => `<p>西門紅樓是一棟八角形的紅磚樓。博育用手機拍了一張<b>空拍照（從正上方往下看）</b>，八面牆上各有一個霓虹數字。甄妮在照片旁邊寫了一段話：</p>
    ${C7_RH}
    <div class="c7-vn">“Bắt đầu từ mặt đông nam, đọc số. Đi theo chiều kim đồng hồ ba mặt, đọc số. Rồi đi ngược chiều kim đồng hồ năm mặt, đọc số. Cuối cùng, đọc số ở mặt đối diện.”</div>
    ${C7DICT([['bắt đầu từ', '從…開始'], ['mặt', '面'], ['đông', '東'], ['nam', '南'], ['tây', '西'], ['bắc', '北'], ['đọc số', '讀數字'], ['đi theo', '沿著'], ['chiều kim đồng hồ', '順時針'], ['ngược', '反方向'], ['ba / năm', '3 / 5'], ['rồi', '然後'], ['cuối cùng', '最後'], ['ở', '在'], ['đối diện', '對面']])}
    <p class="note">「走一面」是移到隔壁的那一面。</p>
    <p><b>甄妮讀到的四個數字是？</b></p>`,
  ans: ['4803', '4-8-0-3'], solve: '4803', num: true, ph: '四位數',
  hint: '照片的上方不一定是北。先找出東南面在哪裡；從上往下看的順時針，就是照片上的順時針。',
  ok: [['zn', 'Đúng rồi! Tôi thích tòa nhà này.', '對了！我喜歡這棟樓。'], ['by', '紅樓以前是市場，現在是劇場。'], ['xy', '講重點。'], ['by', '……很紅。']],
});

// ---------------------------------------------------------------------------
const C7_RN = {
  ex6: { x: 540, y: 330, label: '6號出口', dy: 30 }, hh: { x: 70, y: 330, label: '紅樓', dy: 30 }, a: { x: 420, y: 330, label: '萬年大樓', dy: 30 }, b: { x: 300, y: 330, label: '刺青街', dy: 30 }, c: { x: 190, y: 330, label: '電影街', dy: 30 },
  d: { x: 540, y: 200, label: '鴨肉扁', dx: 0 }, e: { x: 420, y: 200, label: '夾娃娃機' }, f: { x: 300, y: 200, label: 'KTV' }, g: { x: 190, y: 200, label: '潮牌店' }, h: { x: 70, y: 200, label: '美國街' },
  i: { x: 420, y: 70, label: '電影公園' }, j: { x: 190, y: 70, label: '天后宮' }, k: { x: 540, y: 70, label: '中華路口' },
};
const C7_RE = [['ex6', 'a', 3], ['a', 'b', 4], ['b', 'c', 3], ['c', 'hh', 4], ['ex6', 'd', 4], ['a', 'e', 2], ['b', 'f', 5], ['c', 'g', 2], ['hh', 'h', 3], ['d', 'e', 3], ['e', 'f', 4], ['f', 'g', 3], ['g', 'h', 5], ['d', 'k', 6], ['e', 'i', 3], ['i', 'j', 6], ['j', 'g', 4], ['k', 'i', 2], ['j', 'h', 3], ['f', 'i', 4], ['b', 'e', 4]];
P({
  id: 'c7_route', ch: 7, t: '從 6 號出口出發', lv: 1, icon: '🚇', pos: [14, 80],
  body: () => `<p>大家從<b>捷運西門站 6 號出口</b>出來，約好最後在<b>紅樓</b>集合。每個人都有一個一定要去的地方：</p>
    <div class="paper">🦢 甄妮：一定要吃<b>鴨肉扁</b>。<br>🧢 俊治：要去<b>潮牌店</b>。<br>📸 小羽：要在<b>電影公園</b>拍照打卡。<br>😇 博育：「我們一起走，<b>每個路口最多經過一次</b>，而且要走<b>最快</b>的路線。」</div>
    <p class="note">線上的數字是走路的分鐘數。點相鄰的地點畫出路線，按「確定送出」。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const N = Object.fromEntries(Object.entries(C7_RN).map(([k, v]) => [k, { r: 15, fs: 21, ...v, dy: v.dy ? 36 : -24 }])), bg = C7_RE.map(([a, b, w]) => { const x = (N[a].x + N[b].x) / 2, y = (N[a].y + N[b].y) / 2; return `<g><circle cx="${x}" cy="${y}" r="17" fill="#FFF3C4" stroke="#C8A85A" stroke-width="2"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="20" font-weight="900" fill="#8A5A10">${w}</text></g>`; }).join('');
    if (done) return;
    // 權重標籤放在線的上面：先畫線（kit 會畫），所以用 bg 放在最下面不夠，這裡把標籤疊在 svg 最上層
    const box = K.route(el, ctx, { w: 610, h: 390, nodes: N, edges: C7_RE.map(([a, b]) => [a, b]), start: 'ex6', bg: '' });
    const fix = () => { const svg = box.querySelector('svg'); if (svg && !svg.querySelector('.c7-w')) svg.insertAdjacentHTML('beforeend', `<g class="c7-w" pointer-events="none">${bg}</g>`); };
    fix(); new MutationObserver(fix).observe(box, { childList: true });
  },
  ui: 'none', ans: ['ex6-d-e-i-f-g-c-hh'], solve: 'ex6-d-e-i-f-g-c-hh', show: '6號出口 → 鴨肉扁 → 夾娃娃機 → 電影公園 → KTV → 潮牌店 → 電影街 → 紅樓（23 分鐘）',
  hint: '先決定三個地方的拜訪順序，再算每一段的最短走法；不能重複經過同一個路口。',
  ok: [['by', '23 分鐘，完美。', null, 'happy'], ['xy', '學弟變成人體導航了。'], ['jz', '神人。']],
});

// ---------------------------------------------------------------------------
const C7_SONGS = [['03400', '河內的月光'], ['13400', '月光神人'], ['73400', '完全法克之歌'], ['01400', '西門町的雨'], ['07400', 'Bang Bang 愛你'], ['03410', '紅樓夢醒'], ['03470', '末班捷運'], ['02400', '學弟不要哭'],
  ['37282', '屁孩宣言'], ['89211', '台北夜未眠'], ['88722', '胡志明的夏天'], ['56019', '夾娃娃人生'], ['40536', '刺青'], ['91827', '鴨肉扁之戀'], ['63400', '淡水的夕陽'], ['03900', '九份的燈籠']];
// 遙控器的壞燈：第 1 位 d 常亮、第 2 位 b 不亮、第 3 位 e 不亮、第 4 位 f 常亮、第 5 位 d 常亮
const C7_FAULT = [['', 'd'], ['b', ''], ['e', ''], ['', 'f'], ['', 'd']];
const C7_READ = (code) => [...code].map((d, p) => { let s = C7SEG[d].split('').filter(x => !C7_FAULT[p][0].includes(x)); for (const x of C7_FAULT[p][1]) if (!s.includes(x)) s.push(x); return s.sort().join(''); });
P({
  id: 'c7_ktv', ch: 7, t: '夢魘・KTV 壞掉的遙控器', lv: 3, icon: '🎤', pos: [40, 82],
  body: () => `<p>KTV 包廂的點歌遙控器很舊，螢幕上的數字燈管有一些壞掉了。甄妮想唱一首越南歌，俊治幫她輸入了五位數的歌號，螢幕顯示：</p>
    ${C7LCD(C7_READ('03400'))}
    <p>俊治：「我忘記我按了什麼。」——到底點到了哪一首？</p>
    <div class="c7-songs">${C7_SONGS.map(([c, t]) => `<div><b>${c}</b>${t}</div>`).join('')}</div>
    <div class="paper" style="font-size:14px">🔧 正常的數字長這樣：${C7LCD([...'0123456789'].map(d => C7SEG[d]), { max: 360, on: '#FFB43A', off: '#2A2418' })}
    每一位的燈管壞掉的方式都不一樣：有的燈管<b>永遠不會亮</b>，有的<b>永遠亮著</b>（也可能完全沒壞）。同一位、同一根燈管，壞掉的方式一直都一樣。<br>今晚大家已經用同一支遙控器點過三首歌（看線索卡）。</p>`,
  split: [
    `小羽點了〈屁孩宣言〉<b>37282</b>，當時螢幕顯示：${C7LCD(C7_READ('37282'), { max: 260 })}`,
    `博育點了〈台北夜未眠〉<b>89211</b>，當時螢幕顯示：${C7LCD(C7_READ('89211'), { max: 260 })}`,
    `俊治點了〈胡志明的夏天〉<b>88722</b>，當時螢幕顯示：${C7LCD(C7_READ('88722'), { max: 260 })}`,
  ],
  ans: ['03400', '河內的月光', '〈河內的月光〉'], solve: '03400', ph: '歌號或歌名',
  hint: '一位一位分開看：拿三首已知的歌，比較「應該亮的」和「真的亮的」，找出每一位哪根燈管永遠不亮、哪根永遠亮。還不確定的燈管，就讓它保持「不知道」。',
  ok: [['zn', 'Đây là bài hát tôi muốn!', '就是我想唱的這首！', 'happy'], ['jz', '我就說我沒按錯。'], ['by', '你剛剛說你忘記了。'], ['xy', 'Bang!']],
});

// ---------------------------------------------------------------------------
// 牆上的塗鴉：口頭禪＋符號（正多邊形的角數）
const C7_TAGS = [
  ['好吃', 3, '#FFB43A', 20, 30, -6], ['神人', 6, '#FF5AC8', 150, 24, 4], ['導遊通過', 4, '#7AE8FF', 270, 40, -3],
  ['笑死', 7, '#9FE07A', 30, 120, 3], ['Bang!', 0, '#FF6A4A', 160, 118, -5], ['恭喜入教', 8, '#C8A8FF', 266, 128, 5],
  ['講重點', 3, '#7AE8FF', 18, 212, -2], ['完全法克', 5, '#FFE24A', 140, 206, 3], ['屁孩很多', 4, '#FF8AB0', 268, 220, -4], ['真假', 6, '#9FE07A', 108, 290, 2],
];
const C7_POLY = (n, x, y, r, col) => n === 0 ? `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="3"/>` : `<polygon points="${Array.from({ length: n }, (_, k) => { const a = (k / n) * 2 * Math.PI - Math.PI / 2; return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`; }).join(' ')}" fill="none" stroke="${col}" stroke-width="3"/>`;
const C7_WALL = (() => {
  let s = `<rect width="400" height="350" fill="#3A2A2E"/>`;
  for (let y = 0; y < 350; y += 18) for (let x = (y / 18) % 2 ? -18 : 0; x < 400; x += 36) s += `<rect x="${x + 1}" y="${y + 1}" width="34" height="16" fill="#4A3438" opacity=".7"/>`;
  C7_TAGS.forEach(([w, n, col, x, y, r]) => {
    const fs = w.length > 3 ? 21 : 25, tw = [...w].reduce((t, ch) => t + (ch.charCodeAt(0) < 128 ? fs * .62 : fs), 0);
    s += `<g transform="rotate(${r} ${x + 50} ${y + 30})"><text x="${x}" y="${y + 40}" font-size="${fs}" font-weight="900" fill="${col}" style="paint-order:stroke" stroke="#000" stroke-width="3" font-style="italic">${w}</text>${C7_POLY(n, x + tw + 22, y + 32, 15, col)}</g>`;
  });
  return `<svg viewBox="0 0 400 350" style="width:100%;border-radius:12px;display:block">${s}</svg>`;
})();
P({
  id: 'c7_wall', ch: 7, t: '西門町密碼牆', lv: 2, icon: '🧱', pos: [66, 78],
  need: ['c7_words', 'c7_cinema', 'c7_crypt', 'c7_ktv'],
  body: () => `<p>塗鴉牆的最下面有一個三位數的密碼鎖。牆上用噴漆寫著：<b>「年輕人說話不一定有意義，但每一句話都有可能是線索。」</b></p>
    ${C7_WALL}
    <div class="paper">① 牆上只有<b>三句</b>是真正的「口頭禪」：同一句話，在旅行日誌裡<b>被說了不只一次</b>。<br>
    ② 每一句口頭禪代表一個數字：<b>它在旅行日誌裡一共出現的次數＋旁邊那個符號的角數</b>，只取個位數。<br>
    ③ 三個數字的順序，照它們在旅行日誌裡<b>第一次出現的先後</b>排。</div>
    <p class="note">📓 右上角的旅行日誌記錄了這兩天所有人說過的話（包括剛剛在西門町說的）。圓形沒有角。</p>`,
  ans: ['527', '5-2-7'], solve: '527', num: true, ph: '三位數',
  hint: '先去日誌裡找：牆上哪三句話被說過兩次以上？然後一句一句數清楚，不管是誰說的都算。',
  ok: [['xy', '等等，這是我們的口頭禪。'], ['jz', '我們的屁話值三位數。'], ['by', '五、二、七……我記住了。']],
});
