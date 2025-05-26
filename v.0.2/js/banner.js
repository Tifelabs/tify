document.addEventListener("DOMContentLoaded", function() {
    // Check if the banner exists on the page
    const banner = document.getElementById("banner");
    if (banner) {
        // Use the bannerImages array defined in the HTML page
        const bannerImages = window.bannerImages || [];
        console.log("Banner found, bannerImages:", bannerImages);
        let currentImageIndex = 0;
        const bannerImage = document.querySelector("#banner .banner-image");

        function changeBanner() {
            if (bannerImages.length > 0) {
                currentImageIndex = (currentImageIndex + 1) % bannerImages.length;
                bannerImage.src = bannerImages[currentImageIndex];
                console.log("Changed to image:", bannerImages[currentImageIndex]);
            } else {
                console.log("No bannerImages defined");
            }
        }

        // Start the banner cycle if there are images
        if (bannerImages.length > 0) {
            setInterval(changeBanner, 3000); // 
            console.log("Banner cycle started");
        } else {
            console.log("No images to cycle, banner not started");
        }
    } else {
        console.log("No banner element found");
    }
});