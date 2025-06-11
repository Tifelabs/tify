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

//DONATION STUFF
        function handleDonate() {
            alert("Thank you for your interest in donating!You'll be redirected to the donation page.");
            window.location.href = "https://ko-fi.com/tifelabs";
}

//THEME STUFF
function changeTheme() {
    const theme = document.getElementById('style').value;
    document.body.className = ''; // Reset classes
    document.body.classList.add(theme);
    localStorage.setItem('selectedTheme', theme); // Save theme
}

// Apply saved theme on page load
window.onload = function() {
const savedTheme = localStorage.getItem('selectedTheme');
if (savedTheme) {
    document.getElementById('style').value = savedTheme;
    document.body.classList.add(savedTheme);
   }
};