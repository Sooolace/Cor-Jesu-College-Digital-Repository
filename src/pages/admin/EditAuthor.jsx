import React, { useEffect, useState } from 'react';
import { Button, Modal, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';

function EditAuthor({ show, onHide, authorId, onSuccess }) {
  const [author, setAuthor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/authors/${authorId}/details`);
          setAuthor(response.data.author);
          setCategories(response.data.categories);
        } catch (err) {
          setError('Failed to load author or categories');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [authorId, show]);

  const handleSave = async () => {
    if (!author?.name || !author?.category_id) {
      setError('Both name and category are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.put(`/api/authors/authwcatid/${authorId}`, {
        name: author.name,
        category_id: author.category_id,
      });
      onSuccess(); // Notify parent of success
      onHide();    // Close the modal
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update author');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuthor({
      ...author,
      [name]: value,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Author</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" variant="primary" />
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={author?.name || ''}
                onChange={handleChange}
                placeholder="Enter author name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                name="category_id"
                value={author?.category_id || ''}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditAuthor;
