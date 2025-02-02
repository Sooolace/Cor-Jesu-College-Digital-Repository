import React, { useEffect, useState } from 'react';
import { Table, Pagination, Spinner, Form, Alert, Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

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
      setError('Failed to load authors');
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

    setFilteredAuthors(filtered);
    setCurrentPage(1);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    const filteredByLetter = authors.filter((author) =>
      author.name.toLowerCase().startsWith(letter.toLowerCase())
    );
    setFilteredAuthors(filteredByLetter);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Authors', link: '#' }]} />
      </div>

      <div className="author-overview-container container mt-4">
        <div className="text-center mb-4">
          <h3 className="display-8">Authors</h3>
        </div>
        <div className="author-underline"></div>

        <div className="text-center mb-3">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
            <span
              key={letter}
              onClick={() => handleLetterClick(letter)}
              style={{
                margin: '10px',
                fontWeight: selectedLetter === letter ? 'bold' : 'normal',
                color: '#a33307',
                cursor: 'pointer',
                textDecoration: selectedLetter === letter ? 'underline' : 'none',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3" style={{ width: '75%', margin: '0 auto', gap: '10px' }}>
          <div style={{ width: '200px' }}>
            <Dropdown>
              <Dropdown.Toggle id="dropdown-custom-components" style={{ backgroundColor: '#a33307', color: 'white', border: 'none', borderRadius: '5px' }}>
                {filterDepartment || 'Filter by Department'}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <Dropdown.Item onClick={() => setFilterDepartment('')}>All Departments</Dropdown.Item>
                {departments.map((department) => (
                  <Dropdown.Item key={department} onClick={() => setFilterDepartment(department)}>
                    {department}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Form.Control
            type="text"
            placeholder="Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{ width: '500px', marginLeft: 'auto', borderColor: '#a33307' }}
          />

          <Button className="btn" style={{ backgroundColor: '#a33307', borderColor: '#a33307', color: 'white', borderRadius: '5px' }} onClick={handleFilter}>
            Search
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {filteredAuthors.length > 0 && (
          <Table striped hover style={{ width: '75%', margin: '0 auto', borderLeft: 'none', borderRight: 'none', borderTop: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuthors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((author) => (
                <tr key={author.author_id}>
                  <td>
                    <a href="#" onClick={() => navigate(`/AuthorOverview/${encodeURIComponent(author.name)}`)} style={{ color: '#007bff', textDecoration: 'underline' }}>
                      {author.name}
                    </a>
                  </td>
                  <td>{author.category_name || 'No Department'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <PaginationComponent currentPage={currentPage} totalPages={totalPages} handlePageChange={(newPage) => setCurrentPage(newPage)} />
      </div>
    </>
  );
}

export default Authors;
