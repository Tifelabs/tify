// Clock functionality with better performance and formatting
const clockElement = document.getElementById('clock'); // Cache DOM reference

function updateClock() {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Initial call and efficient interval
updateClock();
setInterval(updateClock, 1000);

// Audio functionality with improved structure and error handling
document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector('#play-button');
    const audio = document.querySelector('#background-music');

    // Early return if elements not found
    if (!playButton || !audio) {
        console.warn('Audio elements not found');
        return;
    }

    // Toggle play/pause functionality
    const toggleAudio = () => {
        audio.paused ? audio.play().catch(e => console.error('Audio play failed:', e)) : audio.pause();
    };

    // Event listeners with consistent state management
    playButton.addEventListener('click', toggleAudio);
    audio.addEventListener('play', () => playButton.classList.toggle('playing', true));
    audio.addEventListener('pause', () => playButton.classList.toggle('playing', false));
});