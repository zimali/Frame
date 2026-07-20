// js/main.js
import { $, applyBgHue, setBodyRar } from './utils.js';
import { getCfg, getLvl, getXp, getStreak, L, isLoggedIn, updateCfg, hasTutDone } from './state.js';
import { initAudio, resumeAudio, S, setMusicType } from './audio.js';
import { initAccountScreen, showAccountScreen, hideAccountScreen, updatePlayerNameUI } from './ui/accounts.js';
import { initPack, resetPack } from './ui/pack.js';
import { initInventory, renderInventory } from './ui/inventory.js';
import { initCatalog } from './ui/catalog.js';
import { initCollections, renderCollectionChips } from './ui/collections.js';
import { initShop, updateShopUI, startShopTimer } from './ui/shop.js';
import { initInfoTab, updateLevel, renderQuests, updateDiamondBanner, renderBadges, updateStreakUI, initDiamondClaim, initProfileSection, renderProfile } from './ui/info.js';
import { initPreview, closePreview } from './ui/preview.js';
import { initSettings, openSettings } from './ui/settings.js';
import { initTutorial, openTutorial } from './ui/tutorial.js';
import { dailyReset, checkStreak, checkQuests, checkBadges } from './game.js';
import { generateLots } from './ui/shop.js';

const LOAD_TIPS_KEY = 'loadTips';

function cycleLoadTips() {
  const tips = L().loadTips || [];
  if (!tips.length) return;
  const el = $('loadTip');
  let i = 0;
  el.textContent = tips[0];
  const timer = setInterval(() => {
    i = (i + 1) % tips.length;
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = tips[i]; el.style.opacity = '1'; }, 180);
  }, 1500);
  return () => clearInterval(timer);
}

// --- Init ---
function init() {
  const stopTips = cycleLoadTips();

  // Load screen
  setTimeout(() => {
    if (stopTips) stopTips();
    const ls = $('loadScreen');
    ls.classList.add('hidden');
    ls.addEventListener('transitionend', () => ls.remove(), { once: true });
    if (!isLoggedIn()) {
      showAccountScreen();
    } else {
      updatePlayerNameUI();
      renderProfile();
      if (!hasTutDone()) setTimeout(openTutorial, 500);
    }
  }, 1900);

  // Audio: init on first click
  document.addEventListener('click', () => {
    initAudio();
    resumeAudio();
    const cfg = getCfg();
    if (cfg.musicOn) setMusicType('main');
  }, { once: true });

  // Apply saved bg + perf mode
  applyBgHue(getCfg().bgHue);
  setBodyRar(null);
  document.body.classList.toggle('perf-mode', !!getCfg().perfMode);

  // Daily reset, streak, quests (only meaningful once logged in; safe no-ops otherwise)
  if (isLoggedIn()) {
    dailyReset();
    checkStreak();
    checkQuests();
    checkBadges();
  }

  // Initialize modules
  initAccountScreen();
  initPack();
  initInventory();
  initCatalog();
  initShop();
  initPreview();
  initSettings();
  initTutorial();
  initCollections();
  initDiamondClaim();
  initProfileSection();

  // Info tab initial render
  initInfoTab();

  // Navigation
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', function () {
      S.tab();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      const pane = $('tab-' + this.dataset.tab);
      if (pane) pane.classList.add('active');
      const tab = this.dataset.tab;
      updateDocTitle(tab);
      if (tab === 'shop') { setMusicType('shop'); updateShopUI(); startShopTimer(); } else setMusicType('main');
      if (tab === 'inv') { renderCollectionChips(); renderInventory($('searchInp').value.trim()); }
      if (tab === 'info') { updateLevel(); renderQuests(); updateDiamondBanner(); renderBadges(); updateStreakUI(); renderProfile(); }
      if (tab === 'open') setBodyRar(null);
    });
  });

  // Settings nav button
  $('nSett').addEventListener('click', () => { S.click(); openSettings(); });

  // Changelog
  $('verTag').addEventListener('click', () => { S.click(); $('clModal').classList.add('on'); });
  $('clClose').addEventListener('click', () => $('clModal').classList.remove('on'));
  $('clModal').addEventListener('click', e => { if (e.target === $('clModal')) $('clModal').classList.remove('on'); });

  // I18n apply
  applyI18n();

  // Re-apply i18n on language change
  window.applyI18n = applyI18n;
}

