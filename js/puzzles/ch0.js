'use strict';
// ===== 序章：台北車站（8 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c0-tags { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin: 8px 0; }
.c0-tag { width: 150px; background: #F2C230; border-radius: 10px 10px 10px 30px; padding: 12px 12px 12px 26px; position: relative; font-weight: 700; color: #3A2A10; box-shadow: 2px 3px 0 #C99A10; transform: rotate(var(--r)); }
.c0-tag::before { content: ''; position: absolute; left: 9px; top: 50%; width: 10px; height: 10px; border-radius: 50%; background: #FFF6E8; border: 2px solid #8A6A10; transform: translateY(-50%); }
.c0-tag small { display: block; font-size: 11px; color: #7A5A10; }
.c0-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 4px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; }
.c0-dict span b { color: #C9332B; }
.c0-board { background: #10141C; color: #FFB43A; border-radius: 10px; padding: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 13px; overflow-x: auto; }
.c0-board table { width: 100%; border-collapse: collapse; } .c0-board td, .c0-board th { border: 0 !important; border-bottom: 1px solid #2A3040 !important; padding: 5px 4px !important; white-space: nowrap; }
.c0-board th { color: #7AC8FF; font-weight: 400; }
.c0-vn { font-size: 18px; font-weight: 700; color: #1E5AA8; background: #EAF3FF; border-radius: 10px; padding: 10px 12px; }
.c0-log td:first-child { color: #8A7A60; font-size: 13px; }
.c0-locker { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.c0-locker div { background: #E9EEF3; border: 2px solid #9AA8B8; border-radius: 8px; padding: 8px; font-size: 14px; }
</style>`);

const C0DICT = (words) => `<div class="c0-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;

P({
  id: 'c0_luggage', ch: 0, t: '三張行李吊牌', lv: 2, icon: '🧳', pos: [18, 40],
  body: () => `<p>甄妮的行李箱上了一個三位數的鎖，她自己也忘了密碼。箱子上掛著三張吊牌，還有一張她手寫的便條。</p>
    <div class="c0-tags"><div class="c0-tag" style="--r:-3deg"><small>Thẻ A</small>bảy mươi lăm</div><div class="c0-tag" style="--r:2deg"><small>Thẻ B</small>hai trăm linh bảy</div><div class="c0-tag" style="--r:-1deg"><small>Thẻ C</small>một trăm mười một</div></div>
    <div class="paper">📝 <b>Mật khẩu</b> = số <b>lớn nhất</b> <b>trừ</b> số <b>nhỏ nhất</b>.</div>
    <p class="note">甄妮的越南語小抄（一部分）：</p>
    ${C0DICT([['một', '1'], ['hai', '2'], ['ba', '3'], ['bảy', '7'], ['mười', '10'], ['mươi', '十（二十以上）'], ['lăm', '十位後面的 5'], ['trăm', '百'], ['linh', '零（中間的零）'], ['số', '數字'], ['lớn nhất', '最大'], ['nhỏ nhất', '最小'], ['trừ', '減'], ['mật khẩu', '密碼']])}`,
  ans: ['132'], solve: '132', num: true, ph: '三位數',
  hint: '先把三張吊牌都翻成數字，再看便條要你怎麼算。',
  ok: [['zn', 'Đúng rồi!', '對了！'], ['xy', '她連自己的密碼都要用算的。'], ['jz', '神人。']],
});

P({
  id: 'c0_chat', ch: 0, t: '群組裡的字數', lv: 1, icon: '📱', pos: [36, 66],
  body: () => `<p>車站服務台留了一張紙條給「兩個帥哥」：</p>
    <div class="paper">「想領取寄放的東西，請報上密碼。<br>密碼就是：<b>小羽在群組裡傳的每一則訊息，各有幾個字？</b><br>（標點符號不算，照傳送的順序排成一串數字。）」</p></div>
    <p class="note">📓 不記得他們傳了什麼？右上角的旅行日誌記錄了所有對話。</p>`,
  ans: ['3508'], solve: '3508', num: true, ph: '一串數字',
  hint: '一則一則數，連只有標點符號的那一則也要算進去。',
  ok: [['jz', '你那則「？？？」是零個字。'], ['xy', '那叫情緒。']],
});

P({
  id: 'c0_exit', ch: 0, t: '另外一個出口', lv: 2, icon: '🚪', pos: [56, 34],
  body: () => `<p>博育說他「提早到了，只是在另外一個出口」。M1～M5 五個出口前各站著一個人，手上各拿著一樣東西。</p>
    <svg viewBox="0 0 500 120" style="width:100%"><rect width="500" height="120" rx="12" fill="#E9E1D0"/>${[1, 2, 3, 4, 5].map(i => `<g transform="translate(${i * 90 - 40} 20)"><rect width="70" height="80" rx="8" fill="#5A7A96"/><rect x="8" y="8" width="54" height="50" rx="4" fill="#9CC4E0"/><text x="35" y="76" text-anchor="middle" fill="#fff" font-weight="700" font-size="16">M${i}</text></g>`).join('')}</svg>
    <p>五個人：<b>博育、阿伯、外送員、背包客、高中生</b>。五樣東西：<b>便當、雨傘、珍奶、地圖、吉他</b>。（每個出口剛好一個人、一樣東西。）</p>
    <p><b>博育在哪一個出口？</b></p>`,
  split: [
    '博育的出口號碼，比拿雨傘的人大 2。',
    '外送員站在偶數號的出口。',
    '背包客拿著地圖，而且他和阿伯的出口相鄰（號碼差 1）。',
    '拿吉他的是高中生，他不在 M5。',
    '外送員和拿珍奶的人，出口相鄰。',
  ],
  ans: ['M5', '5', 'M5出口', '5號出口'], solve: 'M5', ph: '例如 M1',
  hint: '先從「差 2」和「偶數號」下手，把每個人可能的出口排列出來，一個一個刪。',
  ok: [['by', '對，我在 M5！'], ['xy', '你提早到，然後站錯出口。'], ['jz', '這就是我們學弟。']],
});

P({
  id: 'c0_board', ch: 0, t: '月台電子看板', lv: 2, icon: '🚆', pos: [78, 46],
  body: () => `<p>甄妮傳來一則越南語訊息，說她查好了等一下要搭的那班火車。</p>
    <div class="c0-vn">“Tàu Tự Cường, đi về phía nam, khởi hành trước mười giờ, số tàu chia hết cho ba, không dừng ở Tân Trúc.”</div>
    ${C0DICT([['tàu', '火車'], ['Tự Cường', '自強號'], ['đi về phía', '往…方向'], ['nam', '南'], ['bắc', '北'], ['khởi hành', '出發'], ['trước', '…之前'], ['mười giờ', '十點'], ['số tàu', '車次'], ['chia hết cho', '能被…整除'], ['ba', '3'], ['không', '不'], ['dừng ở', '停靠'], ['Tân Trúc', '新竹']])}
    <div class="c0-board"><table><tr><th>車次</th><th>車種</th><th>往</th><th>開車</th><th>停靠新竹</th></tr>
    ${[['111', '自強', '南', '09:10', '●'], ['117', '自強', '南', '08:50', '●'], ['123', '自強', '南', '09:40', '—'], ['125', '自強', '南', '09:55', '—'], ['129', '莒光', '南', '09:20', '—'], ['132', '自強', '北', '09:30', '—'], ['141', '自強', '南', '10:05', '—'], ['156', '區間', '南', '09:00', '●'], ['165', '自強', '南', '10:00', '—'], ['171', '自強', '北', '09:45', '—']].map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table></div>
    <p><b>甄妮要搭哪一班？（車次）</b></p>`,
  ans: ['123'], solve: '123', num: true, ph: '車次',
  hint: '一個條件一個條件刪。注意「十點之前」和「被 3 整除」都有陷阱。',
  ok: [['zn', 'Chính xác!', '完全正確！'], ['jz', '她越南話查時刻表比我們中文還快。']],
});

// 越南語問路：格子地圖
const C0MAP = (() => {
  // 0..5 × 0..5，y 往下是南。走道格子是空的，其他是商店
  const shop = {
    '0,0': '咖啡', '1,0': '花店', '2,0': '書店', '3,0': '眼鏡', '4,0': '藥局', '5,0': '甜點',
    '0,1': '拉麵', '2,1': '伴手禮', '4,1': '鐵路便當', '5,1': '手機殼',
    '0,2': '飯糰', '4,2': '雜誌', '5,2': '鳳梨酥',
    '0,3': '書店', '2,3': '牛肉麵', '3,3': '鞋店', '4,3': '茶葉蛋', '5,3': '文具',
    '0,4': '珍奶', '2,4': '雨傘', '3,4': '襪子', '4,4': '香水', '5,4': '餅乾',
    '0,5': '寄物櫃', '2,5': '服務台', '3,5': '便利商店', '4,5': '換錢', '5,5': '廁所',
  };
  let s = '';
  for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
    const k = `${x},${y}`, n = shop[k];
    s += n ? `<rect x="${x * 80 + 2}" y="${y * 60 + 2}" width="76" height="56" rx="6" fill="#F5E8D0" stroke="#C8B48A"/><text x="${x * 80 + 40}" y="${y * 60 + 35}" text-anchor="middle" font-size="15" font-weight="700" fill="#5A3A20">${n}</text>`
      : `<rect x="${x * 80 + 2}" y="${y * 60 + 2}" width="76" height="56" rx="6" fill="#fff" stroke="#E8E0D0"/>`;
  }
  // 起點
  s += `<g transform="translate(120 330)"><circle r="14" fill="#E86A8F" stroke="#fff" stroke-width="3"/><path d="M0 -9 L6 4 L-6 4Z" fill="#fff"/></g><text x="120" y="356" text-anchor="middle" font-size="12" font-weight="700" fill="#E86A8F">甄妮（面向北）</text>`;
  return `<svg viewBox="0 0 480 362" style="width:100%"><text x="470" y="-4" font-size="0">.</text>${s}<g transform="translate(456 20)"><text text-anchor="middle" font-size="13" font-weight="900" fill="#2A2230">北</text><path d="M0 4 v14 M-5 9 L0 4 L5 9" stroke="#2A2230" stroke-width="2" fill="none"/></g></svg>`;
})();
P({
  id: 'c0_ask', ch: 0, t: '越南語問路', lv: 2, icon: '🧭', pos: [30, 22],
  body: () => `<p>甄妮在地下街問路，路人很熱心，可是她把答案用越南語寫在手上：</p>
    <div class="c0-vn">“Đi thẳng ba ô, rẽ phải, đi thẳng hai ô, rẽ trái, đi thẳng một ô. Cửa hàng ở bên tay phải.”</div>
    ${C0DICT([['đi thẳng', '直走'], ['ô', '格'], ['rẽ', '轉彎'], ['phải', '右'], ['trái', '左'], ['một / hai / ba', '1 / 2 / 3'], ['cửa hàng', '店'], ['ở bên tay', '在…手邊']])}
    ${C0MAP}<p class="note">只能走白色的走道格子。甄妮現在站在粉紅色的點上，面向北。</p>
    <p><b>她要找的是哪一家店？</b></p>`,
  ans: ['鐵路便當', '便當', '台鐵便當', '鐵路便當店'], solve: '鐵路便當', ph: '店名',
  hint: '轉彎以後，「左」「右」是跟著甄妮面向的方向變的。最後一句說的是她右手邊。',
  ok: [['zn', 'Cơm hộp!', '便當！'], ['xy', '她問路問到便當店。'], ['jz', '這是天命。']],
});

P({
  id: 'c0_selfie', ch: 0, t: '俊治的自拍', lv: 2, icon: '📸', pos: [62, 70],
  body: () => `<p>俊治說：「我拍到甄妮走出來的那一刻了。」照片是用<b>手機前鏡頭自拍</b>的，背景剛好是車站大廳的時鐘。照片右上角的時間戳記被他的手指擋住了，只看得到「下午」兩個字。</p>
    <svg viewBox="0 0 400 260" style="width:100%;border-radius:12px"><rect width="400" height="260" fill="#DCE8F4"/>
      <g transform="translate(400 0) scale(-1 1)">
        <rect x="40" y="18" width="320" height="34" rx="6" fill="#2E5450"/><text x="200" y="42" text-anchor="middle" font-size="20" font-weight="700" fill="#FFF6E8" letter-spacing="6">TAIPEI MAIN STATION</text>
        <g transform="translate(200 150)"><circle r="78" fill="#fff" stroke="#2A2230" stroke-width="6"/>
          ${Array.from({ length: 12 }, (_, i) => { const a = i * 30 * Math.PI / 180; return `<text x="${Math.sin(a) * 60}" y="${-Math.cos(a) * 60 + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="#2A2230">${i || 12}</text>`; }).join('')}
          <line x1="0" y1="0" x2="${Math.sin((10 + 20 / 60) * 30 * Math.PI / 180) * 38}" y2="${-Math.cos((10 + 20 / 60) * 30 * Math.PI / 180) * 38}" stroke="#2A2230" stroke-width="7" stroke-linecap="round"/>
          <line x1="0" y1="0" x2="${Math.sin(20 * 6 * Math.PI / 180) * 58}" y2="${-Math.cos(20 * 6 * Math.PI / 180) * 58}" stroke="#2A2230" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="#E8453C"/></g>
      </g>
      <g transform="translate(330 250)"><image href="${PORTRAIT.head('jz', 'smug')}" x="-60" y="-120" width="120" height="120"/></g>
      <rect x="300" y="6" width="94" height="22" rx="4" fill="rgba(0,0,0,.45)"/><text x="347" y="22" text-anchor="middle" font-size="13" fill="#fff">下午 ▇▇:▇▇</text></svg>
    <p><b>甄妮走出來的真正時間是幾點幾分？</b>（24 小時制，四位數）</p>`,
  ans: ['1340', '13:40', '1:40', '0140', '140'], solve: '1340', num: true, ph: '例如 0930',
  hint: '前鏡頭拍出來的東西是左右相反的。看看招牌上的英文就知道了。',
  ok: [['jz', '……我的自拍是反的？'], ['xy', '你的臉也是反的。'], ['jz', '完全法克。']],
});

P({
  id: 'c0_card', ch: 0, t: '撿到的悠遊卡', lv: 2, icon: '💳', pos: [82, 22],
  body: () => `<p>小羽在地上撿到一張悠遊卡，背面貼著一張貼紙：「失主會在他<b>最後出站的那一站</b>等你。」</p>
    <p>用卡機查到的交易紀錄如下，最後一筆的站名糊掉了：</p>
    <table class="c0-log"><tr><th>時間</th><th>交易</th><th>金額</th><th>餘額</th></tr>
      <tr><td>08:12</td><td>加值</td><td>+500</td><td>612</td></tr>
      <tr><td>08:40</td><td>捷運 板橋 → 台北車站</td><td>−20</td><td>592</td></tr>
      <tr><td>09:15</td><td>便利商店 消費</td><td>−45</td><td>547</td></tr>
      <tr><td>09:20</td><td>公車 307</td><td>−15</td><td>532</td></tr>
      <tr><td>09:58</td><td>捷運 台北車站 → ▇▇</td><td>▇▇</td><td>505</td></tr></table>
    <div class="paper" style="font-size:14px">從台北車站出發的捷運票價：西門 16・中山 20・劍潭 25・動物園 27・南港展覽館 30・北投 35・竹圍 40・淡水 50<br>※ <b>一小時內</b>由公車轉乘捷運，<b>捷運車資</b>折抵 8 元。</div>
    <p><b>失主在哪一站等？</b></p>`,
  ans: ['北投', '北投站'], solve: '北投', ph: '站名',
  hint: '把最後一筆真正扣掉的錢算出來之後，別忘了它可能已經被打過折了。',
  ok: [['xy', '失主在北投。'], ['jz', '那就叫他自己過來。'], ['by', '學長……']],
});

P({
  id: 'c0_locker', ch: 0, t: '寄物櫃', lv: 1, icon: '🔐', pos: [50, 52],
  need: ['c0_luggage', 'c0_chat', 'c0_exit', 'c0_board', 'c0_selfie'],
  body: () => `<p>寄物櫃的螢幕上寫著：「歡迎來到台灣。請把你們今天解開的東西，照下面的順序變成四個數字。」</p>
    <div class="c0-locker"><div>① 🧳 行李箱密碼的<b>最後一位</b></div><div>② 🚆 甄妮那班車車次的<b>中間那一位</b></div><div>③ 🚪 博育那個出口的<b>號碼</b></div><div>④ 📸 真正時間的<b>分鐘的十位數</b></div></div>
    <p class="note">還有 📱 那一題的答案，是用來檢查你們有沒有偷懶的：把四個數字加起來，會等於它的「前兩位數字相加」再加 5。</p>`,
  ans: ['2254', '2-2-5-4'], solve: '2254', num: true, ph: '四位數',
  hint: '把前面每一題的答案寫在一起，照順序一個一個拿出要的那一位。',
  ok: [['by', '櫃子打開了！裡面是……故宮的門票？'], ['xy', '這遊戲在帶我們跑景點。'], ['jz', 'Bang!']],
});
