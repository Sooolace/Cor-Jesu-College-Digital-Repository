import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../user/styles/departmentprojects.css';  // Import the CSS
import Button from 'react-bootstrap/Button';
import { FaArrowLeft } from 'react-icons/fa';

function DepartmentProjects() {
  const { departmentName } = useParams();  // Get the department abbreviation from the URL
  const navigate = useNavigate();  // Get the navigate function
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(10);

  // Mapping of department abbreviations to full department names
  const departmentNameMapping = {
    'ccis': 'College of Computer and Information Sciences (CCIS)',
    'coe': 'College of Engineering (COE)',
    'cabe': 'College of Accountancy, Business, and Entrepreneurship (CABE)',
    'chs': 'College of Health Sciences (CHS)',
    'cedas': 'College of Education Arts and Sciences (CEDAS)',
    'cjc': 'Graduate School',
  };

  const fullDepartmentName = departmentNameMapping[departmentName] || 'Unknown Department';  // Default in case the department abbreviation is not found

  useEffect(() => {
    // Fetch projects based on department name
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects/departments/${departmentName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [departmentName]);

  // Get current projects for the current page
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToProjectDetail = (projectId) => {
    navigate(`/DocumentOverview/${projectId}`);  // Navigate to the Document Overview page
  };

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="centered-content">
            <div>
       <Button variant="btn" onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft className="me-2" /> Back
        </Button>
      </div>
      <h2 className="department-title">{fullDepartmentName}</h2>
      {projects.length === 0 ? (
        <p className="no-projects-message">No projects found for this department.</p>
      ) : (
        <div className="projects-list">
          {currentProjects.map((project) => (
            <div key={project.project_id} className="project-card">
              <h3 className="project-title" onClick={() => goToProjectDetail(project.project_id)}>
                {project.title}
              </h3>
              <div className="project-meta">
                <p className="project-authors"><i className="fas fa-users"></i> {project.authors || 'No authors listed'}</p>
                <p className="project-date"><i className="fas fa-calendar-alt"></i> {new Date(project.publication_date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="page-number">Page {currentPage}</span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * projectsPerPage >= projects.length}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default DepartmentProjects;
