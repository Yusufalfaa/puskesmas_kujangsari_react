import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingStorage.css';

const FloatingStorage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  const resetTimer = () => {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 5000);
  };

  useEffect(() => {
    // Untuk mouse (laptop/PC)
    window.addEventListener('mousemove', resetTimer);
    // Untuk sentuhan (HP/tablet)
    window.addEventListener('touchstart', resetTimer);

    // Mulai timer saat komponen mount
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = () => {
    navigate('/admin-config-storageManagement');
  };

  if (!visible) return null;

  return (
    <button 
      onClick={handleClick}
      className="floating-storage-icon" 
      tabIndex={0}
      style={{ transition: 'opacity 0.5s' }}
    >
      <img src={require('../../assets2/Storage.png')} alt="Storage" />
    </button>
  );
};

export default FloatingStorage;