import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepTracker from './components/steptracker';

function UploadFiles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectData } = location.state; // Retrieve project data passed from DescribeWork

  const [file, setFile] = useState(null); // State to handle uploaded file
  const [studyUrls, setStudyUrls] = useState(projectData.study_urls || []); // Initialize with existing URLs if any
  const [newUrl, setNewUrl] = useState(''); // State for new URL input

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUrlChange = (e) => {
    setNewUrl(e.target.value);
  };

  const addUrl = () => {
    if (newUrl.trim() !== '') {
      setStudyUrls([...studyUrls, newUrl.trim()]);
      setNewUrl(''); // Clear input field after adding URL
    }
  };

  const removeUrl = (indexToRemove) => {
    setStudyUrls(studyUrls.filter((_, index) => index !== indexToRemove));
  };

  const handleConfirmSubmission = (e) => {
    e.preventDefault();
    
    // Check if a file is uploaded
    if (!file) {
      alert('Please upload a project file before proceeding.');
      return;
    }
    
    // Prepare project data to send to the confirmation page
    const updatedProjectData = {
      ...projectData,
      study_urls: studyUrls, // Add study URLs
      file_path: file // Include the uploaded file
    };

    // Navigate to confirmation page with project data
    navigate('/admin/DescribeWork/upload-files/Confirm', { state: { projectData: updatedProjectData } });
  };

  return (
    <div className="describe-work-container d-flex justify-content-center align-items-start gap-4 my-5">
      <StepTracker />
      <div className="upload-container">
        <section id="uploadSection">
          <h2 className="text-center mb-4">Upload Files</h2>
          {projectData ? (
            <>
              <p><strong>Title:</strong> {projectData.title}</p>
              <p><strong>Authors:</strong> {projectData.authors?.length > 0 ? projectData.authors.join(', ') : 'N/A'}</p>
              <p><strong>Type:</strong> {projectData.description_type}</p>
              <p><strong>Description:</strong> {projectData.abstract}</p>
              <p><strong>Keywords:</strong> {projectData.keywords?.length > 0 ? projectData.keywords.join(', ') : 'N/A'}</p>
              <p><strong>Study Url:</strong> {projectData.study_urls?.length > 0 ? projectData.study_urls.join(', ') : 'N/A'}</p>
            </>
          ) : (
            <p>No submission data available. Please ensure all steps are completed properly.</p>
          )}
          <form onSubmit={handleConfirmSubmission} className="form-style">
            {/* File Upload */}
            <div className="form-group mb-3">
              <label htmlFor="file" className="form-label">Upload Project File:</label>
              <input
                type="file"
                id="file"
                className="form-control"
                accept=".pdf, .doc, .docx"
                onChange={handleFileChange}
                required
              />
            </div>

            {/* Multiple Study URLs */}
            <div className="form-group mb-3">
              <label className="form-label">Study URL(s) (Optional):</label>
              <div className="input-group mb-2">
                <input
                  type="url"
                  className="form-control"
                  placeholder="Enter study URL"
                  value={newUrl}
                  onChange={handleUrlChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addUrl}
                >
                  Add
                </button>
              </div>
              {/* Display Added URLs */}
              {studyUrls.length > 0 && (
                <div className="keywords-list">
                  {studyUrls.map((url, index) => (
                    <div key={index} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={url}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeUrl(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Button Container */}
            <div className="button-container d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)} // Go back to the previous page
              >
                Cancel
              </button>
              <div className="d-flex align-items-center">
                <button type="submit" className="btn-primary">Confirm Submission</button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default UploadFiles;