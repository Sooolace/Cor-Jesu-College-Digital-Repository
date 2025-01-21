import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { CiViewList } from "react-icons/ci";
import { TbArchiveOff } from "react-icons/tb";
import { FaUnlink } from "react-icons/fa";
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function ArchivedProjects() {
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
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  
  useEffect(() => {
    fetchArchivedProjects();
  }, []);

  const fetchArchivedProjects = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/projects/archived-projects');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure data is in the correct format
        if (Array.isArray(data)) {
            console.log('Fetched archived projects:', data); // Debugging purposes
            setProjects(data);
            setFilteredProjects(data);
        } else {
            console.error('Unexpected response format:', data);
            setError('Invalid response format from the server');
        }
    } catch (error) {
        console.error('Error fetching archived projects:', error.message);
        setError('Failed to load archived projects. Please try again later.');
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

  const confirmUnarchive = async () => {
    await handleunarchive(projectIdToDelete);
    setShowDeleteModal(false);
  
    // Refresh the page after confirming the archive action
    window.location.reload();
  };



// Define state for modal confirmation
const [projectIdToDelete, setProjectIdToDelete] = useState(null);

// Function to handle clicking the unarchive icon
const handleUnarchiveClick = (projectId) => {
  setProjectIdToDelete(projectId);
  setShowModal(true);
};



const handleunarchive = async (projectId) => {
  try {
    const response = await fetch(`/api/projects/${projectId}/unarchive`, {
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
      throw new Error('Failed to unarchive the project');
    }
  } catch (error) {
    console.error('Error unarchiving project:', error);
    setError('Failed to unarchive the project');
  }
};

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Archived Projects', link: '/archived-projects' }
          ]}
        />
      </div>

      <div className="total-works-container container mt-4">
        <div className="text-center mb-4">
          <h2>Archived Projects</h2>
        </div>
        <div className="author-underline mb-4"></div>

        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span>Loading...</span>
          </div>
        )}
        {error && <p className="text-danger text-center">{error}</p>}

        {currentProjects.length > 0 && (
          <Table striped bordered hover className="mt-3">
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

                    <span
                      onClick={() => handleUnarchiveClick(project.project_id)}
                      style={{ cursor: 'pointer', color: '#a33307', padding: '5px' }}
                    >
                      <TbArchiveOff size={35} title="View" style={{ color: 'red' }}  />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Unarchive</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to unarchive this project?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmUnarchive}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={newPage => setCurrentPage(newPage)}
              />
    </>
  );
}

export default ArchivedProjects;
