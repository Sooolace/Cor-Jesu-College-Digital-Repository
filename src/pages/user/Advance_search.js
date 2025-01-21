import React from 'react';
import '../user/styles/App.css';

const Advanced_search = () => {
  return (
    <div className="upload-container my-5">
        <form>
      <div className="text-center mb-4">
        <h2 className="custom-margin">Advanced Search</h2>
      </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="author" className="form-label">Author</label>
              <input type="text" id="author" className="form-control" placeholder="Enter author name" />
            </div>
            <div className="col-md-6">
              <label htmlFor="title" className="form-label">Title</label>
              <input type="text" id="title" className="form-control" placeholder="Enter document title" />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="publisher" className="form-label">Publisher</label>
              <input type="text" id="publisher" className="form-control" placeholder="Enter publisher name" />
            </div>
            <div className="col-md-6">
              <label htmlFor="year" className="form-label">Publication Year</label>
              <input type="number" id="year" className="form-control" placeholder="Enter publication year" />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="genre" className="form-label">Genre</label>
              <select id="genre" className="form-select">
                <option value="">Select genre</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-fiction</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="biography">Biography</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="keywords" className="form-label">Keywords</label>
              <input type="text" id="keywords" className="form-control" placeholder="Enter keywords" />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea id="description" className="form-control" rows="3" placeholder="Enter a brief description"></textarea>
          </div>

          <div className="text-center">
            <button type="submit" className="btn-primary">Search</button>
          </div>
        </form>
      </div>

  );
};

export default Advanced_search;
