//Clock Stuff
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const currentTime = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = currentTime;
}

setInterval(updateClock, 1000);
updateClock(); 


//Audio
// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the play button element
    var playButton = document.getElementById('play-button');
    
    // Get the audio element
    var audio = document.getElementById('background-music');
    
    // Add a click event listener to the play button
    playButton.addEventListener('click', function() {
        // Toggle play/pause of the audio
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });
});
