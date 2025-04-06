import axios from 'axios';

/**
 * Fetches categories data from the API endpoint.
 * This utility can be used for debugging the categories endpoint.
 */
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories');
    console.log('API Response:', response);
    
    if (response.data && Array.isArray(response.data)) {
      console.log('Categories count:', response.data.length);
      
      if (response.data.length > 0) {
        const firstCategory = response.data[0];
        console.log('First category:', firstCategory);
        
        // Check if research_areas exists
        if (!firstCategory.research_areas) {
          console.error('Error: research_areas property is missing!');
          
          // Log all properties available in the first category
          console.log('Available properties:', Object.keys(firstCategory));
          
          return {
            success: false,
            message: 'Research areas data is missing from the API response',
            data: response.data
          };
        }
      }
      
      return {
        success: true,
        data: response.data
      };
    } else {
      console.error('Invalid response format from API');
      return {
        success: false,
        message: 'Invalid response format from API',
        data: response.data
      };
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

export default fetchCategories; 