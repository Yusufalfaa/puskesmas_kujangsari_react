import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PageNotFound.css';

const PageNotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Deteksi apakah sedang berada di route admin
  const isAdminRoute = location.pathname.startsWith('/admin-');

  const handleGoHome = () => {
    // Jika di route admin, arahkan ke admin-beranda
    // Jika di route public, arahkan ke beranda public
    if (isAdminRoute) {
      navigate('/admin-beranda');
    } else {
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="page-not-found">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <div className="error-container">
        <div className="error-number">
          <span className="four">4</span>
          <span className="zero">0</span>
          <span className="four">4</span>
        </div>
        
        <div className="error-message">
          <h1 className="error-title">Halaman Tidak Ditemukan</h1>
        </div>
        
        <div className="astronaut">
          <div className="astronaut-body">
            <div className="astronaut-head">
              <div className="helmet-shine"></div>
              <div className="face">
                <div className="eye eye-left"></div>
                <div className="eye eye-right"></div>
                <div className="mouth"></div>
              </div>
            </div>
            <div className="astronaut-torso">
              <div className="control-panel">
                <div className="button button-1"></div>
                <div className="button button-2"></div>
                <div className="button button-3"></div>
              </div>
            </div>
            <div className="astronaut-arms">
              <div className="arm arm-left"></div>
              <div className="arm arm-right"></div>
            </div>
            <div className="astronaut-legs">
              <div className="leg leg-left"></div>
              <div className="leg leg-right"></div>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoHome}>
            <span>
              Kembali ke Beranda
            </span>
          </button>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            <span>Halaman Sebelumnya</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;