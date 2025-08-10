const urlParams = new URLSearchParams(window.location.search);
const mdParam = urlParams.get('md') || 'default.md'; // Get the full md parameter
const mdFile = mdParam.split('/').pop(); // Extract just the filename (e.g., 'setup.md')

fetch(`/blogs/posts/${mdFile}`) // Load from /blogs/posts/
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load ${mdFile}: ${response.status} ${response.statusText}`);
        }
        return response.text();
    })
    .then(text => {
        if (!window.marked) {
            throw new Error('Marked.js library is not loaded');
        }

        let title = 'Untitled Post';
        let contentWithoutTitle = text;

        // Extract and remove the first-level heading if it exists
        const titleMatch = text.match(/^# (.+)/m);
        if (titleMatch) {
            title = titleMatch[1];
            contentWithoutTitle = text.replace(/^# .+\n+/, '');
        }

        // Convert remaining markdown to HTML
        const htmlContent = marked.parse(contentWithoutTitle);
        document.getElementById('post-content').innerHTML = htmlContent;

        // Set title in header and browser tab
        document.getElementById('post-title').textContent = title;
        document.title = `Tife - ${title}`;

        // Add modal click logic to images
        document.querySelectorAll('.content img').forEach(img => {
            img.addEventListener('click', () => {
                const modal = document.getElementById('modal');
                const modalImage = document.getElementById('modal-content');
                modal.style.display = 'flex';
                modalImage.src = img.src;
                modalImage.alt = img.alt;
            });
        });
    })
    .catch(error => {
        document.getElementById('post-content').innerHTML = `<p>Error loading blog post: ${error.message}. Please check the file path or try again later.</p>`;
        console.error('Fetch error for', mdFile, ':', error);
    });

// Modal close logic
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
