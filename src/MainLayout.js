import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './pages/admin/components/AdminNavbar';
import Navbar from './components/navbar';
import Home from './pages/user/Home';
import AdvanceSearch from './pages/user/Advance_search';
import SearchPage from './pages/user/SearchPage';
import DocumentOverview from './pages/user/DocumentOverview';
import Register from './pages/user/Register';
import Topics from './components/Topics';
import AuthorOverview from './pages/user/AuthorOverview';
import AdminDashboard from './pages/admin/AdminDashboard';
import UploadProject from './pages/admin/UploadProject';
import UploadDetails from './pages/admin/UploadDetails';
import UploadFiles from './pages/admin/UploadFiles';
import DescribeWork from './pages/admin/DescribeWork';
import ConfirmSubmission from './pages/admin/ConfirmSubmission';
import TotalWorks from './pages/admin/TotalWorks';
import TotalAuthors from './pages/admin/TotalAuthors';
import Login from './pages/admin/login';
import EditProject from './pages/admin/EditProject';
import AddNewAuthor from './pages/admin/components/addNewAuthor';
import EditAuthor from './pages/admin/EditAuthor';
import KeywordOverview from './pages/user/KeywordOverview';
import Departments from './pages/user/Departments';
import DepartmentProjects from './pages/user/DepartmentProjects';
import Authors from './pages/user/Authors';
import Keywords from './pages/user/Keywords';
import AllWorks from './pages/user/AllWorks';
import EditFeatured from './pages/user/EditFeatured';
import Help from './pages/user/Help';


function MainLayout() {
  const [isAdmin, setIsAdmin] = useState(false); // Initialize state for admin
  const location = useLocation();
  const navigate = useNavigate();

  // Check user authentication and role from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Get role from localStorage

    if (token && role) {
      setIsAdmin(role === 'admin'); // Set admin state based on role
    } else {
      setIsAdmin(false); // Set to false if no token or role
    }
  }, []);

  // Redirect users who are not admins from admin routes
  useEffect(() => {
    const adminRoutes = [
      '/admindashboard',
      '/admin/UploadProject',
      '/admin/EditProject',
      '/admin/UploadDetails',
      '/admin/DescribeWork',
      '/admin/DescribeWork/upload-files',
      '/admin/TotalWorks',
      '/admin/TotalAuthors',
      '/admin/EditAuthor',
      '/AddNewAuthor',
      '/admin/Departments',
    ];

    const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
    if (isAdminRoute && !isAdmin) {
      navigate('/login'); // Redirect to login page if user is not an admin
    }
  }, [location, isAdmin, navigate]);

  // Redirect to the dashboard if an admin tries to access the login page
  useEffect(() => {
    if (isAdmin && location.pathname === '/login') {
      navigate('/admindashboard'); // Redirect to admin dashboard if logged in as admin
    }
  }, [isAdmin, location.pathname, navigate]);

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    
    setIsAdmin(false); // Update the admin state
    navigate('/'); // Redirect to homepage (or login)
  };

  // Define routes where navbar should not appear
  const noNavbarRoutes = ['/login'];

  // Check if the current route is one of the routes without navbar
  const hideNavbar = noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render Navbar based on the current route */}
      {!hideNavbar && (isAdmin ? <AdminNavbar handleLogout={handleLogout} /> : <Navbar />)}

      <Routes>
        {/* User Routes */}
        <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
        <Route path="/" element={<Home />} />
        <Route path="/AdvanceSearch" element={<AdvanceSearch />} />
        <Route path="/Search" element={<SearchPage />} />
        <Route path="/DocumentOverview/:projectId" element={<DocumentOverview />} />
        <Route path="/AuthorOverview/:authorId" element={<AuthorOverview />} />
        <Route path="/KeywordOverview/:keywordId" element={<KeywordOverview />} />
        <Route path="/register" element={<Register />} />
        <Route path="/topic" element={<Topics />} />
        <Route path="/Departments" element={<Departments />} />
        <Route path="/departments/:departmentName" element={<DepartmentProjects />} />
        <Route path="/Authors" element={<Authors />} />
        <Route path="/Keywords" element={<Keywords />} />
        <Route path="/AllWorks" element={<AllWorks />} />
        <Route path="/EditFeatured" element={<EditFeatured />} />
        <Route path="/help" element={<Help />} />

        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/admin/UploadProject" element={<UploadProject />} />
            <Route path="/admin/UploadDetails" element={<UploadDetails />} />
            <Route path="/admin/DescribeWork" element={<DescribeWork />} />
            <Route path="/admin/DescribeWork/upload-files" element={<UploadFiles />} />
            <Route path="/admin/DescribeWork/upload-files/Confirm" element={<ConfirmSubmission />} />
            <Route path="/admin/TotalWorks" element={<TotalWorks />} />
            <Route path="/admin/TotalAuthors" element={<TotalAuthors />} />
            <Route path="/admin/EditProject/:projectId" element={<EditProject />} />
            <Route path="/admin/EditAuthor/:authorId" element={<EditAuthor />} />
            <Route path="/AddNewAuthor" element={<AddNewAuthor />} />
            <Route path="/admin/Departments" element={<Departments />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default MainLayout;
