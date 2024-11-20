import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Table from 'react-bootstrap/Table'; 
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination'; 
import Spinner from 'react-bootstrap/Spinner'; 
import Form from 'react-bootstrap/Form'; 
import { MdEditSquare, MdDelete } from 'react-icons/md';
import { CiViewList } from "react-icons/ci";
import { FaArrowLeft } from 'react-icons/fa';

// modal imports
import ConfirmDeletionModal from '../admin/components/modals/ConfirmDeletionModal';
import SuccessModal from '../admin/components/modals/SuccessModal';

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
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!projectIdToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectIdToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the project');
      }
      setProjects((prevProjects) => prevProjects.filter((project) => project.project_id !== projectIdToDelete));
      setFilteredProjects((prevProjects) => prevProjects.filter((project) => project.project_id !== projectIdToDelete));
      setShowDeleteModal(false);
      setShowSuccessModal(true); 
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting the project');
    }
  };

  const handleFilter = () => {
    let filtered = projects;

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

  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToDocumentOverview = (projectId) => {
    navigate(`/admin/DocumentOverview/${projectId}`);
  };

  const goToEditAuthor = (projectId) => {
    navigate(`/admin/EditProject/${projectId}`);
  };

  return (
    <div className="total-works-container container mt-4">
      <div>
       <Button variant="btn" onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft className="me-2" /> Back
        </Button>
      </div>
      <div className="text-center mb-4">
        <h2 className="display-8">Projects Overview</h2>
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
        <>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th style={{ width: '34%' }} >Title</th>
                <th style={{ width: '20%' }}>Authors</th>
                <th 
                  style={{ width: '15%', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }} 
                  onClick={toggleSortOrder} 
                >
                  Date Published {sortOrder === 'latest' ? '(Newest)' : '(Oldest)'}
                </th>
                <th style={{ width: '9%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project) => (
                <tr key={project.project_id}>
                  <td>{project.title}</td>
                  <td>{project.authors || 'N/A'}</td>
                  <td>{new Date(project.publication_date).toLocaleDateString() || 'N/A'}</td>
                  <td>
                    <span 
                      onClick={() => goToDocumentOverview(project.project_id)} 
                      style={{
                        cursor: 'pointer',
                        color: 'white',
                        backgroundColor: '#007bff',
                        borderRadius: '5px',
                        padding: '3px',
                        marginRight: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CiViewList size={25} title="View" />
                    </span>

                    <span 
                      onClick={() => goToEditAuthor(project.project_id)} 
                      style={{
                        cursor: 'pointer',
                        color: 'white',
                        backgroundColor: '#28a745',
                        borderRadius: '5px',
                        padding: '4px',
                        marginRight: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MdEditSquare size={25} title="Edit" />
                    </span>

                    <span 
                      onClick={() => {
                        setProjectIdToDelete(project.project_id);
                        setShowDeleteModal(true);
                      }} 
                      style={{
                        cursor: 'pointer',
                        color: 'white',
                        backgroundColor: '#dc3545',
                        borderRadius: '5px',
                        padding: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MdDelete size={25} title="Delete" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button 
              className="btn-primary" 
              onClick={handleNext} 
              disabled={currentPage === totalPages}
            >
              Next
            </Button>

            <Pagination>
              {Array.from({ length: totalPages }, (_, index) => (
                <Pagination.Item 
                  key={index + 1} 
                  active={index + 1 === currentPage} 
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}
      <ConfirmDeletionModal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)} 
        onDelete={deleteProject} 
      />

      <SuccessModal 
        show={showSuccessModal} 
        onHide={() => setShowSuccessModal(false)} 
      />
    </div>
  );
}

export default TotalWorks;
