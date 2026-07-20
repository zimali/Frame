// js/ui/catalog.js
import { $, posterImgHTML, wireCardTooltips } from '../utils.js';
import { getInv, L, getCfg } from '../state.js';
import { S } from '../audio.js';
import { showPreview } from './preview.js';
import { searchTitles } from '../api.js';

let activeType = 'movie';
let activeRarity = 'all';
let searchSeq = 0; // guards against out-of-order async responses overwriting newer results

function findOwnedMatches(query) {
  const q = query.trim().toLowerCase();
  return getInv().filter(c =>
    c.media_type === activeType &&
    (!q || c.title.toLowerCase().includes(q)) &&
    (activeRarity === 'all' || c.rarity === activeRarity)
  );
}

function renderGrid(owned, live) {
  const grid = $('catalogGrid');
  const empty = $('catalogEmpty');

  if (!owned.length && !live.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const ownedIds = new Set(owned.map(c => c.movieId));
  const liveFiltered = live.filter(t => !ownedIds.has(t.id.toString()));

  const ownedHtml = owned.map(c => `
    <div class="cat-item owned" data-id="${c.id}" data-tip="${c.title.replace(/"/g, '&quot;')}">
      ${posterImgHTML(c)}
      <div class="cat-rar-dot rarity-${c.rarity}"></div>
    </div>`).join('');
  const liveHtml = liveFiltered.map(t => `
    <div class="cat-item unknown-hit" data-known-id="${t.id}" data-tip="${L().catalogUnowned}">
      ${posterImgHTML(t)}
      <div class="cat-unowned-tag">${L().catalogUnowned}</div>
    </div>`).join('');

  grid.innerHTML = ownedHtml + liveHtml;
  wireCardTooltips(grid, getCfg().tooltips);

  grid.querySelectorAll('.cat-item.owned').forEach(el => {
    el.addEventListener('click', () => {
      const card = getInv().find(c => c.id === el.dataset.id);
      if (card) { S.click(); showPreview(card, { viewOnly: true }); }
    });
  });
  grid.querySelectorAll('.cat-item.unknown-hit').forEach(el => {
    el.addEventListener('click', () => {
      const t = liveFiltered.find(x => x.id.toString() === el.dataset.knownId);
      if (!t) return;
      S.click();
      showPreview({ title: t.title, poster_path: t.poster_path, media_type: activeType, movieId: t.id.toString(), rarity: null }, { viewOnly: true });
    });
  });
}

async function renderResults() {
  const query = $('catalogSearch').value;
  const hasQuery = !!query.trim();

  // Nothing typed and no rarity filter picked — this is the true empty state,
  // show the hint and nothing else (the whole point of the redesign).
  if (!hasQuery && activeRarity === 'all') {
    $('catalogSpinner').classList.remove('show');
    $('catalogEmpty').textContent = L().catalogHint;
    renderGrid([], []);
    return;
  }

  const owned = findOwnedMatches(query);

  if (activeRarity !== 'all') {
    // Rarity is a property of an owned card, not a bare title — no point live-searching.
    $('catalogSpinner').classList.remove('show');
    $('catalogEmpty').textContent = L().catalogNoMatch;
    renderGrid(owned, []);
    return;
  }

  const seq = ++searchSeq;
  $('catalogSpinner').classList.add('show');
  const live = await searchTitles(query, activeType);
  if (seq !== searchSeq) return; // a newer keystroke already superseded this request
  $('catalogSpinner').classList.remove('show');
  $('catalogEmpty').textContent = L().catalogNoMatch;
  renderGrid(owned, live);
}

let debounceTimer = null;
function onSearchInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(renderResults, 350);
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
  $('catalogSearch').addEventListener('input', onSearchInput);

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
