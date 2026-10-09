/* 越南公主 — 最終小遊戲：撲克牌大會（cards）
 * 三人依序三局：大老二 → 撿紅點 → 抽鬼牌，每局 5/3/1 分，三局累計排名。
 * classic script；載入後 FINALE.register('cards', mod)。
 */
(function () {
  'use strict';

  var NAMES = { zn: '甄妮', xy: '小羽', jz: '俊治', by: '博育' };
  var SUITS = ['♣', '♦', '♥', '♠'];
  var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  var JOKER = 52;
  var CLUB3 = 8; // rank idx 2 (3) * 4 + suit 0 (♣)
  var SPADE_A = 3;
  var GAMES = [{ id: 'big2', name: '大老二' }, { id: 'hong', name: '撿紅點' }, { id: 'maid', name: '抽鬼牌' }];
  var PTS = [5, 3, 1];
  var PLACE = ['第一', '第二', '第三'];
  var CN_NUM = ['一', '二', '三'];

  /* ---------- card helpers ---------- */
  function rk(c) { return c >> 2; }            // 0=A,1=2,...,12=K
  function st(c) { return c & 3; }             // 0♣ 1♦ 2♥ 3♠
  function bigR(c) { return (rk(c) + 11) % 13; } // 3=0 ... K=10, A=11, 2=12
  function bigV(c) { return bigR(c) * 4 + st(c); }
  function isRed(c) { return c !== JOKER && (st(c) === 1 || st(c) === 2); }
  function cardName(c) { return c === JOKER ? '鬼牌' : SUITS[st(c)] + RANKS[rk(c)]; }

  /* ---------- PRNG (mulberry32, state stored in s.rs) ---------- */
  function rnd(s) {
    s.rs = (s.rs + 0x6D2B79F5) | 0;
    var t = s.rs;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(s, a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd(s) * (i + 1));
      var x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  // pure pseudo-random for bots (must not mutate state)
  function prand(s, seat, salt) {
    var h = (s.seed ^ Math.imul(s.moves + 1, 2654435761) ^ Math.imul(seat + 7, 40503) ^ Math.imul((salt || 0) + 3, 97)) | 0;
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function nm(s, seat) {
    var se = s.seats[seat];
    return (se && (NAMES[se.ch] || se.name)) || ('玩家' + (seat + 1));
  }
  function chOf(s, seat) { return s.seats[seat] && s.seats[seat].ch; }
  function seated(s, ch) { return s.seats.some(function (x) { return x.ch === ch; }); }
  function q(s, ev, ch, text, zh) {
    if (ch !== 'by' && !seated(s, ch)) return;
    ev.push({ q: zh ? [ch, text, zh] : [ch, text] });
  }

  /* =================================================================
   * 大老二 combos
   * ================================================================= */
  // straight windows in natural rank idx; index = tier (higher beats lower)
  var WIN = [[2, 3, 4, 5, 6], [3, 4, 5, 6, 7], [4, 5, 6, 7, 8], [5, 6, 7, 8, 9], [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11], [8, 9, 10, 11, 12], [9, 10, 11, 12, 0], [0, 1, 2, 3, 4], [1, 2, 3, 4, 5]];
  function topRank(t) { return t >= 8 ? 1 : WIN[t][4]; } // A2345 / 23456 : the 2 is the top card
  var CLS = { single: 0, pair: 0, straight: 1, full: 2, four: 3, sf: 4 };
  var CNAME = { single: '單張', pair: '對子', straight: '順子', full: '葫蘆', four: '鐵支', sf: '同花順' };

  function detect(cards) {
    if (!cards || !cards.length) return null;
    var n = cards.length, i;
    for (i = 0; i < n; i++) if (typeof cards[i] !== 'number' || cards[i] < 0 || cards[i] > 51) return null;
    if (n === 1) return { type: 'single', n: 1, key: bigV(cards[0]) };
    if (n === 2) {
      if (rk(cards[0]) !== rk(cards[1]) || cards[0] === cards[1]) return null;
      return { type: 'pair', n: 2, key: Math.max(bigV(cards[0]), bigV(cards[1])) };
    }
    if (n !== 5) return null;
    var cnt = {};
    for (i = 0; i < 5; i++) cnt[rk(cards[i])] = (cnt[rk(cards[i])] || 0) + 1;
    var ranks = Object.keys(cnt).map(Number);
    if (ranks.length === 2) {
      var a = ranks[0], b = ranks[1];
      if (cnt[a] === 4 || cnt[b] === 4) {
        var qr = cnt[a] === 4 ? a : b;
        return { type: 'four', n: 5, key: (qr + 11) % 13 };
      }
      var tr = cnt[a] === 3 ? a : b;
      return { type: 'full', n: 5, key: (tr + 11) % 13 };
    }
    if (ranks.length !== 5) return null;
    for (var t = 0; t < WIN.length; t++) {
      var w = WIN[t], ok = true;
      for (i = 0; i < 5; i++) if (!cnt[w[i]]) { ok = false; break; }
      if (!ok) continue;
      var top = -1, flush = true;
      for (i = 0; i < 5; i++) {
        if (rk(cards[i]) === topRank(t)) top = cards[i];
        if (st(cards[i]) !== st(cards[0])) flush = false;
      }
      return { type: flush ? 'sf' : 'straight', n: 5, key: t * 4 + st(top) };
    }
    return null;
  }

  // does combo a beat combo b (b = what's on the table, null = free lead)
  function beats(a, b) {
    if (!a) return false;
    if (!b) return true;
    if (a.type === 'sf') return b.type !== 'sf' || a.key > b.key;
    if (a.type === 'four') {
      if (b.type === 'sf') return false;
      if (b.type === 'four') return a.key > b.key;
      return true;
    }
    if (b.type === 'four' || b.type === 'sf') return false;
    if (a.n !== b.n) return false;
    if (a.n === 5) {
      if (CLS[a.type] !== CLS[b.type]) return CLS[a.type] > CLS[b.type];
      return a.key > b.key;
    }
    return a.type === b.type && a.key > b.key;
  }

  function byBig(a, b) { return bigV(a) - bigV(b); }

  // candidate combos for the bot (not exhaustive, but covers lowest options)
  function genCombos(hand) {
    var out = [], byRank = {}, i, j;
    hand.forEach(function (c) { (byRank[rk(c)] = byRank[rk(c)] || []).push(c); });
    Object.keys(byRank).forEach(function (r) { byRank[r].sort(byBig); });
    function add(cards) { var c = detect(cards); if (c) out.push({ cards: cards.slice(), combo: c }); }
    hand.forEach(function (c) { add([c]); });
    Object.keys(byRank).forEach(function (r) {
      var g = byRank[r];
      for (i = 0; i < g.length; i++) for (j = i + 1; j < g.length; j++) add([g[i], g[j]]);
    });
    WIN.forEach(function (w, t) {
      for (i = 0; i < 5; i++) if (!byRank[w[i]]) return;
      var tr = topRank(t);
      var base = w.filter(function (r) { return r !== tr; }).map(function (r) { return byRank[r][0]; });
      byRank[tr].forEach(function (tc) { add(base.concat([tc])); });
      for (var su = 0; su < 4; su++) {
        var f = [];
        for (i = 0; i < 5; i++) {
          var m = byRank[w[i]].filter(function (c) { return st(c) === su; });
          if (!m.length) break;
          f.push(m[0]);
        }
        if (f.length === 5) add(f);
      }
    });
    var rks = Object.keys(byRank).map(Number);
    rks.forEach(function (r) {
      var g = byRank[r];
      if (g.length >= 3) {
        rks.forEach(function (p) {
          if (p !== r && byRank[p].length >= 2) add(g.slice(0, 3).concat(byRank[p].slice(0, 2)));
        });
      }
      if (g.length === 4) {
        var others = hand.filter(function (c) { return rk(c) !== r; }).sort(byBig);
        if (others.length) add(g.concat([others[0]]));
      }
    });
    return out;
  }

  /* =================================================================
   * 撿紅點 helpers
   * ================================================================= */
  function hongMatch(a, b) {
    var ra = rk(a) + 1, rb = rk(b) + 1;
    if (ra <= 9 && rb <= 9) return ra + rb === 10;
    return ra >= 10 && ra === rb;
  }
  function hongPts(c) {
    if (c === SPADE_A) return 30;
    if (!isRed(c)) return 0;
    var r = rk(c) + 1;
    if (r === 1) return 20;
    if (r >= 10) return 10;
    return r;
  }
  function hongScore(cap) { return cap.reduce(function (t, c) { return t + hongPts(c); }, 0); }

  /* =================================================================
   * game setup
   * ================================================================= */
  function deck(n) { var d = []; for (var i = 0; i < n; i++) d.push(i); return d; }

  function startGame(s, gi) {
    var id = GAMES[gi].id, d, h, i;
    var prev = s.places[gi - 1];
    if (id === 'big2') {
      d = shuffle(s, deck(52));
      h = [d.slice(0, 17), d.slice(17, 34), d.slice(34, 51)];
      var left = d[51], holder = -1;
      for (i = 0; i < 3; i++) if (h[i].indexOf(CLUB3) >= 0) holder = i;
      if (holder < 0) { // leftover is ♣3 itself → goes to holder of ♦3
        for (i = 0; i < 3; i++) if (h[i].indexOf(CLUB3 + 1) >= 0) holder = i;
      }
      h[holder].push(left);
      h.forEach(function (x) { x.sort(byBig); });
      return { id: 'big2', hands: h, turn: holder, last: null, passes: 0, first: true, out: [], played: [], msg: '', leads: 0 };
    }
    if (id === 'hong') {
      d = shuffle(s, deck(52));
      h = [d.slice(0, 8), d.slice(8, 16), d.slice(16, 24)];
      h.forEach(function (x) { x.sort(function (a, b) { return a - b; }); });
      var start = prev ? prev[2] : 0;
      return { id: 'hong', hands: h, table: d.slice(24, 28), pile: d.slice(28), cap: [[], [], []], turn: start, stage: 'play', flip: null, msg: '', lastCap: null };
    }
    // maid
    d = shuffle(s, deck(53));
    h = [[], [], []];
    for (i = 0; i < 53; i++) h[i % 3].push(d[i]);
    var disc = [];
    h = h.map(function (hand) {
      var keep = [];
      hand.forEach(function (c) {
        var k = c === JOKER ? -1 : keep.findIndex(function (x) { return x !== JOKER && rk(x) === rk(c); });
        if (k >= 0) { disc.push(keep[k], c); keep.splice(k, 1); } else keep.push(c);
      });
      return shuffle(s, keep);
    });
    var g = { id: 'maid', hands: h, turn: 0, out: [], disc: disc, msg: '', lastDraw: null };
    for (i = 0; i < 3; i++) if (!h[i].length) g.out.push(i);
    var st0 = prev ? prev[2] : 0;
    g.turn = g.out.indexOf(st0) < 0 ? st0 : nextActive(g, st0);
    return g;
  }

  function nextActive(g, seat) {
    for (var i = 1; i <= 3; i++) {
      var x = (seat + i) % 3;
      if (g.out.indexOf(x) < 0) return x;
    }
    return seat;
  }

  /* =================================================================
   * init / act
   * ================================================================= */
  function init(opt) {
    var seats = (opt && opt.seats) || [];
    var seed = (opt && opt.seed) | 0;
    var ss = [];
    for (var i = 0; i < 3; i++) {
      var x = seats.filter(function (y) { return y.seat === i; })[0] || seats[i] || { seat: i, ch: ['zn', 'xy', 'jz'][i], name: '', bot: true };
      ss.push({ seat: i, ch: x.ch, name: x.name || '', bot: !!x.bot });
    }
    var s = {
      seed: seed, rs: seed || 1, seats: ss, gi: 0, phase: 'play', totals: [0, 0, 0], places: [],
      ready: [false, false, false], intro: false, moves: 0, g: null
    };
    s.g = startGame(s, 0);
    return s;
  }

  function fail(msg) { return { ok: false, msg: msg }; }

  function act(state, seat, action) {
    if (!state || !action || typeof action !== 'object') return fail('無效的動作');
    var s;
    try { s = JSON.parse(JSON.stringify(state)); } catch (e) { return fail('狀態錯誤'); }
    seat = seat | 0;
    if (seat < 0 || seat > 2) return fail('你不是玩家');
    var ev = [], r;
    if (s.phase === 'done') return fail('比賽已經結束');
    if (s.phase === 'inter') {
      if (action.type !== 'next') return fail('請按「下一局」');
      r = actNext(s, seat, ev);
    } else {
      var id = s.g.id;
      if (id === 'big2') r = actBig2(s, seat, action, ev);
      else if (id === 'hong') r = actHong(s, seat, action, ev);
      else r = actMaid(s, seat, action, ev);
    }
    if (r) return fail(r);
    s.moves++;
    if (!s.intro) {
      s.intro = true;
      var pre = [];
      q(s, pre, 'by', '三場比賽總分最高的人，就是今天的冠軍。');
      q(s, pre, 'xy', '神人之戰。');
      q(s, pre, 'jz', 'Bang之戰。');
      q(s, pre, 'zn', 'Tôi sẽ thắng!', '我會贏！');
      q(s, pre, 'xy', '她認真了。');
      q(s, pre, 'jz', '我開始害怕了。');
      ev = pre.concat(ev);
    }
    return { ok: true, state: s, ev: ev };
  }

  function endGame(s, places, ev) {
    s.places.push(places);
    places.forEach(function (seat, i) { s.totals[seat] += PTS[i]; });
    s.phase = 'inter';
    s.ready = [false, false, false];
    ev.push({ sfx: 'win' });
    var n = s.gi + 1;
    q(s, ev, 'by', '第' + CN_NUM[s.gi] + '局結束！');
    q(s, ev, 'by', GAMES[s.gi].name + '第一名是 ' + nm(s, places[0]) + '！');
    var c1 = chOf(s, places[0]), c3 = chOf(s, places[2]);
    if (c1 === 'zn') q(s, ev, 'zn', 'Tôi thắng rồi!', '我贏了！');
    else if (c1 === 'xy') q(s, ev, 'xy', '神人。');
    else if (c1 === 'jz') q(s, ev, 'jz', 'Bang!');
    if (c3 === 'jz') q(s, ev, 'jz', '完全法克。');
    else if (c3 === 'zn') q(s, ev, 'zn', 'Không thể nào!', '不可能！');
    if (n === 3) q(s, ev, 'by', '三場比賽全部結束，準備頒獎！');
  }

  function actNext(s, seat, ev) {
    if (s.ready[seat]) return null;
    s.ready[seat] = true;
    if (s.ready.every(Boolean)) {
      if (s.gi < 2) {
        s.gi++;
        s.phase = 'play';
        s.g = startGame(s, s.gi);
        ev.push({ sfx: 'shuffle' });
        q(s, ev, 'by', '第' + CN_NUM[s.gi] + '局：' + GAMES[s.gi].name + '，開始！');
        if (s.g.id === 'maid') q(s, ev, 'by', '成對的牌已經自動丟掉了。最後拿著鬼牌的人是第三名。');
      } else {
        s.phase = 'done';
        var res = result(s);
        ev.push({ sfx: 'fanfare' });
        q(s, ev, 'by', '今天的冠軍是 ' + nm(s, res.rank[0]) + '！');
        if (seated(s, 'jz')) { q(s, ev, 'jz', 'Bang!'); q(s, ev, 'by', 'Bang。'); }
      }
    }
    return null;
  }

  /* ---------- 大老二 ---------- */
  function actBig2(s, seat, a, ev) {
    var g = s.g;
    if (seat !== g.turn) return '還沒輪到你';
    if (a.type === 'pass') {
      if (!g.last) return '你是首家，必須出牌';
      g.passes++;
      ev.push({ sfx: 'click' });
      g.msg = nm(s, seat) + ' 過';
      var active = 3 - g.out.length;
      var need = active - (g.out.indexOf(g.last.seat) >= 0 ? 0 : 1);
      if (g.passes >= need) {
        var ls = g.last.seat, lc = g.last.combo;
        var lead = g.out.indexOf(ls) < 0 ? ls : nextActive(g, ls);
        if (chOf(s, ls) === 'xy' && g.out.indexOf(ls) < 0 && (lc.n === 5 || g.last.cards.some(function (c) { return rk(c) === 1; }))) q(s, ev, 'xy', '神人。');
        g.last = null; g.passes = 0; g.turn = lead;
        g.msg = '沒人壓得過，' + nm(s, lead) + ' 自由出牌';
        g.leads++;
        if (chOf(s, lead) === 'zn' && g.leads % 3 === 1) q(s, ev, 'zn', 'Đến lượt tôi!', '輪到我了！');
      } else {
        g.turn = nextActive(g, seat);
      }
      return null;
    }
    if (a.type !== 'play') return '無效的動作';
    var cards = Array.isArray(a.cards) ? a.cards.map(Number) : [];
    var hand = g.hands[seat];
    var seen = {};
    for (var i = 0; i < cards.length; i++) {
      if (seen[cards[i]] || hand.indexOf(cards[i]) < 0) return '你沒有這張牌';
      seen[cards[i]] = 1;
    }
    var combo = detect(cards);
    if (!combo) return '這不是合法的牌型';
    if (g.first && cards.indexOf(CLUB3) < 0) return '第一手必須包含梅花 3';
    if (g.last && !beats(combo, g.last.combo)) return '壓不過上一手';
    var prev = g.last;
    g.hands[seat] = hand.filter(function (c) { return !seen[c]; });
    cards.sort(byBig);
    g.played = g.played.concat(cards);
    g.last = { seat: seat, cards: cards, combo: combo };
    g.passes = 0; g.first = false;
    var desc = combo.type === 'single' ? cardName(cards[0]) : CNAME[combo.type];
    g.msg = nm(s, seat) + ' 出 ' + desc;
    ev.push({ sfx: 'card' });
    ev.push({ toast: g.msg });
    var ch = chOf(s, seat);
    if (combo.type === 'four' || combo.type === 'sf') {
      if (ch === 'jz') q(s, ev, 'jz', 'Bang!');
      else if (ch === 'xy') q(s, ev, 'xy', '神人。');
      else if (ch === 'zn') q(s, ev, 'zn', 'Hay quá!', '太讚了！');
      if (prev && chOf(s, prev.seat) === 'jz' && ch !== 'jz') q(s, ev, 'jz', '完全法克。');
    }
    if (!g.hands[seat].length) {
      g.out.push(seat);
      ev.push({ toast: nm(s, seat) + ' 出完了！第' + CN_NUM[g.out.length - 1] + '名' });
      if (g.out.length === 2) {
        var third = [0, 1, 2].filter(function (x) { return g.out.indexOf(x) < 0; })[0];
        endGame(s, [g.out[0], g.out[1], third], ev);
        return null;
      }
    }
    g.turn = nextActive(g, seat);
    return null;
  }

  /* ---------- 撿紅點 ---------- */
  function hongCapture(s, seat, card, target, ev, how) {
    var g = s.g;
    g.table.splice(g.table.indexOf(target), 1);
    g.cap[seat].push(card, target);
    var p = hongPts(card) + hongPts(target);
    var m = nm(s, seat) + how + cardName(card) + ' 吃 ' + cardName(target) + (p ? '（+' + p + '）' : '');
    g.lastCap = [card, target];
    ev.push({ toast: m });
    if (card === SPADE_A || target === SPADE_A) {
      var ch = chOf(s, seat);
      if (ch === 'xy') q(s, ev, 'xy', '神人。');
      else if (ch === 'zn') q(s, ev, 'zn', 'Hay quá!', '太讚了！');
      else if (ch === 'jz') q(s, ev, 'jz', 'Bang!');
    }
    return m;
  }
  function hongAdvance(s, ev) {
    var g = s.g;
    g.stage = 'play'; g.flip = null;
    if (!g.pile.length && g.hands.every(function (h) { return !h.length; })) {
      var sc = g.cap.map(hongScore);
      var order = [0, 1, 2].sort(function (a, b) { return sc[b] - sc[a] || a - b; });
      endGame(s, order, ev);
      return;
    }
    g.turn = (g.turn + 1) % 3;
  }
  function hongFlip(s, seat, ev) {
    var g = s.g;
    if (!g.pile.length) { hongAdvance(s, ev); return; }
    var c = g.pile.shift();
    var m = g.table.filter(function (t) { return hongMatch(c, t); });
    if (!m.length) {
      g.table.push(c);
      g.msg += '；翻出 ' + cardName(c) + '，沒吃到';
      hongAdvance(s, ev);
    } else if (m.length === 1) {
      g.msg += '；' + hongCapture(s, seat, c, m[0], ev, ' 翻出 ').replace(nm(s, seat), '').trim();
      hongAdvance(s, ev);
    } else {
      g.stage = 'flip'; g.flip = c;
      g.msg += '；翻出 ' + cardName(c) + '，請選擇要吃哪一張';
    }
  }
  function actHong(s, seat, a, ev) {
    var g = s.g;
    if (seat !== g.turn) return '還沒輪到你';
    var t;
    if (g.stage === 'flip') {
      if (a.type !== 'flip') return '請選擇翻出的牌要吃哪一張';
      t = Number(a.target);
      if (g.table.indexOf(t) < 0 || !hongMatch(g.flip, t)) return '翻出的牌吃不到那張';
      var c0 = g.flip;
      g.flip = null;
      g.msg = nm(s, seat) + ' 翻出 ' + cardName(c0) + ' 吃 ' + cardName(t);
      hongCapture(s, seat, c0, t, ev, ' 翻出 ');
      ev.push({ sfx: 'card' });
      hongAdvance(s, ev);
      return null;
    }
    if (a.type !== 'play') return '請出一張牌';
    var card = Number(a.card);
    var hand = g.hands[seat];
    if (hand.indexOf(card) < 0) return '你沒有這張牌';
    var m = g.table.filter(function (x) { return hongMatch(card, x); });
    t = a.target === undefined || a.target === null ? null : Number(a.target);
    if (t !== null && m.indexOf(t) < 0) return '這張牌吃不到那張';
    if (t === null && m.length) {
      t = m.slice().sort(function (x, y) { return hongPts(y) - hongPts(x) || x - y; })[0];
    }
    hand.splice(hand.indexOf(card), 1);
    ev.push({ sfx: 'card' });
    g.lastCap = null;
    if (t !== null) {
      g.msg = hongCapture(s, seat, card, t, ev, ' 用 ');
    } else {
      g.table.push(card);
      g.msg = nm(s, seat) + ' 打出 ' + cardName(card) + '，沒吃到';
    }
    hongFlip(s, seat, ev);
    return null;
  }

  /* ---------- 抽鬼牌 ---------- */
  function actMaid(s, seat, a, ev) {
    var g = s.g;
    if (a.type === 'shuffle') {
      if (!g.hands[seat].length) return '你已經沒有牌了';
      shuffle(s, g.hands[seat]);
      ev.push({ sfx: 'shuffle' });
      return null;
    }
    if (a.type !== 'draw') return '請抽一張牌';
    if (seat !== g.turn) return '還沒輪到你';
    var tgt = nextActive(g, seat);
    var th = g.hands[tgt];
    var idx = Number(a.idx);
    if (!(idx >= 0 && idx < th.length) || Math.floor(idx) !== idx) return '請選一張牌';
    var c = th.splice(idx, 1)[0];
    var hand = g.hands[seat];
    var k = c === JOKER ? -1 : hand.findIndex(function (x) { return x !== JOKER && rk(x) === rk(c); });
    ev.push({ sfx: 'card' });
    if (k >= 0) {
      var p = hand.splice(k, 1)[0];
      g.disc.push(p, c);
      g.msg = nm(s, seat) + ' 抽了 ' + nm(s, tgt) + ' 一張牌，湊成一對 ' + RANKS[rk(c)] + ' 丟掉';
      g.lastDraw = { seat: seat, from: tgt, card: c, pair: [p, c] };
    } else {
      hand.push(c);
      g.msg = nm(s, seat) + ' 抽了 ' + nm(s, tgt) + ' 一張牌';
      g.lastDraw = { seat: seat, from: tgt, card: c, pair: null };
    }
    if (c === JOKER) {
      var ch = chOf(s, seat);
      if (ch === 'zn') q(s, ev, 'zn', 'Ôi trời ơi!', '天啊！');
      else if (ch === 'jz') q(s, ev, 'jz', '完全法克。');
      else if (ch === 'xy') q(s, ev, 'xy', '……');
    }
    if (!th.length) { g.out.push(tgt); ev.push({ toast: nm(s, tgt) + ' 手牌清空！第' + CN_NUM[g.out.length - 1] + '名' }); }
    if (!hand.length) { g.out.push(seat); ev.push({ toast: nm(s, seat) + ' 手牌清空！第' + CN_NUM[g.out.length - 1] + '名' }); }
    if (g.out.length >= 2) {
      var third = [0, 1, 2].filter(function (x) { return g.out.indexOf(x) < 0; })[0];
      q(s, ev, 'by', '鬼牌在 ' + nm(s, third) + ' 手上！');
      endGame(s, [g.out[0], g.out[1], third], ev);
      return null;
    }
    g.turn = nextActive(g, seat);
    return null;
  }

  /* =================================================================
   * bot / waiting / result
   * ================================================================= */
  function waiting(s) {
    if (!s) return [];
    if (s.phase === 'done') return [];
    if (s.phase === 'inter') return [0, 1, 2].filter(function (i) { return !s.ready[i]; });
    return [s.g.turn];
  }

  function minCard(cards) { return Math.min.apply(null, cards.map(bigV)); }
  function has2(cards) { return cards.some(function (c) { return rk(c) === 1; }); }

  function botBig2(s, seat) {
    var g = s.g, hand = g.hands[seat];
    var cands = genCombos(hand);
    if (g.first) cands = cands.filter(function (c) { return c.cards.indexOf(CLUB3) >= 0; });
    var r = prand(s, seat, 1);
    var minOpp = 99;
    for (var i = 0; i < 3; i++) if (i !== seat && g.out.indexOf(i) < 0) minOpp = Math.min(minOpp, g.hands[i].length);
    function cost(c) { return CLS[c.combo.type] * 1000 + c.combo.key; }
    if (!g.last) {
      var pool;
      if (minOpp <= 2) {
        // opponent nearly out: dump the biggest-size, then highest combos
        pool = cands.slice().sort(function (a, b) { return b.cards.length - a.cards.length || cost(b) - cost(a); });
        if (minOpp === 1 || pool[0].cards.length > 1) return { type: 'play', cards: pool[0].cards };
      }
      pool = cands.filter(function (c) {
        if (c.combo.type === 'four' || c.combo.type === 'sf') return false;
        return c.cards.length === 1 || !has2(c.cards) || c.cards.length === hand.length;
      });
      if (!pool.length) pool = cands;
      pool.sort(function (a, b) { return minCard(a.cards) - minCard(b.cards) || b.cards.length - a.cards.length || cost(a) - cost(b); });
      return { type: 'play', cards: pool[0].cards };
    }
    var beat = cands.filter(function (c) { return beats(c.combo, g.last.combo); });
    if (!beat.length) return { type: 'pass' };
    var exact = beat.filter(function (c) { return c.cards.length === hand.length; });
    if (exact.length) return { type: 'play', cards: exact[0].cards };
    var normal = beat.filter(function (c) { return c.combo.type !== 'four' && c.combo.type !== 'sf'; }).sort(function (a, b) { return cost(a) - cost(b); });
    var pick = normal[0];
    if (!pick) {
      if (minOpp <= 4 || r < 0.3) return { type: 'play', cards: beat.sort(function (a, b) { return cost(a) - cost(b); })[0].cards };
      return { type: 'pass' };
    }
    if (has2(pick.cards) && minOpp > 5 && hand.length > 3 && r < 0.5) return { type: 'pass' };
    if (r < 0.06 && minOpp > 6) return { type: 'pass' };
    return { type: 'play', cards: pick.cards };
  }

  function botHong(s, seat) {
    var g = s.g;
    if (g.stage === 'flip') {
      var m = g.table.filter(function (t) { return hongMatch(g.flip, t); }).sort(function (a, b) { return hongPts(b) - hongPts(a); });
      return { type: 'flip', target: m[0] };
    }
    var best = null, bestV = -1e9;
    g.hands[seat].forEach(function (c) {
      g.table.forEach(function (t) {
        if (!hongMatch(c, t)) return;
        var v = hongPts(c) + hongPts(t) + 0.5;
        if (v > bestV) { bestV = v; best = { type: 'play', card: c, target: t }; }
      });
      var dv = -hongPts(c) - 0.01 * rk(c);
      if (dv > bestV) { bestV = dv; best = { type: 'play', card: c, target: null }; }
    });
    return best;
  }

  function bot(s, seat) {
    if (!s || waiting(s).indexOf(seat) < 0) return null;
    if (s.phase === 'inter') return { type: 'next' };
    var id = s.g.id;
    if (id === 'big2') return botBig2(s, seat);
    if (id === 'hong') return botHong(s, seat);
    var tgt = nextActive(s.g, seat);
    var n = s.g.hands[tgt].length;
    return { type: 'draw', idx: Math.floor(prand(s, seat, 2) * n) };
  }

  function result(s) {
    if (!s || s.phase !== 'done') return null;
    var firsts = [0, 0, 0];
    s.places.forEach(function (p) { firsts[p[0]]++; });
    var rank = [0, 1, 2].sort(function (a, b) { return s.totals[b] - s.totals[a] || firsts[b] - firsts[a] || a - b; });
    var score = {};
    [0, 1, 2].forEach(function (i) { score[i] = s.totals[i]; });
    var lines = rank.map(function (seat) {
      var parts = s.places.map(function (p, gi) { return GAMES[gi].name + ' ' + PLACE[p.indexOf(seat)]; });
      return nm(s, seat) + ' ' + s.totals[seat] + ' 分（' + parts.join('、') + '）';
    });
    return { rank: rank, score: score, lines: lines };
  }

  /* =================================================================
   * render
   * ================================================================= */
  var CSS = [
    '.fcd-root{--fcd-cream:#FFF6E8;--fcd-red:#E8453C;--fcd-teal:#2BA6A0;--fcd-ink:#2A2230;--fcd-gold:#F2B33D;--fcd-paper:#FFFDF8;',
    '--cw:44px;--ch:62px;position:relative;box-sizing:border-box;width:100%;max-width:1100px;margin:0 auto;min-height:100%;padding:8px 10px 12px;',
    'font-family:"Noto Sans TC",system-ui,sans-serif;color:var(--fcd-ink);background:var(--fcd-cream);overflow-x:hidden;display:flex;flex-direction:column;gap:8px;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}',
    '.fcd-root *{box-sizing:border-box}',
    '@media (min-width:700px){.fcd-root{--cw:60px;--ch:84px;padding:14px 20px 18px;gap:12px}}',
    '.fcd-top{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.fcd-title{font-family:"Noto Serif TC",serif;font-size:15px;line-height:1.25}',
    '.fcd-title b{display:block;font-size:18px;color:var(--fcd-red)}',
    '.fcd-steps{display:flex;gap:4px;margin-top:3px}',
    '.fcd-step{font-size:11px;padding:1px 6px;border-radius:9px;background:#f1e4cf;color:#8a7a66}',
    '.fcd-step.on{background:var(--fcd-red);color:#fff}.fcd-step.dn{background:var(--fcd-teal);color:#fff}',
    '.fcd-btn{font:inherit;font-size:14px;border:0;border-radius:999px;padding:8px 16px;background:var(--fcd-teal);color:#fff;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.15);touch-action:manipulation;min-height:38px}',
    '.fcd-btn:active{transform:translateY(1px)}',
    '.fcd-btn.red{background:var(--fcd-red)}.fcd-btn.gold{background:var(--fcd-gold);color:var(--fcd-ink)}.fcd-btn.ghost{background:var(--fcd-paper);color:var(--fcd-ink);border:1.5px solid #e2d3bb}',
    '.fcd-btn[disabled]{opacity:.4;cursor:default}',
    '.fcd-opps{display:flex;justify-content:space-between;gap:8px}',
    '.fcd-pl{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:8px;background:var(--fcd-paper);border-radius:14px;padding:6px 8px;border:2px solid transparent;box-shadow:0 1px 4px rgba(42,34,48,.08)}',
    '.fcd-pl.turn{border-color:var(--fcd-gold);box-shadow:0 0 0 3px rgba(242,179,61,.35)}',
    '.fcd-pl.r{flex-direction:row-reverse;text-align:right}',
    '.fcd-av{flex:0 0 auto;width:40px;height:40px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f3e6d2;border:2px solid var(--pc,#ccc)}',
    '.fcd-av img,.fcd-av svg{width:100%;height:100%;display:block}',
    '.fcd-info{min-width:0;font-size:12px;line-height:1.35}',
    '.fcd-nm{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fcd-tag{display:inline-block;font-size:11px;padding:0 6px;border-radius:8px;background:var(--fcd-gold);color:var(--fcd-ink);margin-left:2px}',
    '.fcd-tag.out{background:var(--fcd-teal);color:#fff}',
    '.fcd-mini{display:flex;gap:2px;margin-top:2px}.fcd-pl.r .fcd-mini{justify-content:flex-end}',
    '.fcd-mb{width:9px;height:13px;border-radius:2px;background:repeating-linear-gradient(45deg,var(--fcd-red) 0 2px,#f6a39d 2px 4px);border:1px solid #fff}',
    '.fcd-table{position:relative;flex:1 1 auto;min-height:190px;border-radius:22px;background:radial-gradient(ellipse at 50% 40%,#3bb8b1,#21857f);box-shadow:inset 0 0 0 6px rgba(255,255,255,.15),inset 0 4px 18px rgba(0,0,0,.25);padding:12px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff;text-align:center}',
    '.fcd-msg{font-size:13px;background:rgba(0,0,0,.18);padding:4px 12px;border-radius:12px;max-width:100%}',
    '.fcd-hint{font-size:13px;color:#fff;opacity:.95}',
    '.fcd-row{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:100%}',
    '.fcd-card{position:relative;flex:0 0 auto;width:var(--cw);height:var(--ch);border-radius:7px;background:#fff;border:1px solid #d9cbb5;box-shadow:0 2px 4px rgba(0,0,0,.18);color:var(--fcd-ink);font-family:"Noto Serif TC",Georgia,serif;transition:transform .12s;cursor:pointer}',
    '.fcd-card.red{color:var(--fcd-red)}',
    '.fcd-card .r{position:absolute;left:4px;top:2px;font-size:calc(var(--cw)*.33);font-weight:700;line-height:1;letter-spacing:-1px}',
    '.fcd-card .s{position:absolute;left:4px;top:calc(var(--cw)*.36);font-size:calc(var(--cw)*.27);line-height:1}',
    '.fcd-card .b{position:absolute;right:4px;bottom:3px;font-size:calc(var(--cw)*.5);line-height:1}',
    '.fcd-card.jk{background:linear-gradient(160deg,#fff,#ffe7b0);color:#7a3fa0}',
    '.fcd-card.jk .r{font-size:calc(var(--cw)*.28)}',
    '.fcd-card.sel{transform:translateY(-12px);box-shadow:0 0 0 3px var(--fcd-gold),0 6px 10px rgba(0,0,0,.25)}',
    '.fcd-card.can{box-shadow:0 0 0 3px var(--fcd-gold),0 0 14px 4px rgba(242,179,61,.8);animation:fcdpulse 1s infinite alternate}',
    '.fcd-card.new{box-shadow:0 0 0 3px #ff9bb8,0 2px 4px rgba(0,0,0,.2)}',
    '.fcd-card.sm{--cw:34px;--ch:48px}',
    '@media (min-width:700px){.fcd-card.sm{--cw:46px;--ch:64px}}',
    '@keyframes fcdpulse{to{transform:translateY(-4px)}}',
    '.fcd-back{flex:0 0 auto;width:34px;height:48px;border-radius:6px;border:2px solid #fff;background:repeating-linear-gradient(45deg,var(--fcd-red) 0 4px,#f6a39d 4px 8px);box-shadow:0 2px 4px rgba(0,0,0,.2);cursor:default;padding:0}',
    '.fcd-back.pick{cursor:pointer}.fcd-back.pick:hover,.fcd-back.pick:active{transform:translateY(-6px);box-shadow:0 0 0 3px var(--fcd-gold)}',
    '@media (min-width:700px){.fcd-back{width:46px;height:64px}}',
    '.fcd-pile{display:flex;align-items:center;gap:8px;font-size:12px}',
    '.fcd-me{background:var(--fcd-paper);border-radius:18px;padding:8px;border:2px solid transparent;box-shadow:0 1px 6px rgba(42,34,48,.1)}',
    '.fcd-me.turn{border-color:var(--fcd-gold);box-shadow:0 0 0 3px rgba(242,179,61,.35)}',
    '.fcd-mehead{display:flex;align-items:center;gap:8px}',
    '.fcd-mehead .fcd-info{flex:1}',
    '.fcd-hand{display:flex;flex-wrap:nowrap;justify-content:center;padding:16px 0 4px;min-height:calc(var(--ch) + 20px)}',
    '.fcd-acts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin-top:6px}',
    '.fcd-pv{font-size:13px;color:#6d5f50;min-width:6em;text-align:center}',
    '.fcd-pv.bad{color:var(--fcd-red)}',
    '.fcd-ov{position:fixed;inset:0;z-index:50;background:rgba(42,34,48,.45);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.fcd-box{background:var(--fcd-paper);border-radius:20px;max-width:440px;width:100%;max-height:88vh;overflow-y:auto;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.3)}',
    '.fcd-box h3{margin:0 0 8px;font-family:"Noto Serif TC",serif;color:var(--fcd-red);font-size:19px}',
    '.fcd-box h4{margin:12px 0 4px;color:var(--fcd-teal);font-size:15px}',
    '.fcd-box p,.fcd-box li{font-size:13.5px;line-height:1.6;margin:2px 0}',
    '.fcd-box ul{padding-left:18px;margin:2px 0}',
    '.fcd-ref{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px}',
    '.fcd-bubble{background:#eaf6ef;border-radius:14px;padding:8px 12px;font-size:14px;line-height:1.5;flex:1}',
    '.fcd-tbl{width:100%;border-collapse:collapse;font-size:14px;margin:6px 0}',
    '.fcd-tbl td,.fcd-tbl th{padding:5px 4px;border-bottom:1px dashed #e6d7c0;text-align:left}',
    '.fcd-tbl th{font-size:12px;color:#8a7a66;font-weight:500}',
    '.fcd-tbl .n{text-align:right;font-weight:700}',
    '.fcd-cen{text-align:center;margin-top:12px}',
    '.fcd-intro{background:rgba(255,253,248,.95);color:var(--fcd-ink);border-radius:14px;padding:6px 10px;font-size:13px;display:flex;gap:8px;align-items:center;max-width:100%}',
    '.fcd-intro .fcd-av{width:32px;height:32px}'
  ].join('\n');

  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById('fcd-style')) return;
    var el = document.createElement('style');
    el.id = 'fcd-style';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fx() { return typeof FX !== 'undefined' ? FX : null; }
  function avatar(ch) {
    var F = fx(), html = '';
    try { if (F && F.avatar) html = F.avatar(ch, 40); } catch (e) { html = ''; }
    var col = (F && F.color && F.color[ch]) || '#ccc';
    return '<div class="fcd-av" style="--pc:' + col + '">' + (html || esc((NAMES[ch] || '?').charAt(0))) + '</div>';
  }
  function cardHTML(c, cls, attrs) {
    if (c === JOKER) return '<div class="fcd-card jk ' + (cls || '') + '" ' + (attrs || '') + '><span class="r">JOKER</span><span class="b">★</span></div>';
    return '<div class="fcd-card ' + (isRed(c) ? 'red ' : '') + (cls || '') + '" ' + (attrs || '') + '><span class="r">' + RANKS[rk(c)] + '</span><span class="s">' + SUITS[st(c)] + '</span><span class="b">' + SUITS[st(c)] + '</span></div>';
  }

  function rulesHTML() {
    return '<div class="fcd-ov" data-a="close"><div class="fcd-box" data-a="noop">' +
      '<h3>撲克牌大會・規則說明</h3>' +
      '<p>三人依序比三局：<b>大老二 → 撿紅點 → 抽鬼牌</b>。每局第一名 5 分、第二名 3 分、第三名 1 分。三局累計總分最高的人是冠軍（同分比誰拿的第一名多，再同分依座位順序）。</p>' +
      '<h4>第一局：大老二（台灣規則）</h4><ul>' +
      '<li>52 張牌每人 17 張，剩下的 1 張給拿到梅花 3 的人（若剩下的就是梅花 3，給拿方塊 3 的人）。</li>' +
      '<li>大小：3 &lt; 4 &lt; … &lt; K &lt; A &lt; 2；同點數比花色 ♣ &lt; ♦ &lt; ♥ &lt; ♠。</li>' +
      '<li>持梅花 3 的人先出，第一手必須包含梅花 3。</li>' +
      '<li>可出牌型：單張、對子（同點數比較大的那張）、五張牌型：順子 &lt; 葫蘆 &lt; 鐵支 &lt; 同花順。不能單出三條，也不算「同花」（五張同花色但不連續不能出）。</li>' +
      '<li>順子：5 張連續點數。最大是 2-3-4-5-6，第二大 A-2-3-4-5，其餘比最大那張（10-J-Q-K-A 最大的一般順子）；J-Q-K-A-2、Q-K-A-2-3、K-A-2-3-4 不算順子。同級順子比最大牌（A2345 / 23456 比那張 2）的花色。</li>' +
      '<li>葫蘆（3+2）比三條的點數；鐵支（4 張同點數 + 任 1 張）比四條點數；同花順比照順子。</li>' +
      '<li><b>鐵支與同花順可以壓任何牌</b>（單張、對子、五張都行）；同花順又比鐵支大。</li>' +
      '<li>壓不過可以「過」（過了之後輪到你還能再出）。其他人都過，最後出牌的人自由出新牌；若他已經出完，由他下家自由出。</li>' +
      '<li>先出完的第一名、第二個出完的第二名，剩下的人第三名。</li></ul>' +
      '<h4>第二局：撿紅點</h4><ul>' +
      '<li>每人 8 張，桌面翻開 4 張，其餘 24 張當牌堆。上一局的最後一名先出。</li>' +
      '<li>輪到你：打一張手牌去吃桌上的牌：A～9 要兩張加起來是 10（A=1，例如 3 吃 7、5 吃 5）；10、J、Q、K 吃同點數。吃不到就把牌留在桌上。</li>' +
      '<li>接著翻開牌堆最上面一張，一樣可以吃桌上的牌，吃不到就留在桌上。桌上有好幾張能吃時由你選擇（手牌出牌時點選桌上那張；翻牌時也會請你選）。</li>' +
      '<li>手牌與牌堆都用完就結束。計分：紅色（♥♦）A = 20 分、紅色 2～9 照點數、紅色 10/J/Q/K = 10 分、<b>黑桃 A = 30 分</b>，其他黑牌 0 分。分數高的名次在前（同分依座位順序）。</li></ul>' +
      '<h4>第三局：抽鬼牌</h4><ul>' +
      '<li>52 張 + 1 張鬼牌發給三人，一開始成對（同點數）的牌自動丟掉。上一局的最後一名先抽。</li>' +
      '<li>輪到你時，從下家（還有牌的下一位）的牌背中點一張抽走；湊成一對就自動丟掉。</li>' +
      '<li>手牌先清空的是第一名、第二名；最後拿著鬼牌的人第三名。（同時清空時，被抽的人算先。）</li>' +
      '<li>隨時可以按「洗牌」打亂自己手牌的順序，讓別人猜不到鬼牌在哪。</li></ul>' +
      '<div class="fcd-cen"><button class="fcd-btn" data-a="close">我懂了</button></div></div></div>';
  }

  function playerTag(s, seat) {
    var g = s.g;
    if (s.phase !== 'play' || !g.out) return '';
    var k = g.out.indexOf(seat);
    return k >= 0 ? '<span class="fcd-tag out">' + PLACE[k] + '</span>' : '';
  }
  function cardCount(s, seat) { return s.g.hands[seat].length; }

  function oppPanel(s, seat, side) {
    var g = s.g, ch = chOf(s, seat);
    var turn = s.phase === 'play' && g.turn === seat;
    var n = cardCount(s, seat);
    var extra = g.id === 'hong' ? ' · 紅點 ' + hongScore(g.cap[seat]) : '';
    var mini = '';
    for (var i = 0; i < Math.min(n, 9); i++) mini += '<span class="fcd-mb"></span>';
    return '<div class="fcd-pl ' + side + (turn ? ' turn' : '') + '">' + avatar(ch) +
      '<div class="fcd-info"><div class="fcd-nm">' + esc(nm(s, seat)) + playerTag(s, seat) + '</div>' +
      '<div>' + n + ' 張' + extra + '</div><div>累計 <b>' + s.totals[seat] + '</b> 分' + (turn ? ' · <b style="color:#E8453C">出牌中</b>' : '') + '</div>' +
      '<div class="fcd-mini">' + mini + '</div></div></div>';
  }

  function handStep(root, n) {
    var W = (root.clientWidth || 390) - 40;
    var cw = (root.clientWidth || 390) >= 700 ? 60 : 44;
    if (n <= 1) return 0;
    var step = Math.min(cw + 4, (W - cw) / (n - 1));
    return Math.floor(step - cw);
  }

  function centerBig2(s, mySeat) {
    var g = s.g, h = '';
    if (g.last) {
      h += '<div class="fcd-hint">' + esc(nm(s, g.last.seat)) + '：' + CNAME[g.last.combo.type] + '</div>';
      h += '<div class="fcd-row">' + g.last.cards.map(function (c) { return cardHTML(c, 'sm'); }).join('') + '</div>';
    } else if (g.first) {
      h += '<div class="fcd-hint">' + esc(nm(s, g.turn)) + ' 持有 ♣3，先出（第一手要含 ♣3）</div>';
    } else {
      h += '<div class="fcd-hint">新的一輪：' + esc(nm(s, g.turn)) + ' 自由出牌</div>';
    }
    if (g.msg) h += '<div class="fcd-msg">' + esc(g.msg) + '</div>';
    if (s.phase === 'play') h += '<div class="fcd-hint">' + (g.turn === mySeat ? '輪到你了！' : '輪到 ' + esc(nm(s, g.turn))) + '</div>';
    return h;
  }

  function centerHong(s, mySeat, ui) {
    var g = s.g, h = '';
    var my = s.phase === 'play' && g.turn === mySeat;
    var flipMode = my && g.stage === 'flip';
    var selMatches = (my && g.stage === 'play' && ui.hsel !== null) ? g.table.filter(function (t) { return hongMatch(ui.hsel, t); }) : [];
    h += '<div class="fcd-pile"><span class="fcd-back"></span><span>牌堆 ' + g.pile.length + ' 張</span>';
    if (g.flip !== null && g.flip !== undefined) h += '<span>翻出</span>' + cardHTML(g.flip, 'sm');
    h += '</div>';
    h += '<div class="fcd-row">' + g.table.map(function (t) {
      var can = flipMode ? hongMatch(g.flip, t) : selMatches.indexOf(t) >= 0;
      return cardHTML(t, 'sm' + (can ? ' can' : ''), 'data-a="tbl" data-c="' + t + '"');
    }).join('') + (g.table.length ? '' : '<span class="fcd-hint">（桌上沒有牌）</span>') + '</div>';
    if (g.msg) h += '<div class="fcd-msg">' + esc(g.msg) + '</div>';
    if (s.phase === 'play') {
      if (flipMode) h += '<div class="fcd-hint">翻出 ' + cardName(g.flip) + '：點選桌上發光的牌來吃</div>';
      else if (g.stage === 'flip') h += '<div class="fcd-hint">' + esc(nm(s, g.turn)) + ' 正在選擇翻牌要吃哪張</div>';
      else h += '<div class="fcd-hint">' + (my ? '輪到你了！選一張手牌' : '輪到 ' + esc(nm(s, g.turn))) + '</div>';
    }
    return h;
  }

  function centerMaid(s, mySeat) {
    var g = s.g, h = '';
    if (s.phase !== 'play') { if (g.msg) h += '<div class="fcd-msg">' + esc(g.msg) + '</div>'; return h; }
    var tgt = nextActive(g, g.turn);
    var my = g.turn === mySeat;
    h += '<div class="fcd-hint">' + (my ? '輪到你了！從 <b>' + esc(nm(s, tgt)) + '</b> 的牌裡抽一張' : esc(nm(s, g.turn)) + ' 正在抽 ' + esc(nm(s, tgt)) + ' 的牌') + '</div>';
    var backs = '';
    for (var i = 0; i < g.hands[tgt].length; i++) {
      backs += my ? '<button class="fcd-back pick" data-a="back" data-i="' + i + '" aria-label="抽第' + (i + 1) + '張"></button>' : '<span class="fcd-back"></span>';
    }
    h += '<div class="fcd-row">' + backs + '</div>';
    if (g.msg) h += '<div class="fcd-msg">' + esc(g.msg) + '</div>';
    var ld = g.lastDraw;
    if (ld && ld.seat === mySeat && mySeat >= 0) {
      h += '<div class="fcd-hint">你抽到 ' + (ld.card === JOKER ? '<b>鬼牌</b>！' : cardName(ld.card)) + '</div>';
    } else if (ld && ld.from === mySeat && mySeat >= 0) {
      h += '<div class="fcd-hint">你被抽走了 ' + (ld.card === JOKER ? '<b>鬼牌</b>！太好了' : cardName(ld.card)) + '</div>';
    }
    h += '<div class="fcd-pile"><span>已丟掉 ' + g.disc.length + ' 張</span></div>';
    return h;
  }

  function interHTML(s, mySeat) {
    var done = s.phase === 'done';
    var gi = s.places.length - 1;
    var p = s.places[gi];
    var h = '<div class="fcd-ov"><div class="fcd-box">';
    if (!done) {
      h += '<h3>第' + CN_NUM[gi] + '局 ' + GAMES[gi].name + ' 結算</h3>';
      var line = gi < 2 ? '第' + CN_NUM[gi] + '局結束！' + GAMES[gi].name + '第一名是 ' + nm(s, p[0]) + '。下一局是' + GAMES[gi + 1].name + '。' : '三局全部結束！準備頒獎！';
      h += '<div class="fcd-ref">' + avatar('by') + '<div class="fcd-bubble"><b>博育（裁判）</b><br>' + esc(line) + '</div></div>';
      h += '<table class="fcd-tbl"><tr><th>名次</th><th>玩家</th>' + (s.g.id === 'hong' ? '<th>紅點</th>' : '') + '<th class="n">本局</th></tr>';
      p.forEach(function (seat, i) {
        h += '<tr><td>' + PLACE[i] + '</td><td>' + esc(nm(s, seat)) + '</td>' + (s.g.id === 'hong' ? '<td>' + hongScore(s.g.cap[seat]) + '</td>' : '') + '<td class="n">+' + PTS[i] + '</td></tr>';
      });
      h += '</table>';
    } else {
      h += '<h3>比賽結束！</h3>';
      h += '<div class="fcd-ref">' + avatar('by') + '<div class="fcd-bubble"><b>博育（裁判）</b><br>今天的冠軍是 ' + esc(nm(s, result(s).rank[0])) + '！</div></div>';
    }
    h += '<h4>三局累計</h4><table class="fcd-tbl"><tr><th>玩家</th><th>各局名次</th><th class="n">總分</th></tr>';
    var order = [0, 1, 2].sort(function (a, b) { return s.totals[b] - s.totals[a] || a - b; });
    if (done) order = result(s).rank;
    order.forEach(function (seat) {
      var parts = s.places.map(function (pp, k) { return GAMES[k].name.charAt(0) + PLACE[pp.indexOf(seat)].charAt(1); });
      h += '<tr><td>' + esc(nm(s, seat)) + '</td><td style="font-size:12px">' + parts.join(' / ') + '</td><td class="n">' + s.totals[seat] + '</td></tr>';
    });
    h += '</table><div class="fcd-cen">';
    if (!done) {
      var nready = s.ready.filter(Boolean).length;
      if (mySeat >= 0 && !s.ready[mySeat]) h += '<button class="fcd-btn red" data-a="next">' + (gi < 2 ? '下一局' : '前往頒獎') + '</button>';
      else h += '<div class="fcd-pv">等待其他玩家…（' + nready + '/3 已準備）</div>';
    } else {
      h += '<div class="fcd-pv">頒獎典禮即將開始…</div>';
    }
    h += '</div></div></div>';
    return h;
  }

  function render(root, s, mySeat, send, ev) {
    if (!root || !s) return;
    ensureStyle();
    var ui = root._fcd;
    if (!ui) ui = root._fcd = { sel: [], hsel: null, rules: false, key: '' };
    ui.s = s; ui.my = mySeat; ui.send = send;
    var key = s.gi + ':' + s.phase;
    if (ui.key !== key) { ui.sel = []; ui.hsel = null; ui.key = key; }
    if (!root._fcdBound) {
      root._fcdBound = true;
      root.addEventListener('click', function (e) { onClick(root, e); });
    }
    var g = s.g;
    var view = mySeat >= 0 && mySeat <= 2 ? mySeat : 0;
    var myHand = mySeat >= 0 && mySeat <= 2 ? g.hands[mySeat] : null;
    if (myHand) {
      ui.sel = ui.sel.filter(function (c) { return myHand.indexOf(c) >= 0; });
      if (ui.hsel !== null && myHand.indexOf(ui.hsel) < 0) ui.hsel = null;
    } else { ui.sel = []; ui.hsel = null; }
    var myTurn = s.phase === 'play' && mySeat === g.turn && mySeat >= 0;
    if (g.id === 'hong' && (!myTurn || g.stage !== 'play')) ui.hsel = null;

    var h = '<div class="fcd-root">';
    h += '<div class="fcd-top"><div class="fcd-title">撲克牌大會<b>第' + CN_NUM[s.gi] + '局 · ' + GAMES[s.gi].name + '</b><div class="fcd-steps">' +
      GAMES.map(function (x, i) { return '<span class="fcd-step ' + (i === s.gi && s.phase === 'play' ? 'on' : i < s.places.length ? 'dn' : '') + '">' + x.name + '</span>'; }).join('') +
      '</div></div><button class="fcd-btn ghost" data-a="rules">規則說明</button></div>';
    var right = (view + 1) % 3, left = (view + 2) % 3;
    h += '<div class="fcd-opps">' + oppPanel(s, left, 'l') + oppPanel(s, right, 'r') + '</div>';
    h += '<div class="fcd-table">';
    if (!s.intro) h += '<div class="fcd-intro">' + avatar('by') + '<span><b>博育：</b>三場比賽總分最高的人，就是今天的冠軍。</span></div>';
    if (g.id === 'big2') h += centerBig2(s, mySeat);
    else if (g.id === 'hong') h += centerHong(s, mySeat, ui);
    else h += centerMaid(s, mySeat);
    h += '</div>';

    // my area
    var meCh = chOf(s, view);
    h += '<div class="fcd-me' + (s.phase === 'play' && g.turn === view ? ' turn' : '') + '"><div class="fcd-mehead">' + avatar(meCh) +
      '<div class="fcd-info"><div class="fcd-nm">' + esc(nm(s, view)) + (mySeat < 0 ? '（觀戰中）' : '（你）') + playerTag(s, view) + '</div>' +
      '<div>' + cardCount(s, view) + ' 張 · 累計 <b>' + s.totals[view] + '</b> 分' + (g.id === 'hong' ? ' · 紅點 <b>' + hongScore(g.cap[view]) + '</b>' : '') + '</div></div>';
    if (g.id === 'maid' && myHand && myHand.length && s.phase === 'play') h += '<button class="fcd-btn ghost" data-a="shuf">洗牌</button>';
    h += '</div>';
    if (myHand) {
      var shown = myHand.slice();
      if (g.id === 'big2') shown.sort(byBig);
      else if (g.id === 'hong') shown.sort(function (a, b) { return rk(a) - rk(b) || a - b; });
      var ml = handStep(root, shown.length);
      var ld = g.id === 'maid' ? g.lastDraw : null;
      h += '<div class="fcd-hand">' + shown.map(function (c, i) {
        var cls = '';
        if (g.id === 'big2' && ui.sel.indexOf(c) >= 0) cls = 'sel';
        if (g.id === 'hong' && ui.hsel === c) cls = 'sel';
        if (ld && ld.seat === mySeat && ld.card === c && !ld.pair) cls += ' new';
        if (g.id === 'hong' && myTurn && g.stage === 'play' && g.table.some(function (t) { return hongMatch(c, t); }) && ui.hsel === null) cls += '';
        return cardHTML(c, cls, 'data-a="c" data-c="' + c + '" style="margin-left:' + (i ? ml : 0) + 'px;z-index:' + i + '"');
      }).join('') + (shown.length ? '' : '<span class="fcd-pv">（沒有手牌）</span>') + '</div>';
      h += '<div class="fcd-acts">' + actionsHTML(s, mySeat, ui) + '</div>';
    }
    h += '</div>';
    if (s.phase !== 'play') h += interHTML(s, mySeat);
    if (ui.rules) h += rulesHTML();
    h += '</div>';
    root.innerHTML = h;
  }

  function actionsHTML(s, mySeat, ui) {
    var g = s.g;
    var myTurn = s.phase === 'play' && g.turn === mySeat;
    if (g.id === 'big2') {
      var combo = ui.sel.length ? detect(ui.sel) : null;
      var ok = myTurn && combo && beats(combo, g.last && g.last.combo) && (!g.first || ui.sel.indexOf(CLUB3) >= 0);
      var pv = '';
      if (ui.sel.length) {
        if (!combo) pv = '<span class="fcd-pv bad">不是合法牌型</span>';
        else if (g.first && ui.sel.indexOf(CLUB3) < 0) pv = '<span class="fcd-pv bad">' + CNAME[combo.type] + '（要含 ♣3）</span>';
        else if (g.last && !beats(combo, g.last.combo)) pv = '<span class="fcd-pv bad">' + CNAME[combo.type] + '（壓不過）</span>';
        else pv = '<span class="fcd-pv">' + CNAME[combo.type] + '</span>';
      } else pv = '<span class="fcd-pv">' + (myTurn ? '點牌選取' : '等待中') + '</span>';
      return pv + '<button class="fcd-btn ghost" data-a="clr"' + (ui.sel.length ? '' : ' disabled') + '>清除</button>' +
        '<button class="fcd-btn gold" data-a="pass"' + (myTurn && g.last ? '' : ' disabled') + '>過</button>' +
        '<button class="fcd-btn red" data-a="play"' + (ok ? '' : ' disabled') + '>出牌</button>';
    }
    if (g.id === 'hong') {
      if (!myTurn) return '<span class="fcd-pv">等待中</span>';
      if (g.stage === 'flip') return '<span class="fcd-pv">請點桌上發光的牌</span>';
      if (ui.hsel === null) return '<span class="fcd-pv">點一張手牌</span>';
      var m = g.table.filter(function (t) { return hongMatch(ui.hsel, t); });
      if (m.length > 1) return '<span class="fcd-pv">可吃 ' + m.length + ' 張：點桌上要吃的那張</span>';
      return '<span class="fcd-pv">' + (m.length ? '吃 ' + cardName(m[0]) : '吃不到，會留在桌上') + '</span><button class="fcd-btn red" data-a="hplay">出這張</button>';
    }
    return '<span class="fcd-pv">' + (myTurn ? '點上面對手的牌背來抽' : '等待中') + '</span>';
  }

  function onClick(root, e) {
    var ui = root._fcd;
    if (!ui || !ui.s) return;
    var el = e.target && e.target.closest ? e.target.closest('[data-a]') : null;
    if (!el || !root.contains(el)) return;
    var a = el.getAttribute('data-a');
    var s = ui.s, g = s.g, my = ui.my, send = ui.send || function () {};
    var myTurn = s.phase === 'play' && g.turn === my && my >= 0;
    var F = fx();
    function click() { try { if (F && F.sfx) F.sfx('click'); } catch (x) { /* ignore */ } }
    function rer() { render(root, ui.s, ui.my, ui.send, null); }
    var c = Number(el.getAttribute('data-c'));
    if (a === 'noop') { e.stopPropagation(); return; }
    if (a === 'rules') { ui.rules = true; click(); rer(); return; }
    if (a === 'close') { if (el.classList.contains('fcd-ov') && e.target !== el) return; ui.rules = false; rer(); return; }
    if (a === 'next') { click(); send({ type: 'next' }); return; }
    if (s.phase !== 'play') return;
    if (g.id === 'big2') {
      if (a === 'c') {
        var k = ui.sel.indexOf(c);
        if (k >= 0) ui.sel.splice(k, 1); else ui.sel.push(c);
        click(); rer();
      } else if (a === 'clr') { ui.sel = []; rer(); }
      else if (a === 'pass' && myTurn) { ui.sel = []; send({ type: 'pass' }); }
      else if (a === 'play' && myTurn) { var cs = ui.sel.slice(); ui.sel = []; send({ type: 'play', cards: cs }); }
      return;
    }
    if (g.id === 'hong') {
      if (!myTurn) return;
      if (a === 'c' && g.stage === 'play') { ui.hsel = ui.hsel === c ? null : c; click(); rer(); }
      else if (a === 'tbl') {
        if (g.stage === 'flip') { if (hongMatch(g.flip, c)) send({ type: 'flip', target: c }); }
        else if (ui.hsel !== null && hongMatch(ui.hsel, c)) { var hc = ui.hsel; ui.hsel = null; send({ type: 'play', card: hc, target: c }); }
      } else if (a === 'hplay' && ui.hsel !== null) {
        var m = g.table.filter(function (t) { return hongMatch(ui.hsel, t); });
        var card = ui.hsel; ui.hsel = null;
        send({ type: 'play', card: card, target: m.length === 1 ? m[0] : null });
      }
      return;
    }
    if (a === 'back' && myTurn) { send({ type: 'draw', idx: Number(el.getAttribute('data-i')) }); }
    else if (a === 'shuf' && my >= 0) { send({ type: 'shuffle' }); }
  }

  var mod = {
    title: '撲克牌大會',
    init: init, act: act, bot: bot, waiting: waiting, render: render, result: result,
    _t: { detect: detect, beats: beats, genCombos: genCombos, hongMatch: hongMatch, hongPts: hongPts, JOKER: JOKER }
  };
  if (typeof FINALE !== 'undefined' && FINALE && FINALE.register) FINALE.register('cards', mod);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})();
