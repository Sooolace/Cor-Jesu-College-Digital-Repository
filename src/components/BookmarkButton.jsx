import React, { useState, useEffect } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './BookmarkButton.css';

const BookmarkButton = ({ projectId }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('user_id');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    // Only check bookmark status if the user is logged in
    if (isAuthenticated && userId && projectId) {
      checkBookmarkStatus();
    }
  }, [projectId, userId, isAuthenticated]);

  const checkBookmarkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookmarks/check/${userId}/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to check bookmark status');
      }
      const data = await response.json();
      setIsBookmarked(data.isBookmarked);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
      setError('Failed to check bookmark status');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`http://localhost:5000/api/bookmarks/${userId}/${projectId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to remove bookmark');
        }
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const response = await fetch('http://localhost:5000/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            admin_id: userId,
            project_id: projectId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add bookmark');
        }
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      setError('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {isAuthenticated 
        ? (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks')
        : 'Sign in to bookmark this project'}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Button
        onClick={toggleBookmark}
        variant={isBookmarked ? "warning" : "outline-warning"}
        className="bookmark-button"
        disabled={loading || (!isAuthenticated && !isBookmarked)}
        style={{
          backgroundColor: isBookmarked ? '#FACC15' : 'transparent',
          borderColor: '#FACC15',
          color: isBookmarked ? '#000' : '#000'
        }}
      >
        <i className={`fas fa-bookmark ${isBookmarked ? 'bookmarked' : ''}`}></i>
        {' '}
        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </Button>
    </OverlayTrigger>
  );
};

export default BookmarkButton; 