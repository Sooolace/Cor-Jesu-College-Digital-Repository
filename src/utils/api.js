import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Add more detailed token debugging
    console.log('Auth Token Debug:', {
      exists: !!token,
      token: token ? `${token.substring(0, 15)}...` : 'No token found',
      tokenLength: token ? token.length : 0,
      isAdmin: localStorage.getItem('isAdmin'),
      role: localStorage.getItem('role'),
      username: localStorage.getItem('username')
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No auth token found in localStorage - this will cause 401 errors for protected routes');
    }
    
    console.log('API Request Config:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error (401):', error.response.data);
      // Could redirect to login page here if needed
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User management API calls
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export default api; 