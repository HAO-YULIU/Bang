/* 越南公主 — 最終小遊戲：大盤象棋 (xiangqi)
 *
 * Classic script. Registers FINALE.register('xiangqi', mod) and exposes a pure rules API on window.XQ.
 *
 * ── Board format ("rows") ────────────────────────────────────────────────────────────────
 *   A board is an array of 10 strings, each 9 chars:  board[r][c]
 *   r = 0 is BLACK's back rank (top of the diagram), r = 9 is RED's back rank (bottom).
 *   c = 0..8 left→right as seen from red's side.
 *   Uppercase = red  : K 帥  A 仕  B 相  N 傌  R 俥  C 炮  P 兵
 *   Lowercase = black: k 將  a 士  b 象  n 馬  r 車  c 砲  p 卒
 *   '.' = empty.
 *   Text form = the 10 rows joined by '/', e.g. the start position:
 *     "rnbakabnr/........./.c.....c./p.p.p.p.p/........./........./P.P.P.P.P/.C.....C./........./RNBAKABNR"
 *   XQ.parse also accepts FEN-style digits for runs of empties ("4k4") and an optional
 *   trailing side token (" w"/" r" = red, " b" = black) which is returned by XQ.parseSide.
 *
 * ── Move format ──────────────────────────────────────────────────────────────────────────
 *   { fr, fc, tr, tc }  (from row/col → to row/col, same coordinates as above).
 *
 * ── Side ─────────────────────────────────────────────────────────────────────────────────
 *   'r' (red) or 'b' (black). 0/'w'/'red' also mean red, 1/'black' mean black.
 *
 * ── API (all pure, no DOM except renderBoard) ───────────────────────────────────────────
 *   XQ.START                     start position (rows)
 *   XQ.parse(text) -> board      XQ.toString(board) -> text      XQ.parseSide(text) -> 'r'|'b'|null
 *   XQ.moves(board, side)        legal moves (flying general + self-check filtered)
 *   XQ.isLegal(board, side, mv)
 *   XQ.inCheck(board, side)      is side's general attacked (incl. 將帥照面)
 *   XQ.apply(board, mv) -> new board (no legality check)
 *   XQ.isMate(board, side)       side has NO legal move (將死 or 困斃 — both are a loss in xiangqi)
 *   XQ.isCheckmate / XQ.isStalemate  finer split of isMate
 *   XQ.mateIn(board, side, n)    side to move forces a mate (opponent without legal moves) within n of
 *                                its own moves? → first move of the shortest mate, or null. Full-width search.
 *   XQ.perft(board, side, depth)
 *   XQ.bestMove(board, side, ms) simple alpha-beta AI move (or null)
 *   XQ.renderBoard(root, board, opts)  DOM board renderer. opts:
 *        flip: bool (black at bottom), selectable: 'r'|'b'|null (side whose pieces can be picked),
 *        onMove(mv): called when the user picks a legal target,
 *        highlight: { last: mv|null, check: 'r'|'b'|null, squares: [[r,c],...] }
 *
 * ── Game module rules notes ──────────────────────────────────────────────────────────────
 *   seat 0 = 紅 (moves first), seat 1 = 黑. No legal move = loss (將死/困斃). 認輸, 提和/同意和棋.
 *   Draw also when the game reaches 300 plies (雙方合計 300 步), or when neither side has any
 *   attacking piece left (no 車/馬/炮/兵卒). Repetition rules are not implemented.
 *   Actions: {type:'move',fr,fc,tr,tc} {type:'resign'} {type:'offerDraw'} {type:'acceptDraw'} {type:'declineDraw'}
 */
