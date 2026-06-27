// js/ui/inventory.js
import { $, cardHTML, highlightText } from '../utils.js';
import { getInv, L } from '../state.js';
import { showPreview } from './preview.js';
import { S } from '../audio.js';
import { getCfg } from '../state.js';

let sortMode = 'new';
let rarFilter = 'all';
let sugTimeout = null;

export function renderInventory(query = '') {
  const inv = getInv();
  let filtered = query ? inv.filter(c => c.title.toLowerCase().includes(query.toLowerCase())) : inv.slice();
  if (rarFilter === 'favorite') filtered = filtered.filter(c => c.favorite);
  else if (rarFilter !== 'all') filtered = filtered.filter(c => c.rarity === rarFilter);
  if (sortMode === 'az') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortMode === 'za') filtered.sort((a, b) => b.title.localeCompare(a.title));
  else filtered.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

  const grid = $('invGrid');
  const empty = $('emptyMsg');
  empty.textContent = L().noCards;
  if (!filtered.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  grid.innerHTML = filtered.map(c => cardHTML(c)).join('');
  grid.querySelectorAll('.cw').forEach((el, idx) => {
    const card = filtered[idx];
    if (!card) return;
    el.dataset.id = card.id;
    el.addEventListener('click', () => { S.click(); showPreview(card); });
    const cfg = getCfg();
    if (cfg.anim) {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(450px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg) translateY(-2px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    }
  });
}

function showSuggestions(query) {
  const sug = $('searchSuggestions');
  const inv = getInv();
  let matches = inv.filter(c => c.title.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  if (!matches.length) { hideSuggestions(); return; }
  const seen = new Set();
  matches = matches.filter(c => { if (seen.has(c.title)) return false; seen.add(c.title); return true; });
  const rarColor = { common: '#aaa', gold: '#fbbf24', rainbow: '#f87171', unique: '#ff4444', diamond: '#60a5fa' };
  sug.innerHTML = matches.map(c => `
    <div class="sug-item" data-title="${c.title.replace(/"/g, '&quot;')}">
      <i class="fas fa-film"></i>
      <span>${highlightText(c.title, query)}</span>
      <span class="sug-rar" style="color:${rarColor[c.rarity] || '#aaa'}">${L().rn[c.rarity] || c.rarity}</span>
    </div>
  `).join('');
  sug.classList.add('show');
  sug.querySelectorAll('.sug-item').forEach(el => {
    el.addEventListener('mousedown', e => e.preventDefault());
    el.addEventListener('click', () => {
      const t = el.dataset.title;
      $('searchInp').value = t;
      renderInventory(t);
      hideSuggestions();
    });
  });
}

function hideSuggestions() { $('searchSuggestions').classList.remove('show'); }

export function initInventory() {
  const search = $('searchInp');
  search.addEventListener('input', function () {
    const q = this.value.trim();
    clearTimeout(sugTimeout);
    renderInventory(q);
    if (!q) { hideSuggestions(); return; }
    sugTimeout = setTimeout(() => showSuggestions(q), 120);
  });
  search.addEventListener('focus', function () {
    if (this.value.trim()) showSuggestions(this.value.trim());
  });
  search.addEventListener('blur', () => setTimeout(hideSuggestions, 180));

  document.querySelectorAll('[data-sort]').forEach(b => {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-sort]').forEach(x => x.classList.remove('on'));
      this.classList.add('on');
      sortMode = this.dataset.sort;
      S.click();
      renderInventory($('searchInp').value.trim());
    });
  });

  document.querySelectorAll('[data-rar]').forEach(b => {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-rar]').forEach(x => x.classList.remove('on'));
      this.classList.add('on');
      rarFilter = this.dataset.rar;
      S.click();
      renderInventory($('searchInp').value.trim());
    });
  });

  renderInventory();
}

export function getSortMode() { return sortMode; }
export function getRarFilter() { return rarFilter; }
