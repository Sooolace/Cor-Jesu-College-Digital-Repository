import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/admindashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faUserFriends, faChartLine, faUpload, faTags, faBuilding } from '@fortawesome/free-solid-svg-icons';
import RecentSubmissions from '../../components/RecentSubmission';
import HorizontalImageBanner from '../../components/HorizontalImageBanner';

function AdminDashboard() {
  const navigate = useNavigate();
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);  // New state for departments
  const [totalKeywords, setTotalKeywords] = useState(0);        // New state for keywords
  const [recentProjects, setRecentProjects] = useState([]);
  
  const mostActiveDepartment = 'CCIS'; // Example department
  const mostActiveDepartmentCount = 40;

  const trendingKeywords = ['AI', 'Sustainability', 'Healthcare', 'Data Science'];
  const averageMonthlySubmissions = 10;

  // Pagination settings
  const itemsPerPage = 5; // Set the limit for items per page
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchProjects = async () => {
      const response = await fetch('/api/projects'); // Replace with your API endpoint
      const data = await response.json();
      setTotalProjects(data.length);

      // Filter recent projects from the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const filteredRecentProjects = data.filter(project => new Date(project.created_at) >= sevenDaysAgo);
      setRecentProjects(filteredRecentProjects);
    };

    const fetchTotalAuthors = async () => {
      const response = await fetch('/api/authors'); // Replace with your API endpoint
      const data = await response.json();
      setTotalAuthors(data.length);
    };

    const fetchDepartmentsCount = async () => {
      const response = await fetch('/api/categories'); // Replace with your API endpoint for categories
      const data = await response.json();
      setTotalDepartments(data.length);  // Set the department count
    };

    const fetchKeywordsCount = async () => {
      const response = await fetch('/api/keywords'); // Replace with your API endpoint for keywords
      const data = await response.json();
      setTotalKeywords(data.length);  // Set the keyword count
    };

    fetchProjects();
    fetchTotalAuthors();
    fetchDepartmentsCount();
    fetchKeywordsCount();
  }, []);

  const goToDocumentOverview = (projectId) => {
    console.log('Navigating to project ID:', projectId);
    navigate(`/DocumentOverview/${projectId}`);
  };

  // Pagination logic
  const totalPages = Math.ceil(recentProjects.length / itemsPerPage);
  const displayedProjects = recentProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="centered-content">
          <h2>Admin Dashboard</h2>
          <div className="upload-btn-container">
            <Link to="/admin/DescribeWork" className="btn-Aprimary">
              <FontAwesomeIcon icon={faUpload} /> Upload New Work
            </Link>
          </div>
        </div>
      </header>

      <div className="centered-content">
        <div className="metrics">
          <MetricItem title="Total Works" link="/admin/TotalWorks" value={totalProjects} icon={faFolderOpen} />
          <MetricItem title="Total Authors" link="/admin/TotalAuthors" value={totalAuthors} icon={faUserFriends} />
          <MetricItem title="Departments" link="/admin/Departments" value={totalDepartments} icon={faBuilding} /> {/* Dynamic Departments */}
          <MetricItem title="Keywords" value={totalKeywords} icon={faTags} /> {/* Dynamic Keywords */}
          <MetricItem title="Add Featured" value={totalKeywords} icon={faTags} /> {/* Dynamic Keywords */}

        </div>

        <div className="two-column-section">
          <section className="recent-submissions">
            <RecentSubmissions />
          </section>
        </div>

        <Section title="Trending Topics">
          <ul>
            {trendingKeywords.map((keyword, index) => (
              <li key={index}>
                <Link to={`/projects/keyword/${keyword.toLowerCase()}`}>{keyword}</Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Pagination for Recent Projects */}
        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable metric item component
const MetricItem = ({ title, link, value, icon }) => (
  <Link to={link} className="metric-item">
    <h4><FontAwesomeIcon icon={icon} /> {title}</h4>
    <p>{value}</p>
  </Link>
);

// Reusable section component
const Section = ({ title, children }) => (
  <div className="section">
    <h4>{title}</h4>
    {children}
  </div>
);

export default AdminDashboard;
