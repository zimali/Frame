// js/ui/pack.js
import { $ } from '../utils.js';
import { PACK_W, XP_R, QUOTES } from '../config.js';
import { pushInv, incStat, saveAll, L, hasCard, getInv } from '../state.js';
import { addXP } from '../game.js';
import { cardSound, S } from '../audio.js';
import { setBodyRar, cardHTML } from '../utils.js';
import { getCandidates } from '../api.js';
import { confetti, fireworks } from './notifications.js';
import { checkQuests, checkBadges } from '../game.js';

let lastQ = -1;
let opening = false;

export function showQuote() {
  let i;
  do { i = Math.floor(Math.random() * QUOTES.length); } while (i === lastQ && QUOTES.length > 1);
  lastQ = i;
  $('qText').textContent = `"${QUOTES[i].t}"`;
  $('qAuth').textContent = `— ${QUOTES[i].a}`;
  $('quoteWrap').classList.remove('hide');
}

export function hideQuote() {
  $('quoteWrap').classList.add('hide');
}

export function resetPack() {
  const box = $('packBox');
  const ps = $('packState');
  const rs = $('resultState');
  const hint = $('packHint');
  box.style.opacity = '1';
  box.style.transform = '';
  hint.style.opacity = '1';
  ps.style.display = 'flex';
  rs.style.display = 'none';
  $('resCard').innerHTML = '';
  setBodyRar(null);
  showQuote();
}

export async function openPack() {
  if (opening) return;
  opening = true;
  const box = $('packBox');
  const ps = $('packState');
  const rs = $('resultState');
  const hint = $('packHint');
  S.open();
  hideQuote();
  hint.style.opacity = '0';
  box.style.opacity = '0';
  box.style.transform = 'scale(.85) rotateY(90deg)';
  box.style.transition = 'opacity .35s,transform .35s';

  setTimeout(async () => {
    try {
      let movie = null;
      let rar = rndRar(PACK_W);
      let att = 0;
      while (!movie && att < 5) {
        const cand = await getCandidates();
        if (!cand.length) break;
        for (const item of cand.sort(() => Math.random() - 0.5)) {
          if (!hasCard(item.id.toString(), rar)) { movie = item; break; }
        }
        att++;
        if (att === 4) rar = rndRar(PACK_W);
      }
      if (!movie) { resetPack(); opening = false; return; }

      const card = {
        id: Date.now().toString(),
        movieId: movie.id.toString(),
        title: movie.title || movie.name || '—',
        poster_path: movie.poster_path,
        media_type: movie.media_type,
        rarity: rar,
        addedAt: Date.now(),
        origin: 'pack',
        favorite: false
      };
      pushInv(card);
      incStat('packs');
      saveAll();
      addXP(XP_R[rar], card);

      const rc = $('resRarity');
      rc.textContent = L().rn[rar];
      rc.style.color = { common: '#aaa', gold: '#fbbf24', rainbow: '#f87171', unique: '#ff4444', diamond: '#60a5fa' }[rar];
      $('resCard').innerHTML = cardHTML(card);
      ps.style.display = 'none';
      rs.style.display = 'flex';
      setBodyRar(rar);
      cardSound(rar);
      if (rar === 'diamond') { fireworks(10); confetti(); } else if (rar === 'rainbow' || rar === 'unique') confetti();
      checkQuests();
      checkBadges();
    } catch (e) { console.error(e); resetPack(); } finally { opening = false; }
  }, 400);
}

function rndRar(weights) {
  const r = Math.random() * 100;
  let cum = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r < cum) return ['common', 'gold', 'rainbow', 'unique', 'diamond'][i];
  }
  return 'common';
}

export function initPack() {
  showQuote();
  $('packBox').addEventListener('click', openPack);
  $('closeResBtn').addEventListener('click', () => { S.close(); resetPack(); });
}
