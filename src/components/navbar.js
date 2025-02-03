import React, { useState } from 'react';
import logo from '../assets/CJCREPOLOGO.png';
import '../pages/user/styles/header.css';
import { Link } from 'react-router-dom';

function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <header>
        <div className="header-container">
            <Link to="/">
                <img src={logo} alt="CJC Repository Logo" className="logo" />
            </Link>
    
            <nav>
                <Link to="/">Home</Link>
                <Link to="/search">Search</Link>
    
                <div className="dropdown" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
                    <Link to="#" className="dropdown-link">
                        Research Resources <span className="dropdown-arrow">&#9660;</span> {/* Downward arrow */}
                    </Link>
                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <Link to="/AllWorks">Theses & Disserations</Link>
                            <Link to="/Authors">Authors</Link>
                            <Link to="/Keywords">Keywords</Link>
                            <Link to="/Departments">Departments</Link>
                            <Link to="/resources">Resources</Link>
                        </div>
                    )}
                </div>
    
                <Link to="/help">Help</Link>
            </nav>
        </div>
    </header>
    
    );
}

export default Navbar;
