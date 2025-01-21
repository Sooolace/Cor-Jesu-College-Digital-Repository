import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../components/styles/categories.css'

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories'); // Adjust the endpoint as needed
        setCategories(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="categories-container">
      <h4>Categories</h4>
      <ul>
        {categories.map((category) => (
          <li key={category.category_id}>
            {category.name}
            {category.research_areas.length > 0 && (
              <ul>
                {category.research_areas.map((area) => (
                  <li key={area.research_area_id}>
                    {area.name}
                    {area.topics.length > 0 && (
                      <ul>
                        {area.topics.map((topic) => (
                          <li key={topic.topic_id}>{topic.name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Categories;
