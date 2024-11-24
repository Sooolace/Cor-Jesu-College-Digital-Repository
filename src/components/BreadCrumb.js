import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/breadcrumb.css';

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="breadcrumb-page">
      <div className="centered-content">
        {/* Breadcrumb Wrapper */}
        <div className="breadcrumb-wrapper">
          {/* Back Button Container */}
          <div className="back-button-container">
            <button 
              className="back-button" 
              onClick={() => navigate(-1)} // Go back to the previous page
            >
              ← Back {/* Arrow followed by the word "Back" */}
            </button>
          </div>
          
          {/* Breadcrumb Navigation Container */}
          <div className="breadcrumb-nav-container">
            <nav className="breadcrumb-container">
              <ul className="breadcrumb">
                {items.map((item, index) => {
                  const isCurrentPage = index === items.length - 1; // Check if it's the last item
                  return (
                    <li key={index} className={isCurrentPage ? 'breadcrumb-current' : ''}>
                      {isCurrentPage ? (
                        <span>{item.label}</span> // Non-clickable and styled as gray
                      ) : (
                        <Link to={item.link}>{item.label}</Link> // Clickable
                      )}
                      {index < items.length - 1 && <span> &gt; </span>}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
