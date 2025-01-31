import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StepTracker from './components/steptracker';
import axios from 'axios';

function ConfirmSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectData = location.state?.projectData; // Retrieve project data

  const handleConfirm = async () => {
    try {
      // Create FormData for the project upload
      const formData = new FormData();
      formData.append('title', projectData.title);
      formData.append('description_type', projectData.description_type);
      formData.append('abstract', projectData.abstract);
      formData.append('publication_date', projectData.publication_date);
<<<<<<< HEAD
      
      // Check if projectData has the actual file object
      if (projectData.file_path && projectData.file_path instanceof File) {
        formData.append('file_path', projectData.file_path); // Attach the actual file object
      } else {
        alert('No file selected or invalid file type.');
        return;
      }
  
      console.log('FormData:', formData);
  
      // Step 1: Submit the project data
      const projectResponse = await axios.post('http://localhost:5000/api/projects/upload', formData, {
=======
      formData.append('file_path', projectData.file_path); // Attach the uploaded file

      console.log('FormData:', formData);

      // Step 1: Submit the project data
      const projectResponse = await axios.post('http://localhost:5000/api/projects', formData, {
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
<<<<<<< HEAD
      
  
      const projectId = projectResponse.data.project_id; // Get the project ID from the response
  
=======

      const projectId = projectResponse.data.project_id; // Get the project ID from the response

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      // Step 2: Submit authors
      for (const author of projectData.authors) {
        const authorResponse = await axios.post('http://localhost:5000/api/authors', { name: author });
        const authorId = authorResponse.data.author_id; // Get the author ID from the response
<<<<<<< HEAD
  
        // Link project and author
        await axios.post('http://localhost:5000/api/project_authors', { project_id: projectId, author_id: authorId });
      }
  
=======

        // Link project and author
        await axios.post('http://localhost:5000/api/project_authors', { project_id: projectId, author_id: authorId });
      }

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      // Step 3: Submit keywords
      for (const keyword of projectData.keywords) {
        const keywordResponse = await axios.post('http://localhost:5000/api/keywords', { keyword });
        const keywordId = keywordResponse.data.keyword_id; // Assuming the response has a keyword_id field
<<<<<<< HEAD
  
        // Link project and keyword
        await axios.post('http://localhost:5000/api/project_keywords', { project_id: projectId, keyword_id: keywordId });
      }
  
=======

        // Link project and keyword
        await axios.post('http://localhost:5000/api/project_keywords', { project_id: projectId, keyword_id: keywordId });
      }

>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
      alert('Submission Confirmed!');
      navigate('/');
    } catch (error) {
      console.error('Error confirming submission:', error);
      alert('An error occurred while confirming your submission. Please try again.');
    }
  };
<<<<<<< HEAD
  
  
=======
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137

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
<<<<<<< HEAD
          <div className="author-underline mb-4"></div>
=======
>>>>>>> dc92e3ca00b33cf3b6ff8dc3d822cdef96c45137
          {projectData ? (
            <>
              <p>Please review your submission before confirming.</p>
              <p><strong>Title:</strong> {projectData.title}</p>
              <p><strong>Authors:</strong> {projectData.authors?.length > 0 ? projectData.authors.join(', ') : 'N/A'}</p>
              <p><strong>Type:</strong> {projectData.description_type}</p>
              <p><strong>Description:</strong> {projectData.abstract}</p>
              <p><strong>Keywords:</strong> {projectData.keywords && projectData.keywords.length > 0 ? projectData.keywords.join(', ') : 'N/A'}</p>
              <p><strong>Study Url:</strong> {projectData.study_urls?.length > 0 ? projectData.study_urls.join(', ') : 'N/A'}</p>
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
