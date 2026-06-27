// js/ui/info.js
import { $ } from '../utils.js';
import { getLvl, getXp, getStreak, getQuests, getQprog, getBdgLvl, getStats, getInv, L, setLvl, setXp, saveAll } from '../state.js';
import { reqXP, BADGE_XP, CIRC } from '../config.js';
import { S } from '../audio.js';
import { notify, confetti, fireworks } from './notifications.js';

const BDGS = [
  { id: 'packs', name: 'Коллекционер паков', icon: 'fa-box-open', color: '#60a5fa', thresholds: [10, 50, 150, 400, 1000], labels: ['Новичок', 'Любитель', 'Опытный', 'Ветеран', 'Легенда'], value: () => getStats().packs },
  { id: 'sells', name: 'Торговец', icon: 'fa-coins', color: '#fbbf24', thresholds: [10, 30, 75, 200, 500], labels: ['Начинающий', 'Торгаш', 'Делец', 'Бизнесмен', 'Магнат'], value: () => getStats().sells },
  { id: 'buys', name: 'Покупатель', icon: 'fa-bag-shopping', color: '#4ade80', thresholds: [5, 15, 35, 75, 200], labels: ['Посетитель', 'Покупатель', 'Шопоголик', 'Фанат', 'Маньяк'], value: () => getStats().buys },
  { id: 'level', name: 'Уровень', icon: 'fa-arrow-trend-up', color: '#c084fc', thresholds: [5, 10, 20, 35, 50], labels: ['Продвинутый', 'Эксперт', 'Мастер', 'Грандмастер', 'Абсолют'], value: () => getLvl() },
  { id: 'gold', name: 'Золотоискатель', icon: 'fa-star', color: '#fbbf24', thresholds: [1, 5, 15, 40, 100], labels: ['Искатель', 'Добытчик', 'Золотарь', 'Клондайк', 'Форт Нокс'], value: () => getInv().filter(c => c.rarity === 'gold').length },
  { id: 'rain', name: 'Радужный охотник', icon: 'fa-rainbow', color: '#f87171', thresholds: [1, 3, 8, 20, 50], labels: ['Мечтатель', 'Охотник', 'Коллектор', 'Хранитель', 'Радуга'], value: () => getInv().filter(c => c.rarity === 'rainbow').length },
  { id: 'uniq', name: 'Уникум', icon: 'fa-gem', color: '#ff4444', thresholds: [1, 3, 7, 15, 30], labels: ['Счастливчик', 'Уникум', 'Избранный', 'Феномен', 'Бог'], value: () => getInv().filter(c => c.rarity === 'unique').length },
  { id: 'diam', name: 'Алмазный', icon: 'fa-diamond', color: '#60a5fa', thresholds: [1, 2, 5, 10, 20], labels: ['Везунчик', 'Алмазный', 'Сокровище', 'Клад', 'Брильянт'], value: () => getInv().filter(c => c.rarity === 'diamond').length },
  { id: 'fav', name: 'Хранитель', icon: 'fa-heart', color: '#f87171', thresholds: [1, 5, 15, 40, 100], labels: ['Нежный', 'Хранитель', 'Фанат', 'Обожатель', 'Одержимый'], value: () => getInv().filter(c => c.favorite).length },
  { id: 'total', name: 'Библиотекарь', icon: 'fa-book', color: '#aaa', thresholds: [10, 50, 150, 400, 1000], labels: ['Читатель', 'Библиофил', 'Архивист', 'Хранитель', 'Оракул'], value: () => getInv().length },
  { id: 'streak', name: 'Стрикер', icon: 'fa-fire', color: '#ff8c00', thresholds: [3, 7, 14, 30, 100], labels: ['Регулярный', 'Постоянный', 'Преданный', 'Одержимый', 'Легенда'], value: () => getStreak() }
];

export function updateLevel() {
  const lvl = getLvl();
  const xp = getXp();
  $('lvlNum').textContent = lvl;
  const r = reqXP(lvl);
  const pct = Math.min(100, (xp / r) * 100);
  $('xpFill').style.width = pct + '%';
  $('xpTxt').textContent = `${xp} / ${r} XP`;
  const arc = document.getElementById('xpArc');
  if (arc) {
    const v = (pct / 100) * CIRC;
    arc.setAttribute('stroke-dasharray', `${v} ${CIRC - v}`);
  }
  $('lvlTitle').textContent = L().lvlTitle;
}

