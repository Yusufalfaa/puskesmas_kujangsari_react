import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Galeri.css';

const Galeri = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded categories
  const [modalImage, setModalImage] = useState(null); // For zoom modal
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current image index
  const [currentCategory, setCurrentCategory] = useState(''); // Current category for navigation

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);

      const { data: galleryData, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false }); // Mengurutkan berdasarkan tanggal terbaru

      if (error) throw error;

      // Mengelompokkan data berdasarkan photoType
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

  // Function to toggle expanded state for a category
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Function to get displayed items (first 20 or all if expanded)
  const getDisplayedItems = (items, category) => {
    const isExpanded = expandedCategories[category];
    return isExpanded ? items : items.slice(0, 20);
  };

  // Function to check if "View More" button should be shown
  const shouldShowViewMore = (items, category) => {
    return items.length > 20 && !expandedCategories[category];
  };

  // Function to check if "View Less" button should be shown
  const shouldShowViewLess = (items, category) => {
    return items.length > 20 && expandedCategories[category];
  };

  // Function to open modal with image
  const openModal = (imageUrl, category, index) => {
    setModalImage(imageUrl);
    setCurrentCategory(category);
    setCurrentImageIndex(index);
  };

  // Function to close modal
  const closeModal = () => {
    setModalImage(null);
    setCurrentCategory('');
    setCurrentImageIndex(0);
  };

  // Function to navigate to next image
  const nextImage = () => {
    const categoryItems = data[currentCategory];
    const displayedItems = getDisplayedItems(categoryItems, currentCategory);
    const nextIndex = (currentImageIndex + 1) % displayedItems.length;
    setCurrentImageIndex(nextIndex);
    setModalImage(displayedItems[nextIndex].imgUrl);
  };

  // Function to navigate to previous image
  const prevImage = () => {
    const categoryItems = data[currentCategory];
    const displayedItems = getDisplayedItems(categoryItems, currentCategory);
    const prevIndex = currentImageIndex === 0 ? displayedItems.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(prevIndex);
    setModalImage(displayedItems[prevIndex].imgUrl);
  };

  // Handle keyboard navigation
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

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [modalImage, currentImageIndex, currentCategory]);

  // Prevent body scroll when modal is open
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
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchGalleryData}>Coba Lagi</button>
        </div>
      </div>
    );
  }

  // Jika tidak ada data
  if (Object.keys(data).length === 0) {
    return (
      <div>
        <div className="banner">
          <h1>GALERI</h1>
          <p>Kumpulan foto kegiatan dan fasilitas Puskesmas Kujangsari.</p>
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
      </div>

      <div className="gallery-container">
        {/* Tampilkan Tim Kita terlebih dahulu */}
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
            
            {/* View More/Less button for Tim Kita */}
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
        
        {/* Tampilkan kategori lainnya kecuali Tim Kita */}
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
              
              {/* View More button */}
              {shouldShowViewMore(items, category) && (
                <div className="view-more-container">
                  <button 
                    className="view-more-btn"
                    onClick={() => toggleCategory(category)}
                  >
                    Lihat Lebih Banyak
                  </button>
                </div>
              )}
              
              {/* View Less button */}
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

      {/* Modal for image zoom */}
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