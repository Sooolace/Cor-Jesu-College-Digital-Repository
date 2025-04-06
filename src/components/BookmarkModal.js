import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/user/styles/bookmarkModal.css';

function BookmarkModal({ show, onHide }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch bookmarks when the modal is shown and we have a userId
    if (show && userId) {
      fetchBookmarks();
    }
  }, [show, userId]);

  const fetchBookmarks = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookmarks/admin/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // If no bookmarks found, set empty array and don't show error
          setBookmarks([]);
          setLoading(false);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Bookmarks fetched:', data);
      
      // Handle either array or empty result
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (projectId) => {
    try {
      // Make sure we're using integers for the IDs
      const userIdInt = parseInt(userId);
      const projectIdInt = parseInt(projectId);
      
      console.log('Removing bookmark:', { userId: userIdInt, projectId: projectIdInt });
      
      const response = await fetch(`http://localhost:5000/api/bookmarks/${userIdInt}/${projectIdInt}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }

      // Remove the bookmark from state
      setBookmarks(bookmarks.filter(bookmark => bookmark.project_id !== projectId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark. Please try again.');
    }
  };
  
  // Handle clicking on a bookmark
  const handleBookmarkClick = (projectId) => {
    // Close the modal
    onHide();
    // Navigate to the document
    navigate(`/DocumentOverview/${projectId}`);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="bookmark-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="bookmark-modal">
          <i className="fas fa-bookmark me-2"></i>
          My Bookmarks
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : bookmarks.length === 0 ? (
          <Alert variant="info">
            You don't have any bookmarks yet. Browse research projects and click the bookmark icon to save them here.
          </Alert>
        ) : (
          <ListGroup className="bookmark-list">
            {bookmarks.map((bookmark) => (
              <ListGroup.Item key={`${bookmark.admin_id}-${bookmark.project_id}`} className="bookmark-item d-flex justify-content-between align-items-center">
                {/* Use onClick instead of Link for better control */}
                <div 
                  className="bookmark-title"
                  onClick={() => handleBookmarkClick(bookmark.project_id)}
                  style={{ cursor: 'pointer' }}
                >
                  {bookmark.title}
                </div>
                <Button 
                  variant="link" 
                  className="text-danger p-0 ms-2" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the ListGroup.Item click
                    handleRemoveBookmark(bookmark.project_id);
                  }}
                  title="Remove bookmark"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BookmarkModal; 