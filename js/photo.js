/* ======= TIFELABS ======= */
'use strict';

const CFG = {CACHE:50, SWIPE:60, TAP:300, NAV_COOL:150};

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

// Smart preloader with enhanced lookahead
const preload = (() => {
  let id;
  return (i) => {
    if (id) cancelIdleCallback(id);
    const cb = () => {
      const imgs = getImgs();
      [-2, -1, 1, 2, 3].forEach(n => {
        const idx = i + n;
        if (idx >= 0 && idx < imgs.length) {
          load(hiRes(imgs[idx].src)).catch(() => load(imgs[idx].src).catch(() => {}));
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

// Smooth category switch with fade
const switchCat = (c, btn) => {
  if (c === $.cat) return;
  const sec = document.getElementById(`${c}-section`);
  if (!sec) return;
  
  const oldSec = document.querySelector('.photo-section.active');
  
  requestAnimationFrame(() => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
    
    if (oldSec) {
      oldSec.style.opacity = '0';
      setTimeout(() => {
        oldSec.classList.remove('active');
        oldSec.style.opacity = '';
        sec.classList.add('active');
        sec.style.opacity = '0';
        requestAnimationFrame(() => {
          sec.style.transition = 'opacity 0.3s ease';
          sec.style.opacity = '1';
          setTimeout(() => sec.style.transition = '', 300);
        });
      }, 150);
    } else {
      sec.classList.add('active');
    }
    
    $.cat = c;
    cacheImgs(c);
  });
};

window.showCategory = (c) => switchCat(c, event?.target);

// Modal with smooth transitions
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
  mi.style.opacity = '0';
  mi.src = cached ? h : img.src;
  
  if (!cached) {
    load(h).then(() => { 
      if ($.idx === i && $.open) {
        mi.style.transition = 'opacity 0.3s ease';
        mi.src = h;
      }
    }).catch(() => {});
  }
  
  mi.alt = img.alt;
  mc.textContent = img.closest('.photo')?.querySelector('h3')?.textContent || img.alt;
  
  requestAnimationFrame(() => {
    m.classList.add('active');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mp.style.display = i > 0 ? 'flex' : 'none';
    mn.style.display = i < imgs.length - 1 ? 'flex' : 'none';
    
    requestAnimationFrame(() => {
      mi.style.transition = 'opacity 0.4s ease';
      mi.style.opacity = '1';
      mi.focus();
      $.nav = false;
      preload(i);
    });
  });
};

const nav = (d) => {
  if (!$.nav) {
    const n = $.idx + d;
    if (n >= 0 && n < getImgs().length) {
      $.dom.mi.style.transition = 'opacity 0.2s ease';
      $.dom.mi.style.opacity = '0';
      setTimeout(() => show(n), 200);
    }
  }
};

const close = () => {
  $.dom.m.style.opacity = '0.98';
  requestAnimationFrame(() => {
    $.dom.m.style.transition = 'opacity 0.25s ease';
    $.dom.m.style.opacity = '0';
    setTimeout(() => {
      $.dom.m.classList.remove('active');
      $.dom.m.setAttribute('aria-hidden', 'true');
      $.dom.m.style.opacity = '';
      $.dom.m.style.transition = '';
      document.body.style.overflow = '';
    }, 250);
  });
  $.open = false;
  $.idx = -1;
};

// Events with enhanced touch handling
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

const mStart = (e) => {
  $.touch.mx = e.touches[0].clientX;
  $.dom.mi.style.transition = 'none';
};

const mEnd = (e) => {
  const dx = e.changedTouches[0].clientX - $.touch.mx;
  $.dom.mi.style.transition = '';
  if (Math.abs(dx) > CFG.SWIPE) nav(dx > 0 ? -1 : 1);
};

// Lazy loading with fade-in
const setupLazyLoad = () => {
  if (!('IntersectionObserver' in window)) return;
  
  const obs = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.4s ease';
        
        const loadImg = () => {
          img.src = img.dataset.src || img.src;
          img.removeAttribute('data-src');
          requestAnimationFrame(() => {
            img.style.opacity = '1';
          });
          obs.unobserve(img);
        };
        
        if (img.complete) loadImg();
        else img.onload = loadImg;
      }
    });
  }, {rootMargin: '150px', threshold: 0.01});
  
  document.querySelectorAll('.photo img').forEach(i => obs.observe(i));
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
  setupLazyLoad();
  
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
};

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();