// pages/user/NotFound.js
import React from 'react';

const NotFound = () => {
  return (
    <div className="container text-center mt-5" style={{ maxWidth: '600px', marginTop: '100px' }}>
      <h3 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#FF6347' }}>404</h3>
      <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>Oops! Page Not Found</h3>
      <p style={{ fontSize: '1.2rem', color: '#777' }}>
        The page you are looking for might have been removed or you might have typed the URL incorrectly.
      </p>
      <a
        href="/"
        style={{
            display: 'inline-block',
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#a33307',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '20px',
          fontWeight: 'bold',
        }}
      >
        Go Back to Home
      </a>
    </div>
  );
};

export default NotFound;
