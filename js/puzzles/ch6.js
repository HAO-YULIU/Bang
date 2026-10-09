'use strict';
// ===== 第六章：淡水老街——最後的線索（11 題） =====
document.head.insertAdjacentHTML('beforeend', `<style>
.c6-dict { display: grid; grid-template-columns: repeat(auto-fill, minmax(124px, 1fr)); gap: 3px 8px; font-size: 13px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px; margin: 6px 0; }
.c6-dict span b { color: #C9332B; }
.c6-ledger { background: #F3E6C4; border: 2px solid #9A7A40; border-radius: 4px; padding: 10px 12px; font-family: var(--serif, serif); color: #3A2A10; box-shadow: inset 0 0 30px rgba(120,80,20,.25); }
.c6-ledger table { width: 100%; font-size: 17px !important; }
.c6-ledger td, .c6-ledger th { border-color: #B89A60 !important; }
.c6-sz { font-family: 'Noto Sans TC', 'Noto Sans CJK TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif; font-weight: 900; letter-spacing: .08em; color: #7A1A10; }
.c6-line { background: #fff; border-radius: 10px; padding: 8px; font-size: 14px; }
.c6-line .m { margin: 4px 0; } .c6-line .m b { color: #2BA670; font-size: 12px; display: block; }
.c6-line .m p { margin: 0; display: inline-block; background: #EDF7E8; border-radius: 4px 12px 12px 12px; padding: 4px 10px; }
.c6-torn { background: #F4EFE2; font-family: Georgia, serif; font-size: 14px; line-height: 2; padding: 8px 12px; color: #2A2A2A; border: 1px solid #CFC6B4; }
.c6-torn.l { clip-path: polygon(0 0, 100% 0, 94% 12%, 100% 25%, 93% 38%, 100% 52%, 94% 66%, 100% 80%, 93% 92%, 100% 100%, 0 100%); padding-right: 22px; }
.c6-torn.r { clip-path: polygon(6% 0, 100% 0, 100% 100%, 6% 100%, 0 90%, 7% 78%, 0 64%, 6% 50%, 0 36%, 7% 22%, 0 10%); padding-left: 22px; }
.c6-photos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.c6-photos figure { margin: 0; background: #fff; padding: 4px 4px 2px; border-radius: 4px; box-shadow: 1px 2px 4px rgba(0,0,0,.18); }
.c6-photos figcaption { font-size: 12px; font-weight: 700; color: #1E5AA8; text-align: center; line-height: 1.3; padding: 3px 0; }
.c6-cp { display: inline-flex; gap: 2px; }
.c6-cp span { display: inline-flex; flex-direction: column; align-items: center; font-size: 19px; font-family: var(--serif, serif); font-weight: 700; line-height: 1.1; }
.c6-cp small { font-size: 10px; font-family: sans-serif; color: #8A6A40; font-weight: 400; }
.c6-cp small.z { color: #C9332B; }
.c6-up { text-align: center; background: #C9332B; border-radius: 6px; padding: 8px 4px; }
.c6-up .c6-cp span { color: #FFE7A0; } .c6-up .c6-cp small { color: #FFD2C0; }
.c6-wrap .k-grid { --cell: 34px; }
.c6-menu { background: #2A1E14; color: #F4E2B8; border-radius: 10px; padding: 12px 16px; font-family: var(--serif, serif); border: 4px double #C8A060; }
.c6-menu h4 { text-align: center; margin: 0 0 6px; letter-spacing: .4em; color: #FFD978; }
.c6-menu div { display: flex; justify-content: space-between; border-bottom: 1px dashed #6A5A40; padding: 5px 2px; font-size: 18px; }
.c6-menu .c6-sz { color: #FFB46A; font-size: 22px; }
</style>`);

const C6DICT = (words) => `<div class="c6-dict">${words.map(([v, z]) => `<span><b>${v}</b> ${z}</span>`).join('')}</div>`;
const C6SZ = (s) => `<span class="c6-sz">${s}</span>`;

