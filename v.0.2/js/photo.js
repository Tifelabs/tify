document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.querySelector('.modal-close');
    const images = document.querySelectorAll('.photo-grid .photo img');

    if (!modal || !modalImage || !modalClose) {
        console.error('Modal elements not found');
        return;
    }

    // Open modal on image click
    images.forEach(img => {
        img.addEventListener('click', () => {
            modal.style.display = 'block';
            modalImage.src = img.src;
            modalImage.alt = img.alt || 'Enlarged photo';
            modalImage.focus();
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    // Close modal on close button click
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    });

    // Close modal on background click
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    });
});