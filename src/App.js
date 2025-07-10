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
import FloatingStorage from './components/FloatingStorage/FloatingStorage';


import Admin_Beranda from './pages/Admin/Beranda/Admin_Beranda';
import Admin_SaranKeluhan from './pages/Admin/SaranKeluhan/Admin_SaranKeluhan';
import Admin_TentangPuskesmas from './pages/Admin/TentangPuskesmas/Admin_TentangPuskesmas';
import Admin_Kontak from './pages/Admin/Kontak/Admin_Kontak';
import Admin_TenagaKerja from './pages/Admin/TenagaKerja/Admin_TenagaKerja';
import Admin_Galeri from './pages/Admin/Galeri/Admin_Galeri';
import Admin_Klaster2Page from './pages/Admin/LayananKlaster/klaster-2';

import Config_HalamanKontak from './pages/Admin/Config/Halaman Kontak/Config_halamanKontak';
import Config_Kontak from './pages/Admin/Config/Semua Kontak/Config_Kontak';
import Config_WaktuPelayanan from './pages/Admin/Config/Waktu Pelayanan/Config_waktuPelayanan';
import Config_VideoBeranda from './pages/Admin/Config/Video Beranda/Config_videoBeranda';
import Config_Gallery from './pages/Admin/Config/Galeri/Config_Galeri';
import Config_TenagaKerja from './pages/Admin/Config/TenagaKerja/Config_TenagaKerja';
import Config_StorageManagement from './pages/Admin/Config/StorageManagement/Config_StorageManagement';
import Config_TentangKami from './pages/Admin/Config/TentangKami/Config_TentangKami';
import Config_SaranKeluhan from './pages/Admin/Config/SaranKeluhan/Config_SaranKeluhan';
import Config_TenagaMedis from './pages/Admin/Config/TenagaMedis/Config_TenagaMedis';


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
          path="/admin-config-waktuPelayanan" 
          element={
            <ProtectedRoute>
              <Config_WaktuPelayanan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-videoBeranda" 
          element={
            <ProtectedRoute>
              <Config_VideoBeranda />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-galeri" 
          element={
            <ProtectedRoute>
              <Config_Gallery />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-tenagaKerja" 
          element={
            <ProtectedRoute>
              <Config_TenagaKerja />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-storageManagement" 
          element={
            <ProtectedRoute>
              <Config_StorageManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-tentangKami" 
          element={
            <ProtectedRoute>
              <Config_TentangKami />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-saranKeluhan" 
          element={
            <ProtectedRoute>
              <Config_SaranKeluhan />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-config-tenagaMedis" 
          element={
            <ProtectedRoute>
              <Config_TenagaMedis />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Conditional Footer - Show AdminFooter for admin routes only if authenticated, regular Footer for public routes */}
      {isAdminRoute && isAuthenticated ? <AdminFooter /> : <Footer />}
      {isAdminRoute && !isLoginPage && ( <FloatingStorage/>)}

      {!isLoginPage && !isAdminRoute && ( <FloatingWhatsAppIcon/>)}
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