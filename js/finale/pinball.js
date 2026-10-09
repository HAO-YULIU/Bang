/* 越南公主 — 最終小遊戲：甄妮的彈珠試煉（pinball）
 * 俯視角「打彈珠」。classic script；載入後呼叫 FINALE.register('pinball', mod)。
 * 物理引擎（純函式）也透過 mod._engine 匯出，供 node 測試使用。
 */
(function () {
  'use strict';

  /* ======================================================================
   * 物理引擎（純，不碰 DOM）
   * ==================================================================== */
  var W = 360, H = 560;          // 場地（世界座標）
  var FR = 16;                   // 木框厚度（只用於繪圖）
  var CW = W + FR * 2, CH = H + FR * 2;
  var DT = 1 / 240;              // 固定步長
  var R = 9;                     // 一般彈珠半徑
  var VMAX = 900;                // 滿力初速（單位/秒）
  var FA = 170, FK = 0.5;        // 滾動摩擦：減速度 = FA + FK*v
  var VSTOP = 6;                 // 低於此速度直接停下
  var E_BB = 0.94, E_WALL = 0.72, E_OBS = 0.6;
  var VCAP = 230;                // 經過洞口時低於此速度才會掉進去（太快會跳過洞口邊緣）
  var MAX_STEPS = 240 * 20;      // 一桿最多模擬 20 秒
  var MAXDRAG = 120;             // 拖曳多長算滿力（世界單位）

  // 關卡：mode = hit / hole / three / gold
  var LEVELS = [
    null,
    {
      id: 1, mode: 'hit', name: '第一關：擊中目標', tag: '擊中目標',
      goal: '把甄妮的粉紅彈珠往後拉、放開，打中粉筆圈裡的藍色彈珠！',
      shooter: [180, 470],
      balls: [{ k: 'target', x: 180, y: 220, r: 12, m: 1.4, col: 0 }],
      chalk: { x: 180, y: 220, r: 50 },
      obs: [], holes: [], movers: []
    },
    {
      id: 2, mode: 'hole', name: '第二關：進入指定洞口', tag: '指定洞口',
      goal: '讓你的彈珠滾進插著紅旗的洞！石頭擋路，要撞牆反彈。掉進其他洞＝這桿失敗。',
      shooter: [100, 490],
      balls: [],
      obs: [
        { t: 'c', x: 182, y: 300, r: 46, kind: 'stone' },
        { t: 's', x1: 30, y1: 210, x2: 92, y2: 250, r: 7, kind: 'root' }
      ],
      holes: [
        { x: 262, y: 118, r: 15, kind: 'goal' },
        { x: 84, y: 128, r: 15, kind: 'bad' },
        { x: 292, y: 398, r: 15, kind: 'bad' }
      ],
      movers: []
    },
    {
      id: 3, mode: 'three', name: '第三關：一桿連續擊中三個目標', tag: '一桿三中',
      goal: '一桿之內碰到三顆藍色彈珠！連鎖碰撞、撞牆反彈都算，順序不限。',
      shooter: [180, 490],
      balls: [
        { k: 'target', x: 120, y: 270, col: 0 },
        { k: 'target', x: 151, y: 239, col: 1 },
        { k: 'target', x: 182, y: 208, col: 2 }
      ],
      obs: [
        { t: 'c', x: 180, y: 300, r: 22, kind: 'stone' },
        { t: 's', x1: 250, y1: 330, x2: 320, y2: 300, r: 7, kind: 'root' }
      ],
      holes: [], movers: []
    },
    {
      id: 4, mode: 'gold', name: '最終關：金色彈珠', tag: '金色彈珠',
      goal: '用你的彈珠把金色彈珠撞進金色洞口！小心博育的拖鞋。你的彈珠掉洞＝失敗。',
      shooter: [180, 500],
      balls: [{ k: 'gold', x: 200, y: 168 }],
      obs: [
        { t: 'c', x: 150, y: 228, r: 20, kind: 'stone' },
        { t: 'c', x: 252, y: 222, r: 20, kind: 'stone' },
        { t: 's', x1: 40, y1: 160, x2: 100, y2: 190, r: 7, kind: 'root' }
      ],
      holes: [
        { x: 236, y: 82, r: 22, kind: 'gold' },
        { x: 70, y: 82, r: 15, kind: 'bad' },
        { x: 316, y: 300, r: 15, kind: 'bad' }
      ],
      // 博育：頭（圓）＋ 手上舉著的拖鞋（膠囊），左右來回
      movers: [{ cx: 180, cy: 372, amp: 105, per: 3.6, head: 13, slip: 40, sr: 7 }]
    }
  ];

  function hyp(x, y) { return Math.sqrt(x * x + y * y); }

  function moverX(m, t) { return m.cx + m.amp * Math.sin(2 * Math.PI * t / m.per); }
  function moverVX(m, t) { return m.amp * 2 * Math.PI / m.per * Math.cos(2 * Math.PI * t / m.per); }
  // 回傳博育的碰撞形狀（在時間 t）
  function moverShapes(m, t) {
    var x = moverX(m, t), vx = moverVX(m, t);
    return {
      x: x, vx: vx,
      head: { x: x, y: m.cy, r: m.head },
      slip: { x1: x + m.head + 2, y1: m.cy - 2, x2: x + m.head + 2 + m.slip, y2: m.cy - 2, r: m.sr }
    };
  }

  function makeWorld(li, t0) {
    var L = LEVELS[li];
    var w = {
      li: li, t: t0 || 0, steps: 0, shot: false, ev: [],
      balls: [], obs: L.obs, holes: L.holes, movers: L.movers,
      fl: { touch: {}, tHit: {}, cap: [] }
    };
    w.balls.push({ id: 0, k: 'shooter', x: L.shooter[0], y: L.shooter[1], vx: 0, vy: 0, r: R, m: 1, alive: true, col: 0 });
    for (var i = 0; i < L.balls.length; i++) {
      var b = L.balls[i];
      w.balls.push({ id: i + 1, k: b.k, x: b.x, y: b.y, vx: 0, vy: 0, r: b.r || R, m: b.m || 1, alive: true, col: b.col || 0 });
    }
    return w;
  }

  // angle：度（0 = 向右，90 = 向下，270 = 向上）；power 0..1
  function shoot(w, angle, power) {
    var p = Math.max(0.05, Math.min(1, +power || 0));
    var a = (+angle || 0) * Math.PI / 180;
    var s = w.balls[0];
    s.vx = Math.cos(a) * VMAX * p;
    s.vy = Math.sin(a) * VMAX * p;
    w.shot = true; w.steps = 0;
    w.fl = { touch: {}, tHit: {}, cap: [] };
  }

  function closestOnSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy;
    var t = l2 > 0 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return [x1 + dx * t, y1 + dy * t];
  }

  function bounceOff(w, b, px, py, rr, mvx, kind) {
    var dx = b.x - px, dy = b.y - py, d = hyp(dx, dy), min = b.r + rr;
    if (d >= min || d < 1e-9) return;
    var nx = dx / d, ny = dy / d;
    b.x = px + nx * min; b.y = py + ny * min;
    var rvx = b.vx - mvx, rvy = b.vy, vn = rvx * nx + rvy * ny;
    if (vn < 0) {
      b.vx -= (1 + E_OBS) * vn * nx;
      b.vy -= (1 + E_OBS) * vn * ny;
      if (-vn > 25) w.ev.push({ t: 'obs', b: b.id, x: px + nx * rr, y: py + ny * rr, imp: -vn, kind: kind });
    }
  }

  function step(w) {
    var dt = DT, bs = w.balls, i, j, b, a, s, ns;
    w.t += dt; w.steps++;
    // 摩擦 + 移動
    for (i = 0; i < bs.length; i++) {
      b = bs[i]; if (!b.alive) continue;
      s = hyp(b.vx, b.vy);
      if (s > 0) {
        ns = s - (FA + FK * s) * dt;
        if (ns < VSTOP) ns = 0;
        b.vx *= ns / s; b.vy *= ns / s;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
    }
    // 洞口
    for (i = 0; i < bs.length; i++) {
      b = bs[i]; if (!b.alive) continue;
      s = hyp(b.vx, b.vy);
      for (j = 0; j < w.holes.length; j++) {
        var h = w.holes[j], dx = h.x - b.x, dy = h.y - b.y, d = hyp(dx, dy);
        if (d < h.r - 2 && s < VCAP) {
          b.alive = false; b.cap = j; b.vx = 0; b.vy = 0;
          w.fl.cap.push({ b: b.id, h: j, kind: h.kind });
          w.ev.push({ t: 'hole', b: b.id, h: j, x: h.x, y: h.y });
          break;
        }
        // 洞口邊緣的小斜坡：慢的彈珠會被吸進去
        if (d < h.r + b.r * 0.7 && d > 1e-6 && s < 140) {
          var pull = 520 * dt;
          b.vx += dx / d * pull; b.vy += dy / d * pull;
        }
      }
    }
    // 牆（軟墊）
    for (i = 0; i < bs.length; i++) {
      b = bs[i]; if (!b.alive) continue;
      var hitw = 0;
      if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { hitw = -b.vx; b.vx = -b.vx * E_WALL; } }
      else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) { hitw = b.vx; b.vx = -b.vx * E_WALL; } }
      if (b.y < b.r) { b.y = b.r; if (b.vy < 0) { hitw = Math.max(hitw, -b.vy); b.vy = -b.vy * E_WALL; } }
      else if (b.y > H - b.r) { b.y = H - b.r; if (b.vy > 0) { hitw = Math.max(hitw, b.vy); b.vy = -b.vy * E_WALL; } }
      if (hitw > 40) w.ev.push({ t: 'wall', b: b.id, x: b.x, y: b.y, imp: hitw });
    }
    // 障礙物
    for (i = 0; i < bs.length; i++) {
      b = bs[i]; if (!b.alive) continue;
      for (j = 0; j < w.obs.length; j++) {
        var o = w.obs[j];
        if (o.t === 'c') bounceOff(w, b, o.x, o.y, o.r, 0, o.kind);
        else {
          var c = closestOnSeg(b.x, b.y, o.x1, o.y1, o.x2, o.y2);
          bounceOff(w, b, c[0], c[1], o.r, 0, o.kind);
        }
      }
      for (j = 0; j < w.movers.length; j++) {
        var ms = moverShapes(w.movers[j], w.t);
        bounceOff(w, b, ms.head.x, ms.head.y, ms.head.r, ms.vx, 'by');
        var sl = ms.slip, c2 = closestOnSeg(b.x, b.y, sl.x1, sl.y1, sl.x2, sl.y2);
        bounceOff(w, b, c2[0], c2[1], sl.r, ms.vx, 'slipper');
      }
    }
    // 彈珠互撞（彈性碰撞、考慮質量）
    for (i = 0; i < bs.length; i++) {
      a = bs[i]; if (!a.alive) continue;
      for (j = i + 1; j < bs.length; j++) {
        b = bs[j]; if (!b.alive) continue;
        var ex = b.x - a.x, ey = b.y - a.y, dd = hyp(ex, ey), mn = a.r + b.r;
        if (dd >= mn || dd < 1e-9) continue;
        var nx = ex / dd, ny = ey / dd, ov = mn - dd, ia = 1 / a.m, ib = 1 / b.m;
        a.x -= nx * ov * ia / (ia + ib); a.y -= ny * ov * ia / (ia + ib);
        b.x += nx * ov * ib / (ia + ib); b.y += ny * ov * ib / (ia + ib);
        var vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vr < 0) {
          var jj = -(1 + E_BB) * vr / (ia + ib);
          a.vx -= jj * ia * nx; a.vy -= jj * ia * ny;
          b.vx += jj * ib * nx; b.vy += jj * ib * ny;
          if (-vr > 4) {
            w.fl.touch[a.id + '-' + b.id] = 1;
            w.fl.tHit[a.id] = 1; w.fl.tHit[b.id] = 1;
            w.ev.push({ t: 'bb', a: a.id, b: b.id, x: a.x + nx * a.r, y: a.y + ny * a.r, imp: -vr });
          }
        }
      }
    }
  }

  function settled(w) {
    for (var i = 0; i < w.balls.length; i++) {
      var b = w.balls[i];
      if (b.alive && (b.vx !== 0 || b.vy !== 0)) return false;
    }
    return true;
  }

  // 判定：'win' | 'fail' | null（還在滾）
  function judge(w) {
    if (!w.shot) return null;
    var L = LEVELS[w.li], fl = w.fl, i, c;
    if (L.mode === 'hit') {
      if (fl.touch['0-1']) return 'win';
    } else if (L.mode === 'hole') {
      for (i = 0; i < fl.cap.length; i++) {
        c = fl.cap[i];
        if (c.b === 0) return c.kind === 'goal' ? 'win' : 'fail';
      }
    } else if (L.mode === 'three') {
      var n = 0;
      for (i = 1; i < w.balls.length; i++) if (fl.tHit[i]) n++;
      if (n >= w.balls.length - 1) return 'win';
    } else if (L.mode === 'gold') {
      for (i = 0; i < fl.cap.length; i++) {
        c = fl.cap[i];
        if (c.b === 0) return 'fail';
        if (w.balls[c.b].k === 'gold') return c.kind === 'gold' ? 'win' : 'fail';
      }
    }
    if (settled(w) || w.steps > MAX_STEPS) return 'fail';
    return null;
  }

  // 目前這桿碰到幾顆目標（第三關 HUD 用）
  function hitCount(w) {
    var n = 0;
    for (var i = 1; i < w.balls.length; i++) if (w.fl.tHit[i]) n++;
    return n;
  }

  function simulate(li, angle, power, t0) {
    var w = makeWorld(li, t0 || 0);
    shoot(w, angle, power);
    var r = null;
    while (r === null) { step(w); w.ev.length = 0; r = judge(w); }
    return { res: r, steps: w.steps, world: w };
  }

  var SWEEP_POWERS = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  function sweep(li, opts) {
    opts = opts || {};
    var stepA = opts.step || 0.5, pw = opts.powers || SWEEP_POWERS, ts = opts.t0s || [0];
    var ok = [], n = 0;
    for (var ti = 0; ti < ts.length; ti++)
      for (var pi = 0; pi < pw.length; pi++)
        for (var a = 0; a < 360; a += stepA) {
          n++;
          if (simulate(li, a, pw[pi], ts[ti]).res === 'win') ok.push({ angle: a, power: pw[pi], t0: ts[ti] });
        }
    return { n: n, ok: ok, rate: ok.length / n };
  }

  // 已知可過關的一桿（離線搜尋得到；首次使用時會再驗證一次，失敗就重新搜尋）
  var KNOWN = { 1: { angle: 270, power: 0.5, t0: 0 }, 2: { angle: 315.125, power: 0.7, t0: 0 }, 3: { angle: 213.875, power: 0.7, t0: 0 }, 4: { angle: 272.5, power: 0.6, t0: 0 } };
  var solveCache = {};
  function solve(li) {
    if (solveCache[li]) return solveCache[li];
    var k = KNOWN[li];
    if (k && simulate(li, k.angle, k.power, k.t0).res === 'win') return (solveCache[li] = k);
    // 搜尋：選擇「左右鄰近角度也會成功」的最穩一桿
    var pw = SWEEP_POWERS.concat([0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95]);
    var best = null, bestScore = -1, ts = LEVELS[li].movers.length ? [0, 0.9, 1.8, 2.7] : [0];
    for (var ti = 0; ti < ts.length; ti++)
      for (var pi = 0; pi < pw.length; pi++) {
        var run = 0;
        for (var a = 0; a < 360.25; a += 0.25) {
          var ok = simulate(li, a % 360, pw[pi], ts[ti]).res === 'win';
          if (ok) {
            run++;
            if (run > bestScore) { bestScore = run; best = { angle: +(a - (run - 1) * 0.125).toFixed(3) % 360, power: pw[pi], t0: ts[ti] }; }
          } else run = 0;
        }
      }
    if (best && simulate(li, best.angle, best.power, best.t0).res !== 'win') best = null;
    solveCache[li] = best;
    return best;
  }

  var ENGINE = {
    W: W, H: H, FR: FR, CW: CW, CH: CH, DT: DT, R: R, VMAX: VMAX, VCAP: VCAP, MAXDRAG: MAXDRAG,
    LEVELS: LEVELS, makeWorld: makeWorld, shoot: shoot, step: step, settled: settled, judge: judge,
    simulate: simulate, sweep: sweep, solve: solve, moverShapes: moverShapes, hitCount: hitCount, KNOWN: KNOWN
  };

  /* ======================================================================
   * 遊戲狀態（act 純函式）
   * ==================================================================== */
  var START_LINES = [
    ['xy', '甄妮，今天你要挑戰的是——'], ['jz', '台灣童年神物。'], ['by', '彈珠。'],
    ['zn', 'Bi ve?', '彈珠？'], ['xy', '對。'], ['jz', '看起來簡單。'],
    ['xy', '但我們小時候可是用這個決定人生。'], ['by', '你們小時候的人生也太隨便了吧。']
  ];
  var INTRO = {
    1: [['xy', '第一關：擊中目標。'], ['jz', '從你的彈珠往後拉，拉越長越大力，放開就彈出去。'], ['by', '打到粉筆圈裡那顆藍色彈珠就過關！']],
    2: [['xy', '第二關：進入指定洞口。'], ['by', '要進插紅旗的那個洞，掉進別的洞不算喔。'], ['jz', '中間有大石頭——撞牆反彈過去。'], ['xy', '太大力會跳過洞口，要剛剛好。']],
    3: [['xy', '第三關：一桿連續擊中三個目標。'], ['jz', '一桿要碰到三顆藍色彈珠，連鎖碰撞也算。'], ['by', '順序不限！撞牆反彈也可以！']],
    4: [['xy', '最終關：金色彈珠。'], ['jz', '用你的彈珠把金色彈珠撞進金色洞口。'], ['by', '學長叫我拿拖鞋在中間走來走去……對不起。'], ['xy', '你自己的彈珠掉進洞就不算。']]
  };
  var CLEAR_LINES = {
    1: [['xy', '神人！'], ['jz', 'Bang！']],
    2: [['xy', '神人！'], ['jz', 'Bang！'], ['zn', 'Hay quá!', '太讚了！']],
    3: [['xy', '神人！'], ['jz', 'Bang！'], ['by', '一桿三顆……學姊好強。']],
    4: [['xy', '神人！'], ['jz', 'Bang！'], ['by', '恭喜。'], ['zn', 'Tôi thắng rồi!', '我贏了！']]
  };
  var MISS_QUIPS = [
    ['xy', '……你是不是故意的。'], ['jz', '完全法克。'], ['by', '沒關係，再試一次！'], ['zn', 'Ôi trời ơi!', '天啊！']
  ];
  var TITLE = '🏆 越南公主・彈珠王';

  function totalShots(st) { var n = 0; for (var i = 0; i < st.shots.length; i++) n += st.shots[i]; return n; }
  function scoreOf(total) { return Math.max(100, Math.min(1000, 1000 - 60 * (total - 4))); }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function init(opts) {
    opts = opts || {};
    var seats = opts.seats || [{ seat: 0, ch: 'zn' }];
    return {
      v: 1, seed: (opts.seed | 0), ch: (seats[0] && seats[0].ch) || 'zn',
      started: false, level: 1, done: false,
      shots: [0, 0, 0, 0],   // 每關過關用了幾桿
      pend: 0                // bot / 伺服器模擬的本關累計桿數
    };
  }

  function qev(lines) { return lines.map(function (l) { return { q: l.slice() }; }); }

  function doClear(st, level, shots, ev) {
    st.shots[level - 1] = shots;
    st.pend = 0;
    ev.push({ sfx: level === 4 ? 'fanfare' : 'win' });
    ev.push.apply(ev, qev(CLEAR_LINES[level]));
    if (level >= 4) {
      st.done = true; st.level = 5;
      var tot = totalShots(st);
      ev.push({ toast: TITLE + '（總共 ' + tot + ' 桿）' });
    } else {
      st.level = level + 1;
      ev.push({ toast: LEVELS[st.level].name });
      ev.push.apply(ev, qev(INTRO[st.level]));
    }
  }

  function act(state, seat, a) {
    if (seat !== 0) return { ok: false, msg: '這是甄妮的單人挑戰' };
    if (!a || typeof a !== 'object') return { ok: false, msg: '動作格式錯誤' };
    var st = clone(state), ev = [];
    if (a.type === 'start') {
      if (st.started) return { ok: false, msg: '已經開始了' };
      st.started = true;
      ev.push({ sfx: 'click' });
      ev.push.apply(ev, qev(START_LINES));
      ev.push({ toast: LEVELS[1].name });
      ev.push.apply(ev, qev(INTRO[1]));
      return { ok: true, state: st, ev: ev };
    }
    if (!st.started) return { ok: false, msg: '還沒開始' };
    if (st.done) return { ok: false, msg: '已經全部過關了' };
    if (a.type === 'clear') {
      var lv = a.level, sh = a.shots;
      if (lv !== st.level) return { ok: false, msg: '關卡不符' };
      if (typeof sh !== 'number' || sh !== Math.floor(sh) || sh < 1 || sh > 999) return { ok: false, msg: '桿數不正確' };
      doClear(st, lv, sh, ev);
      return { ok: true, state: st, ev: ev };
    }
    if (a.type === 'shot') {
      // 伺服器端模擬一桿（bot 代打用；決定論物理）
      if (a.level !== undefined && a.level !== st.level) return { ok: false, msg: '關卡不符' };
      var ang = +a.angle, pw = +a.power, t0 = +(a.t0 || 0);
      if (!isFinite(ang) || !isFinite(pw) || !isFinite(t0) || pw <= 0 || pw > 1) return { ok: false, msg: '這桿不合法' };
      st.pend = Math.min(999, (st.pend | 0) + 1);
      var r = simulate(st.level, ang, pw, t0).res;
      if (r === 'win') doClear(st, st.level, st.pend, ev);
      else {
        ev.push({ sfx: 'bad' });
        ev.push({ q: MISS_QUIPS[(st.pend - 1) % MISS_QUIPS.length].slice() });
      }
      return { ok: true, state: st, ev: ev };
    }
    return { ok: false, msg: '不認得的動作' };
  }

  function bot(state, seat) {
    if (seat !== undefined && seat !== 0) return null;
    if (!state.started) return { type: 'start' };
    if (state.done) return null;
    var s = solve(state.level);
    if (s) return { type: 'shot', level: state.level, angle: s.angle, power: s.power, t0: s.t0 };
    // 退路：直接瞄準第一顆彈珠、中等力道
    var L = LEVELS[state.level], tx = L.balls.length ? L.balls[0].x : W / 2, ty = L.balls.length ? L.balls[0].y : 0;
    return { type: 'shot', level: state.level, angle: Math.atan2(ty - L.shooter[1], tx - L.shooter[0]) * 180 / Math.PI, power: 0.55, t0: 0 };
  }

  function waiting(state) { return state.done ? [] : [0]; }

  function result(state) {
    if (!state.done) return null;
    var tot = totalShots(state);
    return { rank: [0], score: { 0: scoreOf(tot) }, lines: ['總共 ' + tot + ' 桿', '稱號：越南公主・彈珠王'] };
  }

  /* ======================================================================
   * 畫面（render）
   * ==================================================================== */
  var CSS = [
    '.fpb-wrap{position:relative;font-family:"Noto Sans TC",sans-serif;color:#2A2230;background:#FFF6E8;border-radius:18px;padding:10px 10px 12px;box-sizing:border-box;max-width:100%;overflow:hidden;user-select:none;-webkit-user-select:none}',
    '.fpb-wrap *{box-sizing:border-box}',
    '.fpb-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.fpb-title{font-family:"Noto Serif TC",serif;font-weight:900;font-size:18px;color:#E8453C;letter-spacing:1px;flex:1 1 auto;white-space:nowrap}',
    '.fpb-btn{appearance:none;border:2px solid #2A2230;background:#FFFDF8;color:#2A2230;border-radius:999px;padding:4px 12px;font:700 13px "Noto Sans TC",sans-serif;cursor:pointer;box-shadow:0 2px 0 #2A2230}',
    '.fpb-btn:active{transform:translateY(2px);box-shadow:none}',
    '.fpb-btn.fpb-main{background:#E8453C;color:#FFFDF8;font-size:17px;padding:10px 26px}',
    '.fpb-lvs{display:flex;gap:4px;margin-top:6px}',
    '.fpb-lv{flex:1;text-align:center;font-size:11px;font-weight:700;border-radius:8px;padding:3px 2px;background:#f1e4cf;color:#8b7a6a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.fpb-lv.on{background:#2BA6A0;color:#fff}',
    '.fpb-lv.ok{background:#F2B33D;color:#2A2230}',
    '.fpb-goal{margin-top:6px;background:#FFFDF8;border:2px dashed #2BA6A0;border-radius:12px;padding:6px 10px;font-size:13px;line-height:1.45;min-height:2.9em}',
    '.fpb-goal b{color:#E8453C}',
    '.fpb-stat{display:flex;justify-content:space-between;font-size:12px;margin-top:4px;color:#6b5a50}',
    '.fpb-stat b{color:#2A2230;font-size:14px}',
    '.fpb-stage{display:flex;justify-content:center;align-items:flex-start;gap:10px;margin-top:6px}',
    '.fpb-side{display:flex;flex-direction:column;gap:14px;padding-top:40px;width:84px;flex:0 0 84px}',
    '.fpb-npc{display:flex;flex-direction:column;align-items:center;font-size:12px;font-weight:700;color:#2A2230;transition:transform .2s}',
    '.fpb-npc .fpb-av{width:54px;height:54px;border-radius:50%;background:#FFFDF8;border:3px solid currentColor;display:flex;align-items:center;justify-content:center;overflow:hidden;animation:fpb-bob 1.6s ease-in-out infinite}',
    '.fpb-npc .fpb-av img{width:100%;height:100%;display:block}',
    '.fpb-npc:nth-child(2) .fpb-av{animation-delay:.3s}.fpb-npc:nth-child(3) .fpb-av{animation-delay:.6s}',
    '.fpb-npc.cheer .fpb-av{animation:fpb-jump .45s ease-out 3}',
    '.fpb-npc .fpb-nm{margin-top:2px;background:#FFFDF8;border-radius:999px;padding:0 8px;border:1px solid #e6d6bf}',
    '@keyframes fpb-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}',
    '@keyframes fpb-jump{0%,100%{transform:translateY(0) rotate(0)}40%{transform:translateY(-12px) rotate(-8deg)}}',
    '.fpb-cv{position:relative;flex:0 0 auto;line-height:0}',
    '.fpb-cv canvas{display:block;touch-action:none;border-radius:14px;box-shadow:0 6px 18px rgba(42,34,48,.25);cursor:crosshair}',
    '.fpb-hint{text-align:center;font-size:12px;color:#6b5a50;margin-top:6px}',
    '.fpb-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(42,34,48,.55);z-index:5;padding:16px}',
    '.fpb-card{background:#FFFDF8;border-radius:18px;padding:18px 18px 16px;max-width:420px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,.35);border:3px solid #F2B33D;max-height:100%;overflow:auto}',
    '.fpb-card h3{margin:0 0 8px;font-family:"Noto Serif TC",serif;color:#E8453C;font-size:20px}',
    '.fpb-card p,.fpb-card li{font-size:14px;line-height:1.6;margin:4px 0}',
    '.fpb-card ul{padding-left:20px;margin:6px 0}',
    '.fpb-card .fpb-cta{text-align:center;margin-top:12px}',
    '.fpb-final{text-align:center}',
    '.fpb-final .fpb-crown{font-size:46px;line-height:1.1}',
    '.fpb-final .fpb-big{font-family:"Noto Serif TC",serif;font-weight:900;font-size:26px;color:#E8453C;margin:6px 0}',
    '.fpb-final .fpb-score{font-size:34px;font-weight:900;color:#F2B33D;text-shadow:0 2px 0 #2A2230}',
    '.fpb-final table{margin:8px auto 0;border-collapse:collapse;font-size:14px}',
    '.fpb-final td{padding:2px 10px;border-bottom:1px dashed #e6d6bf}',
    '@media (max-width:700px){',
    ' .fpb-stage{flex-direction:column;align-items:center;gap:4px}',
    ' .fpb-side{flex-direction:row;padding-top:0;width:auto;flex:0 0 auto;gap:18px;justify-content:center}',
    ' .fpb-npc{flex-direction:row;gap:4px}',
    ' .fpb-npc .fpb-av{width:34px;height:34px;border-width:2px}',
    ' .fpb-side.fpb-r{display:none}',
    ' .fpb-title{font-size:16px}',
    '}'
  ].join('\n');

  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('fpb-style')) return;
    var s = document.createElement('style'); s.id = 'fpb-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function fx() { return (typeof FX !== 'undefined' && FX) ? FX : null; }
  function sfx(n) { try { var f = fx(); if (f && f.sfx) f.sfx(n); } catch (e) { /* 忽略 */ } }
  function quip(l) { try { var f = fx(); if (f && f.quip) f.quip(l[0], l[1], l[2]); } catch (e) { /* 忽略 */ } }
  function nameOf(ch) { var f = fx(); return (f && f.names && f.names[ch]) || { zn: '甄妮', xy: '小羽', jz: '俊治', by: '博育' }[ch]; }
  function colorOf(ch) { var f = fx(); return (f && f.color && f.color[ch]) || { zn: '#E86A8F', xy: '#3E8ED0', jz: '#2B2B33', by: '#5BAF7A' }[ch]; }
  function avatarHTML(ch, px) {
    try { var f = fx(); if (f && f.avatar) return f.avatar(ch, px); } catch (e) { /* 忽略 */ }
    return '<span style="font-size:' + Math.round(px * 0.45) + 'px">' + nameOf(ch).charAt(0) + '</span>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var RULES_HTML =
    '<h3>規則說明・甄妮的彈珠試煉</h3>' +
    '<p>台灣小時候的「打彈珠」！從上往下看庭院地面，用你的<b>粉紅色彈珠</b>去彈。</p>' +
    '<ul>' +
    '<li><b>操作：</b>在場地上按住，往<b>想打的反方向</b>拖曳（像拉彈弓），拉越長越大力，放開就彈出去。瞄準線只會顯示一小段，剩下靠手感！</li>' +
    '<li><b>物理：</b>彈珠會因摩擦慢慢停下；撞牆、撞石頭、樹根會反彈；彈珠互撞會把對方撞走。</li>' +
    '<li><b>洞口：</b>滾得夠慢經過洞口才會掉進去，太快會跳過洞口邊緣。</li>' +
    '<li><b>第一關：</b>打中粉筆圈裡的藍色彈珠。</li>' +
    '<li><b>第二關：</b>讓自己的彈珠進入插紅旗的洞；掉進其他洞這桿失敗。石頭擋路，要撞牆反彈。</li>' +
    '<li><b>第三關：</b>一桿之內碰到三顆藍色彈珠（連鎖碰撞、反彈都算，順序不限）。</li>' +
    '<li><b>最終關：</b>把金色彈珠撞進金色洞口。自己的彈珠掉洞、金色彈珠掉錯洞＝失敗。博育會拿著拖鞋走來走去擋路。</li>' +
    '<li><b>計分：</b>每關無限次嘗試，但會計桿數。總分 = 1000 − 60 ×（總桿數 − 4），最低 100 分。</li>' +
    '</ul>';

  // ---------- 繪圖工具 ----------
  var MCOL = {
    shooter: ['#ffd0de', '#E86A8F', '#9c2f55', '#fff3a8'],
    target: [['#cfe7ff', '#3E8ED0', '#1d4f80', '#ffffff'], ['#c9f2ee', '#2BA6A0', '#136560', '#ffe28a'], ['#d9d4ff', '#6f62d6', '#3a3090', '#ffd0de']],
    gold: ['#fff4c2', '#F2B33D', '#9a6410', '#ffffff']
  };

  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function drawMarble(g, x, y, r, pal, spin, t) {
    // 影子
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.beginPath(); g.ellipse(x + r * 0.35, y + r * 0.45, r * 1.0, r * 0.8, 0, 0, Math.PI * 2); g.fill();
    var gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    gr.addColorStop(0, pal[0]); gr.addColorStop(0.55, pal[1]); gr.addColorStop(1, pal[2]);
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    // 貓眼花紋
    g.save();
    g.beginPath(); g.arc(x, y, r * 0.92, 0, Math.PI * 2); g.clip();
    g.translate(x, y); g.rotate(spin || 0);
    g.strokeStyle = pal[3]; g.globalAlpha = 0.75; g.lineWidth = r * 0.28; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-r * 0.7, r * 0.15); g.quadraticCurveTo(0, -r * 0.55, r * 0.7, r * 0.1); g.stroke();
    g.globalAlpha = 0.5; g.lineWidth = r * 0.16;
    g.beginPath(); g.moveTo(-r * 0.55, r * 0.5); g.quadraticCurveTo(0, r * 0.05, r * 0.6, r * 0.55); g.stroke();
    g.restore();
    // 高光
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.beginPath(); g.ellipse(x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.17, -0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, r - 0.5, 0, Math.PI * 2); g.stroke();
  }

  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  function drawStone(g, o, seed) {
    var n = 11, i, pts = [];
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, k = 1 + (hash(seed * 13 + i) - 0.5) * 0.12;
      pts.push([o.x + Math.cos(a) * o.r * k, o.y + Math.sin(a) * o.r * k]);
    }
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.beginPath(); g.ellipse(o.x + o.r * 0.18, o.y + o.r * 0.25, o.r * 1.02, o.r * 0.95, 0, 0, Math.PI * 2); g.fill();
    var gr = g.createRadialGradient(o.x - o.r * 0.4, o.y - o.r * 0.45, o.r * 0.1, o.x, o.y, o.r * 1.1);
    gr.addColorStop(0, '#c9c2b8'); gr.addColorStop(0.6, '#8e867c'); gr.addColorStop(1, '#5a534c');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= n; i++) { var p = pts[i % n], q = pts[(i + 1) % n]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    g.fill();
    g.fillStyle = 'rgba(255,255,255,.25)';
    g.beginPath(); g.ellipse(o.x - o.r * 0.35, o.y - o.r * 0.4, o.r * 0.3, o.r * 0.16, -0.5, 0, Math.PI * 2); g.fill();
    // 苔蘚
    g.fillStyle = 'rgba(91,175,122,.55)';
    for (i = 0; i < 4; i++) {
      var aa = Math.PI * (0.9 + hash(seed + i * 7) * 0.8);
      g.beginPath(); g.arc(o.x + Math.cos(aa) * o.r * 0.7, o.y + Math.sin(aa) * o.r * 0.7, o.r * (0.1 + hash(seed + i) * 0.1), 0, Math.PI * 2); g.fill();
    }
  }

  function drawRoot(g, o) {
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = o.r * 2 + 2;
    g.beginPath(); g.moveTo(o.x1 + 2, o.y1 + 3); g.lineTo(o.x2 + 2, o.y2 + 3); g.stroke();
    g.strokeStyle = '#6e4628'; g.lineWidth = o.r * 2;
    g.beginPath(); g.moveTo(o.x1, o.y1); g.lineTo(o.x2, o.y2); g.stroke();
    g.strokeStyle = '#9b6a3f'; g.lineWidth = o.r * 0.7;
    g.beginPath(); g.moveTo(o.x1, o.y1 - o.r * 0.35); g.lineTo(o.x2, o.y2 - o.r * 0.35); g.stroke();
    // 小分枝
    var mx = (o.x1 + o.x2) / 2, my = (o.y1 + o.y2) / 2;
    g.strokeStyle = '#6e4628'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(mx, my); g.quadraticCurveTo(mx + 6, my + 12, mx + 2, my + 20); g.stroke();
  }

  function drawHole(g, h, t) {
    var gr = g.createRadialGradient(h.x, h.y, 1, h.x, h.y, h.r + 3);
    gr.addColorStop(0, '#000'); gr.addColorStop(0.7, '#120a07'); gr.addColorStop(0.92, '#3a281c'); gr.addColorStop(1, 'rgba(90,60,40,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(h.x, h.y, h.r + 3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,230,190,.18)'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(h.x, h.y + 0.5, h.r + 1, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    if (h.kind === 'goal' || h.kind === 'gold') {
      var col = h.kind === 'goal' ? '#E8453C' : '#F2B33D';
      g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([5, 4]);
      g.beginPath(); g.arc(h.x, h.y, h.r + 6, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      // 小旗子
      var fx0 = h.x + h.r + 4, fy0 = h.y - h.r - 2;
      g.strokeStyle = '#FFFDF8'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(fx0, fy0 + 10); g.lineTo(fx0, fy0 - 22); g.stroke();
      g.fillStyle = col;
      g.beginPath(); g.moveTo(fx0, fy0 - 22); g.lineTo(fx0 + 18, fy0 - 16); g.lineTo(fx0, fy0 - 10); g.closePath(); g.fill();
      g.fillStyle = h.kind === 'goal' ? '#FFFDF8' : '#2A2230';
      g.font = '700 8px "Noto Sans TC",sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText(h.kind === 'goal' ? '目標' : '金', fx0 + 2, fy0 - 16);
    } else {
      g.strokeStyle = 'rgba(232,69,60,.0)';
    }
  }

  function buildBackground(ctx) {
    var L = LEVELS[ctx.level <= 4 ? ctx.level : 4], s = ctx.scale * ctx.dpr;
    var c = ctx.bg || document.createElement('canvas');
    c.width = Math.round(CW * s); c.height = Math.round(CH * s);
    var g = c.getContext('2d');
    g.setTransform(s, 0, 0, s, 0, 0);
    // 木框
    var wg = g.createLinearGradient(0, 0, CW, CH);
    wg.addColorStop(0, '#8a5a34'); wg.addColorStop(1, '#5e3a20');
    g.fillStyle = wg; rr(g, 0, 0, CW, CH, 14); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1;
    for (var k = 0; k < 14; k++) {
      var yy = 3 + k * (CH - 6) / 13;
      g.beginPath(); g.moveTo(2, yy); g.lineTo(FR - 3, yy + 3); g.stroke();
      g.beginPath(); g.moveTo(CW - FR + 3, yy); g.lineTo(CW - 2, yy + 3); g.stroke();
    }
    g.strokeStyle = 'rgba(255,220,170,.25)';
    g.beginPath(); g.moveTo(14, 3); g.lineTo(CW - 14, 3); g.stroke();
    // 泥土地
    g.save(); g.translate(FR, FR);
    g.beginPath(); rr(g, 0, 0, W, H, 6); g.clip();
    g.fillStyle = '#4a3427'; g.fillRect(0, 0, W, H);
    var i;
    for (i = 0; i < 900; i++) {
      var x = hash(i) * W, y = hash(i + 999) * H, rad = 0.5 + hash(i + 77) * 1.6;
      g.fillStyle = hash(i + 5) > 0.5 ? 'rgba(255,220,180,.07)' : 'rgba(0,0,0,.12)';
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    // 燈籠光暈
    var lights = [[60, 20], [180, 10], [300, 20], [W / 2, H * 0.62]];
    for (i = 0; i < lights.length; i++) {
      var lg = g.createRadialGradient(lights[i][0], lights[i][1], 5, lights[i][0], lights[i][1], i === 3 ? 260 : 190);
      lg.addColorStop(0, i === 3 ? 'rgba(255,200,120,.20)' : 'rgba(255,170,90,.33)'); lg.addColorStop(1, 'rgba(255,170,90,0)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
    }
    // 角落樹影（大安森林公園）
    g.fillStyle = 'rgba(10,30,20,.38)';
    var blobs = [[0, H, 70], [W, H - 20, 60], [W, 160, 40], [0, 330, 36]];
    for (i = 0; i < blobs.length; i++) {
      for (var j = 0; j < 6; j++) {
        g.beginPath();
        g.arc(blobs[i][0] + (hash(i * 10 + j) - 0.5) * blobs[i][2] * 1.3, blobs[i][1] + (hash(i * 10 + j + 3) - 0.5) * blobs[i][2] * 1.3, blobs[i][2] * (0.35 + hash(j + i) * 0.3), 0, Math.PI * 2);
        g.fill();
      }
    }
    // 落葉
    for (i = 0; i < 16; i++) {
      var lx = hash(i + 300) * W, ly = hash(i + 600) * H;
      g.save(); g.translate(lx, ly); g.rotate(hash(i + 900) * 6.28);
      g.fillStyle = hash(i + 12) > 0.5 ? 'rgba(160,190,90,.45)' : 'rgba(200,140,60,.4)';
      g.beginPath(); g.ellipse(0, 0, 5, 2.3, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // 起點標記
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.setLineDash([3, 4]); g.lineWidth = 1.5;
    g.beginPath(); g.arc(L.shooter[0], L.shooter[1], 18, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    // 粉筆圈
    if (L.chalk) {
      g.strokeStyle = 'rgba(255,253,248,.85)'; g.lineWidth = 3; g.setLineDash([10, 6]);
      g.beginPath(); g.arc(L.chalk.x, L.chalk.y, L.chalk.r, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(255,253,248,.75)'; g.font = '700 11px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('粉筆圈', L.chalk.x, L.chalk.y + L.chalk.r + 12);
    }
    // 洞
    for (i = 0; i < L.holes.length; i++) drawHole(g, L.holes[i]);
    // 障礙
    for (i = 0; i < L.obs.length; i++) {
      var o = L.obs[i];
      if (o.t === 'c') drawStone(g, o, i + ctx.level * 5); else drawRoot(g, o);
    }
    g.restore();
    // 頂部燈籠串
    g.strokeStyle = '#2A2230'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(4, 8); g.quadraticCurveTo(CW / 2, 26, CW - 4, 8); g.stroke();
    var lx2 = [52, 132, CW / 2, CW - 132, CW - 52];
    for (i = 0; i < lx2.length; i++) {
      var tt = lx2[i] / CW, ly2 = 8 + 4 * 18 * tt * (1 - tt) + 4;
      var glow = g.createRadialGradient(lx2[i], ly2 + 6, 1, lx2[i], ly2 + 6, 20);
      glow.addColorStop(0, 'rgba(255,190,90,.55)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
      g.fillStyle = glow; g.beginPath(); g.arc(lx2[i], ly2 + 6, 20, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#E8453C'; g.beginPath(); g.ellipse(lx2[i], ly2 + 6, 7, 8.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#F2B33D'; g.fillRect(lx2[i] - 4, ly2 - 3, 8, 2.5); g.fillRect(lx2[i] - 4, ly2 + 13, 8, 2.5);
      g.strokeStyle = 'rgba(255,230,160,.7)'; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(lx2[i], ly2 + 6, 3.5, 8.3, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#2A2230'; g.lineWidth = 1.2;
    }
    ctx.bg = c;
  }

  function drawBY(ctx, g, m, t) {
    var ms = moverShapes(m, t), x = ms.x, y = m.cy, sl = ms.slip;
    // 影子
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.beginPath(); g.ellipse(x + 3, y + 5, m.head + 2, m.head, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse((sl.x1 + sl.x2) / 2 + 3, sl.y1 + 5, m.slip / 2 + 6, m.sr + 1, 0, 0, Math.PI * 2); g.fill();
    // 手臂
    g.strokeStyle = '#f3c9a5'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + m.head - 3, y + 2); g.lineTo(sl.x1 + 6, sl.y1); g.stroke();
    // 拖鞋（藍白拖）
    g.fillStyle = '#3E8ED0'; rr(g, sl.x1 - 2, sl.y1 - m.sr, sl.x2 - sl.x1 + 4 + m.sr, m.sr * 2, m.sr); g.fill();
    g.fillStyle = '#FFFDF8'; rr(g, sl.x1, sl.y1 - m.sr + 2, sl.x2 - sl.x1 + m.sr, m.sr * 2 - 4, m.sr - 2); g.fill();
    g.strokeStyle = '#3E8ED0'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(sl.x1 + 10, sl.y1 - m.sr + 2); g.lineTo(sl.x1 + 18, sl.y1); g.lineTo(sl.x1 + 10, sl.y1 + m.sr - 2); g.stroke();
    // 頭
    if (ctx.byImg && ctx.byImg.complete && ctx.byImg.naturalWidth) {
      g.save(); g.beginPath(); g.arc(x, y, m.head, 0, Math.PI * 2); g.clip();
      g.fillStyle = '#FFFDF8'; g.fill();
      g.drawImage(ctx.byImg, x - m.head, y - m.head, m.head * 2, m.head * 2);
      g.restore();
      g.strokeStyle = '#5BAF7A'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, m.head, 0, Math.PI * 2); g.stroke();
    } else {
      g.fillStyle = '#5BAF7A'; g.beginPath(); g.arc(x, y, m.head, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f3d2b5'; g.beginPath(); g.arc(x, y + 2, m.head * 0.72, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2A2230';
      g.beginPath(); g.arc(x - 3.5, y + 1, 1.4, 0, Math.PI * 2); g.arc(x + 3.5, y + 1, 1.4, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#2A2230'; g.lineWidth = 1; g.beginPath(); g.arc(x, y + 4, 2.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    }
    g.fillStyle = 'rgba(42,34,48,.75)'; rr(g, x - 14, y + m.head + 3, 28, 13, 6); g.fill();
    g.fillStyle = '#FFFDF8'; g.font = '700 9px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('博育', x, y + m.head + 9.5);
  }

  function palFor(b) {
    if (b.k === 'shooter') return MCOL.shooter;
    if (b.k === 'gold') return MCOL.gold;
    return MCOL.target[b.col % 3];
  }

  function draw(ctx) {
    var g = ctx.g, s = ctx.scale * ctx.dpr, w = ctx.world, t = ctx.clock, i, b;
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (ctx.bg) g.drawImage(ctx.bg, 0, 0);
    g.setTransform(s, 0, 0, s, FR * s, FR * s);
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
    var L = LEVELS[w.li];
    // 掉進洞的彈珠（縮小動畫）
    for (i = 0; i < ctx.sinks.length; i++) {
      var sk = ctx.sinks[i], k = Math.min(1, (t - sk.t) / 0.35);
      if (k >= 1) continue;
      g.globalAlpha = 1 - k;
      drawMarble(g, sk.x0 + (sk.x - sk.x0) * k, sk.y0 + (sk.y - sk.y0) * k, sk.r * (1 - 0.6 * k), sk.pal, 0, t);
      g.globalAlpha = 1;
    }
    // 金洞閃爍
    for (i = 0; i < L.holes.length; i++) {
      var h = L.holes[i];
      if (h.kind === 'gold' || h.kind === 'goal') {
        var pa = 0.25 + 0.2 * Math.sin(t * 4);
        g.strokeStyle = h.kind === 'gold' ? 'rgba(242,179,61,' + pa + ')' : 'rgba(232,69,60,' + pa + ')';
        g.lineWidth = 6; g.beginPath(); g.arc(h.x, h.y, h.r + 11 + 2 * Math.sin(t * 4), 0, Math.PI * 2); g.stroke();
      }
    }
    // 軌跡
    for (i = 0; i < w.balls.length; i++) {
      b = w.balls[i]; var tr = ctx.trails[i];
      if (!tr || tr.length < 2) continue;
      g.lineCap = 'round';
      for (var q = 1; q < tr.length; q++) {
        g.strokeStyle = b.k === 'shooter' ? 'rgba(255,190,210,' + (q / tr.length * 0.35) + ')' : 'rgba(255,255,255,' + (q / tr.length * 0.22) + ')';
        g.lineWidth = b.r * 1.2 * q / tr.length;
        g.beginPath(); g.moveTo(tr[q - 1][0], tr[q - 1][1]); g.lineTo(tr[q][0], tr[q][1]); g.stroke();
      }
    }
    // 第三關：被碰過的目標加光圈
    for (i = 0; i < w.balls.length; i++) {
      b = w.balls[i]; if (!b.alive) continue;
      if (b.k !== 'shooter' && L.mode === 'three' && w.shot && w.fl.tHit[b.id]) {
        g.strokeStyle = '#F2B33D'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2); g.stroke();
      }
    }
    // 彈珠
    for (i = 0; i < w.balls.length; i++) {
      b = w.balls[i]; if (!b.alive) continue;
      ctx.spin[i] = (ctx.spin[i] || 0);
      drawMarble(g, b.x, b.y, b.r, palFor(b), ctx.spin[i], t);
      if (b.k === 'gold') {
        for (var sp = 0; sp < 3; sp++) {
          var an = t * 2 + sp * 2.1, sx = b.x + Math.cos(an) * (b.r + 6), sy = b.y + Math.sin(an) * (b.r + 6), ss = 2 + Math.sin(t * 6 + sp);
          g.fillStyle = 'rgba(255,240,170,.9)';
          g.beginPath(); g.moveTo(sx, sy - ss * 1.6); g.lineTo(sx + ss * 0.5, sy); g.lineTo(sx, sy + ss * 1.6); g.lineTo(sx - ss * 0.5, sy); g.closePath(); g.fill();
        }
      }
    }
    // 博育
    for (i = 0; i < w.movers.length; i++) drawBY(ctx, g, w.movers[i], w.t);
    // 甄妮標籤
    var sh = w.balls[0];
    if (sh.alive && ctx.mode === 'idle') {
      g.fillStyle = 'rgba(232,106,143,.92)'; rr(g, sh.x - 17, sh.y + sh.r + 6, 34, 14, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '700 9px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('甄妮', sh.x, sh.y + sh.r + 13);
      var pulse = 0.5 + 0.5 * Math.sin(t * 5);
      g.strokeStyle = 'rgba(255,253,248,' + (0.3 + pulse * 0.5) + ')'; g.lineWidth = 2;
      g.beginPath(); g.arc(sh.x, sh.y, sh.r + 4 + pulse * 3, 0, Math.PI * 2); g.stroke();
    }
    // 瞄準
    if (ctx.mode === 'aim' && ctx.drag && ctx.drag.pow > 0) {
      var d = ctx.drag, ang = d.ang * Math.PI / 180, cx = Math.cos(ang), cy = Math.sin(ang);
      var pull = d.pow * 70;
      // 橡皮筋
      g.strokeStyle = 'rgba(255,253,248,.7)'; g.lineWidth = 2; g.setLineDash([2, 3]);
      g.beginPath(); g.moveTo(sh.x, sh.y); g.lineTo(sh.x - cx * pull, sh.y - cy * pull); g.stroke(); g.setLineDash([]);
      g.fillStyle = 'rgba(232,106,143,.8)'; g.beginPath(); g.arc(sh.x - cx * pull, sh.y - cy * pull, 6, 0, Math.PI * 2); g.fill();
      // 力度弧
      var pc = d.pow < 0.5 ? '#2BA6A0' : (d.pow < 0.8 ? '#F2B33D' : '#E8453C');
      g.strokeStyle = pc; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.arc(sh.x, sh.y, sh.r + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * d.pow); g.stroke();
      // 有限長度的瞄準線
      var len = 34 + 56 * d.pow;
      for (var dd = 0; dd < len; dd += 7) {
        g.fillStyle = 'rgba(255,253,248,' + (0.95 * (1 - dd / len)) + ')';
        g.beginPath(); g.arc(sh.x + cx * (sh.r + 6 + dd), sh.y + cy * (sh.r + 6 + dd), 2.1, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = 'rgba(42,34,48,.75)'; rr(g, sh.x + 16, sh.y - 30, 52, 16, 8); g.fill();
      g.fillStyle = '#fff'; g.font = '700 10px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('力度 ' + Math.round(d.pow * 100) + '%', sh.x + 42, sh.y - 22);
    }
    // 粒子
    for (i = 0; i < ctx.parts.length; i++) {
      var p = ctx.parts[i], life = 1 - (t - p.t) / p.life;
      if (life <= 0) continue;
      g.globalAlpha = life;
      g.fillStyle = p.c;
      if (p.sq) { g.save(); g.translate(p.x, p.y); g.rotate(p.rot + t * 4); g.fillRect(-3, -1.5, 6, 3); g.restore(); }
      else { g.beginPath(); g.arc(p.x, p.y, p.r * (0.5 + life * 0.5), 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
    }
    // 螢火蟲
    for (i = 0; i < 7; i++) {
      var fxp = (hash(i + 40) * W + Math.sin(t * 0.4 + i) * 30 + W) % W, fyp = (hash(i + 80) * H + Math.cos(t * 0.33 + i * 2) * 26 + H) % H;
      var fa = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.7));
      g.fillStyle = 'rgba(255,240,140,' + fa + ')';
      g.beginPath(); g.arc(fxp, fyp, 1.8, 0, Math.PI * 2); g.fill();
    }
    // 橫幅
    if (ctx.banner) {
      var bn = ctx.banner, bt = t - bn.t;
      if (bt < bn.dur) {
        var al = Math.min(1, bt / 0.15, (bn.dur - bt) / 0.3);
        g.globalAlpha = al;
        var bh = bn.sub ? 66 : 48, by = H * 0.42 - bh / 2;
        g.fillStyle = bn.bg || 'rgba(42,34,48,.86)'; rr(g, 24, by, W - 48, bh, 16); g.fill();
        g.strokeStyle = bn.edge || '#F2B33D'; g.lineWidth = 3; rr(g, 24, by, W - 48, bh, 16); g.stroke();
        g.fillStyle = bn.fg || '#FFFDF8'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 ' + (bn.size || 22) + 'px "Noto Serif TC",serif';
        g.fillText(bn.text, W / 2, by + (bn.sub ? 24 : bh / 2));
        if (bn.sub) { g.font = '700 12px "Noto Sans TC",sans-serif'; g.fillText(bn.sub, W / 2, by + 48); }
        g.globalAlpha = 1;
      } else ctx.banner = null;
    }
    g.restore();
  }

  function spark(ctx, x, y, n, cols, spd, life, sq) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.6);
      ctx.parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1.5 + Math.random() * 1.8, c: cols[i % cols.length], t: ctx.clock, life: life * (0.6 + Math.random() * 0.4), sq: sq, rot: Math.random() * 6 });
    }
    if (ctx.parts.length > 260) ctx.parts.splice(0, ctx.parts.length - 260);
  }

  function updateParts(ctx, dt) {
    var keep = [];
    for (var i = 0; i < ctx.parts.length; i++) {
      var p = ctx.parts[i];
      if (ctx.clock - p.t > p.life) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
      if (p.sq) p.vy += 60 * dt;
      keep.push(p);
    }
    ctx.parts = keep;
  }

  // ---------- 主迴圈 ----------
  function resetLevel(ctx, keepT) {
    var t0 = keepT && ctx.world ? ctx.world.t : 0;
    ctx.world = makeWorld(ctx.level, t0);
    ctx.trails = []; ctx.sinks = []; ctx.spin = [];
    ctx.mode = 'idle'; ctx.outcome = null;
  }

  function loadLevel(ctx, lv) {
    ctx.level = lv;
    ctx.lvShots = 0;
    resetLevel(ctx, false);
    buildBackground(ctx);
    var L = LEVELS[lv];
    ctx.banner = { text: L.name, sub: '目標：' + L.tag, t: ctx.clock, dur: 2.4 };
    updateHUD(ctx);
  }

  function handleEvents(ctx) {
    var w = ctx.world, now = ctx.clock;
    for (var i = 0; i < w.ev.length; i++) {
      var e = w.ev[i];
      if (e.t === 'bb') {
        if (now - (ctx.lastSfx.bb || 0) > 0.06) { sfx('marble'); ctx.lastSfx.bb = now; }
        spark(ctx, e.x, e.y, Math.min(12, 3 + e.imp / 60), ['#fff7d6', '#ffe28a', '#ffffff'], 80 + e.imp * 0.15, 0.35);
      } else if (e.t === 'obs' || e.t === 'wall') {
        if (e.imp > 60 && now - (ctx.lastSfx.hit || 0) > 0.08) { sfx('hit'); ctx.lastSfx.hit = now; }
        if (e.imp > 80) spark(ctx, e.x, e.y, 4, e.kind === 'slipper' ? ['#3E8ED0', '#fff'] : ['#d8c7b0', '#a08a70'], 70, 0.3);
      } else if (e.t === 'hole') {
        sfx('pop');
        var b = w.balls[e.b];
        ctx.sinks.push({ x0: b.x, y0: b.y, x: e.x, y: e.y, r: b.r, pal: palFor(b), t: now });
        spark(ctx, e.x, e.y, 10, ['#FFFDF8', '#F2B33D'], 60, 0.5);
      }
    }
    w.ev.length = 0;
  }

  function frame(ctx, ts) {
    if (!ctx.canvas.isConnected) { ctx.running = false; return; }
    ctx.raf = requestAnimationFrame(function (t2) { frame(ctx, t2); });
    var dtR = ctx.lastTs ? Math.min(0.1, (ts - ctx.lastTs) / 1000) : 1 / 60;
    ctx.lastTs = ts;
    ctx.acc += dtR;
    var n = 0, w = ctx.world;
    while (ctx.acc >= DT && n < 60) {
      ctx.acc -= DT; n++;
      ctx.clock += DT;
      if (ctx.mode === 'roll' || ctx.mode === 'after') {
        step(w);
        handleEvents(ctx);
        if (ctx.mode === 'roll') {
          var r = judge(w);
          if (r) onOutcome(ctx, r);
        } else if (settled(w) || ctx.clock > ctx.afterUntil) {
          ctx.mode = 'pause';
        }
      } else if (ctx.mode !== 'done') {
        // 待機：只讓博育走動（彈珠靜止）
        if (w.movers.length) { step(w); w.ev.length = 0; }
      }
    }
    // 軌跡與旋轉
    for (var i = 0; i < w.balls.length; i++) {
      var b = w.balls[i];
      if (!ctx.trails[i]) ctx.trails[i] = [];
      var tr = ctx.trails[i];
      if (b.alive && (b.vx || b.vy)) {
        tr.push([b.x, b.y]); if (tr.length > 14) tr.shift();
        ctx.spin[i] = (ctx.spin[i] || 0) + hyp(b.vx, b.vy) * dtR / b.r * 0.5;
      } else if (tr.length) tr.shift();
    }
    updateParts(ctx, dtR);
    if (ctx.pendingT && ctx.clock >= ctx.pendingT) { var f = ctx.pending; ctx.pending = null; ctx.pendingT = 0; f(); }
    draw(ctx);
  }

  function onOutcome(ctx, r) {
    var w = ctx.world;
    ctx.outcome = r;
    if (r === 'win') {
      sfx('good');
      ctx.mode = 'after'; ctx.afterUntil = ctx.clock + 1.2;
      var big = ctx.level === 4;
      ctx.banner = { text: big ? '金色彈珠進洞！' : '過關！', sub: '本關 ' + ctx.lvShots + ' 桿', t: ctx.clock, dur: 2.0, bg: 'rgba(232,69,60,.92)' };
      var tgt = w.balls[0];
      spark(ctx, W / 2, H * 0.42, 40, ['#E8453C', '#F2B33D', '#2BA6A0', '#FFFDF8', '#E86A8F'], 220, 1.4, true);
      spark(ctx, tgt.x, tgt.y, 16, ['#F2B33D', '#FFFDF8'], 120, 0.8);
      cheer(ctx, ['xy', 'jz', 'by']);
      var lv = ctx.level, shots = ctx.lvShots;
      later(ctx, 1.9, function () {
        ctx.mode = 'wait';
        if (ctx.mySeat === 0 && ctx.send) ctx.send({ type: 'clear', level: lv, shots: shots });
      });
    } else {
      sfx('bad');
      ctx.mode = 'after'; ctx.afterUntil = ctx.clock + 0.6;
      var qi = (ctx.missN++) % MISS_QUIPS.length, ql = MISS_QUIPS[qi];
      quip(ql);
      cheer(ctx, [ql[0]]);
      var hint = missHint(ctx, w);
      ctx.banner = { text: '沒中！', sub: hint, t: ctx.clock, dur: 1.5, bg: 'rgba(42,34,48,.86)', edge: '#2BA6A0' };
      later(ctx, 1.5, function () { resetLevel(ctx, true); updateHUD(ctx); });
    }
  }

  function missHint(ctx, w) {
    var L = LEVELS[w.li], i, c;
    for (i = 0; i < w.fl.cap.length; i++) {
      c = w.fl.cap[i];
      if (c.b === 0) return L.mode === 'gold' ? '你的彈珠掉進洞了！' : '掉進錯的洞了！';
      if (w.balls[c.b].k === 'gold') return '金色彈珠掉錯洞了！';
    }
    if (L.mode === 'three') return '這桿碰到 ' + hitCount(w) + ' / 3 顆';
    if (L.mode === 'hole') return '太大力會跳過洞口喔';
    return '再瞄準一點，再試一次！';
  }

  function later(ctx, sec, f) { ctx.pending = f; ctx.pendingT = ctx.clock + sec; }

  function cheer(ctx, chs) {
    var els = ctx.el.querySelectorAll('.fpb-npc');
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (chs.indexOf(e.getAttribute('data-ch')) >= 0) {
        e.classList.remove('cheer'); void e.offsetWidth; e.classList.add('cheer');
      }
    }
  }

  function fire(ctx, angle, power, t0) {
    if (ctx.mode !== 'idle' || ctx.mySeat !== 0 || !ctx.state || ctx.state.done || !ctx.state.started) return false;
    if (typeof t0 === 'number') ctx.world.t = t0;
    ctx.lvShots++;
    ctx.lastShot = { angle: angle, power: power, t0: ctx.world.t };
    shoot(ctx.world, angle, power);
    ctx.mode = 'roll';
    ctx.banner = null;
    sfx('marble');
    updateHUD(ctx);
    return true;
  }

  function toWorld(ctx, e) {
    var rc = ctx.canvas.getBoundingClientRect();
    return [(e.clientX - rc.left) / rc.width * CW - FR, (e.clientY - rc.top) / rc.height * CH - FR];
  }

  function bindInput(ctx) {
    var cv = ctx.canvas;
    function down(e) {
      if (ctx.mode !== 'idle' || ctx.mySeat !== 0 || !ctx.state.started || ctx.state.done) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (er) { /* 忽略 */ }
      var p = toWorld(ctx, e);
      ctx.drag = { id: e.pointerId, sx: p[0], sy: p[1], ang: 0, pow: 0 };
      ctx.mode = 'aim';
    }
    function move(e) {
      if (ctx.mode !== 'aim' || !ctx.drag || e.pointerId !== ctx.drag.id) return;
      e.preventDefault();
      var p = toWorld(ctx, e), dx = p[0] - ctx.drag.sx, dy = p[1] - ctx.drag.sy, d = hyp(dx, dy);
      ctx.drag.pow = d < 6 ? 0 : Math.min(1, d / MAXDRAG);
      ctx.drag.ang = (Math.atan2(-dy, -dx) * 180 / Math.PI + 360) % 360;
    }
    function up(e) {
      if (ctx.mode !== 'aim' || !ctx.drag || e.pointerId !== ctx.drag.id) return;
      e.preventDefault();
      move(e);
      var d = ctx.drag; ctx.drag = null; ctx.mode = 'idle';
      if (d.pow >= 0.05) fire(ctx, d.ang, d.pow);
    }
    function cancel(e) { if (ctx.drag && e.pointerId === ctx.drag.id) { ctx.drag = null; if (ctx.mode === 'aim') ctx.mode = 'idle'; } }
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', cancel);
    cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function resize(ctx) {
    var el = ctx.el, avail = el.clientWidth - 20;
    var narrow = (typeof window !== 'undefined' && window.innerWidth <= 700);
    if (!narrow) avail -= 2 * (84 + 10);
    var vh = (typeof window !== 'undefined' ? window.innerHeight : 800);
    var byH = (vh - (narrow ? 236 : 176)) * CW / CH;
    var cw = Math.max(240, Math.min(avail, byH, 560));
    cw = Math.floor(cw);
    var dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    if (cw === ctx.cssW && dpr === ctx.dpr) return;
    ctx.cssW = cw; ctx.dpr = dpr; ctx.scale = cw / CW;
    var ch = Math.round(cw * CH / CW);
    ctx.canvas.style.width = cw + 'px'; ctx.canvas.style.height = ch + 'px';
    ctx.canvas.width = Math.round(cw * dpr); ctx.canvas.height = Math.round(ch * dpr);
    if (ctx.level) buildBackground(ctx);
  }

  function updateHUD(ctx) {
    var st = ctx.state, el = ctx.el; if (!st) return;
    var lvs = el.querySelectorAll('.fpb-lv');
    for (var i = 0; i < lvs.length; i++) {
      lvs[i].className = 'fpb-lv' + (st.level > i + 1 ? ' ok' : (st.level === i + 1 ? ' on' : ''));
    }
    var lv = Math.min(4, ctx.level || st.level), L = LEVELS[lv];
    el.querySelector('.fpb-goal').innerHTML = '<b>' + esc(L.name) + '</b><br>' + esc(L.goal);
    var done = totalShots(st);
    el.querySelector('.fpb-stat').innerHTML =
      '<span>本關桿數 <b>' + (st.done ? '-' : ctx.lvShots) + '</b></span>' +
      '<span>已過關累計 <b>' + done + '</b> 桿</span>' +
      '<span>' + (lv === 3 && ctx.world && ctx.world.shot ? '這桿碰到 <b>' + hitCount(ctx.world) + '</b>/3' : (st.done ? '全部過關！' : '無限次嘗試')) + '</span>';
  }

  function showOverlay(ctx, html, cls) {
    closeOverlay(ctx);
    var ov = document.createElement('div');
    ov.className = 'fpb-ov';
    ov.innerHTML = '<div class="fpb-card ' + (cls || '') + '">' + html + '</div>';
    ctx.el.appendChild(ov);
    ctx.ov = ov;
    return ov;
  }
  function closeOverlay(ctx) { if (ctx.ov && ctx.ov.parentNode) ctx.ov.parentNode.removeChild(ctx.ov); ctx.ov = null; }

  function showRules(ctx) {
    var ov = showOverlay(ctx, RULES_HTML + '<div class="fpb-cta"><button class="fpb-btn fpb-main" data-a="close">知道了！</button></div>');
    ov.addEventListener('click', function (e) {
      if (e.target === ov || (e.target.getAttribute && e.target.getAttribute('data-a') === 'close')) { closeOverlay(ctx); sync(ctx); }
    });
  }

  function showStart(ctx) {
    var html = '<h3>甄妮的彈珠試煉</h3>' +
      '<p>夜晚的大安森林公園，燈籠亮起來了。小羽、俊治、博育在庭院地上畫好了粉筆圈……</p>' +
      '<p>這是台灣小孩的童年神物——<b>打彈珠</b>。四關，每關無限次嘗試，但桿數越少分數越高！</p>' +
      '<p style="font-size:13px;color:#6b5a50">操作：在場地上按住往後拉（像彈弓），放開就彈出去。</p>' +
      '<div class="fpb-cta">' + (ctx.mySeat === 0 ? '<button class="fpb-btn fpb-main" data-a="start">開始挑戰！</button>' : '<p>等待甄妮開始……</p>') + '</div>';
    var ov = showOverlay(ctx, html);
    ctx.ovKind = 'start';
    var b = ov.querySelector('[data-a="start"]');
    if (b) b.addEventListener('click', function () { sfx('click'); b.disabled = true; if (ctx.send) ctx.send({ type: 'start' }); });
  }

  function showFinal(ctx) {
    var st = ctx.state, tot = totalShots(st), sc = scoreOf(tot), rows = '';
    for (var i = 1; i <= 4; i++) rows += '<tr><td>' + esc(LEVELS[i].name) + '</td><td><b>' + st.shots[i - 1] + '</b> 桿</td></tr>';
    var html = '<div class="fpb-final"><div class="fpb-crown">🏆</div>' +
      '<div class="fpb-big">越南公主・彈珠王</div>' +
      '<div>總共 <b>' + tot + '</b> 桿</div>' +
      '<div class="fpb-score">' + sc + ' 分</div>' +
      '<table>' + rows + '</table>' +
      '<p style="margin-top:10px">' + avatarHTML('zn', 40) + '</p>' +
      '<p><b style="color:#E86A8F">甄妮：</b>Tôi thắng rồi!<br><span style="color:#6b5a50;font-size:13px">（我贏了！）</span></p></div>';
    showOverlay(ctx, html);
    ctx.ovKind = 'final';
  }

  function sync(ctx) {
    var st = ctx.state;
    if (!st.started) { if (ctx.ovKind !== 'start' || !ctx.ov) showStart(ctx); return; }
    if (ctx.ovKind === 'start') { closeOverlay(ctx); ctx.ovKind = null; }
    if (st.done) {
      if (ctx.ovKind !== 'final' || !ctx.ov) {
        if (ctx.mode !== 'done') {
          ctx.mode = 'done';
          spark(ctx, W / 2, H * 0.3, 80, ['#E8453C', '#F2B33D', '#2BA6A0', '#FFFDF8', '#E86A8F'], 260, 2.2, true);
          ctx.banner = { text: TITLE, t: ctx.clock, dur: 999, bg: 'rgba(242,179,61,.95)', fg: '#2A2230', edge: '#E8453C', size: 20 };
        }
        showFinal(ctx);
      }
      updateHUD(ctx);
      return;
    }
    if (ctx.level !== st.level) loadLevel(ctx, st.level);
    updateHUD(ctx);
  }

  function build(root, ctx) {
    root.innerHTML = '';
    var el = document.createElement('div');
    el.className = 'fpb-wrap';
    var npc = function (ch) {
      return '<div class="fpb-npc" data-ch="' + ch + '" style="color:' + colorOf(ch) + '"><div class="fpb-av">' + avatarHTML(ch, 54) + '</div><div class="fpb-nm">' + esc(nameOf(ch)) + '</div></div>';
    };
    var lvHtml = '';
    for (var i = 1; i <= 4; i++) lvHtml += '<div class="fpb-lv">' + (i === 4 ? '終' : i) + '・' + esc(LEVELS[i].tag) + '</div>';
    el.innerHTML =
      '<div class="fpb-top"><div class="fpb-title">甄妮的彈珠試煉</div><button class="fpb-btn" data-a="rules">規則說明</button></div>' +
      '<div class="fpb-lvs">' + lvHtml + '</div>' +
      '<div class="fpb-goal"></div>' +
      '<div class="fpb-stat"></div>' +
      '<div class="fpb-stage">' +
      '<div class="fpb-side fpb-l">' + npc('xy') + npc('jz') + npc('by') + '</div>' +
      '<div class="fpb-cv"><canvas></canvas></div>' +
      '<div class="fpb-side fpb-r"><div class="fpb-npc" data-ch="zn" style="color:' + colorOf('zn') + '"><div class="fpb-av">' + avatarHTML('zn', 54) + '</div><div class="fpb-nm">' + esc(nameOf('zn')) + '</div></div></div>' +
      '</div>' +
      '<div class="fpb-hint">在場地上按住 → 往反方向拖曳（越長越大力）→ 放開彈出！</div>';
    root.appendChild(el);
    ctx.el = el;
    ctx.canvas = el.querySelector('canvas');
    ctx.g = ctx.canvas.getContext('2d');
    el.querySelector('[data-a="rules"]').addEventListener('click', function () { sfx('click'); showRules(ctx); ctx.ovKind = 'rules'; });
    // 博育的頭像給畫布用
    try {
      var tmp = document.createElement('div'); tmp.innerHTML = avatarHTML('by', 64);
      var im = tmp.querySelector('img');
      if (im && im.src) { var img = new Image(); img.src = im.src; ctx.byImg = img; }
    } catch (e) { /* 忽略 */ }
    bindInput(ctx);
  }

  function render(root, state, mySeat, send, ev) {
    injectCSS();
    var ctx = root.__fpb;
    if (!ctx || !ctx.el || ctx.el.parentNode !== root) {
      ctx = root.__fpb = {
        level: 0, mode: 'idle', clock: 0, acc: 0, lastTs: 0, parts: [], trails: [], sinks: [], spin: [],
        lastSfx: {}, missN: 0, lvShots: 0, ov: null, ovKind: null
      };
      build(root, ctx);
      ctx.state = state; ctx.mySeat = mySeat; ctx.send = send;
      resize(ctx);
      loadLevel(ctx, Math.min(4, state.level));
      if (typeof window !== 'undefined') {
        ctx.onResize = function () { if (!ctx.canvas.isConnected) { window.removeEventListener('resize', ctx.onResize); return; } resize(ctx); };
        window.addEventListener('resize', ctx.onResize);
      }
    }
    ctx.state = state; ctx.mySeat = mySeat; ctx.send = send;
    if (ctx.mode === 'wait' && state.level !== ctx.level) ctx.mode = 'idle';
    if (ctx.ovKind === 'rules' && ctx.ov) { /* 規則視窗開著：先不動 */ } else sync(ctx);
    if (!ctx.running) {
      ctx.running = true; ctx.lastTs = 0;
      ctx.raf = requestAnimationFrame(function (t) { frame(ctx, t); });
    }
    // 測試掛勾
    if (typeof window !== 'undefined' && window.__pbAuto) {
      window.__pbApi = {
        ctx: ctx,
        mode: function () { return ctx.mode; },
        level: function () { return ctx.level; },
        solve: function (lv) { return solve(lv || ctx.level); },
        auto: function () { var s = solve(ctx.level); return s ? fire(ctx, s.angle, s.power, s.t0) : false; },
        shoot: function (a, p, t0) { return fire(ctx, a, p, t0); },
        // 世界座標 → 視窗座標（給拖曳測試用）
        toClient: function (x, y) {
          var rc = ctx.canvas.getBoundingClientRect();
          return [rc.left + (x + FR) / CW * rc.width, rc.top + (y + FR) / CH * rc.height];
        },
        shooter: function () { var b = ctx.world.balls[0]; return [b.x, b.y]; },
        lastShot: function () { return ctx.lastShot; },
        outcome: function () { return ctx.outcome; }
      };
    }
  }

  var mod = {
    title: '甄妮的彈珠試煉',
    init: init, act: act, bot: bot, waiting: waiting, render: render, result: result,
    _engine: ENGINE, _solve: solve, _score: scoreOf, _missQuips: MISS_QUIPS
  };

  if (typeof FINALE !== 'undefined' && FINALE && FINALE.register) FINALE.register('pinball', mod);
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})();
