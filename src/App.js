import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './MainLayout';
function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="App">
      <Router>
        <MainLayout isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      </Router>
    </div>
  );
}

export default App;
