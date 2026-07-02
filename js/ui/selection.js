// js/ui/selection.js
import { $ } from '../utils.js';
import { getInv, setInv, L, getCollections, moveCardsToCollection, addCoins, incStat } from '../state.js';
import { SELL_V } from '../config.js';
import { S } from '../audio.js';
import { notify } from './notifications.js';
import { renderInventory } from './inventory.js';
import { checkQuests, checkBadges } from '../game.js';

let active = false;
let selected = new Set();
let onChangeCb = null;

export function isSelectMode() { return active; }
export function getSelected() { return selected; }

export function setSelectMode(on) {
  active = on;
  if (!on) selected.clear();
  renderSelectBar();
  if (onChangeCb) onChangeCb();
}

export function toggleSelectMode() {
  setSelectMode(!active);
  S.click();
}

export function toggleCardSelected(id) {
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  renderSelectBar();
}

export function clearSelection() {
  selected.clear();
  renderSelectBar();
}

export function onSelectionChange(cb) { onChangeCb = cb; }

function ensureBarEl() {
  let bar = $('selectBar');
  if (bar) return bar;
  bar = document.createElement('div');
  bar.id = 'selectBar';
  bar.className = 'select-bar';
  ($('app') || document.body).appendChild(bar);
  return bar;
}

export function renderSelectBar() {
  const bar = ensureBarEl();
  if (!active) { bar.classList.remove('show'); return; }
  bar.classList.add('show');
  const n = selected.size;
  bar.innerHTML = `
    <span class="select-count">${L().selected(n)}</span>
    <div class="select-actions">
      <button class="sel-act-btn" id="selFavBtn" ${n ? '' : 'disabled'} title="${L().addToFav}"><i class="fas fa-heart"></i></button>
      <button class="sel-act-btn" id="selColBtn" ${n ? '' : 'disabled'} title="${L().addToCol}"><i class="fas fa-layer-group"></i></button>
      <button class="sel-act-btn danger" id="selSellBtn" ${n ? '' : 'disabled'} title="${L().sellSel}"><i class="fas fa-coins"></i></button>
      <button class="sel-act-btn" id="selCancelBtn" title="${L().cancelSel}"><i class="fas fa-xmark"></i></button>
    </div>`;
  $('selFavBtn').onclick = favoriteSelected;
  $('selColBtn').onclick = openCollectionPicker;
  $('selSellBtn').onclick = sellSelected;
  $('selCancelBtn').onclick = () => setSelectMode(false);
}

function favoriteSelected() {
  if (!selected.size) return;
  const inv = getInv();
  // If everything currently selected is already favorite, unfavorite; else favorite all
  const all = inv.filter(c => selected.has(c.id));
  const allFav = all.length && all.every(c => c.favorite);
  inv.forEach(c => { if (selected.has(c.id)) c.favorite = !allFav; });
  setInv(inv);
  S.fav();
  notify(allFav ? L().removeFromFav : L().addToFav, 'badge');
  renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
  checkQuests();
  checkBadges();
  setSelectMode(false);
}

function sellSelected() {
  if (!selected.size) return;
  const inv = getInv();
  const toSell = inv.filter(c => selected.has(c.id));
  const total = toSell.reduce((sum, c) => sum + (SELL_V[c.rarity] || 0), 0);
  if (!confirm(L().sellSelConfirm(toSell.length, total))) return;
  addCoins(total);
  incStat('sells', toSell.length);
  const remaining = inv.filter(c => !selected.has(c.id));
  setInv(remaining);
  S.sell();
  notify(L().sellSelDone(total), 'badge');
  renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
  checkQuests();
  checkBadges();
  setSelectMode(false);
}

function openCollectionPicker() {
  if (!selected.size) return;
  const cols = getCollections();
  const colLabel = c => c.id === 'all' ? L().colAll : c.name;
  let pop = $('colPickerPop');
  if (pop) pop.remove();
  pop = document.createElement('div');
  pop.id = 'colPickerPop';
  pop.className = 'col-picker-pop';
  pop.innerHTML = `
    <div class="col-picker-hdr">${L().colChoose}</div>
    ${cols.map(c => `<button class="col-picker-item" data-cid="${c.id}"><i class="fas fa-layer-group"></i> ${colLabel(c)}</button>`).join('')}
  `;
  ($('app') || document.body).appendChild(pop);
  pop.classList.add('show');
  pop.querySelectorAll('.col-picker-item').forEach(btn => {
    btn.addEventListener('click', () => {
      moveCardsToCollection([...selected], btn.dataset.cid);
      S.click();
      const target = cols.find(c => c.id === btn.dataset.cid);
      notify(L().colMovedTo(target ? colLabel(target) : ''), 'badge');
      pop.remove();
      renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
      setSelectMode(false);
    });
  });
  const closeOutside = e => {
    if (!pop.contains(e.target) && e.target.id !== 'selColBtn') {
      pop.remove();
      document.removeEventListener('click', closeOutside, true);
    }
  };
  setTimeout(() => document.addEventListener('click', closeOutside, true), 10);
}
