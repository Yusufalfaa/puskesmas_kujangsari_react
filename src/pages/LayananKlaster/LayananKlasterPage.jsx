// src/pages/LayananKlaster/LayananKlasterPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import layananData from '../../data/layananData'; // Import data hirarkis
import './LayananKlasterPage.css'; // Gaya untuk halaman klaster utama

const LayananKlasterPage = () => {
  const { klasterId } = useParams(); // Mengambil klasterId (ex: 'klaster-2')
  const navigate = useNavigate();

  const [klasterInfo, setKlasterInfo] = useState(null);

  useEffect(() => {
    const data = layananData[klasterId];
    if (data) {
      setKlasterInfo(data);
    } else {
      navigate('/not-found'); // Arahkan ke halaman 404 jika klaster tidak ditemukan
    }
  }, [klasterId, navigate]);

  if (!klasterInfo) {
    return (
      <div className="klaster-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Memuat atau Klaster Tidak Ditemukan...</h2>
      </div>
    );
  }

  return (
    <div className="klaster-page-container">
      <h1 className="main-title">{klasterInfo.mainTitle}</h1>
      <p className="subtitle">{klasterInfo.description}</p>

      {/* Grid untuk sub-kategori utama (misal: Pelayanan Ibu Hamil) */}
      <div className="layanan-subkategori-grid">
        {klasterInfo.subKategoris.map(subKategori => (
          <NavLink
            key={subKategori.id}
            to={`/layanan/klaster/${klasterId}/${subKategori.id}`} /* Navigasi ke halaman detail sub-layanan */
            className="layanan-subkategori-box"
          >
            <h3>{subKategori.name}</h3>
            {/* Anda bisa menambahkan gambar atau ikon di sini jika ada untuk sub-kategori utama */}
            {/* <img src={subKategori.imageUrl} alt={subKategori.name} /> */}
            <div className="subkategori-box-banner">
              {subKategori.bannerText}
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default LayananKlasterPage;