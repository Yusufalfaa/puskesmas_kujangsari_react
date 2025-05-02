import React, { useState } from 'react';
import './TentangPuskesmas.css';
import { Container, Row, Col } from 'react-bootstrap';

const TentangPuskesmas = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupImage, setPopupImage] = useState("");

  // Fungsi untuk membuka pop-up gambar
  const openPopup = (imageSrc) => {
    setPopupImage(imageSrc);
    setShowPopup(true);
  };

  // Fungsi untuk menutup pop-up
  const closePopup = () => {
    setShowPopup(false);
    setPopupImage("");
  };

  return (
    <div>
      <div className="banner">
        <h1>PROFIL PUSKESMAS KUJANGSARI</h1>
        <p>Semua yang perlu Anda ketahui tentang Puskesmas Kujangsari tersedia di sini.</p>
      </div>

      <div className="content">
        <section className="tentang-kami">
          <h2>Tentang Kami</h2>
          <Container>
            <Row>
              <Col md={6} className="text-column">
                <p>
                  Puskesmas Kujangsari berdiri sejak tahun 1989. Awal berdiri Puskesmas Kujangsari bernama Puskesmas Buah Batu dan berlokasi di Pasar Kordon. Sejak tahun 2004 Puskesmas pindah ke Jl. Terusan Buah Batu No. 314 dan pada tahun 2008 beganti nama menjadi Puskesmas Kujangsari.
                  <br /><br />
                  Wilayah kerja kami terdiri dari Kelurahan Kujangsari dan Batununggal. Luas wilayah kami yaitu 600,098 Ha, dengan 313,76 Ha luas wilayah daerah binaan.
                  <br /><br />
                  Puskesmas kami menyediakan Pelayanan Rawat Jalan dalam Gedung Upaya Kesehatan Perseorangan (UKP) dan Pelayanan Luar Gedung (Upaya Kesehatan Masyarakat). Sejak September tahun 2024 kami menyelenggarakan Integrasi Layanan Primer (ILP) yang mendukung terlayaninya kesehatan seluruh masyarakat berdasarkan siklus hidup.
                </p>
              </Col>
              <Col md={6} className="image-column">
                <img
                  src="/assets/tentangkami.jpg"
                  alt="Puskesmas Kujangsari"
                  onClick={() => openPopup("/assets/tentangkami.jpg")}
                />
              </Col>
            </Row>
          </Container>
        </section>

        <section className="visi-misi">
          <h2>Visi & Misi</h2>
          <Container>
            <Row>
              <Col className="section-image-container">
                <img
                  src="/assets/visiMisi.jpeg"
                  alt="Visi Misi"
                  onClick={() => openPopup("/assets/visiMisi.jpeg")}
                />
              </Col>
            </Row>
          </Container>
        </section>

        <section className="motto-tata-nilai">
          <h2>Motto & Tata Nilai</h2>
          <Container>
            <Row>
              <Col md={6} className="section-image-container">
                <img
                  src="/assets/motto.jpeg"
                  alt="Motto"
                  onClick={() => openPopup("/assets/motto.jpeg")}
                />
              </Col>
              <Col md={6} className="section-image-container">
                <img
                  src="/assets/tataNilai.jpeg"
                  alt="Tata Nilai"
                  onClick={() => openPopup("/assets/tataNilai.jpeg")}
                />
              </Col>
            </Row>
          </Container>
        </section>

        <section className="struktur-organisasi">
          <h2>Struktur Organisasi</h2>
          <Container>
            <Row>
              <Col className="section-image-container">
                <img
                  src="/assets/strukturOrganisasi.jpeg"
                  alt="Struktur Organisasi"
                  onClick={() => openPopup("/assets/strukturOrganisasi.jpeg")}
                />
              </Col>
            </Row>
          </Container>
        </section>
      </div>

      {/* Pop-up Gambar */}
      {showPopup && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <img src={popupImage} alt="Pop-up" />
            <button className="close-btn" onClick={closePopup}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TentangPuskesmas;
