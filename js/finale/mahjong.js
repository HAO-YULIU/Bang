/* 越南公主 — 台灣十六張麻將（打一圈・積分賽）
 * 規格：js/finale/SPEC.md 。classic script，載入後 FINALE.register('mahjong', mod)。
 *
 * 牌的編碼（kind）：0-8 萬、9-17 筒、18-26 條、27-30 東南西北、31-33 中發白、34-41 春夏秋冬梅蘭竹菊。
 *
 * 實作說明 / 簡化：
 *  - 打一圈：莊家依座位 0→1→2→3 輪替；莊家胡或流局連莊；整場最多 8 局。
 *  - 留牌 16 張：牌牆剩 16 張時不可再摸（含補花、槓後補牌）→ 流局。
 *  - 一炮多響：只算放槍者之後第一個（依出牌順序）胡牌的人（截胡）。
 *  - 牌牆摸完後（最後一張打出時）只能胡（河底撈魚），不能碰/吃/槓。
 *  - 莊家台：莊家胡或莊家付錢時，該付款人多算「莊家 1 台 + 連莊 n 拉 n（2n 台）」；
 *    閒家自摸時只有莊家多付莊家台。
 *  - 門清自摸＝不求人＝3 台（取代 門清1＋自摸1）。全求人 2 台（不再加獨聽）。
 *  - 小三元/大三元 取代個別三元刻；小四喜/大四喜 取代風刻；字一色不再加碰碰胡/混一色。
 *  - 花：本位花每張 1 台；同一組四張（春夏秋冬或梅蘭竹菊）2 台（取代該組本位花）。
 *  - 天胡 24 台、地胡 16 台（第一巡無人吃碰槓時自摸）。不做八仙過海/七搶一。
 *  - 台數取所有拆法中最高者；獨聽＝聽牌只有一種。
 */
