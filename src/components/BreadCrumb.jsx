import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaAngleRight } from 'react-icons/fa';
import './styles/breadcrumb.css';

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  // Handle back navigation while preserving login state
  const handleBackNavigation = (e) => {
    e.preventDefault();
    // Navigate back but with state preservation
    navigate(-1, { state: { preserveLogin: true } });
  };

  return (
    <div className="breadcrumb-wrapper">
      <div className="breadcrumb-content">
        {/* Home link on left */}
        <div className="breadcrumb-home">
          <Link 
            to="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/', { state: { preserveLogin: true } });
            }}
            className="home-link"
          >
            <FaHome /> Home
          </Link>
          <button 
            className="back-button" 
            onClick={handleBackNavigation}
          >
            ← Back
          </button>
        </div>
          
        {/* Navigation items on right */}
        <div className="breadcrumb-nav">
          <ul className="breadcrumb-list">
            {items.map((item, index) => {
              const isCurrentPage = index === items.length - 1; // Check if it's the last item
              return (
                <li key={index} className={`breadcrumb-item ${isCurrentPage ? 'breadcrumb-current' : ''}`}>
                  {index > 0 && <FaAngleRight className="breadcrumb-separator" />}
                  {isCurrentPage ? (
                    <span className="current-page">{item.label}</span>
                  ) : (
                    <Link 
                      to={item.link}
                      className="breadcrumb-link"
                      onClick={(e) => {
                        if (item.link !== '#') {
                          e.preventDefault();
                          navigate(item.link, { state: { preserveLogin: true } });
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
