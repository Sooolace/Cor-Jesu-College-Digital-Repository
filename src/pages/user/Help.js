import React from 'react';
import './styles/help.css'; // You can add your CSS for styling the page

function Help() {
  return (
    <div className="help-container">
      <h3>Welcome to the Campus Digital Repository Help Page</h3>
      <div className="author-underline"></div>
      <section>
        <h3>What is the Campus Digital Repository?</h3>
        <p>
          The Campus Digital Repository is a digital platform that allows students, faculty, staff, and alumni to access and view academic resources, research papers, theses, projects, and other scholarly content contributed by authorized institutions and research offices.
        </p>
        <p>
          The platform is designed to make research and academic resources easily accessible for the academic community, but only the Research Publication Office can upload new materials.
        </p>
      </section>

      <section>
        <h3>User Roles</h3>
        <ul>
          <li><strong>Users:</strong> Can search, view, and download documents.</li>
          <li><strong>Research Publication Office (RPO):</strong> The only group with permission to upload new research papers, projects, and scholarly content. RPO staff are responsible for reviewing and adding submissions to the repository.</li>
        </ul>
      </section>

      <section>
        <h3>How to Use the Repository</h3>
        <h4>Search for Documents</h4>
        <p>To search for academic content, use the search bar at the top of the page. You can search by:</p>
        <ul>
          <li><strong>Title:</strong> Search by the title of a research paper or project.</li>
          <li><strong>Author:</strong> Search for documents based on author name.</li>
          <li><strong>Category:</strong> Filter documents by category or department.</li>
        </ul>

        <h4>View Documents</h4>
        <p>Once you find a document, click on the title to view more details. You can:</p>
        <ul>
          <li>Read an abstract or summary of the document.</li>
          <li>Download the full text (if available).</li>
        </ul>

        <h4>Download Documents</h4>
        <p>If the document is available for download, you'll see a download button on the document page. Click it to download the full text in PDF or another available format.</p>
      </section>

      <section>
        <h3>Submission Process (For RPO Staff)</h3>
        <h4>How to Submit a Document</h4>
        <p>The Research Publication Office staff are responsible for submitting new research papers, projects, theses, and other scholarly content. To submit a document:</p>
        <ul>
          <li>Log into your RPO account.</li>
          <li>Navigate to the "Submit New Document" section of the platform.</li>
          <li>Fill in the required fields, including the title, author(s), category, and a brief description.</li>
          <li>Upload the document file (PDF).</li>
          <li>Click "Submit" to add the document to the repository.</li>
        </ul>
        <h4>Document Review Process</h4>
        <p>Once a document is submitted, it will be reviewed by the RPO team for accuracy and completeness before being made publicly available.</p>
      </section>

      <section>
        <h3>Need Help?</h3>
        <p>If you have any questions, encounter issues, or need assistance, please contact our support team:</p>
        <ul>
          <li>Email: <a href="mailto:support@campusrepository.edu">support@campusrepository.edu</a></li>
          <li>Phone: +63 985 062 0281          </li>
          <li>Location: Sacred Heart Avenue, Digos City, Province of Davao del Sur</li>
        </ul>
      </section>
    </div>
  );
}

export default Help;
