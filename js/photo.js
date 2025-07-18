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

    // Store images and initialize state
    const images = Array.from(photoGrid.querySelectorAll('img'));
    let currentImageIndex = -1;

    // Optimized debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Preload image with promise
    const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => reject(`Failed to load image: ${src}`);
        });
    };

    // Preload adjacent images for faster navigation
    const preloadAdjacentImages = (index) => {
        const prevIndex = index - 1;
        const nextIndex = index + 1;
        if (prevIndex >= 0) preloadImage(images[prevIndex].src.replace('/assets/Low_res/', '/assets/High_res/'));
        if (nextIndex < images.length) preloadImage(images[nextIndex].src.replace('/assets/Low_res/', '/assets/High_res/'));
    };

    // Update modal image
    const updateModalImage = async (index) => {
        if (index < 0 || index >= images.length) return;

        currentImageIndex = index;
        const img = images[index];
        const highResSrc = img.src.replace('/assets/Low_res/', '/assets/High_res/');

        try {
            await preloadImage(highResSrc);
            modalImage.src = highResSrc;
            modalImage.alt = img.alt || `Photo ${index + 1}`;
            modalImage.classList.add('modal-image');

            // Batch DOM updates for navigation buttons
            modalPrev.style.display = index > 0 ? 'block' : 'none';
            modalNext.style.display = index < images.length - 1 ? 'block' : 'none';
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            modalImage.focus();

            // Preload adjacent images
            preloadAdjacentImages(index);
        } catch (error) {
            console.error(error);
            modalImage.src = '';
            modalImage.alt = 'Image failed to load';
        }
    };

    // Event delegation for photo grid
    photoGrid.addEventListener('click', debounce(async (e) => {
        if (e.target.tagName !== 'IMG') return;
        const index = images.indexOf(e.target);
        if (index === -1) return;
        await updateModalImage(index);
    }, 100));

    // Modal image click for navigation
    modalImage.addEventListener('click', debounce((e) => {
        const rect = modalImage.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const newIndex = clickX < halfWidth ? currentImageIndex - 1 : currentImageIndex + 1;
        updateModalImage(newIndex);
    }, 100));

    // Navigation buttons
    modalPrev.addEventListener('click', debounce(() => updateModalImage(currentImageIndex - 1), 100));
    modalNext.addEventListener('click', debounce(() => updateModalImage(currentImageIndex + 1), 100));

    // Close modal
    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        currentImageIndex = -1;
        modalPrev.style.display = 'block';
        modalNext.style.display = 'block';
    };

    modalClose.addEventListener('click', debounce(closeModal, 100));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display !== 'flex') return;
        if (e.key === 'Escape') closeModal();
        else if (e.key === 'ArrowLeft') updateModalImage(currentImageIndex - 1);
        else if (e.key === 'ArrowRight') updateModalImage(currentImageIndex + 1);
    });

    // Lazy load grid images with Intersection Observer
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 100px 0px' });

    images.forEach(img => {
        if (!img.src) {
            img.dataset.src = img.getAttribute('src');
            img.src = '';
            observer.observe(img);
        }
    });
});