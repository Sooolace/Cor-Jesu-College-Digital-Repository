import React from 'react';

const Statistics = () => {
  return (
    <div className="statistics">
      <h2>Repository Statistics</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <h4>Total Documents</h4>
          <p>2,340</p>
        </div>
        <div className="stat-item">
          <h4>Total Views</h4>
          <p>15,670</p>
        </div>
        <div className="stat-item">
          <h4>Total Downloads</h4>
          <p>9,870</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
