// src/pages/Auth/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { username, password } = formData;

    try {
      // Query ke tabel 'users' Supabase
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (supabaseError || !data) {
        setError('Username atau password salah.');
      } else {
        // Login successful - save user data
        const userData = {
          id: data.id,
          username: data.username,
          role: data.role,
          created_at: data.created_at
        };
        
        login(userData);
        setSuccess(true);
        
        // Show success message and redirect to admin dashboard
        setTimeout(() => {
          navigate('/admin-beranda');
        }, 1500);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="success-message">
            <h2>Login Berhasil!</h2>
            <p>Mengarahkan ke dashboard admin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login Admin</h2>
        <p className="login-subtitle">Masuk ke panel administrasi</p>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            required
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
          />
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;