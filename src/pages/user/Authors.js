import React, { useEffect, useState } from 'react';
import { Table, Pagination, Spinner, Form, Alert, Button } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authors'); // Adjust API endpoint if necessary
      const data = await response.json();
      setAuthors(data);
      setFilteredAuthors(data);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = filterName
      ? authors.filter((author) =>
          author.name.toLowerCase().includes(filterName.toLowerCase())
        )
      : authors;
    setFilteredAuthors(filtered);
    setCurrentPage(1);
  };

  // Updated handleViewClick function to navigate with the author's name
  const handleViewClick = (authorName) => {
    // Encode the name to handle spaces and special characters
    const encodedName = encodeURIComponent(authorName);
    navigate(`/AuthorOverview/${encodedName}`);
  };

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Authors', link: '#' }]} />
      </div>
      <div className="author-overview-container container mt-4">
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="display-8">Authors</h3>
        </div>
        <div className="author-underline"></div>

        {/* Search Bar */}
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ width: '75%', margin: '0 auto' }}
        >
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              style={{ width: '400px' }}
              className="me-2"
              placeholder="Search by Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <Button classname="btn-primary" onClick={handleFilter}>
              Filter
            </Button>
          </div>
        </div>

        {/* Loading and Error Messages */}
        {loading && <Spinner animation="border" role="status" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Authors Table */}
        {filteredAuthors.length > 0 && (
          <Table striped bordered hover style={{ width: '75%', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Name</th>
                <th style={{ width: '50%' }}>Department</th>
                <th style={{ width: '3%' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuthors
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((author) => (
                  <tr key={author.author_id}>
                    <td>{author.name}</td>
                    <td>{author.category_name || 'No Department'}</td>
                    <td>
                      {/* View Button */}
                      <CiViewList
                        size={30}
                        title="View"
                        style={{
                          cursor: 'pointer',
                          color: 'white',
                          backgroundColor: '#007bff',
                          borderRadius: '5px',
                          padding: '2px',
                        }}
                        onClick={() => handleViewClick(author.name)} // Use name here
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}

        {/* Pagination */}
        <Pagination style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Pagination.Prev
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </>
  );
}

export default Authors;
