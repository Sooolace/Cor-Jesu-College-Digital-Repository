// SuccessModal.js
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function SuccessModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Project Deleted</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>The project has been successfully deleted.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SuccessModal;
