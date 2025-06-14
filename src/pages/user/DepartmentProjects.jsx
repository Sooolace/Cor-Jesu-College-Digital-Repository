import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import '../user/styles/departmentprojects.css';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function DepartmentProjects() {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYears, setFilterYears] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);

  // First, fetch department info to get the ID
  useEffect(() => {
    const fetchDepartmentInfo = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const departments = await response.json();
        
        console.log('Current departmentName from URL:', departmentName);
        console.log('All departments:', departments);
        
        // Find the department that matches our slug
        const department = departments.find(dept => {
          // Extract acronym from name if it exists in parentheses
          const acronymMatch = dept.name.match(/\(([^)]+)\)/);
          const deptSlug = acronymMatch ? 
            acronymMatch[1].toLowerCase() : 
            dept.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          console.log('Comparing:', {
            departmentName: dept.name,
            deptSlug: deptSlug,
            urlSlug: departmentName,
            matches: deptSlug === departmentName
          });
          
          return deptSlug === departmentName;
        });

        if (department) {
          console.log('Found matching department:', department);
          setDepartmentInfo(department);
        } else {
          console.log('No matching department found');
          setError('Department not found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching department info:', error);
        setError('Failed to load department information');
        setLoading(false);
      }
    };

    fetchDepartmentInfo();
  }, [departmentName]);

  // Then fetch projects using the department ID
  useEffect(() => {
    const fetchProjects = async () => {
      if (!departmentInfo) return;

      try {
        const response = await fetch(`/api/projects/departments/${departmentInfo.category_id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setOriginalProjects(data);
        setProjects(data);
        setFilteredProjects(data);

        const stats = data.reduce((acc, project) => {
          const year = new Date(project.publication_date).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});
        setStatistics(stats);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [departmentInfo]);

  const handleYearCheckboxChange = (year) => {
    setFilterYears((prevYears) =>
      prevYears.includes(year)
        ? prevYears.filter((item) => item !== year)
        : [...prevYears, year]
    );
  };

  const handleApplyFilter = () => {
    const newFilteredProjects = filterYears.length > 0
      ? originalProjects.filter((project) =>
          filterYears.includes(new Date(project.publication_date).getFullYear().toString())
        )
      : originalProjects;

    setProjects(newFilteredProjects);
    setFilteredProjects(newFilteredProjects);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    const filtered = originalProjects.filter((project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setProjects(filtered);
    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

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

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Departments', link: '/Departments' },
            { label: departmentInfo?.name || 'Loading...', link: `/Departments/${departmentName}` },
          ]}
        />
      </div>

      <div className="department-overview-container container mt-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 a-filter-container">

          <Form>
  {/* Search Functionality */}
  <div className="filter-title">
  SEARCH
  </div>
  <div className="filter-underline"></div>
  <div className="search-container mb-3 d-flex">
  {/* Search Input */}
  <input
    type="text"
    placeholder={`Enter project title here`}
    value={searchTerm}
    onChange={handleSearchChange}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();  // Prevent page refresh
        handleSearchClick();
      }
    }}
    className="form-control"
    style={{
      borderRadius: '5px',
      border: '1px solid #ccc',
      outline: 'none',
      flex: 1,
    }}
  />

  {/* Search Button */}
  <Button 
    onClick={handleSearchClick} 
    className="btn btn-primary ml-2"
    style={{
      backgroundColor: '#a33307',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
    }}
  >
    <i className="fas fa-search"></i>
  </Button>
</div>


              <div className="filter-title">
  FILTER
  </div>  <div className="filter-underline"></div>
  <div
    className="dropdown-container d-flex align-items-center justify-content-between flex-wrap"
    style={{ gap: '10px' }}
  >
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-custom-components"
        style={{
          backgroundColor: '#a33307',
          width: '220px',
          color: '#f8f9fa',
          border: 'none',
          borderRadius: '5px',
          outline: 'none',
        }}
      >
        Select Year
      </Dropdown.Toggle>

      <Dropdown.Menu
              style={{
                width: '220px',
                paddingLeft: '10px',
                paddingRight: '10px',

              }}>
        {Object.keys(statistics).map((year) => (
          <Form.Check
            key={year}
            type="checkbox"
            label={year}
            checked={filterYears.includes(year)}
            onChange={() => handleYearCheckboxChange(year)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>

    <Button
      style={{
        backgroundColor: '#a33307',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
      }}
      className="ml-2 mt-2 mt-md-0 btn-filter"
      onClick={handleApplyFilter}
    >
      Filter
    </Button>
  </div>
            </Form>

            {/* Statistics Visualization */}
            <div className="mt-4">
            <div className="filter-title">
            YEARLY CONTRIBUTION
            </div>  <div className="filter-underline"></div>              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(statistics).map(([year, count]) => ({
                    year,
                    count,
                  }))}
                >
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 content-container">
            <h4>{departmentInfo?.name || 'Loading...'}</h4>
            <div className="author-underline mb-4"></div>

            {currentProjects.length === 0 ? (
              <p>No projects found for this department.</p>
            ) : (
              <div className="projects-list">
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
                          onClick={() => navigate(`/DocumentOverview/${project.project_id}`)}
                          style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}
                        >
                          {project.title}
                        </a>
                        <div style={{ fontStyle: 'italic', color: '#6c757d' }}>
                          {removeDuplicateAuthors(project.authors).join(', ') || 'N/A'}
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
            )}
                  {/* Pagination Component */}
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}  // Correctly passing totalPages
                    handlePageChange={newPage => setCurrentPage(newPage)}
                  />
          </div>
        </div>
      </div>
    </>
  );
}

export default DepartmentProjects;
