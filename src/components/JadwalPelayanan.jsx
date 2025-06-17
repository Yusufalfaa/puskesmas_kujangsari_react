import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Sesuaikan path jika berbeda
import './JadwalPelayanan.css'; // Pastikan CSS ini diimpor

const JadwalPelayanan = () => {
  const [petugasHariIni, setPetugasHariIni] = useState([]);
  const [jadwalPelayanan, setJadwalPelayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mendapatkan hari ini dalam bahasa Indonesia
  const tanggalSekarang = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const tanggalHariIni = tanggalSekarang.toLocaleDateString('id-ID', options);
  
  // Mendapatkan nama hari saja untuk query database
  const namaHari = tanggalSekarang.toLocaleDateString('id-ID', { weekday: 'long' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch petugas kesehatan untuk hari ini
      const { data: petugasData, error: petugasError } = await supabase
        .from('doctor-schedule')
        .select(`
          *,
          sdm (
            id,
            name,
            jobdesk,
            degree
          )
        `)
        .eq('day', namaHari);

      if (petugasError) throw petugasError;

      // Fetch jadwal pelayanan (semua hari)
      const { data: jadwalData, error: jadwalError } = await supabase
        .from('schedule')
        .select('*')
        .order('id');

      if (jadwalError) throw jadwalError;

      setPetugasHariIni(petugasData || []);
      setJadwalPelayanan(jadwalData || []);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format waktu dari HH:MM:SS ke HH.MM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5).replace(':', '.');
  };

  // Format nama dengan gelar
  const formatNameWithDegree = (name, degree) => {
    if (!name) return 'Nama tidak tersedia';
    
    // Jika tidak ada gelar atau gelar null, return nama saja
    if (!degree) return name;
    
    // Gelar yang ditaruh di depan nama
    const frontDegrees = ['dr.', 'drg.', 'Dr.'];
    
    // Cek apakah gelar termasuk yang ditaruh di depan
    if (frontDegrees.includes(degree)) {
      return `${degree} ${name}`;
    }
    
    // Untuk gelar lainnya (S.Farm, S.Kep, Amd.Keb, dll), ditaruh di belakang nama
    return `${name}, ${degree}`;
  };

  if (loading) {
    return (
      <div className="jadwal-container">
        <div className="loading">Memuat data jadwal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jadwal-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="jadwal-container">
      <div className="petugas-box">
        <h3>Petugas Kesehatan</h3>
        {/* Tambahkan kelas .jadwal-text agar gaya p spesifik */}
        <p className="jadwal-text"><strong>Hari Ini: {tanggalHariIni}</strong></p>
        {petugasHariIni.length > 0 ? (
          <ul>
            {petugasHariIni.map((petugas, index) => (
              <li key={petugas.id}>
                {formatNameWithDegree(
                  petugas.sdm?.name || `Petugas ${index + 1}`,
                  petugas.sdm?.degree
                )} ({petugas.sdm?.jobdesk})
                <span>
                  {formatTime(petugas.time_start)} – {formatTime(petugas.time_end)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          // Tambahkan kelas .jadwal-text di sini juga
          <p className="jadwal-text">Tidak ada petugas yang bertugas hari ini.</p>
        )}
      </div>

      <div className="jadwal-box">
        <h3>Waktu Pelayanan</h3>
        {jadwalPelayanan.length > 0 ? (
          <ul>
            {jadwalPelayanan.map((jadwal) => (
              <li key={jadwal.id} className={jadwal.day === namaHari ? 'active-day' : ''}>
                {jadwal.day}
                <span>
                  {formatTime(jadwal.time_start)} – {formatTime(jadwal.time_end)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          // Tambahkan kelas .jadwal-text di sini juga
          <p className="jadwal-text">Jadwal pelayanan tidak tersedia.</p>
        )}
      </div>
    </div>
  );
};

export default JadwalPelayanan;