import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { CiViewList } from "react-icons/ci";
import Breadcrumb from '../../components/BreadCrumb';
<<<<<<< HEAD
import PaginationComponent from '../../components/PaginationComponent';

=======
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

function AllWorks() {
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

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
<<<<<<< HEAD
            { label: 'Theses & Disserations', link: '/allworks' },
=======
            { label: 'All Works', link: '/allworks' },
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
          ]}
        />
      </div>
      <div className="total-works-container container mt-4">
<<<<<<< HEAD
      <div className="text-center mb-4">
          <h3 className="display-8">Studies</h3>
        </div>
        <div className="author-underline"></div>
=======
        <div className="text-center mb-4">
          <h2 className="display-8">Projects Overview</h2>
          <div className="author-underline"></div>
        </div>

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
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
<<<<<<< HEAD
                  <th style={{ width: '50%' }}>Title</th>
                  <th style={{ width: '20%' }}>Authors</th>
                  <th
                    style={{ width: '20%', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
=======
                  <th style={{ width: '34%' }}>Title</th>
                  <th style={{ width: '20%' }}>Authors</th>
                  <th
                    style={{ width: '15%', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
                    onClick={toggleSortOrder}
                  >
                    Date Published {sortOrder === 'latest' ? '(Newest)' : '(Oldest)'}
                  </th>
<<<<<<< HEAD
                  <th style={{ width: '2%' }}>View</th>
=======
                  <th style={{ width: '9%' }}>View</th>
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
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
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CiViewList size={25} title="View" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
<<<<<<< HEAD
                  {/* Pagination Component */}
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}  // Correctly passing totalPages
                    handlePageChange={newPage => setCurrentPage(newPage)}
                  />
=======

            <Pagination className="d-flex justify-content-center">
              <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
              <Pagination.Item active>{currentPage}</Pagination.Item>
              <Pagination.Next onClick={handleNext} disabled={currentPage === totalPages} />
            </Pagination>
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
          </>
        )}
      </div>
    </>
  );
}

export default AllWorks;