// ---------- 1. 魚丸店的老帳簿（蘇州碼子） ----------
P({
  id: 'c6_ledger', ch: 6, t: '魚丸店的老帳簿', lv: 2, icon: '🍥', pos: [14, 22],
  body: () => `<p>淡水最老的魚丸店，櫃台下壓著一本發黃的帳簿。老闆說：「以前做生意都用<b>蘇州碼子</b>記帳，我阿公那代的字，我也看不太懂了。」第一頁的對照表被撕掉一半：</p>
    <div class="paper" style="font-size:16px">對照表（殘）：${C6SZ('〡')}＝1　${C6SZ('〢')}＝2　${C6SZ('〣')}＝3　${C6SZ('〤')}＝4　${C6SZ('〥')}＝5　<span class="muted">（後面撕掉了）</span></div>
    <div class="c6-ledger"><div style="text-align:center;font-weight:900;margin-bottom:4px">魚丸帳</div>
      <div style="text-align:center">開張：昭和 ${C6SZ('〡〇')} 年 ${C6SZ('〦')} 月</div>
      <table><tr><th>碗數</th><th>單價（錢）</th><th>合計（錢）</th></tr>
      <tr><td>${C6SZ('〢〥')}</td><td>${C6SZ('〦')}</td><td>${C6SZ('〡〥〇')}</td></tr>
      <tr><td>${C6SZ('〡〧')}</td><td>${C6SZ('〣')}</td><td>${C6SZ('〥〡')}</td></tr>
      <tr><td>${C6SZ('〢〩')}</td><td>${C6SZ('〢')}</td><td>${C6SZ('〥〨')}</td></tr></table></div>
    <div class="paper" style="font-size:14px">・碗數 × 單價 ＝ 合計，帳都是對的。不同的符號代表不同的數字（0～9）。<br>・昭和是日本年號，台灣日治時期也用：<b>昭和元年＝西元 1926 年</b>。</div>
    <p><b>這家魚丸店是西元哪一年開張的？</b></p>`,
  ans: ['1935', '1935年', '昭和10年', '昭和十年'], solve: '1935', num: true, ph: '西元年',
  hint: '一行一行算：25 × ? 會等於「1、5、?」的三位數；17 × 3 是多少？把缺的符號補回對照表，再換算年號（元年是第 1 年）。',
  ok: [['xy', '昭和十年。比我阿嬤還老。'], ['jz', '魚丸是古董。'], ['zn', 'Cá viên cổ!', '古董魚丸！', 'happy']],
});

// ---------- 2. 阿給老店的家族群組（多人分卡） ----------
P({
  id: 'c6_agei', ch: 6, t: '阿給是哪一年誕生的', lv: 2, icon: '🍢', pos: [38, 18],
  body: () => `<p>阿給店的孫女聽說你們在查「阿給是哪一年發明的」，把家族 LINE 群組的對話截圖傳了過來。</p>
    <div class="paper" style="font-size:14px">📅 民國年 ＋ 1911 ＝ 西元年。（今年是 2026 年）</div>
    <p><b>阿給是西元哪一年出現的？</b></p>`,
  split: [
    `<div class="c6-line"><div class="m"><b>阿嬤（語音轉文字）</b><p>阿給是我想出來的啦，就是你爸爸上小學一年級那一年。店是更早就開了，民國五十年，一開始只有賣麵。</p></div></div>`,
    `<div class="c6-line"><div class="m"><b>爸爸</b><p>我是十月生的啦，屬狗。</p></div></div>`,
    `<div class="c6-line"><div class="m"><b>姑姑</b><p>我比你爸大三歲，我是民國四十四年生的。</p></div></div>`,
    `<div class="c6-line"><div class="m"><b>孫女</b><p>我查了，以前規定：九月一日開學的時候，<b>已經滿 6 歲</b>的小孩才能上小學一年級。</p></div></div>`,
  ],
  ans: ['1965', '1965年', '民國54年', '民國54'], solve: '1965', num: true, ph: '西元年',
  hint: '先算出爸爸是哪一年幾月生的，再看他哪一年的九月一日才「滿 6 歲」。店開的那一年是陷阱。',
  ok: [['zn', 'Món này là bà nghĩ ra?', '這道菜是阿嬤發明的？', 'shock'], ['xy', '阿嬤是神人。'], ['by', '這次的神人用得很正確。']],
});

