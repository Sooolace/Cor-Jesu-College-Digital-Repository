import React, { useState } from 'react';
import axios from 'axios';
import logo from '../admin/src/cjclogo.PNG';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send login request to the backend with username and password
      const response = await axios.post('http://localhost:3000/api/auth/login', { username, password });

      // Store the JWT token in local storage
      localStorage.setItem('token', response.data.token);

      // Redirect user after successful login (e.g., to a dashboard)
      window.location.href = '/AdminDashboard'; // Ensure this path is correct
    } catch (error) {
      // Handle error response
      setErrorMessage(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <section className="vh-100 d-flex align-items-start justify-content-center mt-5">
      <div className="container h-100">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-8 col-xl-6">
            <div className="bg-white p-5 rounded shadow">
              <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                <img src={logo} className="img-fluid" alt="Sample logo" />
              </div>
              <form onSubmit={handleLogin}>
                <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                  <p className="lead fw-normal mb-0 me-3">Sign in with</p>
                  <button type="button" className="btn btn-primary btn-floating mx-1" style={{ backgroundColor: '#a33307' }}>
                    <i className="fab fa-google"></i>
                  </button>
                </div>

                <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                  <p className="text-center fw-bold mx-3 mb-0">Or</p>
                </div>

                <div className="form-outline mb-4">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-outline mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="alert alert-danger mb-4">
                    {errorMessage}
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check mb-0">
                    <input className="form-check-input me-2" type="checkbox" id="form2Example3" />
                    <label className="form-check-label" htmlFor="form2Example3">Remember me</label>
                  </div>
                  <a href="#!" className="text-body">Forgot password?</a>
                </div>

                <div className="text-center">
                  <button type="submit" className="btn btn-primary btn-lg" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', backgroundColor: '#a33307' }}>
                    Login
                  </button>
                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account? <a href="register.html" className="link-danger">Register</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
