import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditFeatured = () => {
  const [projects, setProjects] = useState([]);
  const [editDoc, setEditDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all projects (including featured flag)
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleEditClick = (doc) => {
    setEditDoc(doc); // Set the document to be edited
  };

  const handleSave = async () => {
    if (!editDoc) return;

    try {
      // Send the updated document data including the 'featured' status
      const response = await axios.put(`/api/featuredDocuments/${editDoc.project_id}`, editDoc);
      setProjects(prevState =>
        prevState.map(doc =>
          doc.project_id === editDoc.project_id ? response.data : doc
        )
      );
      setEditDoc(null); // Reset the edit form
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditDoc(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFeaturedChange = (e) => {
    const { checked } = e.target;
    setEditDoc(prevState => ({
      ...prevState,
      featured: checked,
    }));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="admin-featured-page">
      <h2>Manage Featured Documents</h2>

      <div className="projects-list">
        {projects.map((doc) => (
          <div key={doc.project_id} className="project-item">
            <h3>{doc.title}</h3>
            <p><strong>Authors:</strong> {doc.authors}</p>
            <p><strong>Published:</strong> {new Date(doc.publication_date).toLocaleDateString()}</p>
            <p>{doc.abstract}</p>
            <button onClick={() => handleEditClick(doc)}>Edit</button>
          </div>
        ))}
      </div>

      {editDoc && (
        <div className="edit-form">
          <h3>Edit Document</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={editDoc.title}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Publication Date:
              <input
                type="date"
                name="publication_date"
                value={editDoc.publication_date}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Abstract:
              <textarea
                name="abstract"
                value={editDoc.abstract}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Featured:
              <input
                type="checkbox"
                name="featured"
                checked={editDoc.featured}
                onChange={handleFeaturedChange}
              />
            </label>

            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditFeatured;
