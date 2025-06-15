// src/components/Modal/Modal.jsx
import React from 'react';
import './Modal.css'; // Nama CSS sesuai nama komponen

const Modal = ({ title, description, onClose }) => {
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') { // Sesuaikan nama kelas jika perlu
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>{description}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;