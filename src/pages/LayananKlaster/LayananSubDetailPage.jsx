// src/pages/LayananKlaster/LayananSubDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GridItem from '../../components/GridItem/GridItem'; // Re-use GridItem
import Modal from '../../components/Modal/Modal';       // Re-use Modal
import layananData from '../../data/layananData'; // Import data hirarkis
import './LayananSubDetailPage.css'; // Gaya untuk halaman detail sub-layanan

const LayananSubDetailPage = () => {
  const { klasterId, subLayananId } = useParams(); // Ambil kedua parameter dari URL
  const navigate = useNavigate();

  const [subLayananInfo, setSubLayananInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Cari data klaster utama
    const klaster = layananData[klasterId];
    if (klaster) {
      // Cari sub-kategori di dalamnya
      const subKategori = klaster.subKategoris.find(sub => sub.id === subLayananId);
      if (subKategori) {
        setSubLayananInfo(subKategori);
      } else {
        navigate('/not-found'); // Sub-layanan tidak ditemukan
      }
    } else {
      navigate('/not-found'); // Klaster tidak ditemukan
    }
  }, [klasterId, subLayananId, navigate]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (!subLayananInfo) {
    return (
      <div className="sub-detail-page-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Memuat atau Layanan Tidak Ditemukan...</h2>
      </div>
    );
  }

  return (
    <div className="sub-detail-page-container">
      <h1 className="main-title">{subLayananInfo.name}</h1>
      <p className="subtitle">Detail layanan di bawah kategori ini:</p>

      {/* Grid untuk item-item detail (Unit Pelayanan Persalinan, dll.) */}
      <div className="dynamic-detail-item-grid">
        {subLayananInfo.detailItems.map((item) => (
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

export default LayananSubDetailPage;