import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Alert, Button, Dropdown, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import './styles/authors.css';

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filterName, setFilterName] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authors/logauthor');
      const data = await response.json();
      setAuthors(data);
      setFilteredAuthors(data);

      // Get unique departments
      const uniqueDepartments = [...new Set(data.map((author) => author.category_name).filter(Boolean))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Failed to load authors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...authors];

    if (filterName) {
      filtered = filtered.filter((author) =>
        author.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter((author) => author.category_name === filterDepartment);
    }

    if (selectedLetter) {
      filtered = filtered.filter((author) =>
        author.name.toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
    }

    setFilteredAuthors(filtered);
    setCurrentPage(1);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter === selectedLetter ? '' : letter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterDepartment('');
    setSelectedLetter('');
    setFilteredAuthors(authors);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Authors', link: '#' }]} />
      </div>

      <Container className="author-overview-container">
        <div className="text-center mb-4">
        <div className="text-center mb-4">
          <h3 className="display-8">Authors Directory</h3>
        </div>
        <div className="author-underline"></div>
          <p className="text-muted">Browse through our collection of authors and their works</p>
        </div>

        <div className="alphabet-filter">
          {alphabet.map((letter) => (
            <button
              key={letter}
              className={`alphabet-button ${selectedLetter === letter ? 'active' : ''}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="search-filter-container">
          <div className="department-filter">
            <Dropdown>
              <Dropdown.Toggle id="dropdown-custom-components" className="department-dropdown">
                {filterDepartment || 'Filter by Department'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="department-menu">
                <Dropdown.Item onClick={() => setFilterDepartment('')}>All Departments</Dropdown.Item>
                {departments.map((department) => (
                  <Dropdown.Item key={department} onClick={() => setFilterDepartment(department)}>
                    {department}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="search-box">
            <Form.Control
              type="text"
              placeholder="Search by Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="search-input"
            />
            <Button className="search-button" onClick={handleFilter}>
              Search
            </Button>
            {(filterName || filterDepartment || selectedLetter) && (
              <Button className="clear-filter-button" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center mt-5">
            <div className="loading-spinner"></div>
          </div>
        ) : filteredAuthors.length > 0 ? (
          <Row className="authors-grid">
            {filteredAuthors
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((author) => (
                <Col key={author.author_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card 
                    className="author-card"
                    onClick={() => navigate(`/AuthorOverview/${encodeURIComponent(author.name)}`)}
                  >
                    <Card.Body>
                      <div className="author-initial">{author.name.charAt(0)}</div>
                      <Card.Title className="author-name">{author.name}</Card.Title>
                      <Card.Text className="author-department">
                        {author.category_name || 'No Department'}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        ) : (
          <div className="no-results">
            <p>No authors found matching your criteria</p>
            <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}

        {filteredAuthors.length > itemsPerPage && (
          <div className="pagination-wrapper">
            <PaginationComponent 
              currentPage={currentPage} 
              totalPages={totalPages} 
              handlePageChange={(newPage) => setCurrentPage(newPage)} 
            />
          </div>
        )}
      </Container>
    </>
  );
}

export default Authors;