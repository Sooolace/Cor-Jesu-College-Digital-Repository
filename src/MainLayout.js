import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './pages/admin/components/AdminNavbar';
import Navbar from './components/navbar';
import Home from './pages/user/Home';
import AdvancedSearch from './pages/user/AdvancedSearch';
import SearchPage from './pages/user/SearchPage';
import DocumentOverview from './pages/user/DocumentOverview';
import Register from './pages/user/Register';
import Topics from './components/Topics';
import AuthorOverview from './pages/user/AuthorOverview';
import AdminDashboard from './pages/admin/AdminDashboard';
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
import NotFound from './pages/user/NotFound';
import ArchivedProjects from './pages/admin/ArchivedProjects';
import FeaturedProjects from './pages/admin/FeaturedProjects';
import ActivityLog from './pages/user/ActivityLog';
import TotalKeywords from './pages/admin/TotalKeywords';
import EditDepartments from './pages/admin/EditDepartments';
import UserManagement from './pages/admin/UserManagement';

// Memoize components here
const MemoizedHome = React.memo(Home);
const MemoizedSearchPage = React.memo(SearchPage);
const MemoizedDocumentOverview = React.memo(DocumentOverview);
const MemoizedAuthorOverview = React.memo(AuthorOverview);
// Repeat for other components...

function MainLayout({ isAdmin, setIsAdmin }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Set admin state based on local storage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const isAdminStorage = localStorage.getItem('isAdmin');

    console.log('MainLayout useEffect - Checking auth state:', { 
      token: token ? 'Present' : 'Not present', 
      role, 
      isAdminStorage,
      currentPath: location.pathname 
    });

    // Don't check auth state when on login page to avoid redirect loops
    if (location.pathname === '/login') {
      console.log('On login page, not checking auth state to avoid redirects');
      return;
    }

    if (token && (role === 'admin' || isAdminStorage === 'true')) {
      console.log('Setting isAdmin to true');
      setIsAdmin(true);
    } else if (token) {
      console.log('User is authenticated but not admin');
      setIsAdmin(false);
    } else {
      console.log('User is not authenticated');
      setIsAdmin(false);
    }
  }, [setIsAdmin, location.pathname]);

  // Admin route protection: Redirect to login if the user is not an admin
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
      '/Archived_Projects',
      '/Featured_Projects',
      '/admin/edit-departments',
    ];

    const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));

    if (isAdminRoute && !isAdmin) {
      navigate('/login');
    }
  }, [location, isAdmin, navigate]);

  // Redirect to admin dashboard after login (if already logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // If there's a token and we're on the root path, redirect based on role
    if (token && location.pathname === '/') {
      if (role === 'admin') {
        console.log('Admin user at root path, redirecting to admin dashboard');
        navigate('/admindashboard');
      } else {
        console.log('Regular user at root path, staying on homepage');
        // Regular users stay on the homepage
      }
    }
  }, [location.pathname, navigate]);

  // Handle logout
  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    console.log('Logged out, all localStorage items cleared');
    setIsAdmin(false);
    navigate('/');
  };

  // Define routes that should not show the navbar
  const noNavbarRoutes = ['/login', '/notfound']; // Include '/notfound' or '*'
  
  // Check if the current location is one of the routes to hide the navbar
  const hideNavbar = noNavbarRoutes.includes(location.pathname) || location.pathname === '/notfound';

  return (
    <>
      {!hideNavbar && (isAdmin ? <AdminNavbar handleLogout={handleLogout} /> : <Navbar />)}
      <Routes>
        <Route path="/login" element={<Login setIsAdmin={setIsAdmin} />} />
        <Route path="/" element={<MemoizedHome />} />
        <Route path="/advanced-search" element={<AdvancedSearch />} />
        <Route path="/Search" element={<MemoizedSearchPage />} />
        <Route path="/DocumentOverview/:projectId" element={<MemoizedDocumentOverview />} />
        <Route path="/AuthorOverview/:authorId" element={<MemoizedAuthorOverview />} />
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
        <Route path="/activity-log" element={<ActivityLog />} />

        {isAdmin && (
          <>
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/admin/UploadDetails" element={<UploadDetails />} />
            <Route path="/admin/DescribeWork" element={<DescribeWork />} />
            <Route path="/admin/DescribeWork/upload-files" element={<UploadFiles />} />
            <Route path="/admin/DescribeWork/upload-files/Confirm" element={<ConfirmSubmission />} />
            <Route path="/admin/TotalWorks" element={<TotalWorks />} />
            <Route path="/admin/TotalAuthors" element={<TotalAuthors />} />
            <Route path="/admin/EditProject/:projectId" element={<EditProject />} />
            <Route path="/admin/EditAuthor/:authorId" element={<EditAuthor />} />
            <Route path="/admin/Departments" element={<Departments />} />
            <Route path="/Archived_Projects" element={<ArchivedProjects />} />
            <Route path="/Featured_Projects" element={<FeaturedProjects />} />
            <Route path="/admin/TotalKeywords" element={<TotalKeywords />} />
            <Route path="/admin/edit-departments" element={<EditDepartments />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </>
        )}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default MainLayout;
