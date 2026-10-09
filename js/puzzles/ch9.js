'use strict';
// ===== 第九章：大安森林公園——越南公主的最終試煉（12 題） =====
// 象棋殘局三題在 ch9xq 區塊（需要 window.XQ），其他題目只用 kit。
document.head.insertAdjacentHTML('beforeend', `<style>
.c9-hand { display: block; margin: 8px 0; }
.c9-hand .k-tiles { display: flex; flex-wrap: wrap; gap: 2px; margin: 2px 0 6px; }
.c9-hand .c9-meld { display: inline-flex; }
.c9-hand .lab { display: block; font-size: 12px; color: var(--muted); }
.c9-meld { padding: 4px; border-radius: 8px; background: #E6F3EE; }
.c9-rules { font-size: 13px; columns: 2; column-gap: 16px; background: #FFF9EC; border: 1.5px dashed #D8C49A; border-radius: 10px; padding: 8px 12px; }
.c9-rules div { break-inside: avoid; }
.c9-pile { display: grid; grid-template-columns: 64px 1fr; gap: 6px; align-items: center; margin: 6px 0; }
.c9-pile b { font-size: 14px; }
.c9-say { background: #fff; border-radius: 12px; padding: 8px 10px; margin: 6px 0; border-left: 5px solid var(--c); }
.c9-say b { color: var(--c); }
@media (max-width: 760px) { .c9-rules { columns: 1; } }
</style>`);

P({
  id: 'c9_mj1', ch: 9, t: '麻將・聽什麼？', lv: 2, icon: '🀄', pos: [16, 34],
  body: () => `<p>桌上的麻將牌擺成一副十六張的手牌。博育說：「麻將最基本的，就是要知道自己在聽什麼。」</p>
    <div class="c9-hand"><span class="lab">手牌（16 張）</span>${K.tiles(['2m', '2m', '2m', '3m', '4m', '5m', '6m', '3p', '4p', '5p', '6s', '7s', '8s', 'E', 'E', 'E'])}</div>
    <div class="paper" style="font-size:14px">胡牌 = 五組（順子或刻子）＋一對眼，共 17 張。<br>順子：同花色連續三張（例如 3萬4萬5萬）；刻子：三張一樣。</div>
    <p><b>把這副牌「摸到就能胡」的牌全部選出來。</b>（少選、多選都不算）</p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.tilePick(el, ctx, { multi: true, pool: [...'123456789'].map(n => n + 'm') }); },
  ui: 'none', ans: ['1m,3m,4m,6m,7m'], solve: '1m,3m,4m,6m,7m', show: '一萬、三萬、四萬、六萬、七萬',
  hint: '先把一定成組的筒、條、東拿開，剩下的七張萬子用不同方式切切看：哪三張當刻子、哪兩張當眼。',
  ok: [['by', '五面聽！'], ['jz', '這種牌我都會打錯。'], ['xy', '你是每種牌都會打錯。']],
});

P({
  id: 'c9_mj2', ch: 9, t: '夢魘・九條路', lv: 3, icon: '🀇', pos: [30, 58],
  need: ['c9_mj1'],
  body: () => `<p>麻將桌的抽屜裡，夾著一張泛黃的紙條，上面畫著一副牌，旁邊寫著：<b>「這副牌，全世界的萬子都在等它。」</b></p>
    <div class="c9-hand"><span class="lab">手牌（16 張）</span>${K.tiles(['1m', '1m', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '9m', '9m', '3p', '4p', '5p'])}</div>
    <p><b>這副牌摸到哪些牌可以胡？全部選出來。</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.tilePick(el, ctx, { multi: true }); },
  ui: 'none', ans: ['1m,2m,3m,4m,5m,6m,7m,8m,9m'], solve: '1m,2m,3m,4m,5m,6m,7m,8m,9m', show: '一萬到九萬，全部九張',
  hint: '每一張萬子都試試看：加進去之後，能不能找到一組眼、剩下全部成組？不要只試你覺得「看起來會胡」的。',
  ok: [['by', '九蓮寶燈……'], ['xy', '神人。'], ['jz', '我這輩子都摸不到這副牌。']],
});

