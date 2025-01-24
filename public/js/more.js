document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector("#play-button-more");
    const audioElement = document.querySelector("#background-more");

    // Try to autoplay the audio when the page loads
    audioElement.play().catch(() => {
        console.info("Autoplay prevented. User interaction required.");
    });

    // Toggle play/pause on button click
    playButton.addEventListener("click", () => {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    });

    // Update button state on play/pause
    const updateButtonState = () => {
        playButton.classList.toggle("playing", !audioElement.paused);
    };

    audioElement.onplay = updateButtonState;
    audioElement.onpause = updateButtonState;
});