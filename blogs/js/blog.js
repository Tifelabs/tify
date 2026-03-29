(() => {
  'use strict';

  const ATTR = 'data-expandable';
  const OVERFLOW = 'overflow';
  const OPACITY = 'opacity';
  const TRANSITION_MS = 200;
  const ESC = 'Escape';

  const overlay = document.createElement('div');
  overlay.className = 'img-expanded';
  overlay.style.cssText = 'opacity:0;will-change:opacity;';

  let _img = null;
  let _tid = 0;
  let _open = false;

  const close = () => {
    if (!_open) return;
    _open = false;
    document.removeEventListener('keydown', onKey);
    clearTimeout(_tid);
    requestAnimationFrame(() => {
      overlay.style[OPACITY] = '0';
      _tid = setTimeout(teardown, TRANSITION_MS);
    });
  };

  const onKey = e => e.key === ESC && close();

  const teardown = () => {
    overlay.remove();
    document.body.style[OVERFLOW] = '';
    overlay.replaceChildren();
    _img = null;
  };

  overlay.addEventListener('click', close);

  const onDocClick = e => {
    const t = e.target;
    if (t.tagName !== 'IMG' || !t.matches('article img, table img') || _open) return;

    e.preventDefault();
    _open = true;
    _img = t;

    const clone = t.cloneNode(false);
    clone.style.cssText = 'cursor:zoom-out;pointer-events:none;';
    delete clone.dataset.expandable;

    overlay.appendChild(clone);
    document.body.append(overlay);
    document.body.style[OVERFLOW] = 'hidden';
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        overlay.style[OPACITY] = '1';
      })
    );
  };

  document.addEventListener('click', onDocClick);
})();