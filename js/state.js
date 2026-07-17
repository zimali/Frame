// js/state.js
import { LANGS } from './config.js';

const ls = localStorage;

// ═══ ACCOUNTS ═══
// Lightweight local "accounts" system (no server): each account is a distinct
// namespace for all game data, so several profiles can coexist in one browser.
// Account metadata (username/avatar) lives in a shared, un-namespaced registry;
// everything else (inventory, coins, quests, etc.) is stored under `acct_{id}_key`.
let accounts = JSON.parse(ls.getItem('accounts') || '[]');
let activeAccountId = ls.getItem('activeAccountId') || null;

function K(key) {
  return activeAccountId ? `acct_${activeAccountId}_${key}` : key;
}

function migrateLegacyDataIfNeeded() {
  // Older versions of the site stored everything under plain (un-namespaced) keys.
  // If we find that data and no accounts exist yet, adopt it into a first account
  // instead of silently discarding someone's progress.
  if (accounts.length || ls.getItem('inv') === null && ls.getItem('playerName') === null) return;
  const id = 'a' + Date.now().toString(36);
  const legacyKeys = ['inv', 'prog', 'coins', 'lots', 'shopT', 'quests', 'qprog', 'bdgLvl',
    'streak', 'st_packs', 'st_sells', 'st_buys', 'cardSerial', 'collections', 'tutDone', 'lastReset'];
  legacyKeys.forEach(k => {
    const v = ls.getItem(k);
    if (v !== null) { ls.setItem(`acct_${id}_${k}`, v); ls.removeItem(k); }
  });
  const legacyName = ls.getItem('playerName') || 'Игрок';
  accounts = [{ id, username: legacyName, avatarStyle: 'identicon', avatarSeed: legacyName, createdAt: Date.now() }];
  activeAccountId = id;
  ls.removeItem('playerName');
  ls.removeItem('playerAvatar');
  ls.setItem('accounts', JSON.stringify(accounts));
  ls.setItem('activeAccountId', id);
}
migrateLegacyDataIfNeeded();

export function getAccounts() { return accounts; }
export function getActiveAccountId() { return activeAccountId; }
export function getActiveAccount() { return accounts.find(a => a.id === activeAccountId) || null; }
export function isLoggedIn() { return !!activeAccountId && !!getActiveAccount(); }

export function createAccount(username, avatarStyle, avatarSeed) {
  const id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const acct = { id, username, avatarStyle, avatarSeed, createdAt: Date.now() };
  accounts.push(acct);
  ls.setItem('accounts', JSON.stringify(accounts));
  activeAccountId = id;
  ls.setItem('activeAccountId', id);
  return acct;
}

export function switchAccount(id) {
  if (!accounts.some(a => a.id === id)) return false;
  activeAccountId = id;
  ls.setItem('activeAccountId', id);
  return true;
}

export function logoutAccount() {
  activeAccountId = null;
  ls.removeItem('activeAccountId');
}

export function deleteAccount(id) {
  const wasActive = activeAccountId === id;
  accounts = accounts.filter(a => a.id !== id);
  ls.setItem('accounts', JSON.stringify(accounts));
  // Sweep every localStorage key namespaced to this account.
  const prefix = `acct_${id}_`;
  const toRemove = [];
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach(k => ls.removeItem(k));
  if (wasActive) { activeAccountId = null; ls.removeItem('activeAccountId'); }
}

export function updateAccountProfile(id, updates) {
  const acct = accounts.find(a => a.id === id);
  if (!acct) return false;
  Object.assign(acct, updates);
  ls.setItem('accounts', JSON.stringify(accounts));
  return true;
}

export function getPlayerName() { return getActiveAccount()?.username || ''; }
export function setPlayerName(v) { if (activeAccountId) updateAccountProfile(activeAccountId, { username: v }); }
export function getPlayerAvatar() {
  const a = getActiveAccount();
  return a ? { style: a.avatarStyle, seed: a.avatarSeed } : null;
}
export function setPlayerAvatar(style, seed) {
  if (activeAccountId) updateAccountProfile(activeAccountId, { avatarStyle: style, avatarSeed: seed });
}

