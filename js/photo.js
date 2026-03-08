/* ======= TIFELABS ======= */
'use strict';

const CFG = Object.freeze({
  CACHE: 50,
  SWIPE: 60,
  TAP: 300,
  NAV_COOL: 150,
  FADE_IN: 400,
  FADE_NAV: 200,
  FADE_CLOSE: 250,
  FADE_CAT: 300
});

/* LRU CACHE */
class LRU {
  #n; #m;
  constructor(n) { this.#n = n; this.#m = new Map(); }
  get(k) {
    if (!this.#m.has(k)) return null;
    const v = this.#m.get(k);
    this.#m.delete(k);
    this.#m.set(k, v);
    return v;
  }
  set(k, v) {
    if (this.#m.has(k)) this.#m.delete(k);
    else if (this.#m.size >= this.#n) this.#m.delete(this.#m.keys().next().value);
    this.#m.set(k, v);
  }
  has(k) { return this.#m.has(k); }
}

/* State */
const $ = {
  cat: 'general',
  idx: -1,
  open: false,
  nav: false,
  lastNav: 0,
  dom: {},
  imgs: new Map(),
  imgIdx: new WeakMap(),
  touch: { x: 0, y: 0, t: 0, mx: 0 }
};

/* Image Loading */
const cache    = new LRU(CFG.CACHE);
const urlCache = new Map();
const promises = new Map();

const hiRes = (u) => {
  if (urlCache.has(u)) return urlCache.get(u);
  const h = u.replace('/Low_res/', '/High_res/');
  urlCache.set(u, h);
  return h;
};

const load = (s) => {
  if (cache.has(s)) return Promise.resolve();
  if (promises.has(s)) return promises.get(s);
  const p = new Promise((res, rej) => {
    const i = new Image();
    i.onload  = () => { cache.set(s, i); promises.delete(s); res(); };
    i.onerror = () => { promises.delete(s); rej(new Error(`Failed to load: ${s}`)); };
    i.src = s;
  });
  promises.set(s, p);
  return p;
};

/* Preloader */
// Priority queue: adjacent images first, then lookahead
const preload = (() => {
  let id;
  return (i) => {
    if (id) cancelIdleCallback(id);
    const schedule = window.requestIdleCallback
      ? (cb) => requestIdleCallback(cb, { timeout: 1000 })
      : (cb) => setTimeout(cb, 0);

    id = schedule(() => {
      const imgs = getImgs();
      // Sorted by proximity: [+1, -1, +2, -2, +3]
      [1, -1, 2, -2, 3].forEach(n => {
        const idx = i + n;
        if (idx >= 0 && idx < imgs.length) {
          load(hiRes(imgs[idx].src)).catch(() => load(imgs[idx].src).catch(() => {}));
        }
      });
    });
  };
})();

// ── Category image cache ──────────────────────────────────────────────────────
const cacheImgs = (c) => {
  if ($.imgs.has(c)) return $.imgs.get(c);
  const s = document.getElementById(`${c}-section`);
  if (!s) return [];
  const imgs = [...s.querySelectorAll('.photo img')];
  imgs.forEach((img, i) => $.imgIdx.set(img, i));
  $.imgs.set(c, imgs);
  return imgs;
};

const getImgs = () => cacheImgs($.cat);

// ── Category switch ───────────────────────────────────────────────────────────
const switchCat = (c, btn) => {
  if (c === $.cat) return;
  const sec = document.getElementById(`${c}-section`);
  if (!sec) return;

  const oldSec = document.querySelector('.photo-section.active');

  // Pure CSS-class-driven fade — no nested setTimeout/rAF thrash
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));

  const activate = () => {
    sec.classList.add('active');
    // Force reflow in a single read, then write
    void sec.offsetWidth;
    sec.classList.add('visible');
  };

  if (oldSec) {
    oldSec.classList.remove('visible');
    oldSec.addEventListener('transitionend', () => {
      oldSec.classList.remove('active');
      activate();
    }, { once: true });
  } else {
    activate();
  }

  $.cat = c;
  cacheImgs(c);
};

window.showCategory = (c, btn) => switchCat(c, btn);
/* Modal */
const show = (i) => {
  const imgs  = getImgs();
  const now   = Date.now();

  if ($.nav || i < 0 || i >= imgs.length || now - $.lastNav < CFG.NAV_COOL) return;

  $.lastNav = now;
  $.idx     = i;
  $.open    = true;

  const { mi, mc, mp, mn, m } = $.dom;
  const img = imgs[i];
  const h   = hiRes(img.src);

  // Batch DOM reads before writes
  const caption = img.closest('.photo')?.querySelector('h3')?.textContent ?? img.alt;
  const hasPrev = i > 0;
  const hasNext = i < imgs.length - 1;

  // Single write batch
  mi.style.opacity = '0';
  mi.src           = cache.has(h) ? h : img.src;
  mi.alt           = caption;
  mc.textContent   = caption;
  mp.style.display = hasPrev ? 'flex' : 'none';
  mn.style.display = hasNext ? 'flex' : 'none';

  if (!cache.has(h)) {
    load(h)
      .then(() => {
        if ($.idx === i && $.open) {
          mi.style.transition = `opacity ${CFG.FADE_IN}ms ease`;
          mi.src = h;
        }
      })
      .catch(() => {});
  }

  $.nav = true;

  requestAnimationFrame(() => {
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      mi.style.transition = `opacity ${CFG.FADE_IN}ms ease`;
      mi.style.opacity    = '1';
      mi.focus();
      $.nav = false;
      preload(i);
    });
  });
};

const nav = (d) => {
  if ($.nav) return;
  const n = $.idx + d;
  if (n < 0 || n >= getImgs().length) return;

  const { mi } = $.dom;
  mi.style.transition = `opacity ${CFG.FADE_NAV}ms ease`;
  mi.style.opacity    = '0';
  setTimeout(() => show(n), CFG.FADE_NAV);
};

const close = () => {
  const { m } = $.dom;
  m.style.transition = `opacity ${CFG.FADE_CLOSE}ms ease`;
  m.style.opacity    = '0';

  m.addEventListener('transitionend', () => {
    m.classList.remove('active');
    m.setAttribute('aria-hidden', 'true');
    m.style.opacity    = '';
    m.style.transition = '';
    document.body.style.overflow = '';
  }, { once: true });

  $.open = false;
  $.idx  = -1;
};

// ── Touch & click ─────────────────────────────────────────────────────────────
const getPhotoImg = (t) =>
  t.tagName === 'IMG' && t.closest('.photo-grid') ? t : null;

const click = (t) => {
  const img = getPhotoImg(t);
  if (!img) return;
  const i = $.imgIdx.get(img);
  if (i !== undefined) show(i);
};

const tStart = (e) => {
  if (!getPhotoImg(e.target)) return;
  const { clientX: x, clientY: y } = e.touches[0];
  $.touch = { x, y, t: Date.now(), mx: 0 };
};

const tEnd = (e) => {
  if (!getPhotoImg(e.target)) return;
  const { clientX, clientY } = e.changedTouches[0];
  const d  = Date.now() - $.touch.t;
  const dx = Math.abs(clientX - $.touch.x);
  const dy = Math.abs(clientY - $.touch.y);
  if (d < CFG.TAP && dx < 10 && dy < 10) {
    e.preventDefault();
    e.stopPropagation();
    click(e.target);
  }
};

const mStart = (e) => {
  $.touch.mx = e.touches[0].clientX;
  $.dom.mi.style.transition = 'none';
};

const mEnd = (e) => {
  const dx = e.changedTouches[0].clientX - $.touch.mx;
  $.dom.mi.style.transition = '';
  if (Math.abs(dx) > CFG.SWIPE) nav(dx > 0 ? -1 : 1);
};

// ── Lazy load ─────────────────────────────────────────────────────────────────
const setupLazyLoad = () => {
  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target;

      const reveal = () => {
        img.style.opacity    = '0';
        img.style.transition = `opacity ${CFG.FADE_IN}ms ease`;
        img.src = img.dataset.src || img.src;
        img.removeAttribute('data-src');
        requestAnimationFrame(() => { img.style.opacity = '1'; });
        obs.unobserve(img);
      };

      img.complete ? reveal() : (img.onload = reveal);
    });
  }, { rootMargin: '150px', threshold: 0.01 });

  document.querySelectorAll('.photo img').forEach(i => obs.observe(i));
};

