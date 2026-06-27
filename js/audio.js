// js/audio.js
import { getCfg, updateCfg } from './state.js';

let ctx = null;
let bgGain = null;
let bgType = null;

export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
}

export function getCtx() { return ctx; }

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function tone(freq, dur, type = 'sine', vol = 0.1) {
  if (!ctx || ctx.state !== 'running') return;
  const cfg = getCfg();
  const v = vol * cfg.sfxVol;
  if (v <= 0) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(v, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch (_) {}
}

function jNote(gain, f, t, d, v = 0.025) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.08);
  g.gain.setValueAtTime(v, t + d - 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g);
  g.connect(gain);
  o.start(t);
  o.stop(t + d);
}

export function startMusic(type) {
  stopMusic();
  bgType = type;
  if (!ctx) return;
  const cfg = getCfg();
  const g = ctx.createGain();
  g.gain.value = Math.max(0.001, cfg.musicVol);
  g.connect(ctx.destination);
  bgGain = g;
  const MAIN = [[261, 329, 392], [293, 370, 440], [246, 311, 370], [220, 277, 349]];
  const SHOP = [[110, 138, 164], [123, 155, 185], [98, 123, 146], [87, 110, 138]];
  const chords = type === 'shop' ? SHOP : MAIN;
  let ci = 0;
  let t0 = ctx.currentTime;
  function sched() {
    if (!bgGain || bgType !== type) return;
    const ch = chords[ci % chords.length];
    ci++;
    const len = type === 'shop' ? 2.4 : 1.8;
    ch.forEach((f, i) => jNote(g, f, t0, 0.9 + i * 0.06, 0.02 + (i * 0.004)));
    if (Math.random() > 0.4) {
      const mel = type === 'shop' ? [110, 138, 164, 185, 155, 123] : MAIN[ci % MAIN.length];
      const mf = mel[Math.floor(Math.random() * mel.length)] * (type === 'shop' ? 2 : 3);
      jNote(g, mf, t0 + 0.4, 0.3, 0.012);
    }
    t0 += len;
    setTimeout(sched, (len * 1000) * 0.55);
  }
  sched();
}

export function stopMusic() {
  if (bgGain) {
    try { bgGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); } catch (_) {}
    bgGain = null;
  }
  bgType = null;
}

export function setMusicType(type) {
  if (bgType === type) return;
  const cfg = getCfg();
  if (!cfg.musicOn) { stopMusic(); return; }
  startMusic(type);
}

export function updateMusicVol() {
  const cfg = getCfg();
  if (bgGain) try { bgGain.gain.value = Math.max(0.001, cfg.musicVol); } catch (_) {}
}

// Sound effects
export const S = {
  click: () => tone(700, 0.07, 'sine', 0.05),
  tab: () => { tone(900, 0.05, 'sine', 0.03); setTimeout(() => tone(1100, 0.05, 'sine', 0.02), 50); },
  open: () => { tone(200, 0.2, 'sine', 0.1); setTimeout(() => tone(320, 0.15, 'sine', 0.08), 100); },
  common: () => tone(500, 0.12, 'sine', 0.08),
  gold: () => { tone(660, 0.1, 'triangle', 0.1); setTimeout(() => tone(880, 0.1, 'triangle', 0.1), 55); },
  rainbow: () => { [440, 560, 700, 880].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.1), i * 60)); },
  unique: () => { [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'sine', 0.12), i * 70)); },
  diamond: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'sine', 0.15), i * 80)); },
  buy: () => { tone(350, 0.15, 'sine', 0.09); setTimeout(() => tone(520, 0.2, 'sine', 0.1), 110); },
  sell: () => { tone(900, 0.06, 'square', 0.04); setTimeout(() => tone(1100, 0.06, 'square', 0.04), 55); },
  badge: () => { [600, 800, 1100, 1400].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 80)); },
  lvlUp: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.18), i * 120)); },
  error: () => tone(180, 0.15, 'sawtooth', 0.07),
  notif: () => { tone(880, 0.08, 'sine', 0.05); setTimeout(() => tone(1100, 0.08, 'sine', 0.04), 110); },
  fav: () => { tone(880, 0.1, 'sine', 0.07); setTimeout(() => tone(1320, 0.1, 'sine', 0.07), 80); },
  close: () => tone(400, 0.08, 'sine', 0.05),
  spin: () => tone(600, 0.05, 'square', 0.04),
  streak: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 100)); }
};

export function cardSound(r) { (S[r] || S.common)(); }