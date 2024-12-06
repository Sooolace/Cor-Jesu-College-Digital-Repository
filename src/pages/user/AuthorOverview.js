import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft } from 'react-icons/fa';
import './styles/authoroverview.css';
import Breadcrumb from '../../components/BreadCrumb';

function AuthorOverview() {
  const { authorId } = useParams(); // Get the author ID from the URL params
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        // Step 1: Fetch author by name
        const authorUrl = `/api/authors/name/${encodeURIComponent(authorId)}`;
        console.log(`Fetching author details from: ${authorUrl}`);
  
        const authorResponse = await fetch(authorUrl);
        if (!authorResponse.ok) {
          throw new Error(`HTTP error! status: ${authorResponse.status}`);
        }
        const authorData = await authorResponse.json();
        setAuthor(authorData);
  
        // Step 2: Fetch works using the author's ID
        const authorIdFromResponse = authorData.author_id; // Assuming authorData contains author_id
        const worksUrl = `/api/authors/${authorIdFromResponse}/works`;
        console.log(`Fetching works from: ${worksUrl}`);
  
        const worksResponse = await fetch(worksUrl);
        if (!worksResponse.ok) {
          throw new Error(`HTTP error! status: ${worksResponse.status}`);
        }
        const worksData = await worksResponse.json();
  
        const formattedWorks = worksData.map((work) => ({
          ...work,
          description: work.abstract,
          year: new Date(work.publication_date).getFullYear(),
        }));
  
        setWorks(formattedWorks);
      } catch (error) {
        console.error('Error fetching author details:', error);
        setError('Failed to load author details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchAuthorDetails();
  }, [authorId]);
  
  

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Authors', link: '/authors' },
            { label: author?.name || 'Loading...', link: `/Departments/Authors` }, // Fallback while loading
          ]}
        />
      </div>
      <div className="author-overview-container container mt-4">

        {error && <Alert variant="danger">{error}</Alert>} {/* Display error message if any */}

        {author && (
          <>
            <h4 className="text-center">Works by "{author.name}"</h4>
            <div className="author-underline"></div>

            <div className="table-with-back-button">
            {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <span className="visually-hidden">Loading...</span>
            <p>Loading author details...</p>
          </div>
        )}
              {works.length > 0 ? (
                <Table striped bordered hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>Work Title</th>
                      <th>Description</th>
                      <th>Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((work) => (
                      <tr key={work.project_id}>
                        <td>
                          <Link to={`/DocumentOverview/${work.project_id}`}>
                            {work.title}
                          </Link>
                        </td>
                        <td className="truncate">{work.description}</td>
                        <td>{work.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No works found for this author.</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AuthorOverview;
