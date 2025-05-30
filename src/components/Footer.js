import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/CJCREPOLOGO.png';
import './styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    setIsLoggedIn(!!token);
    setIsAdmin(userRole === 'admin');
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        setName('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  // Determine where the "Sign In" link should point
  const getAuthLink = () => {
    if (isLoggedIn) {
      if (isAdmin) {
        return { to: "/admindashboard", text: "Dashboard" };
      } else {
        return { to: "/", text: "My Account" };
      }
    } else {
      return { to: "/login", text: "Sign In" };
    }
  };

  const authLink = getAuthLink();

  return (
    <footer className="footer-container">
      <Container>
        <Row className="py-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <div className="footer-logo-container">
              <img src={logo} alt="CJC Repository Logo" className="footer-logo" />
            </div>
            <p className="footer-description">
              The official research repository of Cor Jesu College providing access to
              graduate theses and student dissertations.
            </p>
            
            {/* Newsletter Subscription Form */}
            <div className="newsletter-section">
              <h5 className="newsletter-title">Stay Updated</h5>
              {isSubscribed ? (
                <div className="subscription-success">
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="subscription-form">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="subscribe-button">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </Col>
          
          <Col lg={2} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Quick Links</h5>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/help">Help</Link></li>
              <li><Link to={authLink.to}>{authLink.text}</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="footer-heading">Resources</h5>
            <ul className="footer-links-list">
              <li><Link to="/AllWorks">Theses & Dissertations</Link></li>
              <li><Link to="/Authors">Authors</Link></li>
              <li><Link to="/Keywords">Keywords</Link></li>
              <li><Link to="/Departments">Departments</Link></li>
              <li><Link to="/resources">Resources</Link></li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h5 className="footer-heading">Contact Us</h5>
            <ul className="footer-contact-list">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Sacred Heart Avenue, Digos City, Province of Davao del Sur</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>repository@g.cjc.edu.ph</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>+63 (88) 123-4567</span>
              </li>
            </ul>
            <div className="footer-social-icons">
              <a href="https://web.facebook.com/corjesucollege" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.cjc.edu.ph/" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-globe"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="footer-divider" />
        
        <Row className="footer-bottom">
          <Col md={6} className="text-center text-md-start">
            <p className="footer-copyright">
              &copy; {currentYear} Cor Jesu College. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <ul className="footer-policy-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use">Terms of Use</Link></li>
              <li><Link to="/accessibility">Accessibility</Link></li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer; 