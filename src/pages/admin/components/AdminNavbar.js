import React, { useState, useEffect } from 'react';
import logo from '../src/CJCREPOLOGO.png';
import '../styles/adminheader.css';
import { Link, useNavigate } from 'react-router-dom';

function AdminNavbar({ handleLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (token && storedUsername) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    // Handle logout and redirect to login page
    const handleLogoutAndRedirect = () => {
        // Clear the local storage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        // Call the handleLogout function passed from parent (if any)
        if (handleLogout) handleLogout();

        // Set isAuthenticated to false
        setIsAuthenticated(false);

        // Redirect to login page
        navigate('/login'); // Use useNavigate to redirect to login page
    };

    return (
        <header>
            <div className="header-container">
                <Link to="/admindashboard">
                    <img src={logo} alt="CJC Repository Logo" className="logo" />
                </Link>

                <nav>
                    <Link to="/admindashboard">Home</Link>
                    <Link to="/Search">Search</Link>

                    {/* Academics Dropdown */}
                    <div
                        className="dropdown"
                        onMouseEnter={() => setIsDropdownOpen(true)}
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <span className="dropdown-link">Academics</span>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <Link to="/Authors">Authors</Link>
                                <Link to="/Keywords">Keywords</Link>
                                <Link to="/Departments">Departments</Link>
                                <Link to="/AllWorks">Capstone & Thesis</Link>
                                <Link to="/resources">Resources</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/help">Help</Link>

                    {isAuthenticated ? (
                        <div className="welcome-container">
                            <div className="welcome-message">
                                <span className="welcome-text">
                                    <i className="fas fa-user-circle"></i> Hi, {username}
                                </span>
                                <button onClick={handleLogoutAndRedirect} className="logout-btn">
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="sign-in-btn">
                            <i className="fas fa-sign-in-alt"></i> Sign in
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default AdminNavbar;
