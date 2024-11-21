import React from 'react';
import { Link } from 'react-router-dom';
import breadcrumb from './styles/breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb-container">
      <ul className="breadcrumb">
        {items.map((item, index) => (
          <li key={index}>
            {item.link ? (
              <Link to={item.link}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
            {index < items.length - 1 && <span> &gt; </span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
