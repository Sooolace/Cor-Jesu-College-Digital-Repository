import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Spinner, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { MdDelete } from 'react-icons/md';
import { FaUserEdit } from "react-icons/fa";
import { IoPersonAddOutline } from 'react-icons/io5'; 
import { useNavigate } from 'react-router-dom';
import AddNewKeyword from './components/AddNewKeyword';
import EditKeyword from './EditKeyword';
import { FaArrowLeft } from 'react-icons/fa';
import '../admin/styles/TotalAuthors.css';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function TotalKeywords() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editingKeywordId, setEditingKeywordId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [keywordToDelete, setKeywordToDelete] = useState(null);

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
      setError('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };
  

  const handleFilter = () => {
    let filtered = keywords;

    if (filterName) {
      filtered = filtered.filter((keyword) =>
        keyword.keyword.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    setFilteredKeywords(filtered);
    setCurrentPage(1);
  };

  const openEditModal = (keywordId) => {
    setEditingKeywordId(keywordId);
    setShowEditModal(true);
  };

  const refreshKeywords = () => {
    fetchKeywords(); 
  };

  const openDeleteModal = (keywordId) => {
    setKeywordToDelete(keywordId);
    setShowDeleteModal(true);
  };

  const deleteKeyword = async () => {
    if (!keywordToDelete) return;
    try {
      await fetch(`/api/keywords/${keywordToDelete}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      fetchKeywords(); 
    } catch (error) {
      console.error('Error deleting keyword:', error);
      setError('Failed to delete keyword');
    }
  };

  
  const totalPages = Math.ceil(filteredKeywords.length / itemsPerPage); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>      
    <div className="breadcrumb-container">
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admindashboard' },
          { label: 'Keywords', link: '#' },
        ]}
      />
    </div>
    <div className="total-keywords-container container mt-4">
        <h3 className="display-8">Keywords Overview</h3>
        <div className="author-underline"></div>

      {/* Search Bar, Filter, and Add Keyword Button */}
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ width: '50%', margin: '0 auto' }}>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            style={{ width: '400px' }}
            className="me-2"
            placeholder="Search by Keyword"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
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
        <Button variant="success" onClick={() => setShowModal(true)}>
          <IoPersonAddOutline size={20} style={{ marginRight: '10px' }} /> Add Keyword
        </Button>
      </div>

      {loading && <Spinner animation="border" role="status" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {filteredKeywords.length > 0 && (
        <>
          <Table striped bordered hover style={{ width: '50%', margin: '0 auto' }}>
            <thead>
              <tr>
                <th style={{ width: '70%' }}>Keyword</th>
                <th style={{ width: '20%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((keyword) => (
                  <tr key={keyword.keyword_id}>
                    <td>{keyword.keyword}</td>
                    <td>
                      {/* View Icon with Blue Background */}
                      <CiViewList
                        size={30}
                        title="View"
                        style={{
                          cursor: 'pointer',
                          color: 'white',
                          backgroundColor: '#007bff',
                          borderRadius: '5px',
                          padding: '2px',
                          marginRight: '10px'
                        }}
                        onClick={() => navigate(`/KeywordOverview/${keyword.keyword_id}`)}
                      />

                      {/* Edit Icon with Green Background */}
                      <FaUserEdit
                        size={30}
                        title="Edit"
                        style={{
                          cursor: 'pointer',
                          color: 'white',
                          backgroundColor: '#28a745',
                          borderRadius: '5px',
                          padding: '4px',
                          marginRight: '10px'
                        }}
                        onClick={() => openEditModal(keyword.keyword_id)}
                      />

                      {/* Delete Icon with Red Background */}
                      <MdDelete
                        size={30}
                        title="Delete"
                        style={{
                          cursor: 'pointer',
                          color: 'white',
                          backgroundColor: '#dc3545',
                          borderRadius: '5px',
                          padding: '3px'
                        }}
                        onClick={() => openDeleteModal(keyword.keyword_id)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          {/* Edit Keyword Modal */}
          <EditKeyword
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            keywordId={editingKeywordId}
            onSuccess={refreshKeywords}
          />

          {/* Add New Keyword Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add New Keyword</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AddNewKeyword onHide={() => setShowModal(false)} />
            </Modal.Body>
          </Modal>

          {/* Delete Keyword Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this keyword?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={deleteKeyword}>Delete</Button>
            </Modal.Footer>
          </Modal>

          <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={newPage => setCurrentPage(newPage)}
              />
        </>
      )}
    </div>
    </>
  );
}

export default TotalKeywords;
