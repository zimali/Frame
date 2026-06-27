// js/ui/shop.js
import { $ } from '../utils.js';
import { LOT_W, XP_R } from '../config.js';
import { getLots, setLots, getCoins, setCoins, getShopT, setShopT, pushInv, incStat, saveAll, L, hasCard } from '../state.js';
import { addXP } from '../game.js';
import { S, cardSound } from '../audio.js';
import { getCandidates } from '../api.js';
import { renderInventory } from './inventory.js';
import { checkBadges } from '../game.js';
import { notify, confetti, fireworks } from './notifications.js';

let shopInterval = null;

export function generateLots() {
  const now = Date.now();
  setShopT(now + 4 * 3600 * 1000);
  const newLots = [];
  const fr = Math.random();
  const fRar = fr < 0.05 ? 'unique' : fr < 0.2 ? 'rainbow' : 'gold';
  newLots.push({ cards: [{ rarity: fRar }], price: 0, disc: 0, id: 'free_' + Date.now(), free: true });
  const n = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const cc = 1 + Math.floor(Math.random() * 4);
    const cards = [];
    let base = 0;
    for (let j = 0; j < cc; j++) {
      const r = rndRar(LOT_W);
      cards.push({ rarity: r });
      base += { common: 10, gold: 50, rainbow: 250, unique: 500 }[r] || 10;
    }
    const disc = Math.random() < 0.35 ? Math.floor(Math.random() * 46) + 5 : 0;
    newLots.push({ cards, price: Math.floor(base * (1 - disc / 100)), disc, id: Date.now().toString() + Math.random() });
  }
  setLots(newLots);
  saveAll();
  renderShop();
}

function rndRar(weights) {
  const r = Math.random() * 100;
  let cum = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r < cum) return ['common', 'gold', 'rainbow', 'unique', 'diamond'][i];
  }
  return 'common';
}

export function renderShop() {
  const c = $('shopLots');
  if (!c) return;
  const lots = getLots();
  const coins = getCoins();
  const rCol = { common: '#aaa', gold: '#fbbf24', rainbow: '#f87171', unique: '#ff4444', diamond: '#60a5fa' };
  c.innerHTML = lots.map(lot => {
    const cr = lot.cards.map(lc =>
      `<div class="lot-mc" style="border-color:${rCol[lc.rarity] || '#2a2a2a'};color:${rCol[lc.rarity] || '#aaa'}">${L().rn[lc.rarity] || lc.rarity}</div>`
    ).join('');
    const ok = lot.free || coins >= lot.price;
    return `<div class="lot ${lot.free ? 'free' : ''}">
      <div class="lot-ttl">${L().lotOf} · ${lot.cards.length} ${L().cards} ${lot.free ? '🎁' : ''}</div>
      <div class="lot-cards">${cr}</div>
      <div class="lot-foot">
        <div style="display:flex;align-items:center;gap:6px">
          <span class="lot-price">${lot.free ? L().free : lot.price + ' ' + L().coins}</span>
          ${lot.disc > 0 ? `<span class="lot-disc">-${lot.disc}%</span>` : ''}
        </div>
        <button class="buy-btn" ${ok ? '' : 'disabled'} data-lid="${lot.id}">${L().buy}</button>
      </div>
    </div>`;
  }).join('');
  c.querySelectorAll('.buy-btn').forEach(b => b.addEventListener('click', function () {
    const lot = getLots().find(l => l.id === this.dataset.lid);
    if (lot) buyLot(lot);
  }));
  updateShopUI();
}

export async function buyLot(lot) {
  const coins = getCoins();
  if (!lot.free && coins < lot.price) { S.error(); notify(L().noCoin, ''); return; }
  if (!lot.free) setCoins(coins - lot.price);
  incStat('buys');
  S.buy();
  const newCards = [];
  for (const lc of lot.cards) {
    let movie = null;
    let att = 0;
    while (!movie && att < 5) {
      const cand = await getCandidates();
      if (!cand.length) break;
      for (const item of cand.sort(() => Math.random() - 0.5)) {
        if (!hasCard(item.id.toString(), lc.rarity)) { movie = item; break; }
      }
      att++;
    }
    if (movie) {
      const card = {
        id: Date.now().toString() + Math.random(),
        movieId: movie.id.toString(),
        title: movie.title || movie.name || '—',
        poster_path: movie.poster_path,
        media_type: movie.media_type,
        rarity: lc.rarity,
        addedAt: Date.now(),
        origin: 'shop',
        favorite: false
      };
      pushInv(card);
      addXP(XP_R[lc.rarity], card);
      newCards.push(card);
      if (lc.rarity === 'diamond') fireworks(8);
    }
  }
  const lots = getLots().filter(l => l.id !== lot.id);
  setLots(lots);
  saveAll();
  renderInventory();
  renderShop();
  updateShopUI();
  if (newCards.length) showPurchaseOverlay(newCards);
  checkBadges();
}

function showPurchaseOverlay(cards) {
  const ov = $('purOv');
  const cont = $('purCards');
  $('purTitle').textContent = L().newCards;
  $('purOk').textContent = L().ok;
  cont.innerHTML = '';
  ov.classList.add('on');
  confetti();
  cards.forEach((c, i) => {
    const el = document.createElement('div');
    el.className = 'pur-card';
    el.innerHTML = cardHTML(c);
    cont.appendChild(el);
    setTimeout(() => el.classList.add('show'), (i + 1) * 180 + 60);
    if (c.rarity === 'diamond') setTimeout(() => fireworks(4), (i + 1) * 180 + 250);
  });
}

function cardHTML(card) {
  const t = card.title || '—';
  const po = card.poster_path ?
    `https://image.tmdb.org/t/p/w500${card.poster_path}` :
    `https://via.placeholder.com/200x300/1a1a1a/fff?text=${encodeURIComponent(t.substring(0, 12))}`;
  const rar = card.rarity || 'common';
  return `<div class="cw rarity-${rar}"><div class="ci"><img src="${po}" alt="${t}" loading="lazy"><div class="ct">${t}</div><div class="rl">${L().rn[rar] || rar}</div></div></div>`;
}

export function updateShopUI() {
  $('shopBal').textContent = getCoins();
  $('shopCoinWrd').textContent = L().coins;
  $('shopRefLbl').textContent = L().shopRef;
  if (Date.now() >= getShopT()) generateLots();
}

export function startShopTimer() {
  if (shopInterval) clearInterval(shopInterval);
  shopInterval = setInterval(() => {
    if (Date.now() >= getShopT()) { generateLots(); return; }
    const d = getShopT() - Date.now();
    const h = Math.floor(d / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    const s = Math.floor((d % 60000) / 1000);
    const el = $('shopTimer');
    if (el) el.textContent = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

export function initShop() {
  $('purOk').addEventListener('click', () => $('purOv').classList.remove('on'));
  if (Date.now() >= getShopT()) generateLots();
  else renderShop();
  updateShopUI();
  startShopTimer();
}