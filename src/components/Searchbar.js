import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../pages/user/styles/searchbar.css';

function SearchBar({ query, onChange, selectedOption, onOptionChange, onSearch }) {
  return (
    <section className="search-section">
      <div className="search-container">
        <select
          id="searchOptions"
          className="search-options"
          value={selectedOption}
          onChange={(e) => onOptionChange(e.target.value)} // Just updates the selectedOption
        >
          <option value="allfields">All Fields</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="keywords">Keywords</option>
          <option value="abstract">Abstract</option>
        </select>
        <input
          type="text"
          id="searchBar"
          className="searchBar"
          placeholder="Search for..."
          value={query}
          onChange={(e) => onChange(e.target.value)} // Updates typedQuery
        />
        <button className="btn-search" onClick={onSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </section>
  );
}

export default SearchBar;
