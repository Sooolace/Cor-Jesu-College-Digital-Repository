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

  const departmentNameMapping = {
    ccis: 'College of Computer and Information Sciences (CCIS)',
    coe: 'College of Engineering (COE)',
    cabe: 'College of Accountancy, Business, and Entrepreneurship (CABE)',
    chs: 'College of Health Sciences (CHS)',
    cedas: 'College of Education Arts and Sciences (CEDAS)',
    cjc: 'Graduate School',
  };

  const fullDepartmentName = departmentNameMapping[departmentName] || 'Unknown Department';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects/departments/${departmentName}`);
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
  }, [departmentName]);

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

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Departments', link: '/Departments' },
            { label: fullDepartmentName, link: `/Departments/${departmentName}` },
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
            <h4>{fullDepartmentName}</h4>
            <div className="author-underline mb-4"></div>

            {currentProjects.length === 0 ? (
              <p>No projects found for this department.</p>
            ) : (
              <div className="projects-list">
                {currentProjects.map((project) => (
                  <div key={project.project_id} className="project-card">
                    <h3
                      className="project-title"
                      onClick={() => navigate(`/DocumentOverview/${project.project_id}`)}
                    >
                      {project.title}
                    </h3>
                    <div className="project-meta">
                      <p className="project-authors">
                        <i className="fas fa-users"></i> {project.authors}
                      </p>
                      <p className="project-date">
                        <i className="fas fa-calendar-alt"></i>{' '}
                        {new Date(project.publication_date).toLocaleDateString()}
                      </p>
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
