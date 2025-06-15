// src/pages/Klaster2Page/Klaster2Page.jsx
import React, { useState } from 'react';
import GridItem from '../../../components/GridItem/GridItem'; // Pastikan path benar
import Modal from '../../../components/Modal/Modal';       // Pastikan path benar
import './klaster-2.css'; // Nama CSS sesuai nama komponen

const Klaster2Page = () => {
  const [gridData] = useState([
    {
      id: 1,
      imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_persalinan.png`, // Ganti dengan path gambar ikon Anda
      title: 'Unit Pelayanan Persalinan',
      subtitle: 'Unit Pelayanan Persalinan',
      description: 'Menyediakan layanan persalinan yang aman dan nyaman dengan fasilitas lengkap.'
    },
    {
      id: 2,
      imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_ki_hamil.png`, // Ganti dengan path gambar ikon Anda
      title: 'Unit Pelayanan KI Hamil',
      subtitle: 'Unit Pelayanan KI Hamil',
      description: 'Layanan Kesehatan Ibu Hamil untuk pemantauan kehamilan dan persiapan persalinan.'
    },
    {
      id: 3,
      imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_mtbs_anak.png`, // Ganti dengan path gambar ikon Anda
      title: 'Unit Pelayanan MTBS dan Anak',
      subtitle: 'Unit Pelayanan MTBS dan Anak',
      description: 'Manajemen Terpadu Balita Sakit (MTBS) dan layanan kesehatan anak.'
    },
    {
      id: 4,
      imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_mtbm.png`, // Ganti dengan path gambar ikon Anda
      title: 'Unit Pelayanan MTBM',
      subtitle: 'Unit Pelayanan MTBM',
      description: 'Manajemen Terpadu Balita Muda untuk deteksi dini masalah kesehatan pada bayi.'
    },
    // ... Tambahkan data layanan lain sesuai kebutuhan gambar Anda
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="klaster2-page-container">
      <h1 className="main-title">DAFTAR UNIT PELAYANAN KLASTER 2 KESEHATAN IBU DAN ANAK</h1>

      <div className="dynamic-klaster-grid">
        {gridData.map((item) => (
          <GridItem key={item.id} item={item} onClick={handleItemClick} />
        ))}
      </div>

      {isModalOpen && selectedItem && (
        <Modal
          title={selectedItem.title}
          description={selectedItem.description}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Klaster2Page;