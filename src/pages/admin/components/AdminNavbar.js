import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import logo from '../src/CJCREPOLOGO.png';
import '../styles/adminheader.css';
import { Link, useNavigate } from 'react-router-dom';

function AdminNavbar({ handleLogout }) {
    const [expanded, setExpanded] = useState(false);
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
        <Navbar expanded={expanded} expand="lg" className="header-background" variant="dark">
            <Container className="header-container">
                <Navbar.Brand as={Link} to="/admindashboard">
                    <img src={logo} alt="CJC Repository Logo" className="logo" />
                </Navbar.Brand>

                <Navbar.Toggle 
                    aria-controls="responsive-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                />

                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center">
                        <Nav.Link as={Link} to="/admindashboard" onClick={() => setExpanded(false)}>Home</Nav.Link>
                        <Nav.Link as={Link} to="/Search" onClick={() => setExpanded(false)}>Search</Nav.Link>

                        <NavDropdown 
                            title="Research Resources" 
                            id="admin-nav-dropdown"
                            className="custom-dropdown"
                        >
                            <NavDropdown.Item as={Link} to="/Authors" onClick={() => setExpanded(false)}>
                                Authors
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Keywords" onClick={() => setExpanded(false)}>
                                Keywords
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Departments" onClick={() => setExpanded(false)}>
                                Departments
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/AllWorks" onClick={() => setExpanded(false)}>
                                Capstone & Thesis
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/resources" onClick={() => setExpanded(false)}>
                                Resources
                            </NavDropdown.Item>
                        </NavDropdown>

                        <Nav.Link as={Link} to="/help" onClick={() => setExpanded(false)}>Help</Nav.Link>
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
                            <Nav.Link as={Link} to="/login" className="sign-in-btn">
                                <i className="fas fa-sign-in-alt"></i> Sign in
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AdminNavbar;
