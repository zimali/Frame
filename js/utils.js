// js/utils.js
import { RARS, RAR_COLOR, TMDB_IMG } from './config.js';
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

export function cardHTML(card) {
  const t = card.title || '—';
  const po = card.poster_path
    ? TMDB_IMG + card.poster_path
    : `https://via.placeholder.com/200x300/1a1a1a/fff?text=${encodeURIComponent(t.substring(0, 12))}`;
  const rar = card.rarity || 'common';
  return `<div class="cw rarity-${rar}"><div class="ci"><img src="${po}" alt="${t}" loading="lazy"><div class="ct">${t}</div><div class="rl">${L().rn[rar] || rar}</div></div></div>`;
}

export function setBodyRar(r) {
  document.body.className = document.body.className.replace(/rb-\w+/g, '').trim();
  if (r && r !== 'common') document.body.classList.add('rb-' + r);
}

export function applyBgHue(h) {
  document.documentElement.style.setProperty('--bg-hue', h);
}

export function $(id) { return document.getElementById(id); }

export function highlightText(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
}
