import React from 'react';
import './FloatingWhatsAppIcon.css';

const FloatingWhatsAppIcon = ({ phoneNumber, message }) => {

  const defaultPhoneNumber = '6282129690500';
  const defaultMessage = 'Halo, saya ingin bertanya tentang layanan Puskesmas Kujangsari.';

  const whatsappLink = `https://wa.me/${phoneNumber || defaultPhoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;

  return (
    <a 
      href={whatsappLink} 
      className="floating-whatsapp-icon" 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
    >
      <img src={require('../../assets2/Whatsapp-Logo.png')} alt="WhatsApp" /> {/* Path gambar diperbarui */}
    </a>
  );
};

export default FloatingWhatsAppIcon;