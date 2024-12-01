import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { MdEditSquare, MdDelete } from 'react-icons/md';
import { CiViewList } from "react-icons/ci";
import Breadcrumb from '../../components/BreadCrumb';

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
    console.log("Original Authors:", authors); // Log authors to check the structure
    if (!Array.isArray(authors)) {
      if (typeof authors === 'string') {
        authors = authors.split(',').map(name => name.trim()); // Split authors by commas and trim whitespace
      } else {
        return []; // If authors is not an array or string, return an empty array
      }
    }
  
    // Remove duplicates, trim spaces, and capitalize each name part (first name, last name, etc.)
    const normalizedAuthors = authors
      .map(name => name.trim().toLowerCase()) // Trim spaces and convert to lowercase
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .map(name => 
        name.split(' ') // Split full name into parts
          .map(part => part.charAt(0).toUpperCase() + part.slice(1)) // Capitalize each part of the name
          .join(' ') // Join parts back into a full name
      );
  
    return normalizedAuthors;
  };
  
  
  
  

  const handleFilter = () => {
    let filtered = [...projects]; // Ensure we're working with a fresh copy of projects

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
    setCurrentPage(1); // Reset to first page after filtering
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
  const currentProjects = Array.isArray(filteredProjects)
    ? filteredProjects.slice(indexOfFirstProject, indexOfLastProject)
    : []; // Ensure filteredProjects is an array

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
          <h2 className="display-8">Projects Overview</h2>
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
                    <td>{removeDuplicateAuthors(project.authors).join(", ") || 'N/A'}</td>
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

            <Pagination className="d-flex justify-content-center">
              <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
              <Pagination.Item active>{currentPage}</Pagination.Item>
              <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages} />
            </Pagination>
          </>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmDeletionModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            // Handle project deletion here
          }}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          show={showSuccessModal}
          onHide={() => setShowSuccessModal(false)}
          message="Project successfully deleted!"
        />
      )}
    </>
  );
}

export default TotalWorks;
