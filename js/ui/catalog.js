// js/ui/catalog.js
import { $, getPosterUrl, wireCardTooltips } from '../utils.js';
import { getInv, getKnownTitles, L, getCfg } from '../state.js';
import { S } from '../audio.js';

let activeType = 'movie';

function ownedKeySet(mediaType) {
  const set = new Set();
  getInv().forEach(c => { if (c.media_type === mediaType) set.add(c.movieId); });
  return set;
}

function renderCatalogGrid() {
  const grid = $('catalogGrid');
  const known = getKnownTitles(activeType);
  const owned = ownedKeySet(activeType);
  const invByType = getInv().filter(c => c.media_type === activeType);

  $('catalogProgress').textContent = L().catalogOwned(owned.size, known.length || owned.size);

  if (!known.length) {
    grid.innerHTML = `<p class="empty" style="grid-column:1/-1">${L().catalogUnknown}</p>`;
    return;
  }

  grid.innerHTML = known.map(t => {
    const isOwned = owned.has(t.id.toString());
    if (isOwned) {
      const ownedCard = invByType.find(c => c.movieId === t.id.toString());
      const po = getPosterUrl(ownedCard || t, 12);
      return `<div class="cat-item owned" data-tip="${(t.title || '').replace(/"/g, '&quot;')}">
        <img src="${po}" alt="${t.title}" loading="lazy">
      </div>`;
    }
    return `<div class="cat-item unknown" data-tip="${L().catalogUnknown}">
      <div class="cat-silhouette"><i class="fas fa-question"></i></div>
      <span class="cat-unknown-name">${t.title}</span>
    </div>`;
  }).join('');

  wireCardTooltips(grid, getCfg().tooltips);
}

export function openCatalog() {
  renderCatalogGrid();
  $('catalogOv').classList.add('on');
}

export function closeCatalog() {
  $('catalogOv').classList.remove('on');
}

export function initCatalog() {
  $('catalogBtn').addEventListener('click', () => { S.click(); openCatalog(); });
  $('catalogClose').addEventListener('click', () => { S.close(); closeCatalog(); });
  $('catalogOv').addEventListener('click', e => { if (e.target === $('catalogOv')) closeCatalog(); });

  document.querySelectorAll('#catalogTypeTabs [data-ctype]').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      document.querySelectorAll('#catalogTypeTabs [data-ctype]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeType = btn.dataset.ctype;
      renderCatalogGrid();
    });
  });
}
