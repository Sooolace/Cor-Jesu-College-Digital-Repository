import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Container, Row, Col, Modal, Badge } from 'react-bootstrap';
import { FaUserShield, FaUser, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './styles/TotalAuthors.css';
import { getUsers, updateUserRole } from '../../utils/api';
import Breadcrumb from '../../components/BreadCrumb';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const navigate = useNavigate();

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', link: '/admindashboard' },
    { label: 'User Management', link: '/admin/users' }
  ];

  // Function to check if user is authenticated as admin
  const checkAdminAuth = () => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const role = localStorage.getItem('role');
    
    console.log('Auth check:', { token: !!token, isAdmin, role });
    
    if (!token || !isAdmin || role !== 'admin') {
      console.warn('User not authenticated as admin, redirecting to login');
      // Redirect to login with current location for return after login
      navigate('/login', { 
        state: { 
          from: '/usermanagement', 
          preserveLogin: false 
        } 
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Check authentication before fetching users
    if (checkAdminAuth()) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Handle unauthorized error specifically
      if (error.response && error.response.status === 401) {
        setError('You are not authorized to view this page. Please log in as administrator.');
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: '/usermanagement', 
              preserveLogin: false 
            } 
          });
        }, 2000);
      } else {
        setError('Failed to load users. Please try again later.');
      }
      setLoading(false);
    }
  };

  const handleRoleChange = (userId, username, currentRole) => {
    const roleToChangeTo = currentRole === 'admin' ? 'user' : 'admin';
    setSelectedUser({ id: userId, username, currentRole });
    setNewRole(roleToChangeTo);
    setShowModal(true);
  };

  const confirmRoleChange = async () => {
    try {
      // Check authentication before updating
      if (!checkAdminAuth()) return;
      
      await updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? {...user, role: newRole} : user
      ));
      
      setSuccessMessage(`User role for ${selectedUser.username} updated successfully to ${newRole}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating user role:', error);
      
      // Handle unauthorized error specifically
      if (error.response && error.response.status === 401) {
        setError('You are not authorized to perform this action. Please log in as administrator.');
        setShowModal(false);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: '/usermanagement', 
              preserveLogin: false 
            } 
          });
        }, 2000);
      } else {
        setError('Failed to update user role. Please try again.');
        setTimeout(() => setError(null), 3000);
        setShowModal(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setNewRole('');
  };

  if (loading) {
    return (
      <div>
        <div className="breadcrumb-page">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="container mt-4">
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="breadcrumb-page">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <div className="container mt-4">
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb-page">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="container mt-4" style={{ maxWidth: '1200px', padding: '1rem' }}>
        <h2 className="mb-4 text-center">
          <FaUserShield className="me-2" />
          User Management
        </h2>
        
        {successMessage && (
          <Alert variant="success" className="mb-3" dismissible onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        <div className="table-responsive">
          <Table striped bordered hover className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    <FaUser className="mb-2" style={{ fontSize: '2rem' }} />
                    <p className="mb-0">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaUser className="me-2" />
                        {user.username}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td className="text-center">
                      <Badge 
                        bg={user.role === 'admin' ? 'primary' : 'secondary'}
                        className="px-3 py-2"
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant={user.role === 'admin' ? 'outline-danger' : 'outline-primary'}
                        size="sm"
                        onClick={() => handleRoleChange(user.id, user.username, user.role)}
                        className="d-flex align-items-center mx-auto"
                      >
                        <FaEdit className="me-1" />
                        {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Confirmation Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaEdit className="me-2" />
              Confirm Role Change
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to change <strong>{selectedUser?.username}</strong>'s role from{' '}
              <Badge bg={selectedUser?.currentRole === 'admin' ? 'primary' : 'secondary'}>
                {selectedUser?.currentRole?.toUpperCase()}
              </Badge>{' '}
              to{' '}
              <Badge bg={newRole === 'admin' ? 'primary' : 'secondary'}>
                {newRole.toUpperCase()}
              </Badge>?
            </p>
            <p className="text-muted">
              This action will affect the user's access privileges immediately.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant={newRole === 'admin' ? 'primary' : 'danger'} 
              onClick={confirmRoleChange}
            >
              Confirm Change
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default UserManagement; 