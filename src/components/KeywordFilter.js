import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/keywordfilter.css';
import './styles/subjectfilter.css'; // Use the same styles as the subject filter

const KeywordFilter = ({ selectedKeywords, setSelectedKeywords, onApply }) => {
  const [keywords, setKeywords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch all keywords
  useEffect(() => {
    axios
      .get('/api/keywords')
      .then((response) => {
        const sortedKeywords = response.data.sort((a, b) =>
          a.keyword.localeCompare(b.keyword)
        );
        setKeywords(sortedKeywords);
        setSearchResults(sortedKeywords); // Show all keywords initially
      })
      .catch((error) => {
        console.error('Error fetching keywords:', error);
      });
  }, []);

  // Toggle keyword selection
  const toggleKeywordSelection = (keywordId) => {
    setSelectedKeywords((prevSelected) =>
      prevSelected.includes(keywordId)
        ? prevSelected.filter((id) => id !== keywordId) // Remove if already selected
        : [...prevSelected, keywordId] // Add if not selected
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
      onApply(selectedKeywords);
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
    const results = keywords.filter((keyword) =>
      keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="subject-filter"> {/* Use the same class as the subject filter */}
      <h3>Filter by Keyword</h3>
      <div className="dropdown-content">
        {keywords.slice(0, 6).map((keyword) => (
          <div key={keyword.keyword_id} className="category-group filter-item">
            <div className="category-checkbox">
              <input
                type="checkbox"
                checked={selectedKeywords.includes(keyword.keyword_id)}
                onChange={() => toggleKeywordSelection(keyword.keyword_id)}
              />
              <label>{keyword.keyword}</label>
            </div>
          </div>
        ))}
      </div>

      <div className="button-container">
        <button className="apply-button" style={{ backgroundColor: '#a33307', padding: '6px 10px' }} onClick={handleApplyFilters}>
          Apply Filters
        </button>
        {keywords.length > 6 && (
          <button className="see-all-button" style={{ backgroundColor: 'gray', padding: '6px 10px' }} onClick={handleSeeAll}>
            View More
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>All Keywords</h4>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
              </form>
              <div className="keyword-list-scrollable">
                {searchResults.map((keyword) => (
                  <div key={keyword.keyword_id} className="category-group filter-item">
                    <div className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(keyword.keyword_id)}
                        onChange={() => toggleKeywordSelection(keyword.keyword_id)}
                      />
                      <label>{keyword.keyword}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="apply-button" style={{ backgroundColor: '#a33307', padding: '6px 10px' }} onClick={handleApplyFilters}>
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

export default KeywordFilter;
