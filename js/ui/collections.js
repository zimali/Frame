// js/ui/collections.js
import { $ } from '../utils.js';
import {
  getCollections, createCollection, deleteCollection, renameCollection,
  getCoins, L, MAX_COLLECTIONS, COLLECTION_COST, getInv
} from '../state.js';
import { S } from '../audio.js';
import { notify } from './notifications.js';
import { setActiveCollection, getActiveCollection, renderInventory } from './inventory.js';

function displayName(col) {
  return col.id === 'all' ? L().colAll : col.name;
}

function countFor(colId) {
  const inv = getInv();
  if (colId === 'all') return inv.length;
  return inv.filter(c => c.collectionId === colId).length;
}

// --- Chip row inside the Коллекция tab (quick switch) ---
export function renderCollectionChips() {
  const row = $('colChipsRow');
  if (!row) return;
  const cols = getCollections();
  const active = getActiveCollection();
  row.innerHTML = cols.map(c => `
    <button class="chip col-chip ${c.id === active ? 'on' : ''}" data-cid="${c.id}">
      <i class="fas fa-layer-group"></i> ${displayName(c)} <span class="chip-count">${countFor(c.id)}</span>
    </button>
  `).join('') + `<button class="chip col-chip-manage" id="colManageChip"><i class="fas fa-gear"></i></button>`;

  row.querySelectorAll('.col-chip').forEach(b => {
    b.addEventListener('click', () => {
      S.click();
      row.querySelectorAll('.col-chip').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      setActiveCollection(b.dataset.cid);
    });
  });
  const manageBtn = $('colManageChip');
  if (manageBtn) manageBtn.addEventListener('click', () => { S.click(); openCollectionsDrawer(); });
}

// --- Long-press drawer above the bottom nav ---
let drawerEl = null;
let longPressTimer = null;

function ensureDrawer() {
  if (drawerEl) return drawerEl;
  drawerEl = document.createElement('div');
  drawerEl.className = 'col-drawer';
  drawerEl.id = 'colDrawer';
  document.body.appendChild(drawerEl);
  drawerEl.addEventListener('click', e => { if (e.target === drawerEl) closeCollectionsDrawer(); });
  return drawerEl;
}

export function openCollectionsDrawer() {
  const d = ensureDrawer();
  renderDrawerContent();
  d.classList.add('show');
}

export function closeCollectionsDrawer() {
  if (drawerEl) drawerEl.classList.remove('show');
  const pop = $('colCreatePop');
  if (pop) pop.remove();
}

function renderDrawerContent() {
  const d = ensureDrawer();
  const cols = getCollections();
  const active = getActiveCollection();
  const extra = cols.filter(c => c.deletable).length;
  const canCreate = extra < MAX_COLLECTIONS;
  d.innerHTML = `
    <div class="col-drawer-sheet">
      <div class="col-drawer-hdr">
        <span>${L().colTitle}</span>
        <button class="mclose" id="colDrawerClose">✕</button>
      </div>
      <div class="col-drawer-list">
        ${cols.map(c => `
          <div class="col-drawer-item ${c.id === active ? 'active' : ''}" data-cid="${c.id}">
            <div class="col-drawer-item-main" data-action="select">
              <i class="fas fa-layer-group"></i>
              <span class="col-drawer-name">${displayName(c)}</span>
              <span class="chip-count">${countFor(c.id)}</span>
            </div>
            ${c.deletable ? `
              <button class="col-drawer-icon-btn" data-action="rename" title="${L().colRename}"><i class="fas fa-pen"></i></button>
              <button class="col-drawer-icon-btn danger" data-action="delete" title="${L().colDelete}"><i class="fas fa-trash"></i></button>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ${canCreate ? `
        <button class="col-create-btn" id="colCreateBtn"><i class="fas fa-plus"></i> ${L().colNew}</button>
        <div class="col-cost-hint">${L().colCost(COLLECTION_COST)}</div>
      ` : `<div class="col-cost-hint">${L().colMax}</div>`}
    </div>
  `;
  $('colDrawerClose').addEventListener('click', closeCollectionsDrawer);

  d.querySelectorAll('.col-drawer-item').forEach(item => {
    const cid = item.dataset.cid;
    item.querySelector('[data-action="select"]').addEventListener('click', () => {
      S.click();
      setActiveCollection(cid);
      closeCollectionsDrawer();
      renderCollectionChips();
    });
    const renameBtn = item.querySelector('[data-action="rename"]');
    if (renameBtn) renameBtn.addEventListener('click', e => {
      e.stopPropagation();
      startRename(item, cid);
    });
    const delBtn = item.querySelector('[data-action="delete"]');
    if (delBtn) delBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm(L().colDeleteConfirm)) return;
      deleteCollection(cid);
      if (getActiveCollection() === cid) setActiveCollection('all');
      S.sell();
      renderDrawerContent();
      renderCollectionChips();
      renderInventory($('searchInp') ? $('searchInp').value.trim() : '');
    });
  });

  const createBtn = $('colCreateBtn');
  if (createBtn) createBtn.addEventListener('click', () => openCreatePopup());
}

