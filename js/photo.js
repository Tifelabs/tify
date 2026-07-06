'use strict';

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

let idx = -1, items = [], allItems = [], cat = 'all', open = false, layoutMode = 'justify';

/* DOM Refs */
let lb, lbImg, lbTitle, lbYear, lbRes, lbCount, lbPrev, lbNext, lbSpin, lbStrip;

/* Cursor */
function initCursor() {
  const cursor = qs('#cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  }, { passive: true });
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
  const hoverSel = 'a,button,.gitem,.lb-thumb,.ftab,.lbtn';
  document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) cursor.classList.add('hover'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(hoverSel)) cursor.classList.remove('hover'); });
}

/* Filter */
function initFilter() {
  allItems = qsa('.gitem');
  items = allItems;
  const grid = qs('#gallery-grid');

  qsa('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.cat;
      if (next === cat) return;
      cat = next;

      qsa('.ftab').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });

      allItems.forEach(el => {
        const show = cat === 'all' || el.dataset.cat === cat;
        el.classList.toggle('hidden', !show);
      });
      items = allItems.filter(el => !el.classList.contains('hidden'));
    });
  });
}

/* ── Layout ── */
function initLayout() {
  const grid = qs('#gallery-grid');
  const btnM = qs('#btn-masonry');
  const btnG = qs('#btn-grid');
  if (!grid || !btnM || !btnG) return;

  function setLayout(l) {
    grid.className = `gallery-grid ${l}`;
    layoutMode = l;
    btnM.classList.toggle('active', l === 'masonry');
    btnG.classList.toggle('active', l === 'justify');
  }
  btnM.addEventListener('click', () => setLayout('masonry'));
  btnG.addEventListener('click', () => setLayout('justify'));
}

/* ── Scroll lock (position:fixed trick — plain overflow:hidden still lets iOS Safari rubber-band the page behind a fixed modal) ── */
let lockedScrollY = 0;
function lockScroll() {
  lockedScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}
function unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lockedScrollY);
}

/* ── Lightbox ── */
const ZOOM_MAX = 3.2, ZOOM_TAP = 2.4;
let zoom = { scale: 1, x: 0, y: 0 };
let pointers = new Map();
let gesture = null; // null | 'swipe' | 'dismiss' | 'lock' | 'pan' | 'pinch'
let startX = 0, startY = 0, startTime = 0;
let panStartX = 0, panStartY = 0;
let pinchStartDist = 0, pinchStartScale = 1;
let lastTap = { time: 0, x: 0, y: 0 };
let chromeHidden = false;

function initLightbox() {
  lb      = qs('#lightbox');
  if (!lb) return;
  lbImg   = qs('#lb-img');
  lbTitle = qs('#lb-title');
  lbYear  = qs('#lb-year');
  lbRes   = qs('#lb-res');
  lbCount = qs('#lb-count');
  lbPrev  = qs('#lb-prev');
  lbNext  = qs('#lb-next');
  lbSpin  = qs('#lb-spinner');
  lbStrip = qs('#lb-filmstrip-inner');

  document.addEventListener('click', e => {
    const item = e.target.closest('.gitem');
    if (!item || item.classList.contains('hidden')) return;
    const vis = allItems.filter(el => !el.classList.contains('hidden'));
    const i = vis.indexOf(item);
    if (i !== -1) openLightbox(i, vis);
  });

  document.addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'Tab') {
      const btns = qsa('button:not([disabled])', lb);
      if (!btns.length) return;
      const first = btns[0], last = btns[btns.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  qs('#lb-close').addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));
  qs('.lb-bg')?.addEventListener('click', closeLightbox);
  lbImg.addEventListener('contextmenu', e => e.preventDefault());
  lbImg.addEventListener('dragstart',   e => e.preventDefault());

  initGestures(qs('.lb-img-wrap'));
}

/* One pointer-event based gesture system covers touch AND mouse:
   - drag horizontally to change photo (rubber-bands at the first/last image)
   - drag down to dismiss (image follows the finger, background fades)
   - pinch, or double-tap, to zoom in on a point; drag to pan while zoomed
   - a plain tap toggles an immersive "chrome hidden" view                */
