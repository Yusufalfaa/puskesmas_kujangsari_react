import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import './Config_videoBeranda.css';

const ConfigVideoBeranda = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    order: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vid-beranda')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Gagal memuat data video');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkDuplicateOrder = async (orderValue, excludeId = null) => {
    if (!orderValue) return false; // Jika order kosong, tidak perlu check
  
    try {
      let query = supabase
       .from('vid-beranda')
       .select('id, title')
       .eq('order', parseInt(orderValue));
    
        // Jika sedang edit, exclude video yang sedang diedit
        if (excludeId) {
          query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : false;
    } catch (error) {
    console.error('Error checking duplicate order:', error);
    return false;
    }
   };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validasi duplicate order jika user mengisi order
  if (formData.order) {
    const duplicateVideo = await checkDuplicateOrder(
      formData.order, 
      isEditMode ? editingVideo.id : null
    );
    
    if (duplicateVideo) {
      alert(`Nomor urutan ${formData.order} sudah digunakan oleh video "${duplicateVideo.title}". Silakan pilih nomor urutan yang lain.`);
      return;
    }
  }
  
  try {
    const videoData = {
      title: formData.title,
      videoUrl: formData.videoUrl,
      order: formData.order ? parseInt(formData.order) : null
    };

    if (isEditMode) {
      const { error } = await supabase
        .from('vid-beranda')
        .update(videoData)
        .eq('id', editingVideo.id);

      if (error) throw error;
        alert('Video berhasil diupdate!');
      } else {
      const { error } = await supabase
        .from('vid-beranda')
        .insert([videoData]);

        if (error) throw error;
         alert('Video berhasil ditambahkan!');
        }

     closeModal();
      fetchVideos();
    } catch (error) {
    console.error('Error saving video:', error);
    
    // Handle specific duplicate key error dari database
     if (error.message && error.message.includes('unique_order_vidberanda')) {
        alert(`Nomor urutan ${formData.order} sudah digunakan. Silakan pilih nomor urutan yang lain.`);
     } else {
          alert(`Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} video: ` + error.message);
     }
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus video ini?')) return;

    try {
      const { error } = await supabase
        .from('vid-beranda')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchVideos();
      alert('Video berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Gagal menghapus video: ' + error.message);
    }
  };

  const startEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl,
      order: video.order?.toString() || ''
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const startAdd = () => {
    setEditingVideo(null);
    setFormData({ title: '', videoUrl: '', order: '' });
    setIsEditMode(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setIsEditMode(false);
    setFormData({ title: '', videoUrl: '', order: '' });
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getEmbedUrl = (videoUrl) => {
    const videoId = extractVideoId(videoUrl);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="config-videoBeranda-container">
        <div className="loading">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="config-videoBeranda-container">
      <div className="config-videoBeranda-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali
        </button>
        <h1>Kelola Video Beranda</h1>
        <button className="add-btn" onClick={startAdd}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tambah Video
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Video' : 'Tambah Video Baru'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Judul Video:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Masukkan judul video"
                />
              </div>
              <div className="form-group">
                <label>URL Video YouTube:</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="form-group">
                <label>Urutan (Order):</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor urutan (kosong = urutan terakhir)"
                  min="1"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Batal
                </button>
                <button type="submit" className="save-button">
                  {isEditMode ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="videos-list">
        <h3>Daftar Video ({videos.length})</h3>
        {videos.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada video yang ditambahkan.</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video) => {
              const embedUrl = getEmbedUrl(video.videoUrl);
              return (
                <div key={video.id} className="video-card">
                  <div className="video-preview">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="invalid-video">
                        <p>URL Video Tidak Valid</p>
                      </div>
                    )}
                  </div>
                  <div className="video-info">
                    <h4>{video.title}</h4>
                    <p className="video-url">{video.videoUrl}</p>
                    <div className="video-actions">
                      <button 
                        onClick={() => startEdit(video)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className="delete-button"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigVideoBeranda;