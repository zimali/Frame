// js/state.js
import { LANGS } from './config.js';

// --- Load / persist ---
const ls = localStorage;
let cfg = JSON.parse(ls.getItem('brl_cfg') || '{}');
cfg = { lang: 'ru', sfxVol: 1, musicVol: 0.25, musicOn: true, bgHue: 160, tooltips: true, autoTiltOn: false, ...cfg };

let inv = JSON.parse(ls.getItem('inv') || '[]');
let prog = JSON.parse(ls.getItem('prog') || '{"lvl":0,"xp":0}');
let lvl = prog.lvl || 0;
let xp = prog.xp || 0;
let coins = parseInt(ls.getItem('coins') || '0');
let lots = JSON.parse(ls.getItem('lots') || '[]');
let shopT = parseInt(ls.getItem('shopT') || '0');
let quests = JSON.parse(ls.getItem('quests') || '[]');
let qprog = JSON.parse(ls.getItem('qprog') || '{}');
let bdgLvl = JSON.parse(ls.getItem('bdgLvl') || '{}');
let stats = {
  packs: +ls.getItem('st_packs') || 0,
  sells: +ls.getItem('st_sells') || 0,
  buys: +ls.getItem('st_buys') || 0
};
let streak = parseInt(ls.getItem('streak') || '0');
let playerName = ls.getItem('playerName') || '';
let playerAvatar = ls.getItem('playerAvatar') || '';
let cardSerial = parseInt(ls.getItem('cardSerial') || '0');
let collections = JSON.parse(ls.getItem('collections') || 'null') || [
  { id: 'all', name: 'Все', deletable: false }
];

export function saveAll() {
  ls.setItem('inv', JSON.stringify(inv));
  ls.setItem('prog', JSON.stringify({ lvl, xp }));
  ls.setItem('coins', coins);
  ls.setItem('lots', JSON.stringify(lots));
  ls.setItem('shopT', shopT);
  ls.setItem('quests', JSON.stringify(quests));
  ls.setItem('qprog', JSON.stringify(qprog));
  ls.setItem('bdgLvl', JSON.stringify(bdgLvl));
  ls.setItem('brl_cfg', JSON.stringify(cfg));
  ls.setItem('playerName', playerName);
  ls.setItem('playerAvatar', playerAvatar);
  ['packs', 'sells', 'buys'].forEach(k => ls.setItem('st_' + k, stats[k]));
  ls.setItem('streak', streak);
  ls.setItem('cardSerial', cardSerial);
  ls.setItem('collections', JSON.stringify(collections));
}

export function getState() {
  return { inv, lvl, xp, coins, lots, shopT, quests, qprog, bdgLvl, stats, streak, playerName, playerAvatar, cfg, cardSerial, collections };
}

export function setState(newState) {
  if (newState.inv !== undefined) inv = newState.inv;
  if (newState.lvl !== undefined) lvl = newState.lvl;
  if (newState.xp !== undefined) xp = newState.xp;
  if (newState.coins !== undefined) coins = newState.coins;
  if (newState.lots !== undefined) lots = newState.lots;
  if (newState.shopT !== undefined) shopT = newState.shopT;
  if (newState.quests !== undefined) quests = newState.quests;
  if (newState.qprog !== undefined) qprog = newState.qprog;
  if (newState.bdgLvl !== undefined) bdgLvl = newState.bdgLvl;
  if (newState.stats !== undefined) stats = newState.stats;
  if (newState.streak !== undefined) streak = newState.streak;
  if (newState.playerName !== undefined) playerName = newState.playerName;
  if (newState.playerAvatar !== undefined) playerAvatar = newState.playerAvatar;
  if (newState.cfg !== undefined) cfg = newState.cfg;
  if (newState.cardSerial !== undefined) cardSerial = newState.cardSerial;
  if (newState.collections !== undefined) collections = newState.collections;
  saveAll();
}

