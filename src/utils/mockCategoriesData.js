/**
 * Mock data for research areas and topics to supplement API response
 * This is a temporary solution until the backend API is fixed to provide complete data
 */
const mockResearchAreas = {
  // CABE - College of Accountancy, Business, and Entrepreneurship
  3: [
    {
      research_area_id: 301,
      name: "Accounting Research",
      topics: [
        { topic_id: 3011, name: "Financial Accounting" },
        { topic_id: 3012, name: "Managerial Accounting" },
        { topic_id: 3013, name: "Auditing" },
        { topic_id: 3014, name: "Taxation" }
      ]
    },
    {
      research_area_id: 302,
      name: "Business Management",
      topics: [
        { topic_id: 3021, name: "Strategic Management" },
        { topic_id: 3022, name: "Marketing Management" },
        { topic_id: 3023, name: "Operations Management" },
        { topic_id: 3024, name: "Human Resource Management" }
      ]
    },
    {
      research_area_id: 303,
      name: "Entrepreneurship",
      topics: [
        { topic_id: 3031, name: "Startup Development" },
        { topic_id: 3032, name: "Small Business Management" },
        { topic_id: 3033, name: "Innovation and Creativity" }
      ]
    }
  ],
  
  // CAS - College of Arts and Sciences
  4: [
    {
      research_area_id: 401,
      name: "Psychology",
      topics: [
        { topic_id: 4011, name: "Clinical Psychology" },
        { topic_id: 4012, name: "Developmental Psychology" },
        { topic_id: 4013, name: "Social Psychology" }
      ]
    },
    {
      research_area_id: 402,
      name: "Literature and Communication",
      topics: [
        { topic_id: 4021, name: "Literary Analysis" },
        { topic_id: 4022, name: "Media Studies" },
        { topic_id: 4023, name: "Communication Theory" }
      ]
    }
  ],
  
  // CCIS - College of Computing and Information Sciences
  5: [
    {
      research_area_id: 501,
      name: "Software Development",
      topics: [
        { topic_id: 5011, name: "Web Development" },
        { topic_id: 5012, name: "Mobile App Development" },
        { topic_id: 5013, name: "Software Engineering" }
      ]
    },
    {
      research_area_id: 502,
      name: "Data Science",
      topics: [
        { topic_id: 5021, name: "Machine Learning" },
        { topic_id: 5022, name: "Data Mining" },
        { topic_id: 5023, name: "Big Data Analytics" }
      ]
    },
    {
      research_area_id: 503,
      name: "Network and Security",
      topics: [
        { topic_id: 5031, name: "Cybersecurity" },
        { topic_id: 5032, name: "Network Infrastructure" },
        { topic_id: 5033, name: "Cloud Computing" }
      ]
    }
  ],
  
  // COE - College of Education
  6: [
    {
      research_area_id: 601,
      name: "Educational Technology",
      topics: [
        { topic_id: 6011, name: "E-learning" },
        { topic_id: 6012, name: "Instructional Design" },
        { topic_id: 6013, name: "Technology Integration" }
      ]
    },
    {
      research_area_id: 602,
      name: "Curriculum Development",
      topics: [
        { topic_id: 6021, name: "Curriculum Design" },
        { topic_id: 6022, name: "Teaching Methodologies" },
        { topic_id: 6023, name: "Assessment and Evaluation" }
      ]
    }
  ],
  
  // CON - College of Nursing
  7: [
    {
      research_area_id: 701,
      name: "Clinical Nursing",
      topics: [
        { topic_id: 7011, name: "Patient Care" },
        { topic_id: 7012, name: "Nursing Interventions" },
        { topic_id: 7013, name: "Health Assessment" }
      ]
    },
    {
      research_area_id: 702,
      name: "Public Health Nursing",
      topics: [
        { topic_id: 7021, name: "Community Health" },
        { topic_id: 7022, name: "Health Promotion" },
        { topic_id: 7023, name: "Epidemiology" }
      ]
    }
  ],
  
  // Generic category
  1: [
    {
      research_area_id: 101,
      name: "General Studies",
      topics: [
        { topic_id: 1011, name: "Interdisciplinary Research" },
        { topic_id: 1012, name: "General Knowledge" }
      ]
    }
  ]
};

/**
 * Enhances categories data with mock research areas and topics
 * @param {Array} categories - The categories array from the API
 * @returns {Array} - Enhanced categories with research areas and topics
 */
export const enhanceCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }
  
  return categories.map(category => {
    // Use the category_id to find the appropriate mock research areas
    const researchAreas = mockResearchAreas[category.category_id] || [];
    
    // Return the enhanced category
    return {
      ...category,
      research_areas: researchAreas
    };
  });
};

export default mockResearchAreas; 