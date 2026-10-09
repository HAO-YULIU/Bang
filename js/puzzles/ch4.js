'use strict';
// ===== 第四章：十分——願望與鐵軌（11 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c4-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 3px 8px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 6px 0; }
.c4-dict span b { color: #C9332B; }
.c4-vn { font-size: 16px; font-weight: 700; color: #1E5AA8; background: #EAF3FF; border-radius: 10px; padding: 8px 12px; margin: 6px 0; }
.c4-tt { width: 100%; font-size: 13px !important; background: #1D2A22; color: #FFE7A0; border-radius: 10px; overflow: hidden; }
.c4-tt th { background: #2E4636; color: #9FE0B8; font-weight: 400; }
.c4-tt td, .c4-tt th { border: 0 !important; border-bottom: 1px solid #34503E !important; padding: 4px 3px !important; white-space: nowrap; }
.c4-tt .nt { color: #FF9A8A; font-size: 11px; white-space: normal; }
.c4-tt caption { caption-side: top; text-align: left; font-weight: 900; color: #2E4636; padding: 4px 0; }
.c4-board { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.c4-board div { background: #FFF1D6; border: 2px solid #E8A050; border-radius: 10px; padding: 6px 8px; text-align: center; font-weight: 700; }
.c4-board small { display: block; font-weight: 400; color: #8A5A30; }
.c4-poem { font-family: var(--serif, serif); font-size: 21px; letter-spacing: .25em; line-height: 1.9; text-align: center; background: linear-gradient(180deg, #FFF3C4, #FFD48A); border: 2px solid #E8A050; border-radius: 14px 14px 30px 30px; padding: 10px; color: #8A3A10; }
.c4-sw { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: -2px; margin-right: 3px; border: 1.5px solid rgba(0,0,0,.25); }
.c4-face-s { writing-mode: horizontal-tb; font-size: 10px; font-weight: 400; color: #B88A55; line-height: 1.25; }
.c4-face-m { writing-mode: horizontal-tb; font-size: 12px; font-weight: 700; color: #A0522D; line-height: 1.3; }
.c4-face { display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 100%; writing-mode: horizontal-tb; }
.c4-face .bigc { font-size: 34px; font-weight: 900; color: #B8321E; line-height: 1.1; }
.c4-wrap .k-grid { --cell: 27px; }
.c4-wrap .k-gc { font-size: 11px; }
.c4-ws { --wcell: 36px; text-align: center; }
.c4-ws .k-wc { font-size: 16px; }
@media (max-width: 420px) { .c4-ws { --wcell: 34px; } .c4-poem { font-size: 18px; letter-spacing: .15em; } }
</style>`);

const C4DICT = (words) => `<div class="c4-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// ---------- 1. 天燈漂流（越南語風向，多人分卡） ----------
const C4_WIND = (() => {
  const S = 66, L = {
    '0,0': '望古', '0,4': '派出所', '0,6': '嶺腳', '1,1': '雞翅攤', '1,4': '靜安吊橋', '2,0': '四廣潭', '2,4': '郵局',
    '3,0': '煤礦館', '3,2': '十分車站', '3,6': '十分寮', '4,2': '土地公廟', '5,2': '觀瀑吊橋', '5,5': '老街口', '6,0': '大華', '6,2': '十分瀑布', '6,6': '平溪', '4,5': '月台咖啡',
  };
  let g = `<rect x="0" y="0" width="${S * 7 + 20}" height="${S * 7 + 20}" rx="14" fill="#DDEBD6"/><path d="M10 ${S * 4.7} C 120 ${S * 4.2}, 200 ${S * 5.6}, ${S * 7 + 10} ${S * 5.1}" stroke="#8CC4E8" stroke-width="16" fill="none" opacity=".7"/>`;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const x = 10 + c * S, y = 10 + r * S, n = L[`${r},${c}`];
    g += `<rect x="${x + 2}" y="${y + 2}" width="${S - 4}" height="${S - 4}" rx="7" fill="${n ? '#FFF6E2' : 'rgba(255,255,255,.35)'}" stroke="#B8C8A8"/>`;
    if (n) g += `<text x="${x + S / 2}" y="${y + S / 2 + 5}" text-anchor="middle" font-size="${n.length > 3 ? 12.5 : 14}" font-weight="700" fill="#4A3A20">${n}</text>`;
  }
  g += `<g transform="translate(${10 + 3 * S + S / 2} ${10 + 3 * S + S / 2})"><circle r="27" fill="#FFD978" stroke="#E8453C" stroke-width="3"/><text y="-4" text-anchor="middle" font-size="20">🏮</text><text y="18" text-anchor="middle" font-size="11" font-weight="900" fill="#C9332B">起飛</text></g>`;
  g += `<g transform="translate(43 373)"><circle r="20" fill="#fff" stroke="#2A2230" stroke-width="2"/><text y="-6" text-anchor="middle" font-size="12" font-weight="900">北</text><path d="M0 -2 V14 M-5 3 L0 -3 L5 3" stroke="#C9332B" stroke-width="2.5" fill="none"/></g>`;
  return `<svg viewBox="0 0 ${S * 7 + 20} ${S * 7 + 20}" style="width:100%;max-width:470px;display:block;margin:0 auto">${g}</svg>`;
})();
P({
  id: 'c4_wind', ch: 4, t: '天燈飄去哪了', lv: 2, icon: '🌬️', pos: [14, 22],
  body: () => `<p>甄妮的第一盞天燈從老街中間（🏮）飛起來以後，被風吹走了。氣象站的阿伯每隔幾分鐘就廣播一次風向，甄妮全部用越南語抄了下來。</p>${C4_WIND}
    <p class="note">每一格是一個街區。天燈每次被風吹，就沿著風的方向「整格整格」地移動，斜的方向也是走斜的格子。</p>
    ${C4DICT([['gió', '風'], ['ô', '格'], ['một / hai / ba', '1 / 2 / 3'], ['bắc', '北'], ['nam', '南'], ['đông', '東'], ['tây', '西'], ['đông bắc', '東北'], ['tây nam', '西南'], ['đông nam', '東南'], ['dừng lại', '停下來']])}
    <p><b>天燈最後掉在哪裡？</b>（地名）</p>`,
  split: [
    '氣象站阿伯的說明：「我們說的『東北風』，是<b>從東北邊吹過來</b>的風。」另外，甄妮在筆記本邊邊寫：<b>dừng lại</b> 之後，天燈就落地了，後面的廣播都不用管。',
    '甄妮的筆記（前兩則）：<div class="c4-vn">① 15:02　gió tây, ba ô<br>② 15:06　gió đông nam, hai ô</div>',
    '甄妮的筆記（中間兩則）：<div class="c4-vn">③ 15:11　gió đông bắc, hai ô<br>④ 15:15　gió bắc, ba ô</div>',
    '甄妮的筆記（最後兩則）：<div class="c4-vn">⑤ 15:20　dừng lại!<br>⑥ 15:24　gió nam, hai ô</div>',
  ],
  ans: ['十分瀑布', '瀑布', '十分瀑布那裡'], solve: '十分瀑布', ph: '地名',
  hint: '「西風」不是往西吹的風。每一則照時間順序移動，留意哪一則之後就不用再算了。',
  ok: [['zn', 'Đèn của tôi rơi xuống thác nước!', '我的天燈掉進瀑布了！', 'cry'], ['xy', '願望直接被沖走。'], ['jz', '這叫一路順風。']],
});

// ---------- 2. 平溪線小火車（時刻表推理，多人分卡） ----------
P({
  id: 'c4_train', ch: 4, t: '小火車時刻表', lv: 2, icon: '🚂', pos: [38, 18],
  body: () => `<p>四個人是搭平溪線小火車到十分的。路上發生了很多事，每個人都只記得一段。月台上貼著今天的時刻表：</p>
    <table class="c4-tt"><caption>▼ 往菁桐（下行）</caption><tr><th>車次</th><th>瑞芳</th><th>猴硐</th><th>十分</th><th>望古</th><th>備註</th></tr>
    ${[['4713', '10:40', '10:47', '11:07', '11:11', ''], ['4715', '11:02', '11:09', '11:29', '11:33', '假日停駛'], ['4717', '11:15', '↓', '11:40', '11:44', '↓＝通過不停'], ['4719', '11:34', '11:41', '12:01', '12:05', ''], ['4721', '12:20', '12:27', '12:47', '12:51', ''], ['4723', '13:05', '13:12', '13:32', '13:36', '']].map(r => `<tr>${r.map((x, i) => `<td class="${i === 5 ? 'nt' : ''}">${x}</td>`).join('')}</tr>`).join('')}</table>
    <table class="c4-tt"><caption>▲ 往瑞芳（上行）</caption><tr><th>車次</th><th>菁桐</th><th>望古</th><th>十分</th><th>瑞芳</th></tr>
    ${[['4720', '12:12', '12:22', '12:26', '12:51'], ['4722', '12:28', '12:38', '12:42', '13:07'], ['4724', '12:43', '12:53', '12:57', '13:22'], ['4726', '12:57', '13:07', '13:11', '13:36'], ['4728', '13:20', '13:30', '13:34', '13:59']].map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>
    <p><b>最後把他們載進十分車站的，是哪一班車？</b>（車次）</p>`,
  split: [
    '博育：「我們搭的莒光號 <b>10:52</b> 到瑞芳。換車至少要 5 分鐘。我們搭的是最早能搭、而且<b>會停猴硐</b>的那班車。對了，今天是<b>星期六</b>。」',
    '小羽：「我在<b>猴硐</b>下車看貓，看了剛好 <b>45 分鐘</b>，一回到月台就搭最早來的往菁桐的車。」',
    '俊治：「上車我就睡著了，醒來發現<b>坐過十分一站</b>。只好下車，走地下道到對面月台（<b>至少 3 分鐘</b>），搭第一班往回開的車。」',
    '甄妮：「Lúc đến Thập Phần, đồng hồ chỉ… 我記得月台時鐘的『分』，是<b>兩個一樣的數字</b>。」',
  ],
  ans: ['4726', '4726次'], solve: '4726', num: true, ph: '車次',
  hint: '一段一段排時間：每一個人的話都會讓你換一班車。「假日停駛」和「通過不停」都要看；最後一段是反方向的車。',
  ok: [['jz', '所以是我睡過頭，我們才多看了一站風景。'], ['xy', '你應該謝謝他。'], ['by', '我不會謝他。']],
});

// ---------- 3. 瀑布旁的石碑（算式密碼） ----------
P({
  id: 'c4_stone', ch: 4, t: '瀑布石碑算式', lv: 2, icon: '🪨', pos: [62, 22],
  body: () => `<p>十分瀑布步道旁有一塊長滿青苔的石碑，刻著三行算式。旁邊的告示寫著：「每一個字代表一個數字，<b>十個字剛好用掉 0～9</b>，不同的字是不同的數字；兩個字的數，第一個字不是 0。」</p>
    <svg viewBox="0 0 400 210" style="width:100%;max-width:420px;display:block;margin:0 auto"><path d="M30 200 L40 30 Q200 -10 360 30 L370 200 Z" fill="#8E9A8A" stroke="#5E6A5A" stroke-width="4"/>
      <path d="M50 190 L60 50 Q200 18 340 50 L350 190 Z" fill="#A7B3A2"/>
      ${['天燈 × 望 ＝ 平溪', '平溪 ＋ 願望 ＝ 瀑布', '十分 − 瀑布 ＝ 分 ＋ 溪'].map((t, i) => `<text x="200" y="${88 + i * 42}" text-anchor="middle" font-size="25" font-weight="900" fill="#2F3A2C" letter-spacing="2" font-family="serif">${t}</text>`).join('')}
      <circle cx="80" cy="180" r="14" fill="#5E8A4A" opacity=".7"/><circle cx="330" cy="70" r="10" fill="#5E8A4A" opacity=".6"/></svg>
    <p><b>「十分瀑布」這四個字代表的四位數是多少？</b></p>`,
  ans: ['9086'], solve: '9086', num: true, ph: '四位數',
  hint: '先看第三行：兩個兩位數相減，結果只是兩個個位數相加，所以「十分」和「瀑布」很接近。第一行的乘法也很有限。',
  ok: [['by', '十分瀑布九零八六……好像電話號碼。'], ['xy', '打打看。'], ['jz', '神人。']],
});

// ---------- 4. 天燈數織 ----------
const C4_NONO = '..######../.########./.###..###./##......##/.###..###./..##..##../..######../...####.../....#...../...###....'.split('/');
const C4_CL = (line) => { const r = []; let c = 0; for (const v of line) { if (v) c++; else if (c) { r.push(c); c = 0; } } if (c) r.push(c); return r.length ? r.join(' ') : '0'; };
P({
  id: 'c4_nono', ch: 4, t: '天燈紙的格子', lv: 1, icon: '🧩', pos: [86, 20],
  body: () => `<p>天燈店老闆給了一張方格紙：「先把這張圖畫出來，我才賣你們特別款。」每一列、每一行旁邊的數字，代表那一條線上<b>連續塗黑的格子有幾段、各有幾格</b>（順序照左到右、上到下，段和段之間至少隔一格白的）。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const G = C4_NONO.map(r => [...r].map(c => c === '#' ? 1 : 0));
    const wrap = document.createElement('div'); wrap.className = 'c4-wrap'; el.append(wrap);
    K.grid(wrap, ctx, { r: 10, c: 10, rowClue: G.map(C4_CL), colClue: [...Array(10)].map((_, j) => C4_CL(G.map(r => r[j]))), start: done ? G.flat().join('') : undefined, noSubmit: done });
  },
  ui: 'none', ans: [C4_NONO.join('').replace(/#/g, '1').replace(/\./g, '0')], solve: C4_NONO.join('').replace(/#/g, '1').replace(/\./g, '0'), show: '一盞中間開了「十」字窗的天燈',
  hint: '先找數字最大的那幾行（8、6），它們的中間幾格一定是黑的；再從「3 3」「2 2」這種兩段的行慢慢推。',
  ok: [['zn', 'Đèn trời có chữ 十!', '天燈上有一個「十」！', 'happy'], ['xy', '十分的十。'], ['jz', '老闆很會做行銷。']],
});

// ---------- 5. 射天燈（K.aim + 越南語規則） ----------
P({
  id: 'c4_shoot', ch: 4, t: '射天燈小遊戲', lv: 1, icon: '🎯', pos: [24, 46],
  body: () => `<p>老街的遊戲攤：一堆小天燈慢慢往上飄，紅色準星會左右移動，按「發射！」就打準星所在的位置。老闆只給甄妮看規則，而且是越南語版：</p>
    <div class="c4-vn">“Bắn hết đèn đỏ có số chẵn, từ nhỏ đến lớn. Sau đó bắn đèn vàng có số lẻ lớn nhất.”</div>
    ${C4DICT([['bắn', '射'], ['hết', '全部'], ['đèn', '燈'], ['đỏ', '紅'], ['vàng', '黃'], ['xanh lá', '綠'], ['xanh dương', '藍'], ['có', '有'], ['số chẵn', '偶數'], ['số lẻ', '奇數'], ['từ nhỏ đến lớn', '由小到大'], ['sau đó', '然後'], ['lớn nhất', '最大']])}
    <p class="note">⚠️ 沒打到東西不會怎樣；但是<b>打到不該打的燈（或順序錯）就算失敗</b>，會被當成答錯一次。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    if (done) { el.insertAdjacentHTML('beforeend', '<p class="paper">🎯 全部照順序打下來了！</p>'); return; }
    const COL = { r: '#E8453C', y: '#E0A800', g: '#2BA670', b: '#3E7ED0' };
    const list = [['r', 6], ['y', 3], ['b', 8], ['r', 2], ['g', 6], ['y', 4], ['r', 5], ['r', 8], ['b', 1], ['y', 9], ['r', 4]];
    const seq = ['r2', 'r4', 'r6', 'r8', 'y9'];
    const targets = list.map(([c, n], i) => ({ id: c + n, label: String(n), color: COL[c], r: 24, f: (t) => ({ x: 34 + i * 53, y: 330 - ((t * (26 + (i * 7) % 17) + i * 61) % 400) }) }));
    K.aim(el, ctx, {
      targets, balloon: true, bg: '#1E2450', info: '照規則一盞一盞打',
      cross: (t) => ({ x: 300 + 268 * Math.sin(t * 0.75), y: 150 }),
      onHit: (b, hits) => (b.id !== seq[hits] ? 'fail' : (hits + 1 === seq.length ? { done: true, token: 'DEN-OK' } : undefined)),
    });
  },
  ui: 'none', ans: ['DEN-OK'], solve: 'DEN-OK', show: '紅2 → 紅4 → 紅6 → 紅8 → 黃9',
  hint: '先把規則翻譯完再開槍：哪個顏色、單數還是雙數、從哪個開始。最後那一盞的顏色不一樣。',
  ok: [['jz', 'Bang! Bang! Bang!'], ['xy', '他終於打中東西了。'], ['zn', 'Giỏi quá!', '好厲害！', 'happy']],
});

// ---------- 6. 越南語找字盤 ----------
const C4_WS = ['IƠMCỚƯTT', 'ỜỔLÀGBẮH', 'RẢCNYTSÁ', 'TUÔỐÀMGC', 'NSẦUHƯNN', 'ÈÓHCMPỜƯ', 'ĐỎIƠÈIƯỚ', 'AHAGOIĐC'].map(s => [...s.normalize('NFC')]);
const C4_WORDS = ['THÁCNƯỚC', 'ĐƯỜNGSẮT', 'ĐÈNTRỜI', 'TÀUHỎA', 'PHỐCỔ', 'ƯỚCMƠ', 'SÔNG', 'MÈO', 'GIÓ', 'CẦU'].map(s => s.normalize('NFC'));
P({
  id: 'c4_words', ch: 4, t: '甄妮的字母天燈', lv: 2, icon: '🔤', pos: [76, 46],
  body: () => `<p>甄妮在一盞大天燈的一面寫滿了越南語字母。她說：「我把今天看到的十樣東西藏在裡面了，直的、橫的、斜的、倒著的都有。<b>找完之後，剩下的字母照順序念出來，就是我想說的話。</b>」</p>
    <div class="paper" style="font-size:14px">她藏的十樣東西：<b>瀑布、鐵路、天燈、火車、老街、願望、河、貓、風、橋</b></div>
    ${C4DICT([['thác nước', '瀑布'], ['đường sắt', '鐵路'], ['đèn trời', '天燈'], ['tàu hỏa', '火車'], ['phố cổ', '老街'], ['ước mơ', '願望'], ['sông', '河'], ['mèo', '貓'], ['gió', '風'], ['cầu', '橋'], ['núi', '山'], ['chợ', '市場'], ['là', '是'], ['bảy', '7'], ['hai', '2'], ['mươi', '十（二十以上）'], ['mốt', '十位後的 1']])}
    <p class="note">點一個字母當開頭、再點結尾，中間的字母就會一起被選起來。（越南語的聲調符號也要一樣才算。）</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const box = document.createElement('div'); box.className = 'c4-ws'; el.append(box);
    const msg = document.createElement('p'); msg.className = 'note'; msg.style.textAlign = 'center'; msg.textContent = '已找到 0 / 10'; el.append(msg);
    K.words(box, ctx, {
      grid: C4_WS,
      accept: (s, cells, found) => { const r = [...s].reverse().join(''); const w = C4_WORDS.find(x => x === s || x === r); return !!w && !found.includes(w) && !found.includes(s) && !found.includes(r); },
      onFound: (found) => { msg.textContent = `已找到 ${found.length} / 10` + (found.length === 10 ? '：剩下的白色格子，從左上角一列一列讀過去！' : ''); },
    });
    el.insertAdjacentHTML('beforeend', '<p><b>甄妮想說的話是什麼？</b>（輸入越南語或它代表的數字都可以）</p>');
  },
  ans: ['72', 'LÀBẢYMƯƠIHAI', 'BẢYMƯƠIHAI', 'LABAYMUOIHAI', 'BAYMUOIHAI', '是72', '七十二'], solve: '72', ph: '她想說的話',
  hint: '十個字要全部找到才會乾淨。剩下的字母先拆成越南語單字，再看小抄。',
  ok: [['zn', 'Đúng! Bảy mươi hai!', '對！七十二！', 'happy'], ['jz', '七十二是什麼？'], ['zn', 'Bí mật.', '秘密。']],
});

// ---------- 7. 旅行日誌：偷看願望 ----------
P({
  id: 'c4_peek', ch: 4, t: '小羽偷看的願望', lv: 1, icon: '📓', pos: [14, 72],
  body: () => `<p>甄妮寫願望的時候，小羽偷看到天燈的另一面寫著一首詩，可是甄妮說：「真正的願望藏在詩裡面，鑰匙是<b>俊治剛剛講的話</b>。」</p>
    <div class="c4-poem">願望全部都實現<br>飛過山河到家門<br>鐵軌一路通平溪<br>小火車安穩載我</div>
    <div class="paper" style="font-size:14px">🔑 鑰匙：從旅行日誌裡「<b>甄妮開始寫。</b>」那一句之後，一直到天燈上的字出現之前，<b>俊治說的每一句話</b>——第 1 句有幾個字，就取詩的第 1 行第幾個字；第 2 句取第 2 行……以此類推。（標點符號不算字。）</div>
    <p class="note">📓 右上角的旅行日誌記錄了每一句話。</p>
    <p><b>甄妮真正的願望是什麼？</b></p>`,
  ans: ['全家平安'], solve: '全家平安', ph: '四個字',
  hint: '去日誌裡找那一小段，只數俊治的台詞，一句一句數字數。',
  ok: [['xy', '全家平安……'], ['jz', '這個願望太正常了，我不習慣。'], ['zn', 'Còn các bạn cũng là gia đình.', '你們也算是家人。', 'happy'], ['by', '學姊……']],
});

// ---------- 8. 越南盾買天燈（匯率） ----------
P({
  id: 'c4_money', ch: 4, t: '越南盾買天燈', lv: 2, icon: '💱', pos: [38, 76],
  body: () => `<p>甄妮一個人跑去天燈店買了一堆天燈。店門口的價目表：</p>
    <div class="c4-board"><div>單色天燈<small>1 種顏色</small>200 元</div><div>雙色天燈<small>2 種顏色</small>250 元</div><div>四色天燈<small>4 種顏色</small>350 元</div><div>八色天燈<small>8 種顏色</small>500 元</div></div>
    <div class="paper" style="font-size:14px">🏮 一次買 <b>5 盞以上，總價打九折</b>　　💱 本店收越南盾：<b>1 元台幣 ＝ 800 đồng</b>（找錢一律找台幣）</div>
    <p>甄妮的收據背面寫著：</p>
    <div class="c4-vn">“Tôi mua bảy cái đèn trời, loại nào cũng có ít nhất một cái. Tôi trả hai triệu năm trăm nghìn đồng, được thối lại một nghìn một trăm chín mươi Đài tệ.”</div>
    ${C4DICT([['tôi mua', '我買了'], ['cái', '個（量詞）'], ['đèn trời', '天燈'], ['loại nào cũng', '每一種都'], ['ít nhất', '至少'], ['trả', '付'], ['được thối lại', '找回'], ['đồng', '越南盾'], ['Đài tệ', '台幣'], ['triệu', '百萬'], ['nghìn', '千'], ['trăm', '百'], ['mươi', '十（二十以上）'], ['một / hai / năm / bảy / chín', '1 / 2 / 5 / 7 / 9']])}
    <p><b>她買的所有天燈，顏色加起來一共是幾「色」？</b>（例如一盞雙色＋一盞四色＝6 色）</p>`,
  ans: ['23', '23色'], solve: '23', num: true, ph: '幾色',
  hint: '先把越南盾換成台幣，扣掉找的錢，再把九折還原成原價。接著找出唯一一種「七盞、四種都有」的組合。',
  ok: [['zn', 'Tôi mua cho mọi người!', '我幫大家都買了！', 'happy'], ['xy', '她是真的公主。'], ['jz', '兩百五十萬……完全法克。'], ['by', '那是越南盾。']],
});

// ---------- 9. 四盞天燈的顏色（邏輯，多人分卡） ----------
const C4_COL = [['黃', 'Y', '#E0A800', 'vàng'], ['紅', 'R', '#E8453C', 'đỏ'], ['藍', 'B', '#3E7ED0', 'xanh'], ['白', 'W', '#F4F0E6', 'trắng']];
P({
  id: 'c4_four', ch: 4, t: '四盞天燈的顏色', lv: 2, icon: '🏮', pos: [62, 72],
  body: () => `<p>四個人各放了一盞單色天燈，顏色是 <b>đỏ（紅）、vàng（黃）、xanh（藍）、trắng（白）</b>，各許了一個願：<b>健康、發財、考試、愛情</b>。四盞是一盞一盞輪流放的。</p>
    <p>大家各自記得一點點：</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    el.insertAdjacentHTML('beforeend', '<p><b>依照放的順序（第一盞到第四盞），點出四盞天燈的顏色。</b></p>');
    if (!done) K.seq(el, ctx, C4_COL.map(([z, v, c, vi]) => ({ t: `<span class="c4-sw" style="background:${c}"></span>${z} ${vi}`, v })), { len: 4 });
  },
  split: [
    '① <b>đỏ</b> 的天燈比博育的早放，但它不是第一盞。<br>② 許「發財」的是俊治。<br>③ 許「愛情」和許「健康」的天燈，是一前一後緊接著放的。',
    '④ 甄妮的天燈不是 <b>vàng</b>，也不是 <b>đỏ</b>。<br>⑤ <b>trắng</b> 的天燈和俊治的天燈中間，剛好隔了一盞。',
    '⑥「小羽最後一個放」和「小羽許了考試」這兩句話，剛好只有一句是真的。<br>⑦ 許「考試」的人，比 <b>xanh</b> 的天燈早放。',
    '⑧ 博育沒有許「健康」。<br>⑨ <b>xanh</b> 的天燈不是最後一盞。<br>⑩ 甄妮比博育早放。',
  ],
  ui: 'none', ans: ['Y-R-B-W'], solve: 'Y-R-B-W', show: '黃 → 紅 → 藍 → 白（小羽・考試／俊治・發財／甄妮・健康／博育・愛情）',
  hint: '畫一張「人 × 順序 × 顏色 × 願望」的表。先用「紅不是第一、又比博育早」和「甄妮比博育早」把博育的位置逼出來。',
  ok: [['xy', '我許考試，因為我需要奇蹟。'], ['jz', '我許發財，因為我需要錢。'], ['by', '我許愛情……你們不要看我。'], ['xy', '神人。']],
});

// ---------- 10. 靜安吊橋（過橋問題） ----------
P({
  id: 'c4_bridge', ch: 4, t: '天黑的吊橋', lv: 2, icon: '🌉', pos: [86, 74],
  body: () => `<p>天黑了，四個人要從老街走過靜安吊橋回到車站。橋上沒有燈，手上只有<b>一盞點亮的小天燈</b>可以照路。</p>
    <svg viewBox="0 0 400 120" style="width:100%;max-width:420px;display:block;margin:0 auto"><rect width="400" height="120" rx="12" fill="#1E2450"/><path d="M20 70 Q200 110 380 70" stroke="#C9A060" stroke-width="5" fill="none"/><path d="M20 30 Q200 70 380 30" stroke="#8A7A60" stroke-width="2" fill="none"/>${[...Array(12)].map((_, i) => { const x = 40 + i * 29; const y1 = 30 + 40 * (1 - Math.pow((x - 200) / 180, 2)), y2 = 70 + 40 * (1 - Math.pow((x - 200) / 180, 2)); return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#8A7A60" stroke-width="1.5"/>`; }).join('')}<rect x="6" y="40" width="20" height="50" fill="#5A4A3A"/><rect x="374" y="40" width="20" height="50" fill="#5A4A3A"/><text x="16" y="108" fill="#FFE7A0" font-size="12" text-anchor="middle">老街</text><text x="384" y="108" fill="#FFE7A0" font-size="12" text-anchor="middle">車站</text><text x="200" y="24" fill="#FFD978" font-size="18" text-anchor="middle">🏮</text></svg>
    <table style="width:100%"><tr><th>誰</th><th>自己走過橋要</th></tr><tr><td>博育</td><td>1 分鐘</td></tr><tr><td>小羽</td><td>2 分鐘</td></tr><tr><td>俊治</td><td>6 分鐘（一直停下來自拍）</td></tr><tr><td>甄妮</td><td>9 分鐘（一直停下來拍夜景）</td></tr></table>
    <div class="paper" style="font-size:14px">・橋一次最多只能有 <b>兩個人</b>；兩個人一起走時，速度是比較慢的那個人的速度。<br>・橋上一定要有人拿著天燈，天燈要有人拿回去才能接下一批人。<br>・甄妮跟俊治不能一起走（她會把俊治的自拍棒丟下去）。<br>・博育怕黑，<b>不敢一個人走在橋上</b>。</div>
    <p><b>四個人全部走到車站，最少要幾分鐘？</b></p>`,
  ans: ['21', '21分鐘', '21分'], solve: '21', num: true, ph: '分鐘',
  hint: '最有名的過橋解法在這裡行不通。先想清楚：誰可以負責把天燈拿回來？',
  ok: [['by', '我只負責走第一趟……'], ['xy', '我來回跑了三趟，我才是導遊。'], ['jz', '我的自拍棒還在。'], ['zn', 'Chưa chắc.', '還不一定。']],
});

// ---------- 11. 劇情指定：最不起眼的那一句 ----------
P({
  id: 'c4_wish', ch: 4, t: '最不起眼的那一句', lv: 3, icon: '✨', pos: [50, 44],
  need: ['c4_train', 'c4_words', 'c4_money', 'c4_bridge'],
  body: () => `<p>甄妮寫好的大天燈上有四句話：「想得到答案，先找到願望。」「願望不是最大的字。」「而是最不起眼的那一句。」轉一轉天燈，每一面都寫得滿滿的。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const faces = [
      `<div class="c4-face"><span class="c4-face-m">想得到答案</span><span class="bigc">平<br>安</span><span class="c4-face-m">先找到願望</span></div>`,
      `<div class="c4-face"><span class="c4-face-m">Thi được<br>một trăm điểm</span><span class="bigc">一<br>百<br>分</span><span class="c4-face-m">考試100分</span></div>`,
      `<div class="c4-face"><span class="c4-face-m">願望不是<br>最大的字</span><span class="bigc">發<br>財</span><span class="c4-face-m">ước mơ:<br>🌉 nhân năm</span></div>`,
      `<div class="c4-face"><span class="c4-face-m">Tôi muốn<br>ăn tất cả!</span><span class="bigc">吃<br>到<br>飽</span><span class="c4-face-m">Đài Loan<br>số một</span></div>`,
      `<div class="c4-face"><span class="c4-face-m">而是最不起眼<br>的那一句</span><span class="bigc">神<br>人</span><span class="c4-face-s">ước mơ thật sự =<br>🔤 cộng 💱 cộng<br>chữ số cuối của 🚂</span></div>`,
      `<div class="c4-face"><span class="c4-face-m">Bang!</span><span class="bigc">完<br>全<br>法<br>克</span><span class="c4-face-m">俊治 寫的</span></div>`,
    ];
    K.cyl(el, { faces, r: 112 });
    el.insertAdjacentHTML('beforeend', `${C4DICT([['ước mơ', '願望'], ['thật sự', '真正的'], ['cộng', '加'], ['nhân', '乘'], ['năm', '5'], ['chữ số cuối', '最後一位數字'], ['của', '的'], ['điểm', '分'], ['số một', '第一名']])}
      <p class="note">天燈上的小圖示，跟這一章場景上的題目圖示是一樣的。</p><p><b>甄妮真正的願望是什麼數字？</b></p>`);
  },
  ans: ['101'], solve: '101', num: true, ph: '數字',
  hint: '大字都是煙霧彈。把天燈轉一圈，找字最小、最淡的那一行，它用圖示指向你們解開過的題目。',
  item: 'wish',
  ok: [['xy', '101？'], ['by', '台北 101？'], ['jz', '走。']],
});