// ---------- 3. 鐵蛋的干支 ----------
const C6_GAN = [...'甲乙丙丁戊己庚辛壬癸'], C6_ZHI = [...'子丑寅卯辰巳午未申酉戌亥'];
P({
  id: 'c6_egg', ch: 6, t: '阿婆鐵蛋的罐子', lv: 2, icon: '🥚', pos: [62, 22],
  body: () => `<p>渡船頭的鐵蛋老店，櫃台上放著一個舊陶罐，罐子上用毛筆寫著：<b>「庚戌年　阿婆始創」</b>。店員說：「阿婆是<b>庚辰年</b>出生的，她開始滷鐵蛋的時候，已經結婚、有兩個小孩了。阿婆現在還在店裡幫忙喔！」</p>
    <svg viewBox="0 0 300 300" style="width:100%;max-width:300px;display:block;margin:0 auto"><circle cx="150" cy="150" r="140" fill="#F4E6C8" stroke="#8A6A30" stroke-width="3"/><circle cx="150" cy="150" r="96" fill="#FFF6E2" stroke="#8A6A30" stroke-width="2"/><circle cx="150" cy="150" r="54" fill="#C9332B"/>
      ${C6_ZHI.map((z, i) => { const a = (i * 30 - 90) * Math.PI / 180; return `<text x="${150 + Math.cos(a) * 118}" y="${150 + Math.sin(a) * 118 + 8}" text-anchor="middle" font-size="22" font-weight="900" fill="#3A2A10" font-family="serif">${z}</text>`; }).join('')}
      ${C6_GAN.map((g, i) => { const a = (i * 36 - 90) * Math.PI / 180; return `<text x="${150 + Math.cos(a) * 75}" y="${150 + Math.sin(a) * 75 + 7}" text-anchor="middle" font-size="19" font-weight="700" fill="#7A3A10" font-family="serif">${g}</text>`; }).join('')}
      <text x="150" y="146" text-anchor="middle" font-size="15" font-weight="900" fill="#FFE7A0">天干 10</text><text x="150" y="168" text-anchor="middle" font-size="15" font-weight="900" fill="#FFE7A0">地支 12</text></svg>
    <div class="paper" style="font-size:14px">・干支紀年：天干照「甲乙丙丁戊己庚辛壬癸」、地支照「子丑寅卯辰巳午未申酉戌亥」，每過一年<b>兩個都往下走一格</b>，走到底就回到第一個。<br>・<b>今年 2026 年是「丙午」年</b>。</div>
    <p><b>阿婆是西元哪一年開始賣鐵蛋的？</b></p>`,
  ans: ['1970', '1970年'], solve: '1970', num: true, ph: '西元年',
  hint: '干支每 60 年才會重複一次。先從丙午往回推，找出所有「庚辰」和「庚戌」年，再用阿婆的故事挑出合理的那一個。',
  ok: [['jz', '鐵蛋比我爸還老。'], ['xy', '鐵蛋比你還硬。'], ['zn', 'Trứng sắt cứng quá!', '鐵蛋好硬！', 'shock']],
});

// ---------- 4. 撕成兩半的越南報紙（多人分卡） ----------
P({
  id: 'c6_news', ch: 6, t: '撕成兩半的越南報紙', lv: 2, icon: '📰', pos: [86, 20],
  body: () => `<p>魚酥店的牆上貼著一篇越南旅遊報紙的報導，可惜被撕成左右兩半，兩半剛好分別被兩個人撿到。</p>
    ${C6DICT([['Đạm Thủy', '淡水'], ['có nhiều món ngon', '有很多好吃的'], ['cá viên', '魚丸'], ['có từ thời ông bà', '從阿公阿嬤那時就有'], ['cửa hàng của bà Lâm', '林婆婆的店'], ['mở cửa', '開張'], ['vào năm', '在…年'], ['sau', '之後'], ['làm ra', '做出'], ['món', '道（菜）'], ['bánh cá giòn', '魚酥'], ['đầu tiên', '第一'], ['được sửa lại', '被翻修'], ['năm', '5／年'], ['nghìn', '千'], ['trăm', '百'], ['linh', '零（中間的零）'], ['mươi', '十（二十以上）'], ['tư', '十位後面的 4'], ['hai / sáu / chín', '2 / 6 / 9']])}
    <p><b>淡水的魚酥是西元哪一年出現的？</b></p>`,
  split: [
    `<div class="c6-torn l">Đạm Thủy có nhiều món ngon. Cá viên<br>Cửa hàng của bà Lâm mở cửa vào năm<br>Hai mươi năm sau, bà làm ra món<br>Năm hai nghìn linh hai, cửa hàng</div>`,
    `<div class="c6-torn r">có từ thời ông bà.<br>một nghìn chín trăm sáu mươi tư.<br>bánh cá giòn đầu tiên.<br>được sửa lại.</div>`,
  ],
  ans: ['1984', '1984年'], solve: '1984', num: true, ph: '西元年',
  hint: '左半和右半要一行一行接起來讀。「năm」有兩個意思，看它出現在哪裡。',
  ok: [['zn', 'Báo Việt Nam cũng biết Đạm Thủy!', '越南報紙也知道淡水！', 'happy'], ['xy', '魚酥紅到越南。'], ['jz', '那我也要紅到越南。']],
});

