import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import './styles/yearRangeFilter.css';

const YearRangeFilter = ({ minYear = 1900, maxYear = new Date().getFullYear(), onApply }) => {
  const [values, setValues] = useState([minYear, maxYear]);

  const handleApplyFilters = () => {
    if (onApply) {
      onApply(values);
    }
  };

  return (
    <div className="year-range-filter">
      <h3>Set year range</h3>
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
              colors: ['#ccc', '#a33307', '#ccc'],
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
              backgroundColor: '#a33307',
            }}
          />
        )}
      />
      <div className="year-range-values">
        <span>{values[0]}</span> - <span>{values[1]}</span>
      </div>
      <div className="button-container">
        <button className="apply-button" onClick={handleApplyFilters}>
          Apply Year Range
        </button>
      </div>
    </div>
  );
};

export default YearRangeFilter;