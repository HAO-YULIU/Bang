'use strict';
// ===== 越南公主：標題、房間、按鈕接線 =====
(() => {
  // 標題畫面
  $('#t-bg').innerHTML = `<img class="t-cover" src="img/cover.jpg" alt="越南公主 封面">` + ART.svg('title');
  $('#t-cast').innerHTML = ['zn', 'xy', 'jz', 'by'].map(k => `<figure><img src="${PORTRAIT.url(k)}" alt=""><figcaption style="--c:${CH[k].c}">${CH[k].n}</figcaption></figure>`).join('');
  $('#bSnd').textContent = AU.on ? '🔊' : '🔇';
  $('#bSnd').onclick = () => { $('#bSnd').textContent = AU.toggle() ? '🔊' : '🔇'; };
  $('#bGal').onclick = gallery;
  $('#bHow').onclick = () => panel(`<div class="how">
    <p>🌏 <b>單人</b>：你是甄妮。<b>開房間</b>：1–4 人連線，人數決定最後的遊戲：</p>
    <ul><li>1 人：甄妮的彈珠試煉</li><li>2 人（甄妮／小羽）：大盤象棋，尊嚴之戰</li><li>3 人（甄妮／小羽／俊治）：撲克牌大會（大老二、撿紅點、抽鬼牌）</li><li>4 人（甄妮／小羽／俊治／博育）：麻將最終決戰（打一圈）</li></ul>
    <p>🧩 一共 <b>${PZL.length} 道謎題</b>，難度從「困難」到「地獄」，還有幾題「夢魘」。每一站的謎題都解開，才能前往下一站。多人時大家可以同時解不同的題目。</p>
    <p>🃏 有些題目的線索會<b>分給不同的玩家</b>，每個人只看得到自己那幾張，要用 💬 聊天互相說。</p>
    <p>🗺️ 你們共用 <b>8 張地圖</b>：答錯一次、問小天使博育一次提示，都會用掉一張。地圖用完就會<b>迷路</b>，重新找路時間 +10 分鐘。</p>
    <p>📓 旅行日誌記錄了所有對話——有些答案就藏在大家講過的屁話裡。</p>
    <p>⏱ 建議 100 分鐘。超過 <b>300 分鐘</b>旅程失敗，要重新開始。</p></div>`, '📖 怎麼玩');

  // 對話框
  $('#say').addEventListener('click', (e) => { if (e.target.id === 'sayskip') return; if (sayResolve) { const r = sayResolve; sayResolve = null; r(); } });
  $('#sayskip').onclick = () => { L.skip = true; if (sayResolve) { const r = sayResolve; sayResolve = null; r(); } };
  document.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !$('#say').hidden && document.activeElement?.tagName !== 'INPUT' && sayResolve) { e.preventDefault(); const r = sayResolve; sayResolve = null; r(); } });

  // 場景
  $('#scene').addEventListener('click', (e) => { const b = e.target.closest('.pin'); if (b) openPz(b.dataset.id); });
  $('#bNext').onclick = () => { sfx('click'); act({ t: 'next', ch: G.ch }); };
  $('#hItems').onclick = () => panel(G.items.length ? `<div class="items">${G.items.map(k => `<div><span>${ITEMS[k].i}</span><b>${ITEMS[k].n}</b><small>${ITEMS[k].d}</small></div>`).join('')}</div>` : '<p>還沒有道具。</p>', '🎒 道具');
  $('#hLog').onclick = () => panel(journal(), '📓 旅行日誌（大家講過的每一句話）');
  $('#hChat').onclick = toggleChat;
  $('#chatX').onclick = toggleChat;
  const go = () => { sendChat($('#chatIn').value); $('#chatIn').value = ''; };
  $('#chatGo').onclick = go; $('#chatIn').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  $$('.chat-quick button').forEach(b => b.onclick = () => sendChat(b.dataset.q));
  const wgo = () => { sendChat($('#wChatIn').value); $('#wChatIn').value = ''; };
  $('#wChatGo').onclick = wgo; $('#wChatIn').onkeydown = (e) => { if (e.key === 'Enter') wgo(); };
  $('#hMenu').onclick = async () => {
    const r = await panel(`<p>房號：${G.mode === 'multi' ? '<b>' + G.code + '</b>' : '單人'}　｜　時間 ${fmt(G.t)}　｜　地圖 ${G.maps} 張</p><p class="muted small">進度會自動存檔。</p>`, '選單',
      [['繼續', 0], [AU.on ? '🔇 關閉音效' : '🔊 開啟音效', 1], ['📖 怎麼玩', 2], ['回到標題', 3], ['回到大廳', 4]]);
    if (r === 1) AU.toggle(); if (r === 2) $('#bHow').click();
    if (r === 3) { save(); location.reload(); } if (r === 4) toLobby();
  };
  $$('[data-back]').forEach(b => b.onclick = () => { NET.leave(); show('title'); });
})();

