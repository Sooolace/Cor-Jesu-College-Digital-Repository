import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Breadcrumb from '../../components/BreadCrumb';
import Spinner from 'react-bootstrap/Spinner';

function EditDepartments() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', image: null });
  const [imageToView, setImageToView] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (department) => {
    setCurrentDepartment(department);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append('name', currentDepartment.name);
    if (currentDepartment.image) {
      formData.append('image', currentDepartment.image);
    }

    try {
      const response = await fetch(`/api/categories/${currentDepartment.category_id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }

      setShowEditModal(false);
      fetchDepartments(); // Refresh the list of departments
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Failed to update department');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDepartment((prevDepartment) => ({
      ...prevDepartment,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCurrentDepartment((prevDepartment) => ({
      ...prevDepartment,
      image: file,
    }));
  };

  const handleAddDepartment = async () => {
    const formData = new FormData();
    formData.append('name', newDepartment.name);
    if (newDepartment.image) {
      formData.append('image', newDepartment.image);
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add department');
      }

      setShowAddModal(false);
      setNewDepartment({ name: '', image: null });
      fetchDepartments(); // Refresh the list of departments
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Failed to add department');
    }
  };

  const handleNewDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment((prevDepartment) => ({
      ...prevDepartment,
      [name]: value,
    }));
  };

  const handleNewFileChange = (e) => {
    const file = e.target.files[0];
    setNewDepartment((prevDepartment) => ({
      ...prevDepartment,
      image: file,
    }));
  };

  const handleViewImage = (imageUrl) => {
    setImageToView(imageUrl);
    setShowImageModal(true);
  };

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/admindashboard' },
            { label: 'Edit Departments', link: '#' },
          ]}
        />
      </div>

      <div className="edit-departments-container container mt-4">
        <div className="text-center mb-4">
          <h2>Edit Departments</h2>
          <div className="author-underline"></div>
        </div>

        <div className="text-center mb-4">
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            Add New Department
          </Button>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
        {error && <p className="text-danger text-center">{error}</p>}
        {!loading && !error && departments.length === 0 && <p className="text-center">No departments available.</p>}

        {departments.length > 0 && (
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '70%' }}>Name</th>
                <th style={{ width: '5%' }}>Logo</th>
                <th style={{ width: '5%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.category_id}>
                  <td>{department.name}</td>
                  <td>
                    <Button variant="info" onClick={() => handleViewImage(department.image_url)} className="ms-2">
                      View
                    </Button>
                  </td>
                  <td>
                    <Button variant="primary" onClick={() => handleEditClick(department)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Department</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentDepartment && (
              <Form>
                <Form.Group controlId="formDepartmentName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={currentDepartment.name}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId="formDepartmentImage" className="mt-3">
                  <Form.Label>Upload New Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add New Department</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formNewDepartmentName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={newDepartment.name}
                  onChange={handleNewDepartmentChange}
                />
              </Form.Group>
              <Form.Group controlId="formNewDepartmentImage" className="mt-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleNewFileChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDepartment}>
              Add Department
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>View Image</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <img src={`http://localhost:5000${imageToView}`} alt="Department" style={{ width: '100%', height: 'auto' }} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowImageModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default EditDepartments;
