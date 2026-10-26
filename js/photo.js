'use strict';
const $ = (s, r = document) => r.querySelector(s), clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const hiSrc = i => (i.currentSrc || i.src).replace('/low_res/', '/high_res/').replace(/\.webp$/i, '.jpg');
const rubber = (d, L) => Math.sign(d) * L * (1 - 1 / (.55 * Math.abs(d) / L + 1));

/* data */
const grid = $('#gallery-grid'), all = [...grid.children], N = all.length;
const lb = $('#lightbox'), img = $('#lb-img'), bg = $('.lb-bg'), strip = $('#lb-filmstrip-inner'), wrap = $('.lb-img-wrap');
const [prev, next, closeBtn] = ['#lb-prev', '#lb-next', '#lb-close'].map(s => $(s));
const bit = {}, mask = new Int32Array(N), vis = new Uint16Array(N), rank = new Int16Array(N), th = new Array(N);
let nv = 0, cur = 0, isOpen = false, token = 0, act, pre, last, y0 = 0;
all.forEach((el, k) => { el.k = k; mask[k] = 1 << (bit[el.dataset.cat] ??= Object.keys(bit).length); });

/* filter */
const show = m => {
  nv = 0;
  for (let k = 0; k < N; k++) {
    const v = mask[k] & m;
    all[k].hidden = !v;
    if (th[k]) th[k].hidden = !v;
    if (v) { rank[k] = nv; vis[nv++] = k; } else rank[k] = -1;
  }
};
show(-1);
const tabs = $('.filter-tabs');
tabs.onclick = e => {
  const b = e.target.closest('.ftab'), c = b && b.dataset.cat;
  if (!b || b.classList.contains('active')) return;
  for (const t of tabs.children) { t.classList.toggle('active', t === b); t.setAttribute('aria-selected', t === b); }
  show(c === 'all' ? -1 : c in bit ? 1 << bit[c] : 0);
};
grid.onclick = e => { const el = e.target.closest('.gitem'); if (el) openLb(rank[el.k]); };
grid.onkeydown = e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.gitem')) { e.preventDefault(); openLb(rank[e.target.k]); }
};

/* transform */
let z = { s: 1, x: 0, y: 0 }, raf = 0;
const paint = () => { raf = 0; img.style.transform = `translate(${z.x}px,${z.y}px) scale(${z.s})`; img.classList.toggle('zoomed', z.s > 1.02); };
const draw = now => now ? (cancelAnimationFrame(raf), paint()) : raf ||= requestAnimationFrame(paint);
const fit = () => {
  const bx = img.offsetWidth * (z.s - 1) / 2, by = img.offsetHeight * (z.s - 1) / 2;
  z.x = clamp(z.x, -bx, bx); z.y = clamp(z.y, -by, by);
};
const reset  = () => { z = { s: 1, x: 0, y: 0 }; bg.style.opacity = ''; draw(true); };
const settle = () => z.s > 1.02 ? (fit(), draw(true)) : reset();

/* gestures: t' = u1 - k*(u0 - t0), k = s'/s0, u = point - image centre */
const P = new Map();
let B, T = -1e9, tx = 0, ty = 0;
const stat = () => {
  const v = [...P.values()], n = v.length;
  return [v.reduce((a, p) => a + p[0], 0) / n, v.reduce((a, p) => a + p[1], 0) / n, n > 1 ? Math.hypot(v[0][0] - v[1][0], v[0][1] - v[1][1]) || 1 : 0];
};
const base = t => {
  const [x, y, d] = stat(), r = img.getBoundingClientRect();
  B = { x, y, d, s: z.s, tx: z.x, ty: z.y, cx: r.left + r.width / 2 - z.x, cy: r.top + r.height / 2 - z.y, m: null, lx: x, ly: y, lt: t, vx: 0, vy: 0 };
};
const tapAt = (x, y, t) => {
  if (t - T > 320 || Math.hypot(x - tx, y - ty) > 40) { T = t; tx = x; ty = y; lb.classList.toggle('chrome-hidden'); return; }
  T = -1e9;
  const r = img.getBoundingClientRect(), s = z.s > 1.02 ? 1 : 2.4, k = s / z.s;
  const ux = x - (r.left + r.width / 2 - z.x), uy = y - (r.top + r.height / 2 - z.y);
  z.x = ux - k * (ux - z.x); z.y = uy - k * (uy - z.y); z.s = s;
  fit(); draw(true);
};

