import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { useEditProject } from './scripts/useEditProject';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft, FaSave, FaUserPlus } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import AddNewAuthor from './components/addNewAuthor';

function EditProject() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);
    const { 
        loading,
        error,
        formData,
        setFormData,
        authors = [],
        keywords = [],
        selectedAuthors,
        setSelectedAuthors,
        selectedKeywords,
        setSelectedKeywords,
        selectedDepartments,
        setSelectedDepartments,
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
      } = useEditProject(projectId, navigate);
      
    useEffect(() => {
        fetchDepartments();
        fetchProjectAuthors();
        fetchProjectKeywords();
    }, [projectId]);

    const fetchProjectAuthors = async () => {
        try {
            const response = await fetch(`/api/project_authors/${projectId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSelectedAuthors(data.map(author => author.author_id));
        } catch (error) {
            console.error('Error fetching authors:', error);
        }
    };

    const fetchProjectKeywords = async () => {
        try {
            const response = await fetch(`/api/project_keywords/${projectId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSelectedKeywords(data.map(keyword => keyword.keyword_id));
        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch(`/api/project_category/${projectId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Fetched departments:', data);
            setSelectedDepartments(data.map(department => department.category_id));
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };
    
    const handleAuthorChange = (selected) => {
        setSelectedAuthors(selected ? selected.map(author => author.value) : []);
    };

    const handleKeywordChange = (selected) => {
        setSelectedKeywords(selected ? selected.map(keyword => keyword.value) : []);
    };

    const handleDepartmentChange = (selected) => {
        setSelectedDepartments(selected ? selected.map(categories => categories.value) : []);
    };

    const toggleModal = () => setShowModal(!showModal);

    const authorOptions = authors.map(author => ({
        value: author.author_id,
        label: author.name
    }));

    const keywordOptions = keywords.map(keyword => ({
        value: keyword.keyword_id,
        label: keyword.keyword
    }));

    const departmentOptions = categories.map(category => ({
        value: category.category_id,
        label: category.name
    }));

    const handleSuccessModalClose = () => {
        setSuccessModal(false);
        setTimeout(() => {
            navigate('/admin/TotalWorks');
        }, 300);
    };
    
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        // Create a copy of formData where empty strings are preserved (not converted to null)
        const submissionData = { ...formData };
        
        try {
            const isSuccess = await handleSubmit(event);
            console.log('Submission success:', isSuccess);
            if (isSuccess) {
                setSuccessModal(true);
            }
        } catch (error) {
            console.error('Error in form submission:', error);
        }
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

    return (
        <div className="container mt-4" style={{ maxWidth: '800px', padding: '1rem' }}>
            <div className="table-with-back-button">
                <Button variant="outline-secondary" onClick={() => navigate(-1)} className="back-button mb-3">
                    <FaArrowLeft className="me-2" /> Back
                </Button>
                <form onSubmit={handleFormSubmit} className="bg-white p-4 rounded shadow">
                    <h1 className="mb-4 text-center">Edit Project</h1>
                    <div className="author-underline mb-4" style={{ borderBottom: '2px solid #0d6efd' }}></div>

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
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                            <label htmlFor="formAuthors" className="form-label">Authors</label>
                            <Select
                                id="formAuthors"
                                isMulti
                                options={authorOptions}
                                value={authorOptions.filter(option => selectedAuthors.includes(option.value))}
                                onChange={handleAuthorChange}
                                isClearable
                                placeholder="Select authors..."
                                styles={customStyles}
                            />
                        </div>

                        {/* Add New Author button */}
                        <Button
                            variant="outline-primary"
                            onClick={toggleModal}
                            className="ms-3"
                            style={{ marginTop: '25px', alignSelf: 'center' }}
                        >
                            <FaUserPlus className="me-1" /> Add Author
                        </Button>
                    </div>

                    {/* Keywords */}
                    <div className="mb-3">
                        <label htmlFor="formKeywords" className="form-label">Keywords</label>
                        <Select
                            id="formKeywords"
                            isMulti
                            options={keywordOptions}
                            value={keywordOptions.filter(option => selectedKeywords.includes(option.value))}
                            onChange={handleKeywordChange}
                            isClearable
                            placeholder="Select keywords..."
                            styles={customStyles}
                        />
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

                    <div className="d-flex justify-content-center mb-3 mt-4">
                        <Button type="submit" variant="primary" size="lg">
                            <FaSave className="me-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </div>

            {/* Modal for Add New Author */}
            <Modal
                show={showModal}
                onHide={toggleModal}
                centered
                backdrop="static"
                className="add-author-modal"
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <FaUserPlus className="me-2" /> Add New Author
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <AddNewAuthor onHide={toggleModal} />
                </Modal.Body>
            </Modal>

            {/* Success Modal */}
            <Modal 
                show={successModal} 
                onHide={handleSuccessModalClose}
                centered
                className="success-modal"
            >
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="text-center mb-3">
                        <div className="success-icon mb-3" style={{ fontSize: '48px', color: '#28a745' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <p className="lead">Your project has been successfully updated!</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleSuccessModalClose}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default EditProject;
