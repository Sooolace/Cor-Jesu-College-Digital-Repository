import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/user/styles/Featured.css';

function Featured() {
    const [featuredDocuments, setFeaturedDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch featured documents from the API
    useEffect(() => {
        const fetchFeaturedDocuments = async () => {
            try {
                const response = await axios.get('/api/projects/projects/active-featured');
                const data = response.data;
                setFeaturedDocuments(data);
            } catch (error) {
                setError('Failed to fetch featured documents');
                console.error('API call error:', error);
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
            <div className="featured-documents-wrapper">
                <div className="featured-documents">
                    {featuredDocuments.map((document) => (
                        <div key={document.project_id} className="featured-document">
                            {/* Clickable Document Title */}
                            <h3
                                className="document-title"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/DocumentOverview/${document.project_id}`)}
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
                                            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                                            onClick={() =>
                                                navigate(`/AuthorOverview/${encodeURIComponent(author)}`)
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
                    ))}
                </div>
            </div>
        </section>
    );
}

export default React.memo(Featured);
