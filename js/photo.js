document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.querySelector('.modal-close');
    const modalPrev = document.querySelector('.modal-prev');
    const modalNext = document.querySelector('.modal-next');
    const photoGrid = document.querySelector('.photo-grid');

    // Validate DOM elements
    if (!modal || !modalImage || !modalClose || !modalPrev || !modalNext || !photoGrid) {
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

    // Preload image and handle load errors
    const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        });
    };

    // Update modal with image at given index
    const updateModalImage = async (index) => {
        if (index < 0 || index >= images.length) return;

        currentImageIndex = index;
        const img = images[index];
        let highResSrc = img.src.replace('/assets/Low_res/', '/assets/High_res/');

        try {
            await preloadImage(highResSrc);
            modalImage.src = highResSrc;
            modalImage.alt = img.alt || `Photo ${index + 1}`;
            modalImage.classList.add('modal-image');
            modalImage.focus();

            // Update navigation button visibility
            modalPrev.style.display = currentImageIndex > 0 ? 'block' : 'none';
            modalNext.style.display = currentImageIndex < images.length - 1 ? 'block' : 'none';
        } catch (error) {
            console.error(error.message);
            modalImage.alt = 'Image failed to load';
            modalImage.src = ''; // Clear image to avoid broken image icon
        }
    };

    // Event delegation for image clicks
    photoGrid.addEventListener('click', debounce(async (event) => {
        const img = event.target.closest('img');
        if (!img) return;

        // Find index of clicked image
        currentImageIndex = images.findIndex(image => image === img);
        let highResSrc = img.src.replace('/assets/Low_res/', '/assets/High_res/');

        try {
            await preloadImage(highResSrc);
            modal.style.display = 'flex';
            modalImage.src = highResSrc;
            modalImage.alt = img.alt || `Photo ${currentImageIndex + 1}`;
            modalImage.classList.add('modal-image');
            modalImage.focus();
            modal.setAttribute('aria-hidden', 'false');

            // Update navigation button visibility
            modalPrev.style.display = currentImageIndex > 0 ? 'block' : 'none';
            modalNext.style.display = currentImageIndex < images.length - 1 ? 'block' : 'none';
        } catch (error) {
            console.error(error.message);
            modalImage.alt = 'Image failed to load';
            modalImage.src = '';
        }
    }, 100));

    // Navigation click handler for modal image
    modalImage.addEventListener('click', debounce((event) => {
        const rect = modalImage.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const halfWidth = rect.width / 2;

        if (clickX < halfWidth && currentImageIndex > 0) {
            updateModalImage(currentImageIndex - 1);
        } else if (clickX >= halfWidth && currentImageIndex < images.length - 1) {
            updateModalImage(currentImageIndex + 1);
        }
    }, 100));

    // Previous button click
    modalPrev.addEventListener('click', debounce(() => {
        if (currentImageIndex > 0) {
            updateModalImage(currentImageIndex - 1);
        }
    }, 100));

    // Next button click
    modalNext.addEventListener('click', debounce(() => {
        if (currentImageIndex < images.length - 1) {
            updateModalImage(currentImageIndex + 1);
        }
    }, 100));

    // Close button click
    modalClose.addEventListener('click', debounce(() => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        currentImageIndex = -1;
        modalPrev.style.display = 'block'; // Reset button visibility
        modalNext.style.display = 'block';
    }, 100));

    // Background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            currentImageIndex = -1;
            modalPrev.style.display = 'block'; // Reset button visibility
            modalNext.style.display = 'block';
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (modal.style.display !== 'flex') return;

        if (event.key === 'Escape') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            currentImageIndex = -1;
            modalPrev.style.display = 'block'; // Reset button visibility
            modalNext.style.display = 'block';
        } else if (event.key === 'ArrowLeft' && currentImageIndex > 0) {
            updateModalImage(currentImageIndex - 1);
        } else if (event.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
            updateModalImage(currentImageIndex + 1);
        }
    });

    // Lazy loading for modal image
    modalImage.setAttribute('loading', 'lazy');
});