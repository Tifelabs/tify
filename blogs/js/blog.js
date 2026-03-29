(() => {
‘use strict’;

const SEL = ‘article img, table img’;
let overlay = null;

const close = () => {
if (!overlay) return;
const el = overlay;
overlay = null;
el.addEventListener(‘transitionend’, () => {
el.remove();
document.body.style.overflow = ‘’;
}, { once: true });
el.style.opacity = ‘0’;
};

const open = ({ src, alt }) => {
if (overlay) return;
overlay = Object.assign(document.createElement(‘div’), { className: ‘img-expanded’ });
overlay.innerHTML = `<img src="${src}" alt="${alt || ''}">`;
document.body.append(overlay);
document.body.style.overflow = ‘hidden’;
requestAnimationFrame(() => (overlay.style.opacity = ‘1’));
};

document.addEventListener(‘DOMContentLoaded’, () => {
document.addEventListener(‘click’, e => {
if (overlay) return close();
const img = e.target.closest(SEL);
if (img) open(img);
});

```
document.addEventListener('keydown', e => e.key === 'Escape' && close());
```

});
})();