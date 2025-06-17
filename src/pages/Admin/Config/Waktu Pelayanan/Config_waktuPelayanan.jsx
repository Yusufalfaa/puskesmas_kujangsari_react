import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Config_waktuPelayanan.css';

const ConfigWaktuPelayanan = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    day: '',
    time_start: '',
    time_end: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    day: '',
    time_start: '',
    time_end: ''
  });

  const navigate = useNavigate();

  const daysOfWeek = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  ];

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('id');

      if (error) throw error;
      
      setScheduleData(data || []);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      day: schedule.day,
      time_start: schedule.time_start,
      time_end: schedule.time_end
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      day: '',
      time_start: '',
      time_end: ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('schedule')
        .update({
          day: editForm.day,
          time_start: editForm.time_start,
          time_end: editForm.time_end,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchScheduleData();
      setEditingId(null);
      setEditForm({
        day: '',
        time_start: '',
        time_end: ''
      });
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError(err.message);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase
        .from('schedule')
        .insert([{
          day: addForm.day,
          time_start: addForm.time_start,
          time_end: addForm.time_end
        }]);

      if (error) throw error;

      await fetchScheduleData();
      setShowAddForm(false);
      setAddForm({
        day: '',
        time_start: '',
        time_end: ''
      });
    } catch (err) {
      console.error('Error adding schedule:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchScheduleData();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err.message);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading">Memuat data jadwal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="config-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="config-container">
      <div className="config-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Kembali
        </button>
        <h1>Konfigurasi Waktu Pelayanan</h1>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tambah Jadwal
        </button>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <h3>Tambah Jadwal Baru</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="form-group">
                <label>Hari:</label>
                <select
                  value={addForm.day}
                  onChange={(e) => setAddForm({...addForm, day: e.target.value})}
                  required
                >
                  <option value="">Pilih Hari</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Waktu Mulai:</label>
                <input
                  type="time"
                  value={addForm.time_start}
                  onChange={(e) => setAddForm({...addForm, time_start: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Waktu Selesai:</label>
                <input
                  type="time"
                  value={addForm.time_end}
                  onChange={(e) => setAddForm({...addForm, time_end: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                  Batal
                </button>
                <button type="submit" className="save-btn">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hari</th>
              <th>Waktu Mulai</th>
              <th>Waktu Selesai</th>
              <th>Dibuat</th>
              <th>Diperbarui</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((schedule) => (
              <tr key={schedule.id}>
                <td>{schedule.id}</td>
                <td>
                  {editingId === schedule.id ? (
                    <select
                      value={editForm.day}
                      onChange={(e) => setEditForm({...editForm, day: e.target.value})}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  ) : (
                    schedule.day
                  )}
                </td>
                <td>
                  {editingId === schedule.id ? (
                    <input
                      type="time"
                      value={editForm.time_start}
                      onChange={(e) => setEditForm({...editForm, time_start: e.target.value})}
                    />
                  ) : (
                    formatTime(schedule.time_start)
                  )}
                </td>
                <td>
                  {editingId === schedule.id ? (
                    <input
                      type="time"
                      value={editForm.time_end}
                      onChange={(e) => setEditForm({...editForm, time_end: e.target.value})}
                    />
                  ) : (
                    formatTime(schedule.time_end)
                  )}
                </td>
                <td>{formatDateTime(schedule.created_at)}</td>
                <td>{formatDateTime(schedule.updated_at)}</td>
                <td>
                  <div className="action-buttons">
                    {editingId === schedule.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="save-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button onClick={handleCancelEdit} className="cancel-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(schedule)} className="edit-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(schedule.id)} className="delete-btn">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {scheduleData.length === 0 && (
          <div className="no-data">
            <p>Belum ada data jadwal waktu pelayanan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigWaktuPelayanan;