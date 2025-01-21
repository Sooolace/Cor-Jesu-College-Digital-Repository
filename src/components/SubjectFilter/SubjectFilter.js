import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/subjectfilter.css';

const SubjectFilter = ({ selectedCategories, setSelectedCategories, onApply, handleClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedResearchArea, setExpandedResearchArea] = useState(null);
  const [selectedResearchAreas, setSelectedResearchAreas] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Fetch the categories with their research areas and topics
  useEffect(() => {
    const cachedCategories = localStorage.getItem('categories');

    if (cachedCategories) {
      // Use cached data if available
      const parsedCategories = JSON.parse(cachedCategories);
      setCategories(parsedCategories);
    } else {
      // Fetch data from API and cache it
      axios.get('/api/categories')
        .then(response => {
          const fetchedCategories = response.data;
          setCategories(fetchedCategories);
          localStorage.setItem('categories', JSON.stringify(fetchedCategories)); // Cache the categories data
        })
        .catch(error => {
          console.error("Error fetching categories", error);
        });
    }
  }, []);

  // Helper function to toggle selection of a category
  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prevState => {
      const isSelected = prevState.includes(categoryId);
      let newState;

      if (isSelected) {
        newState = prevState.filter(id => id !== categoryId);
        const category = categories.find(cat => cat.category_id === categoryId);
        const researchAreaIds = category.research_areas.map(ra => ra.research_area_id);
        const topicIds = category.research_areas.flatMap(ra => ra.topics.map(topic => topic.topic_id));

        setSelectedResearchAreas(prevResearchAreas => prevResearchAreas.filter(ra => !researchAreaIds.includes(ra)));
        setSelectedTopics(prevTopics => prevTopics.filter(topic => !topicIds.includes(topic)));
      } else {
        newState = [...prevState, categoryId];
        const category = categories.find(cat => cat.category_id === categoryId);
        const researchAreaIds = category.research_areas.map(ra => ra.research_area_id);
        const topicIds = category.research_areas.flatMap(ra => ra.topics.map(topic => topic.topic_id));

        setSelectedResearchAreas(prev => [...new Set([...prev, ...researchAreaIds])]);
        setSelectedTopics(prev => [...new Set([...prev, ...topicIds])]);
      }

      return newState;
    });
  };

  // Define the missing functions here:

  // Function to toggle research area selection
  const toggleResearchAreaSelection = (researchAreaId) => {
    setSelectedResearchAreas(prevState => {
      const isSelected = prevState.includes(researchAreaId);
      const newState = isSelected
        ? prevState.filter(id => id !== researchAreaId)
        : [...prevState, researchAreaId];

      const categoryId = categories.find(cat => cat.research_areas.some(ra => ra.research_area_id === researchAreaId))?.category_id;
      const topics = categories.find(cat => cat.category_id === categoryId)
        .research_areas.find(ra => ra.research_area_id === researchAreaId).topics;

      if (!isSelected) {
        // Include all topics in the selected research area
        setSelectedTopics(prev => [
          ...new Set([...prev, ...topics.map(topic => topic.topic_id)]),
        ]);
      } else {
        // Remove topics if research area is deselected
        setSelectedTopics(prev => prev.filter(id => !topics.some(topic => topic.topic_id === id)));
      }

      return newState;
    });
  };

  // Function to toggle topic selection
  const toggleTopicSelection = (topicId) => {
    setSelectedTopics(prevState => {
      const isSelected = prevState.includes(topicId);
      return isSelected
        ? prevState.filter(id => id !== topicId)
        : [...prevState, topicId];
    });
  };

  // Handle expanding categories and research areas
  const handleExpandCategory = (categoryId) => {
    setExpandedCategory(prevState => prevState === categoryId ? null : categoryId);
  };

  const handleExpandResearchArea = (researchAreaId) => {
    setExpandedResearchArea(prevState => prevState === researchAreaId ? null : researchAreaId);
  };

  // Check if all research areas are selected for a category
  const isCategorySelected = (categoryId) => {
    return selectedCategories.includes(categoryId);
  };

  const isResearchAreaSelected = (researchAreaId) => {
    return selectedResearchAreas.includes(researchAreaId);
  };

  const isTopicSelected = (topicId) => {
    return selectedTopics.includes(topicId);
  };

  // Trigger the apply filters action
  const handleApplyFilters = () => {
    if (onApply) {
      onApply(selectedCategories, selectedResearchAreas, selectedTopics);
    }
  };

  const handleClearData = () => {
    setSelectedCategories([]);
    setSelectedResearchAreas([]);
    setSelectedTopics([]);
    if (handleClearFilters) {
      handleClearFilters();  // Trigger the parent's clear filter function if provided
    }
  };

  return (
    <div className="subject-filter">
  <div className="filter-header">
    <h3>Filter by Category</h3>
    <button className="clear-button" onClick={handleClearData}>Clear Filters</button>
  </div>    
    <div className="dropdown-content">
        {categories.map(category => (
          <div key={category.category_id} className="category-group">
            <div className="category-checkbox">
              <input
                type="checkbox"
                checked={isCategorySelected(category.category_id)}
                onChange={() => toggleCategorySelection(category.category_id)}
              />
              <label onClick={() => handleExpandCategory(category.category_id)}>
                {category.name} {expandedCategory === category.category_id && "▼"}
              </label>
            </div>

            {expandedCategory === category.category_id && category.research_areas && (
              <div className="subcategories">
                {category.research_areas.map(researchArea => (
                  <div key={researchArea.research_area_id}>
                    <div className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={isResearchAreaSelected(researchArea.research_area_id) || isCategorySelected(category.category_id)}
                        onChange={() => toggleResearchAreaSelection(researchArea.research_area_id)}
                      />
                      <label onClick={() => handleExpandResearchArea(researchArea.research_area_id)}>
                        {researchArea.name} {expandedResearchArea === researchArea.research_area_id && "▼"}
                      </label>
                    </div>

                    {expandedResearchArea === researchArea.research_area_id && researchArea.topics && (
                      <div className="topic-list">
                        {researchArea.topics.map(topic => (
                          <div key={topic.topic_id} className="form-check">
                            <input
                              type="checkbox"
                              checked={isTopicSelected(topic.topic_id) || isResearchAreaSelected(researchArea.research_area_id) || isCategorySelected(category.category_id)}
                              onChange={() => toggleTopicSelection(topic.topic_id)}
                            />
                            <label>{topic.name}</label>
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

      {/* Apply and Clear Filters Button Section */}
      <div className="apply-button-container">
        <button className="apply-button" onClick={handleApplyFilters}>Apply</button>
      </div>
    </div>
  );
};

export default SubjectFilter;
