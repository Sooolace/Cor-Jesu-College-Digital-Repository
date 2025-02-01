import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/authorfilter.css';

const AuthorFilter = ({ selectedAuthors, setSelectedAuthors, onApply }) => {
  const [authors, setAuthors] = useState([]);
  const [displayedAuthors, setDisplayedAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch all authors
  useEffect(() => {
    axios
      .get('/api/authors')
      .then((response) => {
        const sortedAuthors = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setAuthors(sortedAuthors);
        setDisplayedAuthors(sortedAuthors.slice(0, 10)); // Show first 10 authors initially
      })
      .catch((error) => {
        console.error('Error fetching authors:', error);
      });
  }, []);

  // Toggle author selection
  const toggleAuthorSelection = (authorId) => {
    setSelectedAuthors((prevSelected) =>
      prevSelected.includes(authorId)
        ? prevSelected.filter((id) => id !== authorId) // Remove if already selected
        : [...prevSelected, authorId] // Add if not selected
    );
  };

  // Handle "See All" click
  const handleSeeAll = () => {
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Trigger apply filters
  const handleApplyFilters = () => {
    if (onApply) {
      // Pass the selectedAuthors back to parent component
      onApply(selectedAuthors);
    }
  };

  return (
    <div className="author-filter">
      <h3>Filter by Author</h3>
      <div className="author-list">
        {displayedAuthors.map((author) => (
          <div key={author.author_id} className="author-item">
            <input
              type="checkbox"
              checked={selectedAuthors.includes(author.author_id)}
              onChange={() => toggleAuthorSelection(author.author_id)}
            />
            <label>
              {author.name}
              {author.category_name && (
                <span className="author-category"> ({author.category_name})</span>
              )}
            </label>
          </div>
        ))}
      </div>

      {/* Apply Filters Button outside the modal */}
      <button className="apply-button" onClick={handleApplyFilters}>
        Apply Filters
      </button>

      {/* See All Button */}
      {authors.length > 10 && (
        <button className="see-all-button" onClick={handleSeeAll}>
          See All
        </button>
      )}

      {/* Modal for all authors */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>All Authors</h4>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {authors.map((author) => (
                <div key={author.author_id} className="author-item">
                  <input
                    type="checkbox"
                    checked={selectedAuthors.includes(author.author_id)}
                    onChange={() => toggleAuthorSelection(author.author_id)}
                  />
                  <label>
                    {author.name}
                    {author.category_name && (
                      <span className="author-category">
                        {' '}
                        ({author.category_name})
                      </span>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="apply-button" onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="close-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorFilter;
