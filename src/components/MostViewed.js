import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMinus, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/mostviewed.css';
import PaginationComponent from '../components/PaginationComponent';

const MostViewed = ({ searchQuery }) => {
  const [mostViewedDocs, setMostViewedDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeViews, setActiveViews] = useState({});
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const itemsPerPage = 5;

  // Fetch most viewed documents from your API
  useEffect(() => {
    const fetchMostViewed = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/mostviewed');
        if (!response.ok) {
          throw new Error('Failed to fetch most viewed documents');
        }
        const data = await response.json();
        setMostViewedDocs(data);
        
        // Store in sessionStorage with timestamp
        const cacheData = {
          data: data,
          timestamp: Date.now()
        };
        sessionStorage.setItem('mostViewedDocs', JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error fetching most viewed documents:', error);
        setError('Failed to fetch most viewed documents');
        
        // Try to use cached data if available
        const cached = sessionStorage.getItem('mostViewedDocs');
        if (cached) {
          const cachedData = JSON.parse(cached);
          setMostViewedDocs(cachedData.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostViewed();
  }, [lastUpdated]);

  // Function to refresh the data
  const refreshData = () => {
    // Clear session storage cache
    sessionStorage.removeItem('mostViewedDocs');
    // Update the lastUpdated timestamp to trigger a re-fetch
    setLastUpdated(Date.now());
  };

  // Function to start tracking view
  const startViewTracking = async (projectId) => {
    try {
      // Check if we already have an ongoing view for this project
      if (activeViews[projectId]) {
        console.log(`Already tracking view for project ID: ${projectId}`);
        return;
      }

      const response = await fetch(`/api/projects/startview/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start view tracking');
      }

      const data = await response.json();
      
      // If view was already counted, no need to track
      if (data.alreadyCounted) {
        console.log(`View for project ID: ${projectId} was already counted today`);
        return;
      }
      
      const viewId = data.view_id;

      // Store the start time and view ID
      const startTime = Date.now();
      setActiveViews(prev => ({
        ...prev,
        [projectId]: { viewId, startTime }
      }));

      console.log(`Started tracking view for project ID: ${projectId}, view ID: ${viewId}`);
    } catch (error) {
      console.error('Error starting view tracking:', error);
    }
  };

  // Function to complete view tracking after sufficient duration (10+ seconds)
  const completeViewTracking = async (projectId) => {
    const viewInfo = activeViews[projectId];
    
    if (!viewInfo) {
      console.log(`No active view to complete for project ID: ${projectId}`);
      return;
    }

    const { viewId, startTime } = viewInfo;
    const duration = Math.floor((Date.now() - startTime) / 1000); // Duration in seconds

    try {
      // Only send the completion if the user spent at least 10 seconds on the page
      if (duration >= 10) {
        const response = await fetch(`/api/projects/completeview/${viewId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ duration }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to complete view tracking');
        }

        console.log(`Completed view for project ID: ${projectId} with duration: ${duration}s`);
        
        // Refresh the data after a successful view count
        setTimeout(() => refreshData(), 1000);
      } else {
        console.log(`View for project ID: ${projectId} not counted - duration was only ${duration}s (< 10s)`);
      }

      // Clean up the active view
      setActiveViews(prev => {
        const newActiveViews = { ...prev };
        delete newActiveViews[projectId];
        return newActiveViews;
      });
    } catch (error) {
      console.error('Error completing view tracking:', error);
    }
  };

  // Handle document view tracking when user clicks on a document
  const handleDocumentClick = (projectId) => {
    startViewTracking(projectId);
    
    // Create a hidden iframe to load the document content
    // This simulates user viewing the actual document
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `/DocumentOverview/${projectId}`;
    iframe.id = `view-iframe-${projectId}`;
    
    // Add event listener to complete tracking when the iframe is unloaded
    // (i.e., when the user leaves the page)
    iframe.addEventListener('load', () => {
      // Set a timer to complete the view after 10 seconds minimum
      setTimeout(() => {
        completeViewTracking(projectId);
        document.body.removeChild(iframe);
      }, 10000); // 10 seconds minimum
    });
    
    document.body.appendChild(iframe);
  };

  // Clean up function to complete any unfinished views when component unmounts
  useEffect(() => {
    return () => {
      // Complete any active views when the component unmounts
      Object.keys(activeViews).forEach(projectId => {
        completeViewTracking(projectId);
      });
    };
  }, [activeViews]);

  // Pagination Logic - limit to 10 items max (2 pages)
  const totalItems = Math.min(mostViewedDocs.length, 10);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Slice only up to 10 projects max
  const limitedDocs = mostViewedDocs.slice(0, 10);
  const displayedDocs = limitedDocs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                              onClick={(e) => {
                                e.preventDefault();
                                handleDocumentClick(doc.project_id);
                                window.location.href = `/DocumentOverview/${doc.project_id}`;
                              }}
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
