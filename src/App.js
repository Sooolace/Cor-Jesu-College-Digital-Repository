import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/navbar'; // User navbar
import AdminNavbar from './pages/admin/components/AdminNavbar'; // Admin navbar
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
import KeywordOverview from './pages/user/KeywordOverview';
import EditAuthor from './pages/admin/EditAuthor';
import Departments from './pages/user/Departments';
import DepartmentProjects from './pages/user/DepartmentProjects';
import Authors from './pages/user/Authors';
function MainLayout({ isAdmin }) {
  const location = useLocation();

  // Define paths that should not show the navbar
  const hideNavbarPaths = ['/login'];

  return (
    <>
      {/* Conditionally render Navbar based on the path */}
      {!hideNavbarPaths.includes(location.pathname) && (isAdmin ? <AdminNavbar /> : <Navbar />)}
      
      <Routes>
        {/* User Routes */}
        {!isAdmin && (
          <>
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


          </>
        )}

        {/* Admin Routes */}
        {isAdmin && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/Search" element={<SearchPage />} />
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
            <Route path="/admin/DocumentOverview/:projectId" element={<DocumentOverview />} />
            <Route path="/DocumentOverview/:projectId" element={<DocumentOverview />} />
            <Route path="/AuthorOverview/:authorId" element={<AuthorOverview />} />
            <Route path="/KeywordOverview/:keywordId" element={<KeywordOverview />} />
            <Route path="/AddNewAuthor" element={<addNewAuthor />} />
            <Route path="/admin/Departments" element={<Departments />} />
            <Route path="/departments/:departmentName" element={<DepartmentProjects />} /> 

          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = false; 
    setIsAdmin(adminStatus);
  }, []);

  return (
    <div className="App">
      <Router>
        <MainLayout isAdmin={isAdmin} />
      </Router>
    </div>
  );
}

export default App;
