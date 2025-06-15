import React from 'react';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
      <div className="container">
        {/* Logo di paling kiri (sekarang berada di urutan pertama) */}
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
        {/* Hapus kelas order-md-X dan order-X dari sini */}
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
        {/* Hapus kelas order-md-X dan order-X dari sini */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav"> {/* Biarkan CSS kustom yang mengatur penengahan */}
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;