function initGestures(wrap) {
  if (!wrap) return;

  wrap.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    wrap.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lbImg.classList.add('no-transition');

    if (pointers.size === 2) {
      gesture = 'pinch';
      const [a, b] = [...pointers.values()];
      pinchStartDist  = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      pinchStartScale = zoom.scale;
    } else if (pointers.size === 1) {
      startX = e.clientX; startY = e.clientY; startTime = Date.now();
      panStartX = zoom.x; panStartY = zoom.y;
      gesture = zoom.scale > 1.02 ? 'pan' : null; // direction decided on first real move
    }
  });

  wrap.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gesture === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      zoom.scale = clamp(pinchStartScale * (dist / pinchStartDist), 1, ZOOM_MAX);
      clampPan();
      applyZoom();
      return;
    }
    if (pointers.size !== 1) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;

    if (gesture === 'pan') {
      zoom.x = panStartX + dx;
      zoom.y = panStartY + dy;
      clampPan();
      applyZoom();
      return;
    }
    if (gesture === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      gesture = Math.abs(dx) > Math.abs(dy) ? 'swipe' : (dy > 0 ? 'dismiss' : 'lock');
    }
    if (gesture === 'swipe') {
      const atEdge = (idx === 0 && dx > 0) || (idx === items.length - 1 && dx < 0);
      lbImg.style.transform = `translateX(${dx * (atEdge ? 0.35 : 1)}px)`;
    } else if (gesture === 'dismiss') {
      const d = clamp(dy, 0, 400);
      lbImg.style.transform = `translateY(${d}px) scale(${clamp(1 - d / 900, 0.85, 1)})`;
      qs('.lb-bg').style.opacity = String(clamp(1 - d / 300, 0.15, 1));
    }
  });

  const endGesture = e => {
    pointers.delete(e.pointerId);
    if (pointers.size > 0) { gesture = pointers.size === 2 ? 'pinch' : null; return; }

    lbImg.classList.remove('no-transition');
    const dt = Math.max(Date.now() - startTime, 1);

    if (gesture === 'swipe') {
      const dx = e.clientX - startX;
      const velocity = Math.abs(dx) / dt;
      lbImg.style.transform = '';
      if (Math.abs(dx) > 70 || velocity > 0.5) navigate(dx < 0 ? 1 : -1);
    } else if (gesture === 'dismiss') {
      const dy = e.clientY - startY;
      const velocity = dy / dt;
      if (dy > 110 || velocity > 0.6) {
        closeLightbox();
      } else {
        lbImg.style.transform = '';
        qs('.lb-bg').style.opacity = '';
      }
    } else if (gesture === 'pinch') {
      if (zoom.scale <= 1.02) resetZoom(); else { clampPan(); applyZoom(); }
    } else if (gesture === null || gesture === 'lock') {
      if (Math.abs(e.clientX - startX) < 10 && Math.abs(e.clientY - startY) < 10) {
        handleTap(e.clientX, e.clientY);
      }
    }
    gesture = null;
  };
  wrap.addEventListener('pointerup', endGesture);
  wrap.addEventListener('pointercancel', endGesture);
}

function handleTap(x, y) {
  const now = Date.now();
  const isDouble = now - lastTap.time < 320 && Math.hypot(x - lastTap.x, y - lastTap.y) < 40;
  lastTap = { time: now, x, y };

  if (!isDouble) { toggleChrome(); return; }
  lastTap.time = 0; // consume the tap pair so a third tap doesn't chain into another double
  if (zoom.scale > 1.02) {
    resetZoom();
  } else {
    const rect = lbImg.getBoundingClientRect();
    zoom.scale = ZOOM_TAP;
    zoom.x = (rect.left + rect.width  / 2 - x) * (ZOOM_TAP - 1);
    zoom.y = (rect.top  + rect.height / 2 - y) * (ZOOM_TAP - 1);
    clampPan();
    applyZoom();
  }
}

function toggleChrome() {
  chromeHidden = !chromeHidden;
  lb.classList.toggle('chrome-hidden', chromeHidden);
}

function clampPan() {
  const bx = Math.max(0, (lbImg.offsetWidth  * (zoom.scale - 1)) / 2);
  const by = Math.max(0, (lbImg.offsetHeight * (zoom.scale - 1)) / 2);
  zoom.x = clamp(zoom.x, -bx, bx);
  zoom.y = clamp(zoom.y, -by, by);
}

