import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Breadcrumb from '../../components/BreadCrumb';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';

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
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (department) => {
    setCurrentDepartment({
      ...department,
      image: null, // Reset image field for upload
      existingImageUrl: department.image_url // Keep track of existing image
    });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      setUploadStatus('Saving changes...');
      const formData = new FormData();
      formData.append('name', currentDepartment.name);
      
      // If there's a new image, upload it and get the path
      let imagePath = currentDepartment.existingImageUrl; // Default to existing image
      
      if (currentDepartment.image) {
        // First, upload the image to server
        const imageFormData = new FormData();
        imageFormData.append('file', currentDepartment.image);
        
        // Extract department acronym for the filename
        const acronymMatch = currentDepartment.name.match(/\(([^)]+)\)/);
        const acronym = acronymMatch ? acronymMatch[1] : currentDepartment.name.split(' ')[0];
        imageFormData.append('filename', `${acronym}.png`);
        
        const uploadResponse = await axios.post('/api/upload/department-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data && uploadResponse.data.imagePath) {
          imagePath = uploadResponse.data.imagePath;
        }
      }
      
      // Now update the department with the image path
      const updateData = {
        name: currentDepartment.name,
        image_url: imagePath
      };
      
      const response = await fetch(`/api/categories/${currentDepartment.category_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }
      
      setUploadStatus('');
      setShowEditModal(false);
      fetchDepartments(); // Refresh the list
    } catch (error) {
      console.error('Error updating department:', error);
      setUploadStatus('');
      setError('Failed to update department. Please try again.');
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
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentDepartment((prevDepartment) => ({
          ...prevDepartment,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDepartment = async () => {
    try {
      setUploadStatus('Adding department...');
      
      // First, upload the image if there is one
      let imagePath = '/assets/default-department.png'; // Default image path
      
      if (newDepartment.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', newDepartment.image);
        
        // Extract department acronym for the filename
        const acronymMatch = newDepartment.name.match(/\(([^)]+)\)/);
        const acronym = acronymMatch ? acronymMatch[1] : newDepartment.name.split(' ')[0];
        imageFormData.append('filename', `${acronym}.png`);
        
        const uploadResponse = await axios.post('/api/upload/department-image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data && uploadResponse.data.imagePath) {
          imagePath = uploadResponse.data.imagePath;
        }
      }
      
      // Now create the department with the image path
      const departmentData = {
        name: newDepartment.name,
        image_url: imagePath
      };
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(departmentData)
      });

      if (!response.ok) {
        throw new Error('Failed to add department');
      }
      
      setUploadStatus('');
      setShowAddModal(false);
      setNewDepartment({ name: '', image: null, imagePreview: null });
      fetchDepartments(); // Refresh the list
    } catch (error) {
      console.error('Error adding department:', error);
      setUploadStatus('');
      setError('Failed to add department. Please try again.');
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
    if (file) {
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDepartment((prevDepartment) => ({
          ...prevDepartment,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
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
            <span className="ms-2">Loading departments...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center mt-4">
            {error}
          </div>
        )}

        {!loading && !error && departments.length === 0 && (
          <div className="alert alert-info text-center mt-4">
            No departments available. Add a new department to get started.
          </div>
        )}

        {!loading && !error && departments.length > 0 && (
          <Table striped bordered hover className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '70%' }}>Name</th>
                <th style={{ width: '15%' }}>Logo</th>
                <th style={{ width: '15%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((department) => (
                <tr key={department.category_id}>
                  <td>{department.name}</td>
                  <td className="text-center">
                    {department.image_url ? (
                      <Button 
                        variant="outline-danger" 
                        onClick={() => handleViewImage(department.image_url)} 
                        className="ms-2"
                        style={{ backgroundColor: '#a33307', borderColor: '#a33307', color: 'white' }}
                      >
                        View Logo
                      </Button>
                    ) : (
                      <span className="text-muted">No image</span>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEditClick(department)}
                    >
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
                
                {currentDepartment.existingImageUrl && (
                  <div className="mt-3 text-center">
                    <p><strong>Current Logo:</strong></p>
                    <img 
                      src={currentDepartment.existingImageUrl} 
                      alt="Current department logo" 
                      style={{ maxWidth: '100%', maxHeight: '150px', marginBottom: '10px' }} 
                    />
                  </div>
                )}
                
                <Form.Group controlId="formDepartmentImage" className="mt-3">
                  <Form.Label>Upload New Logo</Form.Label>
                  <Form.Control
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    Upload a new image to replace the current one.
                  </Form.Text>
                </Form.Group>
                
                {currentDepartment.imagePreview && (
                  <div className="mt-3 text-center">
                    <p><strong>New Logo Preview:</strong></p>
                    <img 
                      src={currentDepartment.imagePreview} 
                      alt="New department logo preview" 
                      style={{ maxWidth: '100%', maxHeight: '150px' }} 
                    />
                  </div>
                )}
                
                {uploadStatus && (
                  <div className="alert alert-info mt-3 text-center">
                    {uploadStatus}
                  </div>
                )}
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
                  placeholder="e.g., College of Engineering (COE)"
                />
                <Form.Text className="text-muted">
                  Include the acronym in parentheses for better organization.
                </Form.Text>
              </Form.Group>
              
              <Form.Group controlId="formNewDepartmentImage" className="mt-3">
                <Form.Label>Upload Logo</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleNewFileChange}
                />
              </Form.Group>
              
              {newDepartment.imagePreview && (
                <div className="mt-3 text-center">
                  <p><strong>Logo Preview:</strong></p>
                  <img 
                    src={newDepartment.imagePreview} 
                    alt="New department logo preview" 
                    style={{ maxWidth: '100%', maxHeight: '150px' }} 
                  />
                </div>
              )}
              
              {uploadStatus && (
                <div className="alert alert-info mt-3 text-center">
                  {uploadStatus}
                </div>
              )}
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
            <Modal.Title>Department Logo</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <img src={imageToView} alt="Department Logo" style={{ maxWidth: '100%', maxHeight: '300px' }} />
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
