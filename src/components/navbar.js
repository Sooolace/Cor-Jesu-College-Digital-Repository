import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/CJCREPOLOGO.png';
import '../pages/user/styles/header.css';

function NavigationBar() {
    const [expanded, setExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Check authentication whenever the location changes
    useEffect(() => {
        checkAuthentication();
    }, [location]);

    // Function to check authentication status
    const checkAuthentication = () => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        
        if (token && storedUsername) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
        } else {
            setIsAuthenticated(false);
        }
    };

    const closeNavbar = () => setExpanded(false);

    const isActive = (path) => location.pathname === path;
    
    // Handle logout
    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.clear();
        console.log('Logged out, all localStorage items cleared');
        
        // Update authentication state
        setIsAuthenticated(false);
        
        // Redirect to homepage
        navigate('/');
    };

    // Preserve login state when navigating
    const handleNavigation = (path) => {
        closeNavbar();
        navigate(path, { state: { preserveLogin: true } });
    };

    return (
        <Navbar 
            expanded={expanded}
            expand="lg" 
            className="custom-navbar"
            variant="dark"
        >
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={() => handleNavigation('/')}>
                    <img
                        src={logo}
                        alt="CJC Repository Logo"
                        className="navbar-logo"
                    />
                </Navbar.Brand>
                
                <Navbar.Toggle 
                    aria-controls="responsive-navbar-nav"
                    onClick={() => setExpanded(!expanded)}
                />
                
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link 
                            onClick={() => handleNavigation('/')}
                            className={isActive('/') ? 'active' : ''}
                        >
                            Home
                        </Nav.Link>
                        
                        <Nav.Link 
                            onClick={() => handleNavigation('/search')}
                            className={isActive('/search') ? 'active' : ''}
                        >
                            Search
                        </Nav.Link>
                        
                        <NavDropdown 
                            title="Research Resources" 
                            id="basic-nav-dropdown"
                            className="custom-dropdown"
                        >
                            <NavDropdown.Item onClick={() => handleNavigation('/AllWorks')}>
                                Theses & Dissertations
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleNavigation('/Authors')}>
                                Authors
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleNavigation('/Keywords')}>
                                Keywords
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleNavigation('/Departments')}>
                                Departments
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => handleNavigation('/resources')}>
                                Resources
                            </NavDropdown.Item>
                        </NavDropdown>
                        
                        <Nav.Link 
                            onClick={() => handleNavigation('/help')}
                            className={isActive('/help') ? 'active' : ''}
                        >
                            Help
                        </Nav.Link>
                        
                        {isAuthenticated ? (
                            <div className="welcome-container">
                                <div className="welcome-message">
                                    <span className="welcome-text">
                                        <i className="fas fa-user-circle"></i> Hi, {username}
                                    </span>
                                    <button onClick={handleLogout} className="logout-btn">
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Nav.Link 
                                onClick={() => handleNavigation('/login')}
                                className="sign-in"
                            >
                                Sign In
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;