function updateDocTitle(tab) {
  const tx = L();
  const names = { open: tx.open, inv: tx.inv, shop: tx.shop, info: tx.info, sett: tx.sett };
  const name = names[tab] || tx.open;
  document.title = `Frame · ${name}`;
}

function applyI18n() {
  const tx = L();
  $('nOpenL').textContent = tx.open;
  $('nInvL').textContent = tx.inv;
  $('nShopL').textContent = tx.shop;
  $('nInfoL').textContent = tx.profileTab || tx.info;
  $('nSettL').textContent = tx.sett;
  $('packHint').textContent = tx.hint;
  $('sTitle').textContent = tx.settTitle;
  $('sortNew').textContent = tx.newest;
  $('rfAll').textContent = tx.all;
  $('rfCom').textContent = tx.rn.common;
  $('rfGold').textContent = tx.gold;
  $('rfRain').textContent = tx.rn.rainbow;
  $('rfUniq').textContent = tx.rn.unique;
  $('rfDia').textContent = tx.rn.diamond;
  $('rfFav').textContent = '♡ Изб.';
  $('purTitle').textContent = tx.newCards;
  $('purOk').textContent = tx.ok;
  // Settings modal labels
  $('sLangGrp').textContent = tx.langLbl;
  $('sVisGrp').textContent = tx.vis;
  $('sBgLbl').textContent = tx.bgLbl;
  $('sTooltipsLbl').innerHTML = `${tx.tooltipsLbl}<span class="s-sub">${tx.tooltipsSub}</span>`;
  $('sPerfLbl').innerHTML = `${tx.perfModeLbl}<span class="s-sub">${tx.perfModeSub}</span>`;
  $('catalogTitleTxt').textContent = tx.catalogTitle;
  $('catTabMovie').textContent = tx.packMovie;
  $('catTabTv').textContent = tx.packTv;
  $('catRarAll').textContent = tx.all;
  $('catRarCommon').textContent = tx.rn.common;
  $('catRarGold').textContent = tx.gold;
  $('catRarRain').textContent = tx.rn.rainbow;
  $('catRarUniq').textContent = tx.rn.unique;
  $('catRarDia').textContent = tx.rn.diamond;
  $('catalogSearch').placeholder = tx.catalogHint;
  $('catalogBtn').title = tx.catalogBtn;
  $('catalogBtn').setAttribute('aria-label', tx.catalogBtn);
  $('selectModeBtn').title = tx.selectBtn;
  $('selectModeBtn').setAttribute('aria-label', tx.selectBtn);
  $('acctPickerTitle').textContent = tx.chooseAcct;
  $('acctCreateNewLbl').textContent = tx.createAcct;
  $('acctCreateTitle').textContent = tx.newAcctTitle;
  $('acctNameInput').placeholder = tx.usernamePh;
  $('acctAvatarLabel').textContent = tx.avatarLbl || '';
  $('acctShuffleLbl').textContent = tx.shuffleAvatar;
  $('acctPerfLbl').textContent = tx.perfModeLbl;
  $('acctPerfSub').textContent = tx.perfModeSub;
  updateLevel();
  renderQuests();
  updateDiamondBanner();
  renderBadges();
  updateStreakUI();
  updateShopUI();
  renderProfile();
  const activeTab = document.querySelector('.nav-btn[data-tab].active');
  updateDocTitle(activeTab ? activeTab.dataset.tab : 'open');
}

// Start the app
init();

// Expose for debugging / global access
window._claimDiamond = function () {
  import('./game.js').then(m => {
    m.claimDiamond(() => {
      import('./ui/info.js').then(ui => {
        ui.updateDiamondBanner();
      });
    });
  });
};
