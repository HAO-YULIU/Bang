'use strict';
// ===== 音效與配樂：全部用 Web Audio 即時合成，不需要外部檔案 =====
const AU = (() => {
  let ctx = null, master = null, sfxBus = null, bgmBus = null, on = true, mood = null, timer = null, step = 0;
  try { on = localStorage.getItem('bang_snd') !== '0'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = on ? 0.9 : 0; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    bgmBus = ctx.createGain(); bgmBus.gain.value = 0.16; bgmBus.connect(master);
  }
  const t0 = () => ctx.currentTime;

  function tone(f, d = 0.15, type = 'sine', v = 0.4, when = 0, bus = sfxBus, slide = 0) {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), t = t0() + when;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05);
  }
  function noise(d = 0.2, v = 0.3, when = 0, freq = 2000, q = 1, type = 'bandpass') {
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * d), buf = ctx.createBuffer(1, len, ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t = t0() + when;
    s.buffer = buf; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = v;
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
  }
  const N = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

  const SFX = {
    click: () => tone(1200, 0.05, 'triangle', 0.15),
    type: () => tone(2400 + Math.random() * 400, 0.018, 'square', 0.025),
    pop: () => { tone(660, 0.08, 'sine', 0.3); tone(990, 0.1, 'sine', 0.2, 0.05); },
    miss: () => tone(220, 0.08, 'triangle', 0.12),
    ok: () => [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.35, 'triangle', 0.28, i * 0.07)),
    ng: () => { tone(180, 0.22, 'square', 0.12, 0, sfxBus, 0.7); tone(150, 0.25, 'square', 0.1, 0.1, sfxBus, 0.7); },
    ding: () => { tone(N(88), 0.25, 'sine', 0.25); tone(N(81), 0.4, 'sine', 0.22, 0.12); },
    page: () => noise(0.25, 0.25, 0, 3500, 0.7, 'highpass'),
    slide: () => tone(500, 0.04, 'sine', 0.08, 0, sfxBus, 1.3),
    shutter: () => { noise(0.05, 0.6, 0, 4000, 1); noise(0.08, 0.5, 0.08, 2500, 1); },
    heart: () => { tone(70, 0.16, 'sine', 0.7, 0, sfxBus, 0.6); tone(65, 0.18, 'sine', 0.55, 0.2, sfxBus, 0.6); },
    door: () => { tone(90, 0.4, 'sine', 0.5, 0, sfxBus, 0.5); noise(0.3, 0.25, 0, 300, 1, 'lowpass'); },
    objection: () => { [60, 64, 67, 72].forEach(n => tone(N(n), 0.6, 'sawtooth', 0.12)); noise(0.3, 0.5, 0, 1200, 0.8); tone(N(48), 0.7, 'square', 0.15); },
    rank: () => [79, 83, 86, 91, 95].forEach((n, i) => tone(N(n), 0.6, 'sine', 0.18, i * 0.09)),
    frag: () => [96, 91, 100, 93].forEach((n, i) => tone(N(n), 0.3, 'sine', 0.12, i * 0.06)),
    caught: () => { tone(880, 0.12, 'square', 0.15); tone(660, 0.2, 'square', 0.15, 0.12); },
    warn: () => tone(1500, 0.05, 'sine', 0.1),
    weigh: () => { tone(300, 0.15, 'triangle', 0.25, 0, sfxBus, 1.5); noise(0.1, 0.15, 0.1, 5000, 2); },
    chap: () => { tone(N(57), 1.6, 'triangle', 0.2); tone(N(64), 1.6, 'triangle', 0.15, 0.15); tone(N(69), 1.8, 'sine', 0.15, 0.3); noise(1.2, 0.1, 0, 6000, 0.5, 'highpass'); },
    phone: () => { for (let i = 0; i < 2; i++) { tone(N(84), 0.12, 'square', 0.08, i * 0.3); tone(N(88), 0.12, 'square', 0.08, i * 0.3 + 0.13); } },
    end: () => [60, 64, 67, 71, 74, 79].forEach((n, i) => tone(N(n), 1.8, 'triangle', 0.15, i * 0.18)),
    good: () => [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.35, 'triangle', 0.28, i * 0.07)),
    bad: () => { tone(180, 0.22, 'square', 0.12, 0, sfxBus, 0.7); tone(150, 0.25, 'square', 0.1, 0.1, sfxBus, 0.7); },
    win: () => [67, 72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), 0.5, 'triangle', 0.2, i * 0.08)),
    fanfare: () => { [60, 64, 67, 72, 67, 72, 76, 79].forEach((n, i) => tone(N(n), 0.42, 'sawtooth', 0.07, i * 0.13)); [48, 55, 60].forEach((n, i) => tone(N(n), 1.6, 'triangle', 0.25, 0.9 + i * 0.05)); },
    card: () => { noise(0.06, 0.35, 0, 4200, 1.2); tone(900, 0.03, 'triangle', 0.05); },
    shuffle: () => { for (let i = 0; i < 8; i++) noise(0.04, 0.25, i * 0.05, 3800 + i * 100, 1); },
    tile: () => { tone(1800, 0.04, 'square', 0.06); noise(0.07, 0.4, 0, 2400, 3); tone(320, 0.08, 'triangle', 0.2); },
    marble: () => { tone(2600, 0.06, 'sine', 0.25); tone(3900, 0.05, 'sine', 0.12, 0.01); },
    hit: () => { tone(2200, 0.05, 'triangle', 0.3); noise(0.03, 0.3, 0, 6000, 2); },
    map: () => { noise(0.3, 0.3, 0, 2600, 0.8, 'highpass'); tone(400, 0.3, 'triangle', 0.15, 0.05, sfxBus, 0.5); },
    lost: () => [67, 63, 60, 55].forEach((n, i) => tone(N(n), 0.5, 'triangle', 0.2, i * 0.22)),
    angel: () => [84, 88, 91, 96, 100].forEach((n, i) => tone(N(n), 0.7, 'sine', 0.12, i * 0.07)),
    msg: () => { tone(N(84), 0.08, 'sine', 0.2); tone(N(91), 0.1, 'sine', 0.15, 0.08); },
    lantern: () => { noise(0.6, 0.15, 0, 900, 0.6, 'lowpass'); tone(N(76), 0.8, 'sine', 0.1, 0.1); },
  };


  // ---- 配樂：簡單的步進編曲 ----
  const SONGS = {
    // 五聲音階、輕快的「台灣旅行」感
    title: { bpm: 96, ch: [[60, 64, 67, 69], [57, 60, 64, 67], [62, 65, 69, 72], [55, 60, 62, 67]], arp: 1, lead: [72, 0, 74, 0, 76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 0, 0] },
    day: { bpm: 104, ch: [[60, 64, 67, 72], [62, 67, 69, 74], [57, 60, 64, 69], [55, 60, 62, 67]], arp: 1, lead: [79, 0, 76, 0, 74, 0, 72, 0, 74, 0, 76, 0, 69, 0, 0, 0] },
    night: { bpm: 112, ch: [[57, 60, 64, 67], [55, 60, 62, 67], [53, 57, 60, 65], [55, 59, 62, 67]], arp: 1, pulse: 1, lead: [76, 0, 79, 0, 81, 0, 79, 76, 74, 0, 72, 0, 74, 0, 0, 0] },
    calm: { bpm: 72, ch: [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64], [57, 60, 64, 67]], arp: 1, lead: [] },
    tense: { bpm: 120, ch: [[57, 60, 64], [58, 62, 65], [57, 60, 64], [56, 59, 64]], arp: 0, pulse: 1, lead: [] },
    end: { bpm: 80, ch: [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], arp: 1, lead: [79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 0, 0, 72, 0, 0, 0] },
  };
  function tick() {
    const s = SONGS[mood]; if (!s || !ctx) return;
    const bar = Math.floor(step / 16) % s.ch.length, b = step % 16, chord = s.ch[bar], beat = 60 / s.bpm / 4;
    if (b === 0) { chord.forEach(n => tone(N(n), beat * 15, 'sine', 0.12, 0, bgmBus)); tone(N(chord[0] - 12), beat * 7, 'triangle', 0.35, 0, bgmBus); }
    if (b === 8) tone(N(chord[0] - 12), beat * 7, 'triangle', 0.28, 0, bgmBus);
    if (s.arp && b % 2 === 0) tone(N(chord[(b / 2) % chord.length] + 12), beat * 3, 'triangle', 0.1, 0, bgmBus);
    if (s.pulse && b % 4 === 0) { tone(N(chord[0] - 24), beat * 2, 'sine', 0.4, 0, bgmBus); noise(0.05, 0.05, 0, 8000, 1, 'highpass'); }
    const L = s.lead[b + (bar % 2) * 0]; if (L && bar % 2 === 1) tone(N(L), beat * 6, 'sine', 0.16, 0, bgmBus);
    step++;
  }
  function bgm(m) {
    if (m === mood) return;
    if (!ctx && !(navigator.userActivation && navigator.userActivation.hasBeenActive)) { mood = null; return; }
    mood = m; step = 0; clearInterval(timer); timer = null;
    if (!m || !SONGS[m]) return;
    init();
    timer = setInterval(tick, 60000 / SONGS[m].bpm / 4);
  }
  return {
    init,
    sfx(n) { if (!on) return; if (!ctx && !(navigator.userActivation && navigator.userActivation.hasBeenActive)) return; init(); try { SFX[n]?.(); } catch (e) {} },
    bgm,
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('bang_snd', on ? '1' : '0'); } catch (e) {} init(); if (master) master.gain.value = on ? 0.9 : 0; return on; },
  };
})();
const sfx = (n) => AU.sfx(n);
