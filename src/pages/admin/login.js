import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cjclogo.PNG';
import backgroundImage from '../../assets/LOGINBG.jpg'; // Ensure this path is correct
import '../admin/styles/login.css'; // Ensure this path is correct
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';


function Login({ setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to homepage
  const from = location.state?.from || '/';
  
  // Check if we're coming from a page where login was initiated
  const preserveLogin = location.state?.preserveLogin || false;
  const returnToDocument = location.state?.returnToDocument || false;
  
  useEffect(() => {
    // Only clear auth if we're not preserving login state
    if (!preserveLogin) {
      console.log('Clearing previous auth data - not preserving login');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('picture');
      setIsAdmin(false);
    } else {
      console.log('Preserving login state - not clearing auth data');
    }
  }, [setIsAdmin, preserveLogin]);
  
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      // Redirect to dashboard if user is already logged in
      if (storedRole === 'admin') {
        setIsAdmin(true);
        navigate('/admindashboard');
      } else {
        // Redirect to the page they came from or homepage
        navigate(from);
      }
    }
  }, [navigate, setIsAdmin, from]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Make API request to backend for authentication
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password
      });

      const data = await response.json();

      if (response.ok) {
        // If login is successful, store token and user data in localStorage
        const { token, user } = data; // Get both token and user data

        console.log('Login successful:', user);

        // Store user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', user.username || username);
        localStorage.setItem('role', user.role || 'admin');
        localStorage.setItem('user_id', user.id.toString());

        if (user.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
          setIsAdmin(true); // set isAdmin state
          navigate('/admindashboard'); // Navigate to admin dashboard
        } else {
          localStorage.setItem('isAdmin', 'false');
          // Navigate back to the page they came from with state preservation
          navigate(from, { state: { preserveLogin: true } });
        }
      } else {
        // Show error message if login fails
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log('Google login credential received:', credentialResponse);
      
      if (!credentialResponse.credential) {
        console.error('No credential received from Google');
        setErrorMessage('Failed to receive credentials from Google');
        return;
      }
      
      // Send the ID token to your backend
      console.log('Sending token to backend...');
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        token: credentialResponse.credential
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Backend response:', response.data);
      const { token, user } = response.data;
      
      // Debug roles
      console.log('User object:', user);
      console.log('User role:', user.role);
      
      // Clear any previous auth data first
      localStorage.clear();

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('username', user.name);
      localStorage.setItem('email', user.email);
      localStorage.setItem('picture', user.picture);
      localStorage.setItem('role', user.role); // Use actual role from server
      localStorage.setItem('user_id', user.id.toString()); // Make sure to store user ID
      localStorage.setItem('isAdmin', user.role === 'admin' ? 'true' : 'false'); // Set isAdmin based on role
      
      console.log('Local storage set with user data:', {
        id: localStorage.getItem('user_id'),
        role: localStorage.getItem('role'),
        isAdmin: localStorage.getItem('isAdmin'),
        token: localStorage.getItem('token') ? 'Set' : 'Not set'
      });
      
      // Set isAdmin state based on the role
      const isUserAdmin = user.role === 'admin';
      setIsAdmin(isUserAdmin);
      console.log(`setIsAdmin(${isUserAdmin}) has been called`);
      
      // Navigate based on user role
      if (isUserAdmin) {
        console.log('Admin user, navigating to admin dashboard...');
        navigate('/admindashboard');
      } else {
        console.log('Regular user, navigating to original page or home...');
        // Navigate with state preservation
        navigate(from, { state: { preserveLogin: true } });
      }
    } catch (error) {
      console.error('Google login error:', error);
      let errorMessage = 'Google login failed. Please try again.';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || error.response.data.details || errorMessage;
      }
      
      setErrorMessage(errorMessage);
    }
  };

  const goToHome = () => {
    navigate('/', { state: { preserveLogin: true } });
  };
  
  return (
    <GoogleOAuthProvider clientId="15930922340-0rjl4r2b1iib6pdbqmqoribadkoni71a.apps.googleusercontent.com">
      <section className="vh-100 d-flex align-items-center justify-content-center bg-cover" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow border-0">
                <div className="card-body p-4">
                  {/* Go Back to Home Button */}
                  <div className="text-center mb-3">
                    <button
                      className="btn btn-link text-decoration-none fw-bold text-primary"
                      onClick={goToHome}
                    >
                      ← Return to Homepage
                    </button>
                  </div>

                  {/* Logo */}
                  <div className="logo-container">
                    <img
                      src={logo}
                      alt="Logo"
                      className="img-fluid"
                    />
                    <h4 className="mb-0 fw-bold">COR JESU COLLEGE: DIGITAL REPOSITORY</h4>
                    <p className="text-muted">Please sign in to continue</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {errorMessage && (
                      <div className="alert alert-danger text-center mb-3">
                        {errorMessage}
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <a href="#!" className="text-decoration-none">
                        Forgot password?
                      </a>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 s-custom-btn"
                    >
                      Sign In
                    </button>
                  </form>

                  {/* Google Sign-In Button */}
                  <div className="google-signin">
                    <p className="small text-muted mb-0">Or sign in with</p>
                    <div className="d-flex justify-content-center mt-2">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={(error) => {
                          console.error('Google Login Error:', error);
                          setErrorMessage('Google Login Failed: ' + (error?.error_description || ''));
                        }}
                        useOneTap={false}
                        type="standard"
                        width="280px"
                        logo_alignment="center"
                        text="signin_with"
                        context="signin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
}

export default React.memo(Login);
