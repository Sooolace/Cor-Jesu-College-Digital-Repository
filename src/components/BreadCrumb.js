// Breadcrumb.js
import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.link ? (
              <Link to={item.link}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
