import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import AdminNavbar from './components/Navbar/AdminNavbar/AdminNavbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Beranda from './pages/Beranda/Beranda';
import LoginForm from './pages/Auth/LoginForm';
import SaranKeluhan from './pages/sarankeluhan/SaranKeluhan';
import TentangPuskesmas from './pages/TentangPuskesmas/TentangPuskesmas';
import Kontak from './pages/Kontak/Kontak';
import TenagaKerja from './pages/TenagaKerja/TenagaKerja'
import Klaster2Page from './pages/LayananKlaster/klaster-2';

import Admin_Beranda from './pages/Admin/Beranda/Admin_Beranda';
import Admin_SaranKeluhan from './pages/Admin/sarankeluhan/Admin_SaranKeluhan';
import Admin_TentangPuskesmas from './pages/Admin/TentangPuskesmas/Admin_TentangPuskesmas';
import Admin_Kontak from './pages/Admin/Kontak/Admin_Kontak';
import Admin_TenagaKerja from './pages/Admin/TenagaKerja/Admin_TenagaKerja'
import Admin_Klaster2Page from './pages/Admin/LayananKlaster/klaster-2';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin-');

  return (
    <div className="App">
      {/* Conditional Navbar - Show AdminNavbar for admin routes, regular Navbar for public routes */}
      {isAdminRoute && isAuthenticated ? <AdminNavbar /> : <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Beranda />} />
        <Route path="/tentangPuskesmas" element={<TentangPuskesmas />} />
        <Route path="/tenagaKerja" element={<TenagaKerja />} />
        <Route path="/saranKeluhan" element={<SaranKeluhan />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/layanan/:id" element={<h1>Layanan Detail</h1>} />
        <Route path="/layanan/klaster-2" element={<Klaster2Page />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin-beranda" 
          element={
            <ProtectedRoute>
              <Admin_Beranda />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-tentangPuskesmas" 
          element={
            <ProtectedRoute>
              <Admin_TentangPuskesmas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-tenagaKerja" 
          element={
            <ProtectedRoute>
              <Admin_TenagaKerja />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-saranKeluhan" 
          element={
            <ProtectedRoute>
              <Admin_SaranKeluhan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-kontak" 
          element={
            <ProtectedRoute>
              <Admin_Kontak />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-layanan/:id" 
          element={
            <ProtectedRoute>
              <h1>Admin Layanan Detail</h1>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-layanan/klaster-2" 
          element={
            <ProtectedRoute>
              <Admin_Klaster2Page />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;