// ---------- 5. 河岸夕陽（越南語時間＋照片） ----------
const C6_SUN = (h, cap) => `<figure><svg viewBox="0 0 160 130" style="width:100%;display:block"><defs><linearGradient id="c6sky${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7A55A"/><stop offset="1" stop-color="#FCD9A0"/></linearGradient></defs><rect width="160" height="130" fill="url(#c6sky${h})"/>
  ${[...Array(15)].map((_, k) => `<line x1="0" x2="160" y1="${110 - 7 * k}" y2="${110 - 7 * k}" stroke="#fff" stroke-opacity="${k % 5 ? .25 : .7}" stroke-width="${k % 5 ? .6 : 1}"/>${k % 5 ? '' : `<text x="3" y="${108 - 7 * k}" font-size="8" fill="#fff">${k}</text>`}`).join('')}
  <circle cx="98" cy="${110 - 7 * h - 9}" r="9" fill="#FFF3B0" stroke="#FF8A3A" stroke-width="1.5"/>
  <path d="M0 130 L0 118 L40 112 L70 104 L98 110 L130 115 L160 120 L160 130 Z" fill="#3E4A5A"/><path d="M0 130 L0 124 L160 126 L160 130Z" fill="#6A8AA8"/></svg><figcaption>${cap}</figcaption></figure>`;
P({
  id: 'c6_sunset', ch: 6, t: '觀音山的夕陽', lv: 2, icon: '🌅', pos: [20, 46],
  body: () => `<p>甄妮在河岸拍了四張夕陽，照片右邊的山是觀音山（山頂那一點剛好在照片正中間的下面）。每張照片背後，她都用越南語寫了拍照的時間。照片上的白線是她用 App 加的格線，<b>每一格一樣高</b>。</p>
    <div class="c6-photos">${C6_SUN(4, 'sáu giờ kém mười lăm')}${C6_SUN(12, 'năm giờ hai mươi mốt phút chiều')}${C6_SUN(2, 'sáu giờ kém chín phút')}${C6_SUN(9, 'năm giờ rưỡi chiều')}</div>
    ${C6DICT([['giờ', '點'], ['phút', '分'], ['chiều', '下午'], ['rưỡi', '半'], ['kém', '差（還差幾分到…）'], ['năm / sáu / chín', '5 / 6 / 9'], ['mười lăm', '15'], ['hai mươi mốt', '21']])}
    <p class="note">太陽往下落的速度是固定的。</p>
    <p><b>太陽的「下緣」剛好碰到觀音山山頂的那一刻，是幾點幾分？</b>（24 小時制，例如 1830）</p>`,
  ans: ['1757', '17:57', '5:57', '557', '下午5:57'], solve: '1757', num: true, ph: '例如 1830',
  hint: '先把四個越南語時間翻成真正的時間（kém 是「差」），再量每張照片裡太陽下緣離山頂幾格，看看每幾分鐘掉一格。',
  ok: [['zn', 'Hoàng hôn đẹp quá…', '夕陽好美……'], ['xy', '我們在看夕陽。'], ['jz', '我們在算夕陽。'], ['by', '你們終於有一點文藝氣息了。']],
});

