const apiKey = "YOUR_UNSPLASH_ACCESS_KEY"; // Replace with your Unsplash API key

// Function to fetch a random historical photo
async function fetchRandomPhoto() {
    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=historical&client_id=${apiKey}`
        );
        const data = await response.json();
        if (data && data.urls && data.urls.regular) {
            return data.urls.regular; // URL for the image
        } else {
            throw new Error("No photo found");
        }
    } catch (error) {
        console.error("Error fetching photo:", error);
        return "./fallback.jpg"; // Fallback image if API call fails
    }
}

// Function to update the image
async function updatePhoto() {
    const imgElement = document.getElementById("historical-photo");
    const photoUrl = await fetchRandomPhoto();
    imgElement.src = photoUrl;
}

// Initial photo load
updatePhoto();

// Change photo every 6 seconds
setInterval(updatePhoto, 6000);
