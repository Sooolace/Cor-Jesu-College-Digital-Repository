// DescribeWork.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/upload.css';
import { Uploadform } from './scripts/Uploadform';
import StepTracker from './components/steptracker';

function DescribeWork() {
  const navigate = useNavigate();
  const {
    title,
    setTitle,
    authors,
    setAuthors,
    handleAuthorChange,
    addAuthor,
    removeAuthor,
    abstract,
    setAbstract,
  } = Uploadform();

  const [pubMonth, setPubMonth] = useState('');
  const [pubDay, setPubDay] = useState('');
  const [pubYear, setPubYear] = useState('');
  const [descriptionType, setDescriptionType] = useState('abstract');
  const [keywords, setKeywords] = useState(['']); // Initialize with one empty keyword input

  const handleKeywordChange = (index, event) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = event.target.value;
    setKeywords(updatedKeywords);
  };

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const removeKeyword = (index) => {
    const updatedKeywords = [...keywords];
    updatedKeywords.splice(index, 1);
    setKeywords(updatedKeywords);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Format publication date as YYYY-MM-DD
    const publicationDate = `${pubYear}-${pubMonth.padStart(2, '0')}-${pubDay.padStart(2, '0')}`;

    // Prepare data for the project
    const projectData = {
      title,
      authors,
      description_type: descriptionType,
      abstract,
      publication_date: publicationDate,
      keywords: keywords.filter(keyword => keyword.trim() !== ''), // Ensure keywords are included
    };

    // Navigate to UploadFiles, passing projectData
    navigate('/admin/DescribeWork/upload-files', { state: { projectData } });
  };

  // Handle Cancel logic to redirect to /admindashboard
  const handleCancel = () => {
    navigate('/admindashboard'); // Redirect to /admindashboard
  };

  return (
    <div className="describe-work-container d-flex justify-content-center align-items-start gap-4 my-5">
      <StepTracker className="step-tracker" />
      <div className="upload-container">
        <section id="uploadSection">
          <h2 className="text-center mb-4">Describe Work</h2>
          <div className="author-underline mb-4"></div>
          <form onSubmit={handleSubmit}>
            {/* Project Title */}
            <div className="form-group mb-3">
              <label htmlFor="title" className="form-label">Project Title:</label>
              <input
                type="text"
                id="title"
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
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addAuthor}>
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
                    onChange={(e) => setDescriptionType(e.target.value)}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="abstractOption">Abstract</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id="descriptionOption"
                    name="descriptionType"
                    value="Project Description"
                    checked={descriptionType === 'description'}
                    onChange={(e) => setDescriptionType(e.target.value)}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="descriptionOption">Project Description</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    type="radio"
                    id="summaryOption"
                    name="descriptionType"
                    value="Executive Summary"
                    checked={descriptionType === 'summary'}
                    onChange={(e) => setDescriptionType(e.target.value)}
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
                {descriptionType === 'Project Description' && 'Project Description'}
                {descriptionType === 'Executive Summary' && 'Executive Summary'}
              </label>
              <textarea
                id="abstract"
                className="form-control"
                rows="4"
                placeholder={`Enter your ${descriptionType.replace('_', ' ')}`}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
              ></textarea>
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

            {/* Keywords */}
            <div className="form-group mb-3">
              <label className="form-label">Keywords:</label>
              <div id="keywordsList">
                {keywords.map((keyword, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter keyword"
                      value={keyword}
                      onChange={(e) => handleKeywordChange(index, e)}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeKeyword(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addKeyword}>
                Add Another Keyword
              </button>
            </div>

            {/* Button Container */}
            <div className="button-container d-flex justify-content-between">
              {/* Cancel button */}
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleCancel}
              >
                Cancel
              </button>

              {/* Submit button */}
              <button type="submit" className="btn-primary">
                Next: Upload Files
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default DescribeWork;


