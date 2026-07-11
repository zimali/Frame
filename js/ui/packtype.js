// js/ui/packtype.js
import { $ } from '../utils.js';
import { getPackType, setPackType, L } from '../state.js';
import { S } from '../audio.js';
import { resetPack } from './pack.js';

const TYPE_ICONS = { movie: 'fa-film', tv: 'fa-tv', game: 'fa-gamepad' };

function typeLabel(t) {
  const tx = L();
  return t === 'tv' ? tx.packTv : t === 'game' ? tx.packGame : tx.packMovie;
}

export function updatePackTypeIndicator() {
  const el = $('packTypeIndicator');
  if (!el) return;
  const t = getPackType();
  el.innerHTML = `<i class="fas ${TYPE_ICONS[t]}"></i> ${typeLabel(t)}`;
}

let pop = null;

function closePicker() {
  if (pop) { pop.remove(); pop = null; }
  document.removeEventListener('click', outsideClickHandler, true);
}

function outsideClickHandler(e) {
  if (pop && !pop.contains(e.target)) closePicker();
}

function openPicker() {
  closePicker();
  pop = document.createElement('div');
  pop.id = 'packTypePop';
  pop.className = 'col-picker-pop pack-type-pop show';
  const current = getPackType();
  pop.innerHTML = `
    <div class="col-picker-hdr">${L().packPickTitle}</div>
    ${['movie', 'tv', 'game'].map(t => `
      <button class="col-picker-item${t === current ? ' active' : ''}" data-type="${t}">
        <i class="fas ${TYPE_ICONS[t]}"></i> ${typeLabel(t)}
      </button>
    `).join('')}
  `;
  ($('app') || document.body).appendChild(pop);
  pop.querySelectorAll('.col-picker-item').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      setPackType(btn.dataset.type);
      updatePackTypeIndicator();
      resetPack();
      closePicker();
    });
  });
  setTimeout(() => document.addEventListener('click', outsideClickHandler, true), 10);
}

let longPressTimer = null;

export function initPackTypePicker() {
  const navBtn = $('nOpen');
  updatePackTypeIndicator();
  if (!navBtn) return;
  const start = () => { longPressTimer = setTimeout(() => { S.click(); openPicker(); }, 480); };
  const cancel = () => clearTimeout(longPressTimer);
  navBtn.addEventListener('mousedown', start);
  navBtn.addEventListener('mouseup', cancel);
  navBtn.addEventListener('mouseleave', cancel);
  navBtn.addEventListener('touchstart', start, { passive: true });
  navBtn.addEventListener('touchend', cancel);
  navBtn.addEventListener('touchmove', cancel);
}
