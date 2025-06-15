import React from 'react';
import './SaranKeluhan.css';

const SaranKeluhan = () => {
  return (
    <div>
      <div className="banner">
        <h1>SARAN DAN KELUHAN</h1>
        <p>Anda dapat memberikan saran atau keluhan kepada pihak puskesmas di bawah ini.</p>
      </div>

      <div className="content">
        <p>
          Puskesmas Kujangsari merupakan unit pelayanan publik yang berfokus pada layanan kesehatan masyarakat. 
          Dalam upaya untuk terus meningkatkan kualitas pelayanan, kami sangat membutuhkan saran dan masukan yang membangun 
          dari Bapak/Ibu/Saudara/i.
          <br /><br />
          Masukan Anda sangat berarti bagi kami untuk menjadikan layanan kesehatan di Puskesmas Kujangsari lebih baik 
          dan sesuai dengan harapan masyarakat.
          <br /><br />
          Silakan sampaikan saran dan masukan Anda melalui tautan berikut:
        </p>
        
        <button className="btn-saran">Saran dan Keluhan Puskesmas Kujangsari</button>

        <p>
          Terima kasih atas partisipasi dan perhatian Anda. Masukan yang diberikan akan kami tindak lanjuti demi perbaikan layanan yang berkelanjutan.
        </p>
      </div>
    </div>
  );
};

export default SaranKeluhan;
