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
            setSelectedDepartments(data.categories ? data.categories.map(category => category.category_id) : []); // Set selected keywords
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

    try {
        // Fetch existing authors, keywords, and categories
        const existingAuthors = await fetch(`/api/project_authors/${projectId}`).then(res => res.json());
        const existingAuthorIds = existingAuthors.map(a => a.author_id);

        const existingKeywords = await fetch(`/api/project_keywords/${projectId}`).then(res => res.json());
        const existingKeywordIds = existingKeywords.map(k => k.keyword_id);

        const existingDepartments = await fetch(`/api/project_category/${projectId}`).then(res => res.json());
        const existingDepartmentIds = existingDepartments.map(d => d.category_id);

        // Compute which authors, keywords, and categories need to be removed or added
        const authorsToRemove = existingAuthorIds.filter(id => !selectedAuthors.includes(id));
        const authorsToAdd = selectedAuthors.filter(id => !existingAuthorIds.includes(id));

        const keywordsToRemove = existingKeywordIds.filter(id => !selectedKeywords.includes(id));
        const keywordsToAdd = selectedKeywords.filter(id => !existingKeywordIds.includes(id));

        const departmentsToRemove = existingDepartmentIds.filter(id => !selectedDepartments.includes(id));
        const departmentsToAdd = selectedDepartments.filter(id => !existingDepartmentIds.includes(id));

        // Only send requests for authors, keywords, and departments if there are changes
        await Promise.all(authorsToRemove.map(author_id =>
            fetch('/api/project_authors', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, author_id })
            })
        ));

        await Promise.all(keywordsToRemove.map(keyword_id =>
            fetch('/api/project_keywords', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, keyword_id })
            })
        ));

        await Promise.all(departmentsToRemove.map(category_id =>
            fetch('/api/project_category', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, category_id })
            })
        ));

        // Step 4: Add new authors, keywords, and categories if needed
        await Promise.all(authorsToAdd.map(author_id =>
            fetch('/api/project_authors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, author_id })
            })
        ));

        await Promise.all(keywordsToAdd.map(keyword_id =>
            fetch('/api/project_keywords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, keyword_id })
            })
        ));

        // Only add new categories that don't already exist
        const departmentsToAddUnique = [];
        for (let category_id of departmentsToAdd) {
            // Check if the category already exists
            const categoryExists = existingDepartmentIds.includes(category_id);
            if (!categoryExists) {
                departmentsToAddUnique.push(category_id);
            }
        }

        // Send requests for new departments
        await Promise.all(departmentsToAddUnique.map(category_id =>
            fetch('/api/project_category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId, category_id })
            })
        ));

        // Step 5: Update project details with selected authors, keywords, and departments
        const updatedData = {
            ...formData,
            authors: selectedAuthors,
            keywords: selectedKeywords,
            departments: selectedDepartments // Include updated departments
        };

        // Send PUT request to update project
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        navigate(`/DocumentOverview/${projectId}`);  // Navigate to the updated document overview page

    } catch (error) {
        console.error('Error updating project:', error);
        setError('Failed to update project');  // Set error state if something goes wrong
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
