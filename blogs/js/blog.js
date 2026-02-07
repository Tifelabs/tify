// 4chan-style image expansion
(function() {
    'use strict';
    
    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function() {
        
        // Get all images in the article (excluding already expanded ones)
        const images = document.querySelectorAll('article img, table img');
        
        images.forEach(function(img) {
            // Skip if already has click handler
            if (img.dataset.expandable) return;
            
            img.dataset.expandable = 'true';
            img.style.cursor = 'zoom-in';
            
            // Add click handler
            img.addEventListener('click', function(e) {
                e.preventDefault();
                expandImage(this);
            });
        });
    });
    
    function expandImage(img) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'img-expanded';
        
        // Clone the image
        const expandedImg = img.cloneNode(true);
        expandedImg.style.cursor = 'zoom-out';
        
        // Add to overlay
        overlay.appendChild(expandedImg);
        document.body.appendChild(overlay);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Close on click
        overlay.addEventListener('click', function() {
            closeExpanded(overlay);
        });
        
        // Close on ESC key
        function escapeHandler(e) {
            if (e.key === 'Escape') {
                closeExpanded(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        }
        document.addEventListener('keydown', escapeHandler);
        
        // Store escape handler for cleanup
        overlay.escapeHandler = escapeHandler;
    }
    
    function closeExpanded(overlay) {
        // Fade out animation
        overlay.style.opacity = '0';
        
        setTimeout(function() {
            overlay.remove();
            document.body.style.overflow = '';
        }, 200);
        
        // Remove escape handler
        if (overlay.escapeHandler) {
            document.removeEventListener('keydown', overlay.escapeHandler);
        }
    }
    
})();