import React from 'react';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Puskesmas Kujangsari</h3>
        <ul>
          <li><i className="fab fa-whatsapp"></i> +6282129690500</li>
          <li><i className="fas fa-phone-alt"></i> (022) 7530465</li>
          <li><i className="fab fa-instagram"></i> @uptd_puskesmaskujangsari</li>
          <li><i className="fas fa-envelope"></i> uptdpkmkujangsari@gmail.com</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
