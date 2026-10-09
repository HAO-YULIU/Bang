'use strict';
// ===== 多人連線：Supabase Realtime（Broadcast + Presence） =====
// 大廳頻道 bang-lobby：每個開著房間的房主用 presence 公告自己的房間，大家看得到「線上的房間」。
// 房間頻道 bang-room-<房號>：presence = 誰在房間裡；broadcast = st（主機廣播的完整狀態）、act（玩家動作）、chat、look、req（要狀態）。
// 主機（host）權威：所有動作送到主機，主機算出新狀態再廣播。主機離開時，由還在線上、最早加入的玩家接手（每個人手上都有最新狀態）。
const NET = (() => {
  let sb = null, me = null, lobby = null, room = null, roomCode = null, joinedAt = 0;
  let lobbyRooms = [], members = [], H = {};
  const on = (k, f) => { H[k] = f; };
  const emit = (k, ...a) => { try { H[k] && H[k](...a); } catch (e) { console.warn(e); } };

  function init(client, player) { sb = client; me = player; }

  // ---------- 大廳 ----------
  let adv = null;
  function watchLobby() {
    if (!sb || lobby) return;
    lobby = sb.channel('bang-lobby', { config: { presence: { key: me.id } } });
    lobby.on('presence', { event: 'sync' }, () => {
      const st = lobby.presenceState();
      lobbyRooms = Object.values(st).flat().filter(p => p.room && p.id !== me.id).map(p => p.room)
        .filter((r, i, a) => a.findIndex(x => x.code === r.code) === i);
      emit('rooms', lobbyRooms);
    });
    lobby.subscribe(async (s) => { if (s === 'SUBSCRIBED') await lobby.track({ id: me.id, name: me.name, room: adv }); });
  }
  async function advertise(info) { adv = info; if (lobby) try { await lobby.track({ id: me.id, name: me.name, room: adv }); } catch (e) {} }

  // ---------- 房間 ----------
  function join(code) {
    return new Promise((res) => {
      leave();
      roomCode = code; joinedAt = Date.now();
      room = sb.channel('bang-room-' + code, { config: { broadcast: { self: false, ack: false }, presence: { key: me.id } } });
      room.on('broadcast', { event: 'st' }, ({ payload }) => emit('state', payload));
      room.on('broadcast', { event: 'act' }, ({ payload }) => emit('act', payload));
      room.on('broadcast', { event: 'chat' }, ({ payload }) => emit('chat', payload));
      room.on('broadcast', { event: 'look' }, ({ payload }) => emit('look', payload));
      room.on('broadcast', { event: 'req' }, ({ payload }) => emit('req', payload));
      room.on('presence', { event: 'sync' }, () => {
        const st = room.presenceState();
        members = Object.values(st).map(a => a[0]).filter(Boolean).sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
        emit('members', members);
      });
      let done = false;
      room.subscribe(async (s) => {
        if (s === 'SUBSCRIBED') { await room.track({ id: me.id, name: me.name, at: joinedAt }); if (!done) { done = true; res(true); } }
        if ((s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') && !done) { done = true; res(false); }
      });
      setTimeout(() => { if (!done) { done = true; res(false); } }, 12000);
    });
  }
  function leave() {
    if (room) { try { room.untrack(); sb.removeChannel(room); } catch (e) {} }
    room = null; roomCode = null; members = [];
  }
  const send = (event, payload) => { if (room) room.send({ type: 'broadcast', event, payload }); };

  return {
    init, on, watchLobby, advertise, join, leave, send,
    get rooms() { return lobbyRooms; }, get members() { return members; }, get code() { return roomCode; }, get me() { return me; },
    get ready() { return !!sb; },
  };
})();
