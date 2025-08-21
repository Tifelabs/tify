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

// Touch handling state
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let isTouchDevice = false;

// Detect touch capability
const detectTouch = () => {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

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
    if (window.requestIdleCallback) {
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
    }
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
    // Use h3 text as caption
    modalCaption.textContent = img.parentElement.querySelector('h3')?.textContent || img.alt;
    
    // Show modal
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
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
    document.body.style.overflow = ''; // Restore scrolling
    isModalOpen = false;
    currentIndex = -1;
};

// Handle image clicks/taps
const handleImageInteraction = (target) => {
    if (target.tagName !== 'IMG') return;
    const index = Array.from(images).indexOf(target);
    if (index !== -1) showModal(index);
};

// Touch event handlers for images
const handleTouchStart = (e) => {
    if (e.target.tagName !== 'IMG') return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
};

const handleTouchEnd = (e) => {
    if (e.target.tagName !== 'IMG') return;
    
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate touch movement
    const deltaX = Math.abs(touchEndX - touchStartX);
    const deltaY = Math.abs(touchEndY - touchStartY);
    
    // Only trigger if it's a quick tap with minimal movement (not a scroll/swipe)
    if (touchDuration < 300 && deltaX < 10 && deltaY < 10) {
        e.preventDefault();
        e.stopPropagation();
        handleImageInteraction(e.target);
    }
};

// Modal touch navigation
let modalTouchStartX = 0;
const handleModalTouchStart = (e) => {
    modalTouchStartX = e.touches[0].clientX;
};

const handleModalTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - modalTouchStartX;
    
    // Swipe threshold
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
            navigate(-1); // Swipe right = previous
        } else if (deltaX < 0 && currentIndex < images.length - 1) {
            navigate(1); // Swipe left = next
        }
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    detectTouch();
    
    const photoGrid = document.querySelector('.photo-grid');
    
    if (isTouchDevice) {
        // Touch events for mobile
        photoGrid.addEventListener('touchstart', handleTouchStart, { passive: true });
        photoGrid.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Modal swipe navigation
        modalImage.addEventListener('touchstart', handleModalTouchStart, { passive: true });
        modalImage.addEventListener('touchend', handleModalTouchEnd, { passive: true });
    } else {
        // Click events for desktop
        photoGrid.addEventListener('click', (e) => {
            handleImageInteraction(e.target);
        });
    }
    
    // Modal navigation buttons
    modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(-1);
    });
    
    modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate(1);
    });
    
    modalClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });
    
    // Touch events for modal buttons (better mobile support)
    if (isTouchDevice) {
        modalPrev.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(-1);
        });
        
        modalNext.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(1);
        });
        
        modalClose.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!isModalOpen) return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeModal();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                navigate(-1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                navigate(1);
                break;
        }
    });
    
    // Intersection observer for lazy loading
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
    
    // Preload first few high-res images
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            const preloadCount = Math.min(3, images.length);
            for (let i = 0; i < preloadCount; i++) {
                const highResSrc = images[i].src.replace('/Low_res/', '/High_res/');
                preloadImage(highResSrc);
            }
        });
    }
    
    // Prevent context menu on long press for images
    photoGrid.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});