// js/game.js
import {
  getLvl, getXp, getQuests, getQprog, getBdgLvl, getStats, getInv, L,
  setLvl, setXp, setQuests, setQprog, setBdgLvl, saveAll,
  getCoins, setCoins, getStreak, setStreak, getPlayerName,
  getStreakDay, setStreakDay, getLastReset, setLastReset
} from './state.js';
import { BADGE_XP } from './config.js';
import { S } from './audio.js';
import { notify, confetti, fireworks } from './ui/notifications.js';
import { $ } from './utils.js';

const QP = {
  easy: [
    { desc: 'Открыть 2 пака', target: 2, track: 'packs' },
    { desc: 'Продать карточку', target: 1, track: 'sells' },
    { desc: 'Купить любой лот', target: 1, track: 'buys' },
    { desc: 'Получить обычную карточку', target: 1, track: 'common' },
    { desc: 'Добавить в избранное', target: 1, track: 'favorite' }
  ],
  medium: [
    { desc: 'Открыть 5 паков', target: 5, track: 'packs' },
    { desc: 'Продать 3 карточки', target: 3, track: 'sells' },
    { desc: 'Получить золотую карточку', target: 1, track: 'gold' },
    { desc: 'Купить 2 лота', target: 2, track: 'buys' },
    { desc: '3 карточки в избранное', target: 3, track: 'favorite' }
  ],
  hard: [
    { desc: 'Открыть 10 паков', target: 10, track: 'packs' },
    { desc: 'Получить радужную карточку', target: 1, track: 'rainbow' },
    { desc: 'Продать 10 карточек', target: 10, track: 'sells' },
    { desc: 'Купить 3 лота', target: 3, track: 'buys' },
    { desc: '5 карточек в избранное', target: 5, track: 'favorite' }
  ]
};

export function reqXP(lvl) { return (lvl + 1) * 100; }

export function addXP(amount, card) {
  let a = amount;
  if (card?.origin === 'shop' && card.rarity !== 'unique' && card.rarity !== 'diamond') a = Math.floor(a * 0.5);
  if (card?.rarity === 'unique') a = 1000;
  if (card?.rarity === 'diamond') a = 0;
  let xp = getXp();
  let lvl = getLvl();
  xp += a;
  let up = false;
  while (xp >= reqXP(lvl)) { xp -= reqXP(lvl); lvl++; up = true; }
  setXp(xp);
  setLvl(lvl);
  if (up) {
    const pop = $('lvlup');
    pop.textContent = L().lvlUp;
    pop.classList.add('on');
    S.lvlUp();
    confetti();
    fireworks();
    setTimeout(() => pop.classList.remove('on'), 2300);
    notify(L().lvlUp, 'lvl');
  }
  saveAll();
}

export function generateQuests() {
  const pick = pool => pool[Math.floor(Math.random() * pool.length)];
  const qs = [
    { ...pick(QP.easy), difficulty: 'easy', reward: 50, id: 'easy', completed: false, claimed: false },
    { ...pick(QP.medium), difficulty: 'medium', reward: 100, id: 'medium', completed: false, claimed: false },
    { ...pick(QP.hard), difficulty: 'hard', reward: 200, id: 'hard', completed: false, claimed: false }
  ];
  setQuests(qs);
  setQprog({ easy: 0, medium: 0, hard: 0 });
  saveAll();
}

export function checkQuests() {
  const quests = getQuests();
  if (!quests.length) return;
  const stats = getStats();
  const inv = getInv();
  const counts = {
    packs: stats.packs,
    sells: stats.sells,
    buys: stats.buys,
    common: inv.filter(c => c.rarity === 'common').length,
    gold: inv.filter(c => c.rarity === 'gold').length,
    rainbow: inv.filter(c => c.rarity === 'rainbow').length,
    unique: inv.filter(c => c.rarity === 'unique').length,
    diamond: inv.filter(c => c.rarity === 'diamond').length,
    favorite: inv.filter(c => c.favorite).length
  };
  const qprog = getQprog();
  quests.forEach(q => {
    const cur = counts[q.track] || 0;
    const p = Math.min(cur, q.target);
    qprog[q.id] = p;
    if (p >= q.target) q.completed = true;
  });
  setQuests(quests);
  setQprog(qprog);
  saveAll();
  // UI update is handled by callers
}