// ---------- 6. 紅毛城的磚牆（二進位＋檢查碼） ----------
const C6_BRICK = ['001001', '011110', '011011', '010010', '011101', '001111', '011110', '010010'];
const C6_IVY = new Set(['0,2', '1,4', '1,1', '2,3', '3,5', '4,1', '4,2', '5,4', '6,0', '6,3', '7,1']);
P({
  id: 'c6_fort', ch: 6, t: '紅毛城的磚牆暗號', lv: 2, icon: '🏰', pos: [50, 48],
  body: () => {
    let g = '', W = 46, H = 26, ox = 40, oy = 34;
    ['16', '8', '4', '2', '1', '✓'].forEach((t, j) => { g += `<text x="${ox + j * W + W / 2}" y="24" text-anchor="middle" font-size="14" font-weight="900" fill="#5A3A20">${t}</text>`; });
    C6_BRICK.forEach((row, i) => {
      if (i === 7) g += `<text x="${ox - 8}" y="${oy + i * H + 18}" text-anchor="end" font-size="14" font-weight="900" fill="#5A3A20">✓</text>`;
      [...row].forEach((b, j) => {
        const x = ox + j * W + (i % 2 ? 4 : 0), y = oy + i * H, ivy = C6_IVY.has(`${i},${j}`);
        g += `<rect x="${x + 1}" y="${y + 1}" width="${W - 6}" height="${H - 4}" rx="3" fill="${b === '1' ? '#B8402E' : '#A8A39A'}" stroke="#6A5A4A"/>`;
        if (ivy) g += `<g><ellipse cx="${x + W / 2 - 3}" cy="${y + H / 2}" rx="${W / 2 + 1}" ry="${H / 2 + 2}" fill="#3E7A3A"/><path d="M${x + 4} ${y + 6} q8 6 16 0 q8 -6 16 2 M${x + 6} ${y + 18} q10 -6 18 0 q8 6 14 -2" stroke="#7AC06A" stroke-width="2" fill="none"/></g>`;
      });
    });
    g += `<line x1="${ox - 4}" y1="${oy + 7 * H - 2}" x2="${ox + 6 * W + 6}" y2="${oy + 7 * H - 2}" stroke="#5A3A20" stroke-width="2" stroke-dasharray="5 4"/><line x1="${ox + 5 * W - 3}" y1="${oy - 4}" x2="${ox + 5 * W - 3}" y2="${oy + 8 * H + 2}" stroke="#5A3A20" stroke-width="2" stroke-dasharray="5 4"/>`;
    return `<p>紅毛城的一面牆上，紅磚和灰磚排得很奇怪，有些磚被藤蔓蓋住了。旁邊有一塊小木牌：</p>
    <div class="paper" style="font-size:14px">守衛的暗號：<b>紅磚＝1、灰磚＝0</b>。每一排的前五塊磚是一個數字（上面刻著每一塊代表多少），<b>1＝A、2＝B……26＝Z</b>。<br>右邊那一直排（✓）和最下面那一橫排（✓）是<b>檢查磚</b>：放好以後，<b>每一橫排、每一直排的紅磚數量，都是偶數</b>。</div>
    <svg viewBox="0 0 340 250" style="width:100%;max-width:380px;display:block;margin:0 auto"><rect width="340" height="250" rx="10" fill="#E8DCC4"/>${g}</svg>
    <p><b>牆上藏的暗號是哪一個英文字？</b></p>`;
  },
  ans: ['DOMINGO', 'SANTODOMINGO', '聖多明哥', '聖多明哥城'], solve: 'DOMINGO', ph: '英文字',
  hint: '藤蔓下面的磚是什麼顏色，可以用「偶數」推回來：一排只蓋住一塊的先做；一排蓋住兩塊的，就從直的那一排下手。',
  ok: [['by', '紅毛城以前叫「聖多明哥城」！'], ['xy', '你怎麼知道？'], ['by', '我是導遊。'], ['jz', '你沒有導遊證。']],
});

