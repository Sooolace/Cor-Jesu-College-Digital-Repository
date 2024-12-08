import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Dropdown, Spinner } from 'react-bootstrap';
import '../user/styles/departmentprojects.css';
import Breadcrumb from '../../components/BreadCrumb';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

function DepartmentProjects() {
  const { departmentName } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);
  const [filterYears, setFilterYears] = useState([]);
  const [statistics, setStatistics] = useState({});

  const departmentNameMapping = {
    ccis: 'College of Computer and Information Sciences (CCIS)',
    coe: 'College of Engineering (COE)',
    cabe: 'College of Accountancy, Business, and Entrepreneurship (CABE)',
    chs: 'College of Health Sciences (CHS)',
    cedas: 'College of Education Arts and Sciences (CEDAS)',
    cjc: 'Graduate School',
  };

  const fullDepartmentName = departmentNameMapping[departmentName] || 'Unknown Department';
  const [originalProjects, setOriginalProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects/departments/${departmentName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setOriginalProjects(data); // Store the full list
        setProjects(data); // Display the full list by default
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
        ? prevYears.filter((item) => item !== year) // Remove the year if already selected
        : [...prevYears, year] // Add the year if not already selected
    );
  };
  

  const handleApplyFilter = () => {
    if (filterYears.length === 0) {
      setProjects(originalProjects); // Restore the full list of projects
    } else {
      const filtered = originalProjects.filter((project) =>
        filterYears.includes(new Date(project.publication_date).getFullYear().toString())
      );
      setProjects(filtered);
    }
    setCurrentPage(1); // Reset to the first page
  };
  

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const prepareStatisticsData = () => {
    return Object.entries(statistics).map(([year, count]) => ({
      year: parseInt(year),
      count,
    }));
  };
  

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

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
              <h6>Filter by Year</h6>
              <div className="filter-underline"></div>
              <div className="dropdown-container d-flex align-items-center justify-content-between flex-wrap" style={{ gap: '10px' }}>
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-custom-components"
                      style={{
                        backgroundColor: '#a33307',
                        width: '200px',
                        color: '#f8f9fa',
                        border: 'none',
                        borderRadius: '5px',
                        outline: 'none',
                      }}
                    >
                      Select Year
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
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
                    style={{ backgroundColor: '#a33307', color: 'white', border: 'none', borderRadius: '5px' }}
                    className="ml-2 mt-2 mt-md-0 btn-filter"
                    onClick={handleApplyFilter}
                  >
                  Filter
                  </Button>
                </div>
  {/* Yearly Distribution Chart */}
  <div className="statistics-section mt-4">
    <h6>Yearly Distribution</h6>
    <div className="filter-underline"></div>

    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={prepareStatisticsData()} // Generates the data for the chart
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884ff" />
      </BarChart>
    </ResponsiveContainer>
  </div>
  <div className="total-works mt-2 mb-4 d-flex justify-content-center align-items-center">
              <h6><strong>Total Projects:</strong> {projects.length}</h6>
            </div>
</Form>
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
                        <i className="fas fa-users"></i> {project.authors || 'No authors listed'}
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

            {/* Pagination */}
            <div className="pagination mt-3 d-flex justify-content-center align-items-center flex-wrap">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`btn btn-secondary mx-1 ${currentPage === pageNumber ? 'active' : ''}`}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DepartmentProjects;
