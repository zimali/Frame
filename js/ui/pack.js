// js/ui/pack.js
import { $, setBodyRar, wireCardTooltips, showCardTip, hideCardTip, posterImgHTML, getPosterUrl } from '../utils.js';
import { PACK_W, XP_R, RAR_COLOR, RAR_ICON, RARS } from '../config.js';
import { pushInv, incStat, saveAll, L, hasCard, nextCardSerial, getCfg } from '../state.js';
import { addXP } from '../game.js';
import { cardSound, S } from '../audio.js';
import { getCandidates, fetchMovieDetails } from '../api.js';
import { confetti, fireworks } from './notifications.js';
import { checkQuests, checkBadges } from '../game.js';

let opening = false;
let resultSpinning = false;

const CARD_W = 96;
const GAP = 12;
const STEP = CARD_W + GAP;
const TOTAL_CARDS = 26;
const WIN_INDEX = 20;

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
  $('carViewport').style.display = 'none';
  $('carTrack').innerHTML = '';
  $('resFlipper').classList.remove('flipped', 'spin');
  resultSpinning = false;
  setBodyRar(null);
}

function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

// Runs the "gacha roll" carousel: a strip of cards (filler + the real winning card)
// scrolls past and decelerates to a stop with the winning card centered. Whichever
// card is nearest the center is scaled up in real time as the strip moves.
function runCarouselRoll(winningCard, fillerPool) {
  const viewport = $('carViewport');
  const track = $('carTrack');
  viewport.style.display = 'block';
  $('resCard').style.display = 'none';

  let html = '';
  for (let i = 0; i < TOTAL_CARDS; i++) {
    if (i === WIN_INDEX) {
      html += `<div class="car-card rarity-${winningCard.rarity}" data-win="1">${posterImgHTML(winningCard)}</div>`;
      continue;
    }
    const filler = fillerPool.length ? fillerPool[Math.floor(Math.random() * fillerPool.length)] : null;
    const r = RARS[Math.floor(Math.random() * 3)]; // filler cards skew common/gold/rainbow for visual variety
    html += `<div class="car-card rarity-${r}">${filler ? posterImgHTML({ poster_path: filler.poster_path, title: filler.title }) : ''}</div>`;
  }
  track.innerHTML = html;

  const viewportW = viewport.clientWidth;
  const centerX = viewportW / 2;
  const finalX = -(WIN_INDEX * STEP + CARD_W / 2 - centerX);
  const jitter = (Math.random() - 0.5) * (CARD_W * 0.25);
  const targetX = finalX + jitter;
  const startX = 20;
  const duration = 3000;

  return new Promise(resolve => {
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = easeOutQuint(t);
      const x = startX + (targetX - startX) * eased;
      track.style.transform = `translateX(${x}px)`;

      for (let i = 0; i < track.children.length; i++) {
        const cardCenterX = i * STEP + CARD_W / 2 + x;
        const dist = Math.abs(cardCenterX - centerX);
        const scale = Math.max(0.76, 1.22 - dist / 190);
        const el = track.children[i];
        el.style.transform = `scale(${scale})`;
        el.style.opacity = Math.max(0.35, 1 - dist / 420);
        el.style.zIndex = String(Math.round(100 - dist));
      }

      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
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
      let lastCandidates = [];
      while (!movie && att < 5) {
        const cand = await getCandidates();
        lastCandidates = cand;
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
        media_type: movie.media_type || 'movie',
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

      const perfMode = getCfg().perfMode;
      if (!perfMode) {
        await runCarouselRoll(card, lastCandidates);
      }
      $('carViewport').style.display = 'none';

      const resCardEl = $('resCard');
      resCardEl.style.display = 'flex';

      const rarIcon = RAR_ICON[rar] ? `<i class="fas ${RAR_ICON[rar]}"></i> ` : '';
      $('resFront').className = `pf rarity-${rar}`;
      $('resBack').className = `pb rarity-${rar}`;
      $('resFrontIn').innerHTML = posterImgHTML(card);
      const idTxt = '#' + String(card.serial).padStart(6, '0');
      $('resBackIn').innerHTML = `<h3 style="margin-bottom:4px">${card.title}</h3>
        <div class="rl" style="color:${RAR_COLOR[rar] || '#aaa'};margin-bottom:6px">${rarIcon}${L().rn[rar]}</div>
        <div id="resCardMeta" class="card-meta-row"></div>
        <div class="card-id-tag">${L().cardIdLbl} ${idTxt}</div>`;

      fetchMovieDetails(card.media_type, card.movieId).then(d => {
        const meta = $('resCardMeta');
        if (meta && d) {
          const bits = [];
          if (d.released) bits.push(`<span class="meta-chip"><i class="fas fa-calendar"></i> ${d.released}</span>`);
          if (d.rating) bits.push(`<span class="meta-chip"><i class="fas fa-star"></i> ${d.rating}</span>`);
          if (d.genres && d.genres.length) d.genres.slice(0, 2).forEach(g => bits.push(`<span class="meta-chip">${g}</span>`));
          meta.innerHTML = bits.join('');
        }
      });

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
      fw.classList.toggle('auto-tilt', !!getCfg().autoTiltOn && !perfMode);
      flipper.onclick = () => { if (resultSpinning) return; flipper.classList.toggle('flipped'); };

      if (rar === 'diamond') { fireworks(perfMode ? 4 : 10); confetti(); } else if (rar === 'rainbow' || rar === 'unique') confetti();
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
  $('packBox').addEventListener('click', openPack);
  $('closeResBtn').addEventListener('click', () => { S.close(); resetPack(); });
}
