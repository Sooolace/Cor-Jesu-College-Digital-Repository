import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { useEditProject } from '../scripts/useEditProject';
import AddNewAuthor from '../components/addNewAuthor';
import AddNewKeyword from '../components/AddNewKeyword';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTag, FaSave, FaEye } from 'react-icons/fa';

function EditProjectForm({ projectId, onClose, onShowAuthorModal, onShowKeywordModal, onEditSuccess }) {
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [showKeywordModal, setShowKeywordModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const [authorsRefresh, setAuthorsRefresh] = useState(0);
    const [keywordsRefresh, setKeywordsRefresh] = useState(0);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const navigate = useNavigate();
    
    const { 
        loading,
        error,
        formData,
        setFormData,
        categories,
        researchAreas,
        topics,
        researchTypes,
        departments = [],
        handleSubmit,
        handleCategoryChange,
        handleResearchAreaChange,
        handleChange,
        handleResearchTypeChange,
        fetchAuthors,
        fetchKeywords,
      } = useEditProject(projectId, onClose);

    useEffect(() => {
        fetchDepartments();
        fetchProjectAuthors();
        fetchProjectKeywords();
    }, [projectId]);
    
    // Refresh authors list when new author is added
    useEffect(() => {
        if (authorsRefresh > 0) {
            fetchAuthors().then(() => {
                fetchProjectAuthors();
            });
        }
    }, [authorsRefresh]);
    
    // Refresh keywords list when new keyword is added
    useEffect(() => {
        if (keywordsRefresh > 0) {
            fetchKeywords().then(() => {
                fetchProjectKeywords();
            });
        }
    }, [keywordsRefresh]);

    const fetchProjectAuthors = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`/api/project_authors/${projectId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const authorIds = data.map(author => ({
                value: author.author_id,
                label: author.name
            }));
            setSelectedAuthors(authorIds);
        } catch (error) {
            console.error('Error fetching authors:', error);
            setSelectedAuthors([]);
        }
    };

    const fetchProjectKeywords = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`/api/project_keywords/${projectId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const keywordIds = data.map(keyword => ({
                value: keyword.keyword_id,
                label: keyword.keyword
            }));
            setSelectedKeywords(keywordIds);
        } catch (error) {
            console.error('Error fetching keywords:', error);
            setSelectedKeywords([]);
        }
    };

    const fetchDepartments = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`/api/project_category/${projectId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const departmentIds = data.map(dept => ({
                value: dept.category_id,
                label: dept.name
            }));
            setSelectedDepartments(departmentIds);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setSelectedDepartments([]);
        }
    };

    // Add these fetch functions for initial data
    const fetchAllAuthors = async () => {
        try {
            const response = await fetch('/api/authors');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const authorOptions = data.map(author => ({
                value: author.author_id,
                label: author.name
            }));
            setAuthors(authorOptions);
        } catch (error) {
            console.error('Error fetching all authors:', error);
            setAuthors([]);
        }
    };

    const fetchAllKeywords = async () => {
        try {
            const response = await fetch('/api/keywords');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const keywordOptions = data.map(keyword => ({
                value: keyword.keyword_id,
                label: keyword.keyword
            }));
            setKeywords(keywordOptions);
        } catch (error) {
            console.error('Error fetching all keywords:', error);
            setKeywords([]);
        }
    };

    useEffect(() => {
        if (projectId) {
            Promise.all([
                fetchProjectAuthors(),
                fetchProjectKeywords(),
                fetchDepartments(),
                fetchAllAuthors(),
                fetchAllKeywords()
            ]).catch(error => {
                console.error('Error loading data:', error);
            });
        }

        return () => {
            setSelectedAuthors([]);
            setSelectedKeywords([]);
            setSelectedDepartments([]);
            setAuthors([]);
            setKeywords([]);
        };
    }, [projectId]);

    const handleAuthorChange = (selectedOptions) => {
        setSelectedAuthors(selectedOptions);
    };

    const handleKeywordChange = (selectedOptions) => {
        setSelectedKeywords(selectedOptions);
    };

    const handleDepartmentChange = (selected) => {
        setSelectedDepartments(selected ? selected.map(option => option.value) : []);
    };

    const toggleAuthorModal = () => setShowAuthorModal(!showAuthorModal);
    
    const handleAuthorAdded = () => {
        toggleAuthorModal();
        setAuthorsRefresh(prev => prev + 1); // Trigger authors refresh
    };
    
    const toggleKeywordModal = () => setShowKeywordModal(!showKeywordModal);
    
    const handleKeywordAdded = () => {
        toggleKeywordModal();
        setKeywordsRefresh(prev => prev + 1); // Trigger keywords refresh
    };

    const departmentOptions = categories.map(category => ({
        value: category.category_id,
        label: category.name
    }));

    const handleSuccessModalClose = () => {
        setSuccessModal(false);
        onClose();
    };

    const handleViewStudy = () => {
        navigate(`/DocumentOverview/${projectId}`);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Validate required fields
            if (!formData.title || !formData.publication_date) {
                throw new Error('Title and Publication Date are required');
            }

            // Prepare the update data
            const updateData = {
                title: formData.title,
                publication_date: formData.publication_date,
                abstract: formData.abstract || '',
                study_url: formData.study_url || '',
                category_id: formData.category_id || null,
                research_area_id: formData.research_area_id || null,
                topic_id: formData.topic_id || null,
                research_type_id: formData.research_type_id || null
            };

            // First update the basic project info
            const updateResponse = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok) {
                throw new Error(updateResult.message || 'Failed to update project');
            }

            // Update authors
            const currentAuthorsResponse = await fetch(`/api/project_authors/${projectId}`);
            if (!currentAuthorsResponse.ok) {
                throw new Error('Failed to fetch current authors');
            }
            const currentAuthors = await currentAuthorsResponse.json();
            const currentAuthorIds = currentAuthors.map(author => author.author_id);
            
            const selectedAuthorIds = selectedAuthors ? selectedAuthors.map(author => parseInt(author.value)) : [];
            
            // Find authors to add and remove
            const authorsToAdd = selectedAuthorIds.filter(id => !currentAuthorIds.includes(id));
            const authorsToRemove = currentAuthorIds.filter(id => !selectedAuthorIds.includes(id));

            // Add new authors
            for (const authorId of authorsToAdd) {
                const addResponse = await fetch('/api/project_authors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: parseInt(projectId),
                        author_id: authorId
                    })
                });

                if (!addResponse.ok) {
                    const errorData = await addResponse.json();
                    throw new Error(errorData.message || `Failed to add author ${authorId}`);
                }
            }

            // Remove authors
            for (const authorId of authorsToRemove) {
                const removeResponse = await fetch('/api/project_authors', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: parseInt(projectId),
                        author_id: authorId
                    })
                });

                if (!removeResponse.ok) {
                    const errorData = await removeResponse.json();
                    throw new Error(errorData.message || `Failed to remove author ${authorId}`);
                }
            }

            // Update keywords
            const currentKeywordsResponse = await fetch(`/api/project_keywords/${projectId}`);
            if (!currentKeywordsResponse.ok) {
                throw new Error('Failed to fetch current keywords');
            }
            const currentKeywords = await currentKeywordsResponse.json();
            const currentKeywordIds = currentKeywords.map(keyword => keyword.keyword_id);
            
            const selectedKeywordIds = selectedKeywords ? selectedKeywords.map(keyword => parseInt(keyword.value)) : [];
            
            // Find keywords to add and remove
            const keywordsToAdd = selectedKeywordIds.filter(id => !currentKeywordIds.includes(id));
            const keywordsToRemove = currentKeywordIds.filter(id => !selectedKeywordIds.includes(id));

            // Add new keywords
            for (const keywordId of keywordsToAdd) {
                const addResponse = await fetch('/api/project_keywords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: parseInt(projectId),
                        keyword_id: keywordId
                    })
                });

                if (!addResponse.ok) {
                    const errorData = await addResponse.json();
                    throw new Error(errorData.message || `Failed to add keyword ${keywordId}`);
                }
            }

            // Remove keywords
            for (const keywordId of keywordsToRemove) {
                const removeResponse = await fetch('/api/project_keywords', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        project_id: parseInt(projectId),
                        keyword_id: keywordId
                    })
                });

                if (!removeResponse.ok) {
                    const errorData = await removeResponse.json();
                    throw new Error(errorData.message || `Failed to remove keyword ${keywordId}`);
                }
            }

            // If we get here, everything was successful
            onEditSuccess();
        } catch (error) {
            console.error('Error updating project:', error);
            // Show error message to the user
            alert(error.message || 'Failed to update project. Please try again.');
        }
    };

    // Custom styles for react-select
    const customStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#ced4da',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#80bdff'
            }
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#e7f5ff'
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#0d6efd'
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#0d6efd',
            ':hover': {
                backgroundColor: '#0d6efd',
                color: 'white',
            }
        })
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return <p className="text-danger text-center mt-4">{error}</p>;
    }

    return (
        <form onSubmit={handleFormSubmit}>
            {/* Title */}
            <div className="mb-3">
                <label htmlFor="formTitle" className="form-label">Title</label>
                <input
                    type="text"
                    className="form-control"
                    id="formTitle"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                />
            </div>

            {/* Authors */}
            <div className="mb-3">
                <label htmlFor="formAuthors" className="form-label">Authors</label>
                <div className="d-flex gap-2">
                    <Select
                        id="formAuthors"
                        isMulti
                        options={authors}
                        value={selectedAuthors}
                        onChange={handleAuthorChange}
                        className="flex-grow-1"
                    />
                    <Button variant="outline-primary" onClick={onShowAuthorModal}>
                        <FaUserPlus /> Add
                    </Button>
                </div>
            </div>

            {/* Keywords */}
            <div className="mb-3">
                <label htmlFor="formKeywords" className="form-label">Keywords</label>
                <div className="d-flex gap-2">
                    <Select
                        id="formKeywords"
                        isMulti
                        options={keywords}
                        value={selectedKeywords}
                        onChange={handleKeywordChange}
                        className="flex-grow-1"
                    />
                    <Button variant="outline-info" onClick={onShowKeywordModal}>
                        <FaTag /> Add
                    </Button>
                </div>
            </div>

            {/* Publication Date and Study URL */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <label htmlFor="formPublicationDate" className="form-label">Publication Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="formPublicationDate"
                        name="publication_date"
                        value={formData.publication_date || ''}
                        onChange={handleChange}
                    />
                </div>
                <div className="col-md-6">
                    <label htmlFor="formStudyUrl" className="form-label">Study URL</label>
                    <input
                        type="text"
                        className="form-control"
                        id="formStudyUrl"
                        name="study_url"
                        value={formData.study_url || ''}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Abstract */}
            <div className="mb-3">
                <label htmlFor="formAbstract" className="form-label">Abstract</label>
                <textarea
                    className="form-control"
                    id="formAbstract"
                    name="abstract"
                    value={formData.abstract || ''}
                    onChange={handleChange}
                    rows="4"
                ></textarea>
            </div>

            {/* Research Type */}
            <div className="mb-3">
                <label htmlFor="formResearchType" className="form-label">Research Type</label>
                <select
                    className="form-select"
                    id="formResearchType"
                    name="research_type_id"
                    value={formData.research_type_id || ''}
                    onChange={handleResearchTypeChange}
                >
                    <option value="">Select a research type</option>
                    {researchTypes.map(type => (
                        <option key={type.research_type_id} value={type.research_type_id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category */}
            <div className="mb-3">
                <label htmlFor="formCategory" className="form-label">Category</label>
                <select
                    className="form-select"
                    id="formCategory"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleCategoryChange}
                >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Research Area */}
            <div className="mb-3">
                <label htmlFor="formResearchArea" className="form-label">Research Area</label>
                <select
                    className="form-select"
                    id="formResearchArea"
                    name="research_area_id"
                    value={formData.research_area_id || ''}
                    onChange={handleResearchAreaChange}
                >
                    <option value="">Select a research area</option>
                    {researchAreas.map(area => (
                        <option key={area.research_area_id} value={area.research_area_id}>
                            {area.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Topic */}
            <div className="mb-3">
                <label htmlFor="formTopic" className="form-label">Topic</label>
                <select
                    className="form-select"
                    id="formTopic"
                    name="topic_id"
                    value={formData.topic_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select a topic</option>
                    {topics.map(topic => (
                        <option key={topic.topic_id} value={topic.topic_id}>
                            {topic.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Departments */}
            <div className="mb-3">
                <label htmlFor="formDepartments" className="form-label">Departments</label>
                <Select
                    id="formDepartments"
                    isMulti
                    options={departmentOptions}
                    value={departmentOptions.filter(option => selectedDepartments.includes(option.value))}
                    onChange={handleDepartmentChange}
                    isClearable
                    placeholder="Select departments..."
                    styles={customStyles}
                />
            </div>

            <div className="d-flex justify-content-center mt-4">
                <Button type="submit" variant="primary" size="lg">
                    <FaSave className="me-2" /> Save Changes
                </Button>
            </div>
        </form>
    );
}

export default EditProjectForm;
