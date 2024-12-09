import React from 'react';
import './styles/PaginationComponent.css';

const PaginationComponent = ({ currentPage, totalPages, handlePageChange }) => {

  const renderPageItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
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
    return items;
  };

  return (
    <div className="pagination-container">
      <nav aria-label="Page navigation example">
        <ul className="pagination">
          {/* Previous Button */}
          <li
            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          >
            <span className="page-link" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </span>
          </li>

          {renderPageItems()}

          {/* Next Button */}
          <li
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          >
            <span className="page-link" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PaginationComponent;
