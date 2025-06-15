import React, { useEffect, useState } from 'react';
import './TenagaKerja.css';

const TenagaKerja = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch('/assets/sdm-data.json')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  return (
    <div>
      <div className="banner">
        <h1>DAFTAR TENAGA KERJA</h1>
        <p>Informasi mengenai tenaga kesehatan dan staf yang bekerja di Puskesmas Kujangsari.</p>
      </div>

      <div className="tenaga-container">
        {Object.entries(data).map(([category, images]) => (
          <div key={category} className="tenaga-section">
            <h2>{category}</h2>
            <div className="tenaga-grid">
              {images.map(({ fileName, src }) => (
                <div key={src} className="tenaga-card">
                  <img src={src} alt={fileName} className="tenaga-image" />
                  <p className="tenaga-name">{fileName}</p>
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
