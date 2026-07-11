// js/ui/preview.js
import { $, cardHTML, wireCardTooltips, posterImgHTML } from '../utils.js';
import { SELL_V, RAR_COLOR, RAR_ICON } from '../config.js';
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
let viewOnlyMode = false;

export function showPreview(card, opts = {}) {
  if (!card) return;
  prevCard = card;
  spinning = false;
  scale = 1;
  viewOnlyMode = !!opts.viewOnly;

  const fi = $('pFrontIn'); // cover face — image only, edge to edge
  const bi = $('pBackIn');  // info face — title, rarity, description
  $('pFront').className = `pf rarity-${card.rarity || 'common'}`;
  $('pBack').className = `pb rarity-${card.rarity || 'common'}`;

  const idTxt = card.serial ? '#' + String(card.serial).padStart(6, '0') : '';
  const rarIcon = card.rarity && RAR_ICON[card.rarity] ? `<i class="fas ${RAR_ICON[card.rarity]}"></i> ` : '';
  const rarLine = card.rarity
    ? `<div class="rl" style="color:${RAR_COLOR[card.rarity] || '#aaa'};margin-bottom:6px">${rarIcon}${L().rn[card.rarity]}</div>`
    : '';
  fi.innerHTML = posterImgHTML(card);
  bi.innerHTML = `<h3 style="margin-bottom:4px">${card.title}</h3>
    ${rarLine}
    <div id="cardMeta" class="card-meta-row"></div>
    <p id="cardOv" style="color:#aaa;font-size:.7rem;line-height:1.5">...</p>
    ${idTxt ? `<div class="card-id-tag">${L().cardIdLbl} ${idTxt}</div>` : ''}`;

  $('pFavBtn').style.display = viewOnlyMode ? 'none' : '';
  $('pSellBtn').style.display = viewOnlyMode ? 'none' : '';

  fetchMovieDetails(card.media_type, card.movieId).then(d => {
    const el = $('cardOv');
    if (el) el.textContent = d?.overview || '—';
    const meta = $('cardMeta');
    if (meta && d) {
      const bits = [];
      if (d.released) bits.push(`<span class="meta-chip"><i class="fas fa-calendar"></i> ${d.released}</span>`);
      if (d.rating) bits.push(`<span class="meta-chip"><i class="fas fa-star"></i> ${d.rating}</span>`);
      if (d.genres && d.genres.length) d.genres.slice(0, 2).forEach(g => bits.push(`<span class="meta-chip">${g}</span>`));
      meta.innerHTML = bits.join('');
    }
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
  clampScaleSliderMax();

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
  fw.style.setProperty('--card-scale', scale);

  $('prevOv').classList.add('on');
}

function clampScaleSliderMax() {
  const ov = $('prevOv');
  const fw = $('flipWrap');
  const bar = document.querySelector('.preview-bar');
  const slider = $('scaleSlider');
  if (!ov || !fw || !slider) return;
  const prevTransform = fw.style.transform;
  fw.style.transform = 'scale(1)'; // measure a clean baseline, independent of any prior card's zoom
  const barH = bar ? bar.offsetHeight + 24 : 100;
  const availableH = ov.clientHeight - barH - 40; // top/bottom breathing room
  const baseH = fw.getBoundingClientRect().height || fw.offsetHeight;
  fw.style.transform = prevTransform;
  if (!baseH || !availableH) return;
  const safeMax = Math.max(1, Math.min(1.5, availableH / baseH));
  slider.max = safeMax.toFixed(2);
  if (parseFloat(slider.value) > safeMax) {
    slider.value = safeMax.toFixed(2);
    scale = safeMax;
    fw.style.setProperty('--card-scale', scale);
    if (!autoTilting) fw.style.transform = `scale(${scale})`;
  }
}

function applyAutoTilt() {
  const fw = $('flipWrap');
  if (!fw) return;
  fw.style.setProperty('--card-scale', scale);
  if (autoTilting) {
    fw.classList.add('auto-tilt');
    fw.style.transform = '';
  } else {
    fw.classList.remove('auto-tilt');
    fw.style.transform = `scale(${scale})`;
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

  window.addEventListener('resize', () => {
    if ($('prevOv').classList.contains('on')) clampScaleSliderMax();
  });

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
    if (!fw) return;
    fw.style.setProperty('--card-scale', scale);
    if (!autoTilting) fw.style.transform = `scale(${scale})`;
  });
}
