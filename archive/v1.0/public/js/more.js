document.addEventListener("DOMContentLoaded", () => {
    // Cache DOM elements
    const playButton = document.querySelector("#play-button-more");
    const audioElement = document.querySelector("#background-more");

    // Early return if elements not found
    if (!playButton || !audioElement) {
        console.warn('Audio control elements not found');
        return;
    }

    // Audio control functions
    const toggleAudio = () => {
        audioElement.paused 
            ? audioElement.play().catch(e => console.error('Audio playback failed:', e))
            : audioElement.pause();
    };

    const updateButtonState = () => {
        playButton.classList.toggle("playing", audioElement.paused === false);
    };

    // Initial setup
    audioElement.play().catch(() => {
        console.log('Autoplay blocked by browser');
        updateButtonState(); // Ensure button reflects initial state
    });

    // Event listeners
    playButton.addEventListener("click", toggleAudio);
    audioElement.addEventListener("play", updateButtonState);
    audioElement.addEventListener("pause", updateButtonState);
});