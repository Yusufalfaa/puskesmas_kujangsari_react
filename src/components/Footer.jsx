import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Footer.css';

const Footer = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data kontak dari Supabase
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
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

  // Fungsi untuk mendapatkan icon berdasarkan contact_type
  const getContactIcon = (contactType) => {
    const type = contactType.toLowerCase();
    switch (type) {
      case 'whatsapp':
        return 'fab fa-whatsapp';
      case 'phone':
        return 'fas fa-phone-alt';
      case 'instagram':
        return 'fab fa-instagram';
      case 'email':
        return 'fas fa-envelope';
      default:
        return 'fas fa-info-circle';
    }
  };

  // Fungsi untuk mendapatkan link berdasarkan contact_type dan value
  const getContactLink = (contactType, value) => {
    const type = contactType.toLowerCase();
    switch (type) {
      case 'whatsapp':
        // Format nomor WhatsApp (hapus karakter non-digit kecuali +)
        const whatsappNumber = value.replace(/[^\d+]/g, '');
        return `https://wa.me/${whatsappNumber}`;
      case 'phone':
        // Format nomor telepon (hapus karakter non-digit)
        const phoneNumber = value.replace(/[^\d]/g, '');
        return `tel:${phoneNumber}`;
      case 'instagram':
        // Format username Instagram
        const username = value.startsWith('@') ? value.substring(1) : value;
        return `https://instagram.com/${username}`;
      case 'email':
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${value}`;
      default:
        return '#';
    }
  };

  // Fungsi untuk menentukan apakah link harus dibuka di tab baru
  const shouldOpenInNewTab = (contactType) => {
    const type = contactType.toLowerCase();
    return ['whatsapp', 'instagram', 'email'].includes(type);
  };

  if (loading) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>Puskesmas Kujangsari</h3>
            <p>Loading contacts...</p>
          </div>
          <div className="footer-right">
            <p>&copy; IUM-033</p>
          </div>
        </div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <h3>Puskesmas Kujangsari</h3>
            <p>Error loading contacts: {error}</p>
          </div>
          <div className="footer-right">
            <p>&copy; IUM-033</p>
          </div>
        </div>
      </footer>
    );
  }

  // Mengelompokkan kontak berdasarkan contact_type
  const groupedContacts = contacts.reduce((acc, contact) => {
    const type = contact.contact_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(contact);
    return acc;
  }, {});

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>Puskesmas Kujangsari</h3>
          <ul>
            {Object.entries(groupedContacts).map(([contactType, contactList]) => (
              <li key={contactType} className="contact-group">
                <i className={getContactIcon(contactType)}></i>
                <span className="contact-values">
                  {contactList.map((contact, index) => (
                    <span key={contact.id}>
                      <a
                        href={getContactLink(contact.contact_type, contact.value)}
                        target={shouldOpenInNewTab(contact.contact_type) ? "_blank" : "_self"}
                        rel={shouldOpenInNewTab(contact.contact_type) ? "noopener noreferrer" : undefined}
                        className="contact-link"
                      >
                        {contact.value}
                      </a>
                      {index < contactList.length - 1 && <span className="contact-separator">, </span>}
                    </span>
                  ))}
                </span>
              </li>
            ))}
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