// StepTracker.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/steptracker.css';

const steps = [
  { path: '/admin/DescribeWork', label: 'Describe Work' },
  { path: '/admin/DescribeWork/upload-files', label: 'Upload File' },
  { path: '/admin/DescribeWork/upload-files/Confirm', label: 'Confirm Submission' },
];

const StepTracker = () => {
  const location = useLocation();
  const currentStepIndex = steps.findIndex(step => step.path === location.pathname);

  return (
    <div className="step-tracker-container">
      <h4 className="text-center">Submission Steps</h4>
      <ul className="step-list">
        {steps.map((step, index) => (
          <li key={index} className={`step-item ${currentStepIndex === index ? 'active' : ''}`}>
            <span className={`step-number ${currentStepIndex > index ? 'completed' : ''}`}>
              {index + 1}
            </span>
            <span className="step-label">{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StepTracker;
