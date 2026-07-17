// js/ui/accounts.js
import { $, avatarImgHTML } from '../utils.js';
import {
  getAccounts, createAccount, switchAccount, deleteAccount, isLoggedIn,
  getActiveAccount, updateCfg, L
} from '../state.js';
import { S } from '../audio.js';
import { renderAvatarPicker, refreshAvatarPickerSeed } from './avatarpicker.js';
import { openTutorial } from './tutorial.js';

let draftStyle = 'adventurer';
let draftSeed = randomSeed();
let draftPerf = false;

function randomSeed() { return Math.random().toString(36).slice(2, 10); }

function showPickerView() {
  const accounts = getAccounts();
  $('acctPickerView').style.display = 'flex';
  $('acctCreateView').style.display = 'none';
  $('acctPickerList').innerHTML = accounts.map(a => `
    <button class="acct-row" data-id="${a.id}">
      <div class="acct-row-avatar">${avatarImgHTML({ style: a.avatarStyle, seed: a.avatarSeed })}</div>
      <span class="acct-row-name">${a.username}</span>
      <i class="fas fa-chevron-right"></i>
    </button>
  `).join('');
  $('acctPickerList').querySelectorAll('.acct-row').forEach(row => {
    row.addEventListener('click', () => {
      S.click();
      switchAccount(row.dataset.id);
      location.reload();
    });
  });
}

function showCreateView() {
  draftStyle = 'adventurer';
  draftSeed = randomSeed();
  draftPerf = false;
  $('acctPickerView').style.display = 'none';
  $('acctCreateView').style.display = 'flex';
  $('acctBackBtn').style.display = getAccounts().length ? 'flex' : 'none';
  $('acctNameInput').value = '';
  $('acctStartBtn').disabled = true;
  $('acctPerfToggle').checked = false;
  renderAvatarPicker($('acctAvatarGrid'), { style: draftStyle, seed: draftSeed }, (style, seed) => { draftStyle = style; draftSeed = seed; });
}

export function showAccountScreen() {
  const ns = $('nameScreen');
  ns.classList.remove('hidden');
  if (getAccounts().length) showPickerView();
  else showCreateView();
}

export function hideAccountScreen() {
  $('nameScreen').classList.add('hidden');
}

export function updatePlayerNameUI() {
  const acct = getActiveAccount();
  if (!acct) return;
  const nameEl = $('profileNameInput');
  if (nameEl) nameEl.value = acct.username;
  const avEl = $('profileAvatarBtn');
  if (avEl) avEl.innerHTML = avatarImgHTML({ style: acct.avatarStyle, seed: acct.avatarSeed });
}

export function initAccountScreen() {
  $('acctNameInput').addEventListener('input', function () {
    $('acctStartBtn').disabled = this.value.trim().length < 1;
  });

  $('acctShuffleBtn').addEventListener('click', () => {
    S.click();
    draftSeed = randomSeed();
    refreshAvatarPickerSeed($('acctAvatarGrid'), draftSeed);
  });

  $('acctCreateNewBtn').addEventListener('click', () => { S.click(); showCreateView(); });
  $('acctBackBtn').addEventListener('click', () => { S.click(); showPickerView(); });

  $('acctStartBtn').addEventListener('click', () => {
    const name = $('acctNameInput').value.trim();
    if (!name) return;
    S.click();
    createAccount(name, draftStyle, draftSeed);
    updateCfg({ perfMode: $('acctPerfToggle').checked });
    updatePlayerNameUI();
    hideAccountScreen();
    setTimeout(openTutorial, 500);
  });

  $('acctNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !$('acctStartBtn').disabled) $('acctStartBtn').click();
  });
}
