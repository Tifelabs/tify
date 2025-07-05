document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.querySelector('.modal-close');
    const photoGrid = document.querySelector('.photo-grid');

    // Validate DOM elements
    if (!modal || !modalImage || !modalClose || !photoGrid) {
        console.error('Required modal or grid elements not found');
        return;
    }

    // Store all images for navigation
    const images = Array.from(photoGrid.querySelectorAll('img'));
    let currentImageIndex = -1;

    // Debounce utility to prevent rapid clicks
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Preload image to reduce loading delay
    const preloadImage = (src) => {
        const img = new Image();
        img.src = src;
        return img;
    };

    // Update modal with image at given index
    const updateModalImage = (index) => {
        if (index < 0 || index >= images.length) return;
        
        currentImageIndex = index;
        const img = images[index];
        let highResSrc = img.src.replace('/Low_res/', '/High_res/');
        
        preloadImage(highResSrc);
        modalImage.src = highResSrc;
        modalImage.alt = img.alt || 'Enlarged photo';
        modalImage.classList.add('modal-image');
        modalImage.focus();
    };

    // Event delegation for image clicks
    photoGrid.addEventListener('click', debounce((event) => {
        const img = event.target.closest('img');
        if (!img) return;

        // Find index of clicked image
        currentImageIndex = images.findIndex(image => image === img);
        
        // Replace low-res path with high-res
        let highResSrc = img.src.replace('/Low_res/', '/High_res/');

        // Preload the high-res image
        preloadImage(highResSrc);

        // Update modal
        modal.style.display = 'flex';
        modalImage.src = highResSrc;
        modalImage.alt = img.alt || 'Enlarged photo';
        modalImage.classList.add('modal-image');
        modalImage.focus();
        modal.setAttribute('aria-hidden', 'false');
    }, 100));

    // Navigation click handler for modal image
    modalImage.addEventListener('click', debounce((event) => {
        // Calculate click position (left or right half)
        const rect = modalImage.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (clickX < halfWidth && currentImageIndex > 0) {
            // Clicked left half - go to previous image
            updateModalImage(currentImageIndex - 1);
        } else if (clickX >= halfWidth && currentImageIndex < images.length - 1) {
            // Clicked right half - go to next image
            updateModalImage(currentImageIndex + 1);
        }
    }, 100));

    // Close button click
    modalClose.addEventListener('click', debounce(() => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        currentImageIndex = -1;
    }, 100));

    // Background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            currentImageIndex = -1;
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (modal.style.display !== 'flex') return;

        if (event.key === 'Escape') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            currentImageIndex = -1;
        } else if (event.key === 'ArrowLeft' && currentImageIndex > 0) {
            updateModalImage(currentImageIndex - 1);
        } else if (event.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
            updateModalImage(currentImageIndex + 1);
        }
    });

    // Lazy loading for modal image
    modalImage.setAttribute('loading', 'lazy');
});