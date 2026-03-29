(() => {
‘use strict’;

const SEL = ‘article img, table img’;
let activeOverlay = null;

document.addEventListener(‘DOMContentLoaded’, () => {
document.addEventListener(‘click’, e => {
const img = e.target.closest(SEL);
if (img && !activeOverlay) {
e.preventDefault();
expandImage(img);
}
});
});

function expandImage(img) {
const overlay = document.createElement(‘div’);
overlay.className = ‘img-expanded’;
overlay.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}" style="cursor:zoom-out">`;
document.body.append(overlay);
document.body.style.overflow = ‘hidden’;
activeOverlay = overlay;

```
const escHandler = e => e.key === 'Escape' && close();

function close() {
  overlay.removeEventListener('click', close);
  document.removeEventListener('keydown', escHandler);
  overlay.addEventListener('transitionend', () => {
    overlay.remove();
    document.body.style.overflow = '';
    activeOverlay = null;
  }, { once: true });
  overlay.style.opacity = '0';
}

overlay.addEventListener('click', close);
document.addEventListener('keydown', escHandler);
```

}
})();