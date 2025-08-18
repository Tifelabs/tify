// Cache DOM elements once
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.querySelector('.modal-close');
const modalPrev = document.querySelector('.modal-prev');
const modalNext = document.querySelector('.modal-next');
const modalCaption = document.getElementById('modal-caption');
const images = document.querySelectorAll('.photo img');

// State management
let currentIndex = -1;
let isModalOpen = false;
let imageCache = new Map();
let isNavigating = false;

// Ultra-fast image preloader with caching
const preloadImage = (src) => {
  if (imageCache.has(src)) return Promise.resolve();
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve();
    };
    img.onerror = () => resolve(); // Don't block on errors
    img.src = src;
  });
};

// Batch preload adjacent images
const preloadAdjacent = (index) => {
  requestIdleCallback(() => {
    const prev = index - 1;
    const next = index + 1;
    if (prev >= 0) {
      const prevSrc = images[prev].src.replace('/Low_res/', '/High_res/');
      preloadImage(prevSrc);
    }
    if (next < images.length) {
      const nextSrc = images[next].src.replace('/Low_res/', '/High_res/');
      preloadImage(nextSrc);
    }
  });
};

// Optimized modal display
const showModal = (index) => {
  if (isNavigating || index < 0 || index >= images.length) return;
  
  isNavigating = true;
  currentIndex = index;
  isModalOpen = true;
  
  const img = images[index];
  const highResSrc = img.src.replace('/Low_res/', '/High_res/');
  
  // Use cached image if available
  if (imageCache.has(highResSrc)) {
    modalImage.src = highResSrc;
  } else {
    modalImage.src = img.src; // Show low-res immediately
    preloadImage(highResSrc).then(() => {
      if (currentIndex === index && isModalOpen) {
        modalImage.src = highResSrc;
      }
    });
  }
  
  modalImage.alt = img.alt;
  modalCaption.textContent = img.nextElementSibling?.textContent || '';
  
  // Batch DOM updates
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  
  // Update navigation visibility
  modalPrev.style.display = index > 0 ? 'block' : 'none';
  modalNext.style.display = index < images.length - 1 ? 'block' : 'none';
  
  preloadAdjacent(index);
  
  requestAnimationFrame(() => {
    modalImage.focus();
    isNavigating = false;
  });
};

// Fast navigation
const navigate = (direction) => {
  if (isNavigating) return;
  const newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < images.length) {
    showModal(newIndex);
  }
};

// Close modal
const closeModal = () => {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  isModalOpen = false;
  currentIndex = -1;
};

// Event listeners with passive optimization
document.addEventListener('DOMContentLoaded', () => {
  // Photo grid click handler with event delegation
  document.querySelector('.photo-grid').addEventListener('click', (e) => {
    if (e.target.tagName !== 'IMG') return;
    const index = Array.from(images).indexOf(e.target);
    if (index !== -1) showModal(index);
  }, { passive: true });

  // Modal navigation
  modalPrev.addEventListener('click', () => navigate(-1));
  modalNext.addEventListener('click', () => navigate(1));
  modalClose.addEventListener('click', closeModal);

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  }, { passive: true });

  // Image click navigation (left/right halves)
  modalImage.addEventListener('click', (e) => {
    const rect = modalImage.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const direction = clickX < rect.width / 2 ? -1 : 1;
    navigate(direction);
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isModalOpen) return;
    
    switch(e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        navigate(-1);
        break;
      case 'ArrowRight':
        navigate(1);
        break;
    }
  });

  // Optimized intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, { 
      rootMargin: '50px',
      threshold: 0.1
    });

    images.forEach(img => observer.observe(img));
  }

  // Preload first few high-res images on idle
  requestIdleCallback(() => {
    const preloadCount = Math.min(3, images.length);
    for (let i = 0; i < preloadCount; i++) {
      const highResSrc = images[i].src.replace('/Low_res/', '/High_res/');
      preloadImage(highResSrc);
    }
  });
});