P({
  id: 'c9_mj3', ch: 9, t: '幾台？', lv: 2, icon: '🧮', pos: [18, 78],
  body: () => `<p>博育示範一把自摸，問大家：「小羽這把是幾台？」</p>
    <div class="paper" style="font-size:14px">東風圈。莊家是俊治（坐東）。小羽坐<b>南</b>，花牌：<b>夏、菊</b>（南家的本位花是 夏、蘭）。<br>小羽<b>自摸</b> 8筒。</div>
    <div class="c9-hand"><span class="lab">碰出來的牌</span><span class="c9-meld">${K.tiles(['S', 'S', 'S'])}</span><span class="lab">手牌（含自摸那張）</span>${K.tiles(['1p', '1p', '1p', '3p', '3p', '3p', '5p', '5p', '5p', '7p', '7p', '7p', '8p'])}${K.tiles(['8p'], 'c9-draw')}</div>
    <div class="c9-rules">${[['自摸', 1], ['門清（沒有吃、碰、明槓）', 1], ['門清自摸，再加', 1], ['獨聽（只聽一張）', 1], ['平胡', 2], ['碰碰胡（全部刻子）', 4], ['混一色（一種數字＋字牌）', 4], ['清一色', 8], ['三暗刻', 2], ['四暗刻', 5], ['五暗刻', 8], ['圈風刻', 1], ['門風刻', 1], ['本位花（每張）', 1], ['春夏秋冬一套', 2]].map(([a, b]) => `<div>${a}：<b>${b}</b> 台</div>`).join('')}</div>
    <p class="note">莊家、連莊的台數不用算。暗刻＝沒有碰出來、自己摸成的刻子。</p>`,
  ans: ['16', '16台'], solve: '16', num: true, ph: '台數',
  hint: '一條一條規則對照，特別注意：它真的只聽一張嗎？哪些刻子是自己摸的？',
  ok: [['xy', '十六台，我就說我是神人。'], ['jz', '你只是示範。']],
});

P({
  id: 'c9_big2', ch: 9, t: '大老二・誰最大', lv: 2, icon: '♠', pos: [42, 30],
  body: () => `<p>撲克牌盒裡有七組五張牌。盒蓋上寫著：「把它們從<b>最大排到最小</b>，盒子就會打開。」</p>
    <div class="paper" style="font-size:14px">【夜語大老二・五張牌規則】<br>同花順 &gt; 鐵支（四張一樣＋一張）&gt; 葫蘆（三張＋一對）&gt; 同花 &gt; 順子<br>順子之中：<b>2-3-4-5-6 最大</b>、<b>A-2-3-4-5 第二</b>，其他順子比最大的那一張（10-J-Q-K-A 的最大張是 A）。</div>
    ${[['甲', ['3C', '4D', '5H', '6S', '7S']], ['乙', ['2D', '3S', '4S', '5C', '6H']], ['丙', ['AC', '2H', '3D', '4S', '5D']], ['丁', ['9H', '9S', '9D', 'KC', 'KS']], ['戊', ['8C', '8D', '8H', '8S', '3H']], ['己', ['10H', 'JH', 'QH', 'KH', 'AH']], ['庚', ['4S', '7S', '9S', 'JS', 'KS']]].map(([k, c]) => `<div class="c9-pile"><b>${k}</b>${K.cards(c)}</div>`).join('')}`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.seq(el, ctx, ['甲', '乙', '丙', '丁', '戊', '己', '庚'].map(t => ({ t, v: t })), { len: 7 }); },
  ui: 'none', ans: ['己-戊-丁-庚-乙-丙-甲'], solve: '己-戊-丁-庚-乙-丙-甲', show: '己 > 戊 > 丁 > 庚 > 乙 > 丙 > 甲',
  hint: '先分種類：哪幾組是順子？順子之間的順序，請照盒蓋上的特別規則。',
  ok: [['jz', '2-3-4-5-6 最大？誰訂的？'], ['by', '台灣規則。'], ['jz', '完全法克。']],
});

P({
  id: 'c9_red', ch: 9, t: '撿紅點・算分', lv: 1, icon: '🔴', pos: [58, 48],
  body: () => `<p>三個人剛打完一局撿紅點，每個人吃到的牌（兩張一組）攤在桌上：</p>
    ${[['甄妮', [['AH', '9H'], ['5D', '5C'], ['3H', '7D'], ['QH', 'QC']]], ['小羽', [['AS', '9S'], ['10D', '10C'], ['2D', '8H'], ['JC', 'JD']]], ['俊治', [['AD', '9C'], ['4H', '6H'], ['KS', 'KH'], ['7D', '3C']]]].map(([n, ps]) => `<div class="c9-pile"><b>${n}</b><span>${ps.map(p => K.cards(p)).join(' ')}</span></div>`).join('')}
    <div class="paper" style="font-size:14px">計分：<b>紅色</b>（♥♦）的 A＝20 分、2～9＝牌面數字、10/J/Q/K＝10 分；<b>♠A＝30 分</b>；其他黑色的牌都是 0 分。</div>
    <p><b>依照 甄妮、小羽、俊治 的順序，輸入三個人的分數。</b>（例如 10-20-30）</p>`,
  ans: ['54-60-47', '546047', '54 60 47'], solve: '54-60-47', ph: '甄妮-小羽-俊治',
  hint: '一張一張看顏色，黑色的牌只有一張例外有分數。',
  ok: [['xy', '我第一。神人。'], ['zn', 'Không công bằng!', '不公平！']],
});

