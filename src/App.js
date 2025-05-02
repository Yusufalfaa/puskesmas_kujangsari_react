import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Beranda from './pages/Beranda/Beranda';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/tentangPuskesmas" element={<h1>Tentang Puskesmas</h1>} />
        <Route path="/saranKeluhan" element={<h1>Saran & Keluhan</h1>} />
        <Route path="/kontak" element={<h1>Kontak</h1>} />
        <Route path="/layanan/:id" element={<h1>Layanan Detail</h1>} />
      </Routes>
    </div>
  );
}

export default App;
