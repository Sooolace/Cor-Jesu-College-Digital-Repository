const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// ...existing code...

// Endpoint to update view count
router.post('/updateviewcount/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    console.log(`Updating view count for project ID: ${projectId}`);
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }
    project.view_count += 1;
    await project.save();
    console.log(`New view count for project ID ${projectId}: ${project.view_count}`);
    res.status(200).json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ message: 'Error updating view count', error });
  }
});

// ...existing code...

module.exports = router;
