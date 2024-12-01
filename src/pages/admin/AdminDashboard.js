import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/admindashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faUserFriends, faChartLine, faUpload, faTags, faBuilding } from '@fortawesome/free-solid-svg-icons';
import RecentSubmissions from '../../components/RecentSubmission';
import HorizontalImageBanner from '../../components/HorizontalImageBanner';
import MostViewed from '../../components/MostViewed';

function AdminDashboard() {
  const navigate = useNavigate();
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  
  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      // If no token is found, redirect to login page
      navigate('/login');
    } else {
      // If token exists, fetch data as usual
      fetchProjects();
      fetchTotalAuthors();
      fetchDepartmentsCount();
      fetchKeywordsCount();
    }
  }, [navigate]); // Dependency on navigate to ensure redirection works

  const fetchProjects = async () => {
    const response = await fetch('/api/projects'); 
    const data = await response.json();
    setTotalProjects(data.length);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const filteredRecentProjects = data.filter(project => new Date(project.created_at) >= sevenDaysAgo);
    setRecentProjects(filteredRecentProjects);
  };

  const fetchTotalAuthors = async () => {
    const response = await fetch('/api/authors'); 
    const data = await response.json();
    setTotalAuthors(data.length);
  };

  const fetchDepartmentsCount = async () => {
    const response = await fetch('/api/categories'); 
    const data = await response.json();
    setTotalDepartments(data.length);  
  };

  const fetchKeywordsCount = async () => {
    const response = await fetch('/api/keywords'); 
    const data = await response.json();
    setTotalKeywords(data.length);  
  };

  // Pagination settings
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
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
          <MetricItem title="Departments" link="/admin/Departments" value={totalDepartments} icon={faBuilding} />
          <MetricItem title="Keywords" value={totalKeywords} icon={faTags} />
          <MetricItem title="Add Featured" value={totalKeywords} icon={faTags} />
        </div>

        <div className="two-column-section">
          <section className="recent-submissions">
            <RecentSubmissions />
          </section>
          <section className="most-viewed">
            <MostViewed />
          </section>
        </div>


        <Section title="Trending Topics">
          <ul>
            {['AI', 'Sustainability', 'Healthcare', 'Data Science'].map((keyword, index) => (
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
