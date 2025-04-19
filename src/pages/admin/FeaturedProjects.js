import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { FaEye } from "react-icons/fa";
import { FaStar, FaRegStar } from "react-icons/fa";
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function FeaturedProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects/projects/featured-proj'); 
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching featured projects:', error.message);
      setError('Failed to load featured projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (projectId, isCurrentlyFeatured) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/toggle-featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !isCurrentlyFeatured }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setFilteredProjects(prevProjects =>
          prevProjects.map(project =>
            project.project_id === projectId ? { ...project, is_featured: !isCurrentlyFeatured } : project
          )
        );
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to toggle featured status');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setShowErrorModal(true);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const searchedProjects = projects.filter(project =>
      project.title.toLowerCase().includes(query)
    );
    setFilteredProjects(searchedProjects);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const currentProjects = Array.isArray(filteredProjects)
    ? filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Featured Projects', link: '/featured-projects' }
          ]}
        />
      </div>

      <div className="total-works-container container mt-4">
        <div className="text-center mb-4">
          <h2>Manage Featured Projects</h2>
          <div className="author-underline"></div>
        </div>

        {/* Search Bar */}
        <div className="d-flex justify-content-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search by Project Title"
            value={searchQuery}
            onChange={handleInputChange}
            className="flex-grow-1 me-2"
          />
          <Button variant="primary" onClick={handleSearch}>Search</Button>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span>Loading...</span>
          </div>
        )}
        {error && <p className="text-danger text-center">{error}</p>}

        {currentProjects.length > 0 && (
          <div className="table-responsive">
            <Table striped bordered hover className="mt-3" style={{ fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Title</th>
                  <th style={{ width: '30%' }}>Authors</th>
                  <th style={{ width: '15%' }}>Date Published</th>
                  <th style={{ width: '15%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map((project) => (
                  <tr key={project.project_id}>
                    <td>{project.title}</td>
                    <td>{project.authors}</td>
                    <td>{new Date(project.publication_date).toLocaleDateString()}</td>
                    <td>
                      <span
                        onClick={() => navigate(`/DocumentOverview/${project.project_id}`)}
                        style={{ display: 'inline-block', cursor: 'pointer', padding: '5px' }}
                      >
                        <FaEye size={20} title="View" style={{ color: '#0d6efd' }} />
                      </span>

                      <span
                        onClick={() => toggleFeature(project.project_id, project.is_featured)}
                        style={{ cursor: 'pointer', padding: '5px' }}
                      >
                        {project.is_featured ? (
                          <FaStar size={20} title="Unfeature" style={{ color: 'gold' }} />
                        ) : (
                          <FaRegStar size={20} title="Feature" style={{ color: 'gray' }} />
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={newPage => setCurrentPage(newPage)}
        />

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>The project's featured status has been updated successfully!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Error Modal */}
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>You can only feature up to 4 projects at a time. Please unfeature another project to add a new one.</Modal.Body>
          <Modal.Footer>
            <Button style={{ backgroundColor: '#a33307', borderColor: '#a33307' }} onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default FeaturedProjects;
