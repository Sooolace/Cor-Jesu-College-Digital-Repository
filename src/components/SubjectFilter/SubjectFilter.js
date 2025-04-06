import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/subjectfilter.css';

const SubjectFilter = (props) => {
  console.log("SubjectFilter component rendering", props);
  
  // Ensure selectedCategories is always an array
  const { 
    selectedCategories: rawSelectedCategories = [], 
    setSelectedCategories, 
    onApply 
  } = props;
  
  // Convert selectedCategories to array if it's not already
  const selectedCategories = Array.isArray(rawSelectedCategories) ? rawSelectedCategories : [];
  
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedResearchArea, setExpandedResearchArea] = useState(null);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Additional state to store research areas and topics
  const [researchAreas, setResearchAreas] = useState({});  // Map of categoryId -> research areas
  const [topics, setTopics] = useState({});  // Map of researchAreaId -> topics
  const [loadingResearchAreas, setLoadingResearchAreas] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Log expanded states for debugging
  useEffect(() => {
    console.log("Expanded category:", expandedCategory);
    console.log("Expanded research area:", expandedResearchArea);
  }, [expandedCategory, expandedResearchArea]);

  // Fetch categories on component mount
  useEffect(() => {
    console.log("Fetching categories...");
    setIsLoading(true);
    
    // Fetch all categories
    axios.get('/api/categories')
      .then(response => {
        console.log("Categories fetched:", response.data);
        setCategories(response.data || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
        setIsLoading(false);
      });
  }, []);

  // Log categories when they change
  useEffect(() => {
    console.log("Categories state updated:", categories);
    if (categories.length > 0) {
      console.log("First category:", categories[0]);
    }
  }, [categories]);

  // Fetch research areas when a category is expanded
  useEffect(() => {
    if (expandedCategory) {
      // Check if we've already fetched research areas for this category
      if (!researchAreas[expandedCategory]) {
        setLoadingResearchAreas(true);
        console.log(`Fetching research areas for category ${expandedCategory}...`);
        
        axios.get(`/api/researchAreas/${expandedCategory}`)
          .then(response => {
            console.log(`Research areas for category ${expandedCategory}:`, response.data);
            // Update the research areas map with the new data
            setResearchAreas(prev => ({
              ...prev,
              [expandedCategory]: response.data || []
            }));
            setLoadingResearchAreas(false);
          })
          .catch(error => {
            console.error(`Error fetching research areas for category ${expandedCategory}:`, error);
            // Set empty array if there's an error
            setResearchAreas(prev => ({
              ...prev,
              [expandedCategory]: []
            }));
            setLoadingResearchAreas(false);
          });
      }
    }
  }, [expandedCategory, researchAreas]);

  // Fetch topics when a research area is expanded
  useEffect(() => {
    if (expandedResearchArea) {
      // Check if we've already fetched topics for this research area
      if (!topics[expandedResearchArea]) {
        setLoadingTopics(true);
        console.log(`Fetching topics for research area ${expandedResearchArea}...`);
        
        axios.get(`/api/topics/${expandedResearchArea}`)
          .then(response => {
            console.log(`Topics for research area ${expandedResearchArea}:`, response.data);
            // Update the topics map with the new data
            setTopics(prev => ({
              ...prev,
              [expandedResearchArea]: response.data || []
            }));
            setLoadingTopics(false);
          })
          .catch(error => {
            console.error(`Error fetching topics for research area ${expandedResearchArea}:`, error);
            // Set empty array if there's an error
            setTopics(prev => ({
              ...prev,
              [expandedResearchArea]: []
            }));
            setLoadingTopics(false);
          });
      }
    }
  }, [expandedResearchArea, topics]);

  // Log selected categories when they change
  useEffect(() => {
    if (selectedCategories) {
      console.log("Selected categories updated:", 
        Array.isArray(selectedCategories) ? selectedCategories : "Non-array value: " + typeof selectedCategories
      );
    }
  }, [selectedCategories]);

  const toggleCategory = (categoryId) => {
    console.log("Toggle category:", categoryId);
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setExpandedResearchArea(null);
    } else {
      setExpandedCategory(categoryId);
      setExpandedResearchArea(null);
    }
  };

  const toggleResearchArea = (researchAreaId) => {
    console.log("Toggle research area:", researchAreaId);
    if (expandedResearchArea === researchAreaId) {
      setExpandedResearchArea(null);
    } else {
      setExpandedResearchArea(researchAreaId);
    }
  };

  const handleCategorySelect = (categoryId) => {
    console.log("Selecting category:", categoryId);
    const category = categories.find(cat => cat.category_id === categoryId);
    
    if (!category) return;
    
    const currentSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
    const newSelectedCategories = [...currentSelectedCategories];
    const existingIndex = newSelectedCategories.findIndex(cat => cat.category_id === categoryId);
    
    if (existingIndex !== -1) {
      newSelectedCategories.splice(existingIndex, 1);
    } else {
      newSelectedCategories.push(category);
    }
    
    // Only call setSelectedCategories if it's a function
    if (typeof setSelectedCategories === 'function') {
      setSelectedCategories(newSelectedCategories);
    }
  };

  const handleResearchAreaSelect = (researchAreaId, categoryId) => {
    console.log("Selecting research area:", researchAreaId);
    const currentSelectedResearchAreas = Array.isArray(selectedResearchAreas) ? selectedResearchAreas : [];
    const updatedAreas = [...currentSelectedResearchAreas];
    const existingIndex = updatedAreas.findIndex(area => area.research_area_id === researchAreaId);
    
    if (existingIndex !== -1) {
      updatedAreas.splice(existingIndex, 1);
    } else {
      const researchArea = researchAreas[categoryId]?.find(area => area.research_area_id === researchAreaId);
      if (researchArea) {
        updatedAreas.push(researchArea);
      }
    }
    
    setSelectedResearchAreas(updatedAreas);
  };

  const handleTopicSelect = (topicId, researchAreaId) => {
    console.log("Selecting topic:", topicId);
    const currentSelectedTopics = Array.isArray(selectedTopics) ? selectedTopics : [];
    const updatedTopics = [...currentSelectedTopics];
    const existingIndex = updatedTopics.findIndex(topic => topic.topic_id === topicId);
    
    if (existingIndex !== -1) {
      updatedTopics.splice(existingIndex, 1);
    } else {
      const topic = topics[researchAreaId]?.find(topic => topic.topic_id === topicId);
      if (topic) {
        updatedTopics.push(topic);
      }
    }
    
    setSelectedTopics(updatedTopics);
  };

  const handleApplyFilters = () => {
    console.log("Applying filters");
    
    // Ensure we have arrays for all selected items
    const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
    const safeSelectedResearchAreas = Array.isArray(selectedResearchAreas) ? selectedResearchAreas : [];
    const safeSelectedTopics = Array.isArray(selectedTopics) ? selectedTopics : [];
    
    console.log("Selected categories:", safeSelectedCategories);
    console.log("Selected research areas:", safeSelectedResearchAreas);
    console.log("Selected topics:", safeSelectedTopics);
    
    // Only call onApply if it's a function
    if (typeof onApply === 'function') {
      onApply({
        categories: safeSelectedCategories,
        researchAreas: safeSelectedResearchAreas,
        topics: safeSelectedTopics
      });
    } else {
      console.warn("onApply is not a function. Cannot apply filters.");
    }
  };

  const isCategorySelected = (categoryId) => {
    return Array.isArray(selectedCategories) && selectedCategories.some(cat => cat.category_id === categoryId);
  };

  const isResearchAreaSelected = (researchAreaId) => {
    return Array.isArray(selectedResearchAreas) && selectedResearchAreas.some(area => area.research_area_id === researchAreaId);
  };

  const isTopicSelected = (topicId) => {
    return Array.isArray(selectedTopics) && selectedTopics.some(topic => topic.topic_id === topicId);
  };

  if (isLoading) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (categories.length === 0) {
    return <div className="no-data">No categories available.</div>;
  }

  return (
    <div className="subject-filter-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* Title outside */}
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '8px', 
        color: '#333',
        padding: '0 5px',
        fontSize: '18px',
        fontWeight: '500',
        textTransform: 'none',
        letterSpacing: '0.5px'
      }}>Filter by Category</h3>
      
      {/* Main filter content */}
      <div className="subject-filter" style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '8px'
      }}>
        <div className="dropdown-content">
          <ul className="categories-list" style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0 
          }}>
            {categories.map(category => (
              <li key={category.category_id} className="category-item" style={{ 
                marginBottom: '6px',
                borderBottom: '1px solid #eee',
                paddingBottom: '6px'
              }}>
                <div className="category-header" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    fontWeight: isCategorySelected(category.category_id) ? '500' : 'normal',
                    fontSize: '15px',
                    color: '#444'
                  }}>
                    <input
                      type="checkbox"
                      checked={isCategorySelected(category.category_id)}
                      onChange={() => handleCategorySelect(category.category_id)}
                      style={{ marginRight: '8px' }}
                    />
                    {category.name}
                  </label>
                  <button
                    className={`expand-button ${expandedCategory === category.category_id ? 'expanded' : ''}`}
                    onClick={() => toggleCategory(category.category_id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'transform 0.2s ease',
                      transform: expandedCategory === category.category_id ? 'rotate(90deg)' : 'rotate(0deg)',
                      color: '#555',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      marginLeft: '4px'
                    }}
                  >
                    &gt;
                  </button>
                </div>
                
                {expandedCategory === category.category_id && (
                  <div className="research-areas-container" style={{
                    paddingLeft: '20px',
                    marginTop: '6px'
                  }}>
                    {loadingResearchAreas ? (
                      <div className="loading-indicator" style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        padding: '4px 0' 
                      }}>Loading research areas...</div>
                    ) : (
                      researchAreas[category.category_id] && researchAreas[category.category_id].length > 0 ? (
                        <ul className="research-areas-list" style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: 0 
                        }}>
                          {researchAreas[category.category_id].map(researchArea => (
                            <li key={researchArea.research_area_id} className="research-area-item" style={{
                              marginBottom: '5px',
                              paddingBottom: '5px'
                            }}>
                              <div className="research-area-header" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                              }}>
                                <label style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: isResearchAreaSelected(researchArea.research_area_id) ? '500' : 'normal',
                                  color: '#444'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={isResearchAreaSelected(researchArea.research_area_id)}
                                    onChange={() => handleResearchAreaSelect(researchArea.research_area_id, category.category_id)}
                                    style={{ marginRight: '8px' }}
                                  />
                                  {researchArea.name}
                                </label>
                                <button
                                  className={`expand-button ${expandedResearchArea === researchArea.research_area_id ? 'expanded' : ''}`}
                                  onClick={() => toggleResearchArea(researchArea.research_area_id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    transition: 'transform 0.2s ease',
                                    transform: expandedResearchArea === researchArea.research_area_id ? 'rotate(90deg)' : 'rotate(0deg)',
                                    color: '#555',
                                    width: '22px',
                                    height: '22px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    marginLeft: '4px'
                                  }}
                                >
                                  &gt;
                                </button>
                              </div>
                              
                              {expandedResearchArea === researchArea.research_area_id && (
                                <div className="topics-container" style={{
                                  paddingLeft: '20px',
                                  marginTop: '4px'
                                }}>
                                  {loadingTopics ? (
                                    <div className="loading-indicator" style={{ 
                                      fontSize: '13px', 
                                      color: '#666', 
                                      padding: '3px 0' 
                                    }}>Loading topics...</div>
                                  ) : (
                                    topics[researchArea.research_area_id] && topics[researchArea.research_area_id].length > 0 ? (
                                      <ul className="topics-list" style={{ 
                                        listStyle: 'none', 
                                        padding: 0, 
                                        margin: 0 
                                      }}>
                                        {topics[researchArea.research_area_id].map(topic => (
                                          <li key={topic.topic_id} className="topic-item" style={{ 
                                            marginBottom: '3px',
                                            fontSize: '13px'
                                          }}>
                                            <label style={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              cursor: 'pointer',
                                              fontWeight: isTopicSelected(topic.topic_id) ? '500' : 'normal',
                                              color: '#444'
                                            }}>
                                              <input
                                                type="checkbox"
                                                checked={isTopicSelected(topic.topic_id)}
                                                onChange={() => handleTopicSelect(topic.topic_id, researchArea.research_area_id)}
                                                style={{ marginRight: '6px' }}
                                              />
                                              {topic.name}
                                            </label>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <div className="no-data" style={{ 
                                        fontSize: '13px', 
                                        color: '#888', 
                                        padding: '3px 0',
                                        fontStyle: 'italic'
                                      }}>No topics available for this research area.</div>
                                    )
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="no-data" style={{ 
                          fontSize: '14px', 
                          color: '#888', 
                          padding: '3px 0',
                          fontStyle: 'italic'
                        }}>No research areas available for this category.</div>
                      )
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Apply button outside */}
      <button 
        className="apply-button" 
        onClick={handleApplyFilters}
        style={{
          backgroundColor: '#a33307',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontWeight: '500',
          width: 'fit-content',
          minWidth: '60px',
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

export default SubjectFilter;
