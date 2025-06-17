// src/data/layananData.js

const layananData = {
  // --- KLASTER UTAMA (LEVEL 1) ---
  'klaster-2': {
    mainTitle: 'DAFTAR UNIT PELAYANAN KLASTER 2 KESEHATAN IBU DAN ANAK',
    description: 'Klaster ini berfokus pada pelayanan kesehatan untuk ibu dan anak, meliputi:',
    // Ini adalah daftar "kotak besar" yang akan muncul di halaman /layanan/klaster/klaster-2
    subKategoris: [
      {
        id: 'ibu-hamil', // ID untuk sub-kategori ini
        name: 'Pelayanan Kesehatan bagi Ibu Hamil, Bersalin, dan Nifas',
        bannerText: 'Pelayanan Ibu Hamil', // Teks yang muncul di banner klaster utama (Beranda)
        // Ini adalah item-item grid yang akan muncul ketika 'ibu-hamil' diklik
        detailItems: [
          {
            id: 'persalinan',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_persalinan.png`,
            title: 'Unit Pelayanan Persalinan',
            subtitle: 'Unit Pelayanan Persalinan',
            description: 'Menyediakan layanan persalinan yang aman dan nyaman dengan fasilitas lengkap.'
          },
          {
            id: 'ki-hamil',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_ki_hamil.png`,
            title: 'Unit Pelayanan KI Hamil',
            subtitle: 'Unit Pelayanan KI Hamil',
            description: 'Layanan Kesehatan Ibu Hamil untuk pemantauan kehamilan dan persiapan persalinan.'
          }
        ]
      },
      {
        id: 'anak-balita-prasekolah',
        name: 'Pelayanan Kesehatan bagi Anak Balita dan Anak Prasekolah',
        bannerText: 'Pelayanan Anak Balita & PraSekolah',
        detailItems: [
          {
            id: 'mtbs-anak',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_mtbs_anak.png`,
            title: 'Unit Pelayanan MTBS dan Anak',
            subtitle: 'Unit Pelayanan MTBS dan Anak',
            description: 'Manajemen Terpadu Balita Sakit (MTBS) dan layanan kesehatan anak.'
          },
          {
            id: 'mtbm',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_mtbm.png`,
            title: 'Unit Pelayanan MTBM',
            subtitle: 'Unit Pelayanan MTBM',
            description: 'Manajemen Terpadu Balita Muda untuk deteksi dini masalah kesehatan pada bayi.'
          }
        ]
      }
      // ... tambahkan sub-kategori lain untuk Klaster 2
    ]
  },
  'klaster-3': {
    mainTitle: 'DAFTAR UNIT PELAYANAN KLASTER 3 USIA DEWASA DAN LANSIA',
    description: 'Klaster ini berfokus pada pelayanan kesehatan bagi usia dewasa dan lanjut usia.',
    subKategoris: [
      {
        id: 'usia-dewasa',
        name: 'Pelayanan Kesehatan bagi Usia Dewasa',
        bannerText: 'Usia Dewasa',
        detailItems: [
          {
            id: 'dewasa',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/usia_dewasa.png`,
            title: 'Pelayanan Kesehatan Usia Dewasa',
            subtitle: 'Usia Dewasa',
            description: 'Pemeriksaan kesehatan, skrining, dan penanganan penyakit pada usia produktif.'
          }
        ]
      },
      {
        id: 'lansia',
        name: 'Pelayanan Kesehatan bagi Lanjut Usia',
        bannerText: 'Lanjut Usia',
        detailItems: [
          {
            id: 'lansia',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/usia_lansia.png`,
            title: 'Pelayanan Kesehatan Lanjut Usia',
            subtitle: 'Lanjut Usia',
            description: 'Perawatan komprehensif untuk lansia, termasuk pencegahan penyakit degeneratif.'
          }
        ]
      }
    ]
  },
  // ... Tambahkan klaster lain (klaster-4, klaster-5) dengan struktur serupa
};

export default layananData;