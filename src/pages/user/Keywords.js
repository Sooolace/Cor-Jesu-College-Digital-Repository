import React, { useEffect, useState } from 'react';
import { Table, Pagination, Spinner, Form, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/keywords'); // Adjust API endpoint if necessary
      const data = await response.json();
      setKeywords(data);
      setFilteredKeywords(data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      setError('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = filterName
      ? keywords.filter((keyword) =>
          keyword.keyword.toLowerCase().includes(filterName.toLowerCase())
        )
      : keywords;
    setFilteredKeywords(filtered);
    setCurrentPage(1);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    const filteredByLetter = keywords.filter((keyword) =>
      keyword.keyword.toLowerCase().startsWith(letter.toLowerCase())
    );
    setFilteredKeywords(filteredByLetter);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  const handleViewClick = (keywordName) => {
    // Use encodeURIComponent to handle special characters in keyword names
    navigate(`/KeywordOverview/${encodeURIComponent(keywordName)}`);
  };

  const totalPages = Math.ceil(filteredKeywords.length / itemsPerPage);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Keywords', link: '#' }]} />
      </div>

      <div className="keyword-overview-container container mt-4">
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="display-8">Keywords</h3>
        </div>
        <div className="author-underline"></div>

{/* A-Z Filter */}
<div className="text-center mb-3">
  <div>
    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map((letter) => (
      <span
        key={letter}
        onClick={() => handleLetterClick(letter)}
        style={{
          margin: '10px',
          fontWeight: selectedLetter === letter ? 'bold' : 'normal',
          color: '#a33307',  // Color for the letters
          cursor: 'pointer', // Make it clickable
          textDecoration: selectedLetter === letter ? 'underline' : 'none', // Underline selected letter
        }}
      >
        {letter}
      </span>
    ))}
  </div>
</div>


        {/* Search Bar */}
        <div
          className="d-flex justify-content-center mb-3"
          style={{ width: '50%', margin: '0 auto' }}
        >
          <div className="d-flex align-items-center" style={{ width: '60%' }}>
            <Form.Control
              type="text"
              style={{ width: 'calc(100% - 120px)' }}
              className="me-2"
              placeholder="Search by Keyword"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyPress={handleKeyPress} // Trigger search on Enter key press
            />
            <Button
              className="btn-primary"
              onClick={handleFilter}
              style={{ backgroundColor: '#a33307', borderColor: '#a33307' }} // Change button color
            >
              Filter
            </Button>
          </div>
        </div>

        {/* Loading and Error Messages */}
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Display Keywords */}
        {!loading && filteredKeywords.length > 0 && (
          <Table
            striped
            hover
            style={{
              width: '60%',
              margin: '0 auto',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Keyword</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((keyword) => (
                  <tr key={keyword.keyword_id}>
                    <td>
                      <a
                        href="#"
                        onClick={() => handleViewClick(keyword.keyword)}
                        style={{ color: '#007bff', textDecoration: 'underline' }}
                      >
                        {keyword.keyword} [{keyword.count}]
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={newPage => setCurrentPage(newPage)}
        />
      </div>
    </>
  );
}

export default Keywords;
