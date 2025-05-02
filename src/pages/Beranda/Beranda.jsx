import React from 'react';
import { NavLink } from 'react-router-dom';
import CarouselDashboard from '../../components/CarouselDashboard';
import JadwalPelayanan from '../../components/JadwalPelayanan';
import './Beranda.css';

const Beranda = () => {
  return (
    <div>
      <CarouselDashboard />
      <div className="beranda-content">
        <section className="layanan-section">
          <h2>Layanan Kami</h2>

          <div className="layanan-banner bg1">UNIT PELAYANAN PUSKESMAS KUJANG SARI KLASTER 2</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/1" className="layanan-box">
              Layanan 1
            </NavLink>
            <NavLink to="/layanan/2" className="layanan-box">
              Layanan 2
            </NavLink>
            <NavLink to="/layanan/3" className="layanan-box">
              Layanan 3
            </NavLink>
            <NavLink to="/layanan/4" className="layanan-box">
              Layanan 4
            </NavLink>
          </div>

          <div className="layanan-banner bg2">UNIT PELAYANAN PUSKESMAS KUJANG SARI KLASTER 3</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/5" className="layanan-box">
              Layanan 5
            </NavLink>
            <NavLink to="/layanan/6" className="layanan-box">
              Layanan 6
            </NavLink>
            <NavLink to="/layanan/7" className="layanan-box">
              Layanan 7
            </NavLink>
            <NavLink to="/layanan/8" className="layanan-box">
              Layanan 8
            </NavLink>
          </div>

          <div className="layanan-banner bg3">UNIT PELAYANAN PUSKESMAS KUJANG SARI KLASTER 4</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/9" className="layanan-box">
              Layanan 9
            </NavLink>
            <NavLink to="/layanan/10" className="layanan-box">
              Layanan 10
            </NavLink>
            <NavLink to="/layanan/11" className="layanan-box">
              Layanan 11
            </NavLink>
            <NavLink to="/layanan/12" className="layanan-box">
              Layanan 12
            </NavLink>
          </div>

          <div className="layanan-banner bg4">UNIT PELAYANAN PUSKESMAS KUJANG SARI KLASTER 5</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/13" className="layanan-box">
              Layanan 13
            </NavLink>
            <NavLink to="/layanan/14" className="layanan-box">
              Layanan 14
            </NavLink>
            <NavLink to="/layanan/15" className="layanan-box">
              Layanan 15
            </NavLink>
            <NavLink to="/layanan/16" className="layanan-box">
              Layanan 16
            </NavLink>
          </div>

        </section>

        <JadwalPelayanan />

        <section className="tarif-layanan">
          <h2>Tarif Pelayanan</h2>
        </section>
      </div>
    </div>
  );
};

export default Beranda;
