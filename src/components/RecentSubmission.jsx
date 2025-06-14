import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/recentsubmissions.css';
import PaginationComponent from '../components/PaginationComponent';

const RecentSubmissions = ({ searchQuery }) => {
  const [submissions, setSubmissions] = useState(() => {
    try {
      const cached = sessionStorage.getItem('recentSubmissions');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error parsing cached data:', error);
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(() => !sessionStorage.getItem('recentSubmissions'));
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchSubmissions = async () => {
      // If we have cached data, don't fetch again
      if (submissions.length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/projects/projects/recent');
        if (!response.ok) {
          throw new Error('Failed to fetch recent submissions');
        }
        const data = await response.json();
        
        // Sort submissions by created_at
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setSubmissions(sortedData);
        sessionStorage.setItem('recentSubmissions', JSON.stringify(sortedData));
      } catch (error) {
        console.error('Error fetching recent submissions:', error);
        setError('Failed to fetch recent submissions');
        setSubmissions([]); // Ensure we have an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [submissions.length]);

  // Ensure submissions is always an array
  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  // Pagination Logic
  const totalPages = Math.ceil(safeSubmissions.length / itemsPerPage);
  const displayedSubmissions = safeSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePagination = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Toggle dropdown for additional details
  const toggleDetails = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null); // Close the dropdown if clicked again
    } else {
      setExpandedIndex(index); // Expand the dropdown
    }
  };

  return (
    <div className="recent-submissions-container">
      <h3 className="section-title">{searchQuery ? `Search Results for "${searchQuery}"` : 'Recent Submissions'}</h3>

      {isLoading ? (
        <p className="loading-message">Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {safeSubmissions.length > 0 ? (
            <>
              <div className="table-container">
                <table className="results-table">
                  <tbody>
                    {displayedSubmissions.map((submission, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td>
                            <Link to={`/DocumentOverview/${submission.project_id}`}>
                              {submission.title}
                            </Link>
                          </td>
                          <td>
                            <button
                              className="expand-icon"
                              onClick={() => toggleDetails(index)}
                            >
                              <FontAwesomeIcon icon={expandedIndex === index ? faMinus : faPlus} />
                            </button>
                          </td>
                        </tr>

                        {/* Dropdown Details Row */}
                        {expandedIndex === index && (
                          <tr className="details-row">
                            <td colSpan="2">
                              <div className="details-content">
                                <p>
                                  <FontAwesomeIcon icon={faUser} />
                                  {submission.authors && submission.authors.length > 0 ? (
                                    submission.authors.split(',').map((author, idx) => (
                                      <span key={idx}>
                                        <Link to={`/AuthorOverview/${encodeURIComponent(author.trim())}`} className="author-link">
                                          {author.trim()}
                                        </Link>
                                        {idx < submission.authors.split(',').length - 1 && ', '}
                                      </span>
                                    ))
                                  ) : (
                                    'No authors listed'
                                  )}
                                </p>
                                <p><FontAwesomeIcon icon={faCalendar} /> {new Date(submission.created_at).toLocaleDateString()}</p>
                                <p>Department: {submission.category_id || 'No category listed'}</p>
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
                handlePageChange={newPage => setCurrentPage(newPage)}
              />
            </>
          ) : (
            <p className="error-message">Failed to fetch recent submissions</p>
          )}
        </>
      )}
    </div>
  );
};

export default RecentSubmissions;
