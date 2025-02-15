document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.querySelector("#play-button-more");
    const audioElement = document.querySelector("#background-more");

    // Attempt to autoplay (browsers may block this without user interaction)
    audioElement.play().catch(() => {}); // Silently handle autoplay errors

    // Toggle play/pause on button click
    playButton.addEventListener("click", () => {
        audioElement.paused ? audioElement.play() : audioElement.pause();
    });

    // Update button state on play/pause
    const updateButtonState = () => {
        playButton.classList.toggle("playing", !audioElement.paused);
    };

    audioElement.addEventListener("play", updateButtonState);
    audioElement.addEventListener("pause", updateButtonState);
});