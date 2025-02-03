import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { MdEditSquare, MdArchive } from 'react-icons/md';
import { CiViewList } from "react-icons/ci";
import Breadcrumb from '../../components/BreadCrumb';
import Modal from 'react-bootstrap/Modal';
import PaginationComponent from '../../components/PaginationComponent';
import EditProjectForm from './components/EditProjectForm'; // Import the new component

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
  const [showEditModal, setShowEditModal] = useState(false); // State to control edit modal visibility
  const [projectIdToEdit, setProjectIdToEdit] = useState(null); // State to store the project ID to edit

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
                <th>Action</th>
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

      <Modal show={showEditModal} onHide={handleCloseEditModal} dialogClassName="modal-custom-width" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project Details</Modal.Title> {/* Update the title here */}
        </Modal.Header>
        <Modal.Body>
          <EditProjectForm projectId={projectIdToEdit} onClose={handleCloseEditModal} />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TotalWorks;
