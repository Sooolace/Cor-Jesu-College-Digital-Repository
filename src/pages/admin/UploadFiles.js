import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StepTracker from './components/steptracker';

function UploadFiles() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectData } = location.state; // Retrieve project data passed from DescribeWork

  const [file, setFile] = useState(null); // State to handle uploaded file
  const [studyUrls, setStudyUrls] = useState(projectData.study_urls || []); // Initialize with existing URLs if any
  const [newUrl, setNewUrl] = useState(''); // State for new URL input

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = JSON.parse(localStorage.getItem('uploadFilesFormData'));
    if (savedData) {
      setFile(savedData.file || null);
      setStudyUrls(savedData.studyUrls || []);
    }

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

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile); // Save the file if it's a PDF
    } else {
      alert('Please upload a valid PDF file.');
    }
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

    // Prepare project data to send to the confirmation page
    const updatedProjectData = {
      ...projectData,
      study_urls: studyUrls, // Add study URLs
      file_path: file, // Include the uploaded file if any
      keywords: projectData.keywords, // Ensure keywords are included
    };

    // Save form data to localStorage
    localStorage.setItem('uploadFilesFormData', JSON.stringify({ file, studyUrls }));

    // Navigate to confirmation page with project data
    navigate('/admin/DescribeWork/upload-files/Confirm', { state: { projectData: updatedProjectData } });
  };

  const handleCancel = () => {
    if (window.confirm('You have not completed uploading yet, are you sure you want to discontinue?')) {
      navigate('/admindashboard'); // Redirect to /admindashboard
    }
  };

  return (
    <div className="describe-work-container d-flex justify-content-center align-items-start gap-4 my-5">
      <StepTracker />
      <div className="upload-container">
        <section id="uploadSection">
          <h2 className="text-center mb-4">Upload Files</h2>
          <div className="author-underline mb-4"></div>
          <form onSubmit={handleConfirmSubmission} className="form-style">
            {/* File Upload */}
            <div className="form-group mb-3">
              <label htmlFor="file" className="form-label">Upload Project File:</label>
              <input
                type="file"
                id="file"
                className="form-control"
                accept=".pdf"
                onChange={handleFileChange}
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
                onClick={handleCancel} // Go back to the previous page
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
