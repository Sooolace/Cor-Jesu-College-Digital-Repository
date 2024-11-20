import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const MostViewed = () => {
  const [mostViewedDocs, setMostViewedDocs] = useState([]);

  useEffect(() => {
    // Fetch the data from your backend API
    const fetchMostViewed = async () => {
      try {
        const response = await fetch('/api/projects/top-viewed'); // Replace with your actual endpoint
        const data = await response.json();
  
        // Log the response to check its structure
        console.log("Fetched data:", data);
  
        // Check if the response is an array
        if (Array.isArray(data)) {
          setMostViewedDocs(data);  // Set the response to state
        } else {
          console.error("Expected an array but received:", data);
        }
      } catch (error) {
        console.error('Error fetching most viewed projects:', error);
      }
    };
  
    fetchMostViewed();
  }, []);
  

  return (
    <div className="most-viewed-container">
      <h3>Most Viewed</h3>
      {mostViewedDocs.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ul>
          {mostViewedDocs.slice(0, 10).map((doc, index) => (
            <li key={index} className="most-viewed-item">
              <FontAwesomeIcon icon={faEye} /> {doc.title} - <span>{doc.view_count} Views</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
};

export default MostViewed;
