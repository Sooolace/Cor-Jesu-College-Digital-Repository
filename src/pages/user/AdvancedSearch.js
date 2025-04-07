import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearchBar from '../../components/AdvancedSearchBar';
import './styles/advancedsearch.css';
import { FaSpinner } from 'react-icons/fa';

function AdvancedSearch() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved search inputs from localStorage
  useEffect(() => {
    const savedSearch = localStorage.getItem('advancedSearchInputs');
    if (savedSearch) {
      try {
        const parsedSearch = JSON.parse(savedSearch);
        // You can use this to initialize the AdvancedSearchBar component
        // with previously saved search inputs
      } catch (err) {
        console.error('Error parsing saved search inputs:', err);
      }
    }
  }, []);

  const handleSearch = async (searchData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate search inputs
      if (!searchData.inputs || searchData.inputs.length === 0) {
        throw new Error('Please add at least one search term');
      }

      // Check if any search term is empty
      const hasEmptyTerms = searchData.inputs.some(input => !input.query.trim());
      if (hasEmptyTerms) {
        throw new Error('Please fill in all search terms');
      }

      // Clean and format the search inputs to make sure they're in the correct format
      const cleanedInputs = searchData.inputs.map(input => ({
        query: input.query.trim(),
        option: input.option,
        condition: input.condition
      }));

      // Save search inputs to localStorage
      localStorage.setItem('advancedSearchInputs', JSON.stringify(cleanedInputs));

      // Navigate to search results
      navigate('/search', { 
        state: { 
          advancedSearchInputs: cleanedInputs,
          yearRange: searchData.yearRange,
          years: searchData.yearRange,
          page: 1,
          advancedSearch: true
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    localStorage.removeItem('advancedSearchInputs');
    // You can add logic to clear the AdvancedSearchBar component's state
  };

  return (
    <div className="advanced-search-container">
      <h2 className="text-center mb-4">Advanced Search</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="adv-searchbar-content">
        <AdvancedSearchBar 
          onSearch={handleSearch} 
          onClear={handleClearSearch}
          isLoading={isLoading}
        />
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <FaSpinner className="spinner" />
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
}

export default AdvancedSearch;