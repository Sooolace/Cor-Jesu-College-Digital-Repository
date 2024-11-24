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
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const authorResponse = await fetch(`/api/authors/${authorId}`);
        if (!authorResponse.ok) {
          throw new Error(`HTTP error! status: ${authorResponse.status}`);
        }
        const authorData = await authorResponse.json();
        setAuthor(authorData);

        const worksResponse = await fetch(`/api/authors/${authorId}/works`);
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
          { label: author?.name || 'Category', link: `/Departments/Authors` },
        ]}
      />
    </div>
    <div className="author-overview-container container mt-4">
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status" />
          <span className="visually-hidden">Loading...</span>
          <p>Loading author details...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {author && (
        <>
          <h2 className="text-center">{author.name}</h2>
          <div className="author-underline"></div>

          <div className="table-with-back-button">
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
