// useEditProject.js
import { useEffect, useState } from 'react';

export const useEditProject = (projectId, navigate) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingTopics, setLoadingTopics] = useState(false); // Loading state for topics
    const [formData, setFormData] = useState({
        title: '',
        publication_date: '',
        keywords: '',
        abstract: '',
        study_url: '',
        category_id: '',
        research_area_id: '',
        topic_id: '',
        research_type_id: '', 
    });
    const [authors, setAuthors] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [keywords, setKeywords] = useState([]); // New state for keywords
    const [selectedKeywords, setSelectedKeywords] = useState([]); // New state for selected keywords
    const [selectedDepartments, setSelectedDepartments] = useState([]); // Corrected state initialization
    const [categories, setCategories] = useState([]);
    const [researchAreas, setResearchAreas] = useState([]);
    const [topics, setTopics] = useState([]); // Topics state
    const [researchTypes, setResearchTypes] = useState([]); // Initialize researchTypes state

    useEffect(() => {
        // Only fetch project data if projectId exists
        if (projectId) {
            fetchProject();
        }
        
        // These calls don't depend on projectId and can be made regardless
        fetchCategories();
        fetchAuthors();
        fetchKeywords();
        fetchResearchTypes();
    }, [projectId]);

    useEffect(() => {
        // Fetch research areas when category is selected
        if (formData.category_id) {
            fetchResearchAreas(formData.category_id);
        }
    }, [formData.category_id]); // Dependency on category_id

    useEffect(() => {
        // Fetch topics when research area is selected
        if (formData.research_area_id) {
            fetchTopics(formData.research_area_id);
        }
    }, [formData.research_area_id]); // Dependency on research_area_id

    const fetchProject = async () => {
        // Don't attempt to fetch if projectId is missing
        if (!projectId) {
            console.warn('Attempted to fetch project with null or undefined projectId');
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            
            // Check for response status before trying to parse JSON
            if (!response.ok) {
                // For 500 errors, don't try to parse JSON
                if (response.status === 500) {
                    console.error(`Server error (500) when fetching project ${projectId}`);
                    setError('Server error when loading project details');
                    return;
                }
                
                // For other errors, try to parse JSON if possible
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } catch (parseError) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            // Set form data with proper defaults
            setFormData({
                ...data,
                publication_date: data.publication_date ? data.publication_date.split('T')[0] : '',
                category_id: data.category_id || '',
                research_area_id: data.research_area_id || '',
                topic_id: data.topic_id || '',
                research_type_id: data.research_type_id || '',
            });

            // Set selected authors, keywords, and departments with proper defaults
            // We'll let the component handle this through separate API calls now
        } catch (error) {
            console.error('Error fetching project:', error);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await fetch('/api/authors');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const allAuthors = await response.json();
            setAuthors(allAuthors);
        } catch (error) {
            console.error('Error fetching authors:', error);
            setError('Failed to load authors');
        }
    };

    const fetchKeywords = async () => {
        try {
            const response = await fetch('/api/keywords');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const allKeywords = await response.json();
            setKeywords(allKeywords);
        } catch (error) {
            console.error('Error fetching keywords:', error);
            setError('Failed to load keywords');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
        }
    };

    const fetchResearchTypes = async () => {
        try {
            const response = await fetch('/api/researchTypes');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setResearchTypes(data);
        } catch (error) {
            console.error('Error fetching research types:', error);
            setError('Failed to load research types');
        }
    };    

    const fetchResearchAreas = async (categoryId) => {
        try {
            const response = await fetch(`/api/researchAreas/${categoryId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setResearchAreas(data);
        } catch (error) {
            console.error('Error fetching research areas:', error);
            setError('Failed to load research areas');
        }
    };

    const fetchTopics = async (researchAreaId) => {
        setTopics([]); // Clear previous topics before fetching new ones
        setLoadingTopics(true); // Set loading state to true
        try {
            const response = await fetch(`/api/topics/${researchAreaId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setTopics(data); // Set topics
        } catch (error) {
            console.error('Error fetching topics:', error);
            setError('Failed to load topics');
        } finally {
            setLoadingTopics(false); // Set loading state back to false
        }
    };

    const handleResearchTypeChange = (e) => {
        const selectedResearchTypeId = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            research_type_id: selectedResearchTypeId,
        }));
    };    

