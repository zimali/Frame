// js/ui/tutorial.js
import { $ } from '../utils.js';
import { L, setTutDone } from '../state.js';
import { S } from '../audio.js';

let tutStep = 0;
const tutTotal = 10;

export function openTutorial() {
  tutStep = 0;
  showTutStep(0);
  $('tutModal').classList.add('on');
}

export function showTutStep(i) {
  tutStep = i;
  document.querySelectorAll('.tut-step').forEach((el, idx) => el.classList.toggle('on', idx === i));
  $('tutPrev').style.display = i === 0 ? 'none' : 'block';
  $('tutNext').textContent = i === tutTotal - 1 ? L().finish : L().next;
  const d = $('tutDots');
  d.innerHTML = '';
  for (let j = 0; j < tutTotal; j++) {
    const dot = document.createElement('div');
    dot.className = 'tut-dot' + (j === i ? ' on' : '');
    d.appendChild(dot);
  }
}

export function initTutorial() {
  $('tutNext').addEventListener('click', () => {
    S.click();
    if (tutStep < tutTotal - 1) showTutStep(tutStep + 1);
    else { $('tutModal').classList.remove('on'); setTutDone(); }
  });
  $('tutPrev').addEventListener('click', () => {
    S.click();
    if (tutStep > 0) showTutStep(tutStep - 1);
  });
  $('tutClose').addEventListener('click', () => {
    $('tutModal').classList.remove('on');
    setTutDone();
  });
  $('tutModal').addEventListener('click', e => {
    if (e.target === $('tutModal')) {
      $('tutModal').classList.remove('on');
      setTutDone();
    }
  });
}
