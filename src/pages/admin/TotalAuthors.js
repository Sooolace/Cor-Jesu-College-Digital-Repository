import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Spinner, Form, Modal, Alert } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { MdPageview, MdDelete } from 'react-icons/md';
import { FaUserEdit } from "react-icons/fa";
import { IoPersonAddOutline } from 'react-icons/io5'; // Only imported from io5 now
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import AddNewAuthor from './components/addNewAuthor';
import EditAuthor from './EditAuthor';
import { FaArrowLeft } from 'react-icons/fa';
import '../admin/styles/TotalAuthors.css';

function TotalAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [showModal, setShowModal] = useState(false); // Add New Author Modal
  const [showEditModal, setShowEditModal] = useState(false); // Edit Author Modal
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete Confirmation Modal
  const [authorToDelete, setAuthorToDelete] = useState(null); // Author ID to delete

  const navigate = useNavigate();  // Hook for navigation

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
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = filterName
      ? authors.filter(author => author.name.toLowerCase().includes(filterName.toLowerCase()))
      : authors;
    setFilteredAuthors(filtered);
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const openEditModal = (authorId) => {
    setEditingAuthorId(authorId);
    setShowEditModal(true);
  };

  const refreshAuthors = () => {
    fetchAuthors(); // Refresh author data after editing
  };

  const openDeleteModal = (authorId) => {
    setAuthorToDelete(authorId);
    setShowDeleteModal(true);
  };

  const deleteAuthor = async () => {
    if (!authorToDelete) return;
    try {
      await fetch(`/api/authors/${authorToDelete}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      fetchAuthors(); // Refresh author list after deletion
    } catch (error) {
      console.error('Error deleting author:', error);
      setError('Failed to delete author');
    }
  };

  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage); // Total pages based on authors data

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewClick = (authorId) => {
    // Navigate to AuthorOverview page with the author's ID in the URL
    navigate(`/AuthorOverview/${authorId}`);
  };

  return (
    <div className="total-authors-container container mt-4">
      <div>
       <Button variant="btn" onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft className="me-2" /> Back
        </Button>
      </div>
      <div className="text-center mb-4">
        <h3 className="display-8">Authors Overview</h3>
      </div>

      {/* Search Bar, Filter, and Add Author Button */}
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ width: '75%', margin: '0 auto' }}>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            style={{ width: '400px' }}
            className="me-2"
            placeholder="Search by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <Button variant="btn-primary" onClick={handleFilter}>Filter</Button>
        </div>
        <Button variant="success" onClick={() => setShowModal(true)}>
          <IoPersonAddOutline size={20} style={{ marginRight: '10px' }} /> Add Author
        </Button>
      </div>

      {loading && <Spinner animation="border" role="status" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {filteredAuthors.length > 0 && (
        <>
<Table striped bordered hover style={{ width: '75%', margin: '0 auto' }}>
  <thead>
    <tr>
      <th style={{ width: '30%' }}>Name</th>
      <th style={{ width: '50%' }}>Department</th> {/* Column for category */}
      <th style={{ width: '13%' }}>Action</th>
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
              onClick={() => handleViewClick(author.author_id)}
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
              onClick={() => openEditModal(author.author_id)}
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
              onClick={() => openDeleteModal(author.author_id)}
            />
          </td>
        </tr>
      ))}
  </tbody>
</Table>

          {/* Edit Author Modal */}
          <EditAuthor
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            authorId={editingAuthorId}
            onSuccess={refreshAuthors}
          />

          {/* Add New Author Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Add New Author</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <AddNewAuthor onHide={() => setShowModal(false)} />
            </Modal.Body>
          </Modal>

          {/* Delete Author Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this author?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={deleteAuthor}>Delete</Button>
            </Modal.Footer>
          </Modal>

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
        </>
      )}
    </div>
  );
}

export default TotalAuthors;
