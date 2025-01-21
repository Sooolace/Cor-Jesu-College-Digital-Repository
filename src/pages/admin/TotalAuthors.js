import React, { useEffect, useState } from 'react';
import { Table, Button, Pagination, Spinner, Form, Modal, Alert, Dropdown } from 'react-bootstrap';
import { CiViewList } from "react-icons/ci";
import { MdDelete } from 'react-icons/md';
import { FaUserEdit } from "react-icons/fa";
import { IoPersonAddOutline } from 'react-icons/io5'; 
import { useNavigate } from 'react-router-dom';
import AddNewAuthor from './components/addNewAuthor';
import EditAuthor from './EditAuthor';
import { FaArrowLeft } from 'react-icons/fa';
import '../admin/styles/TotalAuthors.css';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';

function TotalAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterName, setFilterName] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); 
  const [authorToDelete, setAuthorToDelete] = useState(null);
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

  const openEditModal = (authorId) => {
    setEditingAuthorId(authorId);
    setShowEditModal(true);
  };

  const refreshAuthors = () => {
    fetchAuthors(); 
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
      fetchAuthors(); 
    } catch (error) {
      console.error('Error deleting author:', error);
      setError('Failed to delete author');
    }
  };

  
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage); 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Updated handleViewClick to use author name
  const handleViewClick = (authorName) => {
    // Encode the name to handle spaces and special characters
    const encodedName = encodeURIComponent(authorName);
    navigate(`/AuthorOverview/${encodedName}`); // Use author's name in the URL
  };

  return (
    <>      
    <div className="breadcrumb-container">
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admindashboard' },
          { label: 'Authors', link: '#' },
        ]}
      />
    </div>
    <div className="total-authors-container container mt-4">
        <h3 className="display-8">Authors Overview</h3>
        <div className="author-underline"></div>

      {/* Search Bar, Filter, and Add Author Button */}
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ width: '75%', margin: '0 auto' }}>
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
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            style={{ width: '400px' }}
            className="me-2"
            placeholder="Search by Name"
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
          </Button>        </div>
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
                <th style={{ width: '50%' }}>Department</th>
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
                        onClick={() => handleViewClick(author.name)} // Use author name for navigation
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

export default TotalAuthors;
