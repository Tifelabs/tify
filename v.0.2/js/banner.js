document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('banner');
  const bannerImage = banner?.querySelector('.banner-image');
  const images = window.bannerImages ?? [];

  if (!banner || !bannerImage || images.length === 0) return;

  const setRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    bannerImage.src = images[randomIndex];
    bannerImage.alt = `Banner Image ${randomIndex + 1}`;
  };

  setRandomImage();
  const intervalId = setInterval(setRandomImage, 3000);

  // Cleanup 
  return () => clearInterval(intervalId);
});