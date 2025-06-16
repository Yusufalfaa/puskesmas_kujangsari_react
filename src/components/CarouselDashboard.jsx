import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CarouselDashboard.css';
import { supabase } from '../lib/supabase'; // Sesuaikan path jika berbeda

const CarouselDashboard = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banner images dari Supabase Storage
  const fetchBannerImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil daftar file dari bucket image-asset folder Banner
      const { data: files, error } = await supabase.storage
        .from('image-asset')
        .list('Banner', {
          limit: 100,
          offset: 0
        });

      if (error) {
        throw error;
      }

      if (files && files.length > 0) {
        // Filter hanya file gambar
        const imageFiles = files.filter(file => 
          file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        );

        // Generate URL untuk setiap gambar
        const imagesWithUrls = imageFiles.map((file, index) => {
          const { data } = supabase.storage
            .from('image-asset')
            .getPublicUrl(`Banner/${file.name}`);
          
          return {
            id: file.id || `banner-${index}`,
            name: file.name,
            url: data.publicUrl,
            alt: `Banner ${index + 1}`
          };
        });

        setBannerImages(imagesWithUrls);
      } else {
        setError('Tidak ada gambar banner yang ditemukan');
      }
    } catch (error) {
      console.error('Error fetching banner images:', error);
      setError('Gagal memuat gambar banner');
    } finally {
      setLoading(false);
    }
  };

  // Fetch images saat komponen dimount
  useEffect(() => {
    fetchBannerImages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="carousel-loading-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3 text-muted">Memuat banner...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="carousel-error-container">
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: '400px' }}>
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
          </div>
          <p className="text-muted mb-3">{error}</p>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={fetchBannerImages}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No images state
  if (bannerImages.length === 0) {
    return (
      <div className="carousel-empty-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <p className="text-muted">Tidak ada gambar banner</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel 
      fade 
      interval={10000} // Auto-slide setiap 10 detik
      controls={true}
      indicators={true}
      pause="hover" // Pause saat hover
    >
      {bannerImages.map((image) => (
        <Carousel.Item key={image.id}>
          <img 
            className="d-block w-100" 
            src={image.url} 
            alt={image.alt}
            onError={(e) => {
              // Fallback image jika gagal load
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCI+R2FnYWwgTWVtdWF0IEJhbm5lcjwvdGV4dD48L3N2Zz4=';
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CarouselDashboard;