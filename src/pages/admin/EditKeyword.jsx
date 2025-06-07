import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

function EditKeyword({ show, onHide, keywordId, onSuccess }) {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (keywordId) {
      fetchKeyword();
    }
  }, [keywordId]);

  const fetchKeyword = async () => {
    try {
      const response = await fetch(`/api/keywords/${keywordId}`);
      const data = await response.json();
      setKeyword(data.keyword);
    } catch (error) {
      setError('Failed to fetch keyword');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/keywords/${keywordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to update keyword');
      }

      onSuccess();
      onHide();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Keyword</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formKeyword">
            <Form.Label>Keyword</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditKeyword;
