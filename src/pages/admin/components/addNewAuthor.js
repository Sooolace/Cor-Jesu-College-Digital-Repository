import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';

function AddNewAuthor({ onHide }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

    if (!name || !categoryId) {
      setError('Please fill in all fields');
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
        return;
      }

      const data = await response.json();
      setSuccess(true);

      // Close modal and reset form after a short delay
      setTimeout(() => {
        setName('');
        setCategoryId('');
        onHide(); // Close the modal
      }, 1500);

    } catch (error) {
      setError('Failed to add the author');
    }
  };

  return (
    <div>
      {loading && <Spinner animation="border" />}

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && <Alert variant="success">Author added successfully!</Alert>}

      {!loading && !error && !success && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="authorName" className="mb-3">
            <Form.Label>Author Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter author's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="category" className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              as="select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <div style={{ textAlign: 'center' }}>
            <Button type="submit" variant="primary">
              Add Author
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

export default AddNewAuthor;
