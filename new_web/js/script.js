document.getElementById('mode-toggle').addEventListener('click', function () {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');

    // Change the button icon depending on the mode
    if (document.body.classList.contains('light-mode')) {
        this.textContent = '☀️';
    } else {
        this.textContent = '🌙';
    }
});

//Views for JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display the view count
    fetch('/views')
        .then(response => response.json())
        .then(data => {
            document.getElementById('view-count').textContent = data.count;
        })
        .catch(error => console.error('Error fetching view count:', error));

    // Update the view count
    fetch('/update-view', { method: 'POST' })
        .catch(error => console.error('Error updating view count:', error));
});


// Reaction Counter
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display the view count
    fetch('/views')
        .then(response => response.json())
        .then(data => {
            document.getElementById('view-count').textContent = data.count;
        })
        .catch(error => console.error('Error fetching view count:', error));

    // Update the view count
    fetch('/update-view', { method: 'POST' })
        .catch(error => console.error('Error updating view count:', error));

    // Fetch and display reactions count
    fetch('/reactions')
        .then(response => response.json())
        .then(data => {
            document.getElementById('reaction-count').textContent = data.count;
        })
        .catch(error => console.error('Error fetching reactions:', error));

    // Handle love button click
    document.getElementById('love-button').addEventListener('click', () => {
        fetch('/react', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('reaction-count').textContent = data.count;
                    document.getElementById('love-button').disabled = true;
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error reacting:', error));
    });
});
