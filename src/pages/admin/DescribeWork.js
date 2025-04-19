// DescribeWork.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/upload.css';
import { Uploadform } from './scripts/Uploadform';
import StepTracker from './components/steptracker';
import Select from 'react-select';
import { FaUserPlus, FaTag } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import AddNewAuthor from './components/addNewAuthor';
import AddNewKeyword from './components/AddNewKeyword';

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
  const [allAuthors, setAllAuthors] = useState([]);
  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [authorsRefresh, setAuthorsRefresh] = useState(0);
  const [keywordsRefresh, setKeywordsRefresh] = useState(0);

  // Fetch all authors and keywords
  const fetchAuthorsAndKeywords = async () => {
    try {
      const authorsResponse = await fetch('/api/authors');
      const authorsData = await authorsResponse.json();
      setAllAuthors(authorsData);

      const keywordsResponse = await fetch('/api/keywords');
      const keywordsData = await keywordsResponse.json();
      setAllKeywords(keywordsData);
    } catch (error) {
      console.error('Error fetching authors or keywords:', error);
    }
  };

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = JSON.parse(localStorage.getItem('describeWorkFormData'));
    if (savedData) {
      setTitle(savedData.title || '');
      setAuthors(savedData.authors || ['']);
      setAbstract(savedData.abstract || '');
      setPubMonth(savedData.pubMonth || '');
      setPubDay(savedData.pubDay || '');
      setPubYear(savedData.pubYear || '');
      setDescriptionType(savedData.descriptionType || 'abstract');
      setSelectedAuthors(savedData.authors || []);
      setSelectedKeywords(savedData.keywords || []);
    }

    fetchAuthorsAndKeywords();

    // Add beforeunload event listener
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'You have not completed uploading yet, are you sure you want to discontinue?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [setTitle, setAuthors, setAbstract]);

  const handleAuthorSelectChange = (selected) => {
    setSelectedAuthors(selected ? selected.map(author => author.value) : []);
  };

  const handleKeywordChange = (selected) => {
    setSelectedKeywords(selected ? selected.map(keyword => keyword.value) : []);
  };

  const authorOptions = allAuthors.map(author => ({
    value: author.author_id,
    label: author.name
  }));

  const keywordOptions = allKeywords.map(keyword => ({
    value: keyword.keyword_id,
    label: keyword.keyword
  }));

  const handleSubmit = (event) => {
    event.preventDefault();

    // Format publication date as YYYY-MM-DD
    const publicationDate = `${pubYear}-${pubMonth.padStart(2, '0')}-${pubDay.padStart(2, '0')}`;

    // Prepare data for the project
    const projectData = {
      title,
      authors: selectedAuthors.map(authorId => {
        const author = allAuthors.find(a => a.author_id === authorId);
        return { id: authorId, name: author ? author.name : '' };
      }),
      description_type: descriptionType,
      abstract,
      publication_date: publicationDate,
      keywords: selectedKeywords.map(keywordId => {
        const keyword = allKeywords.find(k => k.keyword_id === keywordId);
        return { id: keywordId, name: keyword ? keyword.keyword : '' };
      }),
    };

    // Save form data to localStorage
    localStorage.setItem('describeWorkFormData', JSON.stringify(projectData));

    // Navigate to UploadFiles, passing projectData
    navigate('/admin/DescribeWork/upload-files', { state: { projectData } });
  };

  // Handle Cancel logic to redirect to /admindashboard
  const handleCancel = () => {
    if (window.confirm('You have not completed uploading yet, are you sure you want to discontinue?')) {
      navigate('/admindashboard'); // Redirect to /admindashboard
    }
  };

  const handleShowAuthorModal = () => setShowAuthorModal(true);
  const handleCloseAuthorModal = () => setShowAuthorModal(false);
  const handleShowKeywordModal = () => setShowKeywordModal(true);
  const handleCloseKeywordModal = () => setShowKeywordModal(false);

  // Refresh authors list when new author is added
  useEffect(() => {
    if (authorsRefresh > 0) {
      fetchAuthorsAndKeywords();
    }
  }, [authorsRefresh]);

  // Refresh keywords list when new keyword is added
  useEffect(() => {
    if (keywordsRefresh > 0) {
      fetchAuthorsAndKeywords();
    }
  }, [keywordsRefresh]);

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
                style={{ border: '1px solid #ced4da' }}
              />
            </div>

            {/* Multiple Authors */}
            <div className="form-group mb-3">
              <label className="form-label">Author(s) Name:</label>
              <div className="d-flex gap-2">
                <Select
                  isMulti
                  options={authorOptions}
                  value={authorOptions.filter(option => selectedAuthors.includes(option.value))}
                  onChange={handleAuthorSelectChange}
                  isClearable
                  placeholder="Select authors..."
                  className="flex-grow-1"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#a33307',
                      primary25: 'rgba(163, 51, 7, 0.1)',
                      primary50: 'rgba(163, 51, 7, 0.2)',
                      primary75: 'rgba(163, 51, 7, 0.3)',
                    },
                  })}
                />
                <button 
                  type="button" 
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleShowAuthorModal}
                  style={{ 
                    whiteSpace: 'nowrap', 
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  <FaUserPlus /> Add
                </button>
              </div>
            </div>

            {/* Radio Buttons for Description Type */}
            <div className="form-group mb-3 description-type-container">
              <label className="form-label">Select Description Type:</label>
              <div className="description-type-options">
                <div className="description-type-option">
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
                <div className="description-type-option">
                  <input
                    type="radio"
                    id="descriptionOption"
                    name="descriptionType"
                    value="description"
                    checked={descriptionType === 'description'}
                    onChange={(e) => setDescriptionType(e.target.value)}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="descriptionOption">Project Description</label>
                </div>
                <div className="description-type-option">
                  <input
                    type="radio"
                    id="summaryOption"
                    name="descriptionType"
                    value="summary"
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
                {descriptionType === 'description' && 'Project Description'}
                {descriptionType === 'summary' && 'Executive Summary'}
              </label>
              <textarea
                id="abstract"
                className="form-control"
                rows="4"
                placeholder={`Enter your ${
                  descriptionType === 'abstract' ? 'Abstract' :
                  descriptionType === 'description' ? 'Project Description' :
                  'Executive Summary'
                }`}
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Publication Date */}
            <div className="form-group mb-3">
              <label className="form-label">Publication Date:</label>
              <input
                type="date"
                className="form-control"
                value={pubYear && pubMonth && pubDay ? `${pubYear}-${pubMonth.padStart(2, '0')}-${pubDay.padStart(2, '0')}` : ''}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const [year, month, day] = date.split('-');
                    setPubYear(year);
                    setPubMonth(month);
                    setPubDay(day);
                  } else {
                    setPubYear('');
                    setPubMonth('');
                    setPubDay('');
                  }
                }}
                required
                style={{ 
                  border: '1px solid #ced4da',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  height: '48px',
                  width: '100%',
                  maxWidth: '300px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a33307';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(163, 51, 7, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ced4da';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              />
              <small className="text-muted d-block mt-2">Select the publication date</small>
            </div>

            {/* Keywords */}
            <div className="form-group mb-3">
              <label className="form-label">Keywords:</label>
              <div className="d-flex gap-2">
                <Select
                  isMulti
                  options={keywordOptions}
                  value={keywordOptions.filter(option => selectedKeywords.includes(option.value))}
                  onChange={handleKeywordChange}
                  isClearable
                  placeholder="Select keywords..."
                  className="flex-grow-1"
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#a33307',
                      primary25: 'rgba(163, 51, 7, 0.1)',
                      primary50: 'rgba(163, 51, 7, 0.2)',
                      primary75: 'rgba(163, 51, 7, 0.3)',
                    },
                  })}
                />
                <button 
                  type="button" 
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleShowKeywordModal}
                  style={{ 
                    whiteSpace: 'nowrap', 
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  <FaTag /> Add
                </button>
              </div>
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

            {/* Add New Author Modal */}
            <Modal
              show={showAuthorModal}
              onHide={handleCloseAuthorModal}
              centered
              backdrop="static"
              className="add-author-modal"
            >
              <Modal.Header closeButton style={{ backgroundColor: '#a33307', color: 'white' }}>
                <Modal.Title>
                  <FaUserPlus className="me-2" /> Add New Author
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4">
                <AddNewAuthor onHide={() => {
                  handleCloseAuthorModal();
                  setAuthorsRefresh(prev => prev + 1);
                }} />
              </Modal.Body>
            </Modal>

            {/* Add New Keyword Modal */}
            <Modal
              show={showKeywordModal}
              onHide={handleCloseKeywordModal}
              centered
              backdrop="static"
              className="add-keyword-modal"
            >
              <Modal.Header closeButton style={{ backgroundColor: '#a33307', color: 'white' }}>
                <Modal.Title>
                  <FaTag className="me-2" /> Add New Keyword
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-4">
                <AddNewKeyword onHide={() => {
                  handleCloseKeywordModal();
                  setKeywordsRefresh(prev => prev + 1);
                }} />
              </Modal.Body>
            </Modal>
          </form>
        </section>
      </div>
    </div>
  );
}

export default DescribeWork;


