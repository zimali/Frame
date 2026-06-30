// js/ui/settings.js
import { $, applyBgHue } from '../utils.js';
import { getCfg, updateCfg, saveAll, getPlayerName, setPlayerName, L, resetAll } from '../state.js';
import { initAudio, resumeAudio, startMusic, stopMusic, updateMusicVol, S } from '../audio.js';
import { openTutorial } from './tutorial.js';
import { updatePlayerNameUI } from './name.js';
import { renderInventory } from './inventory.js';

const SWATCH_HUES = [
  { h: 160, key: 'green' },
  { h: 220, key: 'blue' },
  { h: 280, key: 'purple' },
  { h: 30, key: 'amber' },
  { h: 350, key: 'red' },
  { h: 0, key: 'neutral' }
];

const SWATCH_LABELS = {
  ru: { green: 'Зелёный', blue: 'Синий', purple: 'Фиолетовый', amber: 'Янтарный', red: 'Красный', neutral: 'Нейтральный' },
  en: { green: 'Green', blue: 'Blue', purple: 'Purple', amber: 'Amber', red: 'Red', neutral: 'Neutral' },
  es: { green: 'Verde', blue: 'Azul', purple: 'Morado', amber: 'Ámbar', red: 'Rojo', neutral: 'Neutro' },
  de: { green: 'Grün', blue: 'Blau', purple: 'Violett', amber: 'Bernstein', red: 'Rot', neutral: 'Neutral' },
  fr: { green: 'Vert', blue: 'Bleu', purple: 'Violet', amber: 'Ambre', red: 'Rouge', neutral: 'Neutre' },
  tr: { green: 'Yeşil', blue: 'Mavi', purple: 'Mor', amber: 'Amber', red: 'Kırmızı', neutral: 'Nötr' },
  ja: { green: 'グリーン', blue: 'ブルー', purple: 'パープル', amber: 'アンバー', red: 'レッド', neutral: 'ニュートラル' },
  zh: { green: '绿色', blue: '蓝色', purple: '紫色', amber: '琥珀色', red: '红色', neutral: '中性' },
  ar: { green: 'أخضر', blue: 'أزرق', purple: 'بنفسجي', amber: 'كهرماني', red: 'أحمر', neutral: 'محايد' },
  pt: { green: 'Verde', blue: 'Azul', purple: 'Roxo', amber: 'Âmbar', red: 'Vermelho', neutral: 'Neutro' }
};

const LANG_META = {
  ru: { label: 'Русский', flag: '🇷🇺' }, en: { label: 'English', flag: '🇬🇧' },
  es: { label: 'Español', flag: '🇪🇸' }, de: { label: 'Deutsch', flag: '🇩🇪' },
  fr: { label: 'Français', flag: '🇫🇷' }, tr: { label: 'Türkçe', flag: '🇹🇷' },
  ja: { label: '日本語', flag: '🇯🇵' }, zh: { label: '中文', flag: '🇨🇳' },
  ar: { label: 'العربية', flag: '🇸🇦' }, pt: { label: 'Português', flag: '🇵🇹' }
};

function buildSwatches() {
  const c = $('swatches');
  const cfg = getCfg();
  const labels = SWATCH_LABELS[cfg.lang] || SWATCH_LABELS.ru;
  c.innerHTML = '';
  SWATCH_HUES.forEach(s => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'sw' + (s.h === cfg.bgHue ? ' on' : '');
    el.style.background = `hsl(${s.h},35%,18%)`;
    el.dataset.h = s.h;
    el.title = labels[s.key];
    el.setAttribute('aria-label', labels[s.key]);
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
  Object.keys(LANG_META).forEach(k => {
    const meta = LANG_META[k];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'l-btn' + (k === cfg.lang ? ' on' : '');
    b.innerHTML = `<span class="l-flag">${meta.flag}</span> ${meta.label}`;
    b.dataset.lang = k;
    b.addEventListener('click', () => {
      if (getCfg().lang === k) return;
      updateCfg({ lang: k });
      S.click();
      buildLangBtns();
      buildSwatches();
      if (window.applyI18n) window.applyI18n();
      renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
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
  $('tooltipsOn').checked = cfg.tooltips;
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
    if (parseFloat(this.value) > 0) {
      const cfg = getCfg();
      if (cfg.musicOn) { initAudio(); resumeAudio(); startMusic('main'); }
    }
  });

  $('tooltipsOn').addEventListener('change', function () {
    updateCfg({ tooltips: this.checked });
    renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
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
