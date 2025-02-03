import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { useEditProject } from '../scripts/useEditProject';
import AddNewAuthor from '../components/addNewAuthor';  // Adjust the path if necessary
import AddNewKeyword from '../components/AddNewKeyword';  // Import AddNewKeyword component
import { Modal } from 'react-bootstrap';  // Import Modal from react-bootstrap
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function EditProjectForm({ projectId, onClose }) {
    const [showAuthorModal, setShowAuthorModal] = useState(false); // State to control author modal visibility
    const [showKeywordModal, setShowKeywordModal] = useState(false); // State to control keyword modal visibility
    const [successModal, setSuccessModal] = useState(false); // State for success modal
    const navigate = useNavigate();  // Initialize useNavigate
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
        categories,  // Default empty array
        researchAreas, // Default empty array
        topics, // Default empty array
        researchTypes, // Default empty array
        departments = [], // Default empty array
        handleSubmit,
        handleCategoryChange,
        handleResearchAreaChange,
        handleChange,
        handleResearchTypeChange,
      } = useEditProject(projectId, onClose);

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
            const response = await fetch(`/api/project_category/${projectId}`);  // Correct endpoint
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            
            // Log data to ensure it's being fetched correctly
            console.log('Fetched departments:', data);
            
            // Set the selected departments state
            setSelectedDepartments(data.map(department => department.category_id));  // Assuming category_id is the unique identifier
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

    const toggleAuthorModal = () => setShowAuthorModal(!showAuthorModal);
    const toggleKeywordModal = () => setShowKeywordModal(!showKeywordModal);

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
        setSuccessModal(false);  // Hide the modal first
        onClose();  // Close the edit modal
    };

    const handleViewStudy = () => {
        navigate(`/DocumentOverview/${projectId}`); // Navigate to DocumentOverview
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const isSuccess = await handleSubmit(event); // Ensure handleSubmit returns true on success
            console.log('Submission success:', isSuccess); // Add debugging log here
            if (isSuccess) {
                setSuccessModal(true); // Show success modal if the form submission is successful
            }
        } catch (error) {
            console.error('Error in form submission:', error); // Log any errors
        }
    };

    if (loading) {
        return <Spinner animation="border" variant="primary" />;
    }

    if (error) {
        return <p className="text-danger text-center mt-4">{error}</p>;
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '800px', padding: '1rem' }}>
            <form onSubmit={handleFormSubmit} className="bg-light p-4 rounded shadow-sm">
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
                            styles={{
                                container: (provided) => ({
                                    ...provided,
                                    width: '95%' // Adjust width to 100% for a larger dropdown
                                })
                            }}
                        />
                    </div>

                    {/* Add New Author link */}
                    <a
                        href="#"
                        onClick={toggleAuthorModal}
                        className="ms-3 text-primary"
                        style={{ textDecoration: 'none', marginTop: '25px', alignSelf: 'center' }}
                    >
                        Add New Author
                    </a>
                </div>

                {/* Keywords */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                        <label htmlFor="formKeywords" className="form-label">Keywords</label>
                        <Select
                            id="formKeywords"
                            isMulti
                            options={keywordOptions}
                            value={keywordOptions.filter(option => selectedKeywords.includes(option.value))}
                            onChange={handleKeywordChange}
                            isClearable
                            placeholder="Select keywords..."
                        />
                    </div>

                    {/* Add New Keyword link */}
                    <a
                        href="#"
                        onClick={toggleKeywordModal}
                        className="ms-3 text-primary"
                        style={{ textDecoration: 'none', marginTop: '25px', alignSelf: 'center' }}
                    >
                        Add New Keyword
                    </a>
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
                    <label htmlFor="formCategory" className="form-label">Category <span className="text-danger">*</span></label>
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
                    <label htmlFor="formResearchArea" className="form-label">Research Area <span className="text-danger">*</span></label>
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
                    <label htmlFor="formTopic" className="form-label">Topic <span className="text-danger">*</span></label>
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

                <div className="d-flex justify-content-center mb-3">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>

            {/* Modal for Add New Author */}
            <Modal
                show={showAuthorModal}
                onHide={toggleAuthorModal}
                dialogClassName="modal-custom-width"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Author</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddNewAuthor onHide={toggleAuthorModal} />
                </Modal.Body>
            </Modal>

            {/* Modal for Add New Keyword */}
            <Modal
                show={showKeywordModal}
                onHide={toggleKeywordModal}
                dialogClassName="modal-custom-width"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New Keyword</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddNewKeyword onHide={toggleKeywordModal} />
                </Modal.Body>
            </Modal>

            {/* Success Modal */}
            <Modal show={successModal} onHide={handleSuccessModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your project has been successfully updated!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleSuccessModalClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleViewStudy}>
                        View Study
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default EditProjectForm;
