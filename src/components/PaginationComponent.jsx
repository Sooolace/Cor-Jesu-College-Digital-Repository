import React from 'react';
import './styles/PaginationComponent.css';

const PaginationComponent = ({ currentPage, totalPages, handlePageChange }) => {
  
  // Function to generate page items with ellipses
  const renderPageItems = () => {
    const items = [];
    const maxPages = 5;  // Max pages to show before ellipsis
    let startPage, endPage;

    // If totalPages is smaller or equal to maxPages, show all pages
    if (totalPages <= maxPages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      // If we're near the beginning, show the first few pages
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPages;
      } 
      // If we're near the end, show the last few pages
      else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } 
      // Otherwise, show a range around the current page
      else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    // Add "First" and "Previous" buttons
    if (currentPage > 1) {
      items.push(
        <li key="first" className="page-item" onClick={() => handlePageChange(1)}>
          <span className="page-link">First</span>
        </li>
      );
      items.push(
        <li key="prev" className="page-item" onClick={() => handlePageChange(currentPage - 1)}>
          <span className="page-link">&laquo;</span>
        </li>
      );
    }

    // Loop through and add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          <span className="page-link">{i}</span>
        </li>
      );
    }

    // Add ellipsis if there are more pages after the range
    if (endPage < totalPages - 1) {
      items.push(
        <li key="ellipsis" className="page-item">
          <span className="page-link">...</span>
        </li>
      );
    }

    // Always show the last page as a link
    if (endPage < totalPages) {
      items.push(
        <li key="last" className="page-item" onClick={() => handlePageChange(totalPages)}>
          <span className="page-link">{totalPages}</span>
        </li>
      );
    }

    // Add "Next" and "Last" buttons
    if (currentPage < totalPages) {
      items.push(
        <li key="next" className="page-item" onClick={() => handlePageChange(currentPage + 1)}>
          <span className="page-link">&raquo;</span>
        </li>
      );
      items.push(
        <li key="last-button" className="page-item" onClick={() => handlePageChange(totalPages)}>
          <span className="page-link">Last</span>
        </li>
      );
    }

    return items;
  };

  return (
    <div className="pagination-container">
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          {renderPageItems()}
        </ul>
      </nav>
    </div>
  );
};

export default PaginationComponent;
