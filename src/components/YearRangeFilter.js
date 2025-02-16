import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import './styles/yearRangeFilter.css';

const YearRangeFilter = ({ minYear = 1900, maxYear = new Date().getFullYear(), onApply }) => {
  const [values, setValues] = useState([minYear, maxYear]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleApplyFilters = () => {
    if (onApply) {
      onApply(values);
    }
    setShowModal(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const results = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).filter((year) =>
      year.toString().includes(searchTerm)
    );
    setSearchResults(results);
  };

  return (
    <div className="subject-filter  ">
      <h3>Filter by Year</h3>
      <Range
        values={values}
        step={1}
        min={minYear}
        max={maxYear}
        onChange={(values) => setValues(values)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '6px',
              width: '100%',
              background: getTrackBackground({
                values,
                colors: ['#ccc', '#007bff', '#ccc'],
                min: minYear,
                max: maxYear,
              }),
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '20px',
              width: '20px',
              backgroundColor: '#007bff',
            }}
          />
        )}
      />
      <div className="year-range-values">
        <span>{values[0]}</span> - <span>{values[1]}</span>
      </div>
      <div className="button-container">
        <button className="apply-button" onClick={handleApplyFilters}>
          Set year range
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4>All Years</h4>
              <button className="close-button" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSearchSubmit} className="unique-search-form">
                <input
                  type="text"
                  placeholder="Search years..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="unique-search-input"
                />
                <button type="submit" className="unique-search-button">Search</button>
              </form>
              <div className="unique-year-list-scrollable">
                {searchResults.map((year) => (
                  <div key={year} className="unique-year-item filter-item">
                    <input
                      type="checkbox"
                      checked={values.includes(year)}
                      onChange={() => {
                        if (values.includes(year)) {
                          setValues(values.filter((v) => v !== year));
                        } else {
                          setValues([...values, year]);
                        }
                      }}
                    />
                    <label>{year}</label>
                  </div>
                ))}
              </div>
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

export default YearRangeFilter;
