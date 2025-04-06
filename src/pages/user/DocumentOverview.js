import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { FaArrowLeft, FaBookmark, FaPrint, FaDownload, FaLock } from 'react-icons/fa';  // Add FaLock for the lock icon
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'; 
import './styles/documentoverview.css';
import Breadcrumb from '../../components/BreadCrumb';
import cjclogo from '../../../src/assets/cjclogo.PNG'; 

function DocumentOverview() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [researchType, setResearchType] = useState(null);
  const [category, setCategory] = useState(null);
  const [researchArea, setResearchArea] = useState(null);
  const [topic, setTopic] = useState(null);
  const [department, setDepartment] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userId = localStorage.getItem('user_id');
  
  // Hidden view tracking variables - these stay in the background
  const [viewInfo, setViewInfo] = useState(null);
  const [viewStatus, setViewStatus] = useState('pending');
  const [viewCompleted, setViewCompleted] = useState(false);

  // Function to track views in the background
  const trackPageView = async () => {
    try {
      // Start view tracking
      const response = await fetch(`/api/projects/startview/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.alreadyCounted) return;
      
      // Record view info for completion
      const viewId = data.view_id;
      setViewInfo({ viewId, startTime: Date.now() });
      setViewStatus('tracking');
      
      // Set up completion after 10 seconds
      setTimeout(() => {
        completeView(viewId);
      }, 10000);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };
  
  // Function to complete the view tracking
  const completeView = async (viewId) => {
    if (viewCompleted || !viewInfo) return;
    
    try {
      setViewCompleted(true);
      const duration = Math.floor((Date.now() - viewInfo.startTime) / 1000);
      
      if (duration >= 10) {
        await fetch(`/api/projects/completeview/${viewId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration })
        });
      }
    } catch (error) {
      console.error('Error completing view:', error);
    }
  };

  // Check bookmark status
  const checkBookmarkStatus = async () => {
    if (!isLoggedIn || !userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookmarks/check/${userId}/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
        return data.isBookmarked;
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token && (role === 'user' || role === 'admin'));
    
    const fetchData = async () => {
      try {
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
        
        // Track the page view after data is loaded
        trackPageView();
      } catch (err) {
        console.error(err);
        setError('Failed to load project or related data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function for view tracking
    return () => {
      if (viewInfo && !viewCompleted && viewStatus === 'tracking') {
        completeView(viewInfo.viewId);
      }
    };
  }, [projectId]);
  
  // Check bookmark status when logged in status changes
  useEffect(() => {
    if (isLoggedIn && projectId) {
      checkBookmarkStatus();
    }
  }, [isLoggedIn, projectId]);

  // Add beforeunload event listener to complete view when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (viewInfo && !viewCompleted && viewStatus === 'tracking') {
        completeView(viewInfo.viewId);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [viewInfo, viewCompleted, viewStatus]);

  // Check if we're returning from login
  useEffect(() => {
    // If we have state indicating we're returning from login with preserved state
    if (location.state?.preserveLogin) {
      // Check if the user is now logged in
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const loggedIn = !!token && (role === 'user' || role === 'admin');
      setIsLoggedIn(loggedIn);
      
      // Check if there was a pending bookmark request
      const pendingBookmarkProjectId = sessionStorage.getItem('pendingBookmarkProjectId');
      
      if (loggedIn && pendingBookmarkProjectId && pendingBookmarkProjectId === projectId) {
        console.log('Processing pending bookmark after login');
        
        // Clear the pending bookmark
        sessionStorage.removeItem('pendingBookmarkProjectId');
        
        // Check bookmark status first, then bookmark if needed
        checkBookmarkStatus().then(isAlreadyBookmarked => {
          if (!isAlreadyBookmarked) {
            // Small delay to ensure userId is available
            setTimeout(() => {
              handleBookmark();
            }, 500);
          }
        });
      }
      
      // Clear the navigation state to prevent issues with future navigation
      window.history.replaceState({}, '');
    }
  }, [location]);

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
  
  const handleBookmark = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !userId) {
      console.log('User not logged in or user ID missing. Login status:', isLoggedIn, 'User ID:', userId);
      
      // Store the current project ID in sessionStorage so we can bookmark it after login
      sessionStorage.setItem('pendingBookmarkProjectId', projectId);
      
      // Show a more specific message or redirect to login
      alert('Please log in to bookmark this project');
      redirectToLogin();
      return;
    }
    
    // Validate userId and projectId
    if (!projectId) {
      console.error('Missing project ID:', { projectId });
      return;
    }
    
    console.log('Bookmark data:', { 
      userId, 
      projectId, 
      isBookmarked,
      apiUrl: isBookmarked 
        ? `http://localhost:5000/api/bookmarks/${userId}/${projectId}`
        : 'http://localhost:5000/api/bookmarks'
    });
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        console.log('Attempting to remove bookmark...');
        const response = await fetch(`http://localhost:5000/api/bookmarks/${userId}/${projectId}`, {
          method: 'DELETE'
        });

        const responseData = await response.json();
        console.log('Delete bookmark response:', responseData);

        if (!response.ok) {
          throw new Error(`Failed to remove bookmark: ${responseData.error || response.statusText}`);
        }
        setIsBookmarked(false);
      } else {
        // Add bookmark
        console.log('Attempting to add bookmark...');
        // Make sure we're sending integers, not strings
        const postData = {
          admin_id: parseInt(userId),
          project_id: parseInt(projectId)
        };
        
        console.log('POST data:', postData);
        
        const response = await fetch('http://localhost:5000/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });

        try {
          const responseData = await response.json();
          console.log('Add bookmark response:', responseData);
          
          if (!response.ok) {
            throw new Error(`Failed to add bookmark: ${responseData.error || responseData.message || response.statusText}`);
          }
        } catch (jsonError) {
          console.error('Error parsing response JSON:', jsonError);
          throw new Error(`Failed to add bookmark: ${response.statusText}`);
        }
        
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleBackToSearch = () => {
    if (location.state?.fromSearch) {
      navigate(-1);
    } else {
      navigate('/search');
    }
  };

  // Function to redirect to login page
  const redirectToLogin = () => {
    console.log('Redirecting to login. Current auth status:', {
      token: localStorage.getItem('token') ? 'exists' : 'missing',
      role: localStorage.getItem('role'),
      userId: localStorage.getItem('user_id'),
      username: localStorage.getItem('username')
    });
    
    // Navigate to login page with information about where to return to
    navigate('/login', { 
      state: { 
        from: location.pathname,
        preserveLogin: true,
        returnToDocument: true,
        projectToBookmark: projectId
      } 
    });
  };

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

  return (
    <>
      <div className="breadcrumb-container">
        <Breadcrumb
          items={[ 
            { label: 'Home', link: '/' },
            { label: 'Theses and Dissertations', link: '/AllWorks' },
            { label: 'Document Overview', link: '#' }
          ]}
        />
      </div>

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
            
            {/* Downloadable File - Only shown if logged in */}
            <div className="project-detail-item downloadable-file-section">
              <p className="detail-title"><strong>Downloadable File:</strong></p>
              <p className="detail-content">
                {isLoggedIn ? (
                  project.file_path ? (
                    <div className="download-button-container">
                      <a 
                        href={`http://localhost:5000/downloads/${encodeURIComponent(project.file_path.split('/').pop())}`} 
                        download
                        className="download-link"
                      >
                        <FaDownload /> 
                        <span className="download-filename">{project.file_path.split('/').pop()}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="no-document-message">
                      No Document Available
                    </div>
                  )
                ) : (
                  <div className="login-prompt">
                    <FaLock /> <span>Please <a onClick={(e) => {
                      e.preventDefault();
                      redirectToLogin();
                    }} className="login-link" style={{cursor: 'pointer'}}>login</a> to access downloadable files</span>
                  </div>
                )}
              </p>
            </div>
            
            <div className="buttons-container">
              <div className="print-button">
                <Button onClick={handlePrintSummary}>
                  <FaPrint /> Print
                </Button>
              </div>
              <div className="bookmark-button-container">
                <Button 
                  onClick={handleBookmark}
                  variant={isBookmarked ? "warning" : "outline-warning"}
                  className="bookmark-btn"
                  title={isLoggedIn ? (isBookmarked ? "Remove from bookmarks" : "Add to bookmarks") : "Sign in to bookmark"}
                  style={{
                    backgroundColor: isBookmarked ? '#FACC15' : 'transparent',
                    borderColor: '#FACC15',
                    color: isBookmarked ? '#000' : '#000'
                  }}
                >
                  <FaBookmark /> {isBookmarked ? "Bookmarked" : "Bookmark"}
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
        </div>
      </div>
    </>
  );
}

export default DocumentOverview;
