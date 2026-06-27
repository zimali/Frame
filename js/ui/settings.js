// js/ui/settings.js
import { $, applyBgHue } from '../utils.js';
import { getCfg, updateCfg, saveAll, getPlayerName, setPlayerName, L, resetAll } from '../state.js';
import { initAudio, resumeAudio, startMusic, stopMusic, updateMusicVol, S } from '../audio.js';
import { openTutorial } from './tutorial.js';
import { updatePlayerNameUI } from './name.js';

const SWATCH_HUES = [
  { h: 0, bg: 'hsl(0,0%,8%)', label: 'Нейтральный' },
  { h: 220, bg: 'hsl(220,35%,9%)', label: 'Синий' },
  { h: 280, bg: 'hsl(280,30%,8%)', label: 'Фиолетовый' },
  { h: 160, bg: 'hsl(160,30%,8%)', label: 'Зелёный' },
  { h: 30, bg: 'hsl(30,45%,8%)', label: 'Янтарный' },
  { h: 350, bg: 'hsl(350,35%,8%)', label: 'Красный' }
];

function buildSwatches() {
  const c = $('swatches');
  const cfg = getCfg();
  c.innerHTML = '';
  SWATCH_HUES.forEach(s => {
    const el = document.createElement('div');
    el.className = 'sw' + (s.h === cfg.bgHue ? ' on' : '');
    el.style.background = s.bg;
    el.dataset.h = s.h;
    el.title = s.label;
    el.addEventListener('click', () => {
      document.querySelectorAll('.sw').forEach(x => x.classList.remove('on'));
      el.classList.add('on');
      updateCfg({ bgHue: s.h });
      applyBgHue(s.h);
      S.click();
    });
    c.appendChild(el);
  });
}

function buildLangBtns() {
  const c = $('langRow');
  const cfg = getCfg();
  c.innerHTML = '';
  const langs = { ru: 'RU', en: 'EN', es: 'ES', de: 'DE', fr: 'FR', tr: 'TR', ja: 'JA', zh: 'ZH', ar: 'AR', pt: 'PT' };
  Object.keys(langs).forEach(k => {
    const b = document.createElement('button');
    b.className = 'l-btn' + (k === cfg.lang ? ' on' : '');
    b.textContent = langs[k];
    b.dataset.lang = k;
    b.addEventListener('click', () => {
      updateCfg({ lang: k });
      document.querySelectorAll('.l-btn').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      S.click();
      // Re-apply i18n is handled by main
    });
    c.appendChild(b);
  });
}

export function openSettings() {
  const cfg = getCfg();
  buildSwatches();
  buildLangBtns();
  $('sfxVol').value = cfg.sfxVol;
  $('musicVol').value = cfg.musicVol;
  $('musicOn').checked = cfg.musicOn;
  $('animOn').checked = cfg.anim;
  $('fwOn').checked = cfg.fw;
  $('settNameInput').value = getPlayerName();
  $('settModal').classList.add('on');
}

export function initSettings() {
  // Name save on change
  $('settNameInput').addEventListener('change', function () {
    const n = this.value.trim();
    if (n) { setPlayerName(n); updatePlayerNameUI(); saveAll(); }
  });

  $('sClose').addEventListener('click', closeSettings);
  $('settModal').addEventListener('click', e => {
    if (e.target === $('settModal')) closeSettings();
  });

  $('sfxVol').addEventListener('input', function () {
    updateCfg({ sfxVol: parseFloat(this.value) });
  });

  $('musicVol').addEventListener('input', function () {
    updateCfg({ musicVol: parseFloat(this.value) });
    updateMusicVol();
  });

  $('musicOn').addEventListener('change', function () {
    updateCfg({ musicOn: this.checked });
    if (this.checked) {
      initAudio();
      resumeAudio();
      startMusic('main');
    } else {
      stopMusic();
    }
  });

  $('animOn').addEventListener('change', function () {
    updateCfg({ anim: this.checked });
  });

  $('fwOn').addEventListener('change', function () {
    updateCfg({ fw: this.checked });
  });

  $('resetBtn').addEventListener('click', () => {
    if (confirm('Сбросить весь прогресс? Необратимо!')) {
      resetAll();
    }
  });

  $('reTutBtn').addEventListener('click', () => {
    $('settModal').classList.remove('on');
    openTutorial();
  });
}

function closeSettings() {
  const n = $('settNameInput').value.trim();
  if (n && n !== getPlayerName()) { setPlayerName(n); updatePlayerNameUI(); saveAll(); }
  $('settModal').classList.remove('on');
}