P({
  id: 'c9_maid', ch: 9, t: '抽鬼牌・誰在說謊', lv: 1, icon: '🃏', pos: [70, 26],
  body: () => `<p>四個人各抽了一張牌藏在背後，其中一張是鬼牌。規則：<b>拿到鬼牌的人一定說謊，其他人一定說真話。</b></p>
    <div class="c9-say" style="--c:${CH.zn.c}"><b>甄妮</b>：「Bạn Tiểu Vũ không có lá bài ma.」</div>
    <div class="c9-say" style="--c:${CH.xy.c}"><b>小羽</b>：「鬼牌在俊治或博育手上。」</div>
    <div class="c9-say" style="--c:${CH.jz.c}"><b>俊治</b>：「甄妮說的是真話。」</div>
    <div class="c9-say" style="--c:${CH.by.c}"><b>博育</b>：「我沒有鬼牌。」</div>
    <div class="paper" style="font-size:13px">甄妮的小抄：<b>bạn</b> 朋友（放在名字前面）・<b>Tiểu Vũ</b> 小羽・<b>không có</b> 沒有・<b>lá bài</b> 一張牌・<b>ma</b> 鬼</div>
    <p><b>鬼牌在誰手上？</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.choice(el, ctx, [['甄妮', 'zn'], ['小羽', 'xy'], ['俊治', 'jz'], ['博育', 'by'], ['沒有人', 'none']].map(([t, v]) => ({ t, v })), { cols: 3 }); },
  ui: 'none', ans: ['by'], solve: 'by', show: '博育',
  hint: '假設鬼牌在某一個人手上，看看四句話會不會互相矛盾。四個人都試一次。',
  ok: [['by', '……被發現了。'], ['xy', '學弟會說謊了。'], ['jz', '他真的被我們同化了。']],
});

// 彈珠反彈：12×7 的格子，從底邊距左 7 格以 45° 往右上彈出
const C9_MARBLE = (() => {
  const W = 12, H = 7, S = 34, ox = 40, oy = 40;
  const holes = [[0, 0, '甲'], [12, 0, '乙'], [0, 7, '丙'], [12, 7, '丁'], [6, 0, '戊'], [6, 7, '己'], [12, 3, '庚'], [0, 4, '辛']];
  // 座標：y=0 在下面
  const X = (x) => ox + x * S, Y = (y) => oy + (H - y) * S;
  let g = `<rect x="${ox - 10}" y="${oy - 10}" width="${W * S + 20}" height="${H * S + 20}" rx="14" fill="#7A5A3A"/><rect x="${ox}" y="${oy}" width="${W * S}" height="${H * S}" fill="#3E7A52"/>`;
  for (let i = 0; i <= W; i++) g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(H)}" stroke="#fff" stroke-opacity=".18"/>`;
  for (let j = 0; j <= H; j++) g += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(W)}" y2="${Y(j)}" stroke="#fff" stroke-opacity=".18"/>`;
  holes.forEach(([x, y, l]) => { g += `<circle cx="${X(x)}" cy="${Y(y)}" r="11" fill="#14100E" stroke="#F2B33D" stroke-width="2"/><text x="${X(x) + (x === 0 ? -28 : x === W ? 28 : 0)}" y="${Y(y) + (y === 0 ? 34 : y === H ? -20 : 7)}" text-anchor="middle" font-size="20" font-weight="900" fill="#2A2230">${l}</text>`; });
  g += `<circle cx="${X(7)}" cy="${Y(0)}" r="9" fill="#7EC8F0" stroke="#fff" stroke-width="2"/><path d="M${X(7)} ${Y(0)} l26 -26" stroke="#FFD978" stroke-width="3" marker-end="url(#ar9)"/>`;
  return `<svg viewBox="0 0 ${W * S + 80} ${H * S + 86}" style="width:100%"><defs><marker id="ar9" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#FFD978"/></marker></defs>${g}</svg>`;
})();
P({
  id: 'c9_marble', ch: 9, t: '彈珠會掉進哪個洞？', lv: 2, icon: '🔵', pos: [84, 50],
  body: () => `<p>俊治把一顆藍色彈珠放在木框底邊，說：「我賭它會掉進丁。」</p>${C9_MARBLE}
    <div class="paper" style="font-size:14px">彈珠從底邊、距離左下角 7 格的地方，沿 45° 往右上方滾出去。<br>碰到木框就反彈（入射角＝反射角），會一直滾下去；<b>滾到哪一個洞口就會掉進去</b>（洞口都在格子的交叉點上）。</div>
    <p><b>彈珠最後掉進哪一個洞？</b></p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.choice(el, ctx, ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'].map(t => ({ t, v: t })), { cols: 4 }); },
  ui: 'none', ans: ['己'], solve: '己', show: '己',
  hint: '一格一格畫下去就對了。每次碰到邊，只有一個方向會反過來。',
  ok: [['jz', '……不是丁。'], ['xy', '你賭輸了，請飲料。'], ['jz', '完全法克。']],
});

P({
  id: 'c9_know', ch: 9, t: '誰最了解彼此', lv: 2, icon: '💞', pos: [52, 74],
  body: () => `<p>桌上的螢幕亮起一行字：「旅行的最後，不是看誰去過最多地方，而是看誰最了解彼此。」下面是四個問題：</p>
    <div class="paper">① 在十分，博育說小羽他們在九份吃了<b>幾分鐘</b>？<br>② 甄妮一走出台北車站說的<b>第一句越南話</b>，一共有幾個單字？（用空格分開的算一個）<br>③ 序章裡，俊治一共喊了幾次「Bang!」？<br>④ 博育那天到底在哪一個出口？（號碼）</div>
    <p><b>密碼＝四個答案加起來。</b></p><p class="note">📓 旅行日誌記錄了每一句話。</p>`,
  split: ['你記得①的答案。', '你負責②：去旅行日誌數一數。', '你負責③：序章的每一句都要看。', '你負責④：序章的謎題答案。'],
  ans: ['56'], solve: '56', num: true, ph: '數字',
  hint: '四個問題的答案都在旅行日誌和序章的謎題裡，一題一題找出來再加。',
  ok: [['zn', 'Các bạn nhớ hết à?', '你們全部都記得？'], ['xy', '因為我們是神人。']],
});

// ---------- 象棋殘局（要真的把它殺死；黑方由電腦防守） ----------
function c9xq(n, text, lead) {
  return function (el, ctx, done) {
    el.innerHTML = `<p>${lead}</p><p class="note">你執<b style="color:#C9332B">紅方</b>（下方），紅先。請在 <b>${n}</b> 步之內<b>將死</b>黑方；黑方由電腦用最頑強的方式防守。走錯一步（讓黑方逃得掉）就算答錯。</p><div class="c9-xq"></div><div class="k-row"><span class="muted small c9-xq-s">輪到紅方。</span><button type="button" class="btn ghost sm">重來</button></div>`;
    if (!window.XQ) { el.insertAdjacentHTML('beforeend', '<p>（棋盤載入失敗）</p>'); return; }
    const root = $('.c9-xq', el), info = $('.c9-xq-s', el);
    let b = XQ.parse(text), left = n, last = null, lock = false;
    const draw = () => XQ.renderBoard(root, b, { selectable: done || lock ? null : 'r', highlight: { last, check: XQ.inCheck(b, 'b') ? 'b' : XQ.inCheck(b, 'r') ? 'r' : null }, onMove });
    const reset = () => { b = XQ.parse(text); left = n; last = null; lock = false; info.textContent = '輪到紅方。'; draw(); };
    function onMove(m) {
      if (lock) return;
      const nb = XQ.apply(b, m); b = nb; last = m; sfx('tile');
      if (XQ.isMate(nb, 'b')) { lock = true; info.textContent = '將死！'; draw(); ctx.submit('mate'); return; }
      left--;
      const replies = XQ.moves(nb, 'b');
      const okForced = left > 0 && replies.length && replies.every(o => XQ.mateIn(XQ.apply(nb, o), 'r', left));
      if (!okForced) { lock = true; draw(); info.textContent = '黑方逃掉了……'; setTimeout(() => { ctx.submit('__escape__'); reset(); }, 700); return; }
      // 黑方挑「最晚被殺」的應著
      let best = replies[0], bestLen = -1;
      for (const o of replies) { const ab = XQ.apply(nb, o); let k = 1; while (k < left && !XQ.mateIn(ab, 'r', k)) k++; if (k > bestLen) { bestLen = k; best = o; } }
      lock = true; draw();
      setTimeout(() => { b = XQ.apply(b, best); last = best; lock = false; info.textContent = `黑方應了一步。還剩 ${left} 步。`; sfx('tile'); draw(); }, 500);
    }
    $('.k-row button', el).onclick = reset;
    if (done) info.textContent = '已解開。';
    draw();
  };
}
document.head.insertAdjacentHTML('beforeend', `<style>.c9-xq { max-width: 420px; margin: 6px auto; }</style>`);
P({
  id: 'c9_xq1', ch: 9, t: '象棋殘局・一步殺', lv: 1, icon: '♟', pos: [86, 76],
  build: c9xq(1, '........./........./...abk.../..R....../........./........./........./..C....C./....K..../.........', '棋盤下壓著一張紙條：「小羽說他三歲就會下象棋。那這盤，一步就夠了吧？」'),
  ui: 'none', ans: ['mate'], solve: 'mate', show: '俥七平四（一步將死）',
  hint: '看看哪一條直線或橫線上，黑將已經沒有地方躲。炮需要一個「砲架」。',
  ok: [['xy', '一步殺。神人。'], ['jz', '你剛剛想了五分鐘。']],
});
P({
  id: 'c9_xq2', ch: 9, t: '象棋殘局・兩步殺', lv: 2, icon: '♜', pos: [70, 84], need: ['c9_xq1'],
  build: c9xq(2, '.......R./....a..../.....k.../........./......b../..C....../........./........./....K..../.........', '第二張紙條：「將軍不一定是最快的路。」'),
  ui: 'none', ans: ['mate'], solve: 'mate', show: '第一步是一步「不將軍」的炮',
  hint: '第一步不一定要將軍。先想想：黑將最後會被困在哪裡？哪一顆子要先去當「砲架」或封住路？',
  ok: [['by', '第一步居然不是將軍。'], ['jz', 'Bang。'], ['by', '……學長，那是我的台詞。']],
});
P({
  id: 'c9_xq3', ch: 9, t: '夢魘・三步殺', lv: 3, icon: '👑', pos: [38, 88], need: ['c9_xq2'],
  build: c9xq(3, '........./........./b..k....b/C......../........./........./........./........./........./.C...K..R', '最後一張紙條，字寫得很潦草：「真正的高手，連帥都會拿來用。」'),
  ui: 'none', ans: ['mate'], solve: 'mate', show: '第一步是動「帥」',
  hint: '象棋裡，將和帥不能在同一條直線上「照面」。你的帥本身，也是一顆可以封住路的子。',
  ok: [['zn', 'Ôi trời ơi!', '天啊！'], ['xy', '……她剛剛用帥殺人。'], ['jz', '完全法克。']],
});

// ---------- 最後：五個凹槽 ----------
P({
  id: 'c9_slots', ch: 9, t: '五個凹槽', lv: 1, icon: '📦', pos: [52, 16],
  need: ['c9_mj3', 'c9_big2', 'c9_red', 'c9_maid', 'c9_marble', 'c9_know', 'c9_xq3'],
  body: () => `<p>桌子上罩著一個大鎖箱，箱蓋上有五個形狀不一樣的凹槽。旁邊刻著一行字：</p>
    <div class="paper">「旅行，是一站一站走出來的。把這兩天得到的東西，照<b>拿到的先後順序</b>放回去。」</div>
    <p class="note">🎒 道具欄裡有你們這兩天收集的所有東西，但不是每一樣都屬於這個箱子。</p>`,
  build(el, ctx, done) { el.innerHTML = this.body(ctx); if (!done) K.seq(el, ctx, [['🟩 神秘玉牌', 'jade'], ['🏮 天燈願望紙', 'wish'], ['🪙 古老銅幣', 'coin'], ['🗺️ 最後的地圖', 'map'], ['🃏 黑色撲克牌', 'card'], ['📒 越南語小抄', 'dict'], ['🎫 紅色車票', 'ticket'], ['🪙 金色籌碼', 'chip']].map(([t, v]) => ({ t, v })), { len: 5 }); },
  ui: 'none', ans: ['jade-ticket-coin-card-chip'], solve: 'jade-ticket-coin-card-chip', show: '玉牌 → 紅色車票 → 銅幣 → 黑色撲克牌 → 金色籌碼',
  hint: '博育在饒河夜市拿出的袋子裡，裝的是哪五樣？它們分別是在哪一站拿到的？',
  ok: [['by', '五件道具……全部亮起來了。'], ['zn', 'Đẹp quá!', '好漂亮！']],
});
