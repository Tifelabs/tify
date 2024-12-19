//CLOCK STUFFS TO GET CURRENT TIME
function updateClock() {
    const now = new Date();
    const [hours, minutes, seconds] = [
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    ].map(unit => String(unit).padStart(2, '0'));

    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

// Update the clock immediately and every second
updateClock();
setInterval(updateClock, 1000);


//Audio to play Lain Music at my Landing Page
document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector('#play-button');
    const audio = document.querySelector('#background-music');

    // Toggle play/pause on button click
    playButton.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });

    // Update button state on play/pause
    ["play", "pause"].forEach(event =>
        audio.addEventListener(event, () =>
            playButton.classList.toggle("playing", !audio.paused)
        )
    );
});