(function () {
  'use strict';

  var BASE = 100, PER = 20, RESERVE = 16, MAX_HANDS = 8, START_PTS = 1000;
  var NUM = '一二三四五六七八九';
  var HONOR = '東南西北中發白';
  var FLOWER = '春夏秋冬梅蘭竹菊';
  var WIND = '東南西北';
  var DEF_NAMES = { zn: '甄妮', xy: '小羽', jz: '俊治', by: '博育' };

  function isFlower(t) { return t >= 34; }
  function isHonor(t) { return t >= 27 && t < 34; }
  function suitOf(t) { return t < 27 ? Math.floor(t / 9) : 3; }
  function tname(t) {
    if (t < 27) return NUM[t % 9] + '萬筒條'[suitOf(t)];
    if (t < 34) return HONOR[t - 27];
    return FLOWER[t - 34];
  }
  function chName(s, seat) {
    var se = s.seats[seat] || {};
    var fx = (typeof FX !== 'undefined' && FX && FX.names) ? FX.names : DEF_NAMES;
    return se.name || fx[se.ch] || DEF_NAMES[se.ch] || ('玩家' + (seat + 1));
  }

  // ---------- PRNG ----------
  function rnd(s) {
    s.rng = (s.rng + 0x6D2B79F5) >>> 0;
    var t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function hrand(s, seat, salt) { // 不改 state 的決定性亂數（bot 用）
    var h = (s.seed ^ Math.imul(s.actN + 1, 2654435761) ^ Math.imul(seat + 7, 40503) ^ Math.imul(salt + 3, 2246822519)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }

  // ---------- 胡牌判定 ----------
  function counts(arr) { var c = new Array(34).fill(0); for (var i = 0; i < arr.length; i++) if (arr[i] < 34) c[arr[i]]++; return c; }

  function canWinCnt(cnt) {
    var total = 0; for (var i = 0; i < 34; i++) total += cnt[i];
    if (total % 3 !== 2) return false;
    return recWin(cnt, 0, false);
  }
  function recWin(cnt, i, hasPair) {
    while (i < 34 && cnt[i] === 0) i++;
    if (i === 34) return hasPair;
    if (cnt[i] >= 3) { cnt[i] -= 3; var ok = recWin(cnt, i, hasPair); cnt[i] += 3; if (ok) return true; }
    if (!hasPair && cnt[i] >= 2) { cnt[i] -= 2; var ok2 = recWin(cnt, i, true); cnt[i] += 2; if (ok2) return true; }
    if (i < 27 && i % 9 <= 6 && cnt[i + 1] > 0 && cnt[i + 2] > 0) {
      cnt[i]--; cnt[i + 1]--; cnt[i + 2]--;
      var ok3 = recWin(cnt, i, hasPair);
      cnt[i]++; cnt[i + 1]++; cnt[i + 2]++;
      if (ok3) return true;
    }
    return false;
  }
  // 列出所有拆法：{pair, sets:[{t:'chi'|'pong', k}]}
  function decomps(cnt) {
    var out = [], sets = [];
    function rec(i, pair) {
      if (out.length > 64) return;
      while (i < 34 && cnt[i] === 0) i++;
      if (i === 34) { if (pair >= 0) out.push({ pair: pair, sets: sets.slice() }); return; }
      if (cnt[i] >= 3) { cnt[i] -= 3; sets.push({ t: 'pong', k: i }); rec(i, pair); sets.pop(); cnt[i] += 3; }
      if (pair < 0 && cnt[i] >= 2) { cnt[i] -= 2; rec(i, i); cnt[i] += 2; }
      if (i < 27 && i % 9 <= 6 && cnt[i + 1] > 0 && cnt[i + 2] > 0) {
        cnt[i]--; cnt[i + 1]--; cnt[i + 2]--; sets.push({ t: 'chi', k: i });
        rec(i, pair);
        sets.pop(); cnt[i]++; cnt[i + 1]++; cnt[i + 2]++;
      }
    }
    var c = cnt.slice(); var tot = 0; for (var i = 0; i < 34; i++) tot += c[i];
    if (tot % 3 !== 2) return out;
    rec(0, -1);
    return out;
  }
  function handSizeOk(hand, melds) { return hand.length === 3 * (5 - melds.length) + 2; }
  function isWinningHand(hand, melds) { // 給測試用
    melds = melds || [];
    if (!handSizeOk(hand, melds)) return false;
    return canWinCnt(counts(hand));
  }
  // 聽牌（手牌 3n+1 張）
  function waitsOf(hand) {
    var cnt = counts(hand), res = [];
    for (var k = 0; k < 34; k++) {
      if (cnt[k] >= 4) continue;
      // 剪枝：數牌必須在手牌某張的 ±2 內；字牌必須手上已有
      if (k >= 27) { if (!cnt[k]) continue; }
      else {
        var r = k % 9, near = cnt[k] > 0;
        for (var d = -2; d <= 2 && !near; d++) { var r2 = r + d; if (r2 >= 0 && r2 <= 8 && cnt[k + d] > 0) near = true; }
        if (!near) continue;
      }
      cnt[k]++;
      if (canWinCnt(cnt)) res.push(k);
      cnt[k]--;
    }
    return res;
  }
  function meldTiles(m) {
    if (m.t === 'chi') return [m.k, m.k + 1, m.k + 2];
    if (m.t === 'pong') return [m.k, m.k, m.k];
    return [m.k, m.k, m.k, m.k];
  }
  function removeOne(arr, t) { var i = arr.indexOf(t); if (i >= 0) { arr.splice(i, 1); return true; } return false; }
  function sortTiles(a) { return a.slice().sort(function (x, y) { return x - y; }); }

  // ---------- 台數 ----------
  function seatWindIdx(s, seat) { return (seat - s.dealer + 4) % 4; }
  function dealerTai(s) { return 1 + 2 * s.streak; }

  function scoreDecomp(s, w, d, ctx, single) {
    var melds = s.melds[w], flowers = s.flowers[w];
    var lines = [];
    var sets = d.sets.map(function (x) { return { t: x.t, k: x.k, open: false }; });
    melds.forEach(function (m) { sets.push({ t: m.t === 'chi' ? 'chi' : 'pong', k: m.k, open: m.t !== 'ankong' }); });
    var all = s.hands[w].slice();
    melds.forEach(function (m) { all = all.concat(meldTiles(m)); });
    var menqing = melds.every(function (m) { return m.t === 'ankong'; });
    var openCount = melds.filter(function (m) { return m.t !== 'ankong'; }).length;
    var quanqiu = openCount === 5 && !ctx.tsumo;

    if (ctx.tian) lines.push(['天胡', 24]);
    if (ctx.di) lines.push(['地胡', 16]);
    if (ctx.tsumo && menqing) lines.push(['門清自摸（不求人）', 3]);
    else { if (ctx.tsumo) lines.push(['自摸', 1]); if (menqing) lines.push(['門清', 1]); }
    if (quanqiu) lines.push(['全求人', 2]);

    var hasHonor = all.some(isHonor);
    var suits = {}; all.forEach(function (t) { if (t < 27) suits[suitOf(t)] = 1; });
    var nSuits = Object.keys(suits).length;
    var allChi = sets.every(function (x) { return x.t === 'chi'; });
    var allPong = sets.every(function (x) { return x.t === 'pong'; });
    if (allChi && !hasHonor && flowers.length === 0 && !ctx.tsumo && !single) lines.push(['平胡', 2]);
    if (nSuits === 0) lines.push(['字一色', 16]);
    else {
      if (allPong) lines.push(['碰碰胡', 4]);
      if (nSuits === 1 && !hasHonor) lines.push(['清一色', 8]);
      else if (nSuits === 1 && hasHonor) lines.push(['混一色', 4]);
    }
    var pongK = {}; sets.forEach(function (x) { if (x.t === 'pong') pongK[x.k] = 1; });
    // 三元
    var dp = [31, 32, 33].filter(function (k) { return pongK[k]; });
    if (dp.length === 3) lines.push(['大三元', 8]);
    else if (dp.length === 2 && d.pair >= 31 && d.pair <= 33) lines.push(['小三元', 4]);
    else dp.forEach(function (k) { lines.push([HONOR[k - 27] + (k === 31 ? '（紅中）' : k === 32 ? '（青發）' : '（白板）') + '刻', 1]); });
    // 風
    var wp = [27, 28, 29, 30].filter(function (k) { return pongK[k]; });
    if (wp.length === 4) lines.push(['大四喜', 16]);
    else if (wp.length === 3 && d.pair >= 27 && d.pair <= 30) lines.push(['小四喜', 8]);
    else {
      if (pongK[27]) lines.push(['圈風刻（東）', 1]);
      var sw = 27 + seatWindIdx(s, w);
      if (pongK[sw]) lines.push(['門風刻（' + WIND[sw - 27] + '）', 1]);
    }
    // 花
    var pos = seatWindIdx(s, w);
    [[34, '春夏秋冬'], [38, '梅蘭竹菊']].forEach(function (g) {
      var have = flowers.filter(function (f) { return f >= g[0] && f < g[0] + 4; });
      if (have.length === 4) lines.push([g[1] + ' 一套', 2]);
      else if (have.indexOf(g[0] + pos) >= 0) lines.push(['本位花（' + FLOWER[g[0] - 34 + pos] + '）', 1]);
    });
    if (ctx.haitei) lines.push(['海底撈月', 1]);
    if (ctx.houtei) lines.push(['河底撈魚', 1]);
    if (ctx.kongFlower) lines.push(['槓上開花', 1]);
    if (ctx.rob) lines.push(['搶槓', 1]);
    if (single && !quanqiu) lines.push(['獨聽', 1]);
    var total = 0; lines.forEach(function (l) { total += l[1]; });
    return { lines: lines, total: total };
  }

  function calcTai(s, w, ctx) {
    var hand = s.hands[w];
    var ds = decomps(counts(hand));
    var before = hand.slice(); removeOne(before, ctx.tile);
    var single = waitsOf(before).length === 1;
    var best = null;
    ds.forEach(function (d) {
      var r = scoreDecomp(s, w, d, ctx, single);
      if (!best || r.total > best.total) best = r;
    });
    return best || { lines: [], total: 0 };
  }

  // ---------- 牌局流程 ----------
  function canDraw(s) { return s.wall.length > RESERVE; }
  function live(s) { return Math.max(0, s.wall.length - RESERVE); }

  // 摸牌（含補花）。回傳 false 代表牌摸完→流局（已處理）
  function drawFor(s, p, back, ev) {
    for (;;) {
      if (!canDraw(s)) { endDrawn(s, ev); return false; }
      var t = back ? s.wall.pop() : s.wall.shift();
      if (isFlower(t)) { s.flowers[p].push(t); back = true; continue; }
      s.hands[p].push(t);
      s.drawn[p] = t;
      s.turn = p;
      s.phase = 'play';
      return true;
    }
  }

  function startHand(s, ev) {
    var wall = [], k, i;
    for (k = 0; k < 34; k++) for (i = 0; i < 4; i++) wall.push(k);
    for (k = 34; k < 42; k++) wall.push(k);
    for (i = wall.length - 1; i > 0; i--) { var j = Math.floor(rnd(s) * (i + 1)); var tmp = wall[i]; wall[i] = wall[j]; wall[j] = tmp; }
    s.wall = wall;
    s.hands = [[], [], [], []]; s.melds = [[], [], [], []]; s.flowers = [[], [], [], []]; s.rivers = [[], [], [], []];
    s.drawn = [null, null, null, null]; s.discCount = [0, 0, 0, 0];
    s.noClaims = true; s.kongFlag = -1; s.claim = null; s.end = null; s.ready = [false, false, false, false];
    s.lastDisc = null;
    for (var r = 0; r < 4; r++) for (i = 0; i < 4; i++) {
      var p = (s.dealer + i) % 4;
      for (var n = 0; n < 4; n++) s.hands[p].push(s.wall.shift());
    }
    s.hands[s.dealer].push(s.wall.shift());
    s.phase = 'play'; s.turn = s.dealer;
    // 補花（從莊家開始）
    for (i = 0; i < 4; i++) {
      var q = (s.dealer + i) % 4, h = s.hands[q];
      for (;;) {
        var fi = -1; for (var x = 0; x < h.length; x++) if (isFlower(h[x])) { fi = x; break; }
        if (fi < 0) break;
        s.flowers[q].push(h.splice(fi, 1)[0]);
        if (!canDraw(s)) { endDrawn(s, ev); return; }
        h.push(s.wall.pop());
      }
    }
    var dh = s.hands[s.dealer];
    s.drawn[s.dealer] = dh[dh.length - 1];
    if (ev) ev.push({ sfx: 'shuffle' });
  }

  function endDrawn(s, ev) {
    s.phase = 'end'; s.claim = null;
    s.end = { type: 'draw', dealer: s.dealer, streak: s.streak, delta: [0, 0, 0, 0], points: s.points.slice() };
    finishHand(s, false);
    if (ev) {
      ev.push({ toast: '流局！' });
      ev.push({ q: ['jz', '完全法克。'] });
    }
  }

  function finishHand(s, dealerLost) {
    s.handsPlayed++;
    if (dealerLost) { s.nextDealer = s.dealer + 1; s.nextStreak = 0; } else { s.nextDealer = s.dealer; s.nextStreak = s.streak + 1; }
    s.end.final = s.handsPlayed >= MAX_HANDS || s.nextDealer >= 4;
    s.ready = [false, false, false, false];
  }

  function winQuips(s, w, ctx, ev) {
    var ch = (s.seats[w] || {}).ch;
    if (ch === 'zn') {
      ev.push({ q: ['zn', 'Tôi thắng rồi!', '我胡了！'] });
      ev.push({ q: ['xy', '神人！'] });
    } else if (ch === 'xy') {
      ev.push({ q: ['xy', '我就說我是神人。'] }, { q: ['jz', '你只是運氣好。'] }, { q: ['xy', '嫉妒？'] }, { q: ['jz', 'Bang！'] });
    } else if (ch === 'jz') {
      ev.push({ q: ['jz', 'Bang！'] }, { q: ['by', '你到底為什麼胡牌要喊 Bang？'] }, { q: ['jz', '因為帥。'] }, { q: ['by', '完全沒有關係。'] });
    } else if (ch === 'by') {
      if (!s.byWon) {
        s.byWon = true;
        ev.push({ toast: '全場：「……」' }, { q: ['xy', '學弟。'] }, { q: ['by', '嗯？'] }, { q: ['xy', '你變了。'] },
          { q: ['jz', '他已經不是以前那個博育了。'] }, { q: ['by', 'Bang。'] }, { q: ['xy', '完了。'] }, { q: ['jz', '他真的被我們同化了。'] });
      } else {
        ev.push({ q: ['by', 'Bang。'] });
      }
    }
  }

  function doWin(s, w, ctx, ev) {
    ctx.haitei = ctx.tsumo && !canDraw(s);
    ctx.houtei = !ctx.tsumo && !canDraw(s);
    ctx.kongFlower = ctx.tsumo && s.kongFlag === w;
    var totalDisc = s.discCount.reduce(function (a, b) { return a + b; }, 0);
    ctx.tian = ctx.tsumo && w === s.dealer && totalDisc === 0 && s.noClaims;
    ctx.di = ctx.tsumo && w !== s.dealer && s.discCount[w] === 0 && s.noClaims;
    var tai = calcTai(s, w, ctx);
    var dt = dealerTai(s);
    var payers = ctx.tsumo ? [0, 1, 2, 3].filter(function (p) { return p !== w; }) : [ctx.from];
    var delta = [0, 0, 0, 0], pay = {};
    payers.forEach(function (p) {
      var extra = (w === s.dealer || p === s.dealer) ? dt : 0;
      var t = tai.total + extra;
      var amt = BASE + PER * t;
      delta[p] -= amt; delta[w] += amt; pay[p] = { tai: t, amt: amt };
    });
    for (var i = 0; i < 4; i++) s.points[i] += delta[i];
    var dealerLines = [['莊家', 1]];
    if (s.streak > 0) dealerLines.push(['連莊 ' + s.streak + ' 拉 ' + s.streak, 2 * s.streak]);
    s.phase = 'end'; s.claim = null;
    s.end = {
      type: 'win', winner: w, from: ctx.tsumo ? -1 : ctx.from, tsumo: !!ctx.tsumo, rob: !!ctx.rob, tile: ctx.tile,
      lines: tai.lines, total: tai.total, dealerLines: dealerLines, dealerApplies: w === s.dealer ? 'all' : (payers.indexOf(s.dealer) >= 0 ? 'dealer' : 'none'),
      pay: pay, delta: delta, points: s.points.slice(), dealer: s.dealer, streak: s.streak,
      hand: sortTiles(s.hands[w]), melds: JSON.parse(JSON.stringify(s.melds[w])), flowers: s.flowers[w].slice()
    };
    finishHand(s, w !== s.dealer);
    var nm = chName(s, w);
    ev.push({ sfx: 'win' });
    ev.push({ toast: ctx.tsumo ? nm + ' 自摸！' : nm + (ctx.rob ? ' 搶槓胡！' : ' 胡！') });
    winQuips(s, w, ctx, ev);
  }

  function claimOptsFor(s, p, t, from, robOnly) {
    var o = [], h = s.hands[p];
    var hc = h.slice(); hc.push(t);
    if (handSizeOk(hc, s.melds[p]) && canWinCnt(counts(hc))) o.push({ type: 'ron' });
    if (robOnly || !canDraw(s)) return o;
    var c = 0; for (var i = 0; i < h.length; i++) if (h[i] === t) c++;
    if (c >= 3) o.push({ type: 'kong' });
    if (c >= 2) o.push({ type: 'pong' });
    if (p === (from + 1) % 4 && t < 27) {
      var r = t % 9, has = function (k) { return h.indexOf(k) >= 0; };
      if (r >= 2 && has(t - 2) && has(t - 1)) o.push({ type: 'chi', use: [t - 2, t - 1] });
      if (r >= 1 && r <= 7 && has(t - 1) && has(t + 1)) o.push({ type: 'chi', use: [t - 1, t + 1] });
      if (r <= 6 && has(t + 1) && has(t + 2)) o.push({ type: 'chi', use: [t + 1, t + 2] });
    }
    return o;
  }

  function afterDiscard(s, from, t, ev) {
    var opts = {}, any = false;
    for (var i = 1; i <= 3; i++) {
      var p = (from + i) % 4, o = claimOptsFor(s, p, t, from, false);
      if (o.length) { opts[p] = o; any = true; }
    }
    if (any) { s.phase = 'claim'; s.claim = { kind: 'discard', tile: t, from: from, opts: opts, resp: {} }; return; }
    nextTurn(s, from, ev);
  }

  function nextTurn(s, from, ev) {
    s.claim = null;
    drawFor(s, (from + 1) % 4, false, ev);
  }

  function completeKakan(s, p, k, ev) {
    s.claim = null;
    var m = s.melds[p].filter(function (x) { return x.t === 'pong' && x.k === k; })[0];
    m.t = 'kong'; m.add = true;
    s.kongFlag = p;
    s.drawn[p] = null;
    drawFor(s, p, true, ev);
  }

  function resolveClaim(s, ev) {
    var c = s.claim, order = [1, 2, 3].map(function (i) { return (c.from + i) % 4; });
    var rons = order.filter(function (p) { return c.resp[p] && c.resp[p].type === 'ron'; });
    if (rons.length) {
      var w = rons[0];
      if (c.kind === 'discard') s.rivers[c.from].pop();
      s.hands[w].push(c.tile);
      doWin(s, w, { tsumo: false, tile: c.tile, from: c.from, rob: c.kind === 'rob' }, ev);
      return;
    }
    if (c.kind === 'rob') { completeKakan(s, c.from, c.tile, ev); return; }
    var nm, p;
    var pk = order.filter(function (q) { return c.resp[q] && (c.resp[q].type === 'pong' || c.resp[q].type === 'kong'); })[0];
    if (pk !== undefined) {
      p = pk; nm = chName(s, p);
      var isKong = c.resp[p].type === 'kong';
      s.rivers[c.from].pop();
      for (var i = 0; i < (isKong ? 3 : 2); i++) removeOne(s.hands[p], c.tile);
      s.melds[p].push({ t: isKong ? 'kong' : 'pong', k: c.tile, from: c.from });
      s.noClaims = false; s.claim = null; s.turn = p; s.drawn = [null, null, null, null];
      ev.push({ sfx: 'tile' }, { toast: nm + (isKong ? ' 槓！' : ' 碰！') });
      if (isKong) { s.kongFlag = p; drawFor(s, p, true, ev); }
      else { s.phase = 'play'; s.kongFlag = -1; }
      return;
    }
    var ck = order.filter(function (q) { return c.resp[q] && c.resp[q].type === 'chi'; })[0];
    if (ck !== undefined) {
      p = ck; nm = chName(s, p);
      var use = c.resp[p].use;
      s.rivers[c.from].pop();
      removeOne(s.hands[p], use[0]); removeOne(s.hands[p], use[1]);
      s.melds[p].push({ t: 'chi', k: Math.min(c.tile, use[0], use[1]), tile: c.tile, from: c.from });
      s.noClaims = false; s.claim = null; s.turn = p; s.phase = 'play'; s.kongFlag = -1; s.drawn = [null, null, null, null];
      ev.push({ sfx: 'tile' }, { toast: nm + ' 吃！' });
      return;
    }
    nextTurn(s, c.from, ev);
  }

  function turnOptions(s, p) {
    var h = s.hands[p], o = { tsumo: false, ankong: [], kakan: [] };
    if (s.phase !== 'play' || s.turn !== p || h.length % 3 !== 2) return o;
    o.tsumo = s.drawn[p] !== null && canWinCnt(counts(h));
    if (canDraw(s)) {
      var c = counts(h);
      for (var k = 0; k < 34; k++) if (c[k] === 4) o.ankong.push(k);
      s.melds[p].forEach(function (m) { if (m.t === 'pong' && c[m.k] > 0) o.kakan.push(m.k); });
    }
    return o;
  }

  // ---------- 介面函式 ----------
  function init(opts) {
    var seats = (opts && opts.seats) || [];
    var seed = (opts && opts.seed) | 0;
    var s = {
      v: 1, seed: seed >>> 0, rng: (seed >>> 0) ^ 0x9E3779B9, actN: 0,
      seats: seats.map(function (x, i) { return { seat: i, ch: x.ch, name: x.name, bot: !!x.bot }; }),
      points: [START_PTS, START_PTS, START_PTS, START_PTS],
      dealer: 0, streak: 0, handsPlayed: 0, byWon: false, history: []
    };
    startHand(s, []);
    return s;
  }

  function act(state, seat, a) {
    if (!state || !a || typeof a.type !== 'string') return { ok: false, msg: '無效的動作' };
    if (typeof seat !== 'number' || seat < 0 || seat > 3) return { ok: false, msg: '觀戰者不能操作' };
    var s = JSON.parse(JSON.stringify(state));
    var ev = [];
    var t = a.tile;
    if (s.phase === 'play') {
      if (seat !== s.turn) return { ok: false, msg: '還沒輪到你' };
      var h = s.hands[seat];
      if (h.length % 3 !== 2) return { ok: false, msg: '現在不能打牌' };
      var to = turnOptions(s, seat);
      if (a.type === 'discard') {
        if (typeof t !== 'number' || h.indexOf(t) < 0) return { ok: false, msg: '你沒有這張牌' };
        removeOne(h, t);
        s.rivers[seat].push(t); s.discCount[seat]++;
        s.drawn = [null, null, null, null]; s.kongFlag = -1;
        s.lastDisc = { seat: seat, tile: t };
        ev.push({ sfx: 'tile' });
        afterDiscard(s, seat, t, ev);
      } else if (a.type === 'tsumo') {
        if (!to.tsumo) return { ok: false, msg: '還不能胡' };
        doWin(s, seat, { tsumo: true, tile: s.drawn[seat] }, ev);
      } else if (a.type === 'ankong') {
        if (to.ankong.indexOf(t) < 0) return { ok: false, msg: '不能暗槓' };
        for (var i = 0; i < 4; i++) removeOne(h, t);
        s.melds[seat].push({ t: 'ankong', k: t });
        s.noClaims = false; s.kongFlag = seat; s.drawn[seat] = null;
        ev.push({ sfx: 'tile' }, { toast: chName(s, seat) + ' 暗槓！' });
        drawFor(s, seat, true, ev);
      } else if (a.type === 'kakan') {
        if (to.kakan.indexOf(t) < 0) return { ok: false, msg: '不能加槓' };
        removeOne(h, t);
        s.noClaims = false; s.drawn[seat] = null;
        ev.push({ sfx: 'tile' }, { toast: chName(s, seat) + ' 加槓！' });
        var opts = {}, any = false;
        for (var j = 1; j <= 3; j++) {
          var p = (seat + j) % 4, o = claimOptsFor(s, p, t, seat, true);
          if (o.length) { opts[p] = o; any = true; }
        }
        if (any) { s.phase = 'claim'; s.claim = { kind: 'rob', tile: t, from: seat, opts: opts, resp: {} }; }
        else completeKakan(s, seat, t, ev);
      } else return { ok: false, msg: '現在不能這樣做' };
    } else if (s.phase === 'claim') {
      var c = s.claim, my = c.opts[seat];
      if (!my || c.resp[seat]) return { ok: false, msg: '現在不用你回應' };
      var chosen = null;
      if (a.type === 'pass') chosen = { type: 'pass' };
      else {
        for (var q = 0; q < my.length && !chosen; q++) {
          var op = my[q];
          if (op.type !== a.type) continue;
          if (op.type === 'chi' && a.use) {
            var su = Array.isArray(a.use) && a.use.length === 2 ? sortTiles(a.use) : [];
            if (su[0] === op.use[0] && su[1] === op.use[1]) chosen = op;
          } else chosen = op;
        }
        if (!chosen) return { ok: false, msg: '不能這樣宣告' };
      }
      c.resp[seat] = chosen;
      var allIn = Object.keys(c.opts).every(function (k) { return c.resp[k]; });
      if (allIn) resolveClaim(s, ev);
    } else if (s.phase === 'end') {
      if (a.type !== 'next') return { ok: false, msg: '等待下一局' };
      s.ready[seat] = true;
      if (s.ready.every(Boolean)) {
        s.history.push({ type: s.end.type, winner: s.end.winner, delta: s.end.delta });
        if (s.end.final) { s.phase = 'over'; ev.push({ sfx: 'fanfare' }); }
        else { s.dealer = s.nextDealer; s.streak = s.nextStreak; startHand(s, ev); ev.push({ toast: '東風圈 第 ' + (s.handsPlayed + 1) + ' 局' }); }
      }
    } else return { ok: false, msg: '牌局已結束' };
    s.actN++;
    return { ok: true, state: s, ev: ev };
  }

  function waiting(s) {
    if (!s) return [];
    if (s.phase === 'play') return [s.turn];
    if (s.phase === 'claim') return Object.keys(s.claim.opts).map(Number).filter(function (p) { return !s.claim.resp[p]; });
    if (s.phase === 'end') return [0, 1, 2, 3].filter(function (p) { return !s.ready[p]; });
    return [];
  }

  // ---------- Bot ----------
  function visibleCounts(s, seat) {
    var c = counts(s.hands[seat]);
    for (var p = 0; p < 4; p++) {
      s.rivers[p].forEach(function (t) { c[t]++; });
      s.melds[p].forEach(function (m) { meldTiles(m).forEach(function (t) { c[t]++; }); });
    }
    return c;
  }
  function tileValue(t, cnt, seatWind) {
    var c = cnt[t], v;
    if (t >= 27) {
      v = c >= 3 ? 40 : c === 2 ? 14 : 0;
      if (c === 1 && (t >= 31 || t === 27 || t === seatWind)) v += 1.5;
      return v;
    }
    v = c >= 3 ? 30 : c === 2 ? 12 : 0;
    var r = t % 9;
    if (r > 0 && cnt[t - 1]) v += 6;
    if (r < 8 && cnt[t + 1]) v += 6;
    if (r > 1 && cnt[t - 2]) v += 2.5;
    if (r < 7 && cnt[t + 2]) v += 2.5;
    v += (r === 0 || r === 8) ? 0 : (r === 1 || r === 7) ? 1 : 2;
    return v;
  }
  function botDiscard(s, seat) {
    var h = s.hands[seat];
    var uniq = sortTiles(h).filter(function (x, i, a) { return i === 0 || a[i - 1] !== x; });
    var vis = visibleCounts(s, seat);
    var best = null, bestW = 0;
    uniq.forEach(function (t) {
      var h2 = h.slice(); removeOne(h2, t);
      var ws = waitsOf(h2), n = 0;
      ws.forEach(function (k) { n += Math.max(0, 4 - vis[k]) + 0.01; });
      if (n > bestW) { bestW = n; best = t; }
    });
    if (best !== null) return best;
    var cnt = counts(h), sw = 27 + seatWindIdx(s, seat), minV = Infinity, pick = h[0];
    uniq.forEach(function (t) {
      var v = tileValue(t, cnt, sw) - (4 - vis[t] <= 0 ? 1 : 0);
      if (v < minV) { minV = v; pick = t; }
    });
    return pick;
  }
  function bot(s, seat) {
    if (!s || waiting(s).indexOf(seat) < 0) return null;
    if (s.phase === 'end') return { type: 'next' };
    if (s.phase === 'play') {
      var to = turnOptions(s, seat);
      if (to.tsumo) return { type: 'tsumo' };
      if (to.kakan.length && hrand(s, seat, 1) < 0.8) return { type: 'kakan', tile: to.kakan[0] };
      if (to.ankong.length) return { type: 'ankong', tile: to.ankong[0] };
      return { type: 'discard', tile: botDiscard(s, seat) };
    }
    if (s.phase === 'claim') {
      var o = s.claim.opts[seat] || [], t = s.claim.tile;
      var has = function (ty) { return o.filter(function (x) { return x.type === ty; })[0]; };
      if (has('ron')) return { type: 'ron' };
      var tenpai = waitsOf(s.hands[seat]).length > 0;
      if (!tenpai) {
        var valuable = t >= 31 || t === 27 || t === 27 + seatWindIdx(s, seat);
        if (has('kong') && hrand(s, seat, 2) < 0.6) return { type: 'kong' };
        if (has('pong') && (valuable || hrand(s, seat, 3) < 0.35)) return { type: 'pong' };
        var ch = has('chi');
        if (ch && hrand(s, seat, 4) < 0.12) return { type: 'chi', use: ch.use };
      }
      return { type: 'pass' };
    }
    return null;
  }

  function result(s) {
    if (!s || s.phase !== 'over') return null;
    var rank = [0, 1, 2, 3].sort(function (a, b) { return (s.points[b] - s.points[a]) || (a - b); });
    var score = {}; [0, 1, 2, 3].forEach(function (p) { score[p] = s.points[p]; });
    var lines = rank.map(function (p) { return chName(s, p) + ' ' + s.points[p] + ' 分'; });
    return { rank: rank, score: score, lines: lines };
  }

  // ---------- 畫面 ----------
  var CSS = [
    '.fmj-root{--cream:#FFF6E8;--red:#E8453C;--teal:#2BA6A0;--ink:#2A2230;--gold:#F2B33D;--paper:#FFFDF8;--felt:#2E8C6E;',
    'position:relative;box-sizing:border-box;width:100%;max-width:1180px;margin:0 auto;padding:8px;color:var(--ink);background:var(--cream);',
    "font-family:'Noto Sans TC',system-ui,sans-serif;overflow-x:hidden;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}",
    '.fmj-root *{box-sizing:border-box}',
    '.fmj-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px}',
    '.fmj-title{font-weight:900;font-size:15px;color:var(--red);margin-right:auto;font-family:"Noto Serif TC",serif}',
    '.fmj-chip{background:var(--paper);border:1px solid #ecd9b8;border-radius:999px;padding:2px 8px;font-size:12px;white-space:nowrap}',
    '.fmj-btn{appearance:none;border:none;border-radius:10px;padding:8px 12px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;background:var(--teal);color:#fff;box-shadow:0 2px 0 rgba(0,0,0,.18);touch-action:manipulation}',
    '.fmj-btn:active{transform:translateY(1px);box-shadow:none}',
    '.fmj-btn.red{background:var(--red)}.fmj-btn.gold{background:var(--gold);color:var(--ink)}.fmj-btn.gray{background:#9a8f86}.fmj-btn.sm{padding:4px 10px;font-size:12px}',
    '.fmj-board{display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-areas:"left top right" "river river river" "me me me";gap:6px}',
    '.fmj-opp{background:var(--paper);border:2px solid #ecd9b8;border-radius:12px;padding:5px;min-width:0;display:flex;flex-direction:column;gap:3px;align-items:center;text-align:center}',
    '.fmj-opp.turn,.fmj-me.turn{border-color:var(--gold);box-shadow:0 0 0 3px rgba(242,179,61,.45)}',
    '.fmj-pos-left{grid-area:left}.fmj-pos-top{grid-area:top}.fmj-pos-right{grid-area:right}',
    '.fmj-who{display:flex;align-items:center;gap:4px;min-width:0;max-width:100%}',
    '.fmj-who img,.fmj-who svg{width:28px;height:28px;border-radius:50%;flex:none}',
    '.fmj-av{width:28px;height:28px;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden}',
    '.fmj-av img{width:100%;height:100%}',
    '.fmj-nm{font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}',
    '.fmj-pts{font-size:12px;font-weight:700;color:var(--teal)}',
    '.fmj-badge{display:inline-block;font-size:11px;font-weight:900;border-radius:5px;padding:0 4px;color:#fff;background:var(--ink);line-height:16px}',
    '.fmj-badge.dl{background:var(--red)}',
    '.fmj-row{display:flex;flex-wrap:wrap;gap:2px;justify-content:center;align-items:flex-end;max-width:100%}',
    '.fmj-meld{display:inline-flex;gap:0;margin:0 2px;padding:1px;border-radius:4px;background:rgba(43,166,160,.12)}',
    '.fmj-backs{display:flex;align-items:center;gap:3px;font-size:12px;font-weight:700}',
    '.fmj-river{grid-area:river;background:radial-gradient(circle at 50% 50%,#3aa281,var(--felt));border-radius:14px;padding:6px;display:grid;',
    'grid-template-columns:minmax(0,1fr) minmax(0,1.25fr) minmax(0,1fr);grid-template-areas:"rt rt rt" "rl info rr" "rb rb rb";gap:5px;min-height:200px}',
    '.fmj-rv{min-width:0;display:flex;flex-wrap:wrap;gap:2px;align-content:flex-start;align-items:flex-start;padding:3px;border-radius:8px;background:rgba(255,255,255,.08);min-height:30px}',
    '.fmj-rv-top{grid-area:rt;justify-content:center}.fmj-rv-bottom{grid-area:rb;justify-content:center}.fmj-rv-left{grid-area:rl}.fmj-rv-right{grid-area:rr;justify-content:flex-end}',
    '.fmj-rv.turn{background:rgba(242,179,61,.28)}',
    '.fmj-info{grid-area:info;background:rgba(255,253,248,.92);border-radius:10px;padding:6px;text-align:center;font-size:12px;display:flex;flex-direction:column;justify-content:center;gap:2px}',
    '.fmj-info b{font-size:15px;color:var(--red);font-family:"Noto Serif TC",serif}',
    '.fmj-wall{font-size:20px;font-weight:900;color:var(--teal)}',
    '.fmj-me{grid-area:me;background:var(--paper);border:2px solid #ecd9b8;border-radius:12px;padding:6px;min-width:0}',
    '.fmj-mehead{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.fmj-hand{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;margin-top:6px;padding-top:8px}',
    '.fmj-gap{width:8px}',
    '.fmj-acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px;min-height:36px;align-items:center}',
    '.fmj-msg{font-size:13px;font-weight:700;color:#7a6a5c}',
    /* 牌 */
    '.fmj-t{--w:26px;position:relative;display:inline-block;flex:none;width:var(--w);height:calc(var(--w)*1.36);border-radius:calc(var(--w)*.14);',
    'background:linear-gradient(#fffdf6,#f3ead6);border:1px solid #cdbb98;box-shadow:0 calc(var(--w)*.08) 0 #3d9a7a;vertical-align:bottom}',
    '.fmj-t svg{position:absolute;inset:6% 6% 6% 6%;width:88%;height:88%}',
    '.fmj-t.back{background:linear-gradient(135deg,#43b08f,#2b8a6b);border-color:#1f6e55;box-shadow:0 calc(var(--w)*.08) 0 #e9dcc0}',
    '.fmj-xs{--w:12px}.fmj-s{--w:19px}.fmj-m{--w:24px}',
    '.fmj-l{--w:min(40px,calc((100vw - 64px)/9))}',
    '.fmj-hand .fmj-t{cursor:pointer;transition:transform .12s}',
    '.fmj-hand .fmj-t.sel{transform:translateY(-9px);border-color:var(--red);box-shadow:0 4px 0 var(--red)}',
    '.fmj-hand .fmj-t.new{margin-left:6px}',
    '.fmj-t.hl{outline:2px solid var(--gold);outline-offset:1px}',
    '.fmj-t.last{outline:2px solid var(--red);outline-offset:1px}',
    '.fmj-opt{display:inline-flex;align-items:center;gap:4px}',
    /* 覆蓋 */
    '.fmj-ov{position:fixed;inset:0;background:rgba(42,34,48,.55);z-index:60;display:flex;align-items:center;justify-content:center;padding:12px}',
    '.fmj-card{background:var(--paper);border-radius:16px;padding:14px;max-width:560px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.3);border:3px solid var(--gold)}',
    '.fmj-card h2{margin:0 0 6px;font-size:20px;color:var(--red);font-family:"Noto Serif TC",serif;text-align:center}',
    '.fmj-card h3{margin:10px 0 4px;font-size:15px;color:var(--teal)}',
    '.fmj-card p,.fmj-card li{font-size:13px;line-height:1.55}',
    '.fmj-card ul{padding-left:18px;margin:4px 0}',
    '.fmj-tai{width:100%;border-collapse:collapse;font-size:13px}',
    '.fmj-tai td{padding:3px 4px;border-bottom:1px dashed #ecd9b8}.fmj-tai td:last-child{text-align:right;font-weight:800}',
    '.fmj-pos{color:#2b9a5a;font-weight:900}.fmj-neg{color:var(--red);font-weight:900}',
    '.fmj-flash{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);pointer-events:none;z-index:40}',
    '.fmj-flash span{display:block;font-size:34px;font-weight:900;color:#fff;background:var(--red);border:3px solid var(--gold);border-radius:14px;padding:6px 18px;',
    'font-family:"Noto Serif TC",serif;white-space:nowrap;animation:fmjpop 1.3s ease forwards}',
    '@keyframes fmjpop{0%{opacity:0;transform:scale(.5)}15%{opacity:1;transform:scale(1.1)}30%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(1)}}',
    '@media (min-width:900px){',
    '.fmj-board{grid-template-columns:190px minmax(0,1fr) 190px;grid-template-areas:"left top right" "left river right" "me me me"}',
    '.fmj-river{min-height:300px;grid-template-columns:minmax(0,1fr) 170px minmax(0,1fr)}',
    '.fmj-s{--w:26px}.fmj-xs{--w:16px}.fmj-m{--w:30px}.fmj-l{--w:48px}',
    '.fmj-opp{justify-content:flex-start;padding:8px}',
    '.fmj-who img,.fmj-who svg,.fmj-av{width:40px;height:40px}',
    '.fmj-nm{font-size:15px}.fmj-title{font-size:18px}',
    '.fmj-hand{flex-wrap:nowrap}',
    '}'
  ].join('\n');

  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('fmj-style')) return;
    var st = document.createElement('style'); st.id = 'fmj-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }

  var DOTS = {
    1: [[15, 20]], 2: [[15, 10], [15, 30]], 3: [[8, 8], [15, 20], [22, 32]],
    4: [[9, 10], [21, 10], [9, 30], [21, 30]], 5: [[9, 9], [21, 9], [15, 20], [9, 31], [21, 31]],
    6: [[9, 8], [21, 8], [9, 20], [21, 20], [9, 32], [21, 32]],
    7: [[7, 6], [15, 11], [23, 16], [9, 25], [21, 25], [9, 34], [21, 34]],
    8: [[9, 5.5], [21, 5.5], [9, 15], [21, 15], [9, 25], [21, 25], [9, 34.5], [21, 34.5]],
    9: [[7, 7], [15, 7], [23, 7], [7, 20], [15, 20], [23, 20], [7, 33], [15, 33], [23, 33]]
  };
  var STICKS = {
    2: [[15, 10], [15, 30]], 3: [[15, 10], [9, 30], [21, 30]], 4: [[9, 10], [21, 10], [9, 30], [21, 30]],
    5: [[8, 10], [22, 10], [15, 20], [8, 30], [22, 30]], 6: [[7, 10], [15, 10], [23, 10], [7, 30], [15, 30], [23, 30]],
    7: [[15, 7], [7, 20], [15, 20], [23, 20], [7, 33], [15, 33], [23, 33]],
    8: [[6, 10], [12, 10], [18, 10], [24, 10], [6, 30], [12, 30], [18, 30], [24, 30]],
    9: [[7, 7], [15, 7], [23, 7], [7, 20], [15, 20], [23, 20], [7, 33], [15, 33], [23, 33]]
  };
  var faceCache = {};
  function face(t) {
    if (faceCache[t]) return faceCache[t];
    var b = '<svg viewBox="0 0 30 40" aria-hidden="true">', e = '</svg>', inner = '';
    var serif = 'font-family="Noto Serif TC,serif" font-weight="900" text-anchor="middle"';
    if (t < 9) {
      inner = '<text x="15" y="16" font-size="15" fill="#2A2230" ' + serif + '>' + NUM[t] + '</text>' +
        '<text x="15" y="36" font-size="16" fill="#D2302B" ' + serif + '>萬</text>';
    } else if (t < 18) {
      var n = t - 8;
      if (n === 1) inner = '<circle cx="15" cy="20" r="11" fill="#fff" stroke="#2c6fb3" stroke-width="2.4"/><circle cx="15" cy="20" r="6.5" fill="#D2302B"/><circle cx="15" cy="20" r="2.5" fill="#fff"/>';
      else {
        var r = n <= 4 ? 5.2 : n <= 6 ? 4.6 : 3.9;
        DOTS[n].forEach(function (p, i) {
          var col = (n === 5 && i === 2) || (n === 7 && i < 3) || (n === 9 && i >= 3 && i < 6) || (n === 3 && i === 1) || (n === 6 && i >= 2) ? '#D2302B' : (i % 2 ? '#1E8A4C' : '#2c6fb3');
          if (n === 2 || n === 4 || n === 8) col = i % 2 ? '#1E8A4C' : '#2c6fb3';
          inner += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="#fff" stroke="' + col + '" stroke-width="1.6"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r * 0.45) + '" fill="' + col + '"/>';
        });
      }
    } else if (t < 27) {
      var m = t - 17;
      if (m === 1) {
        inner = '<ellipse cx="15" cy="24" rx="7" ry="10" fill="#1E8A4C"/><path d="M15 30 L8 38 M15 30 L22 38 M15 30 L15 38" stroke="#1E8A4C" stroke-width="2"/>' +
          '<circle cx="15" cy="10" r="4.5" fill="#D2302B"/><path d="M18.5 10 L23 11.5 L18.5 13" fill="#F2B33D"/><circle cx="14" cy="9" r="1" fill="#fff"/><ellipse cx="15" cy="24" rx="3" ry="5" fill="#9ad3a8"/>';
      } else {
        STICKS[m].forEach(function (p, i) {
          var red = (m === 5 && i === 2) || (m === 7 && i === 0) || (m === 9 && i >= 3 && i < 6);
          var col = red ? '#D2302B' : '#1E8A4C';
          var w = m === 8 ? 3.6 : 4.2;
          inner += '<rect x="' + (p[0] - w / 2) + '" y="' + (p[1] - 5.6) + '" width="' + w + '" height="11.2" rx="1.6" fill="' + col + '"/>' +
            '<rect x="' + (p[0] - w / 2) + '" y="' + (p[1] - 0.5) + '" width="' + w + '" height="1" fill="#fff" opacity=".8"/>';
        });
      }
    } else if (t < 34) {
      if (t === 33) inner = '<rect x="6" y="7" width="18" height="26" rx="2" fill="none" stroke="#2c6fb3" stroke-width="2.4"/><rect x="9" y="10" width="12" height="20" rx="1" fill="none" stroke="#2c6fb3" stroke-width="1"/>';
      else {
        var colh = t === 31 ? '#D2302B' : t === 32 ? '#1E8A4C' : '#23305E';
        inner = '<text x="15" y="29" font-size="24" fill="' + colh + '" ' + serif + '>' + HONOR[t - 27] + '</text>';
      }
    } else {
      var f = t - 34, fc = ['#E8453C', '#E07A1F', '#2c6fb3', '#7a4bb3', '#D2306B', '#2BA6A0', '#1E8A4C', '#C99A12'][f];
      inner = '<text x="5.5" y="9" font-size="8" fill="' + (f < 4 ? '#D2302B' : '#2c6fb3') + '" font-weight="900" text-anchor="middle">' + (f % 4 + 1) + '</text>' +
        '<circle cx="15" cy="22" r="11" fill="' + fc + '" opacity=".14"/>' +
        '<text x="15" y="30" font-size="20" fill="' + fc + '" ' + serif + '>' + FLOWER[f] + '</text>';
    }
    return (faceCache[t] = b + inner + e);
  }
  function tileH(t, size, cls, attrs) {
    return '<div class="fmj-t ' + size + (cls ? ' ' + cls : '') + '" title="' + tname(t) + '"' + (attrs || '') + '>' + face(t) + '</div>';
  }
  function backH(size) { return '<div class="fmj-t back ' + size + '"></div>'; }
  function meldH(m, size) {
    var ts = meldTiles(m), h = '<span class="fmj-meld">';
    ts.forEach(function (t, i) {
      if (m.t === 'ankong' && (i === 0 || i === 3)) h += backH(size);
      else h += tileH(t, size, m.t === 'chi' && t === m.tile ? 'hl' : '');
    });
    return h + '</span>';
  }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function avatarH(s, seat, px) {
    var ch = (s.seats[seat] || {}).ch;
    var a = '';
    try { if (typeof FX !== 'undefined' && FX.avatar) a = FX.avatar(ch, px); } catch (e) { a = ''; }
    var col = (typeof FX !== 'undefined' && FX.color && FX.color[ch]) || '#999';
    return '<span class="fmj-av" style="background:' + col + '22;border:2px solid ' + col + '">' + (a || '') + '</span>';
  }
  function windBadge(s, seat) {
    var w = seatWindIdx(s, seat);
    return '<span class="fmj-badge' + (w === 0 ? ' dl' : '') + '">' + WIND[w] + (w === 0 ? '莊' : '') + '</span>';
  }

  function oppH(s, seat, pos) {
    var turn = (s.phase === 'play' && s.turn === seat) || (s.phase === 'claim' && s.claim.opts[seat] && !s.claim.resp[seat]);
    var h = '<div class="fmj-opp fmj-pos-' + pos + (turn ? ' turn' : '') + '">';
    h += '<div class="fmj-who">' + avatarH(s, seat, 40) + '<span class="fmj-nm">' + esc(chName(s, seat)) + '</span></div>';
    h += '<div>' + windBadge(s, seat) + ' <span class="fmj-pts">' + s.points[seat] + '</span></div>';
    h += '<div class="fmj-backs">' + backH('fmj-xs') + '×' + s.hands[seat].length + '</div>';
    if (s.melds[seat].length) h += '<div class="fmj-row">' + s.melds[seat].map(function (m) { return meldH(m, 'fmj-xs'); }).join('') + '</div>';
    if (s.flowers[seat].length) h += '<div class="fmj-row">' + s.flowers[seat].map(function (f) { return tileH(f, 'fmj-xs'); }).join('') + '</div>';
    return h + '</div>';
  }

  function riverH(s, seat, pos) {
    var r = s.rivers[seat], turn = s.phase === 'play' && s.turn === seat;
    var h = '<div class="fmj-rv fmj-rv-' + pos + (turn ? ' turn' : '') + '">';
    r.forEach(function (t, i) {
      var last = s.phase === 'claim' && s.claim.kind === 'discard' && s.claim.from === seat && i === r.length - 1;
      var lastD = s.lastDisc && s.lastDisc.seat === seat && i === r.length - 1;
      h += tileH(t, 'fmj-s', last || lastD ? 'last' : '');
    });
    return h + '</div>';
  }

  var RULES = '<h2>台灣十六張麻將・規則說明</h2>' +
    '<h3>基本</h3><ul><li>144 張：萬筒條各 1–9 ×4、東南西北中發白 ×4、花牌 8 張（春夏秋冬梅蘭竹菊）。</li>' +
    '<li>每人 16 張，莊家 17 張先打。摸到花牌立刻亮出並從牌尾補牌（補花）。</li>' +
    '<li>輪流順序：座位 0→1→2→3（逆時針）。輪到你時自動摸牌，點一張牌選取，再點一次（或按「打出」）出牌。</li>' +
    '<li>胡牌：5 組（順子/刻子/槓）＋ 1 對眼，共 17 張（含吃碰槓的牌）。</li>' +
    '<li>別人打牌後可以 胡 ＞ 碰/槓 ＞ 吃（吃只能吃上家）。一炮多響時由出牌者下家順序最先者胡（截胡）。</li>' +
    '<li>暗槓、明槓、加槓後從牌尾補一張。別人加槓的那張可以「搶槓」胡。</li>' +
    '<li>留牌 16 張：牌牆剩 16 張時就摸不了 → 流局。最後一張打出時只能胡，不能吃碰槓。</li></ul>' +
    '<h3>一圈・積分賽</h3><ul><li>東風圈打一圈：莊家依序 第1→2→3→4 位；莊家胡牌或流局 → 連莊。整場最多 8 局。</li>' +
    '<li>每人起始 1000 分。底 100、每台 20。放槍者付「100＋20×台」；自摸三家都付。</li>' +
    '<li>莊家台：莊家胡牌，或付錢的人是莊家時，多算 莊家 1 台＋連莊 n 拉 n（2n 台）。</li></ul>' +
    '<h3>台數</h3><ul>' +
    '<li>自摸 1、門清 1、門清自摸（不求人）3、全求人 2、平胡 2（無字無花、五組順子、胡別人、非獨聽）</li>' +
    '<li>碰碰胡 4、混一色 4、清一色 8、字一色 16</li>' +
    '<li>中/發/白 刻子 各 1、小三元 4、大三元 8</li>' +
    '<li>圈風刻（東）1、門風刻 1、小四喜 8、大四喜 16</li>' +
    '<li>本位花 每張 1、春夏秋冬或梅蘭竹菊 一套 2</li>' +
    '<li>海底撈月 1、河底撈魚 1、槓上開花 1、搶槓 1、獨聽（邊張/中洞/單吊）1</li>' +
    '<li>天胡 24、地胡 16</li></ul>' +
    '<p>花位：東家＝春/梅、南家＝夏/蘭、西家＝秋/竹、北家＝冬/菊。</p>';

  function endH(s, mySeat) {
    var e = s.end, h = '<div class="fmj-ov"><div class="fmj-card">';
    if (e.type === 'win') {
      var w = e.winner;
      h += '<h2>' + esc(chName(s, w)) + (e.tsumo ? ' 自摸！' : e.rob ? ' 搶槓胡！' : ' 胡牌！') + '</h2>';
      h += '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:6px">' + avatarH(s, w, 48) +
        '<span style="font-size:13px">' + (e.tsumo ? '自摸 ' : '胡 ' + esc(chName(s, e.from)) + ' 打的 ') + '<b>' + tname(e.tile) + '</b></span></div>';
      var hand = e.hand.slice(); removeOne(hand, e.tile);
      h += '<div class="fmj-row" style="margin:6px 0">' + hand.map(function (t) { return tileH(t, 'fmj-m'); }).join('') +
        '<span style="width:6px"></span>' + tileH(e.tile, 'fmj-m', 'last') + '</div>';
      if (e.melds.length || e.flowers.length) h += '<div class="fmj-row" style="margin-bottom:6px">' + e.melds.map(function (m) { return meldH(m, 'fmj-s'); }).join('') +
        e.flowers.map(function (f) { return tileH(f, 'fmj-s'); }).join('') + '</div>';
      h += '<h3>台數明細</h3><table class="fmj-tai">';
      if (!e.lines.length) h += '<tr><td>（無台・只算底）</td><td>0 台</td></tr>';
      e.lines.forEach(function (l) { h += '<tr><td>' + esc(l[0]) + '</td><td>' + l[1] + ' 台</td></tr>'; });
      if (e.dealerApplies !== 'none') e.dealerLines.forEach(function (l) {
        h += '<tr><td>' + esc(l[0]) + (e.dealerApplies === 'dealer' ? '（只算莊家付的）' : '') + '</td><td>' + l[1] + ' 台</td></tr>';
      });
      h += '<tr><td><b>牌型合計</b></td><td>' + e.total + ' 台</td></tr></table>';
      h += '<p style="margin:4px 0;font-size:12px;color:#7a6a5c">每家付款＝底 100 ＋ 20 × 台數（含莊家台）</p>';
    } else {
      h += '<h2>流局</h2><p style="text-align:center">牌摸完了（留 16 張）。莊家 ' + esc(chName(s, e.dealer)) + ' 連莊！</p>';
    }
    h += '<h3>分數</h3><table class="fmj-tai">';
    for (var p = 0; p < 4; p++) {
      var d = e.delta[p], payInfo = e.pay && e.pay[p] ? '（' + e.pay[p].tai + ' 台）' : '';
      h += '<tr><td>' + esc(chName(s, p)) + (p === e.dealer ? ' <span class="fmj-badge dl">莊</span>' : '') + ' ' + payInfo + '</td><td><span class="' +
        (d > 0 ? 'fmj-pos' : d < 0 ? 'fmj-neg' : '') + '">' + (d > 0 ? '+' : '') + d + '</span> → ' + e.points[p] + '</td></tr>';
    }
    h += '</table>';
    var notReady = [0, 1, 2, 3].filter(function (q) { return !s.ready[q]; });
    h += '<div class="fmj-acts">';
    if (mySeat >= 0 && !s.ready[mySeat]) h += '<button class="fmj-btn red" data-act="next">' + (e.final ? '看最終結果' : '下一局') + '</button>';
    else h += '<span class="fmj-msg">等待 ' + notReady.map(function (q) { return esc(chName(s, q)); }).join('、') + ' 按下一局…</span>';
    h += '</div>';
    if (e.final) h += '<p style="text-align:center;font-size:12px;color:#7a6a5c">這是最後一局了！</p>';
    return h + '</div></div>';
  }

  function render(root, s, mySeat, send, ev) {
    if (!root || !s) return;
    injectCSS();
    var ui = root.__fmj;
    if (!ui) {
      ui = root.__fmj = { sel: -1, selK: null, rules: false };
      root.innerHTML = '<div class="fmj-root"><div class="fmj-main"></div><div class="fmj-flashbox"></div></div>';
      root.addEventListener('click', function (e) {
        var el = e.target.closest ? e.target.closest('[data-act]') : null;
        if (!el || !root.contains(el)) return;
        handleClick(root, el);
      });
    }
    ui.s = s; ui.my = mySeat; ui.send = send;
    draw(root);
    if (ev && ev.length) {
      var toast = null;
      ev.forEach(function (x) { if (x && x.toast && /(碰|槓|吃|胡|自摸|流局)！$/.test(x.toast)) toast = x.toast; });
      if (toast) {
        var fb = root.querySelector('.fmj-flashbox');
        var word = toast.replace(/^.* /, '');
        fb.innerHTML = '<div class="fmj-flash"><span>' + esc(word) + '</span></div>';
        clearTimeout(ui.ft); ui.ft = setTimeout(function () { fb.innerHTML = ''; }, 1400);
      }
    }
  }

  function myDisplay(s, me) {
    var h = s.hands[me].slice(), d = s.drawn[me];
    var hasNew = d !== null && d !== undefined && h.length % 3 === 2 && h.indexOf(d) >= 0;
    if (hasNew) removeOne(h, d);
    var list = sortTiles(h);
    if (hasNew) list.push(d);
    return { list: list, hasNew: hasNew };
  }

  function draw(root) {
    var ui = root.__fmj, s = ui.s, my = ui.my;
    var me = my >= 0 && my < 4 ? my : 0, spect = !(my >= 0 && my < 4);
    var posSeat = { bottom: me, right: (me + 1) % 4, top: (me + 2) % 4, left: (me + 3) % 4 };
    var h = '';
    h += '<div class="fmj-top"><span class="fmj-title">台灣十六張麻將</span>' +
      '<span class="fmj-chip">東風圈 第 ' + Math.min(s.handsPlayed + (s.phase === 'end' || s.phase === 'over' ? 0 : 1), MAX_HANDS) + ' 局</span>' +
      '<button class="fmj-btn gold sm" data-act="rules">規則說明</button></div>';
    h += '<div class="fmj-board">';
    h += oppH(s, posSeat.left, 'left') + oppH(s, posSeat.top, 'top') + oppH(s, posSeat.right, 'right');
    // 河
    var dl = s.phase === 'end' && s.end ? s.end.dealer : s.dealer, st = s.phase === 'end' && s.end ? s.end.streak : s.streak;
    h += '<div class="fmj-river">' + riverH(s, posSeat.top, 'top') + riverH(s, posSeat.left, 'left') +
      '<div class="fmj-info"><b>東風圈</b><div>莊家：' + esc(chName(s, dl)) + (st > 0 ? '（連' + st + '）' : '') + '</div>' +
      '<div>剩餘牌</div><div class="fmj-wall">' + live(s) + '</div>' +
      '<div style="font-size:11px;color:#7a6a5c">底 100・每台 20</div></div>' +
      riverH(s, posSeat.right, 'right') + riverH(s, posSeat.bottom, 'bottom') + '</div>';
    // 我
    var myTurn = !spect && s.phase === 'play' && s.turn === me;
    h += '<div class="fmj-me' + ((s.phase === 'play' && s.turn === me) ? ' turn' : '') + '">';
    h += '<div class="fmj-mehead"><span class="fmj-who">' + avatarH(s, me, 40) + '<span class="fmj-nm">' + esc(chName(s, me)) + (spect ? '' : '（我）') + '</span></span>' +
      windBadge(s, me) + '<span class="fmj-pts">' + s.points[me] + ' 分</span>';
    if (s.melds[me].length || s.flowers[me].length) h += '<span class="fmj-row" style="justify-content:flex-start">' + s.melds[me].map(function (m) { return meldH(m, 'fmj-s'); }).join('') +
      s.flowers[me].map(function (f) { return tileH(f, 'fmj-s'); }).join('') + '</span>';
    h += '</div>';
    var disp = myDisplay(s, me);
    if (ui.sel >= 0 && (disp.list[ui.sel] !== ui.selK || !myTurn)) { ui.sel = -1; ui.selK = null; }
    h += '<div class="fmj-hand">';
    if (spect) h += s.hands[me].map(function () { return backH('fmj-l'); }).join('');
    else disp.list.forEach(function (t, i) {
      var cls = (i === ui.sel ? 'sel' : '') + (disp.hasNew && i === disp.list.length - 1 ? ' new' : '');
      h += tileH(t, 'fmj-l', cls, ' data-act="tile" data-i="' + i + '"');
    });
    h += '</div><div class="fmj-acts">';
    if (!spect) {
      if (myTurn && s.hands[me].length % 3 === 2) {
        var to = turnOptions(s, me);
        if (to.tsumo) h += '<button class="fmj-btn red" data-act="tsumo">自摸！</button>';
        to.ankong.forEach(function (k) { h += '<button class="fmj-btn" data-act="ankong" data-k="' + k + '"><span class="fmj-opt">暗槓 ' + tileH(k, 'fmj-xs') + '</span></button>'; });
        to.kakan.forEach(function (k) { h += '<button class="fmj-btn" data-act="kakan" data-k="' + k + '"><span class="fmj-opt">加槓 ' + tileH(k, 'fmj-xs') + '</span></button>'; });
        if (ui.sel >= 0) h += '<button class="fmj-btn gold" data-act="discard">打出 ' + tname(disp.list[ui.sel]) + '</button>';
        else h += '<span class="fmj-msg">輪到你了！點牌選取，再點一次打出。</span>';
      } else if (s.phase === 'claim' && s.claim.opts[me] && !s.claim.resp[me]) {
        var c = s.claim;
        h += '<span class="fmj-msg fmj-opt">' + esc(chName(s, c.from)) + (c.kind === 'rob' ? ' 加槓 ' : ' 打出 ') + tileH(c.tile, 'fmj-s') + '</span>';
        c.opts[me].forEach(function (o, i) {
          var lab = o.type === 'ron' ? (c.kind === 'rob' ? '搶槓胡！' : '胡！') : o.type === 'pong' ? '碰' : o.type === 'kong' ? '槓' : '吃';
          var extra = o.type === 'chi' ? ' ' + sortTiles([o.use[0], o.use[1], c.tile]).map(function (t) { return tileH(t, 'fmj-xs', t === c.tile ? 'hl' : ''); }).join('') : '';
          h += '<button class="fmj-btn' + (o.type === 'ron' ? ' red' : '') + '" data-act="claim" data-i="' + i + '"><span class="fmj-opt">' + lab + extra + '</span></button>';
        });
        h += '<button class="fmj-btn gray" data-act="pass">過</button>';
      } else if (s.phase === 'claim' && s.claim.opts[me]) {
        h += '<span class="fmj-msg">等待其他玩家…</span>';
      } else if (s.phase === 'play') {
        h += '<span class="fmj-msg">' + esc(chName(s, s.turn)) + ' 思考中…</span>';
      } else if (s.phase === 'claim') {
        h += '<span class="fmj-msg">等待其他玩家宣告…</span>';
      }
    }
    h += '</div></div></div>';
    if (s.phase === 'end' && s.end) h += endH(s, my);
    if (s.phase === 'over') {
      var r = result(s);
      h += '<div class="fmj-ov"><div class="fmj-card"><h2>一圈結束！</h2><table class="fmj-tai">' +
        r.rank.map(function (p, i) { return '<tr><td>第 ' + (i + 1) + ' 名 ' + esc(chName(s, p)) + '</td><td>' + s.points[p] + ' 分</td></tr>'; }).join('') + '</table></div></div>';
    }
    if (ui.rules) h += '<div class="fmj-ov" data-act="closerules"><div class="fmj-card">' + RULES +
      '<div class="fmj-acts"><button class="fmj-btn" data-act="closerules">知道了</button></div></div></div>';
    root.querySelector('.fmj-main').innerHTML = h;
  }

  function handleClick(root, el) {
    var ui = root.__fmj, s = ui.s, my = ui.my, act = el.getAttribute('data-act');
    var send = ui.send || function () {};
    if (act === 'rules') { ui.rules = true; draw(root); return; }
    if (act === 'closerules') { ui.rules = false; draw(root); return; }
    if (!(my >= 0 && my < 4)) return;
    if (act === 'tile') {
      if (!(s.phase === 'play' && s.turn === my && s.hands[my].length % 3 === 2)) return;
      var i = +el.getAttribute('data-i'), list = myDisplay(s, my).list;
      if (ui.sel === i) { ui.sel = -1; ui.selK = null; send({ type: 'discard', tile: list[i] }); }
      else { ui.sel = i; ui.selK = list[i]; draw(root); }
    } else if (act === 'discard') {
      if (ui.sel < 0) return;
      var k = myDisplay(s, my).list[ui.sel]; ui.sel = -1; ui.selK = null;
      send({ type: 'discard', tile: k });
    } else if (act === 'tsumo') send({ type: 'tsumo' });
    else if (act === 'ankong') send({ type: 'ankong', tile: +el.getAttribute('data-k') });
    else if (act === 'kakan') send({ type: 'kakan', tile: +el.getAttribute('data-k') });
    else if (act === 'pass') send({ type: 'pass' });
    else if (act === 'claim') {
      var o = s.claim && s.claim.opts[my] && s.claim.opts[my][+el.getAttribute('data-i')];
      if (o) send(o.type === 'chi' ? { type: 'chi', use: o.use.slice() } : { type: o.type });
    } else if (act === 'next') send({ type: 'next' });
  }

  var mod = {
    title: '台灣十六張麻將',
    init: init, act: act, bot: bot, waiting: waiting, render: render, result: result,
    _t: { isWinningHand: isWinningHand, decomps: decomps, waitsOf: waitsOf, calcTai: calcTai, counts: counts, tname: tname, meldTiles: meldTiles, turnOptions: turnOptions }
  };
  if (typeof FINALE !== 'undefined' && FINALE && FINALE.register) FINALE.register('mahjong', mod);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})();
