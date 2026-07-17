// js/utils.js
import { RARS, RAR_COLOR, RAR_ICON, TMDB_IMG, dicebearUrl } from './config.js';
import { L } from './state.js';

export function rndRar(weights) {
  const r = Math.random() * 100;
  let cum = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r < cum) return RARS[i];
  }
  return RARS[0];
}

export function getPosterUrl(card, fallbackSize = 12) {
  if (!card.poster_path) {
    const t = card.title || '—';
    return `https://via.placeholder.com/200x300/1a1a1a/fff?text=${encodeURIComponent(t.substring(0, fallbackSize))}`;
  }
  return TMDB_IMG + card.poster_path;
}

export function posterImgHTML(card, extraClass = '') {
  const po = getPosterUrl(card, 12);
  const t = (card.title || '—').replace(/"/g, '&quot;');
  return `<img class="${extraClass}" src="${po}" alt="${t}" loading="lazy">`;
}

export function cardHTML(card, opts = {}) {
  const t = card.title || '—';
  const rar = card.rarity || 'common';
  const idTxt = card.serial ? '#' + String(card.serial).padStart(6, '0') : '';
  const tip = `${t} · ${L().rn[rar] || rar}${idTxt ? ' · ' + idTxt : ''}`;
  const selMode = opts.selectMode ? ' select-mode' : '';
  const selOn = opts.selected ? ' selected' : '';
  const fav = card.favorite ? '<i class="fas fa-heart card-fav-badge"></i>' : '';
  const rarIcon = RAR_ICON[rar] ? `<div class="rar-badge rar-badge-${rar}"><i class="fas ${RAR_ICON[rar]}"></i></div>` : '';
  return `<div class="cw rarity-${rar}${selMode}${selOn}" data-tip="${tip.replace(/"/g, '&quot;')}">
    <div class="ci">${posterImgHTML(card)}${fav}${rarIcon}</div>
    <div class="card-select-dot"><i class="fas fa-check"></i></div>
  </div>`;
}

export function setBodyRar(r) {
  document.body.className = document.body.className.replace(/rb-\w+/g, '').trim();
  if (r && r !== 'common') document.body.classList.add('rb-' + r);
}

export function applyBgHue(h) {
  document.documentElement.style.setProperty('--bg-hue', h);
}

export function $(id) { return document.getElementById(id); }

export function avatarImgHTML(styleSeed, extraClass = '') {
  if (!styleSeed) return `<i class="fas fa-user"></i>`;
  return `<img class="avatar-img ${extraClass}" src="${dicebearUrl(styleSeed.style, styleSeed.seed)}" alt="avatar" loading="lazy">`;
}

export function highlightText(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
}

// --- Shared hover tooltip for card covers ---
let tipEl = null;
function ensureTipEl() {
  if (tipEl) return tipEl;
  tipEl = document.createElement('div');
  tipEl.className = 'card-tip';
  document.body.appendChild(tipEl);
  return tipEl;
}

export function showCardTip(target, text) {
  const el = ensureTipEl();
  el.textContent = text;
  el.classList.add('show');
  positionCardTip(target);
}

export function positionCardTip(target) {
  if (!tipEl || !tipEl.classList.contains('show')) return;
  const r = target.getBoundingClientRect();
  const tipW = tipEl.offsetWidth || 160;
  let left = r.left + r.width / 2 - tipW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));
  let top = r.top - tipEl.offsetHeight - 10;
  if (top < 4) top = r.bottom + 8;
  tipEl.style.left = left + 'px';
  tipEl.style.top = top + 'px';
}

export function hideCardTip() {
  if (tipEl) tipEl.classList.remove('show');
}

// Attach hover/touch tooltip behaviour to a freshly-rendered grid of `.cw` cards.
// Respects the tooltips setting; no-ops (and just removes any stray tip) when disabled.
export function wireCardTooltips(container, enabled) {
  if (!container) return;
  if (!enabled) { hideCardTip(); return; }
  container.querySelectorAll('.cw').forEach(el => {
    const text = el.dataset.tip;
    if (!text) return;
    el.addEventListener('mouseenter', () => showCardTip(el, text));
    el.addEventListener('mousemove', () => positionCardTip(el));
    el.addEventListener('mouseleave', hideCardTip);
  });
}
