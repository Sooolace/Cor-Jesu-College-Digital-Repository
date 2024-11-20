import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { subjects } from './Subjects'; 
import '../../pages/user/styles/filter.css';

function SubjectFilter({ selectedCategories, setSelectedCategories, onApply }) {
  const [expandedAreas, setExpandedAreas] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const handleDepartmentChange = (department) => {
    const isDepartmentSelected = selectedCategories.includes(department);
    
    if (isDepartmentSelected) {
      const updatedCategories = selectedCategories.filter(item => item !== department);
      setSelectedCategories(updatedCategories);
    } else {
      setSelectedCategories([...selectedCategories, department]);
    }
  };

  const handleCategoryChange = (department, category) => {
    const isCategorySelected = selectedCategories.includes(category);
    if (isCategorySelected) {
      const updatedCategories = selectedCategories.filter(item => item !== category);
      setSelectedCategories(updatedCategories);
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubcategoryChange = (subcategory) => {
    if (selectedCategories.includes(subcategory)) {
      setSelectedCategories(selectedCategories.filter(item => item !== subcategory));
    } else {
      setSelectedCategories([...selectedCategories, subcategory]);
    }
  };

  const toggleAreaExpansion = (area) => {
    setExpandedAreas(prev => ({ ...prev, [area]: !prev[area] }));
  };

  return (
    <div className="subject-filter">
      <button
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', marginBottom: '10px', display: 'flex', alignItems: 'center' }}
      >
        <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} style={{ marginRight: '10px' }} />
        Select Subject Area
      </button>

      {isOpen && (
        <>
          <div className="dropdown-content">
            <div className="subject-list">
              {Object.keys(subjects).map(department => (
                <div key={department} className="category-group">
                  <div className="form-check category-checkbox">
                    <FontAwesomeIcon
                      icon={expandedAreas[department] ? faChevronDown : faChevronRight}
                      style={{ marginRight: '10px', cursor: 'pointer' }}
                      onClick={() => toggleAreaExpansion(department)}
                    />
                    <input
                      type="checkbox"
                      id={department}
                      checked={selectedCategories.includes(department)}
                      onChange={() => handleDepartmentChange(department)} 
                    />
                    <label htmlFor={department} style={{ marginLeft: '5px', fontWeight: 'bold' }}>{department}</label>
                  </div>

                  {expandedAreas[department] && (
                    <div style={{ marginLeft: '20px' }}>
                      {Object.keys(subjects[department]).map(category => (
                        <div key={category}>
                          <div className="form-check category-checkbox">
                            <FontAwesomeIcon
                              icon={expandedAreas[category] ? faChevronDown : faChevronRight}
                              style={{ marginRight: '10px', cursor: 'pointer' }}
                              onClick={() => toggleAreaExpansion(category)} 
                            />
                            <input
                              type="checkbox"
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryChange(department, category)} 
                            />
                            <label htmlFor={category} style={{ marginLeft: '5px', fontWeight: 'bold' }}>{category}</label>
                          </div>

                          {expandedAreas[category] && (
                            <div className="subcategories" style={{ marginLeft: '20px', marginTop: '5px' }}>
                              {subjects[department][category].map(subcategory => (
                                <div key={subcategory} className="form-check">
                                  <input
                                    type="checkbox"
                                    id={subcategory}
                                    checked={selectedCategories.includes(subcategory)}
                                    onChange={() => handleSubcategoryChange(subcategory)} 
                                  />
                                  <label htmlFor={subcategory} style={{ marginLeft: '5px' }}>{subcategory}</label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="apply-button-container">
            <button className="apply-button" onClick={onApply}>
              Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SubjectFilter;