// ── Keyboard map ──────────────────────────────────────────────────────────────
const KEYS = {
  Escape:     () => close(),
  ArrowLeft:  () => nav(-1),
  ArrowRight: () => nav(1)
};

// ── Init ──────────────────────────────────────────────────────────────────────
const init = () => {
  $.dom = {
    m:  document.getElementById('modal'),
    mi: document.getElementById('modal-image'),
    mc: document.getElementById('modal-caption'),
    mp: document.querySelector('.modal-prev'),
    mn: document.querySelector('.modal-next'),
    mx: document.querySelector('.modal-close')
  };

  if (!$.dom.m || !$.dom.mi) return;

  cacheImgs($.cat);
  setupLazyLoad();

  const isTouch = 'ontouchstart' in window;

  if (isTouch) {
    document.addEventListener('touchstart', tStart, { passive: true });
    document.addEventListener('touchend',   tEnd,   { passive: false });
    $.dom.mi.addEventListener('touchstart', mStart, { passive: true });
    $.dom.mi.addEventListener('touchend',   mEnd,   { passive: true });

    const tap = (el, fn) =>
      el.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); fn(); });

    tap($.dom.mp, () => nav(-1));
    tap($.dom.mn, () => nav(1));
    tap($.dom.mx, close);
  } else {
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') click(e.target);
    });
  }

  $.dom.mp.addEventListener('click', (e) => { e.stopPropagation(); nav(-1); });
  $.dom.mn.addEventListener('click', (e) => { e.stopPropagation(); nav(1); });
  $.dom.mx.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  $.dom.m.addEventListener('click',  (e) => { if (e.target === $.dom.m) close(); });

  document.addEventListener('keydown', (e) => {
    if ($.open && KEYS[e.key]) { e.preventDefault(); KEYS[e.key](); }
  });

  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) e.preventDefault();
  });
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();