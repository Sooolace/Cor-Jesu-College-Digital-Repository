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
  const [archivedProjectsCount, setArchivedProjectsCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);

  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token) {
      navigate('/login');
    } else {
      fetchProjects();
      fetchArchivedProjects();
      fetchTotalAuthors();
      fetchDepartmentsCount();
      fetchKeywordsCount();
    }
  }, [navigate]);

  // Fetch total projects
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setTotalProjects(data.length);

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const filteredRecentProjects = data.filter(
        project => new Date(project.created_at) >= sevenDaysAgo
      );
      setRecentProjects(filteredRecentProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  // Fetch archived projects count
  const fetchArchivedProjects = async () => {
    try {
      const response = await fetch('/api/projects/archived-projects');
      const data = await response.json();
      setArchivedProjectsCount(data.length);
    } catch (error) {
      console.error('Failed to fetch archived projects:', error);
    }
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

  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(recentProjects.length / itemsPerPage);
  const displayedProjects = recentProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          {/* Metric for Total Works */}
          <MetricItem title="Manage Works" link="/admin/TotalWorks" value={totalProjects} icon={faFolderOpen} />
          <MetricItem title="Manage Authors" link="/admin/TotalAuthors" value={totalAuthors} icon={faUserFriends} />
          <MetricItem title="Manage Featured" link="/Featured_Projects" value={totalDepartments} icon={faBuilding} />
          <MetricItem title="Manage Keywords" link="/admin/TotalKeywords" value={totalKeywords} icon={faTags} />
          <MetricItem title="Manage Departments" link="/admin/edit-departments" value={totalDepartments} icon={faBuilding} />
          <MetricItem title="Archived Works" link="/Archived_Projects"value={archivedProjectsCount}icon={faTags} />
        </div>

        <div className="two-column-section">
          <section className="recent-submissions">
            <RecentSubmissions />
          </section>
          <section className="most-viewed">
            <MostViewed />
          </section>
        </div>
      </div>
    </div>
  );
}

// Reusable MetricItem component
const MetricItem = ({ title, link, value, icon }) => (
  <Link to={link} className="metric-item">
    <h4><FontAwesomeIcon icon={icon} /> {title}</h4>
    <p>{value}</p>
  </Link>
);

// Reusable Section component
const Section = ({ title, children }) => (
  <div className="section">
    <h4>{title}</h4>
    {children}
  </div>
);

export default AdminDashboard;
