import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../pages/user/styles/searchbar.css';

function SearchBar({ query, onChange, selectedOption, onOptionChange, onSearch, onClear }) {
  // Load initial state from localStorage if available
  useEffect(() => {
    const storedState = JSON.parse(localStorage.getItem('searchState')) || {};
    if (storedState.query) {
      onChange(storedState.query);
    }
    if (storedState.option) {
      onOptionChange(storedState.option);
    }
  }, [onChange, onOptionChange]);

  // Function to handle pressing the Enter key
  const handleKeyPressInput = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);  // Pass the event to SearchPage handler
    }
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <select
          id="searchOptions"
          className="search-options"
          value={selectedOption}
          onChange={(e) => onOptionChange(e.target.value)}
        >
          <option value="allfields">All Fields</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="keywords">Keywords</option>
          <option value="abstract">Abstract</option>
          <option value="category">Category</option>
        </select>

        <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
          {/* Input field with onKeyPress event */}
          <input
            type="text"
            id="searchBar"
            className="searchBar"
            placeholder="Search for..."
            value={query}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPressInput}
          />
          {query && (
            <button 
              className="clear-button" 
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px',
                color: '#666'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Search button */}
        <button className="btn-search" onClick={onSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>

        {/* Advanced search link */}
        <Link to="/advanced-search" className="advanced-search-link">
          Advanced Search
        </Link>
      </div>
    </section>
  );
}

export default SearchBar;
