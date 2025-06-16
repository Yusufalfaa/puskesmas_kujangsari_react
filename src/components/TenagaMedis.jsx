import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './TenagaMedis.css';

const TenagaMedis = () => {
  const [images, setImages] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageCount, setImageCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNameWithTitle = (name, degree) => {
    const lowerName = name?.toLowerCase() || '';
    const lowerDegree = degree?.toLowerCase() || '';

    if (lowerName.includes('dr.') || lowerName.includes('drg.')) {
      return degree ? `${name}, ${degree}` : name;
    }

    if (lowerDegree.includes('dr.') || lowerDegree.includes('drg.')) {
      const titleMatch = degree.match(/(drg?\.\s*)/i);
      if (titleMatch) {
        const title = titleMatch[0].trim();
        const remainingDegree = degree.replace(title, '').trim();
        return remainingDegree ? `${title} ${name}, ${remainingDegree}` : `${title} ${name}`;
      }
    }

    return degree ? `${name}, ${degree}` : name;
  };

  useEffect(() => {
    const fetchTenagaMedis = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('sdm')
          .select('*')
          .in('jobdesk', ['Bidan', 'Dokter', 'Dokter Gigi', 'Perawat'])
          .order('jobdesk', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        const formattedData = data.map((item) => ({
          src: item.profilePictureUrl,
          caption: formatNameWithTitle(item.name, item.degree),
          jobdesk: item.jobdesk,
          id: item.id
        }));

        setImages(formattedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data tenaga medis');
      } finally {
        setLoading(false);
      }
    };

    fetchTenagaMedis();
  }, []);

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

  if (loading) {
    return (
      <div className="tenaga-container">
        <h2 className="tenaga-title">Tenaga Medis</h2>
        <div className="tenaga-loading">
          <p>Memuat data tenaga medis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenaga-container">
        <h2 className="tenaga-title">Tenaga Medis</h2>
        <div className="tenaga-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="tenaga-container">
        <h2 className="tenaga-title">Tenaga Medis</h2>
        <div className="tenaga-empty">
          <p>Tidak ada data tenaga medis yang tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tenaga-container">
      <h2 className="tenaga-title">Tenaga Medis</h2>
      <div className="tenaga-carousel-wrapper">
        <button 
          onClick={handlePrev} 
          className="tenaga-carousel-button left"
          disabled={scrollIndex === 0}
        >
          {'<'}
        </button>
        <div className="tenaga-carousel">
          <div
            className="tenaga-carousel-track"
            style={{ transform: `translateX(-${scrollIndex * (100 / imageCount)}%)` }}
          >
            {images.map((img, index) => (
              <div key={img.id || index} className="tenaga-carousel-item">
                <div className="tenaga-card">
                  <img
                    src={img.src}
                    alt={`Tenaga Medis ${img.caption}`}
                    loading="lazy" // ✅ Lazy loading here
                    className="tenaga-carousel-image"
                    onClick={() => setPopupImage(img.src)}
                    onError={(e) => {
                      e.target.src = '/assets/placeholder-avatar.png';
                    }}
                  />
                  <span className="tenaga-caption" title={img.caption}>
                    {img.caption}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={handleNext} 
          className="tenaga-carousel-button right"
          disabled={scrollIndex >= images.length - imageCount}
        >
          {'>'}
        </button>
      </div>

      {popupImage && (
        <div className="tenaga-popup-overlay" onClick={closePopup}>
          <div className="tenaga-popup-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="tenaga-close-button" onClick={closePopup}>X</button>
            <img
              src={popupImage}
              alt="Popup"
              loading="lazy"
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