// ---------- 啟動（等夜語工作室確認身分） ----------
function boot() {
  if (L.me) return;
  let tab = ''; try { tab = sessionStorage.getItem('bang_tab') || Math.random().toString(36).slice(2, 7); sessionStorage.setItem('bang_tab', tab); } catch (e) { tab = Math.random().toString(36).slice(2, 7); }
  L.me = { id: String(SD.uid || 'u').slice(0, 8) + '-' + tab, name: SD.player?.username || '玩家' };
  NET.init(SD.sb, L.me);
  NET.on('state', receive);
  NET.on('act', (a) => { if (isHost()) apply(a); });
  NET.on('chat', (m) => addChat(m, false));
  NET.on('look', ({ seat, id }) => { if (id) L.looks[seat] = id; else delete L.looks[seat]; if (G?.phase === 'play' && !L.busy) renderScene(); });
  NET.on('req', () => { if (G && isHost()) NET.send('st', G); });
  NET.on('members', onMembers);
  NET.on('rooms', renderRooms);
  startTicker();
  const sv = loadSave();
  if (sv && sv.players?.some(p => p.id.split('-')[0] === L.me.id.split('-')[0]) && sv.phase !== 'end') {
    $('#bResume').hidden = false;
    $('#bResume').textContent = sv.mode === 'solo' ? `↩ 繼續單人旅程（${CHAPTERS[sv.ch]?.place || ''}）` : `↩ 回到房間 ${sv.code}（${CHAPTERS[sv.ch]?.place || ''}）`;
    $('#bResume').onclick = () => resume(sv);
  }
}
if (window.SD) boot(); else window.addEventListener('sd-ready', boot);

function beginRecord() {
  const k = 'bang_rid_' + G.id;
  try { L.rid = localStorage.getItem(k); } catch (e) {}
  if (!L.rid && window.SD) SD.begin().then(id => { L.rid = id; try { localStorage.setItem(k, id || ''); } catch (e) {} });
  try { const s = localStorage.getItem('bang_story_' + G.id); L.story = s == null ? -1 : +s; } catch (e) { L.story = -1; }
}

// 單人
$('#bSolo').onclick = async () => {
  AU.init(); sfx('click');
  const sv = loadSave();
  if (sv && sv.phase !== 'end' && !await confirmBox('開始新的旅程會覆蓋目前的存檔，確定嗎？')) return;
  clearSave();
  G = newState('solo', [{ id: L.me.id, name: L.me.name, ch: 'zn' }]);
  beginRecord(); save(); show('game'); render();
};

// 開房間
$('#bHost').onclick = async () => {
  AU.init(); sfx('click');
  const code = String(1000 + Math.random() * 9000 | 0);
  toast('正在開房間…');
  if (!await NET.join(code)) { toast('連線失敗，請再試一次。', 'bad'); return; }
  G = newState('multi', [{ id: L.me.id, name: L.me.name, ch: null }], code);
  NET.watchLobby(); advertiseRoom(); render();
};

// 加入房間
$('#bJoin').onclick = () => { AU.init(); sfx('click'); show('rooms'); NET.watchLobby(); renderRooms(NET.rooms); };
$('#bCode').onclick = () => joinRoom($('#codeIn').value.trim());
$('#codeIn').onkeydown = (e) => { if (e.key === 'Enter') joinRoom($('#codeIn').value.trim()); };
function renderRooms(list) {
  const el = $('#roomList'); if (!el) return;
  el.innerHTML = list.length ? list.map(r => `<button class="room-item" data-code="${esc(r.code)}"><b>房間 ${esc(r.code)}</b><span>房主：${esc(r.host)}</span><em>${r.n}/4 人</em></button>`).join('')
    : '<p class="muted">目前沒有開著的房間。你也可以自己開一間，叫朋友進來。</p>';
  $$('.room-item', el).forEach(b => b.onclick = () => joinRoom(b.dataset.code));
}
async function joinRoom(code) {
  if (!/^\d{4}$/.test(code)) { toast('房號是四位數字。'); return; }
  toast('正在加入房間 ' + code + '…');
  if (!await NET.join(code)) { toast('連線失敗。', 'bad'); return; }
  G = null;
  for (let i = 0; i < 10 && !G; i++) { NET.send('req', {}); await sleep(600); }
  if (!G) { toast('找不到這個房間（可能已經關掉了）。', 'bad'); NET.leave(); return; }
  if (G.phase !== 'room' && !myPlayer()) { toast('這個房間的遊戲已經開始了。', 'bad'); G = null; NET.leave(); show('rooms'); return; }
  if (G.phase === 'room' && G.players.length >= 4 && !myPlayer()) { toast('房間滿了（4 人）。', 'bad'); G = null; NET.leave(); return; }
  if (myPlayer() && G.phase !== 'room') beginRecord();
  render();
}

