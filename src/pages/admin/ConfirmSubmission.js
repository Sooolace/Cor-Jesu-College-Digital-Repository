import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StepTracker from './components/steptracker';
import axios from 'axios';

function ConfirmSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData; // Retrieve project data

  useEffect(() => {
    // Add beforeunload event listener
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'You have not completed uploading yet, are you sure you want to discontinue?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleConfirm = async () => {
    try {
      // Create FormData for the project upload
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description_type', projectData.description_type);
      formData.append('abstract', projectData.abstract);
      formData.append('publication_date', projectData.publication_date);
      
      // Check if projectData has the actual file object
      if (projectData.file_path && projectData.file_path instanceof File) {
        formData.append('file_path', projectData.file_path); // Attach the actual file object
      } else {
        formData.append('file_path', ''); // Append an empty string if no file is uploaded
      }

      // Append study URLs as JSON strings
      formData.append('study_urls', JSON.stringify(projectData.study_urls));

      // Step 1: Submit the project data
      const projectResponse = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const projectId = projectResponse.data.project_id; // Get the project ID from the response

      // Step 2: Submit authors
      for (const author of projectData.authors) {
        let authorId;
        try {
          const authorResponse = await axios.post('http://localhost:5000/api/authors', { name: author.name });
          authorId = authorResponse.data.author_id; // Get the author ID from the response
        } catch (error) {
          if (error.response && error.response.status === 400 && error.response.data.error === 'Author with this name already exists') {
            // Fetch the existing author ID
            const existingAuthorResponse = await axios.get(`http://localhost:5000/api/authors/name/${author.name}`);
            authorId = existingAuthorResponse.data.author_id;
          } else {
            throw error;
          }
        }

        // Link project and author
        await axios.post('http://localhost:5000/api/project_authors', { project_id: projectId, author_id: authorId });
      }

      // Step 3: Submit keywords
      for (const keyword of projectData.keywords) {
        let keywordId;
        try {
          const keywordResponse = await axios.post('http://localhost:5000/api/keywords', { keyword: keyword.name });
          keywordId = keywordResponse.data.keyword_id; // Assuming the response has a keyword_id field
        } catch (error) {
          if (error.response && error.response.status === 400 && error.response.data.error === 'Keyword with this name already exists') {
            // Fetch the existing keyword ID
            const existingKeywordResponse = await axios.get(`http://localhost:5000/api/keywords/by-name/${keyword.name}`);
            keywordId = existingKeywordResponse.data.keyword_id;
          } else {
            throw error;
          }
        }

        // Link project and keyword
        await axios.post('http://localhost:5000/api/project_keywords', { project_id: projectId, keyword_id: keywordId });
      }

      // Clear saved form data from localStorage
      localStorage.removeItem('describeWorkFormData');
      localStorage.removeItem('uploadFilesFormData');

      alert('Submission Confirmed!');
      navigate('/');
    } catch (error) {
      console.error('Error confirming submission:', error.response ? error.response.data : error.message);
      alert('An error occurred while confirming your submission. Please try again.');
    }
  };

  const handleCancel = () => {
    // Go back to the previous page
    navigate(-1);
  };

  return (
    <div className="describe-work-container d-flex justify-content-center align-items-start gap-4 my-5">
      <StepTracker />
      <div className="upload-container">
        <section id="confirmSection">
          <h2 className="text-center mb-4">Confirm Submission</h2>
          <div className="author-underline mb-4"></div>
          {projectData ? (
            <>
              <p>Please review your submission before confirming.</p>
              <p><strong>Title:</strong> {projectData.title}</p>
              <p><strong>Authors:</strong> {projectData.authors?.length > 0 ? projectData.authors.map(author => author.name).join(', ') : 'N/A'}</p>
              <p><strong>Type:</strong> {projectData.description_type}</p>
              <p><strong>Description:</strong> {projectData.abstract}</p>
              <p><strong>Keywords:</strong> {projectData.keywords && projectData.keywords.length > 0 ? projectData.keywords.map(keyword => keyword.name).join(', ') : 'N/A'}</p>
              <p><strong>Study Url:</strong> {projectData.study_urls?.length > 0 ? projectData.study_urls.join(', ') : 'N/A'}</p>
              <p><strong>File:</strong> {projectData.file_path?.name || 'No file selected'}</p>
            </>
          ) : (
            <p>No submission data available. Please ensure all steps are completed properly.</p>
          )}
          <div className="button-container d-flex justify-content-between">
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn-primary">
              Confirm Submission
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ConfirmSubmission;
