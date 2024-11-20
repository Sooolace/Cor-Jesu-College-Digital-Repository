// SearchBar.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/searchbar.css'; // Assuming you create a separate CSS file for styles

function SearchBar({ query, onChange, selectedOption, onOptionChange, onSearch }) {
  return (
    <section className="search-section">
      <div className="search-container">
        <select 
          id="searchOptions" 
          className="search-options" 
          value={selectedOption}
          onChange={(e) => onOptionChange(e.target.value)}
        >
          <option value="author">Author</option>
          <option value="title">Title</option>
          <option value="publisher">Publisher</option>
          <option value="year">Year</option>
          <option value="genre">Genre</option>
        </select>
        <input
          type="text"
          id="searchBar"
          className="searchBar"
          placeholder="Search for..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
        />
        <button className="btn-search" onClick={onSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </section>
  );
}

export default SearchBar;
