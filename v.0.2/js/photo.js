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

    // Event delegation for image clicks
    photoGrid.addEventListener('click', debounce((event) => {
        const img = event.target.closest('img');
        if (!img) return;

        // Preload the image
        preloadImage(img.src);

        // Update modal
        modal.style.display = 'block';
        modalImage.src = img.src; // Set src after preload
        modalImage.alt = img.alt || 'Enlarged photo';
        modalImage.focus();
        modal.setAttribute('aria-hidden', 'false');
    }, 100));

    // close button click
    modalClose.addEventListener('click', debounce(() => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }, 100));

    // background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // low-res placeholder for smoother loading
    modalImage.setAttribute('loading', 'lazy');
});