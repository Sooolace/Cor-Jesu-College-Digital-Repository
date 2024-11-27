import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import axios from 'axios';
import '../pages/user/styles/Featured.css'; // Ensure correct path to CSS

function Featured() {
  const [featuredDocuments, setFeaturedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Initialize navigate function

  // Fetch featured documents from the API
  useEffect(() => {
    const fetchFeaturedDocuments = async () => {
      try {
        const response = await axios.get('/api/featured-documents');
        setFeaturedDocuments(response.data);
      } catch (error) {
        setError('Failed to fetch featured documents');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDocuments();
  }, []);

  if (loading) {
    return (
      <section className="featured-section">
        <h2 className="section-title">Featured Documents</h2>
        <p>Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-section">
        <h2 className="section-title">Featured Documents</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <section className="featured-section">
      <h2 className="section-title">Featured Documents</h2>
      <div className="featured-documents">
        {featuredDocuments.map((document) => (
          <div key={document.project_id} className="featured-document">
            {/* Clickable Document Title */}
            <h3
              className="document-title"
              style={{ cursor: 'pointer' }} // Only make it clickable, no style change
              onClick={() => navigate(`/DocumentOverview/${encodeURIComponent(document.title)}`)}
            >
              {document.title}
            </h3>
            {/* Clickable Author */}
            <p>
              <strong>Author:</strong>{' '}
              <span
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }} // Keeps author as link style
                onClick={() => navigate(`/AuthorOverview/${encodeURIComponent(document.author)}`)}
              >
                {document.author}
              </span>
            </p>
            <p><strong>Date Published:</strong> {new Date(document.publication_date).toLocaleDateString()}</p>
            <p className="document-description">{document.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Featured;
