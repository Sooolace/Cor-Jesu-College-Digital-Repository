import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './styles/uniqueAuthorFilter.css';

const UniqueAuthorFilter = ({ selectedAuthors = [], setSelectedAuthors, onApply }) => {
  const [authors, setAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch all authors
  useEffect(() => {
    axios
      .get('/api/authors')
      .then((response) => {
        const sortedAuthors = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setAuthors(sortedAuthors);
        setSearchResults(sortedAuthors); // Show all authors initially
      })
      .catch((error) => {
        console.error('Error fetching authors:', error);
        // Consider adding user feedback here, like a message or alert
      });
  }, []);

  // Toggle author selection
  const toggleAuthorSelection = (authorId) => {
    setSelectedAuthors((prevSelected) =>
      prevSelected.includes(authorId)
        ? prevSelected.filter((id) => id !== authorId) // Remove if already selected
        : [...prevSelected, authorId] // Add if not selected
    );
  };

  // Handle "See All" click
  const handleSeeAll = () => {
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Trigger apply filters
  const handleApplyFilters = () => {
    if (onApply) {
      // Pass the selectedAuthors back to parent component
      onApply(selectedAuthors);
    }
    setShowModal(false); // Close the modal
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const results = authors.filter((author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="author-filter-wrapper" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* Title outside */}
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '8px',
        color: '#333',
        padding: '0 5px',
        fontSize: '18px',
        fontWeight: '500',
        textTransform: 'none',
        letterSpacing: '0.5px'
      }}>Filter by Author</h3>
      
      {/* Main filter content */}
      <div className="filter-container" style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '8px'
      }}>
        <div className="dropdown-content" style={{ padding: 0 }}>
          {authors.slice(0, 5).map((author) => (
            <div key={author.author_id} className="unique-author-item filter-item" style={{
              marginBottom: '6px',
              paddingBottom: '6px',
              borderBottom: '1px solid #eee'
            }}>
              <div className="category-checkbox" style={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  fontWeight: selectedAuthors.includes(author.author_id) ? '500' : 'normal',
                  fontSize: '15px',
                  color: '#444',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  width: '100%'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedAuthors.includes(author.author_id)}
                    onChange={() => toggleAuthorSelection(author.author_id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ flex: 1 }}>
                    {author.name}
                    {author.category_name && (
                      <span className="unique-author-category" style={{ 
                        fontSize: '13px', 
                        color: '#666',
                        marginLeft: '4px'
                      }}> ({author.category_name})</span>
                    )}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {authors.length > 5 && (
          <button 
            className="see-all-button" 
            onClick={handleSeeAll}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#555',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              marginTop: '2px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            View More
          </button>
        )}
      </div>
      
      {/* Apply button outside */}
      <button 
        className="apply-button" 
        onClick={handleApplyFilters}
        style={{
          backgroundColor: '#a33307',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontWeight: '500',
          width: 'fit-content',
          minWidth: '60px',
          alignSelf: 'center',
          fontSize: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#c03f08';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#a33307';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        Apply
      </button>

      {/* Modal for all authors */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 500 }}>All Authors</h4>
              <button className="close-button" onClick={handleCloseModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#888'
              }}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{
              padding: '12px',
              overflowY: 'auto',
              flexGrow: 1
            }}>
              <form onSubmit={handleSearchSubmit} className="unique-search-form" style={{
                display: 'flex',
                marginBottom: '12px',
                marginTop: '0',
                position: 'relative'
              }}>
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="unique-search-input"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    paddingRight: '35px'
                  }}
                />
                <button type="submit" className="unique-search-button" style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  padding: '8px 10px',
                  backgroundColor: 'transparent',
                  color: '#777',
                  border: 'none',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </form>
              <div className="filter-list-scrollable" style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #eee',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {searchResults.map((author) => (
                  <div key={author.author_id} className="unique-author-item filter-item" style={{
                    marginBottom: '6px',
                    paddingBottom: '6px',
                    borderBottom: '1px solid #eee',
                    textAlign: 'left'
                  }}>
                    <div className="category-checkbox" style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      width: '100%'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        fontWeight: selectedAuthors.includes(author.author_id) ? '500' : 'normal',
                        fontSize: '15px',
                        color: '#444',
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedAuthors.includes(author.author_id)}
                          onChange={() => toggleAuthorSelection(author.author_id)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ flex: 1 }}>
                          {author.name}
                          {author.category_name && (
                            <span className="unique-author-category" style={{ 
                              fontSize: '13px', 
                              color: '#666',
                              marginLeft: '4px'
                            }}> ({author.category_name})</span>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '8px 12px',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button 
                className="apply-button" 
                onClick={handleApplyFilters}
                style={{
                  backgroundColor: '#a33307',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  width: 'fit-content',
                  minWidth: '60px'
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniqueAuthorFilter;
