//Audio to play Lain Music at my ABOUT Page
document.addEventListener("DOMContentLoaded", function() {
    const playButton = document.getElementById("play-button-more");
    const audioElement = document.getElementById("background-more");

    // Autoplay the audio when the page loads
    audioElement.play().catch(error => {
        console.log("Autoplay was prevented. User interaction needed to start the audio.");
    });

    // Toggle play/pause on button click
    playButton.addEventListener("click", function() {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    });

    // Update button state on play/pause
    audioElement.addEventListener("play", function() {
        playButton.classList.add("playing");
    });

    audioElement.addEventListener("pause", function() {
        playButton.classList.remove("playing");
    });
});
