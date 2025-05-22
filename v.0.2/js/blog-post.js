const urlParams = new URLSearchParams(window.location.search);
const mdFile = urlParams.get('md') || 'default.md';

fetch(`../blogs/${mdFile}`)
    .then(response => {
        if (!response.ok) throw new Error('Markdown file not found');
        return response.text();
    })
    .then(text => {
        document.getElementById('post-content').innerHTML = marked.parse(text);
        const title = text.match(/^# (.+)/m) || [, 'Untitled Post'];
        document.getElementById('post-title').textContent = title[1];
        document.title = `Tife - ${title[1]}`;
        // Add click event to images for modal
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
        document.getElementById('post-content').innerHTML = '<p>Error loading blog post. Please check the file path or server configuration.</p>';
        console.error('Error:', error);
    });

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});