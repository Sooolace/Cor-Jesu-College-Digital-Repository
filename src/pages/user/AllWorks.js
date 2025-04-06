import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { CiViewList } from "react-icons/ci";
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import axios from 'axios'; // Add axios import

function AllWorks() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [filterYear, setFilterYear] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Single search query state
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const [totalCount, setTotalCount] = useState(0);

  // Effect for search and filter changes
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search or filter changes
  }, [searchQuery, filterYear]);

  // Effect for fetching projects
  useEffect(() => {
    fetchProjects();
  }, [currentPage, searchQuery, filterYear]); // Include all dependencies that affect the fetch

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        itemsPerPage,
        ...(searchQuery && { query: searchQuery }),
        ...(filterYear && { fromYear: filterYear, toYear: filterYear }),
      };

      const response = await axios.get('/api/search/allprojs', { params });

      const projectsWithAuthors = response.data.data.map(project => ({
        ...project,
        authors: project.authors ? project.authors.split(', ') : []
      }));

      setProjects(projectsWithAuthors || []);
      setTotalCount(response.data.totalCount);
      setFilteredProjects(projectsWithAuthors || []);
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

  const applyFilters = (allProjects) => {
    let filtered = allProjects;
    if (searchQuery) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.authors && project.authors.join(', ').toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filterYear) {
      filtered = filtered.filter(project => 
        new Date(project.publication_date).getFullYear().toString() === filterYear
      );
    }
    return filtered;
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchProjects();
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

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentProjects = filteredProjects;

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToDocumentOverview = (projectId) => {
    navigate(`/DocumentOverview/${projectId}`);
  };

  // Trigger handleFilter when 'Enter' is pressed
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };
  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[{ label: 'Home', link: '/' }, { label: 'Theses & Disserations', link: '/allworks' }]}
        />
      </div>
      <div className="total-works-container container mt-4">
        <div className="text-center mb-4">
          <h3 className="display-8">Studies</h3>
        </div>
        <div className="author-underline"></div>
        <div className="d-flex justify-content-center mb-3">
          <Form.Control
            type="text"
            className="flex-grow-1 me-2"
            placeholder="Search by Title, Author, or Keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress} // Listen for Enter key press
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

          <Button
            variant="primary"
            onClick={handleFilter}
            style={{ backgroundColor: '#a33307', borderColor: '#a33307' }} // Change color here
          >
            Filter
          </Button>
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
            <div className="search-results">
              {currentProjects.map((project) => (
                <div key={project.project_id} className="search-result-item mb-4">
                  <div className="d-flex align-items-start" style={{ flexWrap: 'nowrap' }}>
                    {project.cover_image ? (
                      <img
                        src={project.cover_image}
                        alt="Cover"
                        style={{
                          maxWidth: '80px', // Limit max width
                          height: '120px',  // Set a fixed height
                          objectFit: 'cover', // Ensure the image covers the area without stretching
                          marginRight: '20px',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100px',
                          height: '150px',
                          backgroundColor: '#f4f4f4',
                          marginRight: '20px',
                        }}
                      ></div>
                    )}
                    <div style={{ flex: 1 }}>
                      <a
                        href="#"
                        onClick={() => goToDocumentOverview(project.project_id)}
                        style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}
                      >
                        {project.title}
                      </a>
                      <div style={{ fontStyle: 'italic', color: '#6c757d' }}>
                        {Array.isArray(project.authors) ? removeDuplicateAuthors(project.authors).join(', ') : 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {new Date(project.publication_date).toLocaleDateString() || 'N/A'}
                      </div>
                      <div style={{ marginTop: '10px', color: '#333' }}>
                        <p
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3, // Limits to 3 lines of text
                            marginBottom: '0px',
                          }}
                        >
                          {project.abstract || 'No abstract available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={(newPage) => setCurrentPage(newPage)}
            />
          </>
        )}
      </div>
    </>
  );
}

export default AllWorks;