export function updateStreakUI() {
  $('streakVal').textContent = getStreak();
  $('streakSub').textContent = L().streakSub;
  $('streakTitle').textContent = L().streakTitle;
}

export function renderQuests() {
  $('questHdr').textContent = L().questHdr;
  const ql = $('questList');
  if (!ql) return;
  const quests = getQuests();
  if (!quests.length) { ql.innerHTML = '<p style="color:#555;font-size:.78rem">—</p>'; return; }
  const qprog = getQprog();
  const icons = { easy: '🌱', medium: '⚡', hard: '🔥' };
  ql.innerHTML = quests.map(q => {
    const p = qprog[q.id] || 0;
    const pct = Math.min(100, (p / q.target) * 100);
    const done = q.completed;
    return `<div class="quest-item ${done ? 'done' : ''}">
      <div class="q-icon">${icons[q.difficulty]}</div>
      <div class="q-body">
        <div class="q-title">${q.desc}</div>
        <div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
        <div class="q-prog">${p} / ${q.target}</div>
      </div>
      ${done ? '<div class="q-check">✓</div>' : `<div class="q-rew">+${q.reward} XP</div>`}
    </div>`;
  }).join('');
}

export function updateDiamondBanner() {
  const quests = getQuests();
  const done = quests.filter(q => q.completed).length;
  const allClaimed = quests.every(q => q.claimed);
  $('dFill').style.width = `${(done / 3) * 100}%`;
  $('dLabel').textContent = L().dLabel(done);
  $('dRight').textContent = L().dRight;
  $('dTitle').textContent = L().dTitle;
  $('claimBtn').textContent = L().claim;
  const btn = $('claimBtn');
  if (done === 3 && !allClaimed) { btn.style.display = 'block'; } else { btn.style.display = 'none'; }
}

export function renderBadges() {
  $('bdgHdr').textContent = L().badgesHdr;
  const g = $('bdgGrid');
  if (!g) return;
  const bdgLvl = getBdgLvl();
  g.innerHTML = BDGS.map(b => {
    const lv = bdgLvl[b.id] || 0;
    const locked = lv === 0;
    const col = locked ? '#333' : b.color;
    return `<div class="bdg ${locked ? 'locked' : 'lv' + lv}" data-bid="${b.id}" style="position:relative;overflow:visible;">
      <i class="fas ${b.icon}" style="color:${col}"></i>
      <span class="bdg-lv">${locked ? '—' : 'Ур.' + lv}</span>
      <div class="bdg-tip-inline" id="tip-${b.id}"></div>
    </div>`;
  }).join('');

  g.querySelectorAll('.bdg').forEach(el => {
    const bid = el.dataset.bid;
    function buildTip() {
      const b = BDGS.find(x => x.id === bid);
      if (!b) return;
      const lv = bdgLvl[b.id] || 0;
      const locked = lv === 0;
      const val = b.value();
      const next = lv < b.thresholds.length ? b.thresholds[lv] : null;
      const prev = lv > 0 ? b.thresholds[lv - 1] : 0;
      const pct = next ? Math.min(100, ((val - prev) / (next - prev)) * 100) : 100;
      const tip = el.querySelector('.bdg-tip-inline');
      if (!tip) return;
      tip.innerHTML = `<h4>${b.name}</h4>
        <div style="color:#aaa;font-size:.66rem;margin:2px 0">${locked ? L().badgeLocked : b.labels[lv - 1] + ' (Ур.' + lv + ')'}</div>
        <div style="color:#555;font-size:.6rem">${next ? 'До след.: ' + next : L().badgeMax}</div>
        <div class="bt-bar"><div class="bt-fill" style="width:${pct}%"></div></div>
        <div class="bt-meta">${val}${next ? ' / ' + next : ''}</div>`;
      tip.classList.add('show');
    }
    el.addEventListener('mouseenter', buildTip);
    el.addEventListener('mouseleave', () => {
      const tip = el.querySelector('.bdg-tip-inline');
      if (tip) tip.classList.remove('show');
    });
    el.addEventListener('click', () => {
      S.click();
      const tip = el.querySelector('.bdg-tip-inline');
      if (tip && tip.classList.contains('show')) { tip.classList.remove('show'); } else buildTip();
    });
  });
}

export function initInfoTab() {
  updateLevel();
  renderQuests();
  updateDiamondBanner();
  renderBadges();
  updateStreakUI();
}