const handleCategoryChange = (e) => {
    const selectedCategoryId = e?.target?.value;  // Safeguard in case value is undefined
    if (!selectedCategoryId) return; // Avoid running the code if no category is selected
    
    setFormData(prevState => ({
        ...prevState,
        category_id: selectedCategoryId,
        research_area_id: '', // Clear dependent field
        topic_id: '', // Clear dependent field
    }));
    setResearchAreas([]); // Clear the research areas dropdown
    setTopics([]); // Clear the topics dropdown
};

    
    const handleResearchAreaChange = (e) => {
        const selectedResearchAreaId = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            research_area_id: selectedResearchAreaId,
            topic_id: '', // Clear dependent field
        }));
        setTopics([]); // Clear the topics dropdown
    };
    
    const handleAuthorChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setSelectedAuthors(selected);
    };

    const handleKeywordChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setSelectedKeywords(selected);
    };

    const handleDepartmentChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setSelectedDepartments(selected); // Corrected function name
    };
    
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't attempt to submit if projectId is missing
    if (!projectId) {
        console.error('Cannot update project: Missing project ID');
        setError('Cannot update: Missing project ID');
        return false;
    }
    
    setLoading(true);
    setError(null);

    try {
        // Step 1: Update basic project information without relationships
        const basicProjectData = {
            title: formData.title,
            publication_date: formData.publication_date,
            study_url: formData.study_url,
            abstract: formData.abstract,
            description_type: formData.description_type || 'abstract',
            // Convert string IDs to numbers where needed
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            research_area_id: formData.research_area_id ? parseInt(formData.research_area_id) : null,
            topic_id: formData.topic_id ? parseInt(formData.topic_id) : null,
            research_type_id: formData.research_type_id ? parseInt(formData.research_type_id) : null,
        };

        // Remove any undefined or null values
        Object.keys(basicProjectData).forEach((key) => {
            if (basicProjectData[key] === undefined || basicProjectData[key] === null) {
                delete basicProjectData[key];
            }
        });

        console.log('Updating basic project info:', basicProjectData);

        // First update the basic project details
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(basicProjectData),
        });

        // Check for various types of errors
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                // If server sent JSON error
                const errorData = await response.json();
                console.error('Server error response (project update):', errorData);
                throw new Error(errorData.message || `Failed to update project (Status: ${response.status})`);
            } else {
                // If server sent HTML or other non-JSON response
                const textError = await response.text();
                console.error('Server error response (non-JSON):', textError.substring(0, 200) + '...');
                throw new Error(`Failed to update project (Status: ${response.status})`);
            }
        }

        // Step 2: Update project authors
        // Fetch current authors to compare with selected authors
        const currentAuthorsResponse = await fetch(`/api/project_authors/${projectId}`);
        if (!currentAuthorsResponse.ok) {
            console.error('Failed to fetch current authors');
        } else {
            const currentAuthors = await currentAuthorsResponse.json();
            const currentAuthorIds = currentAuthors.map(author => author.author_id.toString());
            
            // Find authors to add (in selectedAuthors but not in currentAuthorIds)
            const authorsToAdd = selectedAuthors.filter(id => !currentAuthorIds.includes(id.toString()));
            
            // Find authors to remove (in currentAuthorIds but not in selectedAuthors)
            const authorsToRemove = currentAuthorIds.filter(id => !selectedAuthors.includes(id));
            
            console.log('Authors to add:', authorsToAdd);
            console.log('Authors to remove:', authorsToRemove);
            
            // Add new authors
            for (const authorId of authorsToAdd) {
                try {
                    const addResponse = await fetch('/api/project_authors', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            project_id: parseInt(projectId), 
                            author_id: parseInt(authorId) 
                        })
                    });
                    
                    if (!addResponse.ok) {
                        console.error(`Failed to add author ${authorId}`);
                    }
                } catch (error) {
                    console.error(`Error adding author ${authorId}:`, error);
                }
            }
            
            // Remove authors
            for (const authorId of authorsToRemove) {
                try {
                    const removeResponse = await fetch('/api/project_authors', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            project_id: parseInt(projectId), 
                            author_id: parseInt(authorId) 
                        })
                    });
                    
                    if (!removeResponse.ok) {
                        console.error(`Failed to remove author ${authorId}`);
                    }
                } catch (error) {
                    console.error(`Error removing author ${authorId}:`, error);
                }
            }
        }
        
        // Step 3: Update project keywords
        // Fetch current keywords to compare with selected keywords
        const currentKeywordsResponse = await fetch(`/api/project_keywords/${projectId}`);
        if (!currentKeywordsResponse.ok) {
            console.error('Failed to fetch current keywords');
        } else {
            const currentKeywords = await currentKeywordsResponse.json();
            const currentKeywordIds = currentKeywords.map(keyword => keyword.keyword_id.toString());
            
            // Find keywords to add (in selectedKeywords but not in currentKeywordIds)
            const keywordsToAdd = selectedKeywords.filter(id => !currentKeywordIds.includes(id.toString()));
            
            // Find keywords to remove (in currentKeywordIds but not in selectedKeywords)
            const keywordsToRemove = currentKeywordIds.filter(id => !selectedKeywords.includes(id));
            
            console.log('Keywords to add:', keywordsToAdd);
            console.log('Keywords to remove:', keywordsToRemove);
            
            // Add new keywords
            for (const keywordId of keywordsToAdd) {
                try {
                    const addResponse = await fetch('/api/project_keywords', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            project_id: parseInt(projectId), 
                            keyword_id: parseInt(keywordId) 
                        })
                    });
                    
                    if (!addResponse.ok) {
                        console.error(`Failed to add keyword ${keywordId}`);
                    }
                } catch (error) {
                    console.error(`Error adding keyword ${keywordId}:`, error);
                }
            }
            
            // Remove keywords
            for (const keywordId of keywordsToRemove) {
                try {
                    const removeResponse = await fetch('/api/project_keywords', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            project_id: parseInt(projectId), 
                            keyword_id: parseInt(keywordId) 
                        })
                    });
                    
                    if (!removeResponse.ok) {
                        console.error(`Failed to remove keyword ${keywordId}`);
                    }
                } catch (error) {
                    console.error(`Error removing keyword ${keywordId}:`, error);
                }
            }
        }

        // If we got here, update was successful
        return true; // Return success status
        
    } catch (error) {
        console.error('Error updating project:', error);
        setError(error.message);
        return false; // Return failure status
    } finally {
        setLoading(false);
    }
};

    
    
    
    

    return {
        loading,
        error,
        formData,
        setFormData,
        authors,
        selectedAuthors,
        setSelectedAuthors,
        keywords,
        selectedKeywords,
        setSelectedKeywords,
        selectedDepartments,
        setSelectedDepartments,
        categories,
        researchAreas,
        topics,
        researchTypes, // Return researchTypes
        loadingTopics, // Loading state for topics
        handleSubmit,
        handleCategoryChange,
        handleResearchAreaChange,
        handleAuthorChange,
        handleKeywordChange, // New handler for keyword selection
        handleChange,
        handleResearchTypeChange,
        handleDepartmentChange
    };
};
