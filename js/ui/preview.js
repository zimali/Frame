// js/ui/preview.js
import { $, cardHTML, wireCardTooltips } from '../utils.js';
import { TMDB_IMG, SELL_V, RAR_COLOR } from '../config.js';
import { getInv, setInv, addCoins, incStat, saveAll, L, getCfg, updateCfg } from '../state.js';
import { S } from '../audio.js';
import { renderInventory } from './inventory.js';
import { fetchMovieDetails } from '../api.js';
import { checkQuests, checkBadges } from '../game.js';

let prevCard = null;
let spinning = false;
let autoTilting = false;
let scale = 1;
let autoFlipTimer = null;

export function showPreview(card) {
  if (!card) return;
  prevCard = card;
  spinning = false;
  scale = 1;

  const poster = card.poster_path ? TMDB_IMG + card.poster_path :
    `https://via.placeholder.com/200x300/1a1a1a/fff?text=${encodeURIComponent((card.title || '').substring(0, 10))}`;

  const fi = $('pFrontIn'); // cover face — image only, edge to edge
  const bi = $('pBackIn');  // info face — title, rarity, description
  $('pFront').className = `pf rarity-${card.rarity}`;
  $('pBack').className = `pb rarity-${card.rarity}`;

  const idTxt = card.serial ? '#' + String(card.serial).padStart(6, '0') : '';
  fi.innerHTML = `<img src="${poster}" alt="${card.title}">`;
  bi.innerHTML = `<h3 style="margin-bottom:4px">${card.title}</h3>
    <div class="rl" style="color:${RAR_COLOR[card.rarity] || '#aaa'};margin-bottom:6px">${L().rn[card.rarity]}</div>
    <p id="cardOv" style="color:#aaa;font-size:.7rem;line-height:1.5">...</p>
    ${idTxt ? `<div class="card-id-tag">${L().cardIdLbl} ${idTxt}</div>` : ''}`;

  fetchMovieDetails(card.media_type, card.movieId).then(d => {
    const el = $('cardOv');
    if (el) el.textContent = d?.overview || '—';
  });

  const fl = $('flipper');
  clearTimeout(autoFlipTimer);
  // Start resting on the info side, then auto-flip to reveal the cover.
  fl.classList.add('flipped');
  fl.classList.remove('spin');
  fl.style.transition = 'none';
  // Force layout so the "no transition" start state applies before we re-enable it
  void fl.offsetHeight;
  fl.style.transition = '';
  autoFlipTimer = setTimeout(() => { fl.classList.remove('flipped'); }, 160);

  fl.onclick = e => { if (spinning || e.target.classList.contains('pclose')) return; fl.classList.toggle('flipped'); };

  $('pSpinBtn').className = 'p-btn icon-only';
  $('pSpinBtn').innerHTML = `<i class="fas fa-rotate"></i>`;
  $('pFavBtn').innerHTML = card.favorite ?
    `<i class="fas fa-heart" style="color:#fbbf24"></i>` :
    `<i class="fas fa-heart"></i>`;
  $('pFavBtn').className = 'p-btn icon-only' + (card.favorite ? ' fav-on' : '');
  $('scaleSlider').value = 1;

  autoTilting = getCfg().autoTiltOn || false;
  syncAutoTiltBtn();
  applyAutoTilt();

  const fw = $('flipWrap');
  fw.onmousemove = null;
  fw.onmouseleave = null;
  fw.addEventListener('mousemove', e => {
    if (spinning || autoTilting) return;
    const r = fw.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    fw.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) scale(${scale})`;
  });
  fw.addEventListener('mouseleave', () => { if (!autoTilting) fw.style.transform = `scale(${scale})`; });

  $('prevOv').classList.add('on');
}

function applyAutoTilt() {
  const fw = $('flipWrap');
  if (!fw) return;
  if (autoTilting) {
    fw.classList.add('auto-tilt');
    fw.style.transform = `scale(${scale})`;
  } else {
    fw.classList.remove('auto-tilt');
  }
}

function syncAutoTiltBtn() {
  const btn = $('pTiltBtn');
  if (!btn) return;
  btn.className = 'p-btn icon-only' + (autoTilting ? ' spin-on' : '');
}

export function closePreview() {
  $('prevOv').classList.remove('on');
  clearTimeout(autoFlipTimer);
  prevCard = null;
  spinning = false;
  const fl = $('flipper');
  if (fl) fl.classList.remove('spin');
  S.close();
}

export function initPreview() {

  $('prevOv').addEventListener('click', e => { if (e.target === $('prevOv')) closePreview(); });
  $('pClose').addEventListener('click', closePreview);

  $('pSpinBtn').addEventListener('click', () => {
    const fl = $('flipper');
    if (!fl) return;
    spinning = !spinning;
    S.spin();
    if (spinning) {
      fl.classList.remove('flipped');
      fl.classList.add('spin');
      $('pSpinBtn').className = 'p-btn icon-only spin-on';
      $('pSpinBtn').innerHTML = `<i class="fas fa-rotate"></i>`;
    } else {
      fl.classList.remove('spin');
      $('pSpinBtn').className = 'p-btn icon-only';
      $('pSpinBtn').innerHTML = `<i class="fas fa-rotate"></i>`;
    }
  });

  const tiltBtn = $('pTiltBtn');
  if (tiltBtn) tiltBtn.addEventListener('click', () => {
    autoTilting = !autoTilting;
    updateCfg({ autoTiltOn: autoTilting });
    S.click();
    syncAutoTiltBtn();
    applyAutoTilt();
  });

  $('pFavBtn').addEventListener('click', () => {
    if (!prevCard) return;
    prevCard.favorite = !prevCard.favorite;
    S.fav();
    const inv = getInv();
    const idx = inv.findIndex(c => c.id === prevCard.id);
    if (idx >= 0) inv[idx] = prevCard;
    setInv(inv);
    saveAll();
    $('pFavBtn').innerHTML = prevCard.favorite ?
      `<i class="fas fa-heart" style="color:#fbbf24"></i>` :
      `<i class="fas fa-heart"></i>`;
    $('pFavBtn').className = 'p-btn icon-only' + (prevCard.favorite ? ' fav-on' : '');
    renderInventory($('searchInp').value.trim());
    checkQuests();
    checkBadges();
  });

  $('pSellBtn').addEventListener('click', () => {
    if (!prevCard) return;
    if (!confirm(L().sellConfirm(prevCard.title, SELL_V[prevCard.rarity]))) return;
    S.sell();
    addCoins(SELL_V[prevCard.rarity]);
    incStat('sells');
    const inv = getInv().filter(c => c.id !== prevCard.id);
    setInv(inv);
    saveAll();
    renderInventory();
    closePreview();
    checkQuests();
    checkBadges();
  });

  $('scaleSlider').addEventListener('input', function () {
    scale = parseFloat(this.value);
    const fw = $('flipWrap');
    if (fw) fw.style.transform = `scale(${scale})`;
  });
}