function applyZoom() {
  lbImg.style.transform = `translate(${zoom.x}px,${zoom.y}px) scale(${zoom.scale})`;
  lbImg.classList.toggle('zoomed', zoom.scale > 1.02);
}

function resetZoom() {
  zoom = { scale: 1, x: 0, y: 0 };
  lbImg.style.transform = '';
  lbImg.classList.remove('zoomed');
}

function buildFilmstrip(activeIdx) {
  if (!lbStrip) return;
  lbStrip.innerHTML = '';
  items.forEach((item, i) => {
    const src = item.querySelector('img');
    const thumb = document.createElement('div');
    thumb.className = 'lb-thumb' + (i === activeIdx ? ' active' : '');
    thumb.innerHTML = `<img src="${src.src}" alt="${src.alt}" loading="lazy">`;
    thumb.addEventListener('click', () => navigate(i - idx));
    lbStrip.appendChild(thumb);
  });
  scrollStrip(activeIdx);
}

function scrollStrip(i) {
  const thumbs = qsa('.lb-thumb', lbStrip);
  thumbs.forEach((t, j) => t.classList.toggle('active', j === i));
  thumbs[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function openLightbox(i, vis) {
  items = vis;
  open  = true;
  chromeHidden = false;
  lb.classList.remove('chrome-hidden');
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  lockScroll();
  buildFilmstrip(i);
  showImage(i);
}

function showImage(i) {
  i = clamp(i, 0, items.length - 1);
  idx = i;
  resetZoom();
  const item = items[i];
  const src  = item.querySelector('img');
  lbTitle.textContent = item.dataset.title || '';
  lbYear.textContent  = item.dataset.year  || '—';
  lbRes.textContent   = item.dataset.res   || '';
  lbCount.textContent = `${i + 1} / ${items.length}`;
  lbPrev.style.visibility = i === 0                  ? 'hidden' : 'visible';
  lbNext.style.visibility = i === items.length - 1   ? 'hidden' : 'visible';
  lbImg.classList.remove('loaded');
  lbSpin.classList.add('show');

  // Low_res thumbs are .webp, High_res originals are .jpg
  const hi  = src.src.replace('/low_res/', '/high_res/').replace(/\.webp$/i, '.jpg');
  const tmp = new Image();
  const done = (url) => {
    if (idx !== i) return;
    lbImg.src = url;
    lbImg.alt = src.alt;
    lbImg.classList.add('loaded');
    lbSpin.classList.remove('show');
    scrollStrip(i);
    preload(i);
  };
  tmp.onload  = () => done(hi);
  tmp.onerror = () => {
    const fb = new Image();
    fb.onload  = () => done(src.src);
    fb.onerror = () => lbSpin.classList.remove('show');
    fb.src = src.src;
  };
  tmp.src = hi;
}

function navigate(delta) {
  if (!open) return;
  const next = clamp(idx + delta, 0, items.length - 1);
  if (next === idx) return;
  showImage(next);
}

function closeLightbox() {
  open = false;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  unlockScroll();
  const bg = qs('.lb-bg'); if (bg) bg.style.opacity = '';
  resetZoom();
  setTimeout(() => { lbImg.src = ''; lbImg.classList.remove('loaded'); }, 400);
}

function preload(i) {
  const go = window.requestIdleCallback
    ? cb => requestIdleCallback(cb, { timeout: 1000 })
    : cb => setTimeout(cb, 0);
  go(() => {
    [-1, 1, -2, 2].forEach(d => {
      const img = items[i + d]?.querySelector('img');
      // Low_res thumbs are .webp, High_res originals are .jpg
      if (img) new Image().src = img.src.replace('/low_res/', '/high_res/').replace(/\.webp$/i, '.jpg');
    });
  });
}

/* Init */
function init() {
  qsa('.gitem').forEach((item, i) => {
    const badge = document.createElement('span');
    badge.className = 'gi-index';
    badge.textContent = String(i + 1).padStart(2, '0');
    item.appendChild(badge);

    const res = item.dataset.res;
    if (res) {
      const cap = item.querySelector('figcaption');
      if (cap) {
        const el = document.createElement('span');
        el.className = 'gi-res';
        el.textContent = res + ' px';
        cap.appendChild(el);
      }
    }
  });

  initCursor();
  initFilter();
  initLayout();
  initLightbox();

  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' && (e.target.closest('.gallery-grid') || e.target.closest('#lightbox')))
      e.preventDefault();
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();