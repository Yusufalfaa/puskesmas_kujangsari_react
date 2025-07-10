import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase'; // Pastikan path ini sesuai dengan struktur project Anda
import './SaranKeluhan.css';

const SaranKeluhan = () => {
  const [content, setContent] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch content dari table text-content dengan categories "Saran Keluhan"
        const { data: textData, error: textError } = await supabase
          .from('text-content')
          .select('description')
          .eq('categories', 'Saran Keluhan')
          .single();

        if (textError) {
          console.error('Error fetching text content:', textError);
          setError('Gagal mengambil konten teks');
          return;
        }

        // Fetch redirect URL dari table redirect-pages-url dengan categories "Saran Keluhan"
        const { data: urlData, error: urlError } = await supabase
          .from('redirect-pages-url')
          .select('pagesUrl')
          .eq('categories', 'Saran Keluhan')
          .single();

        if (urlError) {
          console.error('Error fetching redirect URL:', urlError);
          setError('Gagal mengambil URL redirect');
          return;
        }

        setContent(textData.description || '');
        setRedirectUrl(urlData.pagesUrl || '');
        
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan yang tidak terduga');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleButtonClick = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank', 'noopener noreferrer');
    } else {
      alert('URL tidak tersedia');
    }
  };

  const handleSettingsClick = () => {
    navigate('/admin-config-saranKeluhan');
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="config-saranKeluhan-loading">
        <div className="loading-spinner"></div><p>Memuat data...</p>
      </div>
  );

  return (
    <div>
      <div className="banner">
        <h1>SARAN DAN KELUHAN</h1>
        <p>Anda dapat memberikan saran atau keluhan kepada pihak puskesmas di bawah ini.</p>
        <button className="settings-btn-tenagaKerja" onClick={handleSettingsClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
      </div>

      <div className="content">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-container">
            <p>Terjadi kesalahan: {error}</p>
          </div>
        ) : (
          <>
            <div>
              {content ? (
                content.split("\n").map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: "1rem" }}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>Konten tidak tersedia</p>
              )}
            </div>
            
            <button
              className="btn-saran"
              onClick={handleButtonClick}
              disabled={!redirectUrl}
            >
              Saran dan Keluhan Puskesmas Kujangsari
            </button>
            
            <p>
              Terima kasih atas partisipasi dan perhatian Anda. Masukan yang diberikan akan kami tindak lanjuti demi perbaikan layanan yang berkelanjutan.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SaranKeluhan;