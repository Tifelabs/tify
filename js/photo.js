'use strict';

const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

let idx = -1, items = [], allItems = [], cat = 'all', open = false;

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

/* Reveal */
function revealItems() {
  const visible = qsa('.gitem:not(.hidden)');
  if (!('IntersectionObserver' in window)) {
    visible.forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('visible'), i * 40);
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
  visible.forEach(el => obs.observe(el));
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

      grid.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease';
      setTimeout(() => {
        allItems.forEach(el => {
          const show = cat === 'all' || el.dataset.cat === cat;
          el.classList.toggle('hidden', !show);
          if (show) el.classList.remove('visible');
        });
        items = allItems.filter(el => !el.classList.contains('hidden'));
        grid.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity .25s ease,transform .25s ease';
        setTimeout(revealItems, 20);
      }, 260);
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
    btnM.classList.toggle('active', l === 'masonry');
    btnG.classList.toggle('active', l === 'grid');
    qsa('.gitem:not(.hidden)').forEach(el => el.classList.remove('visible'));
    setTimeout(revealItems, 50);
  }
  btnM.addEventListener('click', () => setLayout('masonry'));
  btnG.addEventListener('click', () => setLayout('grid'));
}

/* ── Lightbox ── */
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

  let tx = 0, tt = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; tt = Date.now(); }, { passive: true });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50 && Date.now() - tt < 400) navigate(dx > 0 ? -1 : 1);
  }, { passive: true });
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
  const thumbs = qsa('.lb-thumb', lbStrip.parentElement);
  thumbs.forEach((t, j) => t.classList.toggle('active', j === i));
  const thumb = thumbs[i];
  if (!thumb) return;
  const strip  = lbStrip.parentElement;
  const offset = thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
  lbStrip.style.transform = `translateX(${-Math.max(0, offset)}px)`;
}

function openLightbox(i, vis) {
  items = vis;
  open  = true;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  buildFilmstrip(i);
  showImage(i);
}

function showImage(i) {
  i = clamp(i, 0, items.length - 1);
  idx = i;
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

  const hi = src.src.replace('/Low_res/', '/High_res/').replace(/\.webp$/i, '.jpg')
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
  const dir = delta > 0 ? -1 : 1;
  lbImg.style.cssText = `transition:opacity .18s ease,transform .18s ease;opacity:0;transform:translateX(${dir * -24}px)`;
  setTimeout(() => {
    lbImg.style.cssText = `transition:none;transform:translateX(${dir * 20}px)`;
    showImage(next);
    requestAnimationFrame(() => {
      lbImg.style.cssText = 'transition:opacity .22s ease,transform .22s ease;opacity:1;transform:translateX(0)';
    });
  }, 180);
}

function closeLightbox() {
  open = false;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; lbImg.classList.remove('loaded'); }, 400);
}

function preload(i) {
  const go = window.requestIdleCallback
    ? cb => requestIdleCallback(cb, { timeout: 1000 })
    : cb => setTimeout(cb, 0);
  go(() => {
    [-1, 1, -2, 2].forEach(d => {
      const img = items[i + d]?.querySelector('img');
      if (img) new Image().src = img.src.replace('/Low_res/', '/High_res/').replace(/\.webp$/i, '.jpg');
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
  revealItems();

  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' && (e.target.closest('.gallery-grid') || e.target.closest('#lightbox')))
      e.preventDefault();
  });
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();