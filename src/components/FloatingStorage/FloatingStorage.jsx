import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingStorage.css';

const FloatingStorage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/admin-config-storageManagement');
    };

  return (
    <a 
      onClick={handleClick}
      className="floating-storage-icon" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      <img src={require('../../assets2/Storage.png')} alt="Storage" /> {/* Path gambar diperbarui */}
    </a>
  );
};

export default FloatingStorage;