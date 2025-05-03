import React from 'react';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>Puskesmas Kujangsari</h3>
          <ul>
            <a href="https://wa.me/6282129690500" target="_blank" rel="noopener noreferrer">
              <li><i className="fab fa-whatsapp"></i> +6282129690500</li>
            </a>
            <a href="tel:0227530456">
              <li><i className="fas fa-phone-alt"></i> (022) 7530465</li>
            </a>
            <a href="https://instagram.com/uptd_puskesmaskujangsari" target="_blank" rel="noopener noreferrer">
              <li><i className="fab fa-instagram"></i> @uptd_puskesmaskujangsari</li>
            </a>
            <li><i className="fas fa-envelope"></i> uptdpkmkujangsari@gmail.com</li>
          </ul>
        </div>

        <div className="footer-right">
          <p>&copy; 2025 Muhamad Yusuf Al Farizzi</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
