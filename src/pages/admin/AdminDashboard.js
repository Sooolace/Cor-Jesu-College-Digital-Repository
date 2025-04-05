import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/admindashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faUserFriends, faChartLine, faUpload, faTags, faBuilding, faStar, faArchive, faUsers } from '@fortawesome/free-solid-svg-icons';
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
  const [featuredProjectsCount, setFeaturedProjectsCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
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
      fetchFeaturedProjects();
      fetchTotalAuthors();
      fetchDepartmentsCount();
      fetchKeywordsCount();
      fetchUsersCount();
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

  // Fetch featured projects count
  const fetchFeaturedProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      // Count only projects where is_featured is true
      const featuredCount = data.filter(project => project.is_featured === true).length;
      setFeaturedProjectsCount(featuredCount);
    } catch (error) {
      console.error('Failed to fetch featured projects:', error);
    }
  };

  const fetchTotalAuthors = async () => {
    const response = await fetch('/api/authors');
    const data = await response.json();
    setTotalAuthors(data.length);
  };

  const fetchDepartmentsCount = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      // Simply count all departments since we want total count
      setTotalDepartments(data.length);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setTotalDepartments(0); // Set to 0 on error
    }
  };

  const fetchKeywordsCount = async () => {
    const response = await fetch('/api/keywords');
    const data = await response.json();
    setTotalKeywords(data.length);
  };

  const fetchUsersCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTotalUsers(data.length);
      }
    } catch (error) {
      console.error('Failed to fetch users count:', error);
      setTotalUsers(0);
    }
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
        <div className="metrics-container">
          <div className="metrics">
            {/* Metric for Total Works */}
            <MetricItem title="Manage Works" link="/admin/TotalWorks" value={totalProjects} icon={faFolderOpen} />
            <MetricItem title="Manage Authors" link="/admin/TotalAuthors" value={totalAuthors} icon={faUserFriends} />
            <MetricItem title="Featured Works" link="/Featured_Projects" value={featuredProjectsCount} icon={faStar} />
            <MetricItem title="Archived Works" link="/Archived_Projects" value={archivedProjectsCount} icon={faArchive} />
            <MetricItem title="Manage Keywords" link="/admin/TotalKeywords" value={totalKeywords} icon={faTags} />
            <MetricItem title="Manage Departments" link="/admin/edit-departments" value={totalDepartments} icon={faBuilding} />
            <MetricItem title="Manage Users" link="/admin/users" value={totalUsers} icon={faUsers} />
          </div>
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
    <div className="icon-container">
      <FontAwesomeIcon icon={icon} className="metric-icon" />
    </div>
    <h4>{title}</h4>
    <p>{value !== undefined ? value : "-"}</p>
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
