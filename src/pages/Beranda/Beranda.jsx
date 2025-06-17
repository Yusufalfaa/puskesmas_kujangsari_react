import React from 'react';
import { NavLink } from 'react-router-dom';
import CarouselDashboard from '../../components/CarouselDashboard/CarouselDashboard';
import JadwalPelayanan from '../../components/JadwalPelayanan';
import TarifPelayanan from '../../components/TarifLayanan';
import TenagaMedis from '../../components/TenagaMedis';
import './Beranda.css';

const Beranda = () => {
  return (
    <div className="beranda-page-wrapper">
      <CarouselDashboard />
      <div className="beranda-content">
        <section className="layanan-section">
          <h2>Layanan Kami</h2>

          <div className="layanan-banner bg1">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 2</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/klaster/klaster-2/ibu-hamil" className="layanan-box">
              Pelayanan Kesehatan bagi ibu hamil, bersalin, dan nifas
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-balita-prasekolah" className="layanan-box">
              Pelayanan Kesehatan bagi anak balita dan anak prasekolah
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-usia-sekolah-remaja" className="layanan-box">
              Pelayanan Kesehatan bagi anak usia sekolah dan remaja
            </NavLink>
          </div>

          <div className="layanan-banner bg2">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 3</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/klaster/klaster-3/usia-dewasa" className="layanan-box">
              Pelayanan Kesehatan bagi usia dewasa
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-3/lansia" className="layanan-box">
              Pelayanan Kesehatan bagi Lanjut Usia
            </NavLink>
          </div>

          <div className="layanan-banner bg3">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 4</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/klaster/klaster-4/pencegahan-respon" className="layanan-box">
              Pencegahan, Kewaspadaan Dini dan Respon
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-4/kualitas-lingkungan" className="layanan-box">
              Pengawasan kualitas lingkungan
            </NavLink>
          </div>

          <div className="layanan-banner bg4">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 5</div>
          <div className="layanan-grid-last">
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan gawat darurat, rawat inap, kefarmasian, dan laboratorium.
            </NavLink>
          </div>
        </section>

        <JadwalPelayanan />
        <TarifPelayanan />
        <TenagaMedis />
      </div>
    </div>
  );
};

export default Beranda;