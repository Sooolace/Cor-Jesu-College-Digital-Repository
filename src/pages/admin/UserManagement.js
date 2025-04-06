import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Container, Row, Col, Modal } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './styles/TotalAuthors.css'; // Reuse the same styling as TotalAuthors
import { getUsers, updateUserRole } from '../../utils/api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const navigate = useNavigate();

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

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Link to="/admindashboard" className="btn btn-link text-decoration-none">
              <FaArrowLeft className="me-2" /> Back to Dashboard
            </Link>
          </div>
          <h2 className="mb-4">Manage Users</h2>
          {successMessage && (
            <Alert variant="success" className="mb-3">
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
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
                <td colSpan="4" className="text-center">No users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td className="text-center">
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <Button 
                      variant={user.role === 'admin' ? 'outline-primary' : 'outline-danger'}
                      onClick={() => handleRoleChange(user.id, user.username, user.role)}
                    >
                      {user.role === 'admin' ? 'Change to User' : 'Change to Admin'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Role Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change <strong>{selectedUser?.username}</strong>'s role from 
          <span className={`role-badge-inline ${selectedUser?.currentRole === 'admin' ? 'role-admin' : 'role-user'}`}>
            {selectedUser?.currentRole?.toUpperCase()}
          </span> to 
          <span className={`role-badge-inline ${newRole === 'admin' ? 'role-admin' : 'role-user'}`}>
            {newRole.toUpperCase()}
          </span>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant={newRole === 'admin' ? 'danger' : 'primary'} 
            onClick={confirmRoleChange}
          >
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserManagement; 