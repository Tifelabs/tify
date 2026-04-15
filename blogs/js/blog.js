(() => {
  'use strict';

  const overlay = Object.assign(document.createElement('div'), { className: 'img-expanded' });
  overlay.style.cssText = 'opacity:0;will-change:opacity;';

  let _tid = 0, _open = false;

  const teardown = () => {
    overlay.remove();
    document.body.style.overflow = '';
    overlay.replaceChildren();
  };

  const close = () => {
    if (!_open) return;
    _open = false;
    document.removeEventListener('keydown', onKey);
    clearTimeout(_tid);
    overlay.style.opacity = '0';
    _tid = setTimeout(teardown, 200);
  };

  const onKey = ({ key }) => key === 'Escape' && close();

  overlay.addEventListener('click', close);

  document.addEventListener('click', e => {
    const t = e.target;
    if (_open || t.tagName !== 'IMG' || !t.matches('article img, table img')) return;
    e.preventDefault();
    _open = true;

    const clone = t.cloneNode(false);
    clone.style.cssText = 'cursor:zoom-out;pointer-events:none;';
    delete clone.dataset.expandable;

    overlay.append(clone);
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(() => requestAnimationFrame(() => overlay.style.opacity = '1'));
  });
})();