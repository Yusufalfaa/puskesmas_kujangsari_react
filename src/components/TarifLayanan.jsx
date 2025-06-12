import React, { useState, useRef, useEffect, useCallback } from 'react';
import './TarifLayanan.css';

const TarifPelayanan = () => {
  const images = [
    { src: '/assets/tarif1.jpeg', caption: 'Layanan Umum' },
    { src: '/assets/tarif2.jpeg', caption: 'Layanan Tindakan' },
    { src: '/assets/tarif3.jpeg', caption: 'Layanan Laboratorium' },
    { src: '/assets/tarif4.jpeg', caption: 'Layanan Gigi & Mulut' },
    { src: '/assets/tarif5.jpeg', caption: 'Layanan KIA' },
  ];

  const [scrollIndex, setScrollIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageCount, setImageCount] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const updateImageCount = () => {
      const width = window.innerWidth;
      if (width <= 576) setImageCount(1);
      else if (width <= 992) setImageCount(2);
      else setImageCount(3);
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
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(Math.max(prev + delta, 1), 3));
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setDragging(true);
      setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging || !imageRef.current || !wrapperRef.current) return;

      const img = imageRef.current;
      const wrapper = wrapperRef.current;

      const containerRect = wrapper.getBoundingClientRect();
      const imageWidth = img.naturalWidth * zoom;
      const imageHeight = img.naturalHeight * zoom;

      const maxX = (imageWidth - containerRect.width) / 2 + 20;
      const maxY = (imageHeight - containerRect.height) / 2 + 20;

      let newX = e.clientX - startDrag.x;
      let newY = e.clientY - startDrag.y;

      newX = Math.min(Math.max(newX, -maxX), maxX);
      newY = Math.min(Math.max(newY, -maxY), maxY);

      setPosition({ x: newX, y: newY });
    },
    [dragging, zoom, startDrag]
  );

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove]);

  const closePopup = () => {
    setPopupImage(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
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
              <div key={index} className="tarif-carousel-item">
                <img
                  src={img.src}
                  alt={img.caption}
                  className="tarif-carousel-image"
                  onClick={() => setPopupImage(img.src)}
                />
                <span className="tarif-caption">{img.caption}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleNext} className="tarif-carousel-button right">{'>'}</button>
      </div>

      {popupImage && (
        <div className="tarif-popup-overlay" onClick={closePopup}>
          <div
            className="tarif-popup-image-wrapper"
            onClick={(e) => e.stopPropagation()}
            ref={wrapperRef}
          >
            <button className="tarif-close-button" onClick={closePopup}>×</button>
            <img
              ref={imageRef}
              src={popupImage}
              alt="Popup"
              className="tarif-popup-image"
              onWheel={handleWheelZoom}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifPelayanan;
