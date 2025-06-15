// src/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
      // 🔍 Query ke tabel 'users' Supabase
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (supabaseError || !data) {
        setError('Username atau password salah.');
      } else {
        // Login successful - save user data and redirect
        const userData = {
          id: data.id,
          username: data.username,
          role: data.role,
          created_at: data.created_at
        };
        
        login(userData);
        
        // Show success message briefly before redirect
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;