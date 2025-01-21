import React, { useState } from 'react';
import './styles/upload.css';
import { Uploadform } from './scripts/Uploadform';

function UploadProject() {
  const {
    title,
    setTitle,
    authors,
    handleAuthorChange,
    addAuthor,
    removeAuthor,
    abstract,
    setAbstract,
    submissionDate,
    file,
    setFile,
    studyUrls,
    handleUrlChange,
    addUrl,
    removeUrl,
    handleSubmit
  } = Uploadform(); // Use the custom hook

  // Add a state for description type (Abstract, Project Description, or Executive Summary)
  const [descriptionType, setDescriptionType] = useState('abstract');

  // Handle radio button change
  const handleDescriptionTypeChange = (event) => {
    setDescriptionType(event.target.value);
  };

  // State to handle the new keyword and the list of added keywords
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordsList, setKeywordsList] = useState([]);

  // Handle adding a new keyword
  const addKeyword = () => {
    if (newKeyword.trim() !== '') {
      setKeywordsList([...keywordsList, newKeyword.trim()]);
      setNewKeyword(''); // Clear the input field after adding the keyword
    }
  };

  // Handle removing a keyword
  const removeKeyword = (indexToRemove) => {
    setKeywordsList(keywordsList.filter((_, index) => index !== indexToRemove));
  };

  // State to handle the publication date (Month, Day, Year)
  const [pubMonth, setPubMonth] = useState('');
  const [pubDay, setPubDay] = useState('');
  const [pubYear, setPubYear] = useState('');

  return (
    <div className="upload-container my-5">
      <section id="uploadSection">
        <h2 className="text-center mb-4">Describe Items</h2>
        <form onSubmit={handleSubmit}>

          {/* Project Title */}
          <div className="form-group mb-3">
            <label htmlFor="title" className="form-label">Project Title:</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              className="form-control" 
              placeholder="Enter project title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          {/* Multiple Authors */}
          <div className="form-group mb-3">
            <label className="form-label">Author(s) Name:</label>
            <div id="authorList">
              {authors.map((author, index) => (
                <div key={index} className="input-group mb-2">
                  <input 
                    type="text" 
                    name={`author[${index}]`} 
                    className="form-control" 
                    placeholder="Enter author name" 
                    value={author} 
                    onChange={(e) => handleAuthorChange(index, e)}
                    required 
                  />
                  {index > 0 && (
                    <button 
                      type="button" 
                      className="btn btn-outline-danger" 
                      onClick={() => removeAuthor(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" id="addAuthor" className="btn btn-outline-secondary btn-sm" onClick={addAuthor}>
              Add Another Author
            </button>
          </div>

          {/* Radio Buttons for Description Type */}
          <div className="form-group mb-3">
            <label className="form-label">Select Description Type:</label>
            <div>
              <div className="form-check form-check-inline">
                <input 
                  type="radio" 
                  id="abstractOption" 
                  name="descriptionType" 
                  value="abstract"
                  checked={descriptionType === 'abstract'}
                  onChange={handleDescriptionTypeChange}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="abstractOption">Abstract</label>
              </div>
              <div className="form-check form-check-inline">
                <input 
                  type="radio" 
                  id="descriptionOption" 
                  name="descriptionType" 
                  value="description"
                  checked={descriptionType === 'description'}
                  onChange={handleDescriptionTypeChange}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="descriptionOption">Project Description</label>
              </div>
              <div className="form-check form-check-inline">
                <input 
                  type="radio" 
                  id="summaryOption" 
                  name="descriptionType" 
                  value="summary"
                  checked={descriptionType === 'summary'}
                  onChange={handleDescriptionTypeChange}
                  className="form-check-input"
                />
                <label className="form-check-label" htmlFor="summaryOption">Executive Summary</label>
              </div>
            </div>
          </div>

          {/* Dynamic Description Field */}
          <div className="form-group mb-3">
            <label htmlFor="abstract" className="form-label">
              {descriptionType === 'abstract' && 'Abstract'}
              {descriptionType === 'description' && 'Project Description'}
              {descriptionType === 'summary' && 'Executive Summary'}
            </label>
            <textarea 
              id="abstract" 
              name="abstract" 
              className="form-control" 
              rows="4" 
              placeholder={`Enter your ${descriptionType.replace('_', ' ')}`} 
              value={abstract} 
              onChange={(e) => setAbstract(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Date of Submission */}
          <div className="form-group mb-3">
            <label htmlFor="date" className="form-label">Date of Submission:</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              className="form-control" 
              value={submissionDate} 
              readOnly 
            />
          </div>

          {/* Publication Date: Month, Day, Year Fields */}
          <div className="form-group mb-3">
            <label className="form-label">Publication Date:</label>
            <div className="d-flex gap-2">
              <input 
                type="number" 
                name="pub_month" 
                className="form-control" 
                placeholder="Month" 
                min="1" 
                max="12" 
                value={pubMonth} 
                onChange={(e) => setPubMonth(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                name="pub_day" 
                className="form-control" 
                placeholder="Day" 
                min="1" 
                max="31" 
                value={pubDay} 
                onChange={(e) => setPubDay(e.target.value)} 
                required 
              />
              <input 
                type="number" 
                name="pub_year" 
                className="form-control" 
                placeholder="Year" 
                min="1900" 
                value={pubYear} 
                onChange={(e) => setPubYear(e.target.value)} 
                required 
              />
            </div>
          </div>

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
                Add
              </button>
            </div>
            {/* Display Added Keywords */}
            {keywordsList.length > 0 && (
              <div className="keywords-list">
                {keywordsList.map((keyword, index) => (
                  <div key={index} className="input-group mb-2">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={keyword} 
                      readOnly 
                    />
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => removeKeyword(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button type="submit" className="btn-primary">Upload</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default UploadProject;
