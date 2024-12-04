import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMinus, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/mostviewed.css';

const MostViewed = ({ searchQuery }) => {
  const [mostViewedDocs, setMostViewedDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null); // Track which document is expanded
  const itemsPerPage = 5; // Set the limit for items per page

  // Fetch most viewed documents from your API
  useEffect(() => {
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
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(mostViewedDocs.length / itemsPerPage);
  const displayedDocs = mostViewedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePagination = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
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
      ) : (
        <>
          {mostViewedDocs.length > 0 ? (
            <>
              <div className="table-container">
                <table className="results-table">
                  <tbody>
                    {displayedDocs.map((doc, index) => (
                      <React.Fragment key={index}>
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
                            <FontAwesomeIcon icon={faEye} /> {doc.view_count} Views
                          </td>
                        </tr>

                        {/* Dropdown Details Row */}
                        {expandedIndex === index && (
                          <tr className="details-row">
                            <td colSpan="3">
                              <div className="details-content">
                                <p>
                                  <FontAwesomeIcon icon={faUser} />
                                  {doc.authors && doc.authors.length > 0 ? (
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

              {/* Pagination Controls */}
              <div className="pagination-controls">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
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
