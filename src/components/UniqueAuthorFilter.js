import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/uniqueAuthorFilter.css';

const UniqueAuthorFilter = ({ selectedAuthors = [], setSelectedAuthors, onApply }) => {
  const [authors, setAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch all authors
  useEffect(() => {
    axios
      .get('/api/authors')
      .then((response) => {
        const sortedAuthors = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setAuthors(sortedAuthors);
        setSearchResults(sortedAuthors); // Show all authors initially
      })
      .catch((error) => {
        console.error('Error fetching authors:', error);
        // Consider adding user feedback here, like a message or alert
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
    setShowModal(false); // Close the modal
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const results = authors.filter((author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="unique-author-filter">
      <h3>Filter by Author</h3>
      <div className="unique-author-list">
        {authors.slice(0, 6).map((author) => (
          <div key={author.author_id} className="unique-author-item filter-item">
            <input
              type="checkbox"
              checked={selectedAuthors.includes(author.author_id)}
              onChange={() => toggleAuthorSelection(author.author_id)}
            />
            <label>
              {author.name}
              {author.category_name && (
                <span className="unique-author-category"> ({author.category_name})</span>
              )}
            </label>
          </div>
        ))}
      </div>

      <div className="unique-button-container">
        {/* Apply Filters Button */}
        <button className="unique-apply-button" style={{ backgroundColor: '#a33307', padding: '6px 10px' }} onClick={handleApplyFilters}>
          Apply Filters
        </button>

        {/* See All Button */}
        {authors.length > 6 && (
          <button className="unique-see-all-button" style={{ backgroundColor: 'gray', padding: '6px 10px' }} onClick={handleSeeAll}>
            View More
          </button>
        )}
      </div>

      {/* Modal for all authors */}
      {showModal && (
        <div className="unique-modal-overlay">
          <div className="unique-modal-content">
            <div className="unique-modal-header">
              <h4>All Authors</h4>
              <button className="unique-close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="unique-modal-body">
              <form onSubmit={handleSearchSubmit} className="unique-search-form">
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="unique-search-input"
                />
                <button type="submit" className="unique-search-button">Search</button>
              </form>
              <div className="unique-author-list-scrollable">
                {searchResults.map((author) => (
                  <div key={author.author_id} className="unique-author-item filter-item">
                    <input
                      type="checkbox"
                      checked={selectedAuthors.includes(author.author_id)}
                      onChange={() => toggleAuthorSelection(author.author_id)}
                    />
                    <label>
                      {author.name}
                      {author.category_name && (
                        <span className="unique-author-category">
                          {' '}
                          ({author.category_name})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="unique-modal-footer">
              <button className="unique-apply-button" style={{ backgroundColor: '#a33307', padding: '6px 10px' }} onClick={handleApplyFilters}>
                Apply Filters
              </button>
              <button className="unique-close-button" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniqueAuthorFilter;
