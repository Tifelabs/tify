
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

        // Replace low-res path with high-res
        let highResSrc = img.src
            .replace('/Low_res/', '/High_res/')

        // Preload the high-res image
        preloadImage(highResSrc);

        // Update modal
        modal.style.display = 'flex'; 
        modalImage.src = highResSrc; // Use high-res image
        modalImage.alt = img.alt || 'Enlarged photo';
        modalImage.classList.add('modal-image'); 
        modalImage.focus();
        modal.setAttribute('aria-hidden', 'false');
    }, 100));

    // Close button click
    modalClose.addEventListener('click', debounce(() => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }, 100));

    // Background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Lazy loading for modal image
    modalImage.setAttribute('loading', 'lazy');
});
