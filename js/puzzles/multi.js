'use strict';
// ===== 多人專屬題（只有 2～4 人連線時才會出現） =====
// 每一題都要大家同時配合：每個人看到的畫面不一樣、能做的事也不一樣。
// mpInit(n,G) → 共同狀態；mpAct(st, seat, v, n, G, now) → { st, solved?, wrong?, say? }；mpTick 主機每秒呼叫；mpView(el, ctx, st, first) 畫自己的畫面。
document.head.insertAdjacentHTML('beforeend', `<style>
.mp-role { background: #2A2230; color: #fff; border-radius: 12px; padding: 8px 12px; margin: 6px 0; font-size: 14px; }
.mp-role b { color: #FFD978; }
.mp-card { background: #F2ECFF; border-left: 5px solid #8A6ACF; border-radius: 10px; padding: 8px 12px; margin: 8px 0; }
.mp-who { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
.mp-who span { display: inline-flex; align-items: center; gap: 4px; background: #fff; border: 2px solid #E8DCC8; border-radius: 999px; padding: 2px 10px 2px 2px; font-size: 13px; }
.mp-who span.ok { border-color: #2BA670; background: #E2F8EA; }
.mp-who img { width: 26px; height: 26px; border-radius: 50%; }
.mp-big { display: block; width: 100%; font-size: 20px; padding: 16px; margin: 8px 0; }
.mp-dial { display: flex; align-items: center; justify-content: center; gap: 14px; margin: 8px 0; }
.mp-dial b { font: 900 46px var(--serif); width: 64px; text-align: center; background: #2A2230; color: #FFD978; border-radius: 12px; }
.mp-dial button { width: 52px; height: 52px; border-radius: 50%; border: 0; background: #FFE7B8; font-size: 24px; }
.mp-poses { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.mp-poses button { font-size: 28px; border: 2.5px solid #E8DCC8; background: #fff; border-radius: 12px; padding: 6px 0; }
.mp-poses button.on { border-color: #E8453C; background: #FFE7E2; }
.mp-grid { display: grid; gap: 3px; margin: 8px auto; width: min(100%, 340px); }
.mp-grid i { aspect-ratio: 1; border-radius: 6px; background: #EFE6D6; display: grid; place-items: center; font-style: normal; font-size: 20px; }
.mp-grid i.trap { background: #3A2A30; } .mp-grid i.goal { background: #FFD978; } .mp-grid i.me { background: #E86A8F; box-shadow: 0 0 0 3px #fff inset; }
.mp-pad { display: grid; grid-template-columns: repeat(3, 64px); gap: 6px; justify-content: center; margin: 8px 0; }
.mp-pad button { height: 56px; border-radius: 14px; border: 0; background: #2BA6A0; color: #fff; font-size: 24px; font-weight: 900; }
.mp-pad button:disabled { background: #D8D2C8; color: #fff; }
.mp-hold { user-select: none; -webkit-user-select: none; touch-action: none; }
.mp-hold.on { background: linear-gradient(180deg, #FF7468, #E8453C); color: #fff; transform: scale(.97); }
.mp-bar { height: 14px; background: #EFE6D6; border-radius: 999px; overflow: hidden; margin: 8px 0; }
.mp-bar i { display: block; height: 100%; background: linear-gradient(90deg, #F2B33D, #E8453C); transition: width .3s; }
.mp-river { position: relative; height: 90px; background: linear-gradient(180deg, #F7B880, #E8A070); border-radius: 12px; overflow: hidden; }
.mp-river span { position: absolute; top: 26px; font-size: 38px; transition: left .3s; }
.mp-river em { position: absolute; right: 8px; top: 8px; font-style: normal; font-weight: 900; color: #6A3A10; }
.mp-claw { max-width: 420px; margin: 0 auto; display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; background: #2A2052; padding: 8px; border-radius: 14px; }
.mp-claw i { aspect-ratio: 1; border-radius: 8px; background: rgba(255,255,255,.08); display: grid; place-items: center; font-style: normal; font-size: 26px; position: relative; }
.mp-claw i.at { box-shadow: 0 0 0 3px #FFD978 inset; } .mp-claw i.at::after { content: '🪝'; position: absolute; top: -6px; right: -2px; font-size: 18px; }
.mp-claw i small { position: absolute; bottom: 1px; font-size: 13px; color: #fff; }
.mp-menu { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.mp-menu button { border: 2.5px solid #E8DCC8; background: #fff; border-radius: 12px; padding: 8px; text-align: left; font-size: 14px; }
.mp-menu button.on { border-color: #2BA6A0; background: #E2F6F4; }
.mp-menu small { display: block; color: var(--muted); font-size: 11px; }
</style>`);

