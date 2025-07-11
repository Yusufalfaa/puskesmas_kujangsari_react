// src/pages/Auth/RegisterForm.jsx - Updated version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import bcrypt from 'bcryptjs';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-beranda');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const validateForm = () => {
    const { username, password, confirmPassword } = formData;
    
    if (!username || !password || !confirmPassword) {
      setError('Semua field harus diisi.');
      return false;
    }
    
    if (username.length < 3) {
      setError('Username minimal 3 karakter.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { username, password } = formData;

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        setError('Username sudah digunakan. Pilih username lain.');
        setLoading(false);
        return;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user with role 'ADMIN' by default
      const { data, error: supabaseError } = await supabase
        .from('users')
        .insert([
          {
            username: username,
            password: hashedPassword,
            role: 'ADMIN' // Fixed role as ADMIN
          }
        ])
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setError('Terjadi kesalahan saat registrasi. Coba lagi.');
      } else {
        setSuccess(true);
        
        setTimeout(() => {
          navigate('/admin-login-form');
        }, 2000);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi. Coba lagi.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="register-form">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Registrasi Berhasil!</h2>
              <p>Akun admin telah dibuat. Mengarahkan ke halaman login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form">
          <div className="register-header">
            <h2>Daftar Admin</h2>
            <p>Buat akun admin baru</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form-content">
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Konfirmasi Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`register-button ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="loading-register"></span>
                  Registering
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>Sudah punya akun? <a href="/admin-login-form">Masuk di sini</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;