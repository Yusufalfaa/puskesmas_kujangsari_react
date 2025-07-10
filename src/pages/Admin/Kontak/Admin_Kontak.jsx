import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import './Kontak.css';
import { FaWhatsapp, FaInstagram, FaPhoneAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate untuk navigasi

// Konfigurasi Supabase

const Kontak = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook untuk navigasi

  // Fetch data kontak dari Supabase (hanya WhatsApp, Instagram, Phone)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .in('contact_type', ['WhatsApp', 'Instagram', 'Phone'])
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        setContacts(data || []);
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Fungsi untuk navigasi ke halaman admin config kontak
  const handleSettingsClick = () => {
    navigate('/admin-config-halamanKontak');
  };

  // Mengelompokkan kontak berdasarkan contact_type
  const groupedContacts = contacts.reduce((acc, contact) => {
    const type = contact.contact_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(contact);
    return acc;
  }, {});

  // Fungsi untuk mendapatkan icon berdasarkan contact_type
  const getContactIcon = (contactType) => {
    const type = contactType.toLowerCase();
    switch (type) {
      case 'whatsapp':
        return <FaWhatsapp size={92} />;
      case 'instagram':
        return <FaInstagram size={92} />;
      case 'phone':
        return <FaPhoneAlt size={92} />;
      default:
        return <FaPhoneAlt size={92} />;
    }
  };

  // Fungsi untuk mendapatkan link berdasarkan contact_type dan value
  const getContactLink = (contactType, value) => {
    const type = contactType.toLowerCase();
    switch (type) {
      case 'whatsapp':
        const whatsappNumber = value.replace(/[^\d+]/g, '');
        return `https://wa.me/${whatsappNumber}`;
      case 'phone':
        const phoneNumber = value.replace(/[^\d]/g, '');
        return `tel:${phoneNumber}`;
      case 'instagram':
        const username = value.startsWith('@') ? value.substring(1) : value;
        return `https://instagram.com/${username}`;
      default:
        return '#';
    }
  };

  // Fungsi untuk menentukan apakah link harus dibuka di tab baru
  const shouldOpenInNewTab = (contactType) => {
    const type = contactType.toLowerCase();
    return ['whatsapp', 'instagram'].includes(type);
  };

  // Urutan tampilan kontak
  const displayOrder = ['WhatsApp', 'Instagram', 'Phone'];

  return (
    <div>
      <div className="banner">
        {/* Tombol Settings di pojok kanan atas */}
        <div className="settings-container">
          <button 
            className="settings-btn-kontak"
            onClick={handleSettingsClick}
            title="Konfigurasi Kontak"
          >
            <svg className="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
        
        <h1>KONTAK KAMI</h1>
        <p>Anda dapat menghubungi kami melalui kontak di bawah ini.</p>
      </div>
      
      <div className="content">
        {loading && (
            <div className="config-saranKeluhan-loading">
        <div className="loading-spinner"></div><p>Memuat data...</p>
      </div>
        )}

        {error && (
          <div className="error-container">
            <p>Error loading contacts: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {displayOrder.map((contactType) => {
              const contactList = groupedContacts[contactType];
              if (!contactList || contactList.length === 0) return null;

              // Jika ada multiple contacts dengan tipe yang sama, tampilkan yang pertama
              // Atau bisa dimodifikasi untuk menampilkan semua
              const primaryContact = contactList[0];

              return (
                <a
                  key={contactType}
                  href={getContactLink(primaryContact.contact_type, primaryContact.value)}
                  target={shouldOpenInNewTab(primaryContact.contact_type) ? "_blank" : "_self"}
                  rel={shouldOpenInNewTab(primaryContact.contact_type) ? "noopener noreferrer" : undefined}
                >
                  <div className="contact-box">
                    {getContactIcon(primaryContact.contact_type)}
                    <p>{primaryContact.value}</p>
                    {contactList.length > 1 && (
                      <span className="multiple-indicator">+{contactList.length - 1} more</span>
                    )}
                  </div>
                </a>
              );
            })}
          </>
        )}
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