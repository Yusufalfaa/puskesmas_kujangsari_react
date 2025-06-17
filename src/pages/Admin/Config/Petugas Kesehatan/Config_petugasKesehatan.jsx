import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Config_petugasKesehatan.css';

const ConfigPetugasKesehatan = () => {
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [sdmList, setSdmList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    doctor_id: '',
    day: '',
    time_start: '',
    time_end: ''
  });
  
  // State untuk modal
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    doctor_id: '',
    day: 'Senin',
    time_start: '08:00',
    time_end: '16:00'
  });
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();
  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('doctor-schedule')
        .select(`
          *,
          sdm (
            id,
            name,
            jobdesk,
            degree
          )
        `);

      if (scheduleError) throw scheduleError;

      const { data: sdmData, error: sdmError } = await supabase
        .from('sdm')
        .select('*')
        .order('name');

      if (sdmError) throw sdmError;

      // Urutkan berdasarkan hari -> nama
      const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

      const sortedSchedule = (scheduleData || []).sort((a, b) => {
        const dayA = dayOrder.indexOf(a.day);
        const dayB = dayOrder.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;

        const nameA = a.sdm?.name?.toLowerCase() || '';
        const nameB = b.sdm?.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });

      setDoctorSchedules(sortedSchedule);
      setSdmList(sdmData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.id);
    setEditForm({
      doctor_id: schedule.doctor_id,
      day: schedule.day,
      time_start: schedule.time_start,
      time_end: schedule.time_end
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      doctor_id: '',
      day: '',
      time_start: '',
      time_end: ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from('doctor-schedule')
        .update({
          doctor_id: editForm.doctor_id,
          day: editForm.day,
          time_start: editForm.time_start,
          time_end: editForm.time_end
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchData();
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      try {
        const { error } = await supabase
          .from('doctor-schedule')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchData();
      } catch (err) {
        console.error('Error deleting schedule:', err);
        setError(err.message);
      }
    }
  };

  const handleOpenModal = () => {
    if (!sdmList.length) {
      alert('Data SDM belum tersedia. Tidak bisa menambahkan jadwal.');
      return;
    }
    
    // Reset form dengan nilai default
    setModalForm({
      doctor_id: sdmList[0]?.id || '',
      day: 'Senin',
      time_start: '08:00',
      time_end: '16:00'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalForm({
      doctor_id: '',
      day: 'Senin',
      time_start: '08:00',
      time_end: '16:00'
    });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!modalForm.doctor_id || !modalForm.day || !modalForm.time_start || !modalForm.time_end) {
      alert('Semua field harus diisi!');
      return;
    }

    // Validasi waktu
    if (modalForm.time_start >= modalForm.time_end) {
      alert('Waktu mulai harus lebih awal dari waktu selesai!');
      return;
    }

    try {
      setModalLoading(true);
      
      const { error } = await supabase
        .from('doctor-schedule')
        .insert([{
          doctor_id: modalForm.doctor_id,
          day: modalForm.day,
          time_start: modalForm.time_start,
          time_end: modalForm.time_end
        }]);

      if (error) throw error;

      await fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error adding new schedule:', err);
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const formatNameWithDegree = (name, degree) => {
    if (!name) return 'Nama tidak tersedia';
    if (!degree) return name;
    const frontDegrees = ['dr.', 'drg.', 'Dr.'];
    return frontDegrees.includes(degree) ? `${degree} ${name}` : `${name}, ${degree}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Tidak tersedia';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    };
    return date.toLocaleString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading">Memuat data...</div>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali
        </button>
        <h1>Konfigurasi Petugas Kesehatan</h1>
        <button className="add-btn" onClick={handleOpenModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tambah Jadwal
        </button>
      </div>

      <div className="table-container">
        <table className="config-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Petugas</th>
              <th>Jabatan</th>
              <th>Hari</th>
              <th>Waktu Mulai</th>
              <th>Waktu Selesai</th>
              <th>Dibuat</th>
              <th>Diperbarui</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {doctorSchedules.map((schedule, index) => (
              <tr key={schedule.id}>
                <td>{index + 1}</td>
                <td>
                  {editingId === schedule.id ? (
                    <select
                      value={editForm.doctor_id}
                      onChange={(e) => setEditForm({ ...editForm, doctor_id: e.target.value })}
                      className="edit-input"
                    >
                      {sdmList.map(sdm => (
                        <option key={sdm.id} value={sdm.id}>
                          {formatNameWithDegree(sdm.name, sdm.degree)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    formatNameWithDegree(schedule.sdm?.name, schedule.sdm?.degree)
                  )}
                </td>
                <td>{schedule.sdm?.jobdesk || 'Tidak tersedia'}</td>
                <td>
                  {editingId === schedule.id ? (
                    <select
                      value={editForm.day}
                      onChange={(e) => setEditForm({ ...editForm, day: e.target.value })}
                      className="edit-input"
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
                      value={formatTime(editForm.time_start)}
                      onChange={(e) => setEditForm({ ...editForm, time_start: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    formatTime(schedule.time_start)
                  )}
                </td>
                <td>
                  {editingId === schedule.id ? (
                    <input
                      type="time"
                      value={formatTime(editForm.time_end)}
                      onChange={(e) => setEditForm({ ...editForm, time_end: e.target.value })}
                      className="edit-input"
                    />
                  ) : (
                    formatTime(schedule.time_end)
                  )}
                </td>
                <td className="datetime-col">{formatDateTime(schedule.created_at)}</td>
                <td className="datetime-col">{formatDateTime(schedule.updated_at)}</td>
                <td>
                  <div className="action-buttons">
                    {editingId === schedule.id ? (
                      <>
                        <button className="save-btn" onClick={handleSaveEdit}>
                          ✔
                        </button>
                        <button className="cancel-btn" onClick={handleCancelEdit}>
                          ✖
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => handleEdit(schedule)}>
                          ✎
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(schedule.id)}>
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {doctorSchedules.length === 0 && (
          <div className="no-data">
            <p>Belum ada jadwal petugas kesehatan yang tersedia.</p>
          </div>
        )}
      </div>

      {/* Modal untuk tambah jadwal baru */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Jadwal Baru</h2>
            </div>            
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-doctor">Petugas Kesehatan*</label>
                <select
                  id="modal-doctor"
                  value={modalForm.doctor_id}
                  onChange={(e) => setModalForm({ ...modalForm, doctor_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Petugas</option>
                  {sdmList.map(sdm => (
                    <option key={sdm.id} value={sdm.id}>
                      {formatNameWithDegree(sdm.name, sdm.degree)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="modal-day">Hari*</label>
                <select
                  id="modal-day"
                  value={modalForm.day}
                  onChange={(e) => setModalForm({ ...modalForm, day: e.target.value })}
                  required
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-start">Waktu Mulai*</label>
                  <input
                    type="time"
                    id="modal-start"
                    value={modalForm.time_start}
                    onChange={(e) => setModalForm({ ...modalForm, time_start: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-end">Waktu Selesai *</label>
                  <input
                    type="time"
                    id="modal-end"
                    value={modalForm.time_end}
                    onChange={(e) => setModalForm({ ...modalForm, time_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-submit" disabled={modalLoading}>
                  {modalLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPetugasKesehatan;