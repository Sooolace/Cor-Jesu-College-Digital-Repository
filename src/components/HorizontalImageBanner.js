import React, { useEffect, useState } from 'react';
import '../pages/user/styles/HorizontalImageBanner.css'; // CSS file for styling
import bannerImage from '../assets/lib-image.png'; // Import the image

const HorizontalImageBanner = React.memo(() => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if the image is already cached in localStorage
  useEffect(() => {
    const cachedImageStatus = localStorage.getItem('imageLoaded');
    if (cachedImageStatus) {
      setImageLoaded(true);
    } else {
      setImageLoaded(false);
    }
  }, []);

  // Trigger image loading and caching it after loading
  const handleImageLoad = () => {
    setImageLoaded(true);
    localStorage.setItem('imageLoaded', 'true'); // Cache that the image has been loaded
  };

  return (
    <div className="horizontal-image-banner">
      <img
        src={bannerImage}
        alt="Decorative banner"
        className="banner-image"
        onLoad={handleImageLoad} // Set to true when image loads
      />
    </div>
  );
});

export default HorizontalImageBanner;
