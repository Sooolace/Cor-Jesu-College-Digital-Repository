import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Range, getTrackBackground } from 'react-range';
import { useNavigate } from 'react-router-dom';
import './styles/AdvancedSearchBar.css'; // Import the new CSS file

function AdvancedSearchBar({ onSearch }) {
  const [searchInputs, setSearchInputs] = useState([{ query: '', option: 'allfields', condition: 'AND' }]);
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
  const navigate = useNavigate();

  const handleInputChange = (index, field, value) => {
    const newSearchInputs = [...searchInputs];
    newSearchInputs[index][field] = value;
    setSearchInputs(newSearchInputs);
  };

  const handleAddSearchInput = () => {
    setSearchInputs([...searchInputs, { query: '', option: 'allfields', condition: 'AND' }]);
  };

  const handleRemoveSearchInput = (index) => {
    const newSearchInputs = searchInputs.filter((_, i) => i !== index);
    setSearchInputs(newSearchInputs);
  };

  const handleYearRangeChange = (values) => {
    setYearRange(values);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const inputsWithYearRange = searchInputs.map(input => ({
      ...input,
      yearRange
    }));
    onSearch({ inputs: inputsWithYearRange, yearRange });
    navigate('/search', { 
      state: { 
        advancedSearchInputs: inputsWithYearRange,
        yearRange: yearRange,
        years: yearRange, // Add this to match the expected format in SearchPage
        page: 1
      } 
    });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="adv-searchbar-form">
      {searchInputs.map((input, index) => (
        <div key={index} className="adv-searchbar-container">
          <select
            className="adv-searchbar-options"
            value={input.option}
            onChange={(e) => handleInputChange(index, 'option', e.target.value)}
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
            className="adv-searchbar-searchBar"
            placeholder="Search for..."
            value={input.query}
            onChange={(e) => handleInputChange(index, 'query', e.target.value)}
          />

          {index > 0 && (
            <select
              className="adv-searchbar-condition-options"
              value={input.condition}
              onChange={(e) => handleInputChange(index, 'condition', e.target.value)}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          )}

          {index > 0 && (
            <button type="button" className="adv-searchbar-remove-button" onClick={() => handleRemoveSearchInput(index)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}

          {index === searchInputs.length - 1 && (
            <button type="button" className="adv-searchbar-add-button" onClick={handleAddSearchInput}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}
        </div>
      ))}

      <div className="adv-searchbar-year-range">
        <h3>Set year range</h3>
        <Range
          values={yearRange}
          step={1}
          min={1900}
          max={new Date().getFullYear()}
          onChange={handleYearRangeChange}
          renderTrack={({ props, children }) => {
            const { key, ...rest } = props;
            return (
              <div
                key={key}
                {...rest}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  background: getTrackBackground({
                    values: yearRange,
                    colors: ['#ccc', '#a33307', '#ccc'],
                    min: 1900,
                    max: new Date().getFullYear(),
                  }),
                }}
              >
                {children}
              </div>
            );
          }}
          renderThumb={({ props }) => {
            const { key, ...rest } = props;
            return (
              <div
                key={key}
                {...rest}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#a33307',
                }}
              />
            );
          }}
        />
        <div className="year-range-values">
          <span>{yearRange[0]}</span> - <span>{yearRange[1]}</span>
        </div>
      </div>

      <div className="adv-searchbar-search-button-container">
        <button type="submit" className="adv-searchbar-btn-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </form>
  );
}

export default AdvancedSearchBar;
