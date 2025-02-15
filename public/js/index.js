// Clock functionality to display current time
function updateClock() {
    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(unit => String(unit).padStart(2, '0'))
        .join(':');
    document.getElementById('clock').textContent = time;
}

// Update the clock immediately and every second
updateClock();
setInterval(updateClock, 1000);

// Audio functionality for playing music on the landing page
document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector('#play-button');
    const audio = document.querySelector('#background-music');

    // Toggle play/pause on button click
    playButton.addEventListener('click', () => {
        audio.paused ? audio.play() : audio.pause();
    });

    // Update button state on play/pause
    audio.addEventListener('play', () => playButton.classList.add('playing'));
    audio.addEventListener('pause', () => playButton.classList.remove('playing'));
});