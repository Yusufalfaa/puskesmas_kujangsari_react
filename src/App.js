import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';

import Beranda from './pages/Beranda/Beranda';
import SaranKeluhan from './pages/sarankeluhan/SaranKeluhan';
import TentangPuskesmas from './pages/TentangPuskesmas/TentangPuskesmas';
import Kontak from './pages/Kontak/Kontak';
import TenagaKerja from './pages/TenagaKerja/TenagaKerja'

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/tentangPuskesmas" element={<TentangPuskesmas />} />
        <Route path="/tenagaKerja" element={<TenagaKerja />} />
        <Route path="/saranKeluhan" element={<SaranKeluhan />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/layanan/:id" element={<h1>Layanan Detail</h1>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