// ═══ PER-ACCOUNT GAME STATE ═══
let cfg = JSON.parse(ls.getItem('brl_cfg') || '{}');
cfg = { lang: 'ru', sfxVol: 1, musicVol: 0.25, musicOn: true, bgHue: 160, tooltips: true, autoTiltOn: false, perfMode: false, ...cfg };

let inv = JSON.parse(ls.getItem(K('inv')) || '[]');
let prog = JSON.parse(ls.getItem(K('prog')) || '{"lvl":0,"xp":0}');
let lvl = prog.lvl || 0;
let xp = prog.xp || 0;
let coins = parseInt(ls.getItem(K('coins')) || '0');
let lots = JSON.parse(ls.getItem(K('lots')) || '[]');
let shopT = parseInt(ls.getItem(K('shopT')) || '0');
let quests = JSON.parse(ls.getItem(K('quests')) || '[]');
let qprog = JSON.parse(ls.getItem(K('qprog')) || '{}');
let bdgLvl = JSON.parse(ls.getItem(K('bdgLvl')) || '{}');
let stats = {
  packs: +ls.getItem(K('st_packs')) || 0,
  sells: +ls.getItem(K('st_sells')) || 0,
  buys: +ls.getItem(K('st_buys')) || 0
};
let streak = parseInt(ls.getItem(K('streak')) || '0');
let cardSerial = parseInt(ls.getItem(K('cardSerial')) || '0');
let collections = JSON.parse(ls.getItem(K('collections')) || 'null') || [
  { id: 'all', name: 'Все', deletable: false }
];

export function saveAll() {
  ls.setItem(K('inv'), JSON.stringify(inv));
  ls.setItem(K('prog'), JSON.stringify({ lvl, xp }));
  ls.setItem(K('coins'), coins);
  ls.setItem(K('lots'), JSON.stringify(lots));
  ls.setItem(K('shopT'), shopT);
  ls.setItem(K('quests'), JSON.stringify(quests));
  ls.setItem(K('qprog'), JSON.stringify(qprog));
  ls.setItem(K('bdgLvl'), JSON.stringify(bdgLvl));
  ls.setItem('brl_cfg', JSON.stringify(cfg)); // cfg is a device/browser preference, shared across accounts
  ['packs', 'sells', 'buys'].forEach(k => ls.setItem(K('st_' + k), stats[k]));
  ls.setItem(K('streak'), streak);
  ls.setItem(K('cardSerial'), cardSerial);
  ls.setItem(K('collections'), JSON.stringify(collections));
}

export function getState() {
  return { inv, lvl, xp, coins, lots, shopT, quests, qprog, bdgLvl, stats, streak, cfg, cardSerial, collections };
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

export function getCfg() { return cfg; }
export function setCfg(v) { cfg = v; saveAll(); }
export function updateCfg(updates) { Object.assign(cfg, updates); saveAll(); }

export function getLang() { return cfg.lang; }
export function L() { return LANGS[cfg.lang] || LANGS.ru; }

export function hasTutDone() { return ls.getItem(K('tutDone')) === '1'; }
export function setTutDone() { ls.setItem(K('tutDone'), '1'); }

export function getStreakDay() { return ls.getItem(K('streakDay')); }
export function setStreakDay(v) { ls.setItem(K('streakDay'), v); }
export function getLastReset() { return ls.getItem(K('lastReset')); }
export function setLastReset(v) { ls.setItem(K('lastReset'), v); }

export function hasCard(movieId, rarity, mediaType) {
  return inv.some(c => c.movieId === movieId && c.rarity === rarity && (mediaType === undefined || c.media_type === mediaType));
}

// --- Card serial numbers (global per account, sequential, never reused) ---
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

// --- Reset (wipes the CURRENT account's progress only, not the account itself) ---
export function resetAll() {
  ['inv', 'prog', 'coins', 'lots', 'shopT', 'quests', 'qprog', 'bdgLvl',
   'lastReset', 'streak', 'streakDay', 'st_packs', 'st_sells', 'st_buys',
   'tutDone', 'cardSerial', 'collections'].forEach(k => ls.removeItem(K(k)));
  location.reload();
}
