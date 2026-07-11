// js/ui/catalog.js
import { $, posterImgHTML, wireCardTooltips } from '../utils.js';
import { getInv, getKnownTitles, L, getCfg } from '../state.js';
import { S } from '../audio.js';
import { showPreview } from './preview.js';

let activeType = 'movie';
let activeRarity = 'all';

function findOwnedMatches(query) {
  const q = query.trim().toLowerCase();
  return getInv().filter(c =>
    c.media_type === activeType &&
    (!q || c.title.toLowerCase().includes(q)) &&
    (activeRarity === 'all' || c.rarity === activeRarity)
  );
}

function findUnknownMatches(query, ownedIds) {
  if (activeRarity !== 'all') return []; // rarity is a property of an owned card, not a bare title
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getKnownTitles(activeType).filter(t =>
    !ownedIds.has(t.id.toString()) && t.title.toLowerCase().includes(q)
  );
}

function renderResults() {
  const grid = $('catalogGrid');
  const empty = $('catalogEmpty');
  const query = $('catalogSearch').value;

  const owned = findOwnedMatches(query);
  const ownedIds = new Set(owned.map(c => c.movieId));
  const unknown = query.trim() ? findUnknownMatches(query, ownedIds) : [];

  if (!query.trim() && activeRarity === 'all') {
    grid.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = L().catalogHint;
    return;
  }
  if (!owned.length && !unknown.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    empty.textContent = L().catalogNoMatch;
    return;
  }
  empty.style.display = 'none';

  const ownedHtml = owned.map(c => `
    <div class="cat-item owned" data-id="${c.id}" data-tip="${c.title.replace(/"/g, '&quot;')}">
      ${posterImgHTML(c)}
      <div class="cat-rar-dot rarity-${c.rarity}"></div>
    </div>`).join('');
  const unknownHtml = unknown.map(t => `
    <div class="cat-item unknown-hit" data-known-id="${t.id}" data-tip="${L().catalogUnowned}">
      ${posterImgHTML(t)}
      <div class="cat-unowned-tag">${L().catalogUnowned}</div>
    </div>`).join('');

  grid.innerHTML = ownedHtml + unknownHtml;
  wireCardTooltips(grid, getCfg().tooltips);

  grid.querySelectorAll('.cat-item.owned').forEach(el => {
    el.addEventListener('click', () => {
      const card = getInv().find(c => c.id === el.dataset.id);
      if (card) { S.click(); showPreview(card, { viewOnly: true }); }
    });
  });
  grid.querySelectorAll('.cat-item.unknown-hit').forEach(el => {
    el.addEventListener('click', () => {
      const t = getKnownTitles(activeType).find(x => x.id.toString() === el.dataset.knownId);
      if (!t) return;
      S.click();
      showPreview({ title: t.title, poster_path: t.poster_path, media_type: activeType, movieId: t.id.toString(), rarity: null }, { viewOnly: true });
    });
  });
}

export function openCatalog() {
  $('catalogSearch').value = '';
  activeRarity = 'all';
  document.querySelectorAll('#catalogRarityChips [data-crar]').forEach(b => b.classList.toggle('on', b.dataset.crar === 'all'));
  renderResults();
  $('catalogOv').classList.add('on');
  setTimeout(() => $('catalogSearch').focus(), 200);
}

export function closeCatalog() {
  $('catalogOv').classList.remove('on');
}

export function initCatalog() {
  $('catalogBtn').addEventListener('click', () => { S.click(); openCatalog(); });
  $('catalogClose').addEventListener('click', () => { S.close(); closeCatalog(); });
  $('catalogOv').addEventListener('click', e => { if (e.target === $('catalogOv')) closeCatalog(); });
  $('catalogSearch').addEventListener('input', renderResults);

  document.querySelectorAll('#catalogTypeTabs [data-ctype]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      document.querySelectorAll('#catalogTypeTabs [data-ctype]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeType = btn.dataset.ctype;
      renderResults();
    });
  });

  document.querySelectorAll('#catalogRarityChips [data-crar]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      document.querySelectorAll('#catalogRarityChips [data-crar]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeRarity = btn.dataset.crar;
      renderResults();
    });
  });
}
