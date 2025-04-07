import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaSave, FaUserPlus } from 'react-icons/fa';

function AddNewAuthor({ onHide }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    if (!name || !categoryId) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category_id: categoryId }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Check if the error is about a duplicate author
        if (data.error && data.error === 'Author with this name already exists') {
          setError('Author already exists. Please try a different name.');
        } else {
          setError('Failed to add the author');
        }
        setSubmitting(false);
        return;
      }

      const data = await response.json();
      setSuccess(true);

      // Close modal and reset form after a short delay
      setTimeout(() => {
        setName('');
        setCategoryId('');
        // Pass success signal back to parent component
        onHide(true); // Pass true to indicate successful addition
      }, 1500);

    } catch (error) {
      setError('Failed to add the author');
      setSubmitting(false);
    }
  };

  // Styles for form elements
  const formStyles = {
    input: {
      borderRadius: '4px',
      border: '1px solid #ced4da',
      padding: '10px 12px',
      fontSize: '16px',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    },
    label: {
      fontWeight: '500',
      marginBottom: '8px',
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading departments...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>Author added successfully!</span>
          </div>
        </Alert>
      )}

      {!success && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="authorName" className="mb-3">
            <Form.Label style={formStyles.label}>Author Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter author's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={formStyles.input}
            />
          </Form.Group>

          <Form.Group controlId="category" className="mb-3">
            <Form.Label style={formStyles.label}>Department</Form.Label>
            <Form.Control
              as="select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={formStyles.input}
            >
              <option value="">Select Department</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <div className="d-flex justify-content-center mt-4">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submitting}
              className="px-4 py-2"
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <FaUserPlus className="me-2" /> Add Author
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

export default AddNewAuthor;
