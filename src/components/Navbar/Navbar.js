import React from 'react';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    // Optionally redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container">
        {/* Logo di paling kiri */}
        <NavLink className="navbar-brand" to="/">
          <img
            src={`${process.env.PUBLIC_URL}/logoKujangsari2.png`}
            alt="Logo Puskesmas Kujangsari"
            width="200"
            height="60"
            className="d-inline-block align-text-top me-2"
          />
        </NavLink>

        {/* Tombol Toggler (Hamburger Icon) untuk mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Konten Navigasi */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menu Navigasi di Tengah */}
          <ul className="navbar-nav navbar-nav-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Beranda
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <NavLink
                className="nav-link dropdown-toggle"
                to="/tentangPuskesmas"
                id="tentangDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Tentang Puskesmas
              </NavLink>
              <ul className="dropdown-menu" aria-labelledby="tentangDropdown">
                <li>
                  <NavLink className="dropdown-item" to="/tentangPuskesmas">
                    Profil Puskesmas
                  </NavLink>
                </li>
                <li>
                  <NavLink className="dropdown-item" to="/tenagaKerja">
                    Tenaga Kerja
                  </NavLink>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/saranKeluhan" end>
                Saran & Keluhan
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/kontak" end>
                Kontak
              </NavLink>
            </li>
          </ul>

          {/* Tombol Login/Logout di Kanan */}
          <div className="navbar-nav navbar-nav-right">
            {isAuthenticated ? (
              <div className="nav-item dropdown">
                <button
                  className="nav-link login-btn dropdown-toggle"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <i className="fas fa-user me-2"></i>
                  {user?.username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <span className="dropdown-item-text">
                      <small>Role: {user?.role}</small>
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <NavLink className="nav-link login-btn" to="/login">
                <i className="fas fa-user me-2"></i>
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;