import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import AdminNavbar from './components/Navbar/AdminNavbar';
import Footer from './components/Footer/Footer';
import AdminFooter from './components/Footer/AdminFooter';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Beranda from './pages/Beranda/Beranda';
import LoginForm from './pages/Auth/LoginForm';
import SaranKeluhan from './pages/sarankeluhan/SaranKeluhan';
import TentangPuskesmas from './pages/TentangPuskesmas/TentangPuskesmas';
import Kontak from './pages/Kontak/Kontak';
import TenagaKerja from './pages/TenagaKerja/TenagaKerja'
import Galeri from './pages/Galeri/Galeri';
import LayananSubDetailPage from './pages/LayananKlaster/LayananSubDetailPage';
import FloatingWhatsAppIcon from './components/FloatingWhatsAppIcon/FloatingWhatsAppIcon';


import Admin_Beranda from './pages/Admin/Beranda/Admin_Beranda';
import Admin_SaranKeluhan from './pages/Admin/sarankeluhan/Admin_SaranKeluhan';
import Admin_TentangPuskesmas from './pages/Admin/TentangPuskesmas/Admin_TentangPuskesmas';
import Admin_Kontak from './pages/Admin/Kontak/Admin_Kontak';
import Admin_TenagaKerja from './pages/Admin/TenagaKerja/Admin_TenagaKerja';
import Admin_Galeri from './pages/Admin/Galeri/Admin_Galeri';
import Admin_Klaster2Page from './pages/Admin/LayananKlaster/klaster-2';

import Config_HalamanKontak from './pages/Admin/Config/Halaman Kontak/Config_halamanKontak';
import Config_Kontak from './pages/Admin/Config/Semua Kontak/Config_Kontak';
import Config_PetugasKesehatan from './pages/Admin/Config/Petugas Kesehatan/Config_petugasKesehatan';
import Config_WaktuPelayanan from './pages/Admin/Config/Waktu Pelayanan/Config_waktuPelayanan';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin-');
  
  // Check if current route is login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="App">
      {/* Conditional Navbar - Show AdminNavbar for admin routes only if authenticated, regular Navbar for public routes */}
      {(isAdminRoute && isAuthenticated ? <AdminNavbar /> : <Navbar />)}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Beranda />} />
        <Route path="/tentangPuskesmas" element={<TentangPuskesmas />} />
        <Route path="/tenagaKerja" element={<TenagaKerja />} />
        <Route path="/saranKeluhan" element={<SaranKeluhan />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/galeri" element={<Galeri />} />
          
        <Route path="/layanan/klaster/:klasterId/:subLayananId" element={<LayananSubDetailPage />} />
        
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
          path="/admin-galeri" 
          element={
            <ProtectedRoute>
              <Admin_Galeri />
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
        <Route 
          path="/admin-config-halamanKontak" 
          element={
            <ProtectedRoute>
              <Config_HalamanKontak />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-kontak" 
          element={
            <ProtectedRoute>
              <Config_Kontak />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-petugasKesehatan" 
          element={
            <ProtectedRoute>
              <Config_PetugasKesehatan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-waktuPelayanan" 
          element={
            <ProtectedRoute>
              <Config_WaktuPelayanan />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Conditional Footer - Show AdminFooter for admin routes only if authenticated, regular Footer for public routes */}
      {!isLoginPage && (
        isAdminRoute && isAuthenticated ? <AdminFooter /> : <Footer />
      )}

      {!isLoginPage && !isAdminRoute && (
        <FloatingWhatsAppIcon/>
      )}
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