import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';

function AddNewKeyword({ onHide }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to add the keyword');
      }

      setSuccess(true);
      setTimeout(() => {
        setKeyword('');
        onHide();
      }, 1500);
    } catch (error) {
      setError('Failed to add the keyword');
    } finally {
      setLoading(false);
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
      {success && <Alert variant="success">Keyword added successfully!</Alert>}
      {!loading && !error && !success && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="keyword" className="mb-3">
            <Form.Label>Keyword</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </Form.Group>
          <div style={{ textAlign: 'center' }}>
            <Button type="submit" variant="primary">
              Add Keyword
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

export default AddNewKeyword;
