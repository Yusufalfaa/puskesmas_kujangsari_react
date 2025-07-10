import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CarouselDashboard.css'; // Pastikan file CSS ini diimpor
import { supabase } from '../../lib/supabase'; // Sesuaikan path jika berbeda

const CarouselDashboard = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBannerImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: images, error: fetchError } = await supabase
        .from('img-assets')
        .select('*')
        .eq('assets', 'Banner')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (images && images.length > 0) {
        const formattedImages = images.map((image, index) => ({
          id: image.id,
          name: image.name,
          url: image.imgUrl,
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

  useEffect(() => {
    fetchBannerImages();
  }, []);

  // Kondisi loading, error, dan no images harus tetap di dalam carousel-dashboard-container
  // agar gaya penempatan dan ukuran tetap diterapkan pada kontainer ini
  if (loading) {
    return (
      <div className="carousel-dashboard-container carousel-loading-spinner">
        <div className="d-flex justify-content-center align-items-center" style={{ height: 'auto' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3 text-muted">Memuat banner...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-dashboard-container carousel-error-container">
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

  if (bannerImages.length === 0) {
    return (
      <div className="carousel-dashboard-container carousel-empty-container">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <p className="text-muted">Tidak ada gambar banner untuk ditampilkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-dashboard-container"> {/* <--- KUNCI: KEMBALIKAN WRAPPER INI */}
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
              className="d-block w-100 carousel-image-custom" /* Tambahkan kelas kustom */
              src={image.url} 
              alt={image.alt}
              onError={(e) => {
                // Fallback image jika gagal load
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNjAwIiB5PSIyMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCI+R2FnYWwgTWVtdWF0IEJhbm5lcjwvdGV4dD48L3N2Zz4=';
              }}
              // Hapus gaya inline di sini
              // style={{ height: '700px', objectFit: 'cover' }} 
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselDashboard;