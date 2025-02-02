import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from '../../components/BreadCrumb';
import PaginationComponent from '../../components/PaginationComponent';
import './styles/keywordoverview.css';

function KeywordOverview() {
  const { keywordId } = useParams();
  const [keyword, setKeyword] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKeywordDetails = async () => {
      if (!keywordId) {
        setError('Invalid keyword');
        setLoading(false);
        return;
      }

      try {
        const keywordResponse = await fetch(`/api/keywords/by-name/${encodeURIComponent(keywordId)}`);
        if (!keywordResponse.ok) {
          throw new Error(`HTTP error! status: ${keywordResponse.status}`);
        }
        const keywordData = await keywordResponse.json();
        setKeyword(keywordData);

        const projectsResponse = await fetch(`/api/keywords/${keywordData.keyword_id}/projects`);
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

  const totalPages = Math.ceil(projects.length / itemsPerPage);

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Keywords', link: '/keywords' },
            { label: keyword?.keyword || 'Loading...', link: `/Departments/Keywords` }
          ]}
        />
      </div>

      <div className="keyword-overview-container container mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && (
          <div className="text-center mt-4">
            <Spinner animation="border" role="status" />
            <p>Loading keyword details...</p>
          </div>
        )}

        {keyword && (
          <>
            <h4 className="text-center">Studies tagged with "{keyword.keyword}"</h4>
            <div className="author-underline"></div>
            <div className="search-results">
              {projects.length > 0 ? (
                projects
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((project) => (
                    <div key={project.project_id} className="search-result-item mb-4">
                      <div className="d-flex align-items-start">
                        <div>
                          <a
                            href="#"
                            onClick={() => navigate(`/DocumentOverview/${project.project_id}`)}
                            style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}
                          >
                            {project.title}
                          </a>
                          <div style={{ fontStyle: 'italic', color: '#6c757d' }}>{project.year}</div>
                          <p
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 3,
                            }}
                          >
                            {project.description || 'No description available.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center">No projects found for this keyword.</p>
              )}
            </div>
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={newPage => setCurrentPage(newPage)}
            />
          </>
        )}
      </div>
    </>
  );
}

export default KeywordOverview;
