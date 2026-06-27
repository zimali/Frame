// js/ui/name.js
import { $ } from '../utils.js';
import { getPlayerName, setPlayerName, L, saveAll } from '../state.js';
import { openTutorial } from './tutorial.js';

export function initNameScreen() {
  const input = $('nameInput');
  const btn = $('nameStartBtn');

  input.addEventListener('input', function () {
    const v = this.value.trim();
    btn.disabled = v.length < 1;
  });

  btn.addEventListener('click', () => {
    const v = input.value.trim();
    if (!v) return;
    setPlayerName(v);
    updatePlayerNameUI();
    hideNameScreen();
    if (!localStorage.getItem('tutDone')) setTimeout(openTutorial, 500);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) btn.click();
  });
}

export function updatePlayerNameUI() {
  const el = $('playerNameDisplay');
  if (el) el.textContent = getPlayerName() || '—';
  const sn = $('settNameInput');
  if (sn) sn.value = getPlayerName();
}

export function showNameScreen() {
  const ns = $('nameScreen');
  ns.classList.remove('hidden');
  setTimeout(() => $('nameInput').focus(), 300);
}

export function hideNameScreen() {
  $('nameScreen').classList.add('hidden');
}

// Open name edit from progress tab
$('openNameEditBtn')?.addEventListener('click', () => {
  // handled in main via settings modal
});
