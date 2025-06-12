import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/user/styles/Featured.css';

function Featured() {
    const [featuredDocuments, setFeaturedDocuments] = useState(() => {
        try {
            const cached = sessionStorage.getItem('featuredDocuments');
            return cached ? JSON.parse(cached) : [];
        } catch (error) {
            console.error('Error parsing cached data:', error);
            return [];
        }
    });
    const [loading, setLoading] = useState(() => !sessionStorage.getItem('featuredDocuments'));
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch featured documents from the API
    useEffect(() => {
        const fetchFeaturedDocuments = async () => {
            // Check for cached data
            try {
                const cached = sessionStorage.getItem('featuredDocuments');
                if (cached) {
                    const parsedData = JSON.parse(cached);
                    if (Array.isArray(parsedData)) {
                        setFeaturedDocuments(parsedData);
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error parsing cached data:', error);
            }

            try {
                const response = await axios.get('/api/projects/projects/active-featured');
                const data = response.data;
                // Ensure data is an array before setting it
                if (Array.isArray(data)) {
                    setFeaturedDocuments(data);
                    sessionStorage.setItem('featuredDocuments', JSON.stringify(data));
                } else {
                    console.error('API returned non-array data:', data);
                    setFeaturedDocuments([]);
                    setError('Invalid data format received from server');
                }
            } catch (error) {
                console.error('Error fetching featured documents:', error);
                setError('Failed to fetch featured documents');
                setFeaturedDocuments([]); // Ensure we have an empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedDocuments();
    }, []);

    // Ensure featuredDocuments is always an array
    const safeFeaturedDocuments = Array.isArray(featuredDocuments) ? featuredDocuments : [];

    if (loading) {
        return (
            <section className="featured-section">
                <h2 className="section-title">Featured Documents</h2>
                <div className="loading-placeholder">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="featured-section">
                <h2 className="section-title">Featured Documents</h2>
                <div className="error-message">{error}</div>
            </section>
        );
    }

    return (
        <section className="featured-section">
            <h2 className="section-title">Featured Documents</h2>
            <div className="featured-documents-wrapper">
                <div className="featured-documents">
                    {safeFeaturedDocuments.length > 0 ? (
                        safeFeaturedDocuments.map((document) => (
                            <div key={document.project_id} className="featured-document">
                                <div className="document-content">
                                    <h3
                                        className="document-title"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            navigate(`/DocumentOverview/${document.project_id}`)
                                        }
                                    >
                                        {document.title}
                                    </h3>

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

                                    <p>
                                        <strong>Abstract:</strong>{' '}
                                        {document.abstract || 'No abstract available'}
                                    </p>

                                    <p>
                                        <strong>Description:</strong>{' '}
                                        {document.description || 'No description available'}
                                    </p>

                                    <p>
                                        <strong>Date Published:</strong>{' '}
                                        {new Date(document.publication_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-documents">No featured documents available</div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default React.memo(Featured);