// 恢復
async function resume(sv) {
  AU.init();
  if (sv.mode === 'solo') { G = sv; G.host = L.me.id; const p = G.players[0]; p.id = L.me.id; beginRecord(); show('game'); render(); return; }
  toast('正在回到房間 ' + sv.code + '…');
  // 用同一個玩家身分回去（換分頁時 id 尾碼不同，沿用存檔裡的）
  const old = sv.players.find(p => p.id.split('-')[0] === L.me.id.split('-')[0]); if (old) { L.me.id = old.id; NET.init(SD.sb, L.me); }
  if (!await NET.join(sv.code)) { toast('連線失敗。', 'bad'); return; }
  G = null;
  for (let i = 0; i < 6 && !G; i++) { NET.send('req', {}); await sleep(600); }
  if (!G) { G = sv; G.host = L.me.id; G.rev++; commit(); toast('房間裡沒有人，你現在是房主。'); }
  beginRecord(); render();
}

// ---------- 等待室 ----------
function renderWait() {
  $('#wCode').textContent = G.code;
  const n = G.players.length, allow = SEAT_CHARS[n], me = myPlayer();
  $('#wMembers').innerHTML = G.players.map(p => `<div class="wm ${p.id === G.host ? 'host' : ''}"><img src="${PORTRAIT.head(p.ch || 'zn', p.ch ? 'norm' : 'closed')}"><b>${esc(p.name)}${p.id === L.me.id ? '（你）' : ''}</b><span>${p.id === G.host ? '👑 房主・' : ''}${p.ch ? CH[p.ch].n : '還沒選角色'}</span></div>`).join('')
    + Array.from({ length: 4 - n }, () => `<div class="wm empty"><span>等待玩家加入…</span></div>`).join('');
  $('#wChars').innerHTML = ['zn', 'xy', 'jz', 'by'].map(k => {
    const taken = G.players.find(p => p.ch === k && p.id !== L.me.id), ok = allow.includes(k);
    return `<button class="wc ${me?.ch === k ? 'on' : ''}" data-ch="${k}" ${taken || !ok ? 'disabled' : ''} style="--c:${CH[k].c}"><img src="${PORTRAIT.url(k)}"><b>${CH[k].n}</b><small>${taken ? '已被選走' : !ok ? `${['', '', '', '3', '4'][['zn', 'xy', 'jz', 'by'].indexOf(k) + 1] || ''}人以上才能選` : '選擇'}</small></button>`;
  }).join('');
  $$('.wc', $('#wChars')).forEach(b => b.onclick = () => { sfx('pop'); act({ t: 'pick', ch: b.dataset.ch }); });
  $('#wRule').innerHTML = `現在 ${n} 人 → 最後的遊戲是 <b>${{ 1: '彈珠試煉', 2: '大盤象棋', 3: '撲克牌大會', 4: '麻將最終決戰' }[n]}</b>。可以選的角色：${allow.map(k => CH[k].n).join('、')}。`;
  const ready = n === 1 || G.players.every(p => allow.includes(p.ch));
  const bs = $('#bStart');
  bs.hidden = G.host !== L.me.id; bs.disabled = !ready;
  bs.textContent = ready ? `開始旅程（${n} 人）` : '等大家選好角色…';
  bs.onclick = () => { sfx('click'); act({ t: 'start' }); };
  $('#bLeave').onclick = () => { NET.leave(); NET.advertise(null); G = null; show('title'); };
  $('#wHint').textContent = G.host === L.me.id ? '把房號告訴朋友，或請他們在「加入房間」裡找到你。1 人也可以直接開始。' : '等房主開始旅程。';
}
// 開始時記錄
const _onState = onState;
onState = function () { const was = L._phase; _onState(); if (G && was === 'room' && G.phase === 'play' && myPlayer()) { beginRecord(); NET.advertise(null); } L._phase = G?.phase; };
