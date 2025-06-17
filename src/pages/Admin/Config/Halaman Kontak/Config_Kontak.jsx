import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import './Config_Kontak.css';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Config_Kontak = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    contact_type: 'WhatsApp',
    value: ''
  });
  const navigate = useNavigate();

  // Fetch semua data kontak dari Supabase
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

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

  // Mulai edit kontak
  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setEditForm({
      contact_type: contact.contact_type,
      value: contact.value
    });
  };

  // Batalkan edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Simpan perubahan edit
  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          contact_type: editForm.contact_type,
          value: editForm.value,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      // Refresh data
      await fetchContacts();
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Error updating contact: ' + err.message);
    }
  };

  // Hapus kontak
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kontak ini?')) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Refresh data
        await fetchContacts();
      } catch (err) {
        console.error('Error deleting contact:', err);
        alert('Error deleting contact: ' + err.message);
      }
    }
  };

  // Tambah kontak baru
  const handleAddContact = async () => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert([{
          contact_type: addForm.contact_type,
          value: addForm.value,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      // Reset form dan refresh data
      setAddForm({
        contact_type: 'WhatsApp',
        value: ''
      });
      setShowAddForm(false);
      await fetchContacts();
    } catch (err) {
      console.error('Error adding contact:', err);
      alert('Error adding contact: ' + err.message);
    }
  };

  // Kembali ke halaman kontak
  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Batasi tipe kontak yang bisa diedit
  const editableContactTypes = ['WhatsApp', 'Phone', 'Instagram'];
  const contactTypes = ['WhatsApp', 'Phone', 'Instagram'];

  // Cek apakah kontak bisa diedit
  const isEditable = (contactType) => {
    return editableContactTypes.includes(contactType);
  };

  return (
    <div className="config-kontak-container">
      {/* Header */}
      <div className="config-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft />
          </button>
          <h1>Konfigurasi Kontak</h1>
        </div>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> Tambah Kontak
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tambah Kontak Baru</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tipe Kontak:</label>
                <select
                  value={addForm.contact_type}
                  onChange={(e) => setAddForm({...addForm, contact_type: e.target.value})}
                >
                  {contactTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Nilai:</label>
                <input
                  type="text"
                  value={addForm.value}
                  onChange={(e) => setAddForm({...addForm, value: e.target.value})}
                  placeholder="Masukkan nilai kontak"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </button>
              <button 
                className="save-button"
                onClick={handleAddContact}
                disabled={!addForm.value.trim()}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <p>Loading data kontak...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Tabel Kontak */}
      {!loading && !error && (
        <div className="table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipe Kontak</th>
                <th>Nilai</th>
                <th>Dibuat</th>
                <th>Diperbarui</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.id}</td>
                  <td>
                    {editingId === contact.id ? (
                      <select
                        value={editForm.contact_type}
                        onChange={(e) => setEditForm({...editForm, contact_type: e.target.value})}
                      >
                        {contactTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`contact-type ${contact.contact_type.toLowerCase()}`}>
                        {contact.contact_type}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingId === contact.id ? (
                      <input
                        type="text"
                        value={editForm.value}
                        onChange={(e) => setEditForm({...editForm, value: e.target.value})}
                      />
                    ) : (
                      contact.value
                    )}
                  </td>
                  <td>{formatDate(contact.created_at)}</td>
                  <td>{formatDate(contact.updated_at)}</td>
                  <td>
                    <div className="action-buttons">
                      {editingId === contact.id ? (
                        <>
                          <button 
                            className="save-btn"
                            onClick={handleSaveEdit}
                          >
                            <FaSave />
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          {isEditable(contact.contact_type) && (
                            <button 
                              className="edit-btn"
                              onClick={() => handleEdit(contact)}
                            >
                              <FaEdit />
                            </button>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(contact.id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {contacts.length === 0 && (
            <div className="empty-state">
              <p>Belum ada data kontak.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Config_Kontak;