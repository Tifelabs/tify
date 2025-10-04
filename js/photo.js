/* ======= TIFELABS ======= */
'use strict';

const CFG = {CACHE:50, SWIPE:50, TAP:300, NAV_COOL:100};

const $ = {
  cat: 'general',
  idx: -1,
  open: false,
  nav: false,
  lastNav: 0,
  dom: {},
  imgs: new Map(),
  imgIdx: new WeakMap(),
  touch: {x:0, y:0, t:0, mx:0}
};

// LRU Cache
class LRU {
  constructor(n) { this.n = n; this.m = new Map(); }
  get(k) {
    if (!this.m.has(k)) return null;
    const v = this.m.get(k);
    this.m.delete(k); this.m.set(k, v);
    return v;
  }
  set(k, v) {
    if (this.m.has(k)) this.m.delete(k);
    else if (this.m.size >= this.n) this.m.delete(this.m.keys().next().value);
    this.m.set(k, v);
  }
}

const cache = new LRU(CFG.CACHE);
const urlCache = new Map();
const promises = new Map();

// URL memoization
const hiRes = (u) => {
  if (urlCache.has(u)) return urlCache.get(u);
  const h = u.replace('/Low_res/', '/High_res/');
  urlCache.set(u, h);
  return h;
};

// Promise-cached image loader
const load = (s) => {
  if (cache.get(s)) return Promise.resolve();
  if (promises.has(s)) return promises.get(s);
  
  const p = new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => { cache.set(s, i); promises.delete(s); res(); };
    i.onerror = () => { promises.delete(s); rej(); };
    i.src = s;
  });
  
  promises.set(s, p);
  return p;
};

// Smart preloader
const preload = (() => {
  let id;
  return (i) => {
    if (id) cancelIdleCallback(id);
    const cb = () => {
      const imgs = getImgs();
      [i-1, i+1, i+2].forEach(n => {
        if (n >= 0 && n < imgs.length) {
          load(hiRes(imgs[n].src)).catch(() => load(imgs[n].src).catch(() => {}));
        }
      });
    };
    id = window.requestIdleCallback ? requestIdleCallback(cb, {timeout:1000}) : setTimeout(cb, 0);
  };
})();

// Category with WeakMap indexing
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

// Category switch
const switchCat = (c, btn) => {
  if (c === $.cat) return;
  const sec = document.getElementById(`${c}-section`);
  if (!sec) return;
  
  requestAnimationFrame(() => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.photo-section').forEach(s => s.classList.toggle('active', s === sec));
    $.cat = c;
    cacheImgs(c);
  });
};

window.showCategory = (c) => switchCat(c, event?.target);

// Modal
const show = (i) => {
  const imgs = getImgs();
  const now = Date.now();
  if ($.nav || i < 0 || i >= imgs.length || now - $.lastNav < CFG.NAV_COOL) return;
  
  $.lastNav = now;
  $.nav = true;
  $.idx = i;
  $.open = true;
  
  const img = imgs[i];
  const h = hiRes(img.src);
  const {mi, mc, mp, mn, m} = $.dom;
  
  const cached = cache.get(h);
  mi.src = cached ? h : img.src;
  if (!cached) load(h).then(() => { if ($.idx === i && $.open) mi.src = h; }).catch(() => {});
  
  mi.alt = img.alt;
  mc.textContent = img.closest('.photo')?.querySelector('h3')?.textContent || img.alt;
  
  requestAnimationFrame(() => {
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mp.style.display = i > 0 ? 'flex' : 'none';
    mn.style.display = i < imgs.length - 1 ? 'flex' : 'none';
    mi.focus();
    $.nav = false;
    preload(i);
  });
};

const nav = (d) => {
  if (!$.nav) {
    const n = $.idx + d;
    if (n >= 0 && n < getImgs().length) show(n);
  }
};

const close = () => {
  requestAnimationFrame(() => {
    $.dom.m.classList.remove('active');
    $.dom.m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });
  $.open = false;
  $.idx = -1;
};

// Events
const click = (t) => {
  if (t.tagName !== 'IMG' || !t.closest('.photo-grid')) return;
  const i = $.imgIdx.get(t);
  if (i !== undefined) show(i);
};

const tStart = (e) => {
  const t = e.target;
  if (t.tagName !== 'IMG' || !t.closest('.photo-grid')) return;
  const {clientX: x, clientY: y} = e.touches[0];
  $.touch = {x, y, t: Date.now(), mx: 0};
};

const tEnd = (e) => {
  const t = e.target;
  if (t.tagName !== 'IMG' || !t.closest('.photo-grid')) return;
  const {clientX, clientY} = e.changedTouches[0];
  const d = Date.now() - $.touch.t;
  const dx = Math.abs(clientX - $.touch.x);
  const dy = Math.abs(clientY - $.touch.y);
  if (d < CFG.TAP && dx < 10 && dy < 10) {
    e.preventDefault();
    e.stopPropagation();
    click(t);
  }
};

const mStart = (e) => $.touch.mx = e.touches[0].clientX;
const mEnd = (e) => {
  const dx = e.changedTouches[0].clientX - $.touch.mx;
  if (Math.abs(dx) > CFG.SWIPE) nav(dx > 0 ? -1 : 1);
};

// Init
const init = () => {
  $.dom = {
    m: document.getElementById('modal'),
    mi: document.getElementById('modal-image'),
    mc: document.getElementById('modal-caption'),
    mp: document.querySelector('.modal-prev'),
    mn: document.querySelector('.modal-next'),
    mx: document.querySelector('.modal-close')
  };
  
  if (!$.dom.m || !$.dom.mi) return;
  
  cacheImgs($.cat);
  
  const touch = 'ontouchstart' in window;
  
  if (touch) {
    document.addEventListener('touchstart', tStart, {passive: true});
    document.addEventListener('touchend', tEnd, {passive: false});
    $.dom.mi.addEventListener('touchstart', mStart, {passive: true});
    $.dom.mi.addEventListener('touchend', mEnd, {passive: true});
    const th = (e, f) => { e.preventDefault(); e.stopPropagation(); f(); };
    $.dom.mp.addEventListener('touchend', (e) => th(e, () => nav(-1)));
    $.dom.mn.addEventListener('touchend', (e) => th(e, () => nav(1)));
    $.dom.mx.addEventListener('touchend', (e) => th(e, close));
  } else {
    document.addEventListener('click', (e) => { if (e.target.tagName === 'IMG') click(e.target); });
  }
  
  $.dom.mp.addEventListener('click', (e) => { e.stopPropagation(); nav(-1); });
  $.dom.mn.addEventListener('click', (e) => { e.stopPropagation(); nav(1); });
  $.dom.mx.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  $.dom.m.addEventListener('click', (e) => { if (e.target === $.dom.m) close(); });
  document.addEventListener('keydown', (e) => {
    if ($.open) {
      const a = {'Escape': close, 'ArrowLeft': () => nav(-1), 'ArrowRight': () => nav(1)};
      if (a[e.key]) { e.preventDefault(); a[e.key](); }
    }
  });
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) e.preventDefault();
  });
  
  // Lazy load
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting && e.target.dataset.src) {
          e.target.src = e.target.dataset.src;
          e.target.removeAttribute('data-src');
          obs.unobserve(e.target);
        }
      });
    }, {rootMargin: '100px', threshold: 0.01});
    
    document.querySelectorAll('img[data-src]').forEach(i => obs.observe(i));
  }
};

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();