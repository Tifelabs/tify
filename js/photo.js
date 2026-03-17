'use strict';

const STATE = {
  idx: -1, items: [], allItems: [],
  cat: 'all', layout: 'masonry', open: false,
};
const DOM = {};
const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* Cursor */
const initCursor = () => {
  const cursor = qs('#cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  }, { passive: true });
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
  const hoverEls = 'a, button, .gitem, .lb-thumb, .ftab, .lbtn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) cursor.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) cursor.classList.remove('hover');
  });
};

/* Intersection reveal */
const revealItems = () => {
  if (!('IntersectionObserver' in window)) {
    qsa('.gitem:not(.hidden)').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('visible'), i * 40);
      obs.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
  qsa('.gitem:not(.hidden)').forEach(el => obs.observe(el));
};

/* Filter */
const initFilter = () => {
  STATE.allItems = qsa('.gitem');
  qsa('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (cat === STATE.cat) return;
      STATE.cat = cat;
      qsa('.ftab').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      const grid = qs('#gallery-grid');
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(8px)';
      grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        STATE.allItems.forEach(item => {
          const show = cat === 'all' || item.dataset.cat === cat;
          item.classList.toggle('hidden', !show);
          if (show) item.classList.remove('visible');
        });
        STATE.items = STATE.allItems.filter(i => !i.classList.contains('hidden'));
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
        setTimeout(revealItems, 20);
      }, 260);
    });
  });
  STATE.items = STATE.allItems;
};

/* Layout switch */
const initLayout = () => {
  const grid = qs('#gallery-grid');
  const btnM = qs('#btn-masonry');
  const btnG = qs('#btn-grid');
  if (!grid || !btnM || !btnG) return;
  const setLayout = (l) => {
    STATE.layout = l;
    grid.className = `gallery-grid ${l}`;
    btnM.classList.toggle('active', l === 'masonry');
    btnG.classList.toggle('active', l === 'grid');
    qsa('.gitem:not(.hidden)').forEach(el => el.classList.remove('visible'));
    setTimeout(revealItems, 50);
  };
  btnM.addEventListener('click', () => setLayout('masonry'));
  btnG.addEventListener('click', () => setLayout('grid'));
};

/* Lightbox */
const initLightbox = () => {
  DOM.lb      = qs('#lightbox');
  DOM.lbImg   = qs('#lb-img');
  DOM.lbTitle = qs('#lb-title');
  DOM.lbYear  = qs('#lb-year');
  DOM.lbRes   = qs('#lb-res');
  DOM.lbCount = qs('#lb-count');
  DOM.lbClose = qs('#lb-close');
  DOM.lbPrev  = qs('#lb-prev');
  DOM.lbNext  = qs('#lb-next');
  DOM.lbSpin  = qs('#lb-spinner');
  DOM.lbStrip = qs('#lb-filmstrip-inner');
  if (!DOM.lb) return;

  document.addEventListener('click', e => {
    const item = e.target.closest('.gitem');
    if (!item || item.classList.contains('hidden')) return;
    const vis = STATE.allItems.filter(el => !el.classList.contains('hidden'));
    const idx = vis.indexOf(item);
    if (idx !== -1) openLightbox(idx, vis);
  });

  document.addEventListener('keydown', e => {
    if (!STATE.open) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  DOM.lbClose.addEventListener('click', closeLightbox);
  DOM.lbPrev.addEventListener('click',  () => navigate(-1));
  DOM.lbNext.addEventListener('click',  () => navigate(1));
  qs('.lb-bg')?.addEventListener('click', closeLightbox);
  DOM.lbImg.addEventListener('contextmenu', e => e.preventDefault());
  DOM.lbImg.addEventListener('dragstart',   e => e.preventDefault());

  let tx = 0, tt = 0;
  DOM.lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; tt = Date.now(); }, { passive: true });
  DOM.lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50 && Date.now() - tt < 400) navigate(dx > 0 ? -1 : 1);
  }, { passive: true });
};

const buildFilmstrip = (items, activeIdx) => {
  if (!DOM.lbStrip) return;
  DOM.lbStrip.innerHTML = '';
  items.forEach((item, i) => {
    const img   = item.querySelector('img');
    const thumb = document.createElement('div');
    thumb.className = 'lb-thumb' + (i === activeIdx ? ' active' : '');
    thumb.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
    thumb.addEventListener('click', () => navigate(i - STATE.idx));
    DOM.lbStrip.appendChild(thumb);
  });
  scrollStrip(activeIdx);
};

