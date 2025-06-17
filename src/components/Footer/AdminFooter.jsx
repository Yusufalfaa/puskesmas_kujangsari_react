import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './AdminFooter.css';

const AdminFooter = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

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

  const getContactIcon = (contactType) => {
    const type = contactType.toLowerCase();
    switch (type) {
      case 'whatsapp': return 'fab fa-whatsapp';
      case 'phone': return 'fas fa-phone-alt';
      case 'instagram': return 'fab fa-instagram';
      case 'email': return 'fas fa-envelope';
      default: return 'fas fa-info-circle';
    }
  };

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
      case 'email':
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${value}`;
      default:
        return '#';
    }
  };

  const shouldOpenInNewTab = (contactType) => {
    const type = contactType.toLowerCase();
    return ['whatsapp', 'instagram', 'email'].includes(type);
  };

  const handleConfigClick = () => {
    navigate('/admin-config-kontak');
  };

  const groupedContacts = contacts.reduce((acc, contact) => {
    const type = contact.contact_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(contact);
    return acc;
  }, {});

  return (
    <footer className="admin-footer">
      <div className="admin-footer-content">
        <div className="admin-footer-settings">
          <button
            className="settings-btn"
            onClick={handleConfigClick}
            title="Kelola Kontak"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>

        <div className="admin-footer-left">
          <h3>Puskesmas Kujangsari</h3>
          {loading ? (
            <p>Loading contacts...</p>
          ) : error ? (
            <p>Error loading contacts: {error}</p>
          ) : (
            <ul>
              {Object.entries(groupedContacts).map(([contactType, contactList]) => (
                <li key={contactType} className="admin-contact-group">
                  <i className={getContactIcon(contactType)}></i>
                  <span className="admin-contact-values">
                    {contactList.map((contact, index) => (
                      <span key={contact.id}>
                        <a
                          href={getContactLink(contact.contact_type, contact.value)}
                          target={shouldOpenInNewTab(contact.contact_type) ? '_blank' : '_self'}
                          rel={shouldOpenInNewTab(contact.contact_type) ? 'noopener noreferrer' : undefined}
                          className="admin-contact-link"
                        >
                          {contact.value}
                        </a>
                        {index < contactList.length - 1 && (
                          <span className="admin-contact-separator">, </span>
                        )}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-footer-right">
          <p>&copy; IUM-033</p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
