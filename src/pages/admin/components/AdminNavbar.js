import React, { useState } from 'react';
import logo from '../src/CJCREPOLOGO.png';
import '../styles/adminheader.css';
import { Link } from 'react-router-dom';

function AdminNavbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header>
            <div className="header-container">
                <Link to="/admindashboard">
                    <img src={logo} alt="CJC Repository Logo" className="logo" />
                </Link>

                <nav>
                    <Link to="/admindashboard">Home</Link>
                    <Link to="/admin/Search">Search</Link>

                    {/* Academics Dropdown in Admin Navbar */}
                    <div 
                        className="dropdown" 
                        onMouseEnter={() => setIsDropdownOpen(true)} 
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <span className="dropdown-link">
                            Academics
                        </span>
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
                    <Link to="/login" className="sign-in-btn">Sign In</Link>
                </nav>
            </div>
        </header>
    );
}

export default AdminNavbar;
