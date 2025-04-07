import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { MdEditSquare, MdArchive } from 'react-icons/md';
import { CiViewList } from "react-icons/ci";
import { FaUserPlus, FaTag, FaEye } from 'react-icons/fa';
import Breadcrumb from '../../components/BreadCrumb';
import Modal from 'react-bootstrap/Modal';
import PaginationComponent from '../../components/PaginationComponent';
import EditProjectForm from './components/EditProjectForm';
import AddNewAuthor from './components/addNewAuthor';
import AddNewKeyword from './components/AddNewKeyword';

function TotalWorks() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterYear, setFilterYear] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectIdToEdit, setProjectIdToEdit] = useState(null);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  // Fetch projects from the API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
        setFilteredProjects(data);
      } else {
        console.error('Fetched data is not an array:', data);
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicateAuthors = (authors) => {
    if (!Array.isArray(authors)) {
      if (typeof authors === 'string') {
        authors = authors.split(',').map(name => name.trim());
      } else {
        return [];
      }
    }

    const normalizedAuthors = authors
      .map(name => name.trim().toLowerCase())
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(name =>
        name.split(' ')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      );

    return normalizedAuthors;
  };

  const handleFilter = () => {
    let filtered = [...projects];

    if (filterYear) {
      filtered = filtered.filter(project => {
        const year = new Date(project.publication_date).getFullYear();
        return year.toString() === filterYear;
      });
    }

    if (filterTitle) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    filtered = filtered.filter(project => !project.isArchived);

    const sortedFilteredProjects = filtered.sort((a, b) => {
      if (sortOrder === 'latest') {
        return new Date(b.publication_date) - new Date(a.publication_date);
      } else {
        return new Date(a.publication_date) - new Date(b.publication_date);
      }
    });

    setFilteredProjects(sortedFilteredProjects);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === 'latest' ? 'oldest' : 'latest';
    setSortOrder(newSortOrder);

    const sortedFilteredProjects = [...filteredProjects].sort((a, b) => {
      if (newSortOrder === 'latest') {
        return new Date(b.publication_date) - new Date(a.publication_date);
      } else {
        return new Date(a.publication_date) - new Date(b.publication_date);
      }
    });

    setFilteredProjects(sortedFilteredProjects);
  };

  const handleArchive = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedProject = await response.json();

        setFilteredProjects(prevProjects =>
          prevProjects.map(project =>
            project.project_id === projectId ? { ...updatedProject, is_archived: true } : project
          )
        );

        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to archive the project');
      }
    } catch (error) {
      console.error('Error archiving project:', error);
      setError('Failed to archive the project');
    }
  };

  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = Array.isArray(filteredProjects)
    ? filteredProjects.slice(indexOfFirstProject, indexOfLastProject)
    : [];

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToDocumentOverview = (projectId) => {
    navigate(`/DocumentOverview/${projectId}`);
  };

  const goToEditAuthor = (projectId) => {
    navigate(`/admin/EditProject/${projectId}`);
  };

  const handleShowModal = (projectId) => {
    setProjectIdToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmArchive = async () => {
    await handleArchive(projectIdToDelete);
    setShowDeleteModal(false);
  
    // Refresh the page after confirming the archive action
    window.location.reload();
  };
  

  const handleCancelArchive = () => setShowDeleteModal(false);

  const handleShowEditModal = (projectId) => {
    setProjectIdToEdit(projectId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setProjectIdToEdit(null);
  };

  const handleShowAuthorModal = () => setShowAuthorModal(true);
  const handleCloseAuthorModal = () => setShowAuthorModal(false);
  const handleShowKeywordModal = () => setShowKeywordModal(true);
  const handleCloseKeywordModal = () => setShowKeywordModal(false);

  const handleEditSuccess = () => {
    setShowEditSuccessModal(true);
    setShowEditModal(false);
  };

  const handleCloseEditSuccessModal = () => {
    setShowEditSuccessModal(false);
    fetchProjects(); // Refresh the projects list
  };

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/admindashboard' },
            { label: 'Projects', link: '#' },
          ]}
        />
      </div>

      <div className="total-works-container container mt-4">
        <div className="text-center mb-4">
          <h2>Projects Overview</h2>
          <div className="author-underline"></div>
        </div>

        <div className="d-flex justify-content-center mb-3">
          <Form.Control
            type="text"
            className="flex-grow-1 me-2"
            placeholder="Search by Title"
            value={filterTitle}
            onChange={(e) => setFilterTitle(e.target.value)}
          />
          <Form.Select
            className="w-25 me-2"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {Array.from({ length: new Date().getFullYear() - 1999 }, (_, index) => (
              <option key={index} value={new Date().getFullYear() - index}>
                {new Date().getFullYear() - index}
              </option>
            ))}
          </Form.Select>

          <Button variant="primary" onClick={handleFilter}>Filter</Button>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        {error && <p className="text-danger text-center">{error}</p>}
        {!loading && !error && filteredProjects.length === 0 && <p className="text-center">No projects available.</p>}

        {currentProjects.length > 0 && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Authors</th>
                <th>Date Published</th>
                <th style={{ width: '170px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project) => (
                <tr key={project.project_id}>
                  <td>{project.title}</td>
                  <td>{removeDuplicateAuthors(project.authors).join(', ')}</td>
                  <td>{new Date(project.publication_date).toLocaleDateString()}</td>
                  <td>
                    <span onClick={() => goToDocumentOverview(project.project_id)}
                      style={{ display: 'inline-block', cursor: 'pointer', padding: '5px' }}>
                      <CiViewList size={35} title="View" style={{ color: 'blue' }} />
                    </span>

                    <span onClick={() => handleShowEditModal(project.project_id)}
                      style={{ display: 'inline-block', cursor: 'pointer', padding: '5px' }}>
                      <MdEditSquare size={35} title="Edit" style={{ color: 'green' }} />
                    </span>

                    <span onClick={() => handleShowModal(project.project_id)}
                      style={{ display: 'inline-block', cursor: 'pointer', padding: '5px' }}>
                      <MdArchive size={35} title="Archive" style={{ color: 'red' }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={newPage => setCurrentPage(newPage)}
        />
      </div>

      <Modal show={showDeleteModal} onHide={handleCancelArchive} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Archive</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to archive this project?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelArchive}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmArchive}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal 
        show={showEditModal} 
        onHide={handleCloseEditModal} 
        size="lg"
        backdrop="static"
        className="project-edit-modal"
        centered
      >
        <Modal.Header closeButton className="edit-modal-header">
          <Modal.Title>
            <span className="edit-icon me-2"></span>
            Edit Project
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditProjectForm 
            projectId={projectIdToEdit} 
            onClose={handleCloseEditModal}
            onShowAuthorModal={handleShowAuthorModal}
            onShowKeywordModal={handleShowKeywordModal}
            onEditSuccess={handleEditSuccess}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={showAuthorModal}
        onHide={handleCloseAuthorModal}
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
          <AddNewAuthor onHide={handleCloseAuthorModal} />
        </Modal.Body>
      </Modal>

      <Modal
        show={showKeywordModal}
        onHide={handleCloseKeywordModal}
        centered
        backdrop="static"
        className="add-keyword-modal"
      >
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <FaTag className="me-2" /> Add New Keyword
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <AddNewKeyword onHide={handleCloseKeywordModal} />
        </Modal.Body>
      </Modal>

      <Modal 
        show={showEditSuccessModal} 
        onHide={handleCloseEditSuccessModal}
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
          <Button variant="secondary" onClick={handleCloseEditSuccessModal}>
            Close
          </Button>
          <Button variant="success" onClick={() => goToDocumentOverview(projectIdToEdit)}>
            <FaEye className="me-2" /> View Study
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .project-edit-modal .modal-dialog {
          max-width: 800px;
          margin: 1.75rem auto;
        }
        
        .project-edit-modal .modal-content {
          border-radius: 8px;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .edit-modal-header {
          background-color: #a33307;
          color: white;
          padding: 1rem 1.5rem;
          border-bottom: none;
        }

        .edit-modal-header .modal-title {
          font-size: 1.25rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .edit-modal-header .btn-close {
          color: white;
          opacity: 1;
        }

        .edit-modal-header .btn-close:hover {
          opacity: 0.75;
        }

        .project-edit-modal .modal-body {
          padding: 1.5rem;
        }

        .edit-icon {
          font-size: 1.2rem;
        }

        /* Theme-colored buttons */
        .btn-primary {
          background-color: #a33307;
          border-color: #a33307;
        }

        .btn-primary:hover {
          background-color: #8a2b06;
          border-color: #8a2b06;
        }

        .btn-primary:focus {
          background-color: #8a2b06;
          border-color: #8a2b06;
          box-shadow: 0 0 0 0.25rem rgba(163, 51, 7, 0.25);
        }

        .btn-primary:active {
          background-color: #8a2b06;
          border-color: #8a2b06;
        }

        @media (max-width: 992px) {
          .project-edit-modal .modal-dialog {
            max-width: 95%;
            margin: 1rem auto;
          }
        }

        .add-author-modal .modal-content,
        .add-keyword-modal .modal-content {
          border-radius: 8px;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .add-author-modal .modal-header,
        .add-keyword-modal .modal-header {
          background-color: #a33307;
          color: white;
          border-bottom: none;
        }

        .add-author-modal .btn-close,
        .add-keyword-modal .btn-close {
          color: white;
          opacity: 1;
        }

        .add-author-modal .btn-close:hover,
        .add-keyword-modal .btn-close:hover {
          opacity: 0.75;
        }

        .success-modal .modal-content {
          border-radius: 8px;
          border: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .success-modal .modal-header {
          background-color: #28a745;
          color: white;
          border-bottom: none;
        }

        .success-modal .modal-footer {
          border-top: none;
        }

        .success-modal .btn-close {
          color: white;
          opacity: 1;
        }

        .success-modal .btn-close:hover {
          opacity: 0.75;
        }

        .success-modal .btn-success {
          background-color: #28a745;
          border-color: #28a745;
        }

        .success-modal .btn-success:hover {
          background-color: #218838;
          border-color: #1e7e34;
        }
      `}</style>
    </>
  );
}

export default TotalWorks;
