import React from 'react';
import './JadwalPelayanan.css';

const JadwalPelayanan = () => {
  const tanggalSekarang = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const tanggalHariIni = tanggalSekarang.toLocaleDateString('id-ID', options);

  return (
    <div className="jadwal-container">
      <div className="petugas-box">
        <h3>Petugas Kesehatan</h3>
        <p><strong>Hari Ini: {tanggalHariIni}</strong></p>
        <ul>
          <li>Dokter 1 <span>8.00 – 14.30</span></li>
          <li>Dokter 2 <span>8.00 – 14.30</span></li>
          <li>Dokter 3 <span>8.00 – 14.30</span></li>
          <li>Dokter 4 <span>8.00 – 14.30</span></li>
          <li>Dokter 5 <span>8.00 – 14.30</span></li>
          <li>Dokter 6 <span>8.00 – 14.30</span></li>
        </ul>
      </div>

      <div className="jadwal-box">
        <h3>Waktu Pelayanan</h3>
        <ul>
          <li>Senin <span>8.00 – 14.30</span></li>
          <li>Selasa <span>8.00 – 14.30</span></li>
          <li>Rabu <span>8.00 – 14.30</span></li>
          <li>Kamis <span>8.00 – 14.30</span></li>
          <li>Jumat <span>8.00 – 14.30</span></li>
          <li>Sabtu <span>8.00 – 14.30</span></li>
        </ul>
      </div>
    </div>
  );
};

export default JadwalPelayanan;
