import React from 'react';
import '../pages/user/styles/HorizontalImageBanner.css'; // CSS file for styling
import bannerImage from '../assets/lib-image.png'; // Import the image

function HorizontalImageBanner() {
  return (
    <div className="horizontal-image-banner">
      <img src={bannerImage} alt="Decorative banner" className="banner-image" />
    </div>
  );
}

export default HorizontalImageBanner;