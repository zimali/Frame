// js/main.js
import { $, applyBgHue, setBodyRar } from './utils.js';
import { getCfg, getLvl, getXp, getStreak, getPlayerName, L, saveAll } from './state.js';
import { initAudio, resumeAudio, S, setMusicType } from './audio.js';
import { initNameScreen, updatePlayerNameUI, showNameScreen, hideNameScreen } from './ui/name.js';
import { initPack, resetPack } from './ui/pack.js';
import { initPackTypePicker, updatePackTypeIndicator } from './ui/packtype.js';
import { initInventory, renderInventory } from './ui/inventory.js';
import { initCatalog } from './ui/catalog.js';
import { initCollections, renderCollectionChips } from './ui/collections.js';
import { initShop, updateShopUI, startShopTimer } from './ui/shop.js';
import { initInfoTab, updateLevel, renderQuests, updateDiamondBanner, renderBadges, updateStreakUI, initDiamondClaim } from './ui/info.js';
import { initPreview, closePreview } from './ui/preview.js';
import { initSettings, openSettings } from './ui/settings.js';
import { initTutorial, openTutorial } from './ui/tutorial.js';
import { initNameScreen as initNameScreen2 } from './ui/name.js';
import { dailyReset, checkStreak, checkQuests, checkBadges } from './game.js';
import { generateLots } from './ui/shop.js';

// --- Init ---
function init() {
  // Load screen
  setTimeout(() => {
    const ls = $('loadScreen');
    ls.classList.add('hidden');
    ls.addEventListener('transitionend', () => ls.remove(), { once: true });
    if (!getPlayerName()) {
      showNameScreen();
    } else {
      updatePlayerNameUI();
      if (!localStorage.getItem('tutDone')) setTimeout(openTutorial, 500);
    }
  }, 1800);

  // Audio: init on first click
  document.addEventListener('click', () => {
    initAudio();
    resumeAudio();
    const cfg = getCfg();
    if (cfg.musicOn) setMusicType('main');
  }, { once: true });

  // Apply saved bg
  applyBgHue(getCfg().bgHue);
  setBodyRar(null);

  // Daily reset, streak, quests
  dailyReset();
  checkStreak();
  checkQuests();
  checkBadges();

  // Initialize modules
  initNameScreen();
  initPack();
  initPackTypePicker();
  initInventory();
  initCatalog();
  initShop();
  initPreview();
  initSettings();
  initTutorial();
  initCollections();
  initDiamondClaim();

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
      if (tab === 'info') { updateLevel(); renderQuests(); updateDiamondBanner(); renderBadges(); updateStreakUI(); updatePlayerNameUI(); }
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
  // (Language change is handled in settings, which calls applyI18n)
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
  $('nInfoL').textContent = tx.info;
  $('nSettL').textContent = tx.sett;
  $('packHint').textContent = tx.hint;
  $('sTitle').textContent = tx.settTitle;
  $('sortNew').textContent = tx.newest;
  $('rfAll').textContent = tx.all;
  $('rfCom').textContent = 'Обыч.';
  $('rfGold').textContent = tx.gold;
  $('rfRain').textContent = 'Радуга';
  $('rfUniq').textContent = 'Уник.';
  $('rfDia').textContent = 'Алмаз';
  $('rfFav').textContent = '♡ Изб.';
  $('purTitle').textContent = tx.newCards;
  $('purOk').textContent = tx.ok;
  // Settings modal labels
  $('sLangGrp').textContent = tx.langLbl;
  $('sVisGrp').textContent = tx.vis;
  $('sBgLbl').textContent = tx.bgLbl;
  $('sTooltipsLbl').innerHTML = `${tx.tooltipsLbl}<span class="s-sub">${tx.tooltipsSub}</span>`;
  $('sAvatarLbl').textContent = tx.avatarLbl;
  updatePackTypeIndicator();
  $('catalogTitleTxt').textContent = tx.catalogTitle;
  $('catTabMovie').textContent = tx.packMovie;
  $('catTabTv').textContent = tx.packTv;
  $('catTabGame').textContent = tx.packGame;
  $('catRarAll').textContent = tx.all;
  $('catRarCommon').textContent = 'Обыч.';
  $('catRarGold').textContent = tx.gold;
  $('catRarRain').textContent = 'Радуга';
  $('catRarUniq').textContent = 'Уник.';
  $('catRarDia').textContent = 'Алмаз';
  $('catalogSearch').placeholder = tx.catalogHint;
  $('catalogBtn').title = tx.catalogBtn;
  $('catalogBtn').setAttribute('aria-label', tx.catalogBtn);
  $('selectModeBtn').title = tx.selectBtn;
  $('selectModeBtn').setAttribute('aria-label', tx.selectBtn);
  updateLevel();
  renderQuests();
  updateDiamondBanner();
  renderBadges();
  updateStreakUI();
  updateShopUI();
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
