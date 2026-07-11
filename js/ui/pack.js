// js/ui/pack.js
import { $, setBodyRar, wireCardTooltips, showCardTip, hideCardTip, posterImgHTML } from '../utils.js';
import { PACK_W, XP_R, RAR_COLOR, RAR_ICON } from '../config.js';
import { pushInv, incStat, saveAll, L, hasCard, getInv, nextCardSerial, getCfg, getPackType, addKnownTitles } from '../state.js';
import { addXP } from '../game.js';
import { cardSound, S } from '../audio.js';
import { getCandidates, fetchMovieDetails } from '../api.js';
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
  const packType = getPackType();
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
        const cand = await getCandidates(packType);
        if (!cand.length) break;
        addKnownTitles(cand, packType);
        for (const item of cand.sort(() => Math.random() - 0.5)) {
          if (!hasCard(item.id.toString(), rar, packType)) { movie = item; break; }
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
        media_type: movie.media_type || packType,
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