// ---------- 7. 渡船頭（夢魘：海戰棋） ----------
const C6_SHIP = '1000000101110100000001111000000001111100000000100';
P({
  id: 'c6_boats', ch: 6, t: '夢魘・渡船頭的船隻', lv: 3, icon: '⛴️', pos: [80, 46],
  body: () => `<p>從老街的二樓往下看，渡船頭停滿了船，可是起霧了，什麼都看不清楚。碼頭管理員只給了一張紙：</p>
    <div class="paper" style="font-size:14px">⛴️ 藍色公路渡輪（4 格）× 1　🚤 漁船（3 格）× 2　🛶 舢舨（2 格）× 2　🛟 獨木舟（1 格）× 2<br>・每艘船都是直的或橫的一整條。<br>・船和船<b>不會碰在一起</b>，連斜角也不會。<br>・格子旁邊的數字，是那一列（或那一行）有幾格是船。</div>
    <p><b>把有船的格子全部點出來。</b></p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    const N = 7, S = C6_SHIP, rc = [], cc = [];
    for (let i = 0; i < N; i++) rc.push([...S.slice(i * N, i * N + N)].filter(x => x === '1').length);
    for (let j = 0; j < N; j++) cc.push([...Array(N)].filter((_, i) => S[i * N + j] === '1').length);
    const wrap = document.createElement('div'); wrap.className = 'c6-wrap'; wrap.style.textAlign = 'center'; el.append(wrap);
    K.grid(wrap, ctx, { r: N, c: N, rowClue: rc, colClue: cc, start: done ? S : undefined, noSubmit: done });
  },
  ui: 'none', ans: [C6_SHIP], solve: C6_SHIP, show: '七艘船全部找到了',
  hint: '先把 0 的那一列、那一行全部當成海。5 格的那一列一定塞了渡輪或漁船；再用「不能碰到」去刪旁邊的格子。',
  ok: [['jz', '我看到我們要搭的那艘了。'], ['xy', '你看到的是獨木舟。'], ['by', '霧散了，船真的是這樣停的……'], ['xy', '神人。']],
});

// ---------- 8. 福佑宮的對聯 ----------
const C6_TONE = { 紅: 0, 毛: 0, 城: 0, 外: 1, 千: 0, 帆: 0, 過: 1, 淡: 1, 水: 1, 河: 0, 邊: 0, 萬: 1, 鳥: 1, 飛: 0, 觀: 0, 音: 0, 山: 0, 前: 0, 歸: 0, 大: 1, 屯: 0, 上: 1, 雙: 0, 鷹: 0, 落: 1, 下: 1, 巢: 0, 藍: 0, 口: 1, 燈: 0 };
const C6_CP = (s) => `<span class="c6-cp">${[...s].map(c => `<span><small class="${C6_TONE[c] ? 'z' : ''}">${C6_TONE[c] ? '仄' : '平'}</small>${c}</span>`).join('')}</span>`;
const C6_OPTS = [['B', '觀音山前萬鳥歸'], ['E', '淡水河邊萬鳥巢'], ['C', '大屯山上雙鷹落'], ['A', '淡水河邊萬鳥飛'], ['G', '淡水河口萬燈紅'], ['D', '觀音山下千鳥飛'], ['F', '淡水河邊藍鳥飛']];
P({
  id: 'c6_couplet', ch: 6, t: '福佑宮的對聯', lv: 1, icon: '🏮', pos: [14, 72],
  body: () => `<p>老街上的福佑宮在辦對聯比賽，上聯已經貼好了，下聯要從七份投稿裡選一份。每個字上面都標了平仄。</p>
    <div class="c6-up">${C6_CP('紅毛城外千帆過')}</div>
    <div class="paper" style="font-size:14px">廟公的規則：<br>① 上下聯字數一樣。<br>② 上聯最後一字是仄，<b>下聯最後一字要是平</b>。<br>③ 第 2、4、6 個字，<b>上下聯的平仄要相反</b>。<br>④ 同一個位置要「詞性相對」：地名對地名、方位對方位、數字對數字、名詞對名詞、動詞對動詞。（上聯是：紅毛城｜外｜千｜帆｜過）<br>⑤ 下聯<b>不能用上聯用過的字</b>。</div>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    el.insertAdjacentHTML('beforeend', '<p><b>哪一份才是合格的下聯？</b></p>');
    if (!done) K.choice(el, ctx, C6_OPTS.map(([v, s]) => ({ t: C6_CP(s), v })), { cols: 1 });
  },
  ui: 'none', ans: ['A'], solve: 'A', show: '淡水河邊萬鳥飛',
  hint: '五條規則一條一條刪，每一份都只犯了一點點錯。特別看第 2、4、6 和最後一個字。',
  ok: [['by', '紅毛城外千帆過，淡水河邊萬鳥飛。'], ['xy', '俊治城外千杯過。'], ['jz', '那是我的夢想。']],
});

