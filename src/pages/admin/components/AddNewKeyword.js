import React, { useState } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTag } from 'react-icons/fa';

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

    if (!keyword.trim()) {
      setError('Please enter a keyword');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error && data.error === 'Keyword already exists') {
          setError('This keyword already exists. Please try a different one.');
        } else {
          throw new Error('Failed to add the keyword');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setKeyword('');
        // Pass success signal back to parent component
        onHide(true);
      }, 1500);
    } catch (error) {
      setError('Failed to add the keyword');
    } finally {
      setLoading(false);
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
            <span>Keyword added successfully!</span>
          </div>
        </Alert>
      )}
      
      {!success && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="keyword" className="mb-3">
            <Form.Label style={formStyles.label}>Keyword</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
              style={formStyles.input}
            />
          </Form.Group>
          <div className="d-flex justify-content-center mt-4">
            <Button 
              type="submit" 
              className="btn"
              style={{
                backgroundColor: '#a33307',
                color: 'white',
                borderColor: '#a33307'
              }}
              disabled={loading}
            >
              {loading ? (
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
                  <FaTag className="me-2" /> Add Keyword
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

export default AddNewKeyword;
