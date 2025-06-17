import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CarouselDashboard.css';
import { supabase } from '../../lib/supabase'; // Sesuaikan path jika berbeda

const CarouselDashboard = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banner images dari tabel img-assets dengan filter assets = 'Banner'
  const fetchBannerImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query data dari tabel img-assets dengan filter assets = 'Banner'
      const { data: images, error } = await supabase
        .from('img-assets')
        .select('*')
        .eq('assets', 'Banner')
        .order('created_at', { ascending: true }); // Urutkan berdasarkan created_at

      if (error) {
        throw error;
      }

      if (images && images.length > 0) {
        // Format data untuk carousel
        const formattedImages = images.map((image, index) => ({
          id: image.id,
          name: image.name,
          url: image.imgUrl, // Menggunakan imgUrl dari database
          alt: `Banner ${image.name}` || `Banner ${index + 1}`
        }));

        setBannerImages(formattedImages);
      } else {
        setError('Tidak ada gambar banner yang ditemukan');
      }
    } catch (error) {
      console.error('Error fetching banner images:', error);
      setError('Gagal memuat gambar banner: ' + error.message);
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
        <div className="d-flex justify-content-center align-items-center" style={{ height: 'auto' }}>
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
          <p className="text-muted">Tidak ada gambar banner untuk ditampilkan</p>
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
            style={{
              height: '700px', // Sesuaikan tinggi sesuai kebutuhan
              objectFit: 'cover' // Memastikan gambar terpotong dengan baik
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CarouselDashboard;