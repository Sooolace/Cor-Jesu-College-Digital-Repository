import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Alert, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import './styles/keywords.css';

function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
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
      const response = await fetch('/api/keywords');
      const data = await response.json();
      setKeywords(data);
      setFilteredKeywords(data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      setError('Failed to load keywords. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...keywords];

    if (filterName) {
      filtered = filtered.filter((keyword) =>
        keyword.keyword.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (selectedLetter) {
      filtered = filtered.filter((keyword) =>
        keyword.keyword.toLowerCase().startsWith(selectedLetter.toLowerCase())
      );
    }

    setFilteredKeywords(filtered);
    setCurrentPage(1);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter === selectedLetter ? '' : letter);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterName('');
    setSelectedLetter('');
    setFilteredKeywords(keywords);
    setCurrentPage(1);
  };

  const handleViewClick = (keywordName) => {
    navigate(`/KeywordOverview/${encodeURIComponent(keywordName)}`);
  };

  const totalPages = Math.ceil(filteredKeywords.length / itemsPerPage);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="keywords-page">
      <div className="breadcrumb-container">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Keywords', link: '#' }]} />
      </div>

      <Container className="keyword-overview-container">
        <div className="text-center mb-4">
        <div className="text-center mb-4">
          <h3 className="display-8">Keywords Directory</h3>
        </div>
        <div className="author-underline"></div>
          <p className="text-muted">Browse through our collection of research keywords</p>
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

        <div className="search-container">
          <div className="search-box">
            <Form.Control
              type="text"
              placeholder="Search Keywords"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
              className="search-input"
            />
            <Button className="search-button" onClick={handleFilter}>
              Search
            </Button>
            {(filterName || selectedLetter) && (
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
        ) : filteredKeywords.length > 0 ? (
          <Row className="keywords-grid">
            {filteredKeywords
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((keyword) => (
                <Col key={keyword.keyword_id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <Card 
                    className="keyword-card"
                    onClick={() => handleViewClick(keyword.keyword)}
                  >
                    <div className="keyword-text">{keyword.keyword}</div>
                    <div className="keyword-count">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="currentColor" 
                        className="bi bi-eye" 
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                      </svg>
                      <span>{keyword.count} {keyword.count === 1 ? 'Project' : 'Projects'}</span>
                    </div>
                  </Card>
                </Col>
              ))}
          </Row>
        ) : (
          <div className="no-results">
            <p>No keywords found matching your criteria</p>
            <Button variant="link" onClick={clearFilters}>Clear all filters</Button>
          </div>
        )}

        {filteredKeywords.length > itemsPerPage && (
          <div className="pagination-wrapper">
            <PaginationComponent 
              currentPage={currentPage} 
              totalPages={totalPages} 
              handlePageChange={(newPage) => setCurrentPage(newPage)} 
            />
          </div>
        )}
      </Container>
    </div>
  );
}

export default Keywords;