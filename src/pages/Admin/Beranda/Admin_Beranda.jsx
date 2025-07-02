import React from 'react';
import { NavLink } from 'react-router-dom';
import CarouselDashboard from '../../../components/CarouselDashboard/CarouselDashboard';
import VideoBeranda from '../../../components/VideoBeranda/AdminVideoBeranda';
import JadwalPelayanan from '../../../components/JadwalPelayanan/AdminJadwalPelayanan';
import TarifPelayanan from '../../../components/TarifLayanan/TarifLayanan';
import TenagaMedis from '../../../components/TenagaMedis';
import './Beranda.css';

const Beranda = () => {
  return (
    <div className="beranda-page-wrapper">
      <CarouselDashboard />
      <div className="beranda-content">
        <section className="layanan-section">
          <h2>Layanan Kami</h2>

          <div className="layanan-banner bg1">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 1</div>
          <div className="layanan-grid-item">
            <NavLink to="/layanan/klaster/klaster-2/ibu-hamil" className="layanan-box">
              Pendaftaran
            </NavLink>
           </div>

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
              Pelayanan Pemeriksaan Dewasa dan Lansia
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-3/lansia" className="layanan-box">
              Pelayanan Pemeriksaan Calon Pengantin
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-3/lansia" className="layanan-box">
              Pelayanan KB
            </NavLink>
          </div>

          <div className="layanan-banner bg3">UNIT PELAYANAN PUSKESMAS KUJANGSARI KLASTER 4</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/klaster/klaster-4/pencegahan-respon" className="layanan-box">
              Pelayanan TBC
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-4/kualitas-lingkungan" className="layanan-box">
              Pelayanan Penanggulangan Penyakit Menular
            </NavLink>
          </div>

          <div className="layanan-banner bg4">UNIT PELAYANAN LINTAS KLASTER</div>
          <div className="layanan-grid">
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan Tindakan
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan Kesehatan Gigi dan Mulut
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan Kefarmasian
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan Gizi
            </NavLink>
            <NavLink to="/layanan/klaster/klaster-5/penunjang-medis" className="layanan-box">
              Pelayanan Labolatorium
            </NavLink>
          </div>
        </section>
        <VideoBeranda/>
        <JadwalPelayanan />
        <TarifPelayanan />
        <TenagaMedis />
      </div>
    </div>
  );
};

export default Beranda;