import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios'; // Assuming you're using Axios for API calls
import '../styles/subjectfilter.css';

function SubjectFilter({ selectedCategories, setSelectedCategories, onApply }) {
  const [expandedAreas, setExpandedAreas] = useState({});
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch categories, research areas, and topics from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data || []); 
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleDepartmentChange = (department) => {
    const isDepartmentSelected = selectedCategories.includes(department);

    if (isDepartmentSelected) {
      setSelectedCategories(selectedCategories.filter(item => item !== department));
    } else {
      setSelectedCategories([...selectedCategories, department]);
    }
  };

  const handleCategoryChange = (department, category) => {
    const isCategorySelected = selectedCategories.includes(category);
    if (isCategorySelected) {
      setSelectedCategories(selectedCategories.filter(item => item !== category));
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
        Filter by Category
      </button>

      {isOpen && (
        <>
          <div className="dropdown-content">
            <div className="subject-list">
              {Array.isArray(categories) &&
                categories.map(department => (
                  <div key={department.category_id} className="category-group">
                    <div className="form-check category-checkbox">
                      <FontAwesomeIcon
                        icon={expandedAreas[department.category_id] ? faChevronDown : faChevronRight}
                        style={{ marginRight: '10px', cursor: 'pointer' }}
                        onClick={() => toggleAreaExpansion(department.category_id)}
                      />
                      <input
                        type="checkbox"
                        id={department.category_id}
                        checked={selectedCategories.includes(department.category_id)}
                        onChange={() => handleDepartmentChange(department.category_id)}
                      />
                      <label htmlFor={department.category_id} style={{ marginLeft: '5px', fontWeight: 'bold' }}>
                        {department.name}
                      </label>
                    </div>

                    {expandedAreas[department.category_id] && (
                      <div style={{ marginLeft: '20px' }}>
                        {Array.isArray(department.research_areas) &&
                          department.research_areas.map(area => (
                            <div key={area.research_area_id}>
                              <div className="form-check category-checkbox">
                                <FontAwesomeIcon
                                  icon={expandedAreas[area.research_area_id] ? faChevronDown : faChevronRight}
                                  style={{ marginRight: '10px', cursor: 'pointer' }}
                                  onClick={() => toggleAreaExpansion(area.research_area_id)}
                                />
                                <input
                                  type="checkbox"
                                  id={area.research_area_id}
                                  checked={selectedCategories.includes(area.research_area_id)}
                                  onChange={() => handleCategoryChange(department.category_id, area.research_area_id)}
                                />
                                <label
                                  htmlFor={area.research_area_id}
                                  style={{ marginLeft: '5px', fontWeight: 'bold' }}
                                >
                                  {area.name}
                                </label>
                              </div>

                              {expandedAreas[area.research_area_id] && (
                                <div
                                  className="subcategories"
                                  style={{ marginLeft: '20px', marginTop: '5px' }}
                                >
                                  {Array.isArray(area.topics) &&
                                    area.topics.map(topic => (
                                      <div key={topic.topic_id} className="form-check">
                                        <input
                                          type="checkbox"
                                          id={topic.topic_id}
                                          checked={selectedCategories.includes(topic.topic_id)}
                                          onChange={() => handleSubcategoryChange(topic.topic_id)}
                                        />
                                        <label htmlFor={topic.topic_id} style={{ marginLeft: '5px' }}>
                                          {topic.name}
                                        </label>
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