// --- Individual getters / setters for convenience ---
export function getInv() { return inv; }
export function setInv(newInv) { inv = newInv; saveAll(); }
export function pushInv(card) { inv.push(card); saveAll(); }

export function getLvl() { return lvl; }
export function setLvl(v) { lvl = v; saveAll(); }

export function getXp() { return xp; }
export function setXp(v) { xp = v; saveAll(); }

export function getCoins() { return coins; }
export function setCoins(v) { coins = v; saveAll(); }
export function addCoins(v) { coins += v; saveAll(); }

export function getLots() { return lots; }
export function setLots(v) { lots = v; saveAll(); }

export function getShopT() { return shopT; }
export function setShopT(v) { shopT = v; saveAll(); }

export function getQuests() { return quests; }
export function setQuests(v) { quests = v; saveAll(); }

export function getQprog() { return qprog; }
export function setQprog(v) { qprog = v; saveAll(); }

export function getBdgLvl() { return bdgLvl; }
export function setBdgLvl(v) { bdgLvl = v; saveAll(); }

export function getStats() { return stats; }
export function setStats(v) { stats = v; saveAll(); }
export function incStat(k, n = 1) { stats[k] = (stats[k] || 0) + n; saveAll(); }

export function getStreak() { return streak; }
export function setStreak(v) { streak = v; saveAll(); }

export function getPlayerName() { return playerName; }
export function setPlayerName(v) { playerName = v; saveAll(); }
export function getPlayerAvatar() { return playerAvatar; }
export function setPlayerAvatar(v) { playerAvatar = v; saveAll(); }

export function getCfg() { return cfg; }
export function setCfg(v) { cfg = v; saveAll(); }
export function updateCfg(updates) { Object.assign(cfg, updates); saveAll(); }

export function getLang() { return cfg.lang; }
export function L() { return LANGS[cfg.lang] || LANGS.ru; }

export function hasCard(movieId, rarity) {
  return inv.some(c => c.movieId === movieId && c.rarity === rarity);
}

// --- Card serial numbers (global, sequential, never reused) ---
export function nextCardSerial() {
  cardSerial += 1;
  saveAll();
  return cardSerial;
}

// --- Collections ---
export const MAX_COLLECTIONS = 4; // additional, on top of the permanent "Все"
export const COLLECTION_COST = 1000;

export function getCollections() { return collections; }

export function createCollection(name) {
  const extra = collections.filter(c => c.deletable).length;
  if (extra >= MAX_COLLECTIONS) return { ok: false, reason: 'max' };
  if (coins < COLLECTION_COST) return { ok: false, reason: 'coins' };
  coins -= COLLECTION_COST;
  const col = { id: 'col_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name || 'Коллекция', deletable: true };
  collections.push(col);
  saveAll();
  return { ok: true, collection: col };
}

export function renameCollection(id, name) {
  const c = collections.find(x => x.id === id);
  if (!c || !c.deletable) return false;
  c.name = name;
  saveAll();
  return true;
}

export function deleteCollection(id) {
  const c = collections.find(x => x.id === id);
  if (!c || !c.deletable) return false;
  collections = collections.filter(x => x.id !== id);
  // Return cards to "all" (i.e. clear collectionId so they show up in Все again)
  inv.forEach(card => { if (card.collectionId === id) delete card.collectionId; });
  saveAll();
  return true;
}

export function moveCardsToCollection(cardIds, collectionId) {
  const idSet = new Set(cardIds);
  inv.forEach(card => {
    if (idSet.has(card.id)) {
      if (collectionId === 'all') delete card.collectionId;
      else card.collectionId = collectionId;
    }
  });
  saveAll();
}

// --- Reset ---
export function resetAll() {
  ['inv', 'prog', 'coins', 'lots', 'shopT', 'quests', 'qprog', 'bdgLvl',
   'lastReset', 'streak', 'streakDay', 'st_packs', 'st_sells', 'st_buys',
   'playerName', 'playerAvatar', 'tutDone', 'cardSerial', 'collections'].forEach(k => ls.removeItem(k));
  location.reload();
}
