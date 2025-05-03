import React from 'react';
import './Kontak.css';
import { FaWhatsapp, FaInstagram, FaPhoneAlt } from 'react-icons/fa';

const Kontak = () => {
  return (
    <div>
      <div className="banner">
        <h1>KONTAK KAMI</h1>
        <p>Anda dapat menghubungi kami melalui kontak di bawah ini.</p>
      </div>
      
      <div className="content">

      <a href="https://wa.me/6282129690500" target="_blank" rel="noopener noreferrer">
        <div className="contact-box">
          <FaWhatsapp size={92} />
          <p>+62 82129690500</p>
        </div>
      </a>

      <a href="https://instagram.com/uptd_puskesmaskujangsari" target="_blank" rel="noopener noreferrer">
        <div className="contact-box">
          <FaInstagram size={92}/>
          <p>@uptd_puskesmaskujangsari</p>
        </div>
      </a>

      <a href="tel:0227530456">
        <div className="contact-box">
          <FaPhoneAlt size={92}/>
          <p>(022) 7530456</p>
        </div>
      </a>
      </div>

      <h2>Lokasi Puskesmas Kujangsari</h2>
      <div className="maps-container">
        <div className="map-responsive">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3767112115115!2d107.63529177500814!3d-6.964809868193736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e84c699369eb%3A0xefed71cd08faafb!2sPuskesmas%20Kujangsari!5e0!3m2!1sen!2sid!4v1746241511501!5m2!1sen!2sid"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Peta Puskesmas Kujangsari"
          ></iframe>
        </div>
      </div>

    </div>
  );
};

export default Kontak;