wrap.onpointerdown = e => {
  if (e.pointerType === 'mouse' && e.button) return;
  wrap.setPointerCapture(e.pointerId);
  P.set(e.pointerId, [e.clientX, e.clientY]);
  base(e.timeStamp);
};
wrap.onpointermove = e => {
  if (!P.has(e.pointerId)) return;
  P.set(e.pointerId, [e.clientX, e.clientY]);
  const [x, y, d] = stat(), dt = e.timeStamp - B.lt || 1;
  B.vx += ((x - B.lx) / dt - B.vx) * .5; B.vy += ((y - B.ly) / dt - B.vy) * .5;
  B.lx = x; B.ly = y; B.lt = e.timeStamp;
  if (B.m === 'ignore') return;
  if (P.size > 1 || z.s > 1.02) {
    const s = clamp(B.s * (P.size > 1 ? d / B.d : 1), 1, 3.2), k = s / B.s;
    z.s = s;
    z.x = x - B.cx - k * (B.x - B.cx - B.tx);
    z.y = y - B.cy - k * (B.y - B.cy - B.ty);
    fit(); return draw();
  }
  const dx = x - B.x, dy = y - B.y;
  B.m ||= Math.abs(dx) < 8 && Math.abs(dy) < 8 ? null : Math.abs(dx) > Math.abs(dy) ? 'x' : dy > 0 ? 'y' : 'up';
  if (B.m === 'x') z.x = (!cur && dx > 0) || (cur === nv - 1 && dx < 0) ? rubber(dx, innerWidth) : dx;
  else if (B.m === 'y') { const c = clamp(dy, 0, 400); z.y = c; z.s = Math.max(.85, 1 - c / 900); bg.style.opacity = Math.max(.15, 1 - c / 300); }
  else return;
  draw();
};
wrap.onpointerup = wrap.onpointercancel = e => {
  if (!P.delete(e.pointerId)) return;
  if (P.size) {
    if (z.s <= 1.02) reset();
    base(e.timeStamp);
    if (z.s <= 1.02) B.m = 'ignore';
    return;
  }
  const m = B.m, dx = e.clientX - B.x, dy = e.clientY - B.y;
  if (e.type === 'pointercancel' || m === 'ignore') return settle();
  if (m === 'x') { const p = dx + 200 * B.vx; settle(); if (Math.abs(p) > 80) go(p < 0 ? 1 : -1); }
  else if (m === 'y') dy + 200 * B.vy > 110 ? closeLb() : settle();
  else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) tapAt(e.clientX, e.clientY, e.timeStamp);
  else settle();
};

/* lightbox */
const preload = p => {
  const k = vis[p], c = navigator.connection;
  if (p >= 0 && p < nv && !(c && (c.saveData || /2g/.test(c.effectiveType)))) { pre = new Image(); pre.fetchPriority = 'low'; pre.src = hiSrc($('img', all[k])); }
};
const view = (p, dir) => {
  cur = p; reset();
  const k = vis[p], el = all[k], t = $('img', el), d = el.dataset;
  $('#lb-title').textContent = d.title || '';
  $('#lb-year').textContent = d.year || '—';
  $('#lb-res').textContent = d.res || '';
  $('#lb-count').textContent = `${p + 1} / ${nv}`;
  prev.style.visibility = p ? 'visible' : 'hidden';
  next.style.visibility = p < nv - 1 ? 'visible' : 'hidden';
  if (act) act.classList.remove('active');
  (act = th[k]).classList.add('active');
  act.scrollIntoView({ inline: 'center', block: 'nearest' });


  img.style.setProperty('--ar', (t.naturalWidth || t.getAttribute('width')) / (t.naturalHeight || t.getAttribute('height')));
  img.alt = t.alt; img.src = t.currentSrc || t.src; img.classList.add('loaded');
  const hi = hiSrc(t), me = ++token, im = new Image();
  im.src = hi;
  im.decode().then(() => me === token && (img.src = hi)).catch(() => {}).then(() => me === token && preload(p + dir));
};
const go = d => { const n = clamp(cur + d, 0, nv - 1); if (isOpen && n !== cur) view(n, Math.sign(d)); };

function openLb(p) {
  isOpen = true; last = document.activeElement;
  lb.classList.remove('chrome-hidden');
  y0 = scrollY;
  document.body.style.cssText = `position:fixed;top:-${y0}px;left:0;right:0;width:${document.body.offsetWidth}px`;
  if (!th[0]) strip.append(...all.map((el, k) => {
    const t = th[k] = document.createElement('div'), im = new Image(), s = $('img', el);
    t.className = 'lb-thumb'; t.hidden = el.hidden; t.k = k;
    im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.src = s.currentSrc || s.src;
    t.append(im);
    return t;
  }));
  lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  view(p, 1);
  closeBtn.focus({ preventScroll: true });
}
function closeLb() {
  isOpen = false; token++;
  lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
  document.body.style.cssText = ''; scrollTo(0, y0);
  reset();
  img.removeAttribute('src'); img.classList.remove('loaded');
  if (last) last.focus({ preventScroll: true });
}

closeBtn.onclick = closeLb;
prev.onclick = () => go(-1);
next.onclick = () => go(1);
strip.onclick = e => { const t = e.target.closest('.lb-thumb'); if (t) go(rank[t.k] - cur); };
document.onkeydown = e => {
  if (!isOpen) return;
  if (e.key === 'Escape') closeLb();
  else if (e.key === 'ArrowLeft') go(-1);
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'Tab') {
    const f = [closeBtn, prev, next].filter(b => b.style.visibility !== 'hidden'), i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[i < 0 ? 0 : (i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
  }
};
document.oncontextmenu = e => e.target.matches('.gallery-grid img,#lightbox img') && e.preventDefault();