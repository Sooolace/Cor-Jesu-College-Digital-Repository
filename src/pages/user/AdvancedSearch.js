import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/advancedsearch.css';

function AdvancedSearch() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState(['']);
  const [keywords, setKeywords] = useState(['']);
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...authors];
    newAuthors[index] = value;
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, '']);
  };

  const removeAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const addKeyword = () => {
    setKeywords([...keywords, '']);
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    // For now, just navigate back to the search results page
    navigate('/search-results', {
      state: {
        title,
        authors,
        keywords,
        abstract,
        category,
        startDate,
        endDate,
      },
    });
  };

  return (
    <div className="advanced-search-container">
      <h2 className="text-center mb-4">Advanced Search</h2>
      <form onSubmit={handleSearch}>
        <div className="form-group mb-3">
          <label htmlFor="title" className="form-label">Title:</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Authors:</label>
          {authors.map((author, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={author}
                onChange={(e) => handleAuthorChange(index, e.target.value)}
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
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addAuthor}>
            Add Another Author
          </button>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Keywords:</label>
          {keywords.map((keyword, index) => (
            <div key={index} className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={keyword}
                onChange={(e) => handleKeywordChange(index, e.target.value)}
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
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addKeyword}>
            Add Another Keyword
          </button>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="abstract" className="form-label">Abstract:</label>
          <input
            type="text"
            id="abstract"
            className="form-control"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <input
            type="text"
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Publication Date Range:</label>
          <div className="d-flex gap-2">
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit" className="btn-primary">Search</button>
        </div>
      </form>
    </div>
  );
}

export default AdvancedSearch;