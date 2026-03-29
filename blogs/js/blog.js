(() => {
‘use strict’;

document.addEventListener(‘DOMContentLoaded’, () => {
document.querySelectorAll(‘article img, table img’).forEach(img => {
if (img.dataset.expandable) return;
img.dataset.expandable = ‘true’;
img.style.cursor = ‘zoom-in’;
img.addEventListener(‘click’, e => {
e.preventDefault();
expandImage(img);
});
});
});

function expandImage(img) {
const overlay = document.createElement(‘div’);
overlay.className = ‘img-expanded’;


const clone = img.cloneNode(true);
clone.style.cursor = 'zoom-out';
overlay.appendChild(clone);
document.body.append(overlay);
document.body.style.overflow = 'hidden';

const close = () => {
  document.removeEventListener('keydown', escHandler);
  overlay.addEventListener('transitionend', () => {
    overlay.remove();
    document.body.style.overflow = '';
  }, { once: true });
  overlay.style.opacity = '0';
};

const escHandler = e => e.key === 'Escape' && close();

overlay.addEventListener('click', close, { once: true });
document.addEventListener('keydown', escHandler);


}
})();