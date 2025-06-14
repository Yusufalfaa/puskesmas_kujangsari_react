import React from 'react';
import './Footer.css'; 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>Puskesmas Kujangsari</h3>
          <ul>
            <a href="https://wa.me/+6282129690500" target="_blank" rel="noopener noreferrer">
              <li><i className="fab fa-whatsapp"></i> +6282129690500</li>
            </a>
            <a href="tel:02287504989">
              <li><i className="fas fa-phone-alt"></i> (022) 87504989</li>
            </a>
            <a href="https://instagram.com/uptd_puskesmaskujangsari" target="_blank" rel="noopener noreferrer">
              <li><i className="fab fa-instagram"></i> @uptd_puskesmaskujangsari</li>
            </a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=uptpkmkujangsari@gmail.com" target="_blank" rel="noopener noreferrer">
            <li><i className="fas fa-envelope"></i> uptpkmkujangsari@gmail.com</li>
            </a>
          </ul>
        </div>

        <div className="footer-right">
          <p>&copy; IUM-033</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