const MP = {
  ch: (G, seat) => G.players[seat]?.ch || 'zn',
  name: (G, seat) => CH[MP.ch(G, seat)]?.n || '',
  who: (G, fn) => `<div class="mp-who">${G.players.map((p, i) => `<span class="${fn(i) ? 'ok' : ''}"><img src="${PORTRAIT.head(p.ch)}">${CH[p.ch].n}${fn(i) ? ' ✓' : ''}</span>`).join('')}</div>`,
  seatOfCh: (G, ch) => G.players.findIndex(p => p.ch === ch),
};

// ---------- M1 故宮：交叉線索的展櫃鎖 ----------
const M1_T = { zn: 3, xy: 7, jz: 5, by: 2 };
const M1_PIC = {   // 每個角色的數字，畫成「數一數」的展品照片（干擾物長得很像）
  zn: ['玉璧（中間有圓孔的圓盤）', (s) => s.disc(3) + s.ring(2) + s.coin(3)],
  xy: ['青銅鈴（有吊環的鐘形）', (s) => s.bell(7) + s.cup(3)],
  jz: ['青花瓷碗（藍色花紋）', (s) => s.bowl(5) + s.bowlR(2)],
  by: ['卷軸（兩端有木軸）', (s) => s.scroll(2) + s.paper(3)],
};
const M1_S = (() => {
  let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pos = []; const at = () => { for (let k = 0; k < 200; k++) { const x = 20 + R() * 260, y = 20 + R() * 120; if (pos.every(([a, b]) => Math.hypot(a - x, b - y) > 34)) { pos.push([x, y]); return [x, y]; } } return [R() * 280, R() * 140]; };
  const rep = (n, f) => Array.from({ length: n }, () => f(...at())).join('');
  return {
    reset: () => { pos.length = 0; seed = 7; },
    disc: (n) => rep(n, (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="#7FBF8A" stroke="#3E7A4A" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#FFF9EC"/>`),
    ring: (n) => rep(n, (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#7FBF8A" stroke-width="6"/>`),
    coin: (n) => rep(n, (x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="#7FBF8A" stroke="#3E7A4A" stroke-width="2"/><rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" fill="#FFF9EC"/>`),
    bell: (n) => rep(n, (x, y) => `<path d="M${x - 11} ${y + 10} Q${x - 11} ${y - 10} ${x} ${y - 10} Q${x + 11} ${y - 10} ${x + 11} ${y + 10}Z" fill="#B8863A" stroke="#6A4A1A" stroke-width="2"/><circle cx="${x}" cy="${y - 14}" r="4" fill="none" stroke="#6A4A1A" stroke-width="2"/>`),
    cup: (n) => rep(n, (x, y) => `<path d="M${x - 11} ${y - 8} L${x + 11} ${y - 8} L${x + 7} ${y + 10} L${x - 7} ${y + 10}Z" fill="#B8863A" stroke="#6A4A1A" stroke-width="2"/>`),
    bowl: (n) => rep(n, (x, y) => `<path d="M${x - 14} ${y - 4} Q${x} ${y + 18} ${x + 14} ${y - 4}Z" fill="#fff" stroke="#3E6AA8" stroke-width="2"/><path d="M${x - 8} ${y + 2} q4 -4 8 0 q4 4 8 0" stroke="#3E6AA8" stroke-width="2" fill="none"/>`),
    bowlR: (n) => rep(n, (x, y) => `<path d="M${x - 14} ${y - 4} Q${x} ${y + 18} ${x + 14} ${y - 4}Z" fill="#fff" stroke="#C9332B" stroke-width="2"/><path d="M${x - 8} ${y + 2} q4 -4 8 0 q4 4 8 0" stroke="#C9332B" stroke-width="2" fill="none"/>`),
    scroll: (n) => rep(n, (x, y) => `<rect x="${x - 12}" y="${y - 9}" width="24" height="18" fill="#FFF3D6" stroke="#8A6A40" stroke-width="1.5"/><rect x="${x - 16}" y="${y - 11}" width="4" height="22" rx="2" fill="#6A4A2A"/><rect x="${x + 12}" y="${y - 11}" width="4" height="22" rx="2" fill="#6A4A2A"/>`),
    paper: (n) => rep(n, (x, y) => `<rect x="${x - 12}" y="${y - 9}" width="24" height="18" fill="#FFF3D6" stroke="#8A6A40" stroke-width="1.5"/><rect x="${x - 16}" y="${y - 11}" width="4" height="22" rx="2" fill="#6A4A2A"/>`),
  };
})();
P({
  id: 'm1_case', ch: 1, mp: true, t: '交叉線索的展櫃', lv: 2, icon: '🔐', pos: [50, 86],
  hint: '你看得到的照片，是「下一個人」的數字。先把你看到的告訴他，再聽前一個人告訴你。',
  mpInit: (n) => ({ d: Array(n).fill(0), ok: Array(n).fill(false) }),
  mpAct(st, seat, v, n, G) {
    if (v.d != null) { st.d[seat] = (v.d + 10) % 10; st.ok = Array(n).fill(false); return { st }; }
    if (v.ok) { st.ok[seat] = true; if (st.ok.every(Boolean)) { const good = st.d.every((d, i) => d === M1_T[MP.ch(G, i)]); return good ? { st, solved: true } : { st, wrong: true }; } return { st }; }
    return { st };
  },
  mpView(el, ctx, st, first) {
    const G = ctx.G, n = ctx.n, me = ctx.seat, nx = (me + 1) % n, ch = MP.ch(G, nx), [what, draw] = M1_PIC[ch];
    if (first) {
      M1_S.reset();
      el.innerHTML = `<p>展櫃有 ${n} 個轉盤鎖，一人一個。每個人的數字<b>寫在別人那邊</b>：你只看得到 <b>${CH[ch].n}</b> 的線索照片。</p>
        <div class="mp-card">📷 <b>${CH[ch].n}</b> 的數字＝這張照片裡<b>${what}</b>的數量（長得很像的不算）<svg viewBox="0 0 300 160" style="width:100%;background:#FFF9EC;border-radius:10px;margin-top:6px">${draw(M1_S)}</svg></div>
        <div class="mp-role">你的轉盤（${CH[ctx.ch].n}）：</div><div class="mp-dial"><button data-d="-1">−</button><b class="mp-v"></b><button data-d="1">＋</button></div>
        <button class="btn gold mp-big mp-ok">我轉好了</button><div class="mp-st"></div>`;
      $$('[data-d]', el).forEach(b => b.onclick = () => { sfx('click'); ctx.mp({ d: st.d[me] + +b.dataset.d }); });
      $('.mp-ok', el).onclick = () => ctx.mp({ ok: 1 });
    }
    $('.mp-v', el).textContent = st.d[me];
    $('.mp-st', el).innerHTML = MP.who(G, i => st.ok[i]) + '<p class="note">全部的人都按「我轉好了」才會開鎖；轉錯就會用掉一張地圖。</p>';
  },
  mpSolve: (n, G) => [...G.players.map((p, i) => [i, { d: M1_T[p.ch] }]), ...G.players.map((_, i) => [i, { ok: 1 }])],
});

// ---------- M2 北美館：合照（攝影師的預覽是左右相反的） ----------
const M2_POSE = ['👈', '👉', '✌️', '🙌', '👍', '🤘'];
const M2_NEED = { zn: '👉', xy: '✌️', jz: '👈', by: '🙌' };
const M2_MIR = { '👈': '👉', '👉': '👈' };
P({
  id: 'm2_photo', ch: 2, mp: true, t: '美術館前的合照', lv: 2, icon: '📸', pos: [86, 86],
  hint: '攝影師的螢幕是自拍模式，左右是相反的。其他人自己看不到要擺什麼，只能靠攝影師說。',
  mpInit: (n) => ({ pose: Array(n).fill(null) }),
  mpAct(st, seat, v, n, G) {
    if (v.pose != null && seat !== 0) { st.pose[seat] = v.pose; return { st }; }
    if (v.shoot && seat === 0) {
      for (let i = 1; i < n; i++) if (st.pose[i] !== M2_NEED[MP.ch(G, i)]) return { st, wrong: true, say: ['jz', '照片糊掉了……完全法克。'] };
      return { st, solved: true };
    }
    return { st };
  },
  mpView(el, ctx, st, first) {
    const G = ctx.G, n = ctx.n, me = ctx.seat;
    if (me === 0) {
      if (first) {
        el.innerHTML = `<div class="mp-role">你是<b>攝影師</b>。美術館規定的合照姿勢，只有你的手機看得到——可是你的鏡頭是<b>自拍模式</b>，畫面左右相反。</div>
          <div class="mp-card">📱 你的預覽畫面（左右相反）：<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px">${G.players.slice(1).map(p => `<span style="text-align:center"><img src="${PORTRAIT.head(p.ch)}" width="44" style="border-radius:50%;transform:scaleX(-1)"><br><span style="font-size:28px;display:inline-block;transform:scaleX(-1)">${M2_MIR[M2_NEED[p.ch]] ? M2_MIR[M2_NEED[p.ch]] : M2_NEED[p.ch]}</span><br><small>${CH[p.ch].n}</small></span>`).join('')}</div></div>
          <p class="note">跟大家說好要擺什麼姿勢，確定都擺對了再按快門。拍錯會用掉一張地圖。</p><div class="mp-st"></div><button class="btn red mp-big mp-shoot">📸 按快門</button>`;
        $('.mp-shoot', el).onclick = () => { sfx('shutter'); ctx.mp({ shoot: 1 }); };
      }
      $('.mp-st', el).innerHTML = MP.who(G, i => i > 0 && st.pose[i]);
    } else {
      if (first) {
        el.innerHTML = `<div class="mp-role">你是<b>模特兒</b>（${CH[ctx.ch].n}）。你看不到規定的姿勢，只有攝影師 ${MP.name(G, 0)} 看得到。</div>
          <p>聽攝影師的指示，選一個姿勢：</p><div class="mp-poses">${M2_POSE.map(p => `<button data-p="${p}">${p}</button>`).join('')}</div><div class="mp-st"></div>`;
        $$('[data-p]', el).forEach(b => b.onclick = () => { sfx('pop'); ctx.mp({ pose: b.dataset.p }); });
      }
      $$('[data-p]', el).forEach(b => b.classList.toggle('on', st.pose[me] === b.dataset.p));
      $('.mp-st', el).innerHTML = `<p class="note">（注意：「👈」是從<b>你自己</b>看出去的左邊。）</p>`;
    }
  },
  mpSolve: (n, G) => [...G.players.map((p, i) => i ? [i, { pose: M2_NEED[p.ch] }] : null).filter(Boolean), [0, { shoot: 1 }]],
});

// ---------- M3 九份：盲走豎崎路 ----------
const M3_N = 6, M3_PATH = ['0,5', '0,4', '1,4', '2,4', '2,3', '2,2', '1,2', '1,1', '1,0', '2,0', '3,0', '3,1', '4,1', '4,2', '4,3', '5,3', '5,2', '5,1', '5,0'];
const M3_SAFE = new Set([...M3_PATH, '0,3', '3,4']);
const M3_CTRL = { 2: [[], ['U', 'D', 'L', 'R']], 3: [[], ['U', 'D'], ['L', 'R']], 4: [[], ['U', 'D'], ['L'], ['R']] };
const M3_D = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] }, M3_A = { U: '↑', D: '↓', L: '←', R: '→' };
P({
  id: 'm3_walk', ch: 3, mp: true, t: '盲走豎崎路', lv: 2, icon: '🧭', pos: [88, 88],
  hint: '只有導航的人看得到哪裡是石縫。走路的人一次只走一格，走之前先問清楚。',
  mpInit: () => ({ x: 0, y: 5, falls: 0 }),
  mpAct(st, seat, v, n) {
    if (!v.m || !(M3_CTRL[n][seat] || []).includes(v.m)) return { st };
    const [dx, dy] = M3_D[v.m], x = st.x + dx, y = st.y + dy;
    if (x < 0 || y < 0 || x >= M3_N || y >= M3_N) return { st };
    st.x = x; st.y = y;
    if (!M3_SAFE.has(`${x},${y}`)) { st.falls++; st.x = 0; st.y = 5; if (st.falls % 3 === 0) return { st, wrong: true, keep: true, say: ['xy', '第三次踩空了，地圖掉進水溝。'] }; return { st, say: ['jz', '踩空了！回起點。'] }; }
    if (x === 5 && y === 0) return { st, solved: true };
    return { st };
  },
  mpView(el, ctx, st, first) {
    const n = ctx.n, me = ctx.seat, nav = me === 0, my = M3_CTRL[n][me] || [];
    if (first) {
      el.innerHTML = `<p>天黑了，豎崎路上的石階有好幾個鬆掉的石縫（踩到就要回起點，踩空三次會弄丟一張地圖）。</p>
        <div class="mp-role">${nav ? '你是<b>導航</b>：只有你看得到哪裡是石縫，可是你不能動。用聊天指揮大家！' : `你負責走路，只能按：<b>${my.map(d => M3_A[d]).join(' ')}</b>。你看不到哪裡是石縫。`}</div>
        <div class="mp-grid" style="grid-template-columns:repeat(${M3_N},1fr)"></div>${nav ? '' : `<div class="mp-pad">${['', 'U', '', 'L', '', 'R', '', 'D', ''].map(d => d ? `<button data-m="${d}" ${my.includes(d) ? '' : 'disabled'}>${M3_A[d]}</button>` : '<span></span>').join('')}</div>`}<div class="mp-st"></div>`;
      $$('[data-m]', el).forEach(b => b.onclick = () => { sfx('click'); ctx.mp({ m: b.dataset.m }); });
    }
    let g = '';
    for (let y = 0; y < M3_N; y++) for (let x = 0; x < M3_N; x++) {
      const k = `${x},${y}`, here = st.x === x && st.y === y;
      g += `<i class="${here ? 'me' : ''} ${nav && !M3_SAFE.has(k) ? 'trap' : ''} ${x === 5 && y === 0 ? 'goal' : ''}">${here ? '🚶' : x === 5 && y === 0 ? '🏮' : nav && !M3_SAFE.has(k) ? '🕳' : ''}</i>`;
    }
    $('.mp-grid', el).innerHTML = g;
    $('.mp-st', el).innerHTML = `<p class="note">起點在左下角，目標是右上角的燈籠。已經踩空 ${st.falls} 次。</p>`;
  },
  mpSolve: (n) => { const out = []; for (let i = 1; i < M3_PATH.length; i++) { const [x0, y0] = M3_PATH[i - 1].split(',').map(Number), [x1, y1] = M3_PATH[i].split(',').map(Number); const d = x1 > x0 ? 'R' : x1 < x0 ? 'L' : y1 > y0 ? 'D' : 'U'; out.push([M3_CTRL[n].findIndex(c => c.includes(d)), { m: d }]); } return out; },
});

// ---------- M4 十分：一起抬天燈 ----------
P({
  id: 'm4_lantern', ch: 4, mp: true, t: '一起抬天燈', lv: 1, icon: '🏮', pos: [12, 88],
  hint: '每個人都要「同時」按住自己那一角，而且要一起撐 4 秒。先在聊天室數「3、2、1」。',
  mpInit: (n) => ({ h: Array(n).fill(0), since: 0, up: 0 }),
  mpAct(st, seat, v, n, G, now) {
    st.h[seat] = v.h ? 1 : 0;
    st.since = st.h.every(Boolean) ? now : 0; st.up = 0;
    return { st };
  },
  mpTick(st, n, G, now) {
    if (!st.since) return null;
    const up = Math.min(4, Math.floor((now - st.since) / 1000));
    if (up >= 4) return { st, solved: true };
    if (up === st.up) return null;
    st.up = up; return { st };
  },
  mpView(el, ctx, st, first) {
    const G = ctx.G, me = ctx.seat;
    if (first) {
      el.innerHTML = `<p>天燈的紙很薄，要每個人各拉住一角、<b>同時</b>往上抬，還要一起撐住 <b>4 秒</b>，燈才會飛起來。只要有一個人放手，就要重來。</p>
        <svg viewBox="0 0 200 120" style="width:100%;max-width:280px;display:block;margin:auto"><path class="mp-l" d="M70 20 L130 20 L140 100 L60 100Z" fill="#FFF3C4" stroke="#E8A050" stroke-width="3"/><text x="100" y="66" text-anchor="middle" font-size="18" fill="#E8453C" font-weight="900">平安</text></svg>
        <button class="btn gold mp-big mp-hold">按住我這一角</button><div class="mp-bar"><i></i></div><div class="mp-st"></div>`;
      const b = $('.mp-hold', el);
      const on = (e) => { e.preventDefault(); b.classList.add('on'); sfx('click'); ctx.mp({ h: 1 }); };
      const off = () => { if (!b.classList.contains('on')) return; b.classList.remove('on'); ctx.mp({ h: 0 }); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    }
    $('.mp-bar i', el).style.width = (st.up / 4 * 100) + '%';
    $('.mp-l', el).setAttribute('transform', `translate(0 ${-st.up * 4})`);
    $('.mp-st', el).innerHTML = MP.who(G, i => st.h[i]) + `<p class="note">${st.since ? `撐住！${4 - st.up} 秒……` : '等大家一起按住。'}</p>`;
  },
  mpSolve: (n) => [...Array.from({ length: n }, (_, i) => [i, { h: 1 }]), ['wait', 4600]],
});

// ---------- M5 101：電梯按鈕的順序 ----------
const M5_ORDER = ['xy', 'by', 'zn', 'jz'];
const m5Order = (G) => M5_ORDER.filter(c => G.players.some(p => p.ch === c));
P({
  id: 'm5_lift', ch: 5, mp: true, t: '89 樓的電梯按鈕', lv: 1, icon: '🛗', pos: [88, 88],
  hint: '每個人只知道自己前面是誰。把大家的卡片內容拼起來，排出完整的順序，再一個一個按。',
  mpInit: () => ({ seq: [], t0: 0 }),
  mpAct(st, seat, v, n, G, now) {
    if (!v.press || st.seq.includes(seat)) return { st };
    if (!st.seq.length) st.t0 = now;
    st.seq.push(seat);
    if (st.seq.length < n) return { st };
    const want = m5Order(G).map(c => MP.seatOfCh(G, c));
    return want.every((s, i) => st.seq[i] === s) ? { st, solved: true } : { st, wrong: true, say: ['by', '順序錯了，電梯門關起來了……'] };
  },
  mpTick(st, n, G, now) { if (st.seq.length && st.seq.length < n && now - st.t0 > 15000) return { st: { seq: [], t0: 0 }, say: null }; return null; },
  mpView(el, ctx, st, first) {
    const G = ctx.G, me = ctx.seat, ord = m5Order(G), k = ord.indexOf(ctx.ch);
    if (first) {
      el.innerHTML = `<p>往觀景台的電梯，按鈕面板上有 ${ctx.n} 個指紋感應鈕，一人一個。<b>要照正確的順序、在 15 秒內</b>全部按完，電梯才會往上。</p>
        <div class="mp-card">🪪 你的卡片：${k === 0 ? '<b>你要第一個按。</b>' : `你要在 <b>${CH[ord[k - 1]].n}</b> 按完之後，下一個按。`}</div>
        <button class="btn red mp-big mp-press">☝️ 按下我的指紋鈕</button><div class="mp-st"></div>`;
      $('.mp-press', el).onclick = () => { sfx('ding'); ctx.mp({ press: 1 }); };
    }
    $('.mp-press', el).disabled = st.seq.includes(me);
    $('.mp-st', el).innerHTML = `<p class="note">已經按了：${st.seq.map(s => MP.name(G, s)).join(' → ') || '（還沒有人）'}</p>`;
  },
  mpSolve: (n, G) => m5Order(G).map(c => [MP.seatOfCh(G, c), { press: 1 }]),
});

// ---------- M6 淡水：一起划渡船 ----------
const M6_GOAL = 20;
P({
  id: 'm6_boat', ch: 6, mp: true, t: '划到對岸八里', lv: 1, icon: '🚣', pos: [88, 88],
  hint: '要照順序輪流划：每個人只有在「輪到你」的時候划才有用。搶拍船會轉圈，停太久船會被沖回去。',
  mpInit: () => ({ p: 0, turn: 0, last: 0 }),
  mpAct(st, seat, v, n, G, now) {
    if (!v.row) return { st };
    st.last = now;
    if (seat !== st.turn) { st.p = Math.max(0, st.p - 2); return { st, say: ['xy', '你搶拍了，船在轉圈。'] }; }
    st.p++; st.turn = (st.turn + 1) % n;
    return st.p >= M6_GOAL ? { st, solved: true } : { st };
  },
  mpTick(st, n, G, now) { if (st.p > 0 && now - st.last > 3000) { st.p--; st.last = now; return { st }; } return null; },
  mpView(el, ctx, st, first) {
    const G = ctx.G, me = ctx.seat, mine = st.turn === me;
    if (first) {
      el.innerHTML = `<p>淡水渡船頭的小船壞了馬達，只能靠大家輪流划到對岸。順序是 ${G.players.map(p => CH[p.ch].n).join(' → ')} → 再從頭。</p>
        <div class="mp-river"><span class="mp-boat">🚣</span><em>八里 🏁</em></div><div class="mp-bar"><i></i></div>
        <button class="btn teal mp-big mp-row">划！</button><div class="mp-st"></div>`;
      $('.mp-row', el).onclick = () => { sfx('click'); ctx.mp({ row: 1 }); };
    }
    $('.mp-boat', el).style.left = (4 + st.p / M6_GOAL * 76) + '%';
    $('.mp-bar i', el).style.width = (st.p / M6_GOAL * 100) + '%';
    $('.mp-row', el).textContent = mine ? '🌊 輪到你了！划！' : '划！（還沒輪到你）';
    $('.mp-row', el).classList.toggle('gold', mine);
    if (mine && !first) sfx('pop');
    $('.mp-st', el).innerHTML = `<p class="note">${st.p} / ${M6_GOAL} 槳。超過 3 秒沒人划，船會被沖回去一點。</p>`;
  },
  mpSolve: (n) => Array.from({ length: M6_GOAL }, (_, k) => [k % n, { row: 1 }]),
});

// ---------- M7 西門町：分工夾娃娃 ----------
const M7_PRIZE = [['🦆', '黃色小鴨'], ['🦆', '黃色小鴨・戴墨鏡'], ['🐸', '青蛙'], ['🦆', '黃色小鴨・戴帽子'], ['🐻', '小熊'],
  ['🐼', '熊貓'], ['🦆', '黃色小鴨・戴墨鏡・拿珍奶'], ['🐶', '小狗'], ['🦆', '黃色小鴨・拿珍奶'], ['🐱', '小貓'],
  ['🐰', '兔子'], ['🦆', '黃色小鴨・戴帽子・戴墨鏡'], ['🦊', '狐狸'], ['🐷', '小豬'], ['🦆', '黃色小鴨・戴帽子・拿珍奶']];
const M7_TARGET = 6, M7_W = 5;   // 第 7 格（x=1, y=1）
const M7_CTRL = { 2: [['L', 'R'], ['U', 'D', 'G']], 3: [['L', 'R'], ['U', 'D'], ['G']], 4: [['L'], ['R'], ['U', 'D'], ['G']] };
const m7Tag = (s) => s.split('・').slice(1).map(t => ({ 戴墨鏡: '😎', 戴帽子: '🎩', 拿珍奶: '🧋' }[t])).join('');
P({
  id: 'm7_claw', ch: 7, mp: true, t: '分工夾娃娃', lv: 2, icon: '🕹️', pos: [50, 88],
  hint: '只有一個人知道要夾哪一隻。小鴨子很多，請他描述清楚，再一起把夾子移過去。',
  mpInit: () => ({ x: 0, y: 0 }),
  mpAct(st, seat, v, n) {
    const my = M7_CTRL[n][seat] || []; if (!v.m || !my.includes(v.m)) return { st };
    if (v.m === 'G') return st.y * M7_W + st.x === M7_TARGET ? { st, solved: true } : { st, wrong: true, keep: true, say: ['jz', '夾到錯的了……完全法克。'] };
    const [dx, dy] = M3_D[v.m]; st.x = Math.max(0, Math.min(M7_W - 1, st.x + dx)); st.y = Math.max(0, Math.min(2, st.y + dy));
    return { st };
  },
  mpView(el, ctx, st, first) {
    const n = ctx.n, me = ctx.seat, my = M7_CTRL[n][me] || [];
    if (first) {
      el.innerHTML = `<p>西門町的夾娃娃機要好幾個人一起玩：左右、上下、按夾子是不同人負責的。</p>
        ${me === 0 ? `<div class="mp-card">🎯 只有你看得到店員寫的紙條：「這台機台的大獎是 <b>${M7_PRIZE[M7_TARGET][1]}</b>。」</div>` : '<div class="mp-card">🎯 要夾哪一隻？只有 ' + MP.name(ctx.G, 0) + ' 知道。</div>'}
        <div class="mp-role">你負責：<b>${my.map(d => d === 'G' ? '按夾子' : M3_A[d]).join('、')}</b></div>
        <div class="mp-claw"></div><div class="mp-pad">${['', 'U', '', 'L', 'G', 'R', '', 'D', ''].map(d => d ? `<button data-m="${d}" ${my.includes(d) ? '' : 'disabled'}>${d === 'G' ? '夾' : M3_A[d]}</button>` : '<span></span>').join('')}</div><p class="note">夾錯會用掉一張地圖。</p>`;
      $$('[data-m]', el).forEach(b => b.onclick = () => { sfx(b.dataset.m === 'G' ? 'hit' : 'click'); ctx.mp({ m: b.dataset.m }); });
    }
    $('.mp-claw', el).innerHTML = M7_PRIZE.map(([e, s], i) => `<i class="${st.y * M7_W + st.x === i ? 'at' : ''}">${e}<small>${m7Tag(s)}</small></i>`).join('');
  },
  mpSolve: (n) => { const f = (d) => M7_CTRL[n].findIndex(c => c.includes(d)); return [[f('R'), { m: 'R' }], [f('D'), { m: 'D' }], [f('G'), { m: 'G' }]]; },
});

// ---------- M8 饒河夜市：各自點餐 ----------
const M8_FOOD = [['胡椒餅', 60, '肉・辣'], ['藥燉排骨', 90, '肉・湯'], ['蚵仔麵線', 70, '海鮮・湯'], ['臭豆腐', 60, '素・辣'], ['大腸包小腸', 80, '肉・內臟'], ['珍珠奶茶', 50, '甜'], ['烤魷魚', 100, '海鮮'], ['地瓜球', 40, '甜・素']];
const M8_RULE = { zn: ['不吃辣，而且一定要點「有湯」的', (f) => !f[2].includes('辣') && f[2].includes('湯')], xy: ['不吃肉，也不吃甜的', (f) => !f[2].includes('肉') && !f[2].includes('甜')], jz: ['不要湯，而且要點 80 元以上的', (f) => !f[2].includes('湯') && f[1] >= 80], by: ['吃素', (f) => f[2].includes('素')] };
const M8_BUDGET = { 2: 130, 3: 210, 4: 250 };
P({
  id: 'm8_order', ch: 8, mp: true, t: '各自點餐', lv: 2, icon: '🍢', pos: [88, 88],
  hint: '你的卡片寫的是「下一個人」的飲食習慣。把卡片內容告訴他，再一起算預算：不能重複點、總共不能超過預算。',
  mpInit: (n) => ({ pick: Array(n).fill(-1), ok: Array(n).fill(false) }),
  mpAct(st, seat, v, n, G) {
    if (v.pick != null) { st.pick[seat] = v.pick; st.ok = Array(n).fill(false); return { st }; }
    if (v.ok && st.pick[seat] >= 0) {
      st.ok[seat] = true; if (!st.ok.every(Boolean)) return { st };
      const fs = st.pick.map(i => M8_FOOD[i]), uniq = new Set(st.pick).size === n, sum = fs.reduce((a, f) => a + f[1], 0);
      const good = uniq && sum <= M8_BUDGET[n] && fs.every((f, i) => M8_RULE[MP.ch(G, i)][1](f));
      return good ? { st, solved: true } : { st, wrong: true, say: ['by', '老闆說：這樣點不行喔。'] };
    }
    return { st };
  },
  mpView(el, ctx, st, first) {
    const G = ctx.G, n = ctx.n, me = ctx.seat, nx = (me + 1) % n, nch = MP.ch(G, nx);
    if (first) {
      el.innerHTML = `<p>最後一攤，每個人各點一樣。規則：<b>不能點一樣的</b>，而且大家加起來<b>不能超過 ${M8_BUDGET[n]} 元</b>。</p>
        <div class="mp-card">🗒️ 你知道一件事：<b>${CH[nch].n}</b> ${M8_RULE[nch][0]}。<br><small>（你自己的飲食習慣，寫在別人的卡片上。）</small></div>
        <div class="mp-menu">${M8_FOOD.map(([nm, pr, tg], i) => `<button data-i="${i}"><b>${nm}</b> ${pr} 元<small>${tg}</small></button>`).join('')}</div>
        <button class="btn gold mp-big mp-ok">我點好了</button><div class="mp-st"></div>`;
      $$('[data-i]', el).forEach(b => b.onclick = () => { sfx('pop'); ctx.mp({ pick: +b.dataset.i }); });
      $('.mp-ok', el).onclick = () => ctx.mp({ ok: 1 });
    }
    $$('[data-i]', el).forEach(b => b.classList.toggle('on', st.pick[me] === +b.dataset.i));
    const sum = st.pick.reduce((a, i) => a + (i >= 0 ? M8_FOOD[i][1] : 0), 0);
    $('.mp-st', el).innerHTML = MP.who(G, i => st.ok[i]) + `<p class="note">目前大家點的加起來：${sum} 元（看不到別人點什麼，只看得到總金額）。全部的人都按「我點好了」才會送單；點錯會用掉一張地圖。</p>`;
  },
  mpSolve: (n, G) => {
    // 暴力找一組合法的點法
    const chs = G.players.map(p => p.ch); let best = null;
    const rec = (i, used, sum, acc) => { if (best) return; if (i === n) { if (sum <= M8_BUDGET[n]) best = acc.slice(); return; } M8_FOOD.forEach((f, k) => { if (!used.has(k) && M8_RULE[chs[i]][1](f)) { used.add(k); acc.push(k); rec(i + 1, used, sum + f[1], acc); acc.pop(); used.delete(k); } }); };
    rec(0, new Set(), 0, []);
    return [...best.map((k, i) => [i, { pick: k }]), ...best.map((_, i) => [i, { ok: 1 }])];
  },
});
