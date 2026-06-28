// js/main.js
import { $, applyBgHue, setBodyRar } from './utils.js';
import { getCfg, getLvl, getXp, getStreak, getPlayerName, L, saveAll } from './state.js';
import { initAudio, resumeAudio, S } from './audio.js';
import { initNameScreen, updatePlayerNameUI, showNameScreen, hideNameScreen } from './ui/name.js';
import { initPack, resetPack } from './ui/pack.js';
import { initInventory, renderInventory } from './ui/inventory.js';
import { initShop, updateShopUI, startShopTimer } from './ui/shop.js';
import { initInfoTab, updateLevel, renderQuests, updateDiamondBanner, renderBadges, updateStreakUI } from './ui/info.js';
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
  initInventory();
  initShop();
  initPreview();
  initSettings();
  initTutorial();

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
      if (tab === 'shop') { setMusicType('shop'); updateShopUI(); startShopTimer(); } else setMusicType('main');
      if (tab === 'inv') renderInventory($('searchInp').value.trim());
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

function applyI18n() {
  const tx = L();
  $('nOpenL').textContent = tx.open;
  $('nInvL').textContent = tx.inv;
  $('nShopL').textContent = tx.shop;
  $('nInfoL').textContent = tx.info;
  $('nSettL').textContent = tx.sett;
  $('packHint').textContent = tx.hint;
  $('closeResBtn').textContent = tx.close;
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
  updateLevel();
  renderQuests();
  updateDiamondBanner();
  renderBadges();
  updateStreakUI();
  updateShopUI();
}

// Start the app
init();

// Expose for debugging / global access
window._claimDiamond = function () {
  import('./game.js').then(m => {
    m.claimDiamond(() => {
      import('./ui/info.js').then(ui => {
        ui.updateDiamondBanner();
        // Also trigger the diamond drop animation
        import('./ui/pack.js').then(pack => {
          // The diamond drop is triggered via the game module's claimDiamond
          // which calls a callback. We need to actually show the drop.
          // For now, we just update the UI.
          // The actual drop is handled in the info module's claim button.
        });
      });
    });
  });
};

// Re-apply i18n when settings change language
const origOpenSettings = openSettings;
openSettings = function () {
  // Settings modal will call applyI18n on language change via the lang buttons
  origOpenSettings();
};
