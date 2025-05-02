import React, { useState, useEffect } from 'react';
import './TarifLayanan.css';

const TarifPelayanan = () => {
  const images = [
    '/assets/tarif1.jpeg',
    '/assets/tarif2.jpeg',
    '/assets/tarif3.jpeg',
    '/assets/tarif4.jpeg',
    '/assets/tarif5.jpeg',
  ];

  const [scrollIndex, setScrollIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageCount, setImageCount] = useState(3); 

  useEffect(() => {
    const updateImageCount = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        setImageCount(1); 
      } else if (width <= 992) {
        setImageCount(2); 
      } else {
        setImageCount(3);
      }
    };

    updateImageCount();
    window.addEventListener('resize', updateImageCount);

    return () => {
      window.removeEventListener('resize', updateImageCount);
    };
  }, []);

  const handleNext = () => {
    if (scrollIndex < images.length - imageCount) {
      setScrollIndex(scrollIndex + 1);
    }
  };

  const handlePrev = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    }
  };

  const handleWheelZoom = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomChange = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.min(Math.max(prev + zoomChange, 1), 3));
    }
  };

  const closePopup = () => {
    setPopupImage(null);
    setZoomLevel(1);
  };

  return (
    <div className="tarif-container">
      <h2 className="tarif-title">Tarif Pelayanan</h2>
      <div className="tarif-carousel-wrapper">
        <button onClick={handlePrev} className="tarif-carousel-button left">{'<'}</button>
        <div className="tarif-carousel">
          <div
            className="tarif-carousel-track"
            style={{ transform: `translateX(-${scrollIndex * (100 / imageCount)}%)` }}
          >
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Tarif ${index + 1}`}
                className="tarif-carousel-image"
                onClick={() => setPopupImage(img)}
              />
            ))}
          </div>
        </div>
        <button onClick={handleNext} className="tarif-carousel-button right">{'>'}</button>
      </div>

      {popupImage && (
        <div className="tarif-popup-overlay" onClick={closePopup}>
          {/* Menghentikan event click dari gambar agar tidak menutup popup */}
          <div className="tarif-popup-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="tarif-close-button" onClick={closePopup}>X</button>
            <img
              src={popupImage}
              alt="Popup"
              className="tarif-popup-image"
              style={{ transform: `scale(${zoomLevel})` }}
              onWheel={handleWheelZoom}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifPelayanan;
