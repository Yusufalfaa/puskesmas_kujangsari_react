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
              Pemeriksaan Ibu Hamil
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-balita-prasekolah" className="layanan-box">
              Pelayanan Imunisasi Bayi
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-usia-sekolah-remaja" className="layanan-box">
              Pelayanan USG
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-usia-sekolah-remaja" className="layanan-box">
              Pelayanan Pemeriksaan Anak 0-5 Tahun
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-2/anak-usia-sekolah-remaja" className="layanan-box">
              Pelayanan Anak dan Remaja
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

          <div className="layanan-banner bg4">Layanan Lintas Klaster</div>
          <div className="layanan-grid-last">
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan gawat darurat, rawat inap, kefarmasian, dan laboratorium.
            </NavLink>
          </div>
        </section>

        <div className="video-placeholder-container">
          <h3 className="video-title">Video Profil Puskesmas Kujangsari</h3>
          <iframe
            className="video-player"
            src="https://www.youtube.com/embed/4-htQah2lcY"
            title="Video Profil Puskesmas Kujangsari"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <div className="video-separator"></div>
          <h3 className="video-title">Penerapan ILP UPTD Puskesmas Kujangsari</h3>
          <iframe
            className="video-player"
            src="https://www.youtube.com/embed/uzQ-y_31bS0"
            title="Penerapan ILP UPTD Puskesmas Kujangsari"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <JadwalPelayanan />
        <TarifPelayanan />
        <TenagaMedis />
      </div>
    </div>
  );
};

export default Beranda;