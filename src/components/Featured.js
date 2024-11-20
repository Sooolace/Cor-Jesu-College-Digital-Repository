import React from 'react';
import '../pages/user/styles/Featured.css'; // Make sure to update the CSS path accordingly

function Featured() {
  return (
    <section className="featured-section">
      <h2 className="section-title">Featured Documents</h2>
      <div className="featured-documents">
        <div className="featured-document">
          <h3 className="document-title">The Impact of Digital Repositories</h3>
          <p><strong>Author:</strong> John Doe</p>
          <p><strong>Date Published:</strong> January 15, 2024</p>
          <p className="document-description">
            This study explores the benefits of digital repositories in academic settings...
          </p>
        </div>

        <div className="featured-document">
          <h3 className="document-title">Best Practices for Data Management</h3>
          <p><strong>Author:</strong> Jane Smith</p>
          <p><strong>Date Published:</strong> February 10, 2023</p>
          <p className="document-description">
            This paper discusses various strategies for managing research data efficiently...
          </p>
        </div>

        <div className="featured-document">
          <h3 className="document-title">Advancements in Artificial Intelligence</h3>
          <p><strong>Author:</strong> Mark Brown</p>
          <p><strong>Date Published:</strong> October 30, 2023</p>
          <p className="document-description">
            An in-depth exploration of recent developments in AI and its applications in different fields...
          </p>
        </div>

        <div className="featured-document">
          <h3 className="document-title">Sustainable Development Goals</h3>
          <p><strong>Author:</strong> Sarah Johnson</p>
          <p><strong>Date Published:</strong> August 1, 2023</p>
          <p className="document-description">
            This document delves into the UN’s Sustainable Development Goals and their impact on global progress...
          </p>
        </div>
      </div>
    </section>
  );
}

export default Featured;
