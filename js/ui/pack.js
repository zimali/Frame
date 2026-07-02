// js/ui/pack.js
import { $, setBodyRar, wireCardTooltips, showCardTip, hideCardTip } from '../utils.js';
import { PACK_W, XP_R, TMDB_IMG, RAR_COLOR } from '../config.js';
import { pushInv, incStat, saveAll, L, hasCard, getInv, nextCardSerial, getCfg } from '../state.js';
import { addXP } from '../game.js';
import { cardSound, S } from '../audio.js';
import { getCandidates } from '../api.js';
import { confetti, fireworks } from './notifications.js';
import { checkQuests, checkBadges } from '../game.js';

let opening = false;
let resultSpinning = false;

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
  $('resCard').style.display = 'none';
  $('resScrollMask').style.display = 'none';
  $('resScrollTrack').innerHTML = '';
  $('resFlipper').classList.remove('flipped', 'spin');
  resultSpinning = false;
  setBodyRar(null);
}

function buildScrollStrip() {
  // A quick blur of mixed rarity placeholder covers, for the "fast scroll" reveal feel.
  const track = $('resScrollTrack');
  const rars = ['common', 'gold', 'rainbow', 'unique', 'diamond'];
  let html = '';
  for (let i = 0; i < 18; i++) {
    const r = rars[Math.floor(Math.random() * rars.length)];
    html += `<div class="scroll-card rarity-${r}"><i class="fas fa-film"></i></div>`;
  }
  track.innerHTML = html;
}

export async function openPack() {
  if (opening) return;
  opening = true;
  const box = $('packBox');
  const ps = $('packState');
  const rs = $('resultState');
  const hint = $('packHint');
  S.open();
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
        serial: nextCardSerial(),
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
      rc.textContent = '';
      rc.style.color = RAR_COLOR[rar] || '#aaa';

      ps.style.display = 'none';
      rs.style.display = 'flex';
      setBodyRar(rar);

      // 1) Fast scroll-through animation
      const mask = $('resScrollMask');
      const track = $('resScrollTrack');
      buildScrollStrip();
      mask.style.display = 'block';
      $('resCard').style.display = 'none';
      track.style.transition = 'none';
      track.style.transform = 'translateY(0)';
      void track.offsetHeight;
      track.style.transition = 'transform .65s cubic-bezier(.12,.85,.18,1)';
      track.style.transform = `translateY(-${18 * 64 - 64}px)`;

      setTimeout(() => {
        // 2) Reveal the real card as a flip-card (cover-only front), settle into idle tilt
        mask.style.display = 'none';
        const resCardEl = $('resCard');
        resCardEl.style.display = 'flex';

        const poster = card.poster_path ? TMDB_IMG + card.poster_path :
          `https://via.placeholder.com/200x300/1a1a1a/fff?text=${encodeURIComponent(card.title.substring(0, 10))}`;
        $('resFront').className = `pf rarity-${rar}`;
        $('resBack').className = `pb rarity-${rar}`;
        $('resFrontIn').innerHTML = `<img src="${poster}" alt="${card.title}">`;
        const idTxt = '#' + String(card.serial).padStart(6, '0');
        $('resBackIn').innerHTML = `<h3 style="margin-bottom:4px">${card.title}</h3>
          <div class="rl" style="color:${RAR_COLOR[rar] || '#aaa'};margin-bottom:6px">${L().rn[rar]}</div>
          <div class="card-id-tag">${L().cardIdLbl} ${idTxt}</div>`;

        const flipper = $('resFlipper');
        flipper.classList.remove('flipped');
        resultSpinning = false;
        cardSound(rar);

        const tip = `${card.title} · ${L().rn[rar]} · ${idTxt}`;
        resCardEl.dataset.tip = tip;
        if (getCfg().tooltips) {
          resCardEl.addEventListener('mouseenter', () => showCardTip(resCardEl, tip));
          resCardEl.addEventListener('mouseleave', hideCardTip);
        }

        const fw = $('resFlipWrap');
        fw.classList.toggle('auto-tilt', !!getCfg().autoTiltOn);
        flipper.onclick = () => { if (resultSpinning) return; flipper.classList.toggle('flipped'); };

        if (rar === 'diamond') { fireworks(10); confetti(); } else if (rar === 'rainbow' || rar === 'unique') confetti();
        checkQuests();
        checkBadges();
      }, 680);
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
  $('packBox').addEventListener('click', openPack);
  $('closeResBtn').addEventListener('click', () => { S.close(); resetPack(); });
}
