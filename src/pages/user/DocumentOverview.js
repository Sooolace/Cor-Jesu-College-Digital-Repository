import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
<<<<<<< HEAD
import { FaArrowLeft, FaBookmark, FaPrint, FaDownload } from 'react-icons/fa';  // Add FaDownload for the download icon
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'; 
import './styles/documentoverview.css';
import Breadcrumb from '../../components/BreadCrumb';
import cjclogo from '../../../src/assets/cjclogo.PNG'; 
=======
import { FaArrowLeft } from 'react-icons/fa';
import './styles/documentoverview.css';
import Breadcrumb from '../../components/BreadCrumb';
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

function DocumentOverview() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [researchType, setResearchType] = useState(null);
  const [category, setCategory] = useState(null);
  const [researchArea, setResearchArea] = useState(null);
  const [topic, setTopic] = useState(null);
<<<<<<< HEAD
  const [department, setDepartment] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
=======
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
<<<<<<< HEAD
        setLoading(true);

        const projectResponse = await fetch(`/api/projects/${projectId}`);
        if (!projectResponse.ok) throw new Error('Failed to fetch project data');
        const projectData = await projectResponse.json();
        setProject(projectData);

        const keywordsResponse = await fetch(`/api/project_keywords/${projectId}`);
        if (!keywordsResponse.ok) throw new Error('Failed to fetch keywords');
        const keywordsData = await keywordsResponse.json();
        setKeywords(keywordsData);

        const authorsResponse = await fetch(`/api/project_authors/${projectId}`);
        if (!authorsResponse.ok) throw new Error('Failed to fetch authors');
        const authorsData = await authorsResponse.json();
        setAuthors(authorsData);

        const categoriesRes = await fetch(`/api/categories/${projectData.category_id}`);
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategory(categoriesData);
        }

        const researchAreaRes = await fetch(`/api/researchAreas/researchArea/${projectData.research_area_id}`);
        if (researchAreaRes.ok) {
          const researchAreaData = await researchAreaRes.json();
          setResearchArea(researchAreaData);
        }

        const topicRes = await fetch(`/api/topics/topics/${projectData.topic_id}`);
        if (topicRes.ok) {
          const topicData = await topicRes.json();
          setTopic(topicData);
        }

        const researchTypeRes = await fetch(`/api/researchTypes/${projectData.research_type_id}`);
        if (researchTypeRes.ok) {
          const researchTypeData = await researchTypeRes.json();
          setResearchType(researchTypeData);
        }

        const departmentRes = await fetch(`/api/departments/${projectData.department_id}`);
        if (departmentRes.ok) {
          const departmentData = await departmentRes.json();
          setDepartment(departmentData);
        }

=======
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
  
        // Fetch categories related to the project
        const categoriesRes = await fetch(`/api/project_category/${projectId}`);
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategory(categoriesData); // Save all category data
        }

        // Fetch research area independently
        const researchAreaRes = await fetch(`/api/researchAreas/researchArea/${projectData.research_area_id}`);
        if (researchAreaRes.ok) {
          const researchAreaData = await researchAreaRes.json();
          setResearchArea(researchAreaData); // Save research area data
        }
  
        // Fetch topic independently
        const topicRes = await fetch(`/api/topics/topics/${projectData.topic_id}`);
        if (topicRes.ok) {
          const topicData = await topicRes.json();
          setTopic(topicData); // Save topic data
        }
  
        // Fetch research type
        const researchTypeRes = await fetch(`/api/researchTypes/${projectData.research_type_id}`);
        if (researchTypeRes.ok) {
          const researchTypeData = await researchTypeRes.json();
          setResearchType(researchTypeData); // Save research type data
        }
  
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      } catch (err) {
        console.error(err);
        setError('Failed to load project or related data');
      } finally {
<<<<<<< HEAD
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handlePrintSummary = () => {
    const printContents = document.querySelector('.document-container').outerHTML;
    const originalContents = document.body.innerHTML;
  
    document.body.innerHTML = printContents; // Replace the body with only the content to print
    window.print();
    document.body.innerHTML = originalContents; // Restore original contents after print
  };

  const handleDownloadPDF = () => {
    const content = document.querySelector('.document-container');
    
    // Use html2canvas to capture the content as an image
    html2canvas(content, { 
      scale: 2, // Set a reasonable scale for better quality, but avoid over-scaling
      useCORS: true, // Allow CORS (Cross-origin requests) for external images
      logging: false, // Disable console logs
      allowTaint: true, // Allow tainting for better cross-origin image rendering
      scrollX: 0,
      scrollY: -window.scrollY, // To avoid scrolling issues during capture
    }).then((canvas) => {
      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png');
  
      // Get the dimensions of the image for aspect ratio calculations
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Create the PDF document
      const doc = new jsPDF({
        unit: 'px', // Set unit to pixels for precision
        format: [imgWidth, imgHeight] // Set PDF format based on image dimensions
      });
  
      // Add the image to the PDF, without distorting the aspect ratio
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
      // Save the generated PDF
      doc.save('project-summary.pdf');
    }).catch((err) => {
      console.error('Error while generating PDF:', err);
    });
  };
  

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked); 
  };