(function () {
  'use strict';
  var G = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);

  /* ================================================================ engine */
  var CODE = { K: 1, A: 2, B: 3, N: 4, R: 5, C: 6, P: 7 };
  var LET = '.KABNRCP';
  var VAL = [0, 0, 200, 200, 400, 900, 450, 100];
  var START_TXT = 'rnbakabnr/........./.c.....c./p.p.p.p.p/........./........./P.P.P.P.P/.C.....C./........./RNBAKABNR';
  var DR4 = [-1, 1, 0, 0], DC4 = [0, 0, -1, 1];
  var DRX = [-1, -1, 1, 1], DCX = [-1, 1, -1, 1];
  // knight: dr, dc, leg dr, leg dc
  var KN = [[-2, -1, -1, 0], [-2, 1, -1, 0], [2, -1, 1, 0], [2, 1, 1, 0], [-1, -2, 0, -1], [1, -2, 0, -1], [-1, 2, 0, 1], [1, 2, 0, 1]];

  function sideNum(side) {
    if (side === 1 || side === 'b' || side === 'black' || side === -1) return -1;
    return 1;
  }
  function sideLet(s) { return s > 0 ? 'r' : 'b'; }

  function parse(text) {
    var t = String(text).trim().split(/\s+/)[0];
    var rows = t.split('/');
    if (rows.length !== 10) throw new Error('XQ.parse: need 10 rows');
    return rows.map(function (row) {
      var out = '';
      for (var i = 0; i < row.length; i++) {
        var ch = row[i];
        if (ch >= '1' && ch <= '9') out += '.........'.slice(0, +ch);
        else if (ch === '.' || CODE[ch.toUpperCase()]) out += ch;
        else throw new Error('XQ.parse: bad char ' + ch);
      }
      if (out.length !== 9) throw new Error('XQ.parse: row must have 9 squares: ' + row);
      return out;
    });
  }
  function parseSide(text) {
    var p = String(text).trim().split(/\s+/);
    if (p.length < 2) return null;
    return /^[b]/i.test(p[1]) ? 'b' : (/^[wr]/i.test(p[1]) ? 'r' : null);
  }
  function toStr(board) { return board.join('/'); }

  function toInt(board) {
    var b = new Int8Array(90);
    for (var r = 0; r < 10; r++) {
      var row = board[r];
      for (var c = 0; c < 9; c++) {
        var ch = row[c];
        if (ch === '.' || ch === undefined) continue;
        var u = ch.toUpperCase(), v = CODE[u];
        if (!v) continue;
        b[r * 9 + c] = ch === u ? v : -v;
      }
    }
    return b;
  }
  function fromInt(b) {
    var rows = [];
    for (var r = 0; r < 10; r++) {
      var s = '';
      for (var c = 0; c < 9; c++) {
        var p = b[r * 9 + c];
        s += p === 0 ? '.' : (p > 0 ? LET[p] : LET[-p].toLowerCase());
      }
      rows.push(s);
    }
    return rows;
  }
  function encM(mv) { return (mv.fr * 9 + mv.fc) << 7 | (mv.tr * 9 + mv.tc); }
  function decM(m) {
    var f = m >> 7, t = m & 127;
    return { fr: (f / 9) | 0, fc: f % 9, tr: (t / 9) | 0, tc: t % 9 };
  }

  function add(b, s, i, j, out, capOnly) {
    var q = b[j];
    if (q === 0) { if (!capOnly) out.push(i << 7 | j); }
    else if ((q > 0) !== (s > 0)) out.push(i << 7 | j);
  }

  // pseudo-legal moves for side s (1 red / -1 black)
  function gen(b, s, out, capOnly) {
    for (var i = 0; i < 90; i++) {
      var p = b[i];
      if (p === 0 || (p > 0) !== (s > 0)) continue;
      var t = p > 0 ? p : -p, r = (i / 9) | 0, c = i - r * 9, nr, nc, d, j, k;
      switch (t) {
        case 1: // 帥/將
          for (d = 0; d < 4; d++) {
            nr = r + DR4[d]; nc = c + DC4[d];
            if (nc < 3 || nc > 5) continue;
            if (s > 0 ? (nr < 7 || nr > 9) : (nr < 0 || nr > 2)) continue;
            add(b, s, i, nr * 9 + nc, out, capOnly);
          }
          break;
        case 2: // 仕/士
          for (d = 0; d < 4; d++) {
            nr = r + DRX[d]; nc = c + DCX[d];
            if (nc < 3 || nc > 5) continue;
            if (s > 0 ? (nr < 7 || nr > 9) : (nr < 0 || nr > 2)) continue;
            add(b, s, i, nr * 9 + nc, out, capOnly);
          }
          break;
        case 3: // 相/象
          for (d = 0; d < 4; d++) {
            nr = r + 2 * DRX[d]; nc = c + 2 * DCX[d];
            if (nc < 0 || nc > 8) continue;
            if (s > 0 ? (nr < 5 || nr > 9) : (nr < 0 || nr > 4)) continue;
            if (b[(r + DRX[d]) * 9 + c + DCX[d]] !== 0) continue; // 塞象眼
            add(b, s, i, nr * 9 + nc, out, capOnly);
          }
          break;
        case 4: // 傌/馬
          for (d = 0; d < 8; d++) {
            var kn = KN[d];
            nr = r + kn[0]; nc = c + kn[1];
            if (nr < 0 || nr > 9 || nc < 0 || nc > 8) continue;
            if (b[(r + kn[2]) * 9 + c + kn[3]] !== 0) continue; // 蹩馬腿
            add(b, s, i, nr * 9 + nc, out, capOnly);
          }
          break;
        case 5: // 俥/車
          for (d = 0; d < 4; d++) {
            nr = r + DR4[d]; nc = c + DC4[d];
            while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
              j = nr * 9 + nc;
              if (b[j] === 0) { if (!capOnly) out.push(i << 7 | j); }
              else { if ((b[j] > 0) !== (s > 0)) out.push(i << 7 | j); break; }
              nr += DR4[d]; nc += DC4[d];
            }
          }
          break;
        case 6: // 炮/砲
          for (d = 0; d < 4; d++) {
            nr = r + DR4[d]; nc = c + DC4[d]; k = 0;
            while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
              j = nr * 9 + nc;
              if (k === 0) {
                if (b[j] === 0) { if (!capOnly) out.push(i << 7 | j); }
                else k = 1; // screen
              } else if (b[j] !== 0) {
                if ((b[j] > 0) !== (s > 0)) out.push(i << 7 | j);
                break;
              }
              nr += DR4[d]; nc += DC4[d];
            }
          }
          break;
        case 7: // 兵/卒
          nr = r - s;
          if (nr >= 0 && nr <= 9) add(b, s, i, nr * 9 + c, out, capOnly);
          if (s > 0 ? r <= 4 : r >= 5) { // crossed the river
            if (c > 0) add(b, s, i, i - 1, out, capOnly);
            if (c < 8) add(b, s, i, i + 1, out, capOnly);
          }
          break;
      }
    }
    return out;
  }

  function findKing(b, s) {
    var k = s, r0 = s > 0 ? 7 : 0;
    for (var r = r0; r < r0 + 3; r++) for (var c = 3; c < 6; c++) if (b[r * 9 + c] === k) return r * 9 + c;
    for (var i = 0; i < 90; i++) if (b[i] === k) return i;
    return -1;
  }

  // is side s's general attacked?
  function attacked(b, s) {
    var k = findKing(b, s);
    if (k < 0) return true;
    var kr = (k / 9) | 0, kc = k - kr * 9, e = -s, d, nr, nc, p, seen;
    var eR = 5 * e, eC = 6 * e, eK = e, eN = 4 * e, eP = 7 * e;
    for (d = 0; d < 4; d++) {
      nr = kr + DR4[d]; nc = kc + DC4[d]; seen = 0;
      while (nr >= 0 && nr <= 9 && nc >= 0 && nc <= 8) {
        p = b[nr * 9 + nc];
        if (p !== 0) {
          if (seen === 0) {
            if (p === eR || (p === eK && DC4[d] === 0)) return true; // 車 / 將帥照面
            seen = 1;
          } else {
            if (p === eC) return true; // 炮隔子
            break;
          }
        }
        nr += DR4[d]; nc += DC4[d];
      }
    }
    for (d = 0; d < 4; d++) {
      var lr = kr + DRX[d], lc = kc + DCX[d];
      if (lr < 0 || lr > 9 || lc < 0 || lc > 8 || b[lr * 9 + lc] !== 0) continue;
      nr = kr + 2 * DRX[d]; nc = kc + DCX[d];
      if (nr >= 0 && nr <= 9 && b[nr * 9 + nc] === eN) return true;
      nr = kr + DRX[d]; nc = kc + 2 * DCX[d];
      if (nc >= 0 && nc <= 8 && b[nr * 9 + nc] === eN) return true;
    }
    // enemy pawns: enemy pawn moves in direction -e (row += s ... ) → it sits at kr - (-e)?? enemy pawn at row r moves to r - e
    nr = kr + e; // pawn at (kr+e) moving by -e reaches kr
    if (nr >= 0 && nr <= 9 && b[nr * 9 + kc] === eP) return true;
    var crossedRow = e > 0 ? kr <= 4 : kr >= 5;
    if (crossedRow) {
      if (kc > 0 && b[k - 1] === eP) return true;
      if (kc < 8 && b[k + 1] === eP) return true;
    }
    return false;
  }

  function legalList(b, s) {
    var ps = gen(b, s, [], false), out = [];
    for (var n = 0; n < ps.length; n++) {
      var m = ps[n], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      if (!attacked(b, s)) out.push(m);
      b[f] = b[t]; b[t] = cap;
    }
    return out;
  }
  function hasLegal(b, s) {
    var ps = gen(b, s, [], false);
    for (var n = 0; n < ps.length; n++) {
      var m = ps[n], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      var ok = !attacked(b, s);
      b[f] = b[t]; b[t] = cap;
      if (ok) return true;
    }
    return false;
  }
  function perftI(b, s, d) {
    if (d === 0) return 1;
    var ms = legalList(b, s);
    if (d === 1) return ms.length;
    var n = 0;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      n += perftI(b, -s, d - 1);
      b[f] = b[t]; b[t] = cap;
    }
    return n;
  }

  /* ---- mate search ---- */
  function mateSearch(b, s, n, ctx) {
    var ms = legalList(b, s), checks = [], caps = [], quiet = [], i, m, f, t, cap;
    for (i = 0; i < ms.length; i++) {
      m = ms[i]; f = m >> 7; t = m & 127; cap = b[t];
      b[t] = b[f]; b[f] = 0;
      var chk = attacked(b, -s);
      b[f] = b[t]; b[t] = cap;
      (chk ? checks : (cap ? caps : quiet)).push(m);
    }
    var order = checks.concat(caps, quiet);
    for (i = 0; i < order.length; i++) {
      m = order[i]; f = m >> 7; t = m & 127; cap = b[t];
      b[t] = b[f]; b[f] = 0;
      var ok;
      if (!hasLegal(b, -s)) ok = true;
      else ok = n > 1 ? allLose(b, -s, n - 1, ctx) : false;
      b[f] = b[t]; b[t] = cap;
      if (ok) return m;
    }
    return -1;
  }
  function boardKey(b, s, n) {
    var a = new Array(91);
    for (var i = 0; i < 90; i++) a[i] = b[i] + 8;
    a[90] = s > 0 ? 1 : 2;
    return String.fromCharCode.apply(null, a) + n;
  }
  // d to move (has ≥1 legal move); true if every reply still allows -d to mate within n
  function allLose(b, d, n, ctx) {
    var key = boardKey(b, d, n);
    var hit = ctx.tt.get(key);
    if (hit !== undefined) return hit;
    var ps = gen(b, d, [], false), res = true;
    for (var i = 0; i < ps.length && res; i++) {
      var m = ps[i], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      if (!attacked(b, d)) { if (mateSearch(b, -d, n, ctx) < 0) res = false; }
      b[f] = b[t]; b[t] = cap;
    }
    ctx.tt.set(key, res);
    return res;
  }

  /* ---- simple AI ---- */
  var MATE = 100000;
  function evalB(b) { // red-positive
    var v = 0;
    for (var i = 0; i < 90; i++) {
      var p = b[i];
      if (p === 0) continue;
      var t = p > 0 ? p : -p, r = (i / 9) | 0, c = i - r * 9, x = VAL[t];
      if (t === 7) {
        var adv = p > 0 ? 9 - r : r; // 0..9 rows advanced from own back rank... (start row 6/3 → adv 3)
        if (adv >= 5) { x += 80 + (adv - 5) * 12; if (c >= 3 && c <= 5) x += 20; if (adv === 9) x -= 60; }
      } else if (t === 4) {
        var a2 = p > 0 ? 9 - r : r;
        x += (c >= 2 && c <= 6 ? 12 : 0) + (a2 >= 4 && a2 <= 7 ? 15 : 0);
      } else if (t === 6) {
        if (c === 4) x += 15;
      } else if (t === 5) {
        var a3 = p > 0 ? 9 - r : r;
        if (a3 >= 4) x += 15;
      }
      v += p > 0 ? x : -x;
    }
    return v;
  }
  function orderMoves(b, ms) {
    var sc = new Array(ms.length);
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], q = b[m & 127], p = b[m >> 7];
      sc[i] = q ? VAL[q > 0 ? q : -q] * 10 - VAL[p > 0 ? p : -p] + 10000 : 0;
    }
    var idx = ms.map(function (_, i) { return i; });
    idx.sort(function (x, y) { return sc[y] - sc[x]; });
    return idx.map(function (i) { return ms[i]; });
  }
  function tick(ctx) {
    if ((++ctx.nodes & 511) === 0 && Date.now() > ctx.deadline) ctx.stop = true;
    return ctx.stop;
  }
  function qs(b, s, alpha, beta, qd, ctx) {
    if (tick(ctx)) return 0;
    var stand = evalB(b) * s;
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    if (qd >= 6) return stand;
    var ms = orderMoves(b, gen(b, s, [], true));
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      if (attacked(b, s)) { b[f] = b[t]; b[t] = cap; continue; }
      var v = -qs(b, -s, -beta, -alpha, qd + 1, ctx);
      b[f] = b[t]; b[t] = cap;
      if (ctx.stop) return 0;
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function negamax(b, s, depth, alpha, beta, ply, ctx) {
    if (tick(ctx)) return 0;
    if (depth <= 0) return qs(b, s, alpha, beta, 0, ctx);
    var ms = orderMoves(b, gen(b, s, [], false)), best = -MATE * 2, cnt = 0;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], f = m >> 7, t = m & 127, cap = b[t];
      b[t] = b[f]; b[f] = 0;
      if (attacked(b, s)) { b[f] = b[t]; b[t] = cap; continue; }
      cnt++;
      var v = -negamax(b, -s, depth - 1, -beta, -alpha, ply + 1, ctx);
      b[f] = b[t]; b[t] = cap;
      if (ctx.stop) return 0;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    if (cnt === 0) return -MATE + ply;
    return best;
  }
  function hash32(a) { a = (a ^ 61) ^ (a >>> 16); a = a + (a << 3); a = a ^ (a >>> 4); a = Math.imul(a, 0x27d4eb2d); return (a ^ (a >>> 15)) >>> 0; }
  // returns {m, score} (m = encoded) or null
  function think(b, s, ms, salt) {
    var root = legalList(b, s);
    if (!root.length) return null;
    var ctx = { nodes: 0, stop: false, deadline: Date.now() + (ms || XQ.botTimeMs) };
    root = orderMoves(b, root);
    var jit = root.map(function (m, i) { return hash32((salt | 0) * 131 + m) % 9; });
    var bestM = root[0], bestV = -MATE * 2;
    for (var depth = 1; depth <= 4; depth++) {
      var curM = -1, curV = -MATE * 2, alpha = -MATE * 2;
      for (var i = 0; i < root.length; i++) {
        var m = root[i], f = m >> 7, t = m & 127, cap = b[t];
        b[t] = b[f]; b[f] = 0;
        var v = -negamax(b, -s, depth - 1, -MATE * 2, -alpha + 9, 1, ctx);
        b[f] = b[t]; b[t] = cap;
        if (ctx.stop) break;
        if (Math.abs(v) < MATE - 1000) v += jit[i];
        if (v > curV) { curV = v; curM = m; }
        if (v > alpha) alpha = v;
      }
      if (ctx.stop) { if (curM >= 0 && curV > bestV && depth > 1) { bestM = curM; bestV = curV; } break; }
      bestM = curM; bestV = curV;
      if (bestV > MATE - 1000) break; // found a mate
      // move best to front for next iteration
      var k = root.indexOf(bestM); root.splice(k, 1); root.unshift(bestM);
      var jj = jit.splice(k, 1)[0]; jit.unshift(jj);
      if (Date.now() > ctx.deadline - (ms || XQ.botTimeMs) * 0.6) break; // not enough time for a deeper pass
    }
    return { m: bestM, score: bestV };
  }

  /* ---- public pure API ---- */
  var XQ = {
    START: parse(START_TXT),
    botTimeMs: 180,
    parse: parse,
    parseSide: parseSide,
    toString: toStr,
    moves: function (board, side) { return legalList(toInt(board), sideNum(side)).map(decM); },
    isLegal: function (board, side, mv) {
      if (!mv) return false;
      var e = encM(mv);
      return legalList(toInt(board), sideNum(side)).indexOf(e) >= 0;
    },
    inCheck: function (board, side) { return attacked(toInt(board), sideNum(side)); },
    apply: function (board, mv) {
      var rows = board.slice(), p = rows[mv.fr][mv.fc];
      function set(r, c, ch) { rows[r] = rows[r].slice(0, c) + ch + rows[r].slice(c + 1); }
      set(mv.fr, mv.fc, '.');
      set(mv.tr, mv.tc, p);
      return rows;
    },
    isMate: function (board, side) { return !hasLegal(toInt(board), sideNum(side)); },
    isCheckmate: function (board, side) { var b = toInt(board), s = sideNum(side); return !hasLegal(b, s) && attacked(b, s); },
    isStalemate: function (board, side) { var b = toInt(board), s = sideNum(side); return !hasLegal(b, s) && !attacked(b, s); },
    mateIn: function (board, side, n) {
      var b = toInt(board), s = sideNum(side), ctx = { tt: new Map() };
      n = Math.max(1, n | 0);
      for (var d = 1; d <= n; d++) {
        var m = mateSearch(b, s, d, ctx);
        if (m >= 0) return decM(m);
      }
      return null;
    },
    perft: function (board, side, depth) { return perftI(toInt(board), sideNum(side), depth); },
    bestMove: function (board, side, ms, salt) {
      var r = think(toInt(board), sideNum(side), ms, salt);
      return r ? decM(r.m) : null;
    },
    evaluate: function (board, side) { return evalB(toInt(board)) * sideNum(side); },
    pieceName: function (ch) { return PCH[ch] || ''; },
    sideOf: function (ch) { return ch === '.' ? null : (ch === ch.toUpperCase() ? 'r' : 'b'); },
    renderBoard: null // set below
  };
  var PCH = { K: '帥', A: '仕', B: '相', N: '傌', R: '俥', C: '炮', P: '兵', k: '將', a: '士', b: '象', n: '馬', r: '車', c: '砲', p: '卒' };

  /* ================================================================ DOM: board renderer */
  var CSS_ID = 'fxq-style';
  var CSS = [
    '.fxq-root{--fxq-cream:#FFF6E8;--fxq-red:#E8453C;--fxq-teal:#2BA6A0;--fxq-ink:#2A2230;--fxq-gold:#F2B33D;--fxq-paper:#FFFDF8;',
    'font-family:"Noto Sans TC",system-ui,sans-serif;color:var(--fxq-ink);box-sizing:border-box;width:100%;max-width:100%;overflow-x:hidden;padding:8px 12px 14px;position:relative;-webkit-tap-highlight-color:transparent}',
    '.fxq-root *{box-sizing:border-box}',
    '.fxq-main{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}',
    '.fxq-bcol{width:min(100%,72vh,576px);display:flex;flex-direction:column;gap:6px}',
    '.fxq-side{width:min(100%,576px);display:flex;flex-direction:column;gap:8px}',
    '.fxq-title{font-family:"Noto Serif TC",serif;font-weight:900;font-size:20px;text-align:center;letter-spacing:.2em;color:var(--fxq-red);margin:0 0 2px}',
    '.fxq-title small{display:block;font-size:11px;letter-spacing:.1em;color:#8a7a6a;font-weight:500;font-family:"Noto Sans TC",sans-serif}',
    '@media (min-width:900px){.fxq-main{flex-direction:row;justify-content:center;align-items:flex-start;gap:22px}',
    '.fxq-bcol{width:min(calc(100% - 340px),72vh,576px)}.fxq-side{width:310px;padding-top:4px}.fxq-title{font-size:26px;text-align:left}}',
    // player bar
    '.fxq-pl{display:flex;align-items:center;gap:8px;background:var(--fxq-paper);border:2px solid #f0dfc4;border-radius:14px;padding:6px 10px;min-height:48px;transition:border-color .2s,box-shadow .2s}',
    '.fxq-pl.fxq-turn{border-color:var(--fxq-gold);box-shadow:0 0 0 3px rgba(242,179,61,.28)}',
    '.fxq-av{width:34px;height:34px;flex:0 0 34px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f3e6d2;font-weight:700}',
    '.fxq-av img{width:100%;height:100%;display:block}',
    '.fxq-pn{flex:1 1 auto;min-width:0}',
    '.fxq-nm{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fxq-tag{display:inline-block;font-size:11px;font-weight:700;color:#fff;border-radius:8px;padding:1px 7px;margin-left:6px;vertical-align:2px}',
    '.fxq-tag.r{background:var(--fxq-red)}.fxq-tag.b{background:var(--fxq-ink)}',
    '.fxq-caps{display:flex;flex-wrap:wrap;gap:2px;margin-top:2px;min-height:18px}',
    '.fxq-mini{width:18px;height:18px;border-radius:50%;font-family:"Noto Serif TC",serif;font-weight:900;font-size:11px;line-height:15px;text-align:center;background:#fbf1de;border:1.5px solid}',
    '.fxq-mini.r{color:var(--fxq-red);border-color:var(--fxq-red)}.fxq-mini.b{color:var(--fxq-ink);border-color:var(--fxq-ink)}',
    '.fxq-st{font-size:12px;font-weight:700;white-space:nowrap;color:#9a8a78}',
    '.fxq-pl.fxq-turn .fxq-st{color:#c9861a}',
    // status & buttons
    '.fxq-status{text-align:center;font-weight:700;font-size:15px;padding:6px 8px;border-radius:12px;background:var(--fxq-cream);border:1.5px dashed #ead7b8}',
    '.fxq-status.chk{color:#fff;background:var(--fxq-red);border-color:var(--fxq-red)}',
    '.fxq-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
    '.fxq-btn{appearance:none;border:none;border-radius:12px;padding:9px 14px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;background:var(--fxq-teal);color:#fff;box-shadow:0 3px 0 rgba(0,0,0,.15);touch-action:manipulation;min-height:40px}',
    '.fxq-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.15)}',
    '.fxq-btn.red{background:var(--fxq-red)}.fxq-btn.gold{background:var(--fxq-gold);color:var(--fxq-ink)}.fxq-btn.ghost{background:#efe3cf;color:var(--fxq-ink)}',
    '.fxq-btn[disabled]{opacity:.45;cursor:default}',
    '.fxq-offer{background:#fff3cf;border:2px solid var(--fxq-gold);border-radius:12px;padding:8px;text-align:center;font-weight:700;display:flex;flex-direction:column;gap:6px;align-items:center}',
    '.fxq-over{background:var(--fxq-paper);border:3px solid var(--fxq-gold);border-radius:16px;padding:10px;text-align:center}',
    '.fxq-over b{font-family:"Noto Serif TC",serif;font-size:22px;color:var(--fxq-red);display:block}',
    '.fxq-log{font-size:12px;color:#8a7a6a;text-align:center;min-height:16px}',
    // board
    '.fxq-bd{position:relative;width:100%;aspect-ratio:9/10;container-type:inline-size;border-radius:10px;',
    'background:radial-gradient(ellipse at 30% 20%,#FBE3B4,#F1CF8E 60%,#E9BF78);box-shadow:0 6px 18px rgba(120,70,20,.25),inset 0 0 0 3px #c58f4c;touch-action:manipulation;cursor:pointer;user-select:none;-webkit-user-select:none}',
    '.fxq-bd svg{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}',
    '.fxq-p{position:absolute;width:10%;height:9%;border-radius:50%;display:flex;align-items:center;justify-content:center;',
    'font-family:"Noto Serif TC","Noto Sans TC",serif;font-weight:900;font-size:22px;font-size:6.3cqw;line-height:1;pointer-events:none;',
    'background:radial-gradient(circle at 35% 30%,#FFFDF8,#F7E8C8 70%,#E8D2A6);border:2px solid;box-shadow:0 2px 3px rgba(60,30,0,.35),inset 0 0 0 2px #fffaf0,inset 0 0 0 3.5px currentColor;transition:transform .12s}',
    '.fxq-p.r{color:#D63A31;border-color:#C2352D}.fxq-p.b{color:#2A2230;border-color:#2A2230}',
    '.fxq-p.sel{transform:translateY(-6%) scale(1.08);box-shadow:0 0 0 3px var(--fxq-teal),0 6px 10px rgba(60,30,0,.35),inset 0 0 0 2px #fffaf0,inset 0 0 0 3.5px currentColor}',
    '.fxq-p.last{box-shadow:0 0 0 3px var(--fxq-gold),0 2px 3px rgba(60,30,0,.35),inset 0 0 0 2px #fffaf0,inset 0 0 0 3.5px currentColor;animation:fxq-pop .3s ease-out}',
    '.fxq-p.chk{animation:fxq-chk 1s ease-in-out infinite}',
    '@keyframes fxq-pop{0%{transform:scale(1.25)}100%{transform:scale(1)}}',
    '@keyframes fxq-chk{0%,100%{box-shadow:0 0 0 3px rgba(232,69,60,.9),0 0 10px 4px rgba(232,69,60,.6),inset 0 0 0 2px #fffaf0,inset 0 0 0 3.5px currentColor}50%{box-shadow:0 0 0 5px rgba(232,69,60,.4),0 0 16px 8px rgba(232,69,60,.25),inset 0 0 0 2px #fffaf0,inset 0 0 0 3.5px currentColor}}',
    '.fxq-dot{position:absolute;width:3.4%;height:3.06%;border-radius:50%;background:rgba(43,166,160,.85);box-shadow:0 0 0 2px rgba(255,255,255,.7);pointer-events:none}',
    '.fxq-ring{position:absolute;width:11%;height:9.9%;border-radius:50%;border:3px solid rgba(43,166,160,.95);pointer-events:none;z-index:2}',
    '.fxq-from{position:absolute;width:6%;height:5.4%;border-radius:50%;border:2px dashed rgba(201,134,26,.9);pointer-events:none}',
    '.fxq-hl{position:absolute;width:11%;height:9.9%;border-radius:50%;background:rgba(242,179,61,.35);pointer-events:none}',
    '.fxq-flash{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:"Noto Serif TC",serif;font-weight:900;font-size:13cqw;color:#fff;',
    'background:rgba(232,69,60,.92);padding:2% 6%;border-radius:18px;border:3px solid #fff;box-shadow:0 6px 20px rgba(0,0,0,.3);pointer-events:none;z-index:5;animation:fxq-fl 1.4s ease-out forwards;white-space:nowrap}',
    '@keyframes fxq-fl{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}25%{transform:translate(-50%,-50%) scale(1)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}',
    // modal
    '.fxq-modal{position:fixed;inset:0;background:rgba(42,34,48,.5);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px}',
    '.fxq-card{background:var(--fxq-paper);border-radius:18px;max-width:520px;width:100%;max-height:85vh;overflow:auto;padding:16px 18px;border:3px solid var(--fxq-gold);font-size:14px;line-height:1.65}',
    '.fxq-card h3{margin:0 0 6px;font-family:"Noto Serif TC",serif;color:var(--fxq-red)}',
    '.fxq-card ul{padding-left:20px;margin:6px 0}'
  ].join('\n');

  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return;
    var st = document.createElement('style');
    st.id = CSS_ID; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  function gridSVG(flip) {
    var L = [], x, y, c, r;
    var col = '#8A5A2B';
    L.push('<rect x="3.2" y="3.2" width="83.6" height="93.6" fill="none" stroke="' + col + '" stroke-width="0.9"/>');
    for (r = 0; r < 10; r++) { y = 5 + 10 * r; L.push('<line x1="5" y1="' + y + '" x2="85" y2="' + y + '"/>'); }
    for (c = 0; c < 9; c++) {
      x = 5 + 10 * c;
      if (c === 0 || c === 8) L.push('<line x1="' + x + '" y1="5" x2="' + x + '" y2="95"/>');
      else { L.push('<line x1="' + x + '" y1="5" x2="' + x + '" y2="45"/>'); L.push('<line x1="' + x + '" y1="55" x2="' + x + '" y2="95"/>'); }
    }
    L.push('<line x1="35" y1="5" x2="55" y2="25"/><line x1="55" y1="5" x2="35" y2="25"/>');
    L.push('<line x1="35" y1="75" x2="55" y2="95"/><line x1="55" y1="75" x2="35" y2="95"/>');
    // position marks (炮位/兵位) — symmetric, so no flip needed
    var marks = [[2, 1], [2, 7], [7, 1], [7, 7], [3, 0], [3, 2], [3, 4], [3, 6], [3, 8], [6, 0], [6, 2], [6, 4], [6, 6], [6, 8]];
    marks.forEach(function (m) {
      var cx = 5 + 10 * m[1], cy = 5 + 10 * m[0], g = 1, l = 2.2;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
        var nx = cx + q[0] * 10; if (nx < 5 || nx > 85) return;
        var ax = cx + q[0] * g, ay = cy + q[1] * g;
        L.push('<polyline fill="none" points="' + (ax + q[0] * l) + ',' + ay + ' ' + ax + ',' + ay + ' ' + ax + ',' + (ay + q[1] * l) + '"/>');
      });
    });
    var top = flip ? '漢　界' : '楚　河', bot = flip ? '楚　河' : '漢　界';
    // the river text: left half reads one, right half the other (traditional layout: 楚河 left, 漢界 right)
    var left = flip ? '漢界' : '楚河', right = flip ? '楚河' : '漢界';
    void top; void bot;
    var txt = '<text x="25" y="52.4" font-size="6.2" text-anchor="middle" fill="#8A5A2B" font-family="Noto Serif TC,serif" font-weight="700" letter-spacing="3">' + left + '</text>' +
      '<text x="65" y="52.4" font-size="6.2" text-anchor="middle" fill="#8A5A2B" font-family="Noto Serif TC,serif" font-weight="700" letter-spacing="3">' + right + '</text>';
    return '<svg viewBox="0 0 90 100" preserveAspectRatio="none" aria-hidden="true"><g stroke="' + col + '" stroke-width="0.45" stroke-linecap="round">' + L.join('') + '</g>' + txt + '</svg>';
  }

  function pos(r, c, flip, w, h) {
    var dr = flip ? 9 - r : r, dc = flip ? 8 - c : c;
    var x = 5 + 10 * dc, y = 5 + 10 * dr;
    return 'left:' + ((x - w / 2) / 90 * 100).toFixed(3) + '%;top:' + ((y - h / 2) / 100 * 100).toFixed(3) + '%';
  }

  function drawBoard(el) {
    var o = el._xq, board = o.board, flip = !!o.flip, hl = o.highlight || {}, sel = o.sel, H = [];
    H.push(gridSVG(flip));
    var targets = [];
    if (sel && o.selectable) {
      targets = XQ.moves(board, o.selectable).filter(function (m) { return m.fr === sel[0] && m.fc === sel[1]; });
    }
    if (hl.squares) hl.squares.forEach(function (q) { H.push('<div class="fxq-hl" style="' + pos(q[0], q[1], flip, 9.9, 9.9) + '"></div>'); });
    if (hl.last) H.push('<div class="fxq-from" style="' + pos(hl.last.fr, hl.last.fc, flip, 5.4, 5.4) + '"></div>');
    var chkSide = hl.check ? (sideNum(hl.check) > 0 ? 'K' : 'k') : null;
    for (var r = 0; r < 10; r++) for (var c = 0; c < 9; c++) {
      var ch = board[r][c];
      if (ch === '.') continue;
      var cls = 'fxq-p ' + (ch === ch.toUpperCase() ? 'r' : 'b');
      if (sel && sel[0] === r && sel[1] === c) cls += ' sel';
      else if (hl.last && hl.last.tr === r && hl.last.tc === c) cls += ' last';
      if (ch === chkSide) cls += ' chk';
      H.push('<div class="' + cls + '" data-rc="' + r + ',' + c + '" style="' + pos(r, c, flip, 9, 9) + '">' + PCH[ch] + '</div>');
    }
    targets.forEach(function (m) {
      if (board[m.tr][m.tc] !== '.') H.push('<div class="fxq-ring" style="' + pos(m.tr, m.tc, flip, 9.9, 9.9) + '"></div>');
      else H.push('<div class="fxq-dot" style="' + pos(m.tr, m.tc, flip, 3.06, 3.06) + '"></div>');
    });
    el.innerHTML = H.join('');
    o.targets = targets;
  }

  function boardClick(ev) {
    var el = this, o = el._xq;
    if (!o || !o.selectable) return;
    var rect = el.getBoundingClientRect();
    var dc = Math.floor((ev.clientX - rect.left) / rect.width * 9);
    var dr = Math.floor((ev.clientY - rect.top) / rect.height * 10);
    if (dc < 0 || dc > 8 || dr < 0 || dr > 9) return;
    var r = o.flip ? 9 - dr : dr, c = o.flip ? 8 - dc : dc;
    var tgt = (o.targets || []).filter(function (m) { return m.tr === r && m.tc === c; })[0];
    if (o.sel && tgt) {
      o.sel = null;
      drawBoard(el);
      if (o.onMove) o.onMove({ fr: tgt.fr, fc: tgt.fc, tr: tgt.tr, tc: tgt.tc });
      return;
    }
    var ch = o.board[r][c];
    if (ch !== '.' && XQ.sideOf(ch) === sideLet(sideNum(o.selectable))) {
      o.sel = (o.sel && o.sel[0] === r && o.sel[1] === c) ? null : [r, c];
      if (o.sel && typeof FX !== 'undefined' && FX.sfx) { try { FX.sfx('click'); } catch (e) { } }
    } else o.sel = null;
    drawBoard(el);
  }

  // root: element to draw the board in (it becomes the board). Keeps selection between calls while
  // the board / selectable side are unchanged.
  XQ.renderBoard = function (root, board, opts) {
    injectCSS();
    opts = opts || {};
    var prev = root._xq;
    var same = prev && toStr(prev.board) === toStr(board) && prev.selectable === opts.selectable;
    root._xq = {
      board: board, flip: !!opts.flip, onMove: opts.onMove, highlight: opts.highlight,
      selectable: opts.selectable || null, sel: same ? prev.sel : null, targets: []
    };
    if (root._xq.sel) {
      var ch = board[root._xq.sel[0]][root._xq.sel[1]];
      if (ch === '.' || !root._xq.selectable || XQ.sideOf(ch) !== sideLet(sideNum(root._xq.selectable))) root._xq.sel = null;
    }
    if (!root.classList.contains('fxq-bd')) root.classList.add('fxq-bd');
    if (!root._xqBound) { root.addEventListener('click', boardClick); root._xqBound = true; }
    drawBoard(root);
    return root;
  };

  /* ================================================================ game module */
  var CHN = { zn: '甄妮', xy: '小羽', jz: '俊治', by: '博育' };
  var MAX_PLY = 300;
  function chName(ch) {
    if (typeof FX !== 'undefined' && FX && FX.names && FX.names[ch]) return FX.names[ch];
    return CHN[ch] || ch || '玩家';
  }
  function rnd(st) { // mulberry32, state kept in st.rng
    var a = (st.rng = (st.rng + 0x6D2B79F5) >>> 0);
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pick(st, arr) { return arr[Math.floor(rnd(st) * arr.length)]; }
  function seatSide(seat) { return seat === 0 ? 'r' : 'b'; }
  function sideTxt(seat) { return seat === 0 ? '紅' : '黑'; }
  function q(ch, text, zh) {
    if (ch === 'zn' && zh === undefined) zh = text;
    return { q: zh !== undefined ? [ch, text, zh] : [ch, text] };
  }
  function attackersLeft(board) { return /[RNCPrncp]/.test(board.join('')); }

  function endGame(st, ev, winner, reason) {
    st.over = { winner: winner, loser: winner == null ? null : 1 - winner, reason: reason, draw: winner == null };
    st.drawOffer = null;
    ev.push({ sfx: winner == null ? 'pop' : 'win' });
    if (winner == null) {
      ev.push({ toast: '和棋（' + reason + '）' });
      ev.push(q('by', '和棋。大家都很有尊嚴。'));
      ev.push(q('jz', '完全法克。'));
      ev.push(q('by', '你又沒有下。'));
      return;
    }
    var w = st.seats[winner] || {}, l = st.seats[1 - winner] || {};
    ev.push({ toast: chName(w.ch) + '（' + sideTxt(winner) + '）勝！' + reason });
    if (w.ch === 'zn') ev.push(q('zn', 'Tôi thắng rồi!', '我贏了！'));
    else if (w.ch === 'xy') ev.push(q('xy', '神人。'));
    ev.push(q('by', '恭喜！'));
    ev.push(l.ch === 'zn' ? q('zn', '……', '……') : q(l.ch || 'xy', '……'));
    ev.push(q('jz', '完全法克。'));
    ev.push(q('by', '你只是輸棋。'));
    ev.push(q('jz', '對我來說一樣。'));
  }

  var RULES = [
    '<h3>大盤象棋 規則說明</h3>',
    '<p>紅方先走（座位 1 為紅、座位 2 為黑）。點自己的棋子會出現可走的點，再點目標位置即可走棋。</p>',
    '<ul>',
    '<li><b>帥/將</b>：在九宮內直走一步。<b>將帥不能照面</b>（同一直線中間沒有棋子）。</li>',
    '<li><b>仕/士</b>：在九宮內斜走一步。</li>',
    '<li><b>相/象</b>：走「田」字，不能過河；田字中心有子叫<b>塞象眼</b>，不能走。</li>',
    '<li><b>傌/馬</b>：走「日」字；直走方向緊鄰有子叫<b>蹩馬腿</b>，不能走。</li>',
    '<li><b>俥/車</b>：直線任意格數。</li>',
    '<li><b>炮/砲</b>：移動同車；吃子時必須隔一個棋子（炮架）。</li>',
    '<li><b>兵/卒</b>：只能前進一步；<b>過河後</b>可以左右橫走，但永遠不能後退。</li>',
    '</ul>',
    '<p>不能走出讓自己被將軍的棋（包含將帥照面）。輪到你時沒有任何合法步——不論是<b>將死</b>還是<b>困斃</b>——都算輸。</p>',
    '<p>可以<b>認輸</b>，或<b>提和</b>由對方決定是否<b>同意和棋</b>。雙方合計走滿 300 步、或雙方都沒有車馬炮兵時判和。</p>'
  ].join('');

  var mod = {
    title: '大盤象棋',

    init: function (opt) {
      opt = opt || {};
      var seats = (opt.seats || []).map(function (s, i) {
        return { seat: s.seat != null ? s.seat : i, ch: s.ch || (i === 0 ? 'zn' : 'xy'), name: s.name || '', bot: !!s.bot };
      });
      while (seats.length < 2) seats.push({ seat: seats.length, ch: seats.length === 0 ? 'zn' : 'xy', name: '', bot: true });
      return {
        seats: seats.slice(0, 2),
        rng: (opt.seed >>> 0) || 1,
        seed: (opt.seed >>> 0) || 1,
        board: XQ.START.slice(),
        turn: 0,
        ply: 0,
        hist: [],
        cap: { 0: [], 1: [] },
        last: null,
        check: false,
        drawOffer: null,
        offerPly: { 0: -99, 1: -99 },
        over: null
      };
    },

    act: function (state, seat, a) {
      if (!a || typeof a !== 'object') return { ok: false, msg: '不明的動作' };
      if (seat !== 0 && seat !== 1) return { ok: false, msg: '觀戰者不能下棋' };
      if (state.over) return { ok: false, msg: '這局已經結束了' };
      var st = JSON.parse(JSON.stringify(state)), ev = [], me = st.seats[seat] || {}, opp = 1 - seat, other = st.seats[opp] || {};
      switch (a.type) {
        case 'move': {
          if (st.turn !== seat) return { ok: false, msg: '還沒輪到你' };
          var mv = a.move || a;
          mv = { fr: mv.fr | 0, fc: mv.fc | 0, tr: mv.tr | 0, tc: mv.tc | 0 };
          if (!XQ.isLegal(st.board, seatSide(seat), mv)) {
            var leaves = gen(toInt(st.board), sideNum(seatSide(seat)), [], false).indexOf(encM(mv)) >= 0;
            return { ok: false, msg: leaves ? '不能送將（走了會被將軍）' : '不能這樣走' };
          }
          var moved = st.board[mv.fr][mv.fc], x = st.board[mv.tr][mv.tc];
          st.board = XQ.apply(st.board, mv);
          st.ply++;
          st.turn = opp;
          st.last = mv;
          st.hist.push({ fr: mv.fr, fc: mv.fc, tr: mv.tr, tc: mv.tc, p: moved, x: x });
          if (st.drawOffer != null) { if (st.drawOffer === opp) ev.push({ toast: chName(me.ch) + ' 沒有回應和棋，繼續下' }); st.drawOffer = null; }
          if (x !== '.') {
            st.cap[seat].push(x);
            ev.push({ sfx: 'hit' });
            if (me.ch === 'zn' && other.ch === 'xy' && (x === 'r' || x === 'R')) {
              ev.push(q('xy', '？？？'));
              ev.push(q('jz', 'Bang！'));
              ev.push(q('xy', '你不要在旁邊吵。'));
            } else if (me.ch === 'xy') {
              ev.push(q('xy', '神人。'));
            } else if (me.ch === 'zn') {
              if (rnd(st) < 0.6) ev.push(pick(st, [q('zn', 'Hay quá!', '太讚了！'), q('zn', 'Thần nhân!', '神人！'), q('zn', 'Đến lượt tôi!', '輪到我了！')]));
            } else if (rnd(st) < 0.4) ev.push(pick(st, [q('jz', 'Bang！'), q('by', '吃掉了欸。')]));
            if ((x === 'r' || x === 'R') && !(me.ch === 'zn' && other.ch === 'xy')) {
              if (rnd(st) < 0.5) ev.push(pick(st, [q('by', '車沒了欸……'), q('jz', 'Bang！')]));
            }
          } else ev.push({ sfx: 'tile' });
          var oppSide = seatSide(opp);
          var chk = XQ.inCheck(st.board, oppSide);
          st.check = chk;
          if (XQ.isMate(st.board, oppSide)) {
            endGame(st, ev, seat, chk ? '將死' : '困斃');
          } else {
            if (chk) {
              ev.push({ toast: '將軍！' });
              ev.push({ sfx: 'bad' });
              ev.push(pick(st, [q('jz', 'Bang！'), q('by', '將軍了欸。')]));
              if (other.ch === 'zn' && rnd(st) < 0.4) ev.push(q('zn', 'Ôi trời ơi!', '天啊！'));
            }
            if (st.ply >= MAX_PLY) endGame(st, ev, null, '已達 300 步');
            else if (!attackersLeft(st.board)) endGame(st, ev, null, '雙方都沒有進攻棋子');
          }
          return { ok: true, state: st, ev: ev };
        }
        case 'resign': {
          ev.push({ toast: chName(me.ch) + ' 認輸' });
          if (me.ch === 'zn') ev.push(q('zn', 'Không thể nào!', '不可能！'));
          endGame(st, ev, opp, '對方認輸');
          return { ok: true, state: st, ev: ev };
        }
        case 'offerDraw': {
          if (st.drawOffer != null) return { ok: false, msg: '已經有和棋提議了' };
          if (st.ply - st.offerPly[seat] < 2) return { ok: false, msg: '先走一步再提和吧' };
          st.drawOffer = seat;
          st.offerPly[seat] = st.ply;
          ev.push({ toast: chName(me.ch) + ' 提議和棋' }, { sfx: 'pop' });
          ev.push(me.ch === 'zn' ? q('zn', 'Chờ chút!', '等一下！和棋好嗎？') : q(me.ch, '和棋吧？'));
          ev.push(q('jz', '尊嚴之戰可以和嗎？'));
          return { ok: true, state: st, ev: ev };
        }
        case 'acceptDraw': {
          if (st.drawOffer !== opp) return { ok: false, msg: '對方沒有提和' };
          endGame(st, ev, null, '雙方同意和棋');
          return { ok: true, state: st, ev: ev };
        }
        case 'declineDraw': {
          if (st.drawOffer !== opp) return { ok: false, msg: '對方沒有提和' };
          st.drawOffer = null;
          ev.push({ toast: chName(me.ch) + ' 拒絕和棋' });
          ev.push(me.ch === 'zn' ? q('zn', 'Tôi sẽ thắng!', '我會贏！') : q(me.ch, '不要。'));
          return { ok: true, state: st, ev: ev };
        }
      }
      return { ok: false, msg: '不明的動作' };
    },

    bot: function (state, seat) {
      if (!state || state.over || (seat !== 0 && seat !== 1)) return null;
      if (state.drawOffer === 1 - seat) {
        var e = XQ.evaluate(state.board, seatSide(seat));
        return { type: e < -250 ? 'acceptDraw' : 'declineDraw' };
      }
      if (state.turn !== seat) return null;
      var m = XQ.bestMove(state.board, seatSide(seat), XQ.botTimeMs, (state.seed | 0) * 7919 + state.ply);
      if (!m) return null;
      return { type: 'move', fr: m.fr, fc: m.fc, tr: m.tr, tc: m.tc };
    },

    waiting: function (state) {
      if (!state || state.over) return [];
      var w = [state.turn];
      if (state.drawOffer != null && 1 - state.drawOffer !== state.turn) w.push(1 - state.drawOffer);
      return w;
    },

    result: function (state) {
      if (!state || !state.over) return null;
      var o = state.over, s0 = state.seats[0] || {}, s1 = state.seats[1] || {};
      if (o.draw) {
        return {
          rank: [0, 1], score: { 0: 0.5, 1: 0.5 }, draw: true,
          lines: ['和棋（' + o.reason + '）', chName(s0.ch) + '（紅）½', chName(s1.ch) + '（黑）½', '共 ' + state.ply + ' 步']
        };
      }
      var w = o.winner, l = 1 - w, sc = {};
      sc[w] = 1; sc[l] = 0;
      return {
        rank: [w, l], score: sc,
        lines: [chName(state.seats[w].ch) + '（' + sideTxt(w) + '）勝', chName(state.seats[l].ch) + '（' + sideTxt(l) + '）負', o.reason + '・共 ' + state.ply + ' 步']
      };
    },

    render: function (root, state, mySeat, send, ev) {
      injectCSS();
      var ui = root._xqUI;
      if (!ui || !root.contains(ui.boardEl)) {
        root.innerHTML = '';
        root.classList.add('fxq-root');
        root.innerHTML =
          '<div class="fxq-main"><div class="fxq-bcol"><div class="fxq-pl fxq-top"></div><div class="fxq-bwrap" style="position:relative"><div class="fxq-bd"></div></div><div class="fxq-pl fxq-bot"></div></div>' +
          '<div class="fxq-side"><div class="fxq-title">大盤象棋<small>尊嚴之戰・紅先黑後</small></div><div class="fxq-status"></div><div class="fxq-extra"></div><div class="fxq-btns"></div><div class="fxq-log"></div></div></div>';
        ui = root._xqUI = {
          boardEl: root.querySelector('.fxq-bd'), top: root.querySelector('.fxq-top'), bot: root.querySelector('.fxq-bot'),
          status: root.querySelector('.fxq-status'), extra: root.querySelector('.fxq-extra'), btns: root.querySelector('.fxq-btns'),
          log: root.querySelector('.fxq-log'), wrap: root.querySelector('.fxq-bwrap'), lastPly: -1, resignArm: 0, intro: false
        };
        root.addEventListener('click', function (e) {
          var t = e.target.closest && e.target.closest('[data-act]');
          if (!t || t.disabled) return;
          var act = t.getAttribute('data-act'), u = root._xqUI;
          if (act === 'rules') { showRules(root); return; }
          if (act === 'resign') {
            if (Date.now() - u.resignArm > 3000) { u.resignArm = Date.now(); t.textContent = '確定認輸？'; t.classList.add('gold'); setTimeout(function () { if (t.isConnected && t.textContent === '確定認輸？') { t.textContent = '認輸'; t.classList.remove('gold'); } }, 3000); return; }
            u.resignArm = 0; u.send && u.send({ type: 'resign' }); return;
          }
          if (u.send) u.send({ type: act });
        });
      }
      ui.send = send;
      var me = (mySeat === 0 || mySeat === 1) ? mySeat : -1;
      var flip = me === 1;
      var bottomSeat = flip ? 1 : 0, topSeat = 1 - bottomSeat;
      var over = state.over;

      function bar(seat) {
        var s = state.seats[seat] || {}, nm = chName(s.ch);
        var av = (typeof FX !== 'undefined' && FX.avatar) ? safe(function () { return FX.avatar(s.ch, 34); }, '') : '';
        if (!av) av = '<span style="color:' + ((typeof FX !== 'undefined' && FX.color && FX.color[s.ch]) || '#888') + '">' + nm.charAt(0) + '</span>';
        var caps = (state.cap[seat] || []).slice().sort(function (a, b) { return 'rcnbapRCNBAP'.indexOf(a) - 'rcnbapRCNBAP'.indexOf(b); }).map(function (x) {
          return '<span class="fxq-mini ' + XQ.sideOf(x) + '">' + PCH[x] + '</span>';
        }).join('');
        var st = '';
        if (over) st = over.draw ? '和' : (over.winner === seat ? '勝' : '負');
        else if (state.turn === seat) st = seat === me ? '輪到你' : '思考中…';
        var extra = s.name && s.name !== nm ? ' <span style="font-weight:500;color:#9a8a78;font-size:12px">' + esc(s.name) + '</span>' : '';
        return '<div class="fxq-av">' + av + '</div><div class="fxq-pn"><div class="fxq-nm">' + esc(nm) + extra +
          '<span class="fxq-tag ' + seatSide(seat) + '">' + sideTxt(seat) + (seat === me ? '・你' : '') + '</span></div><div class="fxq-caps">' + caps + '</div></div><div class="fxq-st">' + st + '</div>';
      }
      ui.top.innerHTML = bar(topSeat);
      ui.bot.innerHTML = bar(bottomSeat);
      ui.top.classList.toggle('fxq-turn', !over && state.turn === topSeat);
      ui.bot.classList.toggle('fxq-turn', !over && state.turn === bottomSeat);

      var canMove = !over && me === state.turn;
      XQ.renderBoard(ui.boardEl, state.board, {
        flip: flip,
        selectable: canMove ? seatSide(me) : null,
        highlight: { last: state.last, check: state.check && !over ? seatSide(state.turn) : null },
        onMove: function (m) { send({ type: 'move', fr: m.fr, fc: m.fc, tr: m.tr, tc: m.tc }); }
      });

      // status line
      var stx, chk = !over && state.check;
      if (over) {
        stx = over.draw ? '和棋（' + over.reason + '）' : chName(state.seats[over.winner].ch) + '（' + sideTxt(over.winner) + '）勝！' + over.reason;
      } else {
        var who = chName((state.seats[state.turn] || {}).ch);
        stx = (chk ? '將軍！' : '') + (me === state.turn ? '輪到你走（' + sideTxt(me) + '方）' : '輪到 ' + who + '（' + sideTxt(state.turn) + '方）');
        if (me === -1) stx = (chk ? '將軍！' : '') + '觀戰中・輪到 ' + who + '（' + sideTxt(state.turn) + '）';
      }
      ui.status.textContent = stx;
      ui.status.className = 'fxq-status' + (chk ? ' chk' : '');

      // offer / result
      var ex = '';
      if (over) {
        var res = mod.result(state);
        ex = '<div class="fxq-over"><b>' + (over.draw ? '和棋' : '本局結束') + '</b>' + res.lines.map(esc).join('<br>') + '</div>';
      } else if (state.drawOffer != null) {
        if (me === 1 - state.drawOffer) ex = '<div class="fxq-offer">對方提議和棋<div class="fxq-btns"><button class="fxq-btn gold" data-act="acceptDraw">同意和棋</button><button class="fxq-btn ghost" data-act="declineDraw">拒絕</button></div></div>';
        else if (me === state.drawOffer) ex = '<div class="fxq-offer">已提議和棋，等待對方回應…</div>';
        else ex = '<div class="fxq-offer">' + esc(chName(state.seats[state.drawOffer].ch)) + ' 提議和棋中…</div>';
      }
      ui.extra.innerHTML = ex;

      var bt = '';
      if (me !== -1 && !over) {
        var canOffer = state.drawOffer == null && state.ply - state.offerPly[me] >= 2;
        bt += '<button class="fxq-btn" data-act="offerDraw"' + (canOffer ? '' : ' disabled') + '>提和</button>';
        bt += '<button class="fxq-btn red" data-act="resign">認輸</button>';
      }
      bt += '<button class="fxq-btn ghost" data-act="rules">規則說明</button>';
      ui.btns.innerHTML = bt;
      ui.log.textContent = state.ply ? '第 ' + state.ply + ' 步' + (state.hist.length ? '・' + moveText(state.hist[state.hist.length - 1]) : '') : '紅方先走';

      // check flash (once per ply)
      if (state.ply !== ui.lastPly) {
        if (ui.lastPly !== -1 && (chk || (over && !over.draw && over.reason === '將死'))) {
          var fl = document.createElement('div');
          fl.className = 'fxq-flash';
          fl.textContent = over ? '將死！' : '將軍！';
          ui.wrap.appendChild(fl);
          setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 1500);
        }
        ui.lastPly = state.ply;
      }
      // opening banter (no ev at init → played locally once per device)
      if (!ui.intro) {
        ui.intro = true;
        if (state.ply === 0 && !over && typeof FX !== 'undefined' && FX.quip) {
          var lines = [['jz', '你們兩個準備好了嗎？'], ['xy', '今天不是遊戲。'], ['jz', '那是什麼？'], ['xy', '尊嚴之戰。'], ['by', '不就是象棋嗎？'], ['xy', '閉嘴。']];
          lines.forEach(function (l, i) { setTimeout(function () { if (root._xqUI === ui) safe(function () { FX.quip(l[0], l[1]); }); }, 400 + i * 1500); });
        }
      }
    },

    // opening banter lines for hosts that prefer to show them themselves
    intro: [['jz', '你們兩個準備好了嗎？'], ['xy', '今天不是遊戲。'], ['jz', '那是什麼？'], ['xy', '尊嚴之戰。'], ['by', '不就是象棋嗎？'], ['xy', '閉嘴。']]
  };

  function moveText(h) {
    var nm = PCH[h.p] || '';
    var cols = '九八七六五四三二一';
    var red = h.p === h.p.toUpperCase();
    var fcn = red ? cols[h.fc] : String(h.fc + 1), tcn = red ? cols[h.tc] : String(h.tc + 1);
    return nm + ' ' + fcn + '→' + tcn + (h.x && h.x !== '.' ? ' 吃' + PCH[h.x] : '');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function safe(f, d) { try { return f(); } catch (e) { return d; } }
  function showRules(root) {
    var m = document.createElement('div');
    m.className = 'fxq-modal';
    m.innerHTML = '<div class="fxq-card">' + RULES + '<div style="text-align:center;margin-top:10px"><button class="fxq-btn">知道了</button></div></div>';
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('fxq-btn')) m.remove(); });
    root.appendChild(m);
  }

  G.XQ = XQ;
  XQ._mod = mod;
  if (typeof FINALE !== 'undefined' && FINALE && FINALE.register) FINALE.register('xiangqi', mod);
  else if (G.FINALE && G.FINALE.register) G.FINALE.register('xiangqi', mod);
})();
