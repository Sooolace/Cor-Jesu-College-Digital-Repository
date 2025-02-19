import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/advancedsearch.css';

function AdvancedSearch() {
  const navigate = useNavigate();
  const [searchFields, setSearchFields] = useState([
    { field: 'title', value: '', operator: 'AND' },
    { field: 'author', value: '', operator: 'AND' },
    { field: 'keywords', value: '', operator: 'AND' },
    { field: 'abstract', value: '', operator: 'AND' },
    { field: 'category', value: '', operator: 'AND' }
  ]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFieldChange = (index, key, value) => {
    const newFields = [...searchFields];
    newFields[index] = { ...newFields[index], [key]: value };
    setSearchFields(newFields);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Filter out empty fields
    const filledFields = searchFields.filter(field => field.value.trim() !== '');
    
    // Create search parameters
    const searchParams = {
      searchFields: filledFields,
      dateRange: {
        startDate,
        endDate
      }
    };

    // Navigate to search page with search parameters
    navigate('/search', { 
      state: { 
        advancedSearch: true,
        searchParams
      }
    });
  };

  return (
    <div className="advanced-search-container">
      <h2 className="text-center mb-4">Advanced Search</h2>
      <form onSubmit={handleSearch}>
        {searchFields.map((field, index) => (
          <div key={index} className="search-field-group mb-3">
            <div className="field-row">
              <select 
                className="field-select"
                value={field.field}
                onChange={(e) => handleFieldChange(index, 'field', e.target.value)}
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="keywords">Keywords</option>
                <option value="abstract">Abstract</option>
                <option value="category">Category</option>
              </select>
              
              <input
                type="text"
                className="field-input"
                value={field.value}
                onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                placeholder={`Enter ${field.field}...`}
              />
              
              {index > 0 && (
                <select 
                  className="operator-select"
                  value={field.operator}
                  onChange={(e) => handleFieldChange(index, 'operator', e.target.value)}
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}
            </div>
          </div>
        ))}

        <div className="date-range-group mb-3">
          <label className="form-label">Publication Date Range:</label>
          <div className="date-inputs">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="button-container">
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>
    </div>
  );
}

export default AdvancedSearch;