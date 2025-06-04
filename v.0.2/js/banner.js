document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('banner');
    const bannerImage = banner.querySelector('.banner-image');
    const images = window.bannerImages || [];
    
    if (images.length === 0) return;

    const setRandomImage = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        bannerImage.src = images[randomIndex];
        bannerImage.alt = 'Banner Image';
    };

    setRandomImage(); // Set initial image
    setInterval(setRandomImage, 3000); // Change every 3seconds
});