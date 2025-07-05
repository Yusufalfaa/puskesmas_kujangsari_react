import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Galeri.css';

const Galeri = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentCategory, setCurrentCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);

      const { data: galleryData, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupedData = galleryData.reduce((acc, item) => {
        const category = item.photoType;
        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({
          id: item.id,
          imgUrl: item.imgUrl,
          photoType: item.photoType,
          createdAt: item.created_at
        });

        return acc;
      }, {});

      setData(groupedData);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      setError('Gagal memuat data galeri');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getDisplayedItems = (items, category) => {
    const isExpanded = expandedCategories[category];
    return isExpanded ? items : items.slice(0, 20);
  };

  const shouldShowViewMore = (items, category) => {
    return items.length > 20 && !expandedCategories[category];
  };

  const shouldShowViewLess = (items, category) => {
    return items.length > 20 && expandedCategories[category];
  };

  const openModal = (imageUrl, category, index) => {
    setModalImage(imageUrl);
    setCurrentCategory(category);
    setCurrentImageIndex(index);
  };

  const closeModal = () => {
    setModalImage(null);
    setCurrentCategory('');
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    const categoryItems = data[currentCategory];
    const displayedItems = getDisplayedItems(categoryItems, currentCategory);
    const nextIndex = (currentImageIndex + 1) % displayedItems.length;
    setCurrentImageIndex(nextIndex);
    setModalImage(displayedItems[nextIndex].imgUrl);
  };

  const prevImage = () => {
    const categoryItems = data[currentCategory];
    const displayedItems = getDisplayedItems(categoryItems, currentCategory);
    const prevIndex = currentImageIndex === 0 ? displayedItems.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setModalImage(displayedItems[prevIndex].imgUrl);
  };

  const handleKeyPress = (e) => {
    if (!modalImage) return;
    
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  const handleConfigClick = () => {
    navigate('/admin-config-galeri');
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [modalImage, currentImageIndex, currentCategory]);

  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalImage]);

  if (loading) {
    return (
      <div>
        <div className="banner">
          <h1>GALERI</h1>
          <p>Kumpulan foto kegiatan dan fasilitas Puskesmas Kujangsari.</p>
          <button className="settings-btn-gallery" onClick={handleConfigClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div className="loading-container">
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="banner">
          <h1>GALERI</h1>
          <p>Kumpulan foto kegiatan dan fasilitas Puskesmas Kujangsari.</p>
          <button className="settings-btn-gallery" onClick={handleConfigClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchGalleryData}>Coba Lagi</button>
        </div>
      </div>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <div>
        <div className="banner">
          <h1>GALERI</h1>
          <p>Kumpulan foto kegiatan dan fasilitas Puskesmas Kujangsari.</p>
          <button className="settings-btn-gallery" onClick={handleConfigClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div className="empty-container">
          <p>Belum ada foto dalam galeri.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="banner">
        <h1>GALERI</h1>
        <p>Kumpulan foto kegiatan dan fasilitas Puskesmas Kujangsari.</p>
        <button className="settings-btn-gallery" onClick={handleConfigClick}>
          <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </button>
      </div>

      <div className="gallery-container">
        {data['Tim Kita'] && (
          <div className="gallery-section">
            <h2>
              Tim Kita <span className="photo-count">({data['Tim Kita'].length} foto)</span>
            </h2>
            <div className="gallery-grid">
              {getDisplayedItems(data['Tim Kita'], 'Tim Kita').map((item, index) => (
                <div key={item.id} className="gallery-card">
                  <img
                    src={item.imgUrl}
                    alt="Tim Kita photo"
                    loading="lazy"
                    className="gallery-image"
                    onClick={() => openModal(item.imgUrl, 'Tim Kita', index)}
                    onError={(e) => {
                      e.target.src = '/assets/placeholder-image.png';
                    }}
                  />
                </div>
              ))}
            </div>
            
            {shouldShowViewMore(data['Tim Kita'], 'Tim Kita') && (
              <div className="view-more-container">
                <button 
                  className="view-more-btn"
                  onClick={() => toggleCategory('Tim Kita')}
                >
                  Lihat Lebih Banyak
                </button>
              </div>
            )}
            
            {shouldShowViewLess(data['Tim Kita'], 'Tim Kita') && (
              <div className="view-more-container">
                <button 
                  className="view-less-btn"
                  onClick={() => toggleCategory('Tim Kita')}
                >
                  Lihat Lebih Sedikit
                </button>
              </div>
            )}
          </div>
        )}
        
        {Object.entries(data)
          .filter(([category]) => category !== 'Tim Kita')
          .map(([category, items]) => (
            <div key={category} className="gallery-section">
              <h2>{category} <span className="photo-count">({items.length} foto)</span></h2>
              <div className="gallery-grid">
                {getDisplayedItems(items, category).map((item, index) => (
                  <div key={item.id} className="gallery-card">
                    <img
                      src={item.imgUrl}
                      alt={`${category} photo`}
                      loading="lazy"
                      className="gallery-image"
                      onClick={() => openModal(item.imgUrl, category, index)}
                      onError={(e) => {
                        e.target.src = '/assets/placeholder-image.png';
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {shouldShowViewMore(items, category) && (
                <div className="view-more-container">
                  <button 
                    className="view-more-btn"
                    onClick={() => toggleCategory(category)}
                  >
                    Lihat Lebih Banyak ({items.length - 20} foto lagi)
                  </button>
                </div>
              )}
              
              {shouldShowViewLess(items, category) && (
                <div className="view-more-container">
                  <button 
                    className="view-less-btn"
                    onClick={() => toggleCategory(category)}
                  >
                    Lihat Lebih Sedikit
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {modalImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            <button className="modal-nav modal-prev" onClick={prevImage}>
              ‹
            </button>

            <img
              src={modalImage}
              alt="Zoomed image"
              className="modal-image"
              onError={(e) => {
                e.target.src = '/assets/placeholder-image.png';
              }}
            />

            <button className="modal-nav modal-next" onClick={nextImage}>
              ›
            </button>

            <div className="modal-info">
              <span className="modal-category">{currentCategory}</span>
              <span className="modal-counter">
                {currentImageIndex + 1} / {getDisplayedItems(data[currentCategory], currentCategory).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Galeri;