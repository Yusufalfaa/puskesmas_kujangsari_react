import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Beranda</h1>} />
        <Route path="/tentangPuskesmas" element={<h1>Tentang Puskesmas</h1>} />
        <Route path="/saranKeluhan" element={<h1>Saran & Keluhan</h1>} />
        <Route path="/kontak" element={<h1>Kontak</h1>} />
      </Routes>
    </div>
  );
}

export default App;
