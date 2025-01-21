import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './MainLayout';

function App() {
  const [isAdmin, setIsAdmin] = useState(
    JSON.parse(localStorage.getItem('isAdmin')) || false
  );

  useEffect(() => {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  return (
    <div className="App">
      <Router>
        <MainLayout isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      </Router>
    </div>
  );
}

export default App;