=======
        setLoading(false); // Finish loading
      }
    };
  
    fetchData(); // Call the fetchData function when the component is mounted or projectId changes
  }, [projectId]); // Dependency array: runs when projectId changes
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

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

<<<<<<< HEAD
=======
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

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
<<<<<<< HEAD
          items={[ 
            { label: 'Home', link: '/' },
            { label: 'Theses and Dissertations', link: '/AllWorks' },
=======
          items={[
            { label: 'Home', link: '/' },
            { label: 'Capstone & Thesis', link: '/search' },
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
            { label: 'Document Overview', link: '#' }
          ]}
        />
      </div>
<<<<<<< HEAD

      <div className="document-container">
        <h2>{project.title}</h2>
        <div className="author-underline mb-4"></div>
        <div className="document-header">
          <div className="left-side">
            <p className="abstract">{project.abstract}</p>

            {/* Keywords */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Keywords:</strong></p>
                <p className="detail-content">
                  {keywords.length > 0 ? keywords.map((keyword, index) => (
                    <span key={keyword.keyword_id}>
                      <Link to={`/KeywordOverview/${encodeURIComponent(keyword.keyword)}`} className="keyword-link">
                        {keyword.keyword}
                      </Link>
                      {index < keywords.length - 1 && ', '}
                    </span>
                  )) : 'N/A'}
                </p>
              </div>

          <div className="project-detail-item">
                        <p className="detail-title"><strong>Study Url:</strong></p>
                        <p className="detail-content">
                          {project.study_url ? <a href={project.study_url} target="_blank" rel="noopener noreferrer">{project.study_url}</a> : 'No Link Available'}
                        </p>
            </div>
                      <div className="project-detail-item">
            <p className="detail-title"><strong>Downloadable File:</strong></p>
            <p className="detail-content">
              {project.file_path ? (
                // Make sure the file_path is a correct URL
                <a 
                  href={project.file_path} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download // This triggers the download behavior
                >
                  {project.file_path.split('/').pop()} {/* Display the file name, e.g. 'researchdocu.pdf' */}
                </a>
              ) : (
                'No Document Available'
              )}
            </p>
          </div>
            <div className="buttons-container">
              <div className="print-button">
                <Button onClick={handlePrintSummary}>
                  <FaPrint /> Print
                </Button>
              </div>

              <div className="bookmark-button">
                <Button variant={isBookmarked ? 'success' : 'secondary'} onClick={handleBookmark}>
                  <FaBookmark /> {isBookmarked ? 'Bookmarked' : 'Add to Bookmark'}
                </Button>
              </div>
            </div>
          </div>

          <div className="right-side">
            <img
              className="project-thumbnail"
              src={project?.thumbnail_url || cjclogo}
              alt="Project Thumbnail"
            />

            <div className="project-details">
              {/* Authors */}
              <div className="project-detail-item">
                <p className="detail-title">
                  <strong>{authors.length === 1 ? 'Author:' : 'Authors:'}</strong>
                </p>
                <p className="detail-content">
                  {authors.length > 0 ? authors.map((author, index) => (
                    <span key={author.author_id}>
                      <Link to={`/AuthorOverview/${encodeURIComponent(author.name)}`} className="author-link">
                        {author.name}
                      </Link>
                      {index < authors.length - 1 && ', '}
                    </span>
                  )) : 'N/A'}
                </p>
              </div>


              {/* Published Date */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Published Date:</strong></p>
                <p className="detail-content">
                  {project.publication_date 
                    ? new Date(project.publication_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) 
                    : 'N/A'}
                </p>
              </div>


              {/* Research Type */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Research Type:</strong></p>
                <p className="detail-content">{researchType ? researchType.name : 'N/A'}</p>
              </div>

              {/* Category */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Department:</strong></p>
                <p className="detail-content">{category ? category.name : 'N/A'}</p>
              </div>

              {/* Research Area */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Research Area:</strong></p>
                <p className="detail-content">{researchArea ? researchArea.name : 'N/A'}</p>
              </div>

              {/* Topic */}
              <div className="project-detail-item">
                <p className="detail-title"><strong>Topic:</strong></p>
                <p className="detail-content">{topic ? topic.name : 'N/A'}</p>
              </div>
            </div>
          </div>
=======
      
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
                        <Link to={`/AuthorOverview/${encodeURIComponent(author.name)}`} className="author-link">
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
                        <Link to={`/KeywordOverview/${encodeURIComponent(keyword.keyword)}`} className="keyword-link">
                          {keyword.keyword}
                        </Link>
                        {index < keywords.length - 1 && ', '}
                      </span>
                    ))
                  ) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td><strong>Departments</strong></td>
                <td>
                  {Array.isArray(category) && category.length > 0 ? (
                    category.map((categoryItem, index) => (
                      <span key={categoryItem.category_id}>
                        <Link to={`/DepartmentOverview/${categoryItem.category_id}`} className="category-link">
                          {categoryItem.name}
                        </Link>
                        {index < category.length - 1 && ', '}
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
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
        </div>
      </div>
    </>
  );
}

<<<<<<< HEAD
export default DocumentOverview;
=======
export default DocumentOverview;
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
