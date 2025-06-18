import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './VideoBeranda.css';

const VideoBeranda = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('vid-beranda')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false });

      if (error) {
        throw error;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Gagal memuat video. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
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
      <div className="video-placeholder-container">
        <div className="video-loading">
          <p>Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-placeholder-container">
        <div className="video-error">
          <p>{error}</p>
          <button onClick={fetchVideos} className="retry-button">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-placeholder-container">
        <div className="video-empty">
          <p>Belum ada video yang tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-placeholder-container">
      {videos.map((video, index) => {
        const embedUrl = getEmbedUrl(video.videoUrl);
        
        if (!embedUrl) {
          console.warn(`Invalid video URL for video ID ${video.id}:`, video.videoUrl);
          return null;
        }

        return (
          <div key={video.id} className="video-item">
            <h3 className="video-title">{video.title}</h3>
            <iframe
              className="video-player"
              src={embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {index < videos.length - 1 && <div className="video-separator"></div>}
          </div>
        );
      })}
    </div>
  );
};

export default VideoBeranda;