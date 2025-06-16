import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './Galeri.css';

const TenagaKerja = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSDMData();
  }, []);

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

  const fetchSDMData = async () => {
    try {
      setLoading(true);

      const { data: sdmData, error } = await supabase
        .from('sdm')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const groupedData = sdmData.reduce((acc, item) => {
        const category = item.jobdesk;
        if (!acc[category]) {
          acc[category] = [];
        }

        const formattedName = formatNameWithTitle(item.name, item.degree);

        acc[category].push({
          fileName: formattedName,
          src: item.profilePictureUrl,
          name: item.name,
          degree: item.degree,
        });

        return acc;
      }, {});

      setData(groupedData);
    } catch (error) {
      console.error('Error fetching SDM data:', error);
      setError('Gagal memuat data tenaga kerja');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="banner">
          <h1>GALERI</h1>
          <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
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
          <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchSDMData}>Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="banner">
        <h1>GALERI</h1>
        <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
      </div>

      <div className="tenaga-container">
        {Object.entries(data).map(([category, items]) => (
          <div key={category} className="tenaga-section">
            <h2>{category}</h2>
            <div className="tenaga-grid">
              {items.map((item, index) => (
                <div key={`${category}-${index}`} className="tenaga-card">
                  <img
                    src={item.src}
                    alt={item.fileName}
                    loading="lazy" // Lazy loading di sini
                    className="tenaga-image"
                    onError={(e) => {
                      e.target.src = '/assets/placeholder-avatar.png';
                    }}
                  />
                  <p className="tenaga-name">{item.fileName}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenagaKerja;
