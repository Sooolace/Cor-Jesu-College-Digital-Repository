import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/cjclogo.PNG';
import backgroundImage from '../../assets/loginbg.png'; // Ensure this path is correct
import '../admin/styles/login.css'; // Ensure this path is correct

function Login({ setIsAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const role = 'admin';  // or get the role from the server response
    const token = 'your-jwt-token';  // the token from your API response

    try {
      // Make API request to backend for authentication
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Send username and password
      });

      const data = await response.json();

      if (response.ok) {
        // If login is successful, store token and user data in localStorage
        const { token } = data; // Assume token is sent in the response

        localStorage.setItem('role', role);
        localStorage.setItem('username', username); // Store the username in localStorage
        localStorage.setItem('token', token);


        if (role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.setItem('isAdmin', 'false');
        }
      
        // Navigate to admin dashboard or home
        setIsAdmin(true); // set isAdmin state
        navigate('/admindashboard'); // Navigate to admin dashboard (or other page based on role)
      } else {
        // Show error message if login fails
        setErrorMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <section
      className="vh-100 d-flex align-items-center justify-content-center bg-cover"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-4">
                {/* Go Back to Home Button */}
                <div className="text-center mb-3">
                  <button
                    className="btn btn-link text-decoration-none fw-bold text-primary"
                    onClick={goToHome}
                  >
                    ← Go Back to Home
                  </button>
                </div>

                {/* Logo */}
                <div className="text-center mb-4">
                  <img
                    src={logo}
                    alt="Logo"
                    className="img-fluid mb-3"
                    style={{ maxWidth: '180px' }}
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
                <div className="text-center mt-4">
                  <p className="small text-muted mb-0">Or sign in with</p>
                  <div className="d-flex justify-content-center mt-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-circle mx-1 g-custom-btn"
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className="fab fa-google"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Login);
