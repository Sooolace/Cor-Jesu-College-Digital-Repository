import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearchBar from '../../components/AdvancedSearchBar'; // Correct the import path
import './styles/advancedsearch.css';

function AdvancedSearch() {
  const navigate = useNavigate();

  const handleSearch = (inputs) => {
    navigate('/search', { state: { advancedSearchInputs: inputs } });
  };

  return (
    <div className="advanced-search-container">
      <h2 className="text-center mb-4">Advanced Search</h2>
      <div className="adv-searchbar-content">
        <AdvancedSearchBar onSearch={handleSearch} />
      </div>
    </div>
  );
}

export default AdvancedSearch;