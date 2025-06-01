document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

//ALERT
document.addEventListener('DOMContentLoaded', () => {
    const helpLink = document.getElementById('help-link');
    const alertBox = document.getElementById('custom-alert');
    const closeButton = document.getElementById('close-alert');

    // Show alert when [?] is clicked
    helpLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        alertBox.style.display = 'flex'; 
    });

    // Hide alert when OK button is clicked
    closeButton.addEventListener('click', () => {
        alertBox.style.display = 'none'; // Hide alert
    });

    // Optional: Hide alert when clicking outside the alert content
    alertBox.addEventListener('click', (e) => {
        if (e.target === alertBox) {
            alertBox.style.display = 'none';
        }
    });
});