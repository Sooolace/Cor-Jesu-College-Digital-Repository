import React, { useState, useEffect } from 'react';
import './styles/upload.css';

function UploadDetails() {
  const [file, setFile] = useState(null);
  const [studyUrls, setStudyUrls] = useState(['']);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [projectData, setProjectData] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('projectData'));
    setProjectData(data || {});
  }, []);

  // Handle adding/removing URLs
  const addUrl = () => setStudyUrls([...studyUrls, '']);
  const removeUrl = (index) => setStudyUrls(studyUrls.filter((_, i) => i !== index));
  const handleUrlChange = (index, event) => {
    const updatedUrls = [...studyUrls];
    updatedUrls[index] = event.target.value;
    setStudyUrls(updatedUrls);
  };

  // Handle adding/removing keywords
  const addKeyword = () => {
    if (newKeyword.trim() !== '') {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword(''); // Clear input field
    }
  };
  const removeKeyword = (index) => setKeywords(keywords.filter((_, i) => i !== index));

  // Final submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...projectData, // Passed from the previous page
      file,
      studyUrls,
      keywords,
    };

    console.log('Final form data:', formData);
    // Send data to backend (e.g., via API)
  };

  return (
    <div className="upload-container my-5">
      <section id="uploadSection">
        <h2 className="text-center mb-4">Upload File, URLs, and Keywords</h2>
        <form onSubmit={handleSubmit}>

          {/* File Upload */}
          <div className="form-group mb-3">
            <label htmlFor="file" className="form-label">Upload Project File:</label>
            <input 
              type="file" 
              id="file" 
              name="file" 
              className="form-control" 
              accept=".pdf, .doc, .docx" 
              onChange={(e) => setFile(e.target.files[0])}
              required 
            />
          </div>

          {/* Multiple Study URLs */}
          <div className="form-group mb-3">
            <label className="form-label">Study URL(s) (Optional):</label>
            {studyUrls.map((url, index) => (
              <div key={index} className="input-group mb-2">
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="Enter study URL" 
                  value={url} 
                  onChange={(e) => handleUrlChange(index, e)}
                />
                {index > 0 && (
                  <button 
                    type="button" 
                    className="btn btn-outline-danger" 
                    onClick={() => removeUrl(index)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addUrl}>
              Add Another URL
            </button>
          </div>

          {/* Keywords */}
          <div className="form-group mb-3">
            <label htmlFor="keywords" className="form-label">Keywords (Optional):</label>
            <div className="input-group mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter keyword" 
                value={newKeyword} 
                onChange={(e) => setNewKeyword(e.target.value)} 
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={addKeyword}
              >
                Add Keyword
              </button>
            </div>
            <ul>
              {keywords.map((keyword, index) => (
                <li key={index}>
                  {keyword} 
                  <button 
                    type="button" 
                    className="btn btn-outline-danger btn-sm ms-2" 
                    onClick={() => removeKeyword(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button type="submit" className="btn-primary">Submit Final Details</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default UploadDetails;
