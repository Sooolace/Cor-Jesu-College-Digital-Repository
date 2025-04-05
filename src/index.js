import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './styles/custom.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="15930922340-0rjl4r2b1iib6pdbqmqoribadkoni71a.apps.googleusercontent.com">
      <App /> {/* Render the App component which now handles both user and admin */}
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
