import React, { useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import './styles/yearRangeFilter.css';

const YearRangeFilter = ({ selectedYears, setSelectedYears, onApply }) => {
  const [fromYear, setFromYear] = useState(selectedYears[0]);
  const [toYear, setToYear] = useState(selectedYears[1]);

  const handleApply = () => {
    setSelectedYears([fromYear, toYear]);
    onApply([fromYear, toYear]);
  };

  return (
    <div className="year-range-filter">
      <h3>Filter by Year</h3>
      <Range
        values={[fromYear, toYear]}
        step={1}
        min={1900}
        max={new Date().getFullYear()}
        onChange={(values) => {
          setFromYear(values[0]);
          setToYear(values[1]);
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '6px',
              width: '100%',
              background: getTrackBackground({
                values: [fromYear, toYear],
                colors: ['#ccc', '#007bff', '#ccc'],
                min: 1900,
                max: new Date().getFullYear(),
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
        <span>{fromYear}</span> - <span>{toYear}</span>
      </div>
      <div className="button-container">
        <button className="apply-button" onClick={handleApply}>
          Apply Year Range
        </button>
      </div>
    </div>
  );
};

export default YearRangeFilter;