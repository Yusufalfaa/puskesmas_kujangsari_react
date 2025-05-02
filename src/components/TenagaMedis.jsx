import React, { useState, useEffect } from 'react';
import './TenagaMedis.css';

const TenagaMedis = () => {
  const images = [
    { src: '/assets/medis1.jpg', caption: 'Dokter 1' },
    { src: '/assets/medis1.jpg', caption: 'Perawat 2' },
    { src: '/assets/medis1.jpg', caption: 'Dokter 3' },
    { src: '/assets/medis1.jpg', caption: 'Ahli Gizi 4' },
    { src: '/assets/medis1.jpg', caption: 'Fisioterapis 5' },
    { src: '/assets/medis1.jpg', caption: 'Radiolog 6' },
    { src: '/assets/medis1.jpg', caption: 'Dokter 7' }
  ];

  const [scrollIndex, setScrollIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageCount, setImageCount] = useState(5);

  useEffect(() => {
    const updateImageCount = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        setImageCount(1);
      } else if (width <= 992) {
        setImageCount(2);
      } else {
        setImageCount(5);
      }
    };

    updateImageCount();
    window.addEventListener('resize', updateImageCount);
    return () => window.removeEventListener('resize', updateImageCount);
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
      setZoomLevel(prev => Math.min(Math.max(prev + zoomChange, 1), 3));
    }
  };

  const closePopup = () => {
    setPopupImage(null);
    setZoomLevel(1);
  };

  return (
    <div className="tenaga-container">
      <h2 className="tenaga-title">Tenaga Medis</h2>
      <div className="tenaga-carousel-wrapper">
        <button onClick={handlePrev} className="tenaga-carousel-button left">{'<'}</button>
        <div className="tenaga-carousel">
          <div
            className="tenaga-carousel-track"
            style={{ transform: `translateX(-${scrollIndex * (100 / imageCount)}%)` }}
          >
            {images.map((img, index) => (
              <div key={index} className="tenaga-carousel-item">
                <img
                  src={img.src}
                  alt={`Tenaga Medis ${index + 1}`}
                  className="tenaga-carousel-image"
                  onClick={() => setPopupImage(img.src)}
                />
                <span className="tenaga-caption">{img.caption}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleNext} className="tenaga-carousel-button right">{'>'}</button>
      </div>

      {popupImage && (
        <div className="tenaga-popup-overlay" onClick={closePopup}>
          <div className="tenaga-popup-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="tenaga-close-button" onClick={closePopup}>X</button>
            <img
              src={popupImage}
              alt="Popup"
              className="tenaga-popup-image"
              style={{ transform: `scale(${zoomLevel})` }}
              onWheel={handleWheelZoom}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TenagaMedis;
