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
    <div className="year-range-filter" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '8px', 
        color: '#333',
        padding: '0 5px',
        fontSize: '18px',
        fontWeight: '500',
        textTransform: 'none',
        letterSpacing: '0.5px'
      }}>Set year range</h3>
      
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '8px'
      }}>
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
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          )}
        />
        <div className="year-range-values" style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '14px',
          color: '#444'
        }}>
          <span>{values[0]}</span> - <span>{values[1]}</span>
        </div>
      </div>
      
      <button 
        className="apply-button" 
        onClick={handleApplyFilters}
        style={{
          backgroundColor: '#a33307',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontWeight: '500',
          width: 'auto',
          alignSelf: 'center',
          fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#c03f08';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#a33307';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        Apply
      </button>
    </div>
  );
};

export default YearRangeFilter;