export function checkBadges() {
  const bdgLvl = getBdgLvl();
  let notifs = [];
  const bdgs = [
    { id: 'packs', thresholds: [10, 50, 150, 400, 1000], labels: ['Новичок', 'Любитель', 'Опытный', 'Ветеран', 'Легенда'], name: 'Коллекционер паков', value: () => getStats().packs },
    { id: 'sells', thresholds: [10, 30, 75, 200, 500], labels: ['Начинающий', 'Торгаш', 'Делец', 'Бизнесмен', 'Магнат'], name: 'Торговец', value: () => getStats().sells },
    { id: 'buys', thresholds: [5, 15, 35, 75, 200], labels: ['Посетитель', 'Покупатель', 'Шопоголик', 'Фанат', 'Маньяк'], name: 'Покупатель', value: () => getStats().buys },
    { id: 'level', thresholds: [5, 10, 20, 35, 50], labels: ['Продвинутый', 'Эксперт', 'Мастер', 'Грандмастер', 'Абсолют'], name: 'Уровень', value: () => getLvl() },
    { id: 'gold', thresholds: [1, 5, 15, 40, 100], labels: ['Искатель', 'Добытчик', 'Золотарь', 'Клондайк', 'Форт Нокс'], name: 'Золотоискатель', value: () => getInv().filter(c => c.rarity === 'gold').length },
    { id: 'rain', thresholds: [1, 3, 8, 20, 50], labels: ['Мечтатель', 'Охотник', 'Коллектор', 'Хранитель', 'Радуга'], name: 'Радужный охотник', value: () => getInv().filter(c => c.rarity === 'rainbow').length },
    { id: 'uniq', thresholds: [1, 3, 7, 15, 30], labels: ['Счастливчик', 'Уникум', 'Избранный', 'Феномен', 'Бог'], name: 'Уникум', value: () => getInv().filter(c => c.rarity === 'unique').length },
    { id: 'diam', thresholds: [1, 2, 5, 10, 20], labels: ['Везунчик', 'Алмазный', 'Сокровище', 'Клад', 'Брильянт'], name: 'Алмазный', value: () => getInv().filter(c => c.rarity === 'diamond').length },
    { id: 'fav', thresholds: [1, 5, 15, 40, 100], labels: ['Нежный', 'Хранитель', 'Фанат', 'Обожатель', 'Одержимый'], name: 'Хранитель', value: () => getInv().filter(c => c.favorite).length },
    { id: 'total', thresholds: [10, 50, 150, 400, 1000], labels: ['Читатель', 'Библиофил', 'Архивист', 'Хранитель', 'Оракул'], name: 'Библиотекарь', value: () => getInv().length },
    { id: 'streak', thresholds: [3, 7, 14, 30, 100], labels: ['Регулярный', 'Постоянный', 'Преданный', 'Одержимый', 'Легенда'], name: 'Стрикер', value: () => getStreak() }
  ];

  bdgs.forEach(b => {
    let cur = bdgLvl[b.id] || 0;
    const val = b.value();
    while (cur < b.thresholds.length && val >= b.thresholds[cur]) {
      cur++;
      bdgLvl[b.id] = cur;
      const xpR = BADGE_XP[cur - 1] || 50;
      let xp = getXp();
      let lvl = getLvl();
      xp += xpR;
      while (xp >= reqXP(lvl)) { xp -= reqXP(lvl); lvl++; }
      setXp(xp);
      setLvl(lvl);
      notifs.push({ name: b.name, label: b.labels[cur - 1], lv: cur, xpR });
    }
  });
  setBdgLvl(bdgLvl);
  saveAll();

  if (notifs.length) {
    const n = notifs[0];
    notify(`🏅 ${n.name} → <strong>${n.label}</strong> Ур.${n.lv} <span style="color:#4ade80">+${n.xpR} XP</span>`, 'badge');
    S.badge();
    confetti();
    fireworks(3);
  }
}

export function checkStreak() {
  const today = new Date().toDateString();
  const last = getStreakDay();
  let s = getStreak();
  if (!last) { s = 1; } else {
    const d = (new Date(today) - new Date(last)) / 86400000;
    if (d < 1) { /* same day */ } else if (d < 2) { s++; } else { s = 1; }
  }
  setStreak(s);
  setStreakDay(today);
  saveAll();
}

export function dailyReset() {
  const today = new Date().toDateString();
  const last = getLastReset();
  if (last !== today) {
    generateQuests();
    // generateLots is in shop module, called from main
    setLastReset(today);
  }
}

// Diamond claim
export function claimDiamond(callback) {
  const quests = getQuests();
  if (!quests.every(q => q.completed) || quests.every(q => q.claimed)) return;
  quests.forEach(q => q.claimed = true);
  setQuests(quests);
  saveAll();
  callback();
}