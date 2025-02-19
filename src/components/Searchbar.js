import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../pages/user/styles/searchbar.css';

function SearchBar({ query, onChange, selectedOption, onOptionChange, onSearch }) {
  // Function to handle pressing the Enter key
  const handleKeyPressInput = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  // Function to handle option changes
  const handleOptionChange = (e) => {
    onOptionChange(e.target.value);
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <select
          id="searchOptions"
          className="search-options"
          value={selectedOption}
          onChange={handleOptionChange}
        >
          <option value="allfields">All Fields</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="keywords">Keywords</option>
          <option value="abstract">Abstract</option>
          <option value="category">Category</option>
        </select>

        <input
          type="text"
          id="searchBar"
          className="searchBar"
          placeholder="Search for..."
          value={query || ''}
          onChange={handleInputChange}
          onKeyPress={handleKeyPressInput}
        />

        <button className="btn-search" onClick={onSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>

        <Link to="/advanced-search" className="advanced-search-link">
          Advanced Search
        </Link>
      </div>
    </section>
  );
}

export default SearchBar;