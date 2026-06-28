// js/ui/notifications.js
import { $ } from '../utils.js';
import { S } from '../audio.js';
import { getCfg } from '../state.js';

const ptcl = document.getElementById('ptcl');

export function notify(html, type = '') {
  S.notif();
  const el = document.createElement('div');
  el.className = 'notif ' + type;
  el.innerHTML = html;
  document.getElementById('notifStack').appendChild(el);
  setTimeout(() => el.style.opacity = '0', 2700);
  setTimeout(() => el.remove(), 3100);
}

export function confetti() {
  const colors = ['#fbbf24', '#ff4444', '#60a5fa', '#4ade80', '#c084fc', '#f87171', '#fff', '#ff8c00'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'cp';
    const s = `${Math.random() * 7 + 3}px`;
    p.style.cssText =
      `left:${Math.random() * 100}%;top:-12px;width:${s};height:${s};background:${colors[Math.floor(Math.random() * colors.length)]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation-duration:${1.4 + Math.random() * 1.4}s;`;
    ptcl.appendChild(p);
    setTimeout(() => p.remove(), 3100);
  }
}

export function fireworks(n = 4) {
  const cfg = getCfg();
  if (!cfg.fw) return;
  const colors = ['#fbbf24', '#ff4444', '#60a5fa', '#4ade80', '#c084fc', '#f87171', '#fff'];
  for (let f = 0; f < n; f++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.style.cssText = `position:absolute;left:${15 + Math.random() * 70}%;top:${8 + Math.random() * 55}%;`;
      ptcl.appendChild(fw);
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        p.className = 'fwp';
        const a = (i / 16) * Math.PI * 2;
        const d = 45 + Math.random() * 50;
        p.style.cssText =
          `width:5px;height:5px;background:${colors[i % colors.length]};--tx:${Math.cos(a) * d}px;--ty:${Math.sin(a) * d}px;animation-duration:${0.6 + Math.random() * 0.4}s;`;
        fw.appendChild(p);
      }
      setTimeout(() => fw.remove(), 1200);
    }, f * 200);
  }
}
