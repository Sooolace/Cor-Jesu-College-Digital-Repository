import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMinus, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/mostviewed.css';
import PaginationComponent from '../components/PaginationComponent';

const MostViewed = ({ searchQuery }) => {
  const [mostViewedDocs, setMostViewedDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const itemsPerPage = 5; // Set the limit for items per page

  // Fetch most viewed documents from your API
  useEffect(() => {
    const fetchMostViewed = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects/mostviewed'); // Update endpoint to match your backend
        if (!response.ok) {
          throw new Error('Failed to fetch most viewed documents');
        }
        const data = await response.json();
        setMostViewedDocs(data); // No need for frontend sorting
      } catch (error) {
        console.error('Error fetching most viewed projects:', error);
        setError('Unable to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostViewed();
  }, []);
=======
  const [expandedIndex, setExpandedIndex] = useState(null); // Track which document is expanded
  const itemsPerPage = 5; // Set the limit for items per page

  // Fetch most viewed documents from your API
  useEffect(() => { 
    // Check if data is already stored in localStorage
    const cachedData = localStorage.getItem('mostViewedDocs');
    if (cachedData) {
      // If cached data is found, use it
      setMostViewedDocs(JSON.parse(cachedData));
      setIsLoading(false); // No need to load data again
    } else {
      // If no cached data, fetch it from the API
      const fetchMostViewed = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/projects'); // Replace with your actual API endpoint
          const data = await response.json();

          // Ensure the data is an array and contains the necessary properties
          if (Array.isArray(data)) {
            // Sort by view_count in descending order
            const sortedData = data.sort((a, b) => b.view_count - a.view_count);
            setMostViewedDocs(sortedData);
            // Cache the data in localStorage for subsequent visits
            localStorage.setItem('mostViewedDocs', JSON.stringify(sortedData));
          } else {
            console.error('Invalid data format:', data);
          }
        } catch (error) {
          console.error('Error fetching most viewed projects:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMostViewed();
    }
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

  // Pagination Logic
  const totalPages = Math.ceil(mostViewedDocs.length / itemsPerPage);
  const displayedDocs = mostViewedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePagination = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
<<<<<<< HEAD
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
=======
      setCurrentPage(prevPage => prevPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
    }
  };

  // Toggle dropdown for additional document details
  const toggleDetails = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null); // Close the dropdown if clicked again
    } else {
      setExpandedIndex(index); // Expand the dropdown
    }
  };

  return (
    <div className="most-viewed-container">
      <h3 className="section-title">{searchQuery ? `Search Results for "${searchQuery}"` : 'Most Viewed Documents'}</h3>

      {isLoading ? (
        <p className="loading-message">Loading...</p>
<<<<<<< HEAD
      ) : error ? (
        <p className="error-message">{error}</p>
=======
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      ) : (
        <>
          {mostViewedDocs.length > 0 ? (
            <>
              <div className="table-container">
                <table className="results-table">
                  <tbody>
                    {displayedDocs.map((doc, index) => (
<<<<<<< HEAD
                      <React.Fragment key={doc.project_id}>
=======
                      <React.Fragment key={index}>
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
                        <tr>
                          <td>
                            <a href={`/DocumentOverview/${doc.project_id}`}>
                              {doc.title}
                            </a>
                          </td>
                          <td>
                            <button
                              className="expand-icon"
                              onClick={() => toggleDetails(index)}
                            >
                              <FontAwesomeIcon icon={expandedIndex === index ? faMinus : faPlus} />
                            </button>
                          </td>
                          <td>
<<<<<<< HEAD
                            <FontAwesomeIcon icon={faEye} /> {doc.view_count}
=======
                            <FontAwesomeIcon icon={faEye} /> {doc.view_count} Views
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
                          </td>
                        </tr>

                        {/* Dropdown Details Row */}
                        {expandedIndex === index && (
                          <tr className="details-row">
                            <td colSpan="3">
                              <div className="details-content">
                                <p>
                                  <FontAwesomeIcon icon={faUser} />
<<<<<<< HEAD
                                  {doc.authors ? (
=======
                                  {doc.authors && doc.authors.length > 0 ? (
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
                                    doc.authors.split(',').map((author, index) => (
                                      <span key={index}>
                                        <a href={`/AuthorOverview/${encodeURIComponent(author.trim())}`} className="author-link">
                                          {author.trim()}
                                        </a>
                                        {index < doc.authors.split(',').length - 1 && ', '}
                                      </span>
                                    ))
                                  ) : (
                                    'No authors listed'
                                  )}
                                </p>
                                <p><FontAwesomeIcon icon={faCalendar} /> {new Date(doc.created_at).toLocaleDateString()}</p>
                                <p>Category: {doc.category || 'No category listed'}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <PaginationComponent
<<<<<<< HEAD
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={(newPage) => setCurrentPage(newPage)}
              />
=======
  currentPage={currentPage}
  totalPages={totalPages}
  handlePageChange={newPage => setCurrentPage(newPage)}
/>
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
            </>
          ) : (
            <p className="no-results-message">No most viewed documents found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default MostViewed;
