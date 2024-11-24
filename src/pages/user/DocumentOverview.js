import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft } from 'react-icons/fa';
import './styles/documentoverview.css';
import Breadcrumb from '../../components/BreadCrumb';

function DocumentOverview() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [researchType, setResearchType] = useState(null);
  const [category, setCategory] = useState(null);
  const [researchArea, setResearchArea] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading

        // Fetch project data
        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) throw new Error('Failed to fetch project data');
        const projectData = await projectResponse.json();
        setProject(projectData); // Save project data

        // Fetch keywords for the project
        const keywordsResponse = await fetch(`/api/project_keywords/${projectId}`);
        if (!keywordsResponse.ok) throw new Error('Failed to fetch keywords');
        const keywordsData = await keywordsResponse.json();
        setKeywords(keywordsData); // Save keywords data

        // Fetch authors for the project
        const authorsResponse = await fetch(`/api/project_authors/${projectId}`);
        if (!authorsResponse.ok) throw new Error('Failed to fetch authors');
        const authorsData = await authorsResponse.json();
        setAuthors(authorsData); // Save authors data

        // Fetch category directly using projectData.category_id
        const categoryRes = await fetch(`/api/categories/${projectData.category_id}`);
        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          setCategory(categoryData); // Save category data
        }

        // Fetch research area independently, using projectData.research_area_id
        const researchAreaRes = await fetch(`/api/researchAreas/researchArea/${projectData.research_area_id}`);
        if (researchAreaRes.ok) {
          const researchAreaData = await researchAreaRes.json();
          setResearchArea(researchAreaData); // Save research area data
        }

        // Fetch topic independently, using projectData.topic_id
        const topicRes = await fetch(`/api/topics/topics/${projectData.topic_id}`);
        if (topicRes.ok) {
          const topicData = await topicRes.json();
          setTopic(topicData); // Save topic data
        }

        // Fetch research type after all the other data
        const researchTypeRes = await fetch(`/api/researchTypes/${projectData.research_type_id}`);
        if (researchTypeRes.ok) {
          const researchTypeData = await researchTypeRes.json();
          setResearchType(researchTypeData); // Save research type data
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load project or related data');
      } finally {
        setLoading(false); // Finish loading
      }
    };

    fetchData(); // Call the fetchData function when the component is mounted or projectId changes
  }, [projectId]); // Dependency array: runs when projectId changes

  if (loading) {
    return (
      <div className="loader-container">
        <Spinner animation="border" role="status" />
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center mt-4">{error}</p>;
  }

  if (!project) {
    return <p className="text-center mt-4">No project details available.</p>;
  }

  // Create a mapping of department names to slugs
  const departmentSlugMap = {
    'College of Computer and Information Sciences (CCIS)': 'ccis',
    'College of Engineering (COE)': 'coe',
    'College of Accountancy, Business, and Entrepreneurship (CABE)': 'cabe',
    'College of Health Sciences (CHS)': 'chs',
    'College of Education Arts and Sciences (CEDAS)': 'cedas',
    'Graduate School': 'cjc'
  };

  const departmentSlug = departmentSlugMap[category?.name] || 'default';

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/' },
            { label: 'Capstone & Thesis', link: '/search' },
            { label: category?.name || 'Category', link: `/Departments/${departmentSlug}` },
            { label: 'Document Overview', link: '#' }
          ]}
        />
      </div>
      
      <div className="d-table-container">
        <div className="table-with-back-button">

          <h1 className="text-left mt-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {project.title}
          </h1>
          <div className="author-underline"></div>
          <table className="d-table table-bordered table-striped">
            <tbody>
              <tr>
                <td><strong>Authors</strong></td>
                <td>
                  {authors.length > 0 ? (
                    authors.map((author, index) => (
                      <span key={author.author_id}>
                        <Link to={`/AuthorOverview/${author.author_id}`} className="author-link">
                          {author.name}
                        </Link>
                        {index < authors.length - 1 && ', '}
                      </span>
                    ))
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td><strong>Date Published</strong></td>
                <td>{new Date(project.publication_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Keywords</strong></td>
                <td>
                  {keywords.length > 0 ? (
                    keywords.map((keyword, index) => (
                      <span key={keyword.keyword_id}>
                        <Link to={`/KeywordOverview/${keyword.keyword_id}`} className="keyword-link">
                          {keyword.keyword}
                        </Link>
                        {index < keywords.length - 1 && ', '}
                      </span>
                    ))
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td><strong>Abstract</strong></td>
                <td>{project.abstract}</td>
              </tr>
              {researchType && (
                <tr>
                  <td><strong>Research Type</strong></td>
                  <td>{researchType.name}</td>
                </tr>
              )}
              {category && (
                <tr>
                  <td><strong>Category</strong></td>
                  <td>{category.name}</td>
                </tr>
              )}
              {researchArea && (
                <tr>
                  <td><strong>Research Area</strong></td>
                  <td>{researchArea.name}</td>
                </tr>
              )}
              {topic && (
                <tr>
                  <td><strong>Topic</strong></td>
                  <td>{topic.name}</td>
                </tr>
              )}
              <tr>
                <td><strong>Study URL</strong></td>
                <td>{project.study_url || 'Content not available.'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DocumentOverview;
