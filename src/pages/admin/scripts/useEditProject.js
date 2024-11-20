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
    const [categories, setCategories] = useState([]);
    const [researchAreas, setResearchAreas] = useState([]);
    const [topics, setTopics] = useState([]); // Topics state
    const [researchTypes, setResearchTypes] = useState([]); // Initialize researchTypes state

    useEffect(() => {
        fetchProject();
        fetchCategories();
        fetchAuthors();
        fetchKeywords(); // Fetch all keywords on load
        fetchResearchTypes(); // Fetch all research types on load
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
        setLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setFormData({
                ...data,
                publication_date: data.publication_date ? data.publication_date.split('T')[0] : '',
            });
            setSelectedAuthors(data.authors ? data.authors.map(author => author.author_id) : []);
            setSelectedKeywords(data.keywords ? data.keywords.map(keyword => keyword.keyword_id) : []); // Set selected keywords
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
        const selectedCategoryId = e.target.value;
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Remove existing authors and keywords
        await Promise.all(selectedAuthors.map(author_id => 
            fetch('/api/project_authors', { 
                method: 'DELETE', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, author_id })
            })
        ));
        
        await Promise.all(selectedKeywords.map(keyword_id => 
            fetch('/api/project_keywords', { 
                method: 'DELETE', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, keyword_id })
            })
        ));
    
        // Create new authors and keywords
        await Promise.all(selectedAuthors.map(author_id => 
            fetch('/api/project_authors', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, author_id })
            })
        ));
        
        await Promise.all(selectedKeywords.map(keyword_id => 
            fetch('/api/project_keywords', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, keyword_id })
            })
        ));
    
        // Update project details
        const updatedData = {
            ...formData,
            authors: selectedAuthors,
            keywords: selectedKeywords,
        };
    
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
    
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            navigate(`/admin/DocumentOverview/${projectId}`);
        } catch (error) {
            console.error('Error updating project:', error);
            setError('Failed to update project');
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
    };
};
