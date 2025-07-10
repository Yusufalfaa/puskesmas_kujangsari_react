import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import './TenagaKerja.css';

const Admin_TenagaKerja = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          id: item.id,
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

  const handleSettingsClick = () => {
    navigate('/admin-config-tenagakerja');
  };

  if (loading) {
    return (
      <div>
        <div className="banner">
          <h1>DAFTAR TENAGA KERJA</h1>
          <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
          <button className="settings-btn-tenagaKerja" onClick={handleSettingsClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        <div className="config-saranKeluhan-loading">
        <div className="loading-spinner"></div><p>Memuat data...</p>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="banner">
          <h1>DAFTAR TENAGA KERJA</h1>
          <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
          <button className="settings-btn-tenagaKerja" onClick={handleSettingsClick}>
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
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
        <h1>DAFTAR TENAGA KERJA</h1>
        <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
        <button className="settings-btn-tenagaKerja" onClick={handleSettingsClick}>
          <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
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
                    loading="lazy"
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

export default Admin_TenagaKerja;