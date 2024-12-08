import React, { useEffect, useState } from 'react';
import { Table, Pagination, Spinner, Form, Alert, Button, Dropdown } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';
import '../user/styles/authors.css';

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
      setFilteredAuthors(data);

      const uniqueDepartments = [
        ...new Set(data.map((author) => author.category_name).filter(Boolean)),
      ];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = authors;

    if (filterName) {
      filtered = filtered.filter((author) =>
        author.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(
        (author) => author.category_name === filterDepartment
      );
    }

    setFilteredAuthors(filtered);
    setCurrentPage(1);
  };

  const handleViewClick = (authorName) => {
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

        {/* Search and Filter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ width: '75%', margin: '0 auto', gap: '10px' }}>
          
          {/* Fixed-width Department Dropdown */}
          <div style={{ width: '200px' }}>
            <Dropdown>
              <Dropdown.Toggle
                id="dropdown-custom-components"
                style={{
                  backgroundColor: '#a33307',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {filterDepartment || 'Filter by Department'}
              </Dropdown.Toggle>

              <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Dropdown.Item onClick={() => setFilterDepartment('')}>
                  All Departments
                </Dropdown.Item>
                {departments.map((department) => (
                  <Dropdown.Item
                    key={department}
                    onClick={() => setFilterDepartment(department)}
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {department}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Search Input aligned to the right */}
          <Form.Control
            type="text"
            placeholder="Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{ width: '500px', marginLeft: 'auto', borderColor: '#a33307' }}
          />

          {/* Search Button */}
          <Button
            className="btn"
            style={{
              backgroundColor: '#a33307',
              borderColor: '#a33307',
              color: 'white',
              borderRadius: '5px',
            }}
            onClick={handleFilter}
          >
            Search
          </Button>
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
                    <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {author.category_name || 'No Department'}
                    </td>
                    <td>
                      <CiViewList
                        size={30}
                        title="View"
                        style={{
                          cursor: 'pointer',
                          color: 'white',
                          backgroundColor: '#007BFF',
                          borderRadius: '5px',
                          padding: '2px',
                        }}
                        onClick={() => handleViewClick(author.name)}
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
