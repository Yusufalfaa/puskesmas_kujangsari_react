import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Pastikan path ini sesuai dengan struktur project Anda
import './SaranKeluhan.css';

const SaranKeluhan = () => {
  const [content, setContent] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="saranKeluhan-loading">
        <div className="loading-spinner"></div><p>Memuat data...</p>
      </div>
  );

  return (
    <div>
      <div className="banner">
        <h1>SARAN DAN KELUHAN</h1>
        <p>Anda dapat memberikan saran atau keluhan kepada pihak puskesmas di bawah ini.</p>
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