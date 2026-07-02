// js/ui/name.js
import { $ } from '../utils.js';
import { getPlayerName, setPlayerName, getPlayerAvatar, setPlayerAvatar, L, saveAll } from '../state.js';
import { openTutorial } from './tutorial.js';
import { AVATARS } from '../config.js';
import { S } from '../audio.js';

let regAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

function renderAvatarRow(container, current, onPick) {
  if (!container) return;
  container.innerHTML = AVATARS.map(a =>
    `<button type="button" class="avatar-opt${a === current ? ' on' : ''}" data-a="${a}">${a}</button>`
  ).join('');
  container.querySelectorAll('.avatar-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      container.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      onPick(btn.dataset.a);
    });
  });
}

export function initNameScreen() {
  const input = $('nameInput');
  const btn = $('nameStartBtn');

  renderAvatarRow($('avatarPickRow'), regAvatar, a => { regAvatar = a; });

  input.addEventListener('input', function () {
    const v = this.value.trim();
    btn.disabled = v.length < 1;
  });

  btn.addEventListener('click', () => {
    const v = input.value.trim();
    if (!v) return;
    setPlayerName(v);
    setPlayerAvatar(regAvatar);
    updatePlayerNameUI();
    hideNameScreen();
    if (!localStorage.getItem('tutDone')) setTimeout(openTutorial, 500);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) btn.click();
  });
}

export function initSettingsAvatarPicker() {
  const row = $('settAvatarRow');
  if (!row) return;
  const current = getPlayerAvatar() || regAvatar;
  renderAvatarRow(row, current, a => { setPlayerAvatar(a); updatePlayerNameUI(); });
}

export function updatePlayerNameUI() {
  const el = $('playerNameDisplay');
  if (el) el.textContent = getPlayerName() || '—';
  const sn = $('settNameInput');
  if (sn) sn.value = getPlayerName();
  const av = $('playerAvatarDisplay');
  if (av) av.textContent = getPlayerAvatar() || '👤';
}

export function showNameScreen() {
  const ns = $('nameScreen');
  ns.classList.remove('hidden');
  setTimeout(() => $('nameInput').focus(), 300);
}

export function hideNameScreen() {
  $('nameScreen').classList.add('hidden');
}
