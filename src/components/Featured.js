import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/user/styles/Featured.css';

function Featured() {
    const [featuredDocuments, setFeaturedDocuments] = useState(() => {
        const cached = sessionStorage.getItem('featuredDocuments');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(() => !sessionStorage.getItem('featuredDocuments'));
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch featured documents from the API
    useEffect(() => {
        const fetchFeaturedDocuments = async () => {
            // Check for cached data
            const cached = sessionStorage.getItem('featuredDocuments');
            if (cached) {
                setFeaturedDocuments(JSON.parse(cached));
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('/api/projects/projects/active-featured');
                const data = response.data;
                setFeaturedDocuments(data);
                sessionStorage.setItem('featuredDocuments', JSON.stringify(data));
            } catch (error) {
                setError('Failed to fetch featured documents');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedDocuments();
    }, []); // Remove dependency on featuredDocuments.length

    if (loading) {
        return (
            <section className="featured-section">
                <h2 className="section-title">Featured Documents</h2>
                <div className="loading-placeholder">Loading...</div> {/* Add loading placeholder */}
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
            <div className="featured-documents-wrapper">
                <div className="featured-documents">
                    {featuredDocuments.map((document) => (
                        <div key={document.project_id} className="featured-document">
                            {/* Scrollable content inside each card */}
                            <div className="document-content">
                                {/* Clickable Document Title */}
                                <h3
                                    className="document-title"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() =>
                                        navigate(`/DocumentOverview/${document.project_id}`)
                                    }
                                >
                                    {document.title}
                                </h3>

                                {/* Clickable Authors */}
                                <p>
                                    <strong>Author(s):</strong>{' '}
                                    {document.authors ? (
                                        document.authors.split(', ').map((author, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#007bff',
                                                    textDecoration: 'underline',
                                                }}
                                                onClick={() =>
                                                    navigate(
                                                        `/AuthorOverview/${encodeURIComponent(author)}`
                                                    )
                                                }
                                            >
                                                {author}
                                                {index < document.authors.split(', ').length - 1 ? ', ' : ''}
                                            </span>
                                        ))
                                    ) : (
                                        <span>No authors available</span>
                                    )}
                                </p>

                                {/* Abstract */}
                                <p>
                                    <strong>Abstract:</strong>{' '}
                                    {document.abstract || 'No abstract available'}
                                </p>

                                {/* Description */}
                                <p>
                                    <strong>Description:</strong>{' '}
                                    {document.description || 'No description available'}
                                </p>

                                {/* Date Published */}
                                <p>
                                    <strong>Date Published:</strong>{' '}
                                    {new Date(document.publication_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default React.memo(Featured);
