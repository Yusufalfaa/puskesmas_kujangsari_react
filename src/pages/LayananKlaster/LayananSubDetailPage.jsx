// src/pages/LayananKlaster/LayananSubDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GridItem from '../../components/GridItem/GridItem';
import Modal from '../../components/Modal/Modal';
import layananData from '../../data/layananData';
import './LayananSubDetailPage.css'; 

const LayananSubDetailPage = () => {
  const { klasterId, subLayananId } = useParams(); 
  const navigate = useNavigate();

  const [subLayananInfo, setSubLayananInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const klaster = layananData[klasterId];
    if (klaster) {
      const subKategori = klaster.subKategoris.find(sub => sub.id === subLayananId);
      if (subKategori) {
        setSubLayananInfo(subKategori);
      } else {
        navigate('/not-found'); 
      }
    } else {
      navigate('/not-found'); 
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

      <div className="centered-scroll-wrapper"> 
        <div className="dynamic-detail-item-grid">
          {subLayananInfo.detailItems.map((item) => (
            <GridItem key={item.id} item={item} onClick={handleItemClick} />
          ))}
        </div>
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