import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import logo from '../src/CJCREPOLOGO.png';
import '../styles/adminheader.css';
import { Link, useNavigate } from 'react-router-dom';
import BookmarkModal from '../../../components/BookmarkModal';

function AdminNavbar({ handleLogout }) {
    const [expanded, setExpanded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [showBookmarkModal, setShowBookmarkModal] = useState(false);
    const navigate = useNavigate(); // Hook to navigate programmatically

    useEffect(() => {
        const fetchUserData = async () => {
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
                    console.log('Admin: Using profile picture from localStorage:', storedPicture);
                    setProfilePicture(storedPicture);
                    return;
                }
                
                // If not in localStorage, fetch from API
                if (userId) {
                    try {
                        // Use the correct endpoint for admin user data
                        const response = await fetch(`/api/users/${userId}`);
                        if (response.ok) {
                            const userData = await response.json();
                            console.log('Admin user data:', userData);
                            
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
                                console.log('Found admin profile picture URL:', picUrl);
                                
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
                                console.log('No profile picture found in admin user data');
                            }
                        } else {
                            console.log('Failed to fetch admin user data, status:', response.status);
                        }
                    } catch (error) {
                        console.error('Error fetching admin user profile:', error);
                    }
                }
            } else {
                setIsAuthenticated(false);
                setProfilePicture('');
            }
        };
        
        fetchUserData();
    }, []);

    // Handle logout and redirect to login page
    const handleLogoutAndRedirect = () => {
        // Clear the local storage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        localStorage.removeItem('picture');

        // Call the handleLogout function passed from parent (if any)
        if (handleLogout) handleLogout();

        // Set isAuthenticated to false
        setIsAuthenticated(false);
        setProfilePicture('');

        // Redirect to login page
        navigate('/login'); // Use useNavigate to redirect to login page
    };

    // Open bookmark modal
    const openBookmarkModal = () => {
        setShowBookmarkModal(true);
        setExpanded(false);
    };

    return (
        <>
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
                                title="Resources" 
                                id="admin-nav-dropdown"
                                className="custom-dropdown"
                            >
                                 <NavDropdown.Item as={Link} to="/AllWorks" onClick={() => setExpanded(false)}>
                                    All works
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/Authors" onClick={() => setExpanded(false)}>
                                    Authors
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/Keywords" onClick={() => setExpanded(false)}>
                                    Keywords
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/Departments" onClick={() => setExpanded(false)}>
                                    Departments
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/resources" onClick={() => setExpanded(false)}>
                                    Resources
                                </NavDropdown.Item>
                            </NavDropdown>

                            <Nav.Link as={Link} to="/help" onClick={() => setExpanded(false)}>Help</Nav.Link>
                            
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
                                                console.log('Admin image failed to load, falling back to icon');
                                                e.target.style.display = 'none';
                                                // Force re-render with icon only
                                                setProfilePicture('');
                                            }}
                                        /> : 
                                        <i className="fas fa-user-circle" style={{ color: 'white', fontSize: '24px' }}></i>
                                    }
                                    id="admin-user-dropdown"
                                    className="custom-dropdown user-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/admin/profile" onClick={() => setExpanded(false)}>
                                        <i className="fas fa-id-card"></i> Profile
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/settings" onClick={() => setExpanded(false)}>
                                        <i className="fas fa-cog"></i> Settings
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/language" onClick={() => setExpanded(false)}>
                                        <i className="fas fa-globe"></i> Language
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/activity" onClick={() => setExpanded(false)}>
                                        <i className="fas fa-history"></i> Activity History
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/admin/notifications" onClick={() => setExpanded(false)}>
                                        <i className="fas fa-bell"></i> Notifications
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogoutAndRedirect}>
                                        <i className="fas fa-sign-out-alt"></i> Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <Nav.Link as={Link} to="/login" className="sign-in-btn">
                                    <i className="fas fa-sign-in-alt"></i> Sign in
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

export default AdminNavbar;