function startRename(item, cid) {
  const nameEl = item.querySelector('.col-drawer-name');
  const current = nameEl.textContent;
  const input = document.createElement('input');
  input.className = 'col-rename-input';
  input.value = current;
  input.maxLength = 20;
  nameEl.replaceWith(input);
  input.focus();
  input.select();
  const commit = () => {
    const v = input.value.trim();
    if (v) { renameCollection(cid, v); notify(L().colNameSaved, ''); }
    renderDrawerContent();
    renderCollectionChips();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
}

function openCreatePopup() {
  let pop = $('colCreatePop');
  if (pop) pop.remove();
  pop = document.createElement('div');
  pop.id = 'colCreatePop';
  pop.className = 'col-create-pop';
  pop.innerHTML = `
    <input type="text" class="col-create-input" id="colCreateInput" placeholder="${L().colNamePh}" maxlength="20">
    <button class="col-create-confirm" id="colCreateConfirm">${L().colCreate}</button>
  `;
  ensureDrawer().querySelector('.col-drawer-sheet').appendChild(pop);
  $('colCreateInput').focus();
  $('colCreateConfirm').addEventListener('click', () => {
    const name = $('colCreateInput').value.trim();
    const res = createCollection(name);
    if (!res.ok) {
      if (res.reason === 'coins') { S.error(); notify(L().colNoCoin, ''); }
      else { S.error(); notify(L().colMax, ''); }
      return;
    }
    S.buy();
    pop.remove();
    renderDrawerContent();
    renderCollectionChips();
  });
}

// --- Wire long-press on the "Коллекция" nav button ---
export function initCollections() {
  const navBtn = $('nInv');
  if (navBtn) {
    let firedLongPress = false;
    const start = () => {
      firedLongPress = false;
      longPressTimer = setTimeout(() => {
        firedLongPress = true;
        S.click();
        openCollectionsDrawer();
      }, 480);
    };
    const cancel = () => clearTimeout(longPressTimer);
    navBtn.addEventListener('mousedown', start);
    navBtn.addEventListener('mouseup', cancel);
    navBtn.addEventListener('mouseleave', cancel);
    navBtn.addEventListener('touchstart', start, { passive: true });
    navBtn.addEventListener('touchend', cancel);
    navBtn.addEventListener('touchmove', cancel);
    // Capture-phase click guard: if the long-press already fired, swallow the
    // trailing click so we don't also switch to the inv tab underneath the drawer.
    navBtn.addEventListener('click', e => {
      if (firedLongPress) { e.stopPropagation(); e.preventDefault(); firedLongPress = false; }
    }, true);
  }
  renderCollectionChips();
}
