import React, { useEffect, useState } from 'react';
import { Table, Pagination, Spinner, Form, Alert, Button } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/BreadCrumb';

function Keywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);

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

        {/* Search Bar */}
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ width: '50%', margin: '0 auto' }}
        >
          <div className="d-flex align-items-center">
            <Form.Control
              type="text"
              style={{ width: '400px' }}
              className="me-2"
              placeholder="Search by Keyword"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <Button className="btn-primary" onClick={handleFilter}>
              Filter
            </Button>
          </div>
        </div>

        {/* Loading and Error Messages */}  
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Keywords Table */}
        {filteredKeywords.length > 0 && (
          <Table striped bordered hover style={{ width: '50%', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Keyword</th>
                <th style={{ width: '1%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((keyword) => (
                  <tr key={keyword.keyword_id}>
                    <td>{keyword.keyword}</td>
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
                        onClick={() => handleViewClick(keyword.keyword)} 
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

export default Keywords;