const scrollStrip = (idx) => {
  const thumbs = qsa('.lb-thumb', DOM.lbStrip.parentElement);
  thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
  const thumb = thumbs[idx];
  if (!thumb) return;
  const strip  = DOM.lbStrip.parentElement;
  const offset = thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2;
  DOM.lbStrip.style.transform = `translateX(${-Math.max(0, offset)}px)`;
};

const openLightbox = (idx, items) => {
  STATE.items = items;
  STATE.open  = true;
  DOM.lb.classList.add('open');
  DOM.lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  buildFilmstrip(items, idx);
  showImage(idx);
};

const showImage = (idx) => {
  idx = clamp(idx, 0, STATE.items.length - 1);
  STATE.idx = idx;
  const item = STATE.items[idx];
  const img  = item.querySelector('img');
  DOM.lbTitle.textContent = item.dataset.title || '';
  DOM.lbYear.textContent  = item.dataset.year  || '—';
  DOM.lbRes.textContent   = item.dataset.res   || '';
  DOM.lbCount.textContent = `${idx + 1} / ${STATE.items.length}`;
  DOM.lbPrev.style.visibility = idx === 0                       ? 'hidden' : 'visible';
  DOM.lbNext.style.visibility = idx === STATE.items.length - 1 ? 'hidden' : 'visible';
  DOM.lbImg.classList.remove('loaded');
  DOM.lbSpin.classList.add('show');

  const hi  = img.src.replace('/Low_res/', '/High_res/');
  const tmp = new Image();
  const done = (src) => {
    if (STATE.idx !== idx) return;
    DOM.lbImg.src = src;
    DOM.lbImg.alt = img.alt;
    DOM.lbImg.classList.add('loaded');
    DOM.lbSpin.classList.remove('show');
    scrollStrip(idx);
    preload(idx);
  };
  tmp.onload  = () => done(hi);
  tmp.onerror = () => {
    const fb = new Image();
    fb.onload  = () => done(img.src);
    fb.onerror = () => DOM.lbSpin.classList.remove('show');
    fb.src = img.src;
  };
  tmp.src = hi;
};

const navigate = (delta) => {
  if (!STATE.open) return;
  const next = clamp(STATE.idx + delta, 0, STATE.items.length - 1);
  if (next === STATE.idx) return;
  const dir = delta > 0 ? -1 : 1;
  DOM.lbImg.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
  DOM.lbImg.style.opacity    = '0';
  DOM.lbImg.style.transform  = `translateX(${dir * -24}px)`;
  setTimeout(() => {
    DOM.lbImg.style.transition = 'none';
    DOM.lbImg.style.transform  = `translateX(${dir * 20}px)`;
    showImage(next);
    requestAnimationFrame(() => {
      DOM.lbImg.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      DOM.lbImg.style.opacity    = '';
      DOM.lbImg.style.transform  = 'translateX(0)';
    });
  }, 180);
};

const closeLightbox = () => {
  STATE.open = false;
  DOM.lb.classList.remove('open');
  DOM.lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { DOM.lbImg.src = ''; DOM.lbImg.classList.remove('loaded'); }, 400);
};

const preload = (idx) => {
  const go = window.requestIdleCallback
    ? cb => requestIdleCallback(cb, { timeout: 1000 })
    : cb => setTimeout(cb, 0);
  go(() => {
    [-1, 1, -2, 2].forEach(d => {
      const img = STATE.items[idx + d]?.querySelector('img');
      if (img) new Image().src = img.src.replace('/Low_res/', '/High_res/');
    });
  });
};
/* Guards */
const blockContextMenu = () => {
  document.addEventListener('contextmenu', e => {
    if (e.target.tagName === 'IMG' && (
      e.target.closest('.gallery-grid') || e.target.closest('#lightbox')
    )) e.preventDefault();
  });
};
/* Init */
const init = () => {
  // Decorate cards
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
  blockContextMenu();
  revealItems();

  // Focus trap inside lightbox
  document.addEventListener('keydown', e => {
    if (!STATE.open || e.key !== 'Tab') return;
    const els = qsa('button:not([disabled])', DOM.lb);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();