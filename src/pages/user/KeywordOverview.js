import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft } from 'react-icons/fa';  
import Breadcrumb from '../../components/BreadCrumb';


function KeywordOverview() {
  const { keywordId } = useParams();
  const [keyword, setKeyword] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKeywordDetails = async () => {
      try {
        const keywordResponse = await fetch(`/api/keywords/${keywordId}`);
        if (!keywordResponse.ok) {
          throw new Error(`HTTP error! status: ${keywordResponse.status}`);
        }
        const keywordData = await keywordResponse.json();
        setKeyword(keywordData);

        const projectsResponse = await fetch(`/api/keywords/${keywordId}/projects`);
        if (!projectsResponse.ok) {
          throw new Error(`HTTP error! status: ${projectsResponse.status}`);
        }
        const projectsData = await projectsResponse.json();

        const formattedProjects = projectsData.map((project) => ({
          ...project,
          description: project.abstract,
          year: new Date(project.created_at).getFullYear(),
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error('Error fetching keyword details:', error);
        setError('Failed to load keyword details');
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordDetails();
  }, [keywordId]);

  return (
    <>

      <div className="breadcrumb-container">
        <Breadcrumb
      items={[
        { label: 'Home', link: '/' },
        { label: 'Keywords', link: '/Keyword' },
        { label: keyword?.keyword || 'Category', link: `/Departments/Keywords` },
      ]}
        />
      </div>

    <div className="keyword-overview-container container mt-4">
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status" />
          <span className="visually-hidden">Loading...</span>
          <p>Loading keyword details...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="btn" onClick={() => navigate(-1)} className="back-button mb-3">
        <FaArrowLeft className="me-2" /> Back
      </Button>
      {keyword && (
        <>
          <h2 className="text-center">{keyword.keyword}</h2>
          <div className="keyword-underline"></div>

          <div className="table-with-back-button">
            <h4 className="mt-4">Projects:</h4>
            {projects.length > 0 ? (
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Project Title</th>
                    <th>Description</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.project_id}>
                      <td>
                        <Link to={`/DocumentOverview/${project.project_id}`}>
                          {project.title}
                        </Link>
                      </td>
                      <td>{project.description}</td>
                      <td>{project.year}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>No projects found for this keyword.</p>
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
}

export default KeywordOverview;
