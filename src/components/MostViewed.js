import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMinus, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/mostviewed.css';
import PaginationComponent from '../components/PaginationComponent';

const MostViewed = ({ searchQuery }) => {
  const [mostViewedDocs, setMostViewedDocs] = useState(() => {
    const cached = sessionStorage.getItem('mostViewedDocs');
    return cached ? JSON.parse(cached) : [];
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(() => !sessionStorage.getItem('mostViewedDocs'));
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const itemsPerPage = 5;

  // Fetch most viewed documents from your API
  useEffect(() => {
    const fetchMostViewed = async () => {
      // Check for cached data
      const cached = sessionStorage.getItem('mostViewedDocs');
      if (cached) {
        setMostViewedDocs(JSON.parse(cached));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/projects/mostviewed');
        if (!response.ok) {
          throw new Error('Failed to fetch most viewed documents');
        }
        const data = await response.json();
        setMostViewedDocs(data);
        sessionStorage.setItem('mostViewedDocs', JSON.stringify(data));
      } catch (error) {
        setError('Failed to fetch most viewed documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostViewed();
  }, [mostViewedDocs.length]);

  // Function to update view count
  const updateViewCount = async (projectId) => {
    const lastViewed = localStorage.getItem(`lastViewed_${projectId}`);
    const now = new Date().getTime();
    const viewInterval = 60 * 60 * 1000; // 1 hour

    if (!lastViewed || now - lastViewed > viewInterval) {
      try {
        console.log(`Updating view count for project ID: ${projectId}`);
        const response = await fetch(`/api/projects/updateviewcount/${projectId}`, {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Failed to update view count');
        }
        localStorage.setItem(`lastViewed_${projectId}`, now);
        console.log(`View count updated for project ID: ${projectId}`);
      } catch (error) {
        console.error('Error updating view count:', error);
      }
    } else {
      console.log(`View count not updated for project ID: ${projectId} due to view interval`);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(mostViewedDocs.length / itemsPerPage);
  const displayedDocs = mostViewedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePagination = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
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
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {mostViewedDocs.length > 0 ? (
            <>
              <div className="table-container">
                <table className="results-table">
                  <tbody>
                    {displayedDocs.map((doc, index) => (
                      <React.Fragment key={doc.project_id}>
                        <tr>
                          <td>
                            <a
                              href={`/DocumentOverview/${doc.project_id}`}
                              onClick={() => updateViewCount(doc.project_id)}
                            >
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
                            <FontAwesomeIcon icon={faEye} /> {doc.view_count}
                          </td>
                        </tr>

                        {/* Dropdown Details Row */}
                        {expandedIndex === index && (
                          <tr className="details-row">
                            <td colSpan="3">
                              <div className="details-content">
                                <p>
                                  <FontAwesomeIcon icon={faUser} />
                                  {doc.authors ? (
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
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={(newPage) => setCurrentPage(newPage)}
              />
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
