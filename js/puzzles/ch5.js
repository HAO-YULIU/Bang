'use strict';
// ===== 第五章：台北 101——全台灣最高的屁孩（11 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c5-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 3px 8px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 6px 0; }
.c5-dict span b { color: #C9332B; }
.c5-vn { font-size: 15px; font-weight: 700; color: #1E5AA8; background: #EAF3FF; border-radius: 10px; padding: 8px 12px; margin: 6px 0; }
.c5-scr { background: #0E1A24; color: #7AF0C8; font-family: ui-monospace, Menlo, monospace; border-radius: 10px; padding: 8px 10px; font-size: 13px; }
.c5-rc { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin: 8px 0; }
.c5-rc div { background: #fff; border: 1.5px solid #CFC6B4; border-radius: 6px; padding: 6px 8px; font-size: 12px; line-height: 1.45; box-shadow: 1px 2px 0 rgba(0,0,0,.08); position: relative; }
.c5-rc div::after { content: ''; position: absolute; left: 0; right: 0; bottom: -5px; height: 5px; background: radial-gradient(circle at 4px -1px, transparent 4px, #fff 4.5px) 0 0 / 8px 5px repeat-x; }
.c5-rc b { display: block; font-size: 17px; letter-spacing: .04em; font-family: ui-monospace, Menlo, monospace; }
.c5-rc small { color: #8A7A60; }
.c5-win td:first-child { white-space: nowrap; font-weight: 700; }
.c5-win td { font-size: 13px; }
.c5-chat { background: #8CABD9; border-radius: 12px; padding: 8px; font-size: 14px; }
.c5-chat .m { display: flex; gap: 6px; margin: 5px 0; align-items: flex-end; }
.c5-chat .m p { margin: 0; background: #fff; border-radius: 4px 12px 12px 12px; padding: 4px 10px; }
.c5-chat .m.me { flex-direction: row-reverse; } .c5-chat .m.me p { background: #B4F08C; border-radius: 12px 4px 12px 12px; }
.c5-chat .m small { font-size: 10px; color: #1E2A40; white-space: nowrap; }
.c5-chat .who { font-size: 11px; color: #1E2A40; margin: 0 0 -3px 4px; }
.c5-chat h5 { margin: 0 0 4px; font-size: 12px; color: #fff; text-align: center; }
.c5-post { background: #FFFDF6; border: 2px solid #D8C49A; border-radius: 6px; padding: 10px 12px; font-family: 'Comic Sans MS', cursive, sans-serif; color: #2A3A6A; font-size: 15px; line-height: 1.7; background-image: repeating-linear-gradient(transparent 0 25px, #E4DCC8 25px 26px); }
.c5-kl .k-dig { --dcell: 46px; }
.c5-box { display: flex; justify-content: center; gap: 10px; margin: 8px 0; }
.c5-box div { width: 62px; text-align: center; }
.c5-box span { display: block; font-size: 24px; }
.c5-box b { display: grid; place-items: center; height: 54px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFF2C0, #D8A030); border: 3px solid #6A4A10; font-size: 26px; color: #3A2A10; box-shadow: 0 4px 0 #6A4A10; }
.c5-box b.q { background: radial-gradient(circle at 40% 35%, #fff, #B8B0A0); color: #C9332B; }
@media (max-width: 420px) { .c5-kl .k-dig { --dcell: 44px; } .c5-box div { width: 58px; } }
</style>`);

const C5DICT = (words) => `<div class="c5-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

// 101 的剖面示意圖（竹節）
const C5_TOWER = (() => {
  let g = `<rect width="300" height="330" rx="12" fill="#DCEAF6"/>`;
  g += `<path d="M150 8 V40" stroke="#5A6A7A" stroke-width="4"/><rect x="138" y="40" width="24" height="22" fill="#7A8A9A"/>`;
  for (let k = 8; k >= 1; k--) { const y = 62 + (8 - k) * 28; g += `<path d="M112 ${y} L188 ${y} L176 ${y + 28} L124 ${y + 28} Z" fill="${k % 2 ? '#5E8AA8' : '#6E9AB8'}" stroke="#2E4A60"/><text x="200" y="${y + 19}" font-size="12" fill="#2E4A60">第 ${k} 節：${27 + (k - 1) * 8}～${34 + (k - 1) * 8} 樓</text>`; }
  g += `<path d="M118 286 L182 286 L196 318 L104 318 Z" fill="#4E6A80" stroke="#2E4A60"/><text x="200" y="306" font-size="12" fill="#2E4A60">底座：1～26 樓</text><text x="200" y="56" font-size="12" fill="#2E4A60">塔頂：91 樓以上</text>`;
  return `<svg viewBox="0 0 350 330" style="width:100%;max-width:370px;display:block;margin:0 auto">${g}</svg>`;
})();

// ---------- 1. 擦窗機（竹節座標，多人分卡） ----------
P({
  id: 'c5_bamboo', ch: 5, t: '竹節上的擦窗機', lv: 1, icon: '🧽', pos: [14, 22],
  body: () => `<p>博育：「101 的造型像竹子，<b>8 個竹節、每節 8 層</b>。」大樓外牆有一台擦窗機，工作人員都用「<b>第幾節第幾層</b>」來報位置（每一節裡由下往上數第 1～8 層）。</p>${C5_TOWER}
    <p>對講機裡傳來四段指令，每個人只聽到一段。</p><p><b>擦窗機最後停在幾樓？</b></p>`,
  split: ['📻「擦窗機從<b>第 3 節第 5 層</b>出發。」', '📻「先<b>往上爬 2 節</b>。」', '📻「接著<b>往下 13 層</b>。」', '📻「最後再<b>往下 3 節</b>，然後停住。」'],
  ans: ['26', '26樓', '26F'], solve: '26', num: true, ph: '樓層',
  hint: '先把「第幾節第幾層」換成真正的樓層，之後的移動全部用樓層算。一節是幾層？',
  ok: [['xy', '擦窗機下班了。'], ['jz', '它停在底座，好可憐，連竹節都沒有。'], ['by', '這個資訊很重要嗎？'], ['xy', '可能喔。']],
});

// ---------- 2. 電梯紀錄（多人分卡） ----------
P({
  id: 'c5_elev', ch: 5, t: '博育在哪一樓下車', lv: 2, icon: '🛗', pos: [38, 18],
  body: () => `<p>辦公大樓的電梯裡，博育說要去上廁所，在<b>第二次停靠</b>的時候下了電梯，之後就失聯了。四個人各拿到一點線索：</p>
    <div class="c5-scr">ELEVATOR #7　LOG<br>10:00:00　1F　▲ 出發<br>10:00:20　11F　● 開門（第 1 次停靠）<br>10:0█:██　██F　● 開門（第 2 次停靠）<br>10:0█:██　██F　● 開門（第 3 次停靠）<br>█████████████</div>
    <p><b>博育在幾樓下電梯？</b></p>`,
  split: [
    '🎥 監視器：電梯的速度從頭到尾都一樣（加速、減速不用管）。從 1 樓到 11 樓花了 20 秒。',
    '🧑‍🔧 管理員：「每次停靠，從開門到關門再出發，一律是 <b>15 秒</b>。」',
    '🖥️ 螢幕的另一頁：「第 3 次停靠：<b>10:02:44</b> 開門。從頭到尾電梯都沒有往下。」',
    '小羽：「博育下車那一站到第 3 站的樓層數，剛好是第 1 站到博育那站的<b>兩倍</b>。」',
  ],
  ans: ['30', '30樓', '30F'], solve: '30', num: true, ph: '樓層',
  hint: '先算速度（一層幾秒），再從第 1 站出發的時間開始算到 10:02:44——中間還有一次停靠。',
  ok: [['by', '我在 30 樓的廁所……'], ['xy', '你在竹節的第一節上廁所。'], ['jz', '神人。']],
});

// ---------- 3. 跨年煙火・殺手數獨 ----------
const C5K = {
  sol: ['451236', '263145', '342651', '615423', '134562', '526314'],
  id: [[0, 0, 1, 1, 2, 2], [3, 1, 1, 4, 5, 6], [3, 3, 7, 4, 5, 6], [3, 8, 7, 9, 9, 6], [10, 8, 8, 9, 9, 6], [10, 10, 8, 11, 11, 11]],
  sums: [9, 12, 9, 15, 7, 9, 11, 7, 14, 17, 8, 8],
};
const C5K_COL = (() => {
  const pal = ['#FFD9D2', '#D6ECFF', '#FFF0B8', '#DDF3D6', '#EBDDFF'], col = {}, id = C5K.id;
  for (let c = 0; c < 12; c++) {
    const nb = new Set();
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (id[i][j] === c) [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([a, b]) => { const x = i + a, y = j + b; if (x >= 0 && y >= 0 && x < 6 && y < 6 && id[x][y] !== c && col[id[x][y]] != null) nb.add(col[id[x][y]]); });
    col[c] = [0, 1, 2, 3, 4].find(k => !nb.has(k));
  }
  return (c) => pal[col[c]];
})();
P({
  id: 'c5_fire', ch: 5, t: '跨年煙火・殺手數獨', lv: 2, icon: '🎆', pos: [62, 22],
  body: () => `<p>101 的紀念品店在賣跨年煙火明信片，背面是一題數獨。店員說：「解得出來，明信片送你。」</p>
    <div class="paper" style="font-size:14px">・每一列、每一行、每一個粗線圍起來的 2×3 宮，都剛好是 1～6 各一次。<br>・同一個顏色的「煙火」（虛線框）裡，數字加起來等於左上角的小數字，而且煙火裡<b>數字不重複</b>。<br>・沒有任何提示數字。</div>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const id = C5K.id, first = {};
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (first[id[i][j]] == null) first[id[i][j]] = `${i},${j}`;
    const given = {}; if (done) for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) given[`${i},${j}`] = C5K.sol[i][j];
    const wrap = document.createElement('div'); wrap.className = 'c5-kl'; wrap.style.textAlign = 'center'; el.append(wrap);
    K.digits(wrap, ctx, {
      r: 6, c: 6, max: 6, given,
      cage: (i, j) => ({ bg: C5K_COL(id[i][j]), label: first[id[i][j]] === `${i},${j}` ? String(C5K.sums[id[i][j]]) : '' }),
      border: (i, j) => {
        const s = {}, d = '2px dashed #9A7A50', th = '3px solid #2A2230';
        s.borderTop = i === 0 ? '' : i === 2 || i === 4 ? th : id[i - 1][j] !== id[i][j] ? d : '1px solid #EADFC8';
        s.borderLeft = j === 0 ? '' : j === 3 ? th : id[i][j - 1] !== id[i][j] ? d : '1px solid #EADFC8';
        s.borderRight = '0'; s.borderBottom = '0';
        return s;
      },
    });
    if (done) $$('.k-row', el).forEach(r => r.remove());
  },
  ui: 'none', ans: [C5K.sol.join('')], solve: C5K.sol.join(''), show: '451236 / 263145 / 342651 / 615423 / 134562 / 526314',
  hint: '先找格子少的煙火：兩格加起來 7、8、9 的組合很有限。再用「每一列總和是 21」去算跨好幾宮的煙火。',
  ok: [['jz', '我看到煙火了。'], ['xy', '那是你眼睛花了。'], ['zn', 'Đẹp quá!', '好漂亮！', 'happy']],
});

// ---------- 4. 捷運到 101（越南語條件，K.route） ----------
const C5_MRT = (() => {
  const N = {
    北門: [110, 110], 西門: [62, 205], 小南門: [92, 300], 中正紀念堂: [200, 330], 古亭: [172, 432], 台北車站: [196, 200], 台大醫院: [200, 266],
    中山: [222, 95], 松江南京: [352, 95], 南京復興: [486, 95], 行天宮: [352, 34], 善導寺: [272, 200], 忠孝新生: [352, 200], 忠孝復興: [486, 200], 忠孝敦化: [560, 200], 國父紀念館: [610, 250],
    東門: [300, 336], 大安森林公園: [392, 372], 大安: [486, 336], 信義安和: [548, 400], 台北101: [596, 450], 科技大樓: [450, 440],
  };
  const D = { 忠孝復興: -16, 西門: 26, 古亭: -22, 台北車站: -20, 小南門: 28, 中正紀念堂: 30, 東門: -20, 大安森林公園: 30, 大安: -20, 信義安和: -20, 台北101: -22, 科技大樓: 30, 國父紀念館: 30, 忠孝敦化: -20, 台大醫院: 0 };
  const DX = { 台大醫院: 52, 西門: 0, 行天宮: 60, 國父紀念館: -20, 信義安和: 58, 台北101: -50, 中正紀念堂: 46, 古亭: -30, 忠孝復興: -42, 忠孝敦化: 14 };
  const DYF = { 行天宮: 6, 台大醫院: 6, 信義安和: 6, 台北101: 6, 古亭: 6 };
  const L = {
    R: ['#E3002C', ['台北車站', '台大醫院', '中正紀念堂', '東門', '大安森林公園', '大安', '信義安和', '台北101']],
    BL: ['#0070BD', ['西門', '台北車站', '善導寺', '忠孝新生', '忠孝復興', '忠孝敦化', '國父紀念館']],
    G: ['#008659', ['古亭', '中正紀念堂', '小南門', '西門', '北門', '中山', '松江南京', '南京復興']],
    O: ['#F8B61C', ['古亭', '東門', '忠孝新生', '松江南京', '行天宮']],
    BR: ['#9E6430', ['南京復興', '忠孝復興', '大安', '科技大樓']],
  };
  const edges = [], col = {};
  for (const k in L) { const [c, s] = L[k]; for (let i = 0; i + 1 < s.length; i++) { edges.push([s[i], s[i + 1]]); col[s[i] + '|' + s[i + 1]] = col[s[i + 1] + '|' + s[i]] = c; } }
  const nodes = {}; for (const k in N) nodes[k] = { x: N[k][0], y: N[k][1], label: k, fs: 19, dy: DYF[k] ?? (D[k] ?? -20), dx: DX[k] ?? 0, r: 11 };
  return { nodes, edges, col };
})();
P({
  id: 'c5_mrt', ch: 5, t: '甄妮的捷運彩虹', lv: 2, icon: '🚇', pos: [86, 20],
  body: () => `<p>早上從西門出發去 101。甄妮看著捷運圖，傳了一段越南語給博育：</p>
    <div class="c5-vn">“Tôi muốn đi đủ năm màu. Mỗi màu chỉ đi một đoạn liên tục, xuống rồi thì không lên lại màu đó. Bắt đầu bằng màu xanh lá. Không đi qua ga nào hai lần. Đi qua càng nhiều ga càng tốt!”</div>
    ${C5DICT([['đi đủ', '全部都搭到'], ['năm màu', '五種顏色'], ['mỗi', '每一'], ['chỉ … một đoạn liên tục', '只搭連續的一段'], ['xuống rồi thì không lên lại', '下車了就不再上'], ['bắt đầu bằng', '從…開始'], ['không … hai lần', '不…兩次'], ['đi qua', '經過'], ['ga', '車站'], ['càng nhiều càng tốt', '越多越好'], ['đỏ', '紅'], ['xanh dương', '藍'], ['xanh lá', '綠'], ['cam', '橘'], ['nâu', '棕']])}
    <p><b>在地圖上從西門點到台北 101，畫出甄妮要的路線。</b></p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    if (done) return;
    K.route(el, ctx, { w: 660, h: 480, nodes: C5_MRT.nodes, edges: C5_MRT.edges, start: '西門', edgeColor: (a, b) => C5_MRT.col[a + '|' + b], edgeW: 9 });
  },
  ui: 'none', ans: ['西門-北門-中山-松江南京-南京復興-忠孝復興-忠孝新生-東門-大安森林公園-大安-信義安和-台北101'], solve: '西門-北門-中山-松江南京-南京復興-忠孝復興-忠孝新生-東門-大安森林公園-大安-信義安和-台北101',
  show: '綠（西門→南京復興）→ 棕 → 藍（忠孝復興→忠孝新生）→ 橘 → 紅（東門→台北101）',
  hint: '五種顏色各只能搭一段，而且最後一段一定是紅線。先列出所有可能的顏色順序，再比哪一條經過的站最多。',
  ok: [['zn', 'Cầu vồng!', '彩虹！', 'happy'], ['by', '這樣繞了 11 站……'], ['xy', '導遊要學會服務客人。']],
});

// ---------- 5. 旅行日誌：觀景台留言本 ----------
P({
  id: 'c5_note', ch: 5, t: '觀景台留言本', lv: 1, icon: '📓', pos: [20, 46],
  body: () => `<p>89 樓觀景台的留言本上，有人用很醜的字寫了一題：</p>
    <div class="paper">「從你們在台北車站見面開始，到<b>今天早上電梯旁出現那個上鎖的小盒子</b>為止——<br>① 小羽說了幾次「神人。」？<br>② 博育有幾次<b>只</b>回了「……」？<br>③ 俊治喊了幾次「Bang!」？<br>④ 甄妮說過幾句話？<br>把四個答案照順序寫在一起。」<br><span style="float:right">——留言者：神人</span><br></div>
    <p class="note">📓 旅行日誌都記著。手機訊息不算，只算說出口的台詞。</p>`,
  ans: ['65210', '6-5-2-10', '6/5/2/10'], solve: '65210', num: true, ph: '一串數字',
  hint: '一章一章翻日誌，四個人分開數。小心：說「神人。」的不只一個人；「……我突然不知道怎麼回答。」不算只回「……」。',
  ok: [['xy', '這留言是我寫的。'], ['jz', '你什麼時候寫的？'], ['xy', '昨天晚上夢到的。'], ['by', '……']],
});

// ---------- 6. 撲克牌排排看（多人分卡） ----------
const C5_CARDS = ['AS', 'KH', 'QS', 'JD', '10C', '9H', '8S', '2D', '7C'];
P({
  id: 'c5_cards', ch: 5, t: '五張蓋著的牌', lv: 2, icon: '🃏', pos: [80, 46],
  body: () => `<p>電梯旁的小盒子下面壓著一張紙：「這裡曾經有五張牌排成一排，是從下面九張裡挑的。」</p>
    <div style="text-align:center">${K.cards(C5_CARDS)}</div>
    <p class="note">點數：A＝1、J＝11、Q＝12、K＝13，其他照牌面數字。黑色＝♠♣，紅色＝♥♦。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    el.insertAdjacentHTML('beforeend', '<p><b>由左到右，點出那五張牌。</b></p>');
    if (!done) K.seq(el, ctx, C5_CARDS.map(c => ({ t: K.cards([c]), v: c })), { len: 5 });
  },
  split: [
    '① 黑色的牌不會兩張相鄰。<br>② 最左邊那張的點數，比最右邊那張大。',
    '③ 五張牌的點數加起來是 35。<br>④ 正中間那張是人頭牌（J、Q、K）。',
    '⑤ 五張裡剛好有一張梅花。<br>⑥ 黑桃 A 在裡面，但不在兩端；它右邊那張的點數比它左邊那張小。',
    '⑦ 相鄰兩張牌的點數，差都至少是 3。<br>⑧ 如果紅心 9 和方塊 J 都在裡面，紅心 9 在方塊 J 的左邊。',
  ],
  ui: 'none', ans: ['10C-2D-KH-AS-9H'], solve: '10C-2D-KH-AS-9H', show: '♣10、♦2、♥K、♠A、♥9',
  hint: '黑桃 A 只能在第 2 或第 4 張，中間又是人頭牌——先固定這兩張，再用「黑色不相鄰」和「差至少 3」去刪。',
  ok: [['jz', '撲克牌出現了，表示等一下要賭博。'], ['by', '我們不賭博。'], ['xy', '我們只是玩牌。']],
});

// ---------- 7. 發票對獎 ----------
const C5_RC = [
  ['XK', '48760643', '2026-01-03', '4F 精品咖啡'], ['MB', '21184571', '2026-02-14', 'B1 美食街'], ['ZT', '50275318', '2026-01-28', '3F 鞋店'],
  ['QP', '77419926', '2026-03-02', '5F 書店'], ['LA', '33500618', '2026-02-20', 'B1 珍奶'], ['RD', '82384571', '2026-01-09', '89F 紀念品'],
  ['WE', '64910643', '2026-02-11', '1F 藥妝'], ['HN', '38194072', '2026-01-17', '2F 服飾'], ['CY', '55512027', '2026-02-03', '4F 文具'],
];
P({
  id: 'c5_receipt', ch: 5, t: '一疊發票', lv: 2, icon: '🧾', pos: [50, 48],
  body: () => `<p>小羽把兩天的發票全部塞在甄妮的包包裡。剛好今天開獎，博育拿出手機查到這一期的號碼：</p>
    <table class="c5-win" style="width:100%"><tr><td>特別獎 1000 萬</td><td class="mono">38194027</td></tr><tr><td>特獎 200 萬</td><td class="mono">60275318</td></tr><tr><td>頭獎 20 萬</td><td class="mono">15760643<br>92384571<br>07419926</td></tr><tr><td>增開六獎</td><td class="mono">618、045</td></tr></table>
    <div class="paper" style="font-size:13px">📋 115 年 01–02 月　統一發票對獎規則<br>・特別獎、特獎：<b>8 碼全部相同</b>才中。<br>・頭獎 20 萬：與頭獎 8 碼相同。二獎 4 萬：末 7 碼與<b>頭獎</b>相同。三獎 1 萬：末 6 碼。四獎 4 千：末 5 碼。五獎 1 千：末 4 碼。六獎 2 百：末 3 碼。<br>・增開六獎 2 百：末 3 碼相同。<br>・每張發票只領<b>最高的那一個獎</b>；不是這一期的發票不能對。</div>
    <div class="c5-rc">${C5_RC.map(([a, n, d, s]) => `<div><small>電子發票證明聯　${d.slice(5, 7) <= '02' ? '115年01-02月' : '115年03-04月'}</small><b>${a}-${n}</b>${d}<br><small>台北101購物中心 ${s}</small></div>`).join('')}</div>
    <p><b>這疊發票一共可以領多少錢？</b></p>`,
  ans: ['55200', '55200元'], solve: '55200', num: true, ph: '元',
  hint: '二獎到六獎只跟「頭獎」比末幾碼；特別獎、特獎差一碼都不算。還有一張根本不是這一期的。',
  ok: [['xy', '五萬五！我請大家喝飲料。'], ['jz', '你應該請大家吃鼎泰豐。'], ['zn', 'Đài Loan thật kỳ diệu!', '台灣真神奇！', 'happy']],
});

// ---------- 8. 甄妮的明信片（越南語樓層） ----------
P({
  id: 'c5_post', ch: 5, t: '最高郵筒的明信片', lv: 2, icon: '✉️', pos: [14, 72],
  body: () => `<p>甄妮在觀景台的郵筒寄了一張明信片給越南的媽媽。她說：「我寫明信片的地方，就寫在明信片裡了。」</p>
    <div class="c5-post">Mẹ ơi! Sáng nay chúng tôi lên đài quan sát ở tầng tám mươi tám. Đẹp quá! Sau đó con đi xuống mười lăm tầng để xem cửa hàng, rồi đi lên hai tầng để uống trà sữa. Cuối cùng con đi xuống bốn mươi ba tầng. Bây giờ con đang ngồi viết bưu thiếp này ở đây. ❤</div>
    <svg viewBox="0 0 320 70" style="width:100%;max-width:340px;display:block;margin:8px auto"><rect x="2" y="2" width="316" height="66" rx="8" fill="#1E2A44"/><rect x="230" y="2" width="2" height="66" fill="#fff" stroke-dasharray="4 4" stroke="#1E2A44"/><text x="16" y="28" font-size="15" font-weight="900" fill="#F2B33D">TAIPEI 101 OBSERVATORY</text><text x="16" y="52" font-size="13" fill="#fff">觀景台入場券　Adult 成人</text><text x="274" y="44" text-anchor="middle" font-size="26" font-weight="900" fill="#fff">89F</text></svg>
    ${C5DICT([['mẹ ơi', '媽～'], ['sáng nay', '今天早上'], ['chúng tôi / con', '我們 / 我（對媽媽）'], ['lên / xuống', '上 / 下'], ['đài quan sát', '觀景台'], ['tầng', '樓（層）'], ['ở', '在'], ['đẹp quá', '好美'], ['sau đó / rồi', '然後 / 接著'], ['để', '為了'], ['xem cửa hàng', '逛商店'], ['uống trà sữa', '喝珍奶'], ['cuối cùng', '最後'], ['bây giờ', '現在'], ['đang ngồi viết', '正坐著寫'], ['bưu thiếp', '明信片'], ['ở đây', '在這裡'], ['hai / ba / bốn / năm / tám', '2 / 3 / 4 / 5 / 8'], ['mười', '10'], ['mươi', '十（二十以上）'], ['lăm', '十位後的 5']])}
    <p><b>甄妮寫明信片的時候，在台灣說的「幾樓」？</b></p>`,
  ans: ['33', '33樓', '33F'], solve: '33', num: true, ph: '樓層',
  hint: '先看看門票上的觀景台是幾樓，再看甄妮寫的是幾樓。越南人和台灣人數樓層的方式不一樣。',
  ok: [['zn', 'Ở Việt Nam, tầng một là tầng thứ hai!', '在越南，一樓是第二層！'], ['xy', '所以越南的樓比較高。'], ['jz', '越南人比較會蓋樓。'], ['by', '不是這個意思……']],
});

// ---------- 9. 阻尼器 ----------
P({
  id: 'c5_damper', ch: 5, t: '金色大球在幾樓', lv: 2, icon: '🟡', pos: [38, 76],
  body: () => `<p>101 的「風阻尼器」是一顆巨大的金色鋼球，吊在大樓頂端附近，颱風來的時候會晃來晃去讓大樓穩下來。導覽牌上寫著：</p>
    <svg viewBox="0 0 320 250" style="width:100%;max-width:340px;display:block;margin:0 auto"><rect width="320" height="250" rx="12" fill="#2A2E3A"/>${[92, 91, 90, 89, 88, 87].map((f, i) => `<line x1="20" y1="${20 + i * 38}" x2="300" y2="${20 + i * 38}" stroke="#5A6070" stroke-width="3"/><text x="26" y="${15 + i * 38}" font-size="12" fill="#AAB0C0">${f}F 樓板</text>`).join('')}
      <line x1="140" y1="20" x2="160" y2="102" stroke="#C8C8C8" stroke-width="2"/><line x1="180" y1="20" x2="160" y2="102" stroke="#C8C8C8" stroke-width="2"/><circle cx="160" cy="134" r="32" fill="url(#c5gold)"/><defs><radialGradient id="c5gold" cx=".35" cy=".3"><stop offset="0" stop-color="#FFF2B0"/><stop offset="1" stop-color="#C88A10"/></radialGradient></defs><text x="304" y="240" text-anchor="end" font-size="11" fill="#FFD978">※ 示意圖，比例和位置都不準</text></svg>
    <div class="paper" style="font-size:14px">・鋼球是由 <b>41 片</b>鋼板疊起來的，每片厚 <b>12.5 公分</b>；疊起來的高度就是球的直徑。<br>・鋼球重 660 公噸，最寬處的鋼板直徑約 5.5 公尺。<br>・吊索從 <b>92 樓的樓板</b>往下垂，吊住球的<b>最頂端</b>；吊索長度是球直徑的 <b>2 倍</b>。<br>・這一段每層樓高 <b>4.2 公尺</b>（樓板到樓板）。</div>
    <p><b>鋼球的「球心」在幾樓的高度？</b></p>`,
  ans: ['88', '88樓', '88F'], solve: '88', num: true, ph: '樓層',
  hint: '算出直徑、吊索長，球心還要再往下半個直徑。92 樓樓板往下的第一層是 91 樓。不要被「最寬的鋼板」騙了。',
  ok: [['jz', '我想推它。'], ['by', '不行。'], ['xy', '它是 101 的寵物。'], ['zn', 'Quả cầu vàng!', '金色的球！', 'happy']],
});

// ---------- 10. 跨年聊天紀錄（時差，多人分卡） ----------
const C5_MSG = [['m1', '俊治：Bang!'], ['m2', '甄妮：Sắp đếm ngược rồi!'], ['m3', '小羽：倒數了倒數了'], ['m4', '甄妮：Chúc mừng năm mới!!!'], ['m5', '俊治：新年快樂（我遲到了嗎）'], ['m6', '小羽：神人煙火']];
const C5_CHAT = (title, ms) => `<div class="c5-chat"><h5>${title}</h5>${ms.map(([who, t, tm, me]) => `<div class="who">${me ? '' : who}</div><div class="m ${me ? 'me' : ''}"><p>${t}</p><small>${tm}</small></div>`).join('')}</div>`;
P({
  id: 'c5_newyear', ch: 5, t: '去年跨年的聊天紀錄', lv: 2, icon: '💬', pos: [62, 72],
  body: () => `<p>站在 101 底下，甄妮說：「去年跨年，我在河內看 101 煙火的直播，還跟你們在群組裡聊天！」三個人把當時的手機截圖翻出來——<b>每支手機的訊息旁邊，顯示的是那支手機自己的時間</b>。</p>
    <p class="note">提示：同一則訊息在不同手機上，顯示的時間可能不一樣。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    el.insertAdjacentHTML('beforeend', '<p><b>依照「真正送出」的先後，排出這六則訊息。</b></p>');
    if (!done) K.seq(el, ctx, [3, 0, 5, 2, 4, 1].map(i => ({ t: C5_MSG[i][1], v: C5_MSG[i][0] })), { len: 6 });
  },
  split: [
    '📱 小羽的手機截圖（自動校時，台灣時間）' + C5_CHAT('跨年群組', [['小羽', '倒數了倒數了', '23:59', 1], ['小羽', '神人煙火', '00:03', 1]]),
    '📱 甄妮的手機截圖（她人在河內）' + C5_CHAT('Nhóm năm mới', [['甄妮', 'Sắp đếm ngược rồi!', '22:58', 1], ['甄妮', 'Chúc mừng năm mới!!!', '23:00', 1], ['小羽', '神人煙火', '23:03']]),
    '📱 俊治的手機截圖（他說手機調快「比較不會遲到」）' + C5_CHAT('跨年群組', [['俊治', 'Bang!', '00:02', 1], ['小羽', '倒數了倒數了', '00:04'], ['俊治', '新年快樂（我遲到了嗎）', '00:06', 1]]),
  ],
  ui: 'none', ans: ['m1-m2-m3-m4-m5-m6'], solve: 'm1-m2-m3-m4-m5-m6', show: 'Bang!(23:57) → Sắp đếm ngược(23:58) → 倒數了(23:59) → Chúc mừng(00:00) → 新年快樂(00:01) → 神人煙火(00:03)',
  hint: '小羽的訊息同時出現在別人的手機上——拿它來對時，就知道越南差幾小時、俊治的手機快幾分鐘。',
  ok: [['jz', '我在倒數之前就 Bang 了。'], ['xy', '你永遠比世界快兩分鐘。'], ['zn', 'Năm nay xem tận mắt!', '今年要親眼看！', 'happy']],
});

// ---------- 11. 劇情指定：最高的地方，不一定有最高的答案 ----------
P({
  id: 'c5_box', ch: 5, t: '電梯旁的上鎖小盒子', lv: 2, icon: '🔒', pos: [86, 74],
  need: ['c5_bamboo', 'c5_elev', 'c5_post', 'c5_damper'],
  body: () => `<p>電梯旁那個上鎖的小盒子，上面有四個按鈕：1、0、1、？。每個按鈕上方都貼著一張小貼紙，旁邊刻著一行字：</p>
    <div class="paper" style="text-align:center;font-weight:900;font-size:17px">「最高的地方，不一定有最高的答案。」</div>
    <div class="c5-box"><div><span>🛗</span><b>1</b></div><div><span>🧽</span><b>0</b></div><div><span>✉️</span><b>1</b></div><div><span>🟡</span><b class="q">？</b></div></div>
    <p class="note">貼紙的圖案，跟這一章場景上的題目圖示一樣。前三個按鈕已經被按下去了。</p>
    <p><b>最後一個按鈕應該是幾？</b></p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    if (!done) K.choice(el, ctx, [...'1234567890'].map(d => ({ t: d, v: d })), { cols: 5 });
  },
  ui: 'none', ans: ['8'], solve: '8', show: '8（阻尼器在 88 樓——第 8 節）',
  hint: '前三個貼紙的題目答案都是「樓層」，可是按鈕上的數字不是樓層。101 的哪一個特徵，可以把 30 變成 1、26 變成 0？',
  item: 'card',
  ok: [['by', '盒子開了！裡面是……一張黑色撲克牌。'], ['xy', '最高的地方，答案只有 8。'], ['jz', '8 節 8 層，8 是 101 的幸運數字。']],
});