// ---------- 9. 潮汐鐘（多人分卡） ----------
const C6_TIDE = (() => {
  let g = `<circle cx="80" cy="80" r="72" fill="#EAF4FA" stroke="#1E4A6A" stroke-width="5"/>`;
  for (let k = 0; k < 12; k++) { const a = k * 30 * Math.PI / 180; g += `<line x1="${80 + Math.sin(a) * 58}" y1="${80 - Math.cos(a) * 58}" x2="${80 + Math.sin(a) * 66}" y2="${80 - Math.cos(a) * 66}" stroke="#1E4A6A" stroke-width="${k % 3 ? 2 : 4}"/>`; }
  g += `<text x="80" y="36" text-anchor="middle" font-size="12" font-weight="900" fill="#1E4A6A">滿潮</text><text x="80" y="134" text-anchor="middle" font-size="12" font-weight="900" fill="#1E4A6A">乾潮</text>`;
  const a = 60 * Math.PI / 180; g += `<line x1="80" y1="80" x2="${80 + Math.sin(a) * 50}" y2="${80 - Math.cos(a) * 50}" stroke="#C9332B" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="80" r="6" fill="#C9332B"/>`;
  return `<svg viewBox="0 0 160 160" style="width:150px;display:block;margin:4px auto">${g}</svg>`;
})();
const C6_CLOCK = (() => {
  let g = `<circle cx="80" cy="80" r="72" fill="#fff" stroke="#3A2A20" stroke-width="5"/>`;
  for (let k = 1; k <= 12; k++) { const a = k * 30 * Math.PI / 180; g += `<text x="${80 + Math.sin(a) * 56}" y="${80 - Math.cos(a) * 56 + 6}" text-anchor="middle" font-size="16" font-weight="700" fill="#3A2A20">${k}</text>`; }
  const hA = (4 + 52 / 60) * 30 * Math.PI / 180, mA = 52 * 6 * Math.PI / 180;
  g += `<line x1="80" y1="80" x2="${80 + Math.sin(hA) * 34}" y2="${80 - Math.cos(hA) * 34}" stroke="#3A2A20" stroke-width="6" stroke-linecap="round"/><line x1="80" y1="80" x2="${80 + Math.sin(mA) * 54}" y2="${80 - Math.cos(mA) * 54}" stroke="#3A2A20" stroke-width="3.5" stroke-linecap="round"/><circle cx="80" cy="80" r="5" fill="#C9332B"/>`;
  return `<svg viewBox="0 0 160 160" style="width:150px;display:block;margin:4px auto">${g}</svg>`;
})();
P({
  id: 'c6_tide', ch: 6, t: '渡船頭的潮汐鐘', lv: 2, icon: '🌊', pos: [38, 76],
  body: () => `<p>渡船頭的售票亭貼著公告：「<b>滿潮前後 30 分鐘</b>，低碼頭會淹水，往八里的渡船<b>暫停開船</b>。」可是公告上的時間被撕掉了。售票亭牆上掛著一個潮汐鐘和一個普通時鐘，四個人各拍了一點。</p>
    <p><b>今天渡船「暫停開船」是從幾點幾分開始？</b>（24 小時制，例如 1830）</p>`,
  split: [
    `🌊 小羽拍的潮汐鐘：${C6_TIDE}`,
    `🕰️ 俊治同一秒拍的普通時鐘（下午）：${C6_CLOCK}`,
    '📋 甄妮抄下的說明牌：「潮汐鐘的指針走一整圈，是 <b>12 小時 24 分</b>——從一次滿潮走到下一次滿潮。」',
    '📋 博育發現說明牌背面還有一行小字：「注意：本鐘的指針是<b>逆時針</b>轉的。」',
  ],
  ans: ['1826', '18:26', '6:26', '626'], solve: '1826', num: true, ph: '例如 1830',
  hint: '量潮汐鐘的指針離「滿潮」還差幾度——要照它真正轉的方向量。一整圈 360 度＝12 小時 24 分。',
  ok: [['by', '所以我們要在六點二十六分之前上船！'], ['xy', '來得及，我們先去吃東西。'], ['by', '……']],
});

