'use strict';
// ===== 第八章：饒河夜市——最後的晚餐（11 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c8-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 3px 8px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 6px 0; }
.c8-dict span b { color: #C9332B; }
.c8-vn { font-size: 17px; font-weight: 700; color: #1E5AA8; background: #EAF3FF; border-radius: 10px; padding: 10px 12px; margin: 6px 0; line-height: 1.6; }
.c8-board { background: #2A1A10; color: #FFE7B0; border-radius: 12px; padding: 10px 12px; font-size: 14px; line-height: 1.6; }
.c8-board h5 { margin: 0 0 6px; font-size: 18px; color: #FFCF5A; text-align: center; letter-spacing: .2em; }
.c8-tix { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin: 6px 0; }
.c8-tix div { background: #FFF4E0; border: 1.5px solid #E0B060; border-radius: 8px; text-align: center; font-size: 12px; padding: 4px 2px; }
.c8-tix b { display: block; font-size: 17px; color: #8A2A1A; }
.c8-tix .me { background: #FFE0E8; border-color: #E86A8F; }
.c8-chat { background: #E8F0F8; border-radius: 12px; padding: 6px 8px; font-size: 14px; }
.c8-chat p { margin: 4px 0 !important; background: #fff; border-radius: 10px; padding: 4px 8px; }
.c8-chat small { color: #7A8A9A; margin-right: 6px; font-family: ui-monospace, Menlo, monospace; }
.c8-throws { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; background: #3A1414; border-radius: 12px; padding: 8px; margin: 6px 0; }
.c8-throws .q { background: #F2C230; color: #3A2A10; border-radius: 8px; padding: 2px 8px; font-weight: 900; font-size: 14px; }
.c8-throws svg { width: 52px; height: 30px; background: #5A2020; border-radius: 6px; }
.c8-poems { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.c8-poems div { background: #FFF2D8; border: 2px solid #C8402A; border-radius: 8px; padding: 6px 8px; font-family: var(--serif, serif); font-size: 15px; line-height: 1.55; }
.c8-poems b { display: block; text-align: center; color: #C8402A; font-size: 13px; }
.c8-cups { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px; font-size: 13px; }
.c8-cups div { background: #FFF9EC; border: 1.5px solid #E8D8B8; border-radius: 8px; padding: 6px 8px; }
.c8-cups b { color: #8A3AA8; }
.c8-items { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 6px 0; }
.c8-items div { width: 92px; text-align: center; font-size: 12px; background: #FFF9EC; border: 1.5px solid #E8D8B8; border-radius: 10px; padding: 6px 4px; }
.c8-items i { display: block; font-style: normal; font-size: 26px; }
.c8-note { background: repeating-linear-gradient(#FFFDF4 0 25px, #D8E4F0 25px 26px); border-left: 3px solid #E8A0A0; padding: 2px 10px; font-size: 14px; line-height: 26px; border-radius: 4px; }
.c8-note s { color: #8A6A3A; text-decoration: none; background: #C8A878; border-radius: 6px; padding: 0 4px; }
.c8-ring canvas { width: 100%; height: auto; border-radius: 12px; display: block; touch-action: none; }
.c8-ring .btn { user-select: none; -webkit-user-select: none; touch-action: none; }
.k-dig.c8-drawer { --dcell: 46px; }
@media (max-width: 760px) { .k-dig.c8-drawer { --dcell: 44px; } }
</style>`);

const C8DICT = (words) => `<div class="c8-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;
// K.aim 的標籤固定 15px，手機上看不清楚：只放大這一個 canvas 的字
const C8_BIGFONT = (cv, px, dy) => { try {
  const g = cv.getContext('2d'), d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font'), ft = CanvasRenderingContext2D.prototype.fillText;
  Object.defineProperty(g, 'font', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, String(v).replace(/\b15px/, px + 'px')); } });
  g.fillText = function (t, x, y, ...r) { return ft.call(this, t, x, y + (this.font.includes(px + 'px') ? dy : 0), ...r); };
} catch (e) {} };

// ---------------------------------------------------------------------------
const C8_TIX = [[39, 6], [40, 10], [41, 4], [42, 8], [43, 3], [44, 12], [45, 5], [46, 3]];
P({
  id: 'c8_pepper', ch: 8, t: '胡椒餅排隊中', lv: 2, icon: '🥟', pos: [14, 22],
  body: () => `<p>胡椒餅的攤位前排了一條長長的隊伍。小羽抽了號碼牌，豪氣地說：</p>
    <div class="paper">小羽：「我要買的數量，<b>跟我這兩天說『神人』的次數一樣多</b>。一個都不能少，拿齊了再走。」</div>
    <div class="c8-board"><h5>🔥 炭爐胡椒餅</h5>
      ・一爐 <b>20 個</b>，烤 15 分鐘；出爐後要花 3 分鐘把下一爐的餅貼上爐壁，所以<b>每 18 分鐘出一爐</b>。<br>
      ・上一爐 <b>19:09</b> 出爐，已經全部發完（發到 38 號）。<br>
      ・每一爐都要先留 <b>5 個</b>給外送平台。<br>
      ・照號碼順序發。一張號碼要<b>一次拿齊</b>；前面的人還沒拿齊，後面的人就不能拿。</div>
    <p style="margin-top:8px">現在 19:20，還在等的號碼牌（數字是要買的個數）：</p>
    <div class="c8-tix">${C8_TIX.map(([n, k]) => `<div>${n} 號<b>${k} 個</b></div>`).join('')}<div class="me">47 號<b>小羽</b></div></div>
    <p><b>小羽幾點才能拿到他所有的胡椒餅？</b>（例如 19:45）</p>
    <p class="note">📓 不記得他說了幾次？看旅行日誌。</p>`,
  ans: ['20:21', '2021', '8:21', '0821', '晚上8:21', '晚上8點21分', '20點21分'], solve: '20:21', ph: '幾點幾分',
  hint: '先數清楚小羽本人說的「神人」（俊治說的不算）。每一爐真正能給排隊客人的，不是 20 個。',
  ok: [['xy', '九個胡椒餅，一人兩個多。'], ['jz', '你說了九次神人？'], ['xy', '神人。'], ['by', '現在十次了。']],
});

// ---------------------------------------------------------------------------
const C8_KS = '645123123546516432234651462315351264';
const C8_KID = [9, 7, 7, 7, 7, 6, 9, 9, 3, 3, 6, 6, 5, 5, 3, 11, 11, 1, 12, 12, 13, 2, 2, 1, 0, 0, 0, 10, 10, 1, 8, 4, 4, 4, 10, 1];
const C8_KCOL = { 0: 0, 1: 0, 2: 1, 3: 0, 4: 1, 5: 1, 6: 1, 7: 2, 8: 2, 9: 3, 10: 2, 11: 2, 12: 2, 13: 3 };
const C8_KSUM = (() => { const s = {}; C8_KID.forEach((c, k) => s[c] = (s[c] || 0) + +C8_KS[k]); return s; })();
P({
  id: 'c8_herbal', ch: 8, t: '藥燉排骨的藥櫃', lv: 2, icon: '🍲', pos: [36, 18],
  body: () => `<p>藥燉排骨的老闆有一個 6×6 的中藥櫃。他說：「每個抽屜放 1～6 錢的藥材。<b>每一橫排、每一直排、每一個粗框（2×3）</b>裡，1～6 都剛好各出現一次。同一個顏色的區塊是同一帖藥，左上角的小數字是那一帖的總重量，<b>同一帖裡的數字不會重複</b>。」</p>
    <p>甄妮：<span style="color:#1E5AA8;font-weight:700">“Nếu điền đúng, ông chủ sẽ cho thêm một bát canh!”</span>（填對的話，老闆會多送一碗湯！）</p>
    <p class="note">把 36 格都填好再按「確定送出」。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const pal = ['#FFE7C2', '#D8F0DC', '#DCE8FA', '#F6DCEC'], first = {};
    C8_KID.forEach((c, k) => { if (first[c] == null) first[c] = k; });
    const given = done ? Object.fromEntries([...C8_KS].map((d, k) => [`${k / 6 | 0},${k % 6}`, d])) : {};
    const box = document.createElement('div'); box.style.textAlign = 'center'; el.append(box);
    const w = K.digits(box, ctx, {
      r: 6, c: 6, max: 6, given,
      cage: (i, j) => { const k = i * 6 + j, c = C8_KID[k]; return { bg: pal[C8_KCOL[c]], label: first[c] === k ? String(C8_KSUM[c]) : '' }; },
      border: (i, j) => ({ borderRight: j === 2 ? '3px solid #2A2230' : '', borderBottom: i === 1 || i === 3 ? '3px solid #2A2230' : '' }),
    });
    w.classList.add('c8-drawer');
    if (done) { const b = box.querySelector('.k-row'); if (b) b.remove(); }
  },
  ui: 'none', ans: [C8_KS], solve: C8_KS, show: '藥櫃填好了',
  hint: '先找只有兩格的小區塊和角落：總和很小或很大的區塊，可能的數字組合很少。再用粗框、橫排、直排一起刪。',
  ok: [['zn', 'Canh này thơm quá!', '這個湯好香！', 'happy'], ['xy', '藥燉排骨，喝了變神人。'], ['by', '那是補身體的。']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c8_oyster', ch: 8, t: '誰吃了博育的麵線？', lv: 2, icon: '🍜', pos: [60, 22],
  body: () => `<p>博育買了一碗蚵仔麵線放在桌上，回來的時候<b>只剩一半</b>，碗旁邊還有一小堆<b>被挑出來的香菜</b>。大家的群組聊天紀錄被分成了好幾張線索卡。</p>
    <p><b>到底是誰吃掉的？</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.choice(el, ctx, [['小羽', 'xy'], ['俊治', 'jz'], ['甄妮', 'zn'], ['博育自己', 'by'], ['路過的阿伯', 'old'], ['夜市的流浪狗', 'dog']].map(([t, v]) => ({ t, v })), { cols: 3 }); },
  split: [
    `<b>🧑 小羽的訊息</b><div class="c8-chat"><p><small>19:38</small>我在排臭豆腐，前面還有十個人</p><p><small>19:50</small>臭豆腐拿到了！走回去要 4 分鐘</p><p><small>19:51</small>順便說，俊治連香菜都會一根一根挑掉，有夠挑食</p></div>`,
    `<b>😎 俊治的訊息</b><div class="c8-chat"><p><small>19:41</small>射氣球老闆說我眼睛有問題</p><p><small>19:46</small>回桌上了，好無聊</p><p><small>19:53</small>我一直在幫博育顧麵線啊</p></div>`,
    `<b>👸 甄妮的訊息</b><div class="c8-chat"><p><small>19:43</small>Tôi về bàn rồi. Mì vẫn còn đầy.</p><p><small>19:44</small>Tôi đi mua trà sữa với Bác Dục.</p><p><small>19:45</small>Tôi rất thích rau mùi!</p></div><small>小抄：tôi 我・về bàn 回到桌子・rồi 了・mì 麵（線）・vẫn còn 還是・đầy 滿的・đi mua 去買・trà sữa 奶茶・với 和・Bác Dục 博育・rất thích 很喜歡・rau mùi 香菜</small>`,
    `<b>😇 博育的訊息</b><div class="c8-chat"><p><small>19:40</small>麵線先放桌上，我去買珍奶</p><p><small>19:45</small>甄妮也跑來珍奶店了，我們一起排隊排到 19:51</p><p><small>19:52</small>我回來了……我的麵線只剩一半！旁邊還有一堆香菜！！</p></div>`,
  ],
  ui: 'none', ans: ['jz'], solve: 'jz', show: '俊治',
  hint: '把每個人「人在哪裡」的時間畫成一條時間線，看看 19:43 到 19:52 之間，誰有機會待在桌子旁邊。',
  ok: [['jz', '……香菜是我挑的沒錯。'], ['by', '學長！', null, 'angry'], ['jz', '我是在幫你試毒。'], ['xy', '完全法克。']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c8_tofu', ch: 8, t: '臭豆腐的號碼牌', lv: 2, icon: '🧆', pos: [84, 20],
  body: () => `<p>甄妮第一次吃臭豆腐，吃完在留言板上寫了一句越南話。老闆看了很高興：「把她這句話<b>每一個字的聲調</b>換成數字，就是今天的招待號碼！」</p>
    <div class="c8-vn" style="font-size:20px;text-align:center">“Mũi tôi khổ quá, nhưng miệng thì vui!”<br><small style="font-size:14px;color:#5A6A80">（我的鼻子好痛苦，但是嘴巴很開心！）</small></div>
    <div class="paper">📒 甄妮的小抄・越南語有六個聲調，最有名的例子是「ma」：<br>
      <span class="big" style="font-size:19px">ma＝1　mà＝2　má＝3　mả＝4　mã＝5　mạ＝6</span><br>
      <small>（每個字最多只有一個聲調記號，可能在字母上面、也可能在下面。）</small></div>
    <p><b>招待號碼是多少？</b>（照字的順序寫成一串數字）</p>`,
  ans: ['51431621'], solve: '51431621', num: true, ph: '一串數字',
  hint: '只有表格裡那五種記號才是聲調。字母上的帽子 ^、小鉤 ơ ư、ă 的彎彎，都只是字母的一部分。',
  ok: [['zn', 'Ngon thật đấy!', '真的好吃！', 'happy'], ['xy', '她鼻子痛苦但嘴巴開心，這就是臭豆腐。'], ['jz', '神人等級的形容。']],
});

// ---------------------------------------------------------------------------
const C8_JIAO = (t) => { // t: 'S' 聖（一平一凸）、'X' 笑（兩平）、'Y' 陰（兩凸）
  const f = (x, flat) => flat ? `<path d="M${x} 22 a10 13 0 0 1 20 0 Z" fill="#F08060" stroke="#FFD0B0" stroke-width="1.5"/><line x1="${x}" y1="22" x2="${x + 20}" y2="22" stroke="#FFE0C0" stroke-width="2"/>`
    : `<path d="M${x} 22 a10 13 0 0 1 20 0 Z" fill="#8A1A10" stroke="#3A0A06" stroke-width="1.5"/><ellipse cx="${x + 7}" cy="15" rx="3" ry="5" fill="#E86A50" opacity=".7"/>`;
  const [a, b] = t === 'S' ? [1, 0] : t === 'X' ? [1, 1] : [0, 0];
  return `<svg viewBox="0 0 52 30">${f(4, a)}${f(28, b)}</svg>`;
};
const C8_LOG = [['q', 12], 'S', 'S', 'S', 'X', 'Y', 'S', ['q', 23], 'S', 'S', 'X', ['q', 8], 'S', 'Y', ['q', 41], 'S', 'S', 'S'];
const C8_POEM = {
  12: ['神仙也愛人間味', '人生難得幾回醉', '完了一杯又一杯', '全憑歡喜不須悲'],
  23: ['珍珠落盤聲聲響', '奶香飄過饒河街', '半生緣分今宵定', '糖甜不及故人情'],
  8: ['雞鳴報曉天將白', '排隊三更未肯歸', '好事多磨須耐等', '吃苦當作吃甘飴'],
  41: ['了然心事月分明', '解開千結見真情', '彼岸花開人相伴', '此行不負少年行'],
};
P({
  id: 'c8_temple', ch: 8, t: '慈祐宮的籤', lv: 2, icon: '🏮', pos: [24, 44],
  body: () => `<p>夜市入口的慈祐宮香火很旺。甄妮學台灣人擲筊抽籤，博育在旁邊把她每一次擲出來的結果都記了下來（🎋 是她抽到的籤號）：</p>
    <div class="c8-throws">${C8_LOG.map(x => Array.isArray(x) ? `<span class="q">🎋 ${x[1]}</span>` : C8_JIAO(x)).join('')}</div>
    <div class="paper" style="font-size:14px">🪔 <b>擲筊</b>：兩塊筊，淺色＝平面朝上、深色＝凸面朝上（例如 ${C8_JIAO('S').replace('<svg', '<svg style="width:46px;height:27px;vertical-align:middle;background:#5A2020;border-radius:4px"')} 是左平右凸）。<br>
      一平一凸＝<b>聖筊</b>（媽祖說好）；兩個平面＝笑筊；兩個凸面＝陰筊。<br>
      📜 <b>抽籤的規矩</b>：① 一定要<b>先</b>擲出一個聖筊（媽祖答應讓你抽），才可以抽籤。② 抽到籤號以後，要<b>連續三個聖筊</b>才是你的籤；中間只要出現笑筊或陰筊，這支籤就不算，放回去重抽（不用再問一次）。</div>
    <div class="c8-poems">${Object.entries(C8_POEM).map(([n, ls]) => `<div><b>第 ${n} 籤</b>${ls.join('<br>')}</div>`).join('')}</div>
    <p><b>甄妮真正的那支籤，藏著哪四個字？</b></p>`,
  ans: ['了解彼此'], solve: '了解彼此', ph: '四個字',
  hint: '照規矩一個一個對：第一個籤號抽到的時候，媽祖答應了嗎？找到真正的籤之後，看每一句的同一個位置。',
  ok: [['zn', 'Hiểu nhau…', '了解彼此……'], ['by', '這句話好像在哪裡會用到。'], ['xy', '我只看到「珍奶半糖」。']],
});

// ---------------------------------------------------------------------------
const C8_BAL = [['chín', 9, 'đỏ'], ['ba', 3, 'đỏ'], ['bảy', 7, 'vàng'], ['hai', 2, 'vàng'], ['tám', 8, 'xanh'], ['năm', 5, 'xanh'], ['sáu', 6, 'trắng'], ['một', 1, 'trắng'], ['mười', 10, 'đen'], ['bốn', 4, 'đen'], ['mười', 10, 'xanh']];
const C8_BCOL = { 'đỏ': '#E8453C', 'vàng': '#E0A010', 'xanh': '#2E9A5A', 'trắng': '#B8B0A0', 'đen': '#2A2230' };
P({
  id: 'c8_balloon', ch: 8, t: '射氣球', lv: 1, icon: '🎈', pos: [50, 44],
  body: () => `<p>射氣球攤的老闆很會做生意，氣球上寫的全是越南文數字。甄妮把規則念給大家聽：</p>
    <div class="c8-vn">“Bắn vỡ ba quả bóng, ba màu khác nhau. Tổng là hai mươi. Không có màu đen. Quả có số lớn nhất phải là màu đỏ.”</div>
    ${C8DICT([['bắn vỡ', '射破'], ['ba', '3'], ['quả bóng', '氣球'], ['màu', '顏色'], ['khác nhau', '不一樣'], ['tổng là', '總和是'], ['hai mươi', '20'], ['không có', '沒有'], ['đen', '黑'], ['số lớn nhất', '最大的數字'], ['phải là', '一定要是'], ['đỏ', '紅'], ['vàng', '黃'], ['xanh', '綠'], ['trắng', '白'], ['một…mười', '1…10（看小抄）']])}
    <p class="note">準星會晃，氣球會飄，按「發射！」。<b>射破不該射的氣球，算答錯（地圖 -1）</b>；沒射中不算。三顆對的都射破就過關（順序不限）。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const good = ['chín9đỏ', 'năm5xanh', 'sáu6trắng'];
    K.aim(el, ctx, {
      balloon: true, bg: '#1E2A50', info: '射破三顆對的氣球',
      targets: C8_BAL.map(([w, n, c], i) => ({ label: w, color: C8_BCOL[c], r: 27, id: w + n + c, f: (t) => { const sp = 22 + (i % 4) * 6, y = 330 - ((t * sp + i * 97) % 420); return { x: 40 + i * 52 + 14 * Math.sin(t * 1.3 + i), y }; } })),
      cross: (t) => ({ x: 300 + 262 * Math.sin(t * 0.7), y: 150 + 55 * Math.sin(t * 1.6) }),
      onHit: (b, hits, tg) => { if (!good.includes(b.id)) return 'fail'; return tg.filter(x => x.dead && good.includes(x.id)).length >= 3 ? { done: true, token: 'balloon-956' } : undefined; },
    });
    C8_BIGFONT(el.querySelector('.k-aim canvas'), 21, 3);
  },
  ui: 'none', ans: ['balloon-956'], solve: 'balloon-956', show: 'chín（紅 9）、năm（綠 5）、sáu（白 6）',
  hint: '最大的是紅色，那紅色只能是哪一顆？剩下兩顆要用其他兩種顏色湊出差額，而且都要比紅色小。',
  ok: [['zn', 'Tôi bắn giỏi không?', '我射得很準吧？', 'happy'], ['jz', '我剛剛一顆都沒中。'], ['xy', '老闆說你眼睛有問題。']],
});

// ---------------------------------------------------------------------------
const C8_BOT = [[12, 5, 17, 9, 14], [7, 15, 8, 11, 3], [4, 10, 6, 16, 2], [9, 3, 12, 1, 13]];  // 第 0 排最遠
P({
  id: 'c8_ring', ch: 8, t: '套圈圈', lv: 1, icon: '⭕', pos: [76, 44],
  body: () => `<p>套圈圈的攤位上擺了四排瓶子。老闆說：「只有一個瓶子是大獎。」然後在黑板上寫：</p>
    <div class="paper">🏆 大獎瓶的號碼，<b>剛好等於它左右兩邊兩個瓶子號碼的和</b>；<br>而且它<b>正後方</b>（離你更遠的那一排）的瓶子，號碼比它大。</div>
    <p class="note">用 ◀ ▶ 選直排，<b>按住</b>「丟！」蓄力、<b>放開</b>丟出去：力道愈大丟得愈遠（左邊的力道條有刻度）。<b>套中別的瓶子算答錯（地圖 -1）</b>；掉在地上不算。</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx); if (done) return;
    const box = document.createElement('div'); box.className = 'c8-ring';
    box.innerHTML = `<canvas width="600" height="330"></canvas><div class="k-row"><span class="muted small c8-ri">選好直排，按住丟！</span><button type="button" class="btn ghost sm" data-d="-1">◀</button><button type="button" class="btn ghost sm" data-d="1">▶</button><button type="button" class="btn red sm c8-go">按住蓄力・放開丟！</button></div>`;
    el.append(box);
    const cv = box.querySelector('canvas'), g = cv.getContext('2d'), info = box.querySelector('.c8-ri'), go = box.querySelector('.c8-go');
    const RY = [80, 130, 184, 242], RS = [.62, .74, .87, 1], P0 = 300, P1 = 40;  // 力道 0→落點 y=300、力道 1→y=40
    const scaleAt = (y) => { if (y <= RY[0]) return RS[0] - (RY[0] - y) * .0024; for (let i = 1; i < 4; i++) if (y <= RY[i]) return RS[i - 1] + (RS[i] - RS[i - 1]) * (y - RY[i - 1]) / (RY[i] - RY[i - 1]); return RS[3] + (y - RY[3]) * .0024; }, colX = (c, s) => 300 + (c - 2) * 112 * s;
    let col = 2, charge = null, fly = null, stop = false, landed = [];
    const pw = (now) => { const ph = ((now - charge) / 1300) % 2; return ph < 1 ? ph : 2 - ph; };
    box.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (fly) return; col = Math.max(0, Math.min(4, col + +b.dataset.d)); });
    const down = (e) => { e.preventDefault(); if (fly || stop || charge != null) return; charge = performance.now(); };
    const up = (e) => { if (charge == null) return; const p = pw(performance.now()); charge = null; const y = P0 - p * (P0 - P1), s = scaleAt(y); fly = { t0: performance.now(), x0: colX(col, 1.05), y0: 318, x1: colX(col, s), y1: y, p }; };
    go.onpointerdown = down; go.onpointerup = up; go.onpointerleave = up; go.onpointercancel = up; go.oncontextmenu = (e) => e.preventDefault();
    function land(f) {
      const r = RY.findIndex((ry, i) => Math.abs(f.y1 - ry) < 15 * RS[i]);
      if (r < 0) { info.textContent = '沒套中，圈圈掉在地上了。再試一次！'; landed.push([f.x1, f.y1]); if (landed.length > 6) landed.shift(); return; }
      if (r === 2 && col === 1) { stop = true; info.textContent = '套中了！'; ctx.submit('ring-10'); return; }
      info.textContent = `套中了 ${C8_BOT[r][col]} 號……不是大獎！`; ctx.submit('__miss__');
    }
    function frame(now) {
      if (!document.body.contains(cv)) return;
      g.fillStyle = '#3A1E2E'; g.fillRect(0, 0, 600, 330);
      g.fillStyle = '#5A2A3A'; g.beginPath(); g.moveTo(120, 50); g.lineTo(480, 50); g.lineTo(600, 280); g.lineTo(0, 280); g.closePath(); g.fill();
      for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#E8453C' : '#FFF3E0'; g.fillRect(i * 67, 0, 67, 26); }
      landed.forEach(([x, y]) => { g.strokeStyle = 'rgba(255,217,120,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, 16 * scaleAt(y), 6 * scaleAt(y), 0, 0, 7); g.stroke(); });
      C8_BOT.forEach((row, r) => row.forEach((n, c) => {
        const s = RS[r], x = colX(c, s), y = RY[r], w = 30 * s, h = 46 * s;
        g.fillStyle = ['#2E9A5A', '#2E7FD8', '#C8402A', '#E0A010'][(r + c) % 4]; g.fillRect(x - w / 2, y - h, w, h); g.fillRect(x - w / 5, y - h - 14 * s, w / 2.5, 14 * s);
        g.fillStyle = '#fff'; g.font = `900 ${Math.round(22 * s)}px Noto Sans TC, sans-serif`; g.textAlign = 'center'; g.fillText(n, x, y - h / 2 + 8 * s);
      }));
      // 瞄準箭頭
      g.fillStyle = '#FFD978'; const ax = colX(col, 1.05); g.beginPath(); g.moveTo(ax, 292); g.lineTo(ax - 12, 316); g.lineTo(ax + 12, 316); g.fill();
      // 力道條
      g.fillStyle = '#1A1020'; g.fillRect(14, P1 - 6, 22, P0 - P1 + 12);
      RY.forEach((ry, i) => { g.strokeStyle = '#9AB'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, ry); g.lineTo(40, ry); g.stroke(); });
      if (charge != null) { const p = pw(now), y = P0 - p * (P0 - P1); g.fillStyle = '#FF6A5A'; g.fillRect(16, y, 18, P0 - y); }
      if (fly) {
        const k = Math.min(1, (now - fly.t0) / 650), x = fly.x0 + (fly.x1 - fly.x0) * k, y = fly.y0 + (fly.y1 - fly.y0) * k - Math.sin(k * Math.PI) * 90, s = scaleAt(Math.max(40, y));
        g.strokeStyle = '#FFD978'; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 18 * s, 7 * s, 0, 0, 7); g.stroke();
        if (k >= 1) { const f = fly; fly = null; land(f); }
      }
      if (!stop) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  },
  ui: 'none', ans: ['ring-10'], solve: 'ring-10', show: '第三排的 10 號瓶',
  hint: '一排一排檢查中間的瓶子：先找「等於左右相加」的，再看它後面那一個。',
  ok: [['xy', '大獎是……一隻巨大的鴨子玩偶。'], ['jz', '又是鴨子。'], ['zn', 'Lại là vịt!', '又是鴨子！', 'happy']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c8_fish', ch: 8, t: '撈金魚的成績單', lv: 1, icon: '🐟', pos: [14, 68],
  body: () => `<p>撈金魚的攤位用顏色算分數。甄妮撈完一整盆，得意地用越南話報成績：</p>
    <div class="c8-board"><h5>🐠 撈金魚計分</h5>紅色 1 分・金色 2 分・白色 3 分・黑色 5 分</div>
    <div class="c8-vn">“Tôi bắt được mười hai con cá, được ba mươi điểm! Cá đỏ nhiều nhất. Có cá đen. Số cá vàng bằng số cá trắng.”</div>
    ${C8DICT([['tôi bắt được', '我撈到'], ['mười hai', '12'], ['con cá', '條魚'], ['được … điểm', '得到…分'], ['ba mươi', '30'], ['nhiều nhất', '最多'], ['có', '有'], ['số', '數量'], ['bằng', '等於'], ['đỏ', '紅'], ['vàng', '金/黃'], ['trắng', '白'], ['đen', '黑']])}
    <p><b>甄妮撈到的 紅、金、白、黑 各有幾條？</b>（照這個順序寫四個數字）</p>`,
  ans: ['5223', '5-2-2-3'], solve: '5223', num: true, ph: '紅金白黑',
  hint: '金色和白色一樣多，就把它們綁在一起算（一組 5 分）。再試黑色有幾條。',
  ok: [['zn', 'Mười hai con!', '十二條！', 'happy'], ['by', '帶不回越南吧……'], ['jz', '放回去，這叫放生。']],
});

// ---------------------------------------------------------------------------
// 彈珠台：A→(B|C)→(D|E|F)→ 1～4 號格；L 往左、R 往右，經過後翻面（D 生鏽了不會翻）
const C8_PB = (() => {
  const st = { A: 'L', B: 'R', C: 'L', D: 'L', E: 'R', F: 'L' }, pos = { A: [200, 60], B: [140, 130], C: [260, 130], D: [80, 200], E: [200, 200], F: [320, 200] };
  let s = `<rect width="400" height="330" rx="18" fill="#1A3A6A"/><rect x="12" y="12" width="376" height="306" rx="12" fill="#2A5A9A" stroke="#F2C230" stroke-width="3"/>`;
  s += `<circle cx="200" cy="26" r="9" fill="#E8E8F0" stroke="#fff" stroke-width="2"/><text x="222" y="31" font-size="13" fill="#FFE97A" font-weight="700">入口</text>`;
  const L = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'E'], ['C', 'F']];
  L.forEach(([a, b]) => s += `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" stroke="#8AB8E8" stroke-width="3" stroke-dasharray="4 5"/>`);
  [['D', 50], ['D', 140], ['E', 140], ['E', 260], ['F', 260], ['F', 350]].forEach(([a, x]) => s += `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${x}" y2="265" stroke="#8AB8E8" stroke-width="3" stroke-dasharray="4 5"/>`);
  Object.entries(pos).forEach(([k, [x, y]]) => {
    const rust = k === 'D', dir = st[k] === 'L' ? -1 : 1;
    s += `<circle cx="${x}" cy="${y}" r="22" fill="${rust ? '#8A5A3A' : '#F2F2F8'}" stroke="${rust ? '#5A3A1A' : '#C8D0E0'}" stroke-width="3"/><path d="M${x - 12 * dir} ${y - 10} L${x + 14 * dir} ${y + 12}" stroke="${rust ? '#FFD0A0' : '#E8453C'}" stroke-width="6" stroke-linecap="round"/><path d="M${x + 14 * dir} ${y + 12} l${-11 * dir} -1 m${11 * dir} 1 l${-dir} -11" stroke="${rust ? '#FFD0A0' : '#E8453C'}" stroke-width="4" stroke-linecap="round"/><text x="${x + 28}" y="${y - 14}" font-size="14" font-weight="900" fill="#FFE97A">${k}</text>`;
  });
  ['1', '2', '3', '4'].forEach((n, i) => { const x = [50, 140, 260, 350][i]; s += `<rect x="${x - 36}" y="268" width="72" height="40" rx="8" fill="#0E2240" stroke="#F2C230" stroke-width="2"/><text x="${x}" y="296" text-anchor="middle" font-size="20" font-weight="900" fill="#FFE97A">${n} 號</text>`; });
  return `<svg viewBox="0 0 400 330" style="width:100%;max-width:420px;display:block;margin:6px auto">${s}</svg>`;
})();
P({
  id: 'c8_pinball', ch: 8, t: '古早彈珠台', lv: 2, icon: '🎯', pos: [40, 70],
  body: () => `<p>夜市角落有一台古早的機關彈珠台。老闆說：「投 8 顆彈珠，<b>猜對每一格最後各有幾顆</b>，送你一杯珍奶。」</p>
    ${C8_PB}
    <div class="paper" style="font-size:14px">🔴 每個圓盤上的箭頭，指的是彈珠碰到它之後會往<b>哪一邊</b>滾下去（往左下或右下）。<br>🔁 彈珠一離開圓盤，圓盤就會<b>翻面</b>：箭頭換成另一邊。<br>🟤 <b>D 生鏽了</b>，永遠不會翻面。<br>⚪ 彈珠一顆一顆投，前一顆掉進格子以後才投下一顆。</div>
    <p><b>8 顆投完後，1～4 號格各有幾顆？</b>（照 1、2、3、4 號的順序寫四個數字）</p>`,
  ans: ['2231', '2-2-3-1'], solve: '2231', num: true, ph: '四個數字',
  hint: '拿紙筆，一顆一顆模擬，每投完一顆就把經過的圓盤（除了 D）翻面再畫一次。',
  ok: [['xy', '老闆，珍奶要全糖。'], ['by', '我們等一下就要去買珍奶了……'], ['jz', '兩杯，神人。']],
});

// ---------------------------------------------------------------------------
P({
  id: 'c8_boba', ch: 8, t: '珍奶杯上的代碼', lv: 1, icon: '🧋', pos: [64, 68],
  body: () => `<p>夜市的手搖飲料店不叫名字，只在杯子上貼一個三位數代碼。四個人各點一杯，店員說：「<b>把你們四杯的代碼加起來</b>告訴我，我就知道哪四杯是你們的。」</p>
    <div class="c8-board"><h5>🧋 代碼＝甜度・冰塊・加料</h5>
      甜度：全糖 5・少糖 4・半糖 3・微糖 2・一分糖 1・無糖 0<br>
      冰塊：正常冰 5・少冰 4・微冰 3・去冰（不加冰塊）2・常溫 1・熱 0<br>
      加料（加起來）：珍珠 1・椰果 2・布丁 4・沒加料 0<br>
      <small>例：半糖、微冰、珍珠＋椰果 → 3 3 3 → <b>333</b></small></div>
    <p class="note">每個人怎麼點的，在各自的線索卡上。</p>`,
  split: [
    `<b>👸 甄妮：</b><span class="c8-vn" style="display:block;font-size:15px">“Trà sữa trân châu, ít đường, ít đá, thêm pudding.”</span><small>小抄：trà sữa 奶茶・trân châu 珍珠・ít 少・đường 糖・đá 冰・thêm 加</small>`,
    '<b>🧑 小羽：</b>「全糖、正常冰，<b>所有的料全部都加</b>。」',
    '<b>😎 俊治：</b>「跟小羽一樣，但是<b>不要冰、也不要糖</b>，料只要椰果。」',
    '<b>😇 博育：</b>「半糖少冰，珍珠就好……啊不對，我今天喉嚨痛，<b>改成熱的</b>。」',
  ],
  ans: ['1325'], solve: '1325', num: true, ph: '四杯代碼的總和',
  hint: '每個人翻成三位數代碼（甄妮的越南話要翻譯、俊治的「不要冰」是哪一種），再加起來。注意代碼第一位可以是 0。',
  ok: [['xy', '全糖全料，人生就是要這樣。'], ['by', '學長你會蛀牙。'], ['zn', 'Ngọt quá!', '好甜！', 'happy']],
});

// ---------------------------------------------------------------------------
const C8_RED = [['R28', '淡水', '🌊淡水老街'], ['R27', '紅樹林'], ['R26', '竹圍'], ['R25', '關渡'], ['R24', '忠義'], ['R23', '復興崗'], ['R22', '北投'], ['R21', '奇岩'], ['R20', '唭哩岸'],
  ['R19', '石牌'], ['R18', '明德'], ['R17', '芝山'], ['R16', '士林', '🏯故宮'], ['R15', '劍潭'], ['R14', '圓山', '🖼️北美館'], ['R13', '民權西路'], ['R12', '雙連'], ['R11', '中山'],
  ['R10', '台北車站', '🚉'], ['R09', '台大醫院'], ['R08', '中正紀念堂'], ['R07', '東門'], ['R06', '大安森林公園'], ['R05', '大安'], ['R04', '信義安和'], ['R03', '台北101/世貿', '🏙️101'], ['R02', '象山']];
const C8_MAP = (() => {
  const pos = C8_RED.map((_, i) => { const c = i / 9 | 0, k = i % 9; return [22 + c * 132, c === 1 ? 470 - k * 52 : 54 + k * 52]; });
  let s = `<rect width="420" height="510" rx="14" fill="#FFF8E8"/><text x="210" y="24" text-anchor="middle" font-size="15" font-weight="900" fill="#C8302A">淡水信義線（紅線）</text>`;
  s += `<polyline points="${pos.map(p => p.join(',')).join(' ')}" fill="none" stroke="#E3002C" stroke-width="7" stroke-linejoin="round"/>`;
  C8_RED.forEach(([code, name, lm], i) => { const [x, y] = pos[i]; s += `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="#E3002C" stroke-width="3"/><text x="${x + 12}" y="${y - 2}" font-size="12.5" font-weight="700" fill="#2A2230">${name}</text><text x="${x + 12}" y="${y + 13}" font-size="10.5" fill="#8A7A60">${code}${lm ? '　' + lm : ''}</text>`; });
  s += `<g transform="translate(372 470)"><rect x="-4" y="6" width="8" height="22" fill="#7A4A2A"/><circle cy="-6" r="20" fill="#2E8A4A"/><circle cx="-12" cy="4" r="12" fill="#3AA05A"/><circle cx="12" cy="4" r="12" fill="#3AA05A"/></g>`;
  return `<svg viewBox="0 0 420 510" style="width:100%;max-width:440px;display:block;margin:6px auto">${s}</svg>`;
})();
P({
  id: 'c8_map', ch: 8, t: '夢魘・最後的地圖', lv: 3, icon: '🗺️', pos: [86, 74],
  need: ['c8_temple', 'c8_balloon', 'c8_ring', 'c8_oyster', 'c8_boba'],
  item: 'map',
  body: () => `<p>吃完夜市，博育把袋子裡的五件道具倒在桌上，最後拿出一張地圖。地圖正面只有一句話：<b>「最後的遊戲，不在夜市。」</b>下面畫著一棵樹。地圖背面，是一條捷運路線和四行越南文（看線索卡）。</p>
    <div class="c8-items"><div><i>🟩</i>神秘玉牌<br><small>背面刻著「北」</small></div><div><i>🎫</i>紅色車票<br><small>北美館的畫框裡</small></div><div><i>🪙</i>古老銅幣<br><small>背面刻著「十分」</small></div><div><i>🃏</i>黑色撲克牌<br><small>101 電梯旁的盒子</small></div><div><i>🟡</i>金色籌碼<br><small>淡水老街的盒子</small></div></div>
    <div class="c8-note">📔 博育的筆記本（被珍奶滴到，有幾行看不清楚）<br>
      台北車站・寄物櫃：2254<br>故宮：<s>▇▇▇▇</s>　北美館：<s>▇▇▇▇</s>　九份：<s>▇▇▇▇</s><br>
      十分・天燈上的願望：101<br>台北 101・小盒子「1、0、1、？」：？＝8<br>淡水・四位數密碼鎖：4271<br>西門町・密碼牆：527</div>
    ${C8_MAP}
    ${C8DICT([['lên tàu', '上車'], ['xuống tàu', '下車'], ['ở', '在'], ['ga', '車站'], ['gần', '附近'], ['nơi', '地方'], ['tìm thấy', '找到'], ['thẻ chơi', '籌碼'], ['đồng xu', '銅幣'], ['màu vàng', '金色'], ['đi', '走／坐'], ['ngược với', '跟…相反'], ['hướng', '方向'], ['chữ khắc', '刻的字'], ['sau', '背面'], ['ngọc bài', '玉牌'], ['số ga', '站數'], ['phải đi', '要坐的'], ['số trên', '…上的數字'], ['nút', '按鈕'], ['cộng', '加'], ['tổng các chữ số', '各位數字的和'], ['mật mã', '密碼'], ['Tây Môn Đình', '西門町'], ['chỉ', '只'], ['cùng màu với', '跟…同顏色'], ['vé', '車票'], ['có cây', '有樹']])}
    <p><b>最後的遊戲在哪裡？</b></p>`,
  split: [
    '<span class="c8-vn" style="display:block;font-size:15px">① “Lên tàu ở ga gần nơi tìm thấy thẻ chơi màu vàng.”</span>',
    '<span class="c8-vn" style="display:block;font-size:15px">② “Đi ngược với hướng của chữ khắc sau ngọc bài.”</span>',
    '<span class="c8-vn" style="display:block;font-size:15px">③ “Số ga phải đi = số trên nút ‘?’ ở 101 cộng tổng các chữ số của mật mã ở Tây Môn Đình.”</span>',
    '<span class="c8-vn" style="display:block;font-size:15px">④ “Chỉ đi tàu cùng màu với vé. Xuống tàu ở ga có cây.”</span>',
  ],
  ans: ['大安森林公園', '大安公園', '大安', '大安森林公園站', 'R06', '大安森林'], solve: '大安森林公園', ph: '地點',
  hint: '四行越南文各管一件事：從哪一站上車、往哪個方向、坐幾站、坐哪一條線。道具和筆記本裡的數字都是線索，但不是每一個都用得到。',
  ok: [['by', '大安森林公園……原來最後一站在那裡。'], ['xy', '樹，森林，公園。'], ['jz', '我們走吧。'], ['zn', 'Đi thôi!', '走吧！', 'happy']],
});
