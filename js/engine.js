'use strict';
// ===== 越南公主：遊戲引擎 =====
// 單人與多人共用同一套狀態 G。多人時主機權威：動作 → reduce → 廣播。
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => { s = Math.max(0, s | 0); const h = s / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60, p = n => String(n).padStart(2, '0'); return (h ? h + ':' + p(m) : p(m)) + ':' + p(x); };
const norm = (v) => String(v ?? '').normalize('NFKC').toUpperCase().replace(/[\s，。、！？!?,.;；:：'"「」『』()（）\[\]【】\-–—·・~～…_]/g, '');
const shuffleSeed = (arr, seed) => { const a = arr.slice(); let s = seed >>> 0 || 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const CH = {
  zn: { n: '甄妮', c: '#E86A8F', vi: true },
  xy: { n: '小羽', c: '#3E8ED0' },
  jz: { n: '俊治', c: '#2B2B33' },
  by: { n: '博育', c: '#5BAF7A' },
  ang: { n: '小天使博育', c: '#E8A93A' },
};
const SEAT_CHARS = { 1: ['zn'], 2: ['zn', 'xy'], 3: ['zn', 'xy', 'jz'], 4: ['zn', 'xy', 'jz', 'by'] };
const MAPS = 8, LIMIT = 300 * 60, GOAL = 100 * 60;
const CHAPTERS = [
  { k: 'station', name: '序章', place: '台北車站', bgm: 'day' },
  { k: 'palace', name: '第一章', place: '故宮', bgm: 'day' },
  { k: 'museum', name: '第二章', place: '台北市立美術館', bgm: 'calm' },
  { k: 'jiufen', name: '第三章', place: '九份', bgm: 'night' },
  { k: 'shifen', name: '第四章', place: '十分', bgm: 'calm' },
  { k: 'taipei101', name: '第五章', place: '台北 101', bgm: 'day' },
  { k: 'tamsui', name: '第六章', place: '淡水老街', bgm: 'calm' },
  { k: 'ximen', name: '第七章', place: '西門町', bgm: 'night' },
  { k: 'nightmarket', name: '第八章', place: '饒河夜市', bgm: 'night' },
  { k: 'forest', name: '第九章', place: '大安森林公園', bgm: 'tense' },
];
const FIN_BY_N = { 1: 'pinball', 2: 'xiangqi', 3: 'cards', 4: 'mahjong' };
const ENDINGS = [
  ['pb', '越南公主・彈珠王', '1 人：甄妮的彈珠試煉'],
  ['xq_w', '尊嚴之戰・勝者', '2 人：大盤象棋，贏了'],
  ['xq_l', '尊嚴之戰・敗者', '2 人：大盤象棋，輸了（完全法克）'],
  ['xq_d', '尊嚴之戰・握手言和', '2 人：大盤象棋，和棋'],
  ['cd1', '台灣遊戲大賽冠軍', '3 人：撲克牌大會 第一名'],
  ['cd2', '撲克牌大會・亞軍', '3 人：撲克牌大會 第二名'],
  ['cd3', '撲克牌大會・季軍', '3 人：撲克牌大會 第三名'],
  ['mj1', '麻將之王', '4 人：麻將最終決戰 第一名'],
  ['mj2', '麻將・第二名', '4 人：麻將最終決戰 第二名'],
  ['mj3', '麻將・第三名', '4 人：麻將最終決戰 第三名'],
  ['mj4', '請大家喝飲料', '4 人：麻將最終決戰 第四名'],
];

// ---------- 謎題註冊 ----------
const PZ = {}, PZL = [];
const LV = { 1: '困難', 2: '地獄', 3: '夢魘' };
let PZN = 0, PZM = 0;
function P(def) { if (def.mp) def.ui = 'none'; def.no = def.mp ? 'M' + (++PZM) : ++PZN; def.lv = def.lv || 1; PZ[def.id] = def; PZL.push(def); return def; }
// 多人專屬題（mp）：只有 2 人以上連線時才會出現
const pzVisible = (p) => !p.mp || (G && G.mode === 'multi' && G.players.length >= (p.minN || 2));
const pzOf = (ch) => PZL.filter(p => p.ch === ch && pzVisible(p));

// ---------- 道具 ----------
const ITEMS = {
  dict: { n: '甄妮的越南語小抄', i: '📒', d: '甄妮手寫的越南語小字典。' },
  jade: { n: '神秘玉牌', i: '🟩', d: '故宮拿到的玉牌，背面刻著一個「北」字。' },
  ticket: { n: '紅色車票', i: '🎫', d: '北美館畫框裡的紅色車票。' },
  coin: { n: '古老銅幣', i: '🪙', d: '九份階梯找到的銅幣，背面刻著「十分」。' },
  wish: { n: '天燈願望紙', i: '🏮', d: '十分天燈上撕下來的一角，寫著 101。' },
  card: { n: '黑色撲克牌', i: '🃏', d: '101 電梯旁隱藏盒裡的黑色撲克牌。' },
  chip: { n: '金色籌碼', i: '🪙', d: '淡水老街盒子裡的金色籌碼。' },
  map: { n: '最後的地圖', i: '🗺️', d: '「最後的遊戲，不在夜市。」下面畫著一棵樹。' },
};

// ---------- 全域 ----------
let G = null;                 // 共享狀態
const L = {                   // 這台裝置的本機狀態
  me: null, seat: -1, story: -1, busy: 0, openPz: null, looks: {}, chat: [], unread: 0, lastRev: -1, evSeen: -1,
  rid: null, finRoot: null, lastFinSeq: -1, offlineSince: {}, ticker: null, broadcastAt: 0, skip: false,
};
const isHost = () => !G || G.mode === 'solo' || G.host === L.me.id;
const myPlayer = () => G && G.players.find(p => p.id === L.me.id);
const nOf = () => G ? G.players.length : 1;

// ---------- 小工具：toast / 台詞泡泡 / 特效 ----------
function toast(t, cls = '') {
  const e = document.createElement('div'); e.className = 'toast ' + cls; e.innerHTML = t; $('#toasts').append(e);
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
  setTimeout(() => e.classList.add('out'), 2600); setTimeout(() => e.remove(), 3100);
}
function quip(ch, text, zh) {
  const c = CH[ch] || CH.xy, e = document.createElement('div');
  e.className = 'quip'; e.style.setProperty('--c', c.c);
  e.innerHTML = `<img src="${PORTRAIT.head(ch === 'ang' ? 'ang' : ch, 'talk')}" alt=""><div><b>${c.n}</b><p>${esc(text)}</p>${zh ? `<small>【中文翻譯】${esc(zh)}</small>` : ''}</div>`;
  $('#quips').append(e); while ($('#quips').children.length > 3) $('#quips').firstChild.remove();
  setTimeout(() => e.classList.add('out'), 3800); setTimeout(() => e.remove(), 4300);
}
function burst(emoji = '✨', n = 18) {
  const fx = $('#fx');
  for (let i = 0; i < n; i++) { const s = document.createElement('i'); s.textContent = emoji; s.style.left = (40 + Math.random() * 20) + '%'; s.style.setProperty('--dx', (Math.random() * 2 - 1) * 260 + 'px'); s.style.setProperty('--dy', -(120 + Math.random() * 260) + 'px'); s.style.animationDelay = Math.random() * .2 + 's'; fx.append(s); setTimeout(() => s.remove(), 1600); }
}
function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
const FX = {
  names: { zn: '甄妮', xy: '小羽', jz: '俊治', by: '博育' },
  color: { zn: '#E86A8F', xy: '#3E8ED0', jz: '#2B2B33', by: '#5BAF7A' },
  avatar: (ch, px = 40) => `<img class="fx-av" src="${PORTRAIT.head(ch)}" width="${px}" height="${px}" alt="${CH[ch]?.n || ''}" style="border-radius:50%">`,
  sfx: (n) => sfx(n),
  quip,
};
window.FX = FX;
const FINALE = { mods: {}, register(name, mod) { this.mods[name] = mod; } };
window.FINALE = FINALE;

// ---------- 畫面切換 ----------
function show(id) { if (document.body.dataset.scr !== id) window.scrollTo(0, 0); document.body.dataset.scr = id; $$('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }

// ---------- 存檔 ----------
const SAVE = 'bang_g';
function save() { try { if (G && G.phase !== 'room') localStorage.setItem(SAVE, JSON.stringify(G)); } catch (e) {} }
function loadSave() { try { return JSON.parse(localStorage.getItem(SAVE) || 'null'); } catch (e) { return null; } }
function clearSave() { try { localStorage.removeItem(SAVE); } catch (e) {} }
function endings() { try { return JSON.parse(localStorage.getItem('bang_end') || '{}'); } catch (e) { return {}; } }
function unlockEnding(k) { try { const e = endings(); e[k] = 1; localStorage.setItem('bang_end', JSON.stringify(e)); } catch (e) {} }

// ---------- 新遊戲 ----------
function newState(mode, players, code) {
  return {
    v: 1, id: Math.random().toString(36).slice(2, 10), mode, code: code || null, host: L.me.id, rev: 0,
    phase: mode === 'solo' ? 'play' : 'room', players, ch: 0, seed: (Math.random() * 1e9) | 0,
    solved: {}, wrong: {}, hinted: {}, items: [], maps: MAPS, deaths: 0, hints: 0, wrongs: 0, lost: false,
    t: 0, fin: null, award: null, ev: [], started: mode === 'solo' ? Date.now() : 0,
  };
}

// ---------- 動作（主機權威） ----------
function act(a) {
  a.by = L.me.id;
  if (isHost()) apply(a);
  else NET.send('act', a);
}
function apply(a) {
  if (!G) return;
  const ev = [];
  const p = G.players.find(x => x.id === a.by);
  const seat = G.players.indexOf(p);
  switch (a.t) {
    case 'pick': {
      if (G.phase !== 'room' || !p) return;
      if (a.ch && G.players.some(x => x.ch === a.ch && x.id !== p.id)) return;
      p.ch = a.ch || null; break;
    }
    case 'start': {
      if (G.phase !== 'room' || a.by !== G.host) return;
      const n = G.players.length, allow = SEAT_CHARS[n];
      if (n === 1) G.players[0].ch = 'zn';
      if (!G.players.every(x => allow.includes(x.ch))) return;
      G.phase = 'play'; G.started = Date.now(); ev.push({ k: 'start' }); break;
    }
    case 'solve': {
      if (G.phase !== 'play' || G.solved[a.id] || !PZ[a.id] || PZ[a.id].mp) return;
      doSolve(a.id, a.by, ev); break;
    }
    case 'wrong': {
      if (G.phase !== 'play' || G.solved[a.id] || G.lost) return;
      doWrong(a.id, a.by, ev); break;
    }
    case 'mp': {   // 多人專屬題：每個人的操作送到主機，主機算出共同狀態
      const z = PZ[a.id];
      if (G.phase !== 'play' || !z || !z.mp || G.solved[a.id] || G.lost || seat < 0) return;
      G.mp = G.mp || {}; const n = G.players.length;
      const st = G.mp[a.id] || z.mpInit(n, G);
      const r = z.mpAct(JSON.parse(JSON.stringify(st)), seat, a.v, n, G, Date.now()) || {};
      G.mp[a.id] = r.st || st;
      if (r.solved) doSolve(a.id, a.by, ev);
      else if (r.wrong) { doWrong(a.id, a.by, ev); G.mp[a.id] = r.keep ? G.mp[a.id] : z.mpInit(n, G); }
      if (r.say) ev.push({ k: 'say', q: r.say });
      break;
    }
    case 'mptick': {
      if (G.phase !== 'play' || !G.mp) return;
      let any = false; const n = G.players.length;
      for (const id in G.mp) {
        const z = PZ[id]; if (!z || !z.mpTick || G.solved[id]) continue;
        const r = z.mpTick(JSON.parse(JSON.stringify(G.mp[id])), n, G, Date.now()); if (!r) continue;
        any = true; G.mp[id] = r.st || G.mp[id];
        if (r.solved) doSolve(id, a.by, ev); else if (r.wrong) { doWrong(id, a.by, ev); G.mp[id] = z.mpInit(n, G); }
      }
      if (!any) return;
      break;
    }
    case 'hint': {
      if (G.phase !== 'play' || G.hinted[a.id] || G.lost) return;
      G.hinted[a.id] = a.by; G.hints++; G.maps--; ev.push({ k: 'hint', id: a.id, by: a.by });
      if (G.maps <= 0) { G.maps = 0; G.lost = true; ev.push({ k: 'lost' }); }
      break;
    }
    case 'revive': { if (!G.lost) return; G.lost = false; G.maps = MAPS; G.deaths++; G.t += 600; ev.push({ k: 'revive' }); break; }
    case 'next': {
      if (G.phase !== 'play' || G.ch !== a.ch || !chapterDone(G.ch)) return;
      if (G.ch >= CHAPTERS.length - 1) { startFinale(); ev.push({ k: 'finale' }); }
      else { G.ch++; ev.push({ k: 'chapter', ch: G.ch }); }
      break;
    }
    case 'fin': {
      if (G.phase !== 'finale' || !G.fin) return;
      const mod = FINALE.mods[G.fin.k]; if (!mod) return;
      const st = a.seat != null && a.by === G.host ? a.seat : seat;   // 主機可以替斷線的人（bot）出手
      let r; try { r = mod.act(G.fin.s, st, a.a); } catch (e) { console.warn(e); return; }
      if (!r || !r.ok) { if (a.by === L.me.id && r && r.msg) toast(esc(r.msg)); else if (r && r.msg) G.fin.err = { to: a.by, msg: r.msg, n: (G.fin.err?.n || 0) + 1 }; return; }
      G.fin.s = r.state; G.fin.ev = r.ev || []; G.fin.seq++;
      const res = mod.result(G.fin.s); if (res && !G.fin.res) G.fin.res = res;
      break;
    }
    case 'award': { if (G.phase !== 'finale' || !G.fin?.res) return; G.phase = 'award'; G.award = makeAward(); ev.push({ k: 'award' }); break; }
    case 'restart': {
      if (a.by !== G.host && G.mode !== 'solo') return;
      const keep = G.players; const ng = newState(G.mode, keep, G.code); ng.phase = 'play'; ng.started = Date.now(); ng.host = G.host; ng.rev = G.rev;
      G = ng; ev.push({ k: 'restart' }); break;
    }
    case 'tick': break;
    default: return;
  }
  G.rev++; G.ev = ev.length ? ev : []; G.evRev = G.rev;
  commit();
}
function doSolve(id, by, ev) { G.solved[id] = by; const it = PZ[id].item; if (it && !G.items.includes(it)) G.items.push(it); ev.push({ k: 'solve', id, by }); }
function doWrong(id, by, ev) { G.wrong[id] = (G.wrong[id] || 0) + 1; G.wrongs++; G.maps--; ev.push({ k: 'wrong', id, by }); if (G.maps <= 0) { G.maps = 0; G.lost = true; ev.push({ k: 'lost' }); } }
function chapterDone(ch) { return pzOf(ch).every(p => G.solved[p.id]); }
function commit() {
  save();
  if (G.mode === 'multi' && isHost()) { NET.send('st', G); L.broadcastAt = Date.now(); }
  onState();
}

// ---------- 收到狀態 ----------
function receive(st) {
  if (!st || !st.id) return;
  if (G && G.id === st.id && st.rev < G.rev && st.host === G.host) return;  // 舊的
  const prevPhase = G?.phase, wasIn = !!myPlayer();
  G = st; save();
  if (prevPhase === 'room' && G.phase !== 'room' && !myPlayer()) { toast('遊戲已經開始了。'); }
  onState(prevPhase, wasIn);
}
function onState() {
  if (!G) return;
  L.seat = G.players.findIndex(p => p.id === L.me.id);
  // 事件
  if (G.evRev != null && G.evRev !== L.evSeen) { L.evSeen = G.evRev; (G.ev || []).forEach(handleEv); }
  render();
  if (L.openPz && PZ[L.openPz]?.mp && !G.solved[L.openPz]) mpDraw(false);
}
function handleEv(e) {
  const who = G.players.find(p => p.id === e.by), ch = who?.ch || 'zn', nm = who ? (CH[ch]?.n + (G.mode === 'multi' ? `（${esc(who.name)}）` : '')) : '';
  if (e.k === 'solve') {
    const pz = PZ[e.id]; sfx('good'); burst(['✨', '🎉', '⭐', '🧧'][Math.random() * 4 | 0], 14);
    toast(`🔓 <b>#${pz.no} ${esc(pz.t)}</b> 解開了！${G.mode === 'multi' ? '　' + nm : ''}`, 'good');
    if (pz.item) setTimeout(() => toast(`${ITEMS[pz.item].i} 獲得道具：<b>${ITEMS[pz.item].n}</b>`, 'item'), 700);
    if (pz.ok) pz.ok.forEach((l, i) => setTimeout(() => quip(l[0], l[1], l[2]), 900 + i * 1500));
    else if (Math.random() < .5) { const Q = [['xy', '神人。'], ['jz', 'Bang!'], ['by', '學長你們有在解嗎？'], ['zn', 'Hay quá!', '太讚了！']]; const q = Q[Math.random() * Q.length | 0]; setTimeout(() => quip(...q), 600); }
    if (L.openPz === e.id) refreshPz();
  }
  if (e.k === 'wrong') {
    sfx('map'); const pz = PZ[e.id]; toast(`🗺️ 答錯了，失去一張地圖。${G.mode === 'multi' ? '　' + nm + '：#' + pz.no : ''}`, 'bad');
    const Q = [['jz', '完全法克。'], ['xy', '……你是不是看錯了。'], ['by', '再想想看！'], ['zn', 'Không phải!', '不是啦！'], ['jz', '地圖又少一張。']]; const q = Q[Math.random() * Q.length | 0]; quip(...q);
    if (L.openPz === e.id) { const b = $('#modal .pz-card'); if (b) shake(b); }
  }
  if (e.k === 'hint') { if (e.by !== L.me.id) toast(`😇 ${nm} 問了博育一次提示（地圖 -1）`); }
  if (e.k === 'lost') { sfx('lost'); }
  if (e.k === 'say' && e.q) quip(e.q[0], e.q[1], e.q[2]);
  if (e.k === 'revive') { toast('🧭 重新找到路了。地圖補滿 8 張，時間 +10 分鐘。'); }
  if (e.k === 'chapter') { closePz(); }
  if (e.k === 'restart') { L.story = -1; closePz(); toast('🔁 旅程重新開始。'); }
}

// ---------- 計時（主機） ----------
function startTicker() {
  clearInterval(L.ticker);
  L.ticker = setInterval(() => {
    if (!G || !isHost()) return;
    if (G.phase !== 'play' && G.phase !== 'finale') return;
    if (G.mode === 'solo' && (document.hidden || L.busy)) return;
    G.t++;
    if (G.t >= LIMIT && G.phase !== 'fail') { G.phase = 'fail'; G.rev++; G.ev = [{ k: 'fail' }]; G.evRev = G.rev; commit(); return; }
    if (G.mode === 'multi' && Date.now() - L.broadcastAt > 8000) { G.rev++; G.ev = []; G.evRev = G.rev; NET.send('st', G); L.broadcastAt = Date.now(); save(); }
    else if (G.t % 10 === 0) save();
    hudTime();
    if (G.phase === 'finale') botDrive();
    if (G.phase === 'play' && G.mp && Object.keys(G.mp).some(id => PZ[id]?.mpTick && !G.solved[id])) apply({ t: 'mptick', by: L.me.id });
  }, 1000);
  // 非主機：本機推進顯示時間
  clearInterval(L.clientTick);
  L.clientTick = setInterval(() => { if (G && !isHost() && (G.phase === 'play' || G.phase === 'finale')) { G.t++; hudTime(); } }, 1000);
}

// ---------- 斷線代打（主機） ----------
function online(id) { return G.mode === 'solo' || id === L.me.id || NET.members.some(m => m.id === id); }
function botDrive() {
  const mod = FINALE.mods[G.fin?.k]; if (!mod || G.fin.res) return;
  let w = []; try { w = mod.waiting(G.fin.s) || []; } catch (e) {}
  const now = Date.now();
  for (const seat of w) {
    const p = G.players[seat]; if (!p) continue;
    if (online(p.id)) { delete L.offlineSince[p.id]; continue; }
    L.offlineSince[p.id] = L.offlineSince[p.id] || now;
    if (now - L.offlineSince[p.id] < 15000) continue;
    let a = null; try { a = mod.bot(G.fin.s, seat); } catch (e) {}
    if (a) { apply({ t: 'fin', a, seat, by: L.me.id }); return; }
  }
}

// ---------- 多人：成員變動、主機接手 ----------
function onMembers(ms) {
  if (!G || G.mode !== 'multi') return;
  if (G.phase === 'room' && isHost()) {
    let changed = false;
    for (const m of ms) if (!G.players.some(p => p.id === m.id) && G.players.length < 4) { G.players.push({ id: m.id, name: m.name, ch: null }); changed = true; }
    const before = G.players.length; G.players = G.players.filter(p => ms.some(m => m.id === p.id) || p.id === L.me.id);
    if (changed || before !== G.players.length) { G.rev++; G.ev = []; G.evRev = G.rev; commit(); }
    advertiseRoom();
  }
  // 主機不在了 → 最早加入、而且是玩家的人接手
  if (!ms.some(m => m.id === G.host)) {
    const cand = ms.filter(m => G.phase === 'room' || G.players.some(p => p.id === m.id));
    if (cand.length && cand[0].id === L.me.id) { G.host = L.me.id; G.rev++; G.ev = []; G.evRev = G.rev; commit(); toast('👑 原本的房主離開了，現在由你主持。'); advertiseRoom(); }
  }
  renderParty();
}
function advertiseRoom() {
  if (!G || G.mode !== 'multi' || !isHost()) return;
  NET.advertise(G.phase === 'room' ? { code: G.code, host: L.me.name, n: G.players.length } : null);
}

// ---------- 主畫面渲染 ----------
function render() {
  if (!G) return;
  if (G.phase === 'room') { show('wait'); renderWait(); return; }
  if (!myPlayer()) { show('title'); return; }
  if (G.phase === 'play') {
    if ($('#game').classList.contains('on') === false) show('game');
    const ch = G.ch;
    if (L.story < ch && !L.busy) { playChapter(ch); return; }
    renderScene(); hud(); renderParty();
    if (G.lost) showLost(); else hideLost();
  }
  if (G.phase === 'finale') renderFinale();
  if (G.phase === 'award') renderAward();
  if (G.phase === 'fail') renderFail();
}

// ---------- HUD ----------
function hud() {
  const c = CHAPTERS[G.ch], list = pzOf(G.ch), done = list.filter(p => G.solved[p.id]).length;
  $('#hCh').textContent = `${c.name}・${c.place}`;
  $('#hPz').textContent = `　${done}/${list.length}　總進度 ${Object.keys(G.solved).length}/${PZL.filter(pzVisible).length}`;
  $('#hMaps').innerHTML = Array.from({ length: MAPS }, (_, i) => `<i class="${i < G.maps ? 'on' : ''}">🗺️</i>`).join('');
  hudTime();
}
function hudTime() { const e = $('#hTime'); if (!e || !G) return; e.textContent = fmt(G.t); e.classList.toggle('warn', G.t > GOAL); e.title = G.t > GOAL ? '已超過建議時間 100 分鐘（300 分鐘會失敗）' : '建議 100 分鐘'; }
function renderParty() {
  const el = $('#party'); if (!el || !G) return;
  if (G.mode !== 'multi') { el.innerHTML = ''; return; }
  el.innerHTML = G.players.map(p => `<span class="pp ${online(p.id) ? '' : 'off'}" title="${esc(p.name)}"><img src="${PORTRAIT.head(p.ch || 'zn')}"><b>${esc(p.name)}</b></span>`).join('');
}

// ---------- 場景與謎題標記 ----------
function renderScene() {
  const c = CHAPTERS[G.ch], sc = $('#scene');
  if (sc.dataset.k !== c.k) { sc.dataset.k = c.k; sc.innerHTML = `<div class="sc-art">${ART.svg(c.k)}</div><div class="sc-pins"></div>`; AU.bgm(c.bgm); }
  const pins = $('.sc-pins', sc), list = pzOf(G.ch);
  pins.innerHTML = list.map((p, i) => {
    const pos = p.pos || autoPos(i, list.length), locked = (p.need || []).some(n => !G.solved[n]), done = !!G.solved[p.id];
    const looks = Object.entries(L.looks).filter(([, v]) => v === p.id).map(([s]) => G.players[s]).filter(Boolean);
    return `<button class="pin ${done ? 'done' : ''} ${locked ? 'lock' : ''} lv${p.lv}" style="left:${pos[0]}%;top:${pos[1]}%" data-id="${p.id}" title="#${p.no} ${esc(p.t)}">
      <span class="pin-i">${locked ? '🔒' : done ? '✓' : p.icon || '❓'}</span><span class="pin-n">${p.no}</span>${looks.map(x => `<img class="pin-look" src="${PORTRAIT.head(x.ch)}">`).join('')}</button>`;
  }).join('');
  const nb = $('#bNext');
  if (chapterDone(G.ch)) { nb.hidden = false; nb.textContent = G.ch >= CHAPTERS.length - 1 ? '🎮 開始最終試煉' : `🚶 前往下一站：${CHAPTERS[G.ch + 1].place}`; }
  else nb.hidden = true;
}
function autoPos(i, n) {
  const cols = Math.min(4, Math.ceil(Math.sqrt(n * 1.6))), rows = Math.ceil(n / cols), r = i / cols | 0, c = i % cols;
  const off = (r % 2) * (40 / cols);
  return [10 + (c + .5) * (80 / cols) + off * .5 - (r % 2 ? 4 : 0), 20 + (r + .5) * (62 / rows)];
}

// ---------- 謎題視窗 ----------
function openPz(id) {
  const pz = PZ[id]; if (!pz) return;
  if ((pz.need || []).some(n => !G.solved[n])) { toast('🔒 要先解開：' + pz.need.filter(n => !G.solved[n]).map(n => '#' + PZ[n].no).join('、')); sfx('miss'); return; }
  L.openPz = id; sfx('page');
  if (G.mode === 'multi') NET.send('look', { seat: L.seat, id });
  L.looks[L.seat] = id;
  refreshPz(true);
}
function ctxOf() { return { G, seat: L.seat, n: nOf(), me: myPlayer(), ch: myPlayer()?.ch, submit: (v) => submitAns(L.openPz, v), solved: (id) => !!G.solved[id] }; }
function splitFor(pz) {
  if (!pz.split) return '';
  const n = nOf(), mine = pz.split.map((h, i) => ({ h, i })).filter(x => n === 1 || x.i % n === L.seat);
  const others = n > 1 ? pz.split.length - mine.length : 0;
  if (!mine.length) return `<div class="pz-split"><h4>🃏 這題的 ${pz.split.length} 張線索卡都在隊友手上</h4><p class="small">打開 💬 聊天，請他們把線索唸給你聽。</p></div>`;
  return `<div class="pz-split"><h4>🃏 你手上的線索卡${n > 1 ? `（另外 ${others} 張在隊友手上，用 💬 聊天互相告訴對方）` : ''}</h4>${mine.map(x => `<div class="clue"><span>線索 ${'ABCDEFGH'[x.i]}</span>${x.h}</div>`).join('')}</div>`;
}
function mpState(id) { const z = PZ[id]; return (G.mp && G.mp[id]) || z.mpInit(G.players.length, G); }
function mpDraw(first) {
  const id = L.openPz, z = PZ[id], body = $('#modal .pz-body'); if (!z || !body) return;
  const ctx = ctxOf(); ctx.mp = (v) => act({ t: 'mp', id, v });
  try { z.mpView(body, ctx, mpState(id), first); } catch (e) { console.warn(e); }
}
function refreshPz(fresh) {
  const id = L.openPz; if (!id) return;
  const pz = PZ[id], done = !!G.solved[id], ctx = ctxOf();
  const m = $('#modal'); m.hidden = false;
  const hinted = G.hinted[id];
  if (fresh || !m.dataset.id || m.dataset.id !== id || done !== (m.dataset.done === '1')) {
    m.dataset.id = id; m.dataset.done = done ? '1' : '0';
    m.innerHTML = `<div class="pz-card lv${pz.lv}"><header><span class="pz-no">#${pz.no}</span><b>${esc(pz.t)}</b><span class="lv">${pz.mp ? '多人・' : ''}${LV[pz.lv]}</span><button class="x" data-close>✕</button></header>
      <div class="pz-body"></div>${splitFor(pz)}
      ${done ? `<div class="pz-done">✅ 已解開　答案：<b>${esc(pz.show || (Array.isArray(pz.ans) ? pz.ans[0] : pz.solve || ''))}</b></div>` : (pz.ui === 'none' ? '' : `<form class="pz-ans"><input name="a" autocomplete="off" placeholder="${esc(pz.ph || '輸入答案')}" ${pz.num ? 'inputmode="numeric"' : ''}><button class="btn gold">送出</button></form>`)}
      <footer><button class="btn ghost sm" data-hint>${hinted ? '😇 再看一次博育的提示' : '😇 問小天使博育（地圖 -1）'}</button><span class="muted small">${G.wrong[id] ? `已答錯 ${G.wrong[id]} 次` : ''}</span></footer></div>`;
    const body = $('.pz-body', m);
    try { if (pz.mp && !done) { body.innerHTML = ''; setTimeout(() => mpDraw(true)); } else if (pz.mp) body.innerHTML = `<p>${esc(pz.doneText || '你們一起完成了這一關！')}</p>`; else if (pz.build) pz.build(body, ctx, done); else body.innerHTML = typeof pz.body === 'function' ? pz.body(ctx) : (pz.body || ''); } catch (e) { console.warn(e); body.textContent = '（這題載入失敗）'; }
    const f = $('.pz-ans', m); if (f) f.onsubmit = (e) => { e.preventDefault(); const v = f.a.value; if (!norm(v)) return; submitAns(id, v); f.a.value = ''; };
    $('[data-close]', m).onclick = closePz;
    $('[data-hint]', m).onclick = () => askHint(id);
    m.onclick = (e) => { if (e.target === m) closePz(); };
  }
}
function closePz() {
  if (!L.openPz) return;
  L.openPz = null; $('#modal').hidden = true; $('#modal').innerHTML = ''; delete $('#modal').dataset.id;
  delete L.looks[L.seat]; if (G?.mode === 'multi') NET.send('look', { seat: L.seat, id: null });
  if (G?.phase === 'play') renderScene();
}
function checkAns(pz, v) {
  if (typeof pz.check === 'function') return !!pz.check(v, ctxOf());
  const list = [].concat(pz.ans ?? pz.solve);
  return list.some(a => norm(a) === norm(v));
}
function submitAns(id, v) {
  const pz = PZ[id]; if (!pz || G.solved[id] || G.lost) return;
  if (checkAns(pz, v)) act({ t: 'solve', id });
  else { act({ t: 'wrong', id }); }
}
async function askHint(id) {
  const pz = PZ[id];
  if (!G.hinted[id]) {
    if (!await confirmBox(`要請小天使博育幫忙嗎？<br><small>博育只會給大方向，不會直接說答案。<br>會用掉 <b>1 張地圖</b>（現在 ${G.maps} 張）。${G.maps <= 1 ? '<br><b style="color:#E8453C">這是最後一張地圖，用完就會迷路。</b>' : ''}</small>`)) return;
    act({ t: 'hint', id });
  }
  sfx('angel');
  panel(`<div class="angel"><img src="${PORTRAIT.url('ang', 'happy')}" alt=""><div><b>😇 小天使博育</b><p>${esc(pz.hint || '再仔細看一次題目裡的每一個字。')}</p></div></div>`, '提示');
}

// ---------- 通用面板 ----------
function panel(html, title = '', btns = [['好', true]]) {
  return new Promise(res => {
    const p = $('#panel'); p.hidden = false;
    p.innerHTML = `<div class="pn-card">${title ? `<h3>${title}</h3>` : ''}<div class="pn-body">${html}</div><div class="pn-btns">${btns.map(([t, v], i) => `<button class="btn ${i === 0 ? 'gold' : 'ghost'}" data-i="${i}">${t}</button>`).join('')}</div></div>`;
    $$('.pn-btns button', p).forEach(b => b.onclick = () => { p.hidden = true; p.innerHTML = ''; res(btns[+b.dataset.i][1]); });
  });
}
const confirmBox = (html) => panel(html, '', [['確定', true], ['取消', false]]);

// ---------- 迷路 ----------
function showLost() {
  if ($('#lost')) return;
  const d = document.createElement('div'); d.id = 'lost';
  d.innerHTML = `<div class="pn-card"><h2>🧭 你們迷路了</h2><p>8 張地圖都用完了。<br>四個人站在台北街頭，誰也不知道現在在哪裡。</p>
    <p class="quote">小羽：「神人，我們迷路了。」<br>俊治：「完全法克。」</p><p>重新出發會補滿 8 張地圖，但時間 <b>+10 分鐘</b>。</p><button class="btn gold" id="bRevive">重新找路</button></div>`;
  document.body.append(d); $('#bRevive').onclick = () => act({ t: 'revive' });
}
function hideLost() { $('#lost')?.remove(); }

// ---------- 劇情播放（每台裝置各自播放） ----------
let sayResolve = null;
function playLines(lines) {
  return new Promise(async (res) => {
    L.busy++; L.skip = false;
    const box = $('#say'); box.hidden = false;
    for (const ln of lines) {
      if (L.skip) break;
      if (typeof ln === 'object' && !Array.isArray(ln)) {
        if (ln.sfx) sfx(ln.sfx);
        if (ln.bg) { const sc = $('#scene'); sc.dataset.k = ln.bg; sc.innerHTML = `<div class="sc-art">${ART.svg(ln.bg)}</div><div class="sc-pins"></div>`; }
        if (ln.bgm) AU.bgm(ln.bgm);
        if (ln.card) await chapterCard(ln.card, ln.sub);
        if (ln.phone) await phoneChat(ln.phone);
        if (ln.item) toast(`${ITEMS[ln.item].i} 獲得道具：<b>${ITEMS[ln.item].n}</b>`, 'item');
        if (ln.burst) burst(ln.burst, 26);
        continue;
      }
      let ch = null, text = ln, zh = null, mood = 'talk';
      if (Array.isArray(ln)) { [ch, text, zh] = ln; if (ln[3]) mood = ln[3]; }
      $('#sayN').textContent = ch ? (CH[ch]?.n || '') : '';
      $('#sayN').style.background = ch ? (CH[ch]?.c || '#555') : 'transparent';
      $('#sayP').innerHTML = ch ? `<img src="${PORTRAIT.url(ch, mood)}" alt="">` : '';
      $('#sayP').className = ch ? 'side-' + (['zn', 'by', 'ang'].includes(ch) ? 'l' : 'r') : '';
      box.classList.toggle('narr', !ch);
      $('#sayT').textContent = text;
      $('#sayZh').textContent = zh ? '【中文翻譯】' + zh : '';
      sfx('click');
      await new Promise(r => { sayResolve = r; });
    }
    box.hidden = true; L.busy = Math.max(0, L.busy - 1); res();
  });
}
function chapterCard(t, sub) {
  return new Promise(r => {
    sfx('chap'); const d = document.createElement('div'); d.className = 'ch-card'; d.innerHTML = `<div><small>${esc(sub || '')}</small><h2>${esc(t)}</h2></div>`;
    document.body.append(d); setTimeout(() => d.classList.add('out'), 2200); setTimeout(() => { d.remove(); r(); }, 2700);
    d.onclick = () => { d.remove(); r(); };
  });
}
function phoneChat(msgs) {
  return new Promise(async r => {
    const d = document.createElement('div'); d.className = 'phone-ov'; d.innerHTML = `<div class="phone"><div class="ph-top">💬 台北兩日遊（4）</div><div class="ph-list"></div><button class="btn gold sm">收起手機</button></div>`;
    document.body.append(d); const list = $('.ph-list', d);
    for (const [ch, t] of msgs) { await sleep(L.skip ? 0 : 650); sfx('msg'); list.insertAdjacentHTML('beforeend', `<div class="ph-msg ${ch === 'zn' ? 'me' : ''}"><img src="${PORTRAIT.head(ch)}"><div><b>${CH[ch].n}</b><p>${esc(t)}</p></div></div>`); list.scrollTop = 1e6; }
    $('button', d).onclick = () => { d.remove(); r(); };
  });
}
async function playChapter(ch) {
  if (L.playing === ch) return;
  L.playing = ch; closePz();
  const prev = ch - 1;
  if (prev >= 0 && L.story === prev && STORY[prev]?.outro) await playLines(STORY[prev].outro);
  if (STORY[ch]?.intro) await playLines([{ card: `${CHAPTERS[ch].name}　${CHAPTERS[ch].place}`, sub: STORY[ch].sub || '' }, ...STORY[ch].intro]);
  L.story = ch; L.playing = null;
  try { localStorage.setItem('bang_story_' + G.id, String(ch)); } catch (e) {}
  render();
}

// ---------- 旅行日誌（所有對話，給「口頭禪」類謎題查） ----------
function journal() {
  const upto = G.phase === 'play' ? G.ch : CHAPTERS.length - 1;
  let h = '';
  for (let c = 0; c <= upto; c++) {
    const s = STORY[c]; if (!s) continue;
    const lines = [...(s.intro || []), ...((c < upto || chapterDone(c)) ? (s.outro || []) : [])];
    h += `<h4>${CHAPTERS[c].name}・${CHAPTERS[c].place}</h4>` + lines.map(l => {
      if (typeof l === 'string') return `<p class="j-n">${esc(l)}</p>`;
      if (Array.isArray(l)) return `<p><b style="color:${CH[l[0]]?.c}">${CH[l[0]]?.n}</b>：${esc(l[1])}${l[2] ? `<small>（${esc(l[2])}）</small>` : ''}</p>`;
      if (l.phone) return l.phone.map(([ch, t]) => `<p class="j-ph">📱 <b>${CH[ch].n}</b>：${esc(t)}</p>`).join('');
      return '';
    }).join('');
  }
  return `<div class="journal">${h}</div>`;
}

// ---------- 聊天 ----------
function addChat(m, mine) {
  L.chat.push(m); if (L.chat.length > 200) L.chat.shift();
  const html = `<div class="cm ${mine ? 'me' : ''}"><img src="${PORTRAIT.head(m.ch || 'zn')}"><div><b>${esc(m.name)}</b><p>${esc(m.text)}</p></div></div>`;
  ['#chatLog', '#wChatLog'].forEach(s => { const e = $(s); if (e) { e.insertAdjacentHTML('beforeend', html); e.scrollTop = 1e6; } });
  if (!mine) { sfx('msg'); if ($('#chat').hidden && G?.phase !== 'room') { L.unread++; $('#chatBadge').hidden = false; $('#chatBadge').textContent = L.unread; quip(m.ch || 'zn', m.text); } }
}
function sendChat(text) {
  text = String(text || '').trim().slice(0, 120); if (!text || !G) return;
  const m = { name: L.me.name, ch: myPlayer()?.ch || null, text, id: L.me.id };
  if (G.mode === 'multi') NET.send('chat', m);
  addChat(m, true);
}

// ---------- 最終遊戲 ----------
function startFinale() {
  const n = G.players.length, k = FIN_BY_N[n], mod = FINALE.mods[k];
  const seats = G.players.map((p, i) => ({ seat: i, ch: p.ch, name: p.name, bot: false }));
  G.phase = 'finale'; G.fin = { k, s: mod ? mod.init({ seats, seed: G.seed }) : null, ev: [], seq: 0, res: null };
}
let finIntroShown = null;
async function renderFinale() {
  const f = G.fin, mod = FINALE.mods[f?.k];
  if (!mod) { show('finale'); $('#finRoot').innerHTML = '<p style="padding:40px">（最終遊戲載入失敗）</p>'; return; }
  if (finIntroShown !== G.id) {
    finIntroShown = G.id; show('game');
    await playLines([...(STORY[9].outro || []), ...(STORY.fin[G.players.length] || [])]);
  }
  if (L.busy) return;
  show('finale');
  const root = $('#finRoot');
  if (!L.finRoot) { root.innerHTML = `<div class="fin-top"><b>${esc(mod.title || '')}</b><span id="finTime"></span><button class="btn ghost sm" id="finChat">💬</button></div><div id="finMod"></div><div id="finEnd"></div>`; L.finRoot = $('#finMod'); $('#finChat').onclick = toggleChat; }
  const evs = L.lastFinSeq !== f.seq ? (f.ev || []) : [];
  L.lastFinSeq = f.seq;
  evs.forEach(e => { if (e.q) quip(e.q[0], e.q[1], e.q[2]); if (e.sfx) sfx(e.sfx); if (e.toast) toast(esc(e.toast)); });
  if (f.err && f.err.to === L.me.id && L.lastErr !== f.err.n) { L.lastErr = f.err.n; toast(esc(f.err.msg)); }
  try { mod.render(L.finRoot, f.s, L.seat, (a) => act({ t: 'fin', a }), evs); } catch (e) { console.warn(e); }
  $('#finEnd').innerHTML = f.res ? `<div class="fin-done"><p>比賽結束！</p><button class="btn gold" id="bAward">🏆 前往頒獎典禮</button></div>` : '';
  if (f.res) $('#bAward').onclick = () => act({ t: 'award' });
}

// ---------- 頒獎與結局 ----------
function makeAward() {
  const r = G.fin.res, n = G.players.length, k = G.fin.k;
  const rank = r.rank.slice(), score = r.score || {};
  const code = (seat) => {
    const pos = rank.indexOf(seat);
    if (k === 'pinball') return 'pb';
    if (k === 'xiangqi') return r.draw ? 'xq_d' : pos === 0 ? 'xq_w' : 'xq_l';
    if (k === 'cards') return 'cd' + (pos + 1);
    return 'mj' + (pos + 1);
  };
  return { rank, score, lines: r.lines || [], codes: G.players.map((_, i) => code(i)), n };
}
let awardShown = null;
async function renderAward() {
  const a = G.award; if (!a) return;
  show('award');
  const root = $('#awardRoot');
  if (awardShown === G.id) return;
  awardShown = G.id;
  const ord = a.rank.map(s => G.players[s]);
  root.innerHTML = `<div class="aw-stage"><div class="aw-title">🏆 ${a.n === 1 ? '越南公主・彈珠王' : a.n === 2 ? '尊嚴之戰' : a.n === 3 ? '台灣遊戲大賽' : '麻將最終決戰'}　頒獎典禮</div><div class="aw-pod" id="awPod"></div><div class="aw-lines" id="awLines"></div><div id="awNext"></div></div>`;
  AU.bgm('end');
  const pod = $('#awPod');
  // 由後往前公布
  const rev = ord.map((p, i) => ({ p, i })).reverse();
  for (const { p, i } of rev) {
    await sleep(900);
    if (a.n > 1) quip('by', i === 0 ? '第一名——！' : `第${['一', '二', '三', '四'][i]}名……`);
    sfx(i === 0 ? 'fanfare' : 'pop');
    pod.insertAdjacentHTML('afterbegin', `<div class="aw-p r${i + 1}" style="--c:${CH[p.ch].c}"><span class="aw-r">${a.n === 1 ? '👑' : ['🥇', '🥈', '🥉', '4'][i]}</span><img src="${PORTRAIT.url(p.ch, i === 0 ? 'happy' : i === a.rank.length - 1 && a.n > 1 ? 'cry' : 'norm')}"><b>${CH[p.ch].n}</b><small>${esc(p.name)}</small>${a.score[a.rank[i]] != null && a.n > 2 ? `<em>${a.score[a.rank[i]]} 分</em>` : ''}</div>`);
    if (i === 0) burst('🎆', 40);
  }
  $('#awLines').innerHTML = (a.lines || []).map(l => `<p>${esc(l)}</p>`).join('');
  await sleep(1200);
  $('#awNext').innerHTML = `<button class="btn gold" id="bEndStory">繼續 ▶</button>`;
  $('#bEndStory').onclick = async () => { show('game'); await playLines(STORY.ending(G)); renderEnd(); };
}
function renderEnd() {
  const a = G.award, mine = a.codes[L.seat], e = ENDINGS.find(x => x[0] === mine);
  unlockEnding(mine);
  if (!L.recorded) { L.recorded = true; try { window.SD && SD.clear(L.rid, G.t, G.deaths, G.hints, mine); } catch (er) {} achievements(mine); }
  show('award');
  $('#awardRoot').innerHTML = `<div class="end-card"><p class="kicker">THE END</p><h1>《越南公主》</h1><p class="end-q">「旅程結束了，但遊戲才剛開始。」</p>
    <div class="end-get"><small>你的結局</small><b>${esc(e?.[1] || '')}</b><span>${esc(e?.[2] || '')}</span></div>
    <p class="end-thanks">感謝你與甄妮、小羽、俊治、博育一起完成台灣兩日遊。<br>你們去了故宮、台北美術館、九份、十分、台北 101、淡水、西門町、饒河夜市，<br>最後，在大安森林公園——決定誰才是最強的台灣遊戲王。</p>
    <p class="end-stat">時間 ${fmt(G.t)}・解開 ${Object.keys(G.solved).length} 題・答錯 ${G.wrongs} 次・提示 ${G.hints} 次・迷路 ${G.deaths} 次</p>
    <p class="end-last">「神人。」</p>
    <div class="t-btns"><button class="btn gold" id="bGal2">🏆 結局圖鑑（${Object.keys(endings()).length}/${ENDINGS.length}）</button><button class="btn" id="bAgain">再玩一次</button><button class="btn ghost" onclick="toLobby()">回到大廳</button></div></div>`;
  $('#bGal2').onclick = gallery; $('#bAgain').onclick = () => { clearSave(); location.reload(); };
  burst('🎉', 30);
}
function achievements(code) {
  const A = [];
  A.push('bg_' + code);
  if (G.hints === 0) A.push('bg_nohint');
  if (G.wrongs === 0) A.push('bg_nowrong');
  if (G.deaths === 0) A.push('bg_nolost');
  if (G.t <= GOAL) A.push('bg_fast');
  if (G.players.length === 4) A.push('bg_party');
  const got = endings(); if (ENDINGS.every(x => got[x[0]])) A.push('bg_all');
  A.forEach(c => { try { window.SD && SD.ach(c); } catch (e) {} });
}
function renderFail() {
  show('award');
  if (!L.failRec) { L.failRec = true; try { window.SD && SD.fail(L.rid, G.t, G.deaths, G.hints); } catch (e) {} }
  $('#awardRoot').innerHTML = `<div class="end-card"><p class="kicker">TIME OVER</p><h1>旅程失敗</h1><p>超過 300 分鐘了。<br>甄妮的班機已經起飛，四個人還在台北街頭繞圈圈。</p><p class="quote">俊治：「完全法克。」<br>小羽：「……神人，我們重來。」</p>
    <div class="t-btns">${isHost() ? '<button class="btn gold" id="bRe">重新開始旅程</button>' : '<p class="muted">等房主重新開始……</p>'}<button class="btn ghost" onclick="toLobby()">回到大廳</button></div></div>`;
  const b = $('#bRe'); if (b) b.onclick = () => { L.story = -1; L.failRec = false; act({ t: 'restart' }); };
}
function gallery() {
  const e = endings();
  panel(`<p>已收集 <b>${Object.keys(e).filter(k => ENDINGS.some(x => x[0] === k)).length}</b> / ${ENDINGS.length}</p><div class="gal">${ENDINGS.map(([k, t, d]) => `<div class="${e[k] ? 'got' : ''}"><b>${e[k] ? esc(t) : '？？？'}</b><small>${esc(d)}</small></div>`).join('')}</div>`, '🏆 結局圖鑑');
}
function toggleChat() { const c = $('#chat'); c.hidden = !c.hidden; if (!c.hidden) { L.unread = 0; $('#chatBadge').hidden = true; $('#chatIn').focus(); } }
function toLobby() { save(); location.href = 'https://hao-yuliu.github.io/escape-room/'; }
