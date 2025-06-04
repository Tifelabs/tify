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

    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        alertBox.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        alertBox.classList.remove('active');
    });
});