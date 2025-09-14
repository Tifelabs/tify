// Global variables - properly declared
let currentCategory = 'general';
let currentImages = [];

function showCategory(category) {
    console.log(`Attempting to show category: ${category}`);
    
    // Update button states
    const buttons = document.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Hide all sections
    const sections = document.querySelectorAll('.photo-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`${category}-section`);
    if (!targetSection) {
        console.error(`Section with ID ${category}-section not found`);
        return;
    }
    targetSection.classList.add('active');

    // Update current category and images for modal navigation
    currentCategory = category;
    currentImages = document.querySelectorAll(`#${category}-section .photo img`);
    console.log(`Found ${currentImages.length} images in #${category}-section`);
}

// Cache DOM elements once
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.querySelector('.modal-close');
const modalPrev = document.querySelector('.modal-prev');
const modalNext = document.querySelector('.modal-next');
const modalCaption = document.getElementById('modal-caption');

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

// Get active images based on current category
const getActiveImages = () => {
    if (currentImages.length > 0) {
        return currentImages;
    }
    // Fallback to all images in active section
    const activeSection = document.querySelector('.photo-section.active');
    return activeSection ? activeSection.querySelectorAll('.photo img') : document.querySelectorAll('.photo img');
};

// Batch preload adjacent images
const preloadAdjacent = (index) => {
    if (window.requestIdleCallback) {
        requestIdleCallback(() => {
            const activeImages = getActiveImages();
            const prev = index - 1;
            const next = index + 1;
            if (prev >= 0 && activeImages[prev]) {
                // Try high-res first, fallback to current src
                const prevSrc = activeImages[prev].src.replace('/Low_res/', '/High_res/');
                preloadImage(prevSrc).catch(() => preloadImage(activeImages[prev].src));
            }
            if (next < activeImages.length && activeImages[next]) {
                const nextSrc = activeImages[next].src.replace('/Low_res/', '/High_res/');
                preloadImage(nextSrc).catch(() => preloadImage(activeImages[next].src));
            }
        });
    }
};

// Optimized modal display
const showModal = (index) => {
    const activeImages = getActiveImages();
    if (isNavigating || index < 0 || index >= activeImages.length) return;
    
    isNavigating = true;
    currentIndex = index;
    isModalOpen = true;
    
    const img = activeImages[index];
    // Try to load high-res version, fallback to current src
    const highResSrc = img.src.replace('/Low_res/', '/High_res/');
    
    // Use cached image if available
    if (imageCache.has(highResSrc)) {
        modalImage.src = highResSrc;
    } else {
        modalImage.src = img.src; // Show current resolution immediately
        // Try to load high-res in background
        preloadImage(highResSrc).then(() => {
            if (currentIndex === index && isModalOpen) {
                modalImage.src = highResSrc;
            }
        }).catch(() => {
            // High-res doesn't exist, stick with current
            console.log('High-res version not available for:', img.src);
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
    modalPrev.style.display = index > 0 ? 'flex' : 'none';
    modalNext.style.display = index < activeImages.length - 1 ? 'flex' : 'none';
    
    preloadAdjacent(index);
    
    requestAnimationFrame(() => {
        modalImage.focus();
        isNavigating = false;
    });
};

// Fast navigation
const navigate = (direction) => {
    if (isNavigating) return;
    const activeImages = getActiveImages();
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < activeImages.length) {
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
    const activeImages = getActiveImages();
    const index = Array.from(activeImages).indexOf(target);
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
    const activeImages = getActiveImages();
    
    // Swipe threshold
    if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
            navigate(-1); // Swipe right = previous
        } else if (deltaX < 0 && currentIndex < activeImages.length - 1) {
            navigate(1); // Swipe left = next
        }
    }
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    detectTouch();
    
    // Initialize current images for default category
    currentImages = document.querySelectorAll('#general-section .photo img');
    
    const photoGrid = document.querySelector('.photo-grid');
    
    if (isTouchDevice) {
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) {
                handleTouchStart(e);
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) {
                handleTouchEnd(e);
            }
        }, { passive: false });
        
        // Modal swipe navigation
        modalImage.addEventListener('touchstart', handleModalTouchStart, { passive: true });
        modalImage.addEventListener('touchend', handleModalTouchEnd, { passive: true });
    } else {
        // Click events for desktop
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) {
                handleImageInteraction(e.target);
            }
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
    
    // Initialize intersection observer for lazy loading (optional)
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

        // Only observe images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }
    
    // Prevent context menu on long press for images
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' && e.target.closest('.photo-grid')) {
            e.preventDefault();
        }
    });
});