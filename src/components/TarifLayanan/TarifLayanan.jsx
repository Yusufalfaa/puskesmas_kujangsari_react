import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './TarifLayanan.css';

const TarifPelayanan = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageCount, setImageCount] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const wrapperRef = useRef(null);

  // Caption mapping tetap sama seperti sebelumnya
  const captionMapping = {
    'Tarif-1': 'Layanan Umum',
    'Tarif-2': 'Layanan Tindakan',
    'Tarif-3': 'Layanan Laboratorium',
    'Tarif-4': 'Layanan Gigi & Mulut',
    'Tarif-5': 'Layanan KIA'
  };

  // Fungsi untuk mengambil data dari Supabase
  const fetchTarifData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('img-assets')
        .select('*')
        .eq('assets', 'Tarif Pelayanan')
        .order('name');

      if (error) {
        throw error;
      }

      // Format data sesuai dengan struktur yang dibutuhkan
      const formattedImages = data.map(item => ({
        src: item.imgUrl,
        caption: captionMapping[item.name] || item.name,
        name: item.name
      }));

      // Urutkan sesuai dengan urutan yang diinginkan (Tarif-1, Tarif-2, dst)
      const orderedImages = formattedImages.sort((a, b) => {
        const aNum = parseInt(a.name.split('-')[1]);
        const bNum = parseInt(b.name.split('-')[1]);
        return aNum - bNum;
      });

      setImages(orderedImages);
      setError(null);
    } catch (err) {
      console.error('Error fetching tarif data:', err);
      setError('Gagal memuat data tarif. Silakan coba lagi.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarifData();
  }, []);

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

  // Loading state
  if (loading) {
    return (
      <div className="tarif-container">
        <h2 className="tarif-title">Tarif Pelayanan</h2>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Memuat data tarif...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && images.length === 0) {
    return (
      <div className="tarif-container">
        <h2 className="tarif-title">Tarif Pelayanan</h2>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <button 
            onClick={fetchTarifData}
            style={{ 
              marginTop: '10px', 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tarif-container">
      <h2 className="tarif-title">Tarif Pelayanan</h2>
      {error && images.length === 0 ? (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      ) : error && images.length > 0 ? (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Data berhasil dimuat dari database
        </div>
      ) : null}
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
                  onError={(e) => {
                    console.error('Error loading image:', img.src);
                    e.target.style.display = 'none';
                  }}
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