// ---------- 10. 旅行日誌：誰說的？ ----------
const C6_Q = ['我們負責提供氣氛。', '現在還有你。', '謝謝？', 'Nhanh vậy sao?', '那可以炒嗎？', '你可以正常介紹嗎？', '我不會越南文。', '講重點。'];
P({
  id: 'c6_quote', ch: 6, t: '河岸長椅上的刻字', lv: 1, icon: '📓', pos: [62, 72],
  body: () => `<p>河岸的一張長椅上，被人用小刀刻了八句話。甄妮驚訝地說：「這些……都是我們這兩天說過的話！」</p>
    <div class="paper">${C6_Q.map((q, i) => `${'①②③④⑤⑥⑦⑧'[i]}「${q}」`).join('<br>')}</div>
    <p class="note">📓 不確定是誰說的？翻翻旅行日誌。（要一字不差。）</p>`,
  build(el, ctx, done) {
    el.innerHTML = this.body(ctx);
    el.insertAdjacentHTML('beforeend', '<p><b>依照 ① 到 ⑧ 的順序，點出每一句是誰說的。</b></p>');
    if (!done) K.seq(el, ctx, [['甄妮', 'zn'], ['小羽', 'xy'], ['俊治', 'jz'], ['博育', 'by']].map(([t, v]) => ({ t: `<span style="color:${CH[v].c}">${t}</span>`, v })), { len: 8, repeat: true });
  },
  ui: 'none', ans: ['jz-xy-by-zn-xy-by-jz-xy'], solve: 'jz-xy-by-zn-xy-by-jz-xy', show: '俊治、小羽、博育、甄妮、小羽、博育、俊治、小羽',
  hint: '每一句都在日誌裡出現過剛好一次，從序章翻到這一章。有幾句聽起來很像某個人，但其實不是他說的。',
  ok: [['xy', '刻這個的人是我們的粉絲。'], ['jz', '我們有粉絲了。'], ['by', '你們不要再刻了。']],
});

// ---------- 11. 劇情指定：古老的菜單 ----------
P({
  id: 'c6_menu', ch: 6, t: '古老的菜單', lv: 2, icon: '📜', pos: [86, 74],
  need: ['c6_ledger', 'c6_agei', 'c6_egg', 'c6_news'],
  body: () => `<p>老街盡頭的小店，牆上掛著一張古老的菜單，旁邊是一個上了四位數密碼鎖的盒子。老闆娘說：</p>
    <div class="paper">「淡水的四樣老味道——<b>魚丸、阿給、鐵蛋、魚酥</b>——你們剛剛都查過它們的身世了吧？<br>從<b>在淡水最早出現</b>的排到<b>最晚出現</b>的，把菜單上它們旁邊的數字照順序念出來，就是密碼。」</div>
    <div class="c6-menu"><h4>淡水小吃</h4>${[['魚酥', '〡'], ['蝦捲', '〨'], ['阿給', '〢'], ['酸梅湯', '〥'], ['鐵蛋', '〧'], ['魚丸湯', '〤'], ['魚丸', '〤'], ['孔雀蛤', '〩']].filter(x => x[0] !== '魚丸湯').map(([n, d]) => `<div><span>${n}</span>${C6SZ(d)}</div>`).join('')}</div>
    <p class="note">菜單上的數字，跟魚丸店老帳簿用的是同一種寫法。</p>`,
  ans: ['4271', '4-2-7-1'], solve: '4271', num: true, ph: '四位數',
  hint: '把魚丸、阿給、鐵蛋、魚酥那四題的答案（年份）排一排；菜單上的數字是蘇州碼子，帳簿那一題你們已經補齊了對照表。',
  item: 'chip',
  ok: [['by', '盒子打開了……是一枚金色籌碼。'], ['jz', '金色籌碼。'], ['xy', '我開始覺得這些道具是一副什麼東西的零件。']],
});
