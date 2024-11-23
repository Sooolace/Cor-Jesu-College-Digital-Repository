import React from 'react';
import { Link } from 'react-router-dom';
import './styles/breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <div className="centered-content"> {/* Centered content container */}
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
  );
};

export default Breadcrumb;
