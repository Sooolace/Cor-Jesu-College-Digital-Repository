import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/CJCREPOLOGO.png';
import '../pages/user/styles/header.css';
import BookmarkModal from './BookmarkModal';

function NavigationBar() {
    const [expanded, setExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check authentication whenever the location changes
    useEffect(() => {
        checkAuthentication();
    }, [location]);

    // Function to check authentication status
    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        const userId = localStorage.getItem('user_id');
        
        if (token && storedUsername) {
            setIsAuthenticated(true);
            setUsername(storedUsername);
            
            // First try to get the profile picture directly from localStorage
            // This is the most direct and reliable method if available
            const storedPicture = localStorage.getItem('picture');
            if (storedPicture) {
                console.log('Using profile picture from localStorage:', storedPicture);
                setProfilePicture(storedPicture);
                return;
            }
            
            // If not in localStorage, fetch from API
            if (userId) {
                try {
                    // Use the correct endpoint for user data
                    const response = await fetch(`/api/users/${userId}`);
                    if (response.ok) {
                        const userData = await response.json();
                        console.log('User data:', userData);
                        
                        // Check for profile picture in various possible fields
                        let picUrl = null;
                        if (userData.picture_url) {
                            picUrl = userData.picture_url;
                        } else if (userData.picture) {
                            picUrl = userData.picture;
                        } else if (userData.profile_picture) {
                            picUrl = userData.profile_picture;
                        } else if (userData.google_picture) {
                            picUrl = userData.google_picture;
                        }
                        
                        if (picUrl) {
                            console.log('Found profile picture URL:', picUrl);
                            
                            // For Google profile pictures, ensure we're using the correct URL format
                            if (picUrl.includes('googleusercontent.com')) {
                                // Make sure the URL ends with =s96-c for proper sizing
                                if (!picUrl.includes('=s96-c')) {
                                    picUrl = picUrl.includes('?') ? 
                                        `${picUrl}&s=96-c` : 
                                        `${picUrl}=s96-c`;
                                }
                            }
                            
                            setProfilePicture(picUrl);
                            // Store in localStorage for future use
                            localStorage.setItem('picture', picUrl);
                        } else {
                            console.log('No profile picture found in user data');
                        }
                    } else {
                        console.log('Failed to fetch user data, status:', response.status);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        } else {
            setIsAuthenticated(false);
            setProfilePicture('');
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
        setProfilePicture('');
        
        // Redirect to homepage
        navigate('/');
    };

    // Preserve login state when navigating
    const handleNavigation = (path) => {
        closeNavbar();
        navigate(path, { state: { preserveLogin: true } });
    };

    // Open bookmark modal
    const openBookmarkModal = () => {
        setShowBookmarkModal(true);
        closeNavbar();
    };

    return (
        <>
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
                                title="Resources" 
                                id="basic-nav-dropdown"
                                className="custom-dropdown"
                            >
                                <NavDropdown.Item onClick={() => handleNavigation('/AllWorks')}>
                                    All works
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
                            
                            {isAuthenticated && (
                                <Nav.Link 
                                    onClick={openBookmarkModal}
                                    className="bookmark-nav-link"
                                    title="My Bookmarks"
                                    style={{ color: '#FACC15' }}
                                >
                                    <i className="fas fa-bookmark"></i>
                                </Nav.Link>
                            )}
                            
                            {isAuthenticated ? (
                                <NavDropdown 
                                    title={
                                        profilePicture ? 
                                        <img 
                                            src={profilePicture} 
                                            alt="Profile" 
                                            className="profile-image" 
                                            referrerPolicy="no-referrer"
                                            crossOrigin="anonymous"
                                            onError={(e) => {
                                                console.log('Image failed to load, falling back to icon');
                                                e.target.style.display = 'none';
                                                // Force re-render with icon only
                                                setProfilePicture('');
                                            }}
                                        /> : 
                                        <i className="fas fa-user-circle" style={{ color: 'white', fontSize: '24px' }}></i>
                                    }
                                    id="user-dropdown"
                                    className="custom-dropdown user-dropdown"
                                >
                                    <NavDropdown.Item onClick={() => handleNavigation('/profile')}>
                                        <i className="fas fa-id-card"></i> Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => handleNavigation('/settings')}>
                                        <i className="fas fa-cog"></i> Settings
                                    </NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => handleNavigation('/language')}>
                                        <i className="fas fa-globe"></i> Language
                                    </NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => handleNavigation('/activity')}>
                                        <i className="fas fa-history"></i> Activity History
                                    </NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => handleNavigation('/notifications')}>
                                        <i className="fas fa-bell"></i> Notifications
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
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
            
            {/* Bookmark Modal */}
            <BookmarkModal 
                show={showBookmarkModal} 
                onHide={() => setShowBookmarkModal(false)} 
            />
        </>
    );
}

export default NavigationBar;