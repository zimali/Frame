// js/ui/avatarpicker.js
// Shared DiceBear avatar-style picker, used both at account creation and later
// when changing your avatar from the Profile tab.
import { $, avatarImgHTML } from '../utils.js';
import { DICEBEAR_STYLES } from '../config.js';
import { S } from '../audio.js';

export function renderAvatarPicker(container, current, onPick) {
  const seed = current?.seed || 'preview';
  container.innerHTML = DICEBEAR_STYLES.map(style => `
    <button type="button" class="avatar-style-opt${current && current.style === style ? ' on' : ''}" data-style="${style}">
      ${avatarImgHTML({ style, seed })}
    </button>
  `).join('');
  container.querySelectorAll('.avatar-style-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      S.click();
      container.querySelectorAll('.avatar-style-opt').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      onPick(btn.dataset.style, seed);
    });
  });
}

export function refreshAvatarPickerSeed(container, newSeed) {
  container.querySelectorAll('.avatar-style-opt img').forEach(img => {
    const style = img.closest('.avatar-style-opt').dataset.style;
    img.src = img.src.replace(/seed=[^&]*/, 'seed=' + encodeURIComponent(newSeed));
  });
}
