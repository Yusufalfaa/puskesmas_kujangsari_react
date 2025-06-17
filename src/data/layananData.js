// src/data/layananData.js

const layananData = {
  // --- KLASTER UTAMA (LEVEL 1) ---
  'klaster-2': {
    mainTitle: 'DAFTAR UNIT PELAYANAN KLASTER 2 KESEHATAN IBU DAN ANAK',
    description: 'Klaster ini berfokus pada pelayanan kesehatan untuk ibu dan anak, meliputi:',
    subKategoris: [
      {
        id: 'ibu-hamil', // ID unik untuk sub-kategori ini (digunakan di URL)
        name: 'Pelayanan Kesehatan bagi Ibu Hamil, Bersalin, dan Nifas',
        bannerText: 'Pelayanan Ibu Hamil',
        detailItems: [
          {
            id: 'persalinan',
            imageUrl: `${process.env.PUBLIC_URL}https://nursing.nyu.edu/sites/default/files/inline-images/1738104083176.jpg`, // Ganti dengan path ikon Anda
            title: 'Unit Pelayanan Persalinan',
            subtitle: 'Unit Pelayanan Persalinan',
            description: 'Menyediakan layanan persalinan yang aman dan nyaman dengan fasilitas lengkap.'
          },
          {
            id: 'ki-hamil',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/layanan_ki_hamil.png`, // Ganti dengan path ikon Anda
            title: 'Unit Pelayanan KI Hamil',
            subtitle: 'Unit Pelayanan KI Hamil',
            description: 'Layanan Kesehatan Ibu Hamil untuk pemantauan kehamilan dan persiapan persalinan.'
          }
        ]
      },
      {
        id: 'anak-balita-prasekolah', // ID untuk sub-kategori ini
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
      },
      {
        id: 'anak-usia-sekolah-remaja', // ID untuk sub-kategori ini
        name: 'Pelayanan Kesehatan bagi Anak Usia Sekolah dan Remaja',
        bannerText: 'Usia Sekolah & Remaja',
        detailItems: [
          {
            id: 'kesehatan-remaja',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/kesehatan_remaja.png`,
            title: 'Kesehatan Remaja',
            subtitle: 'Remaja',
            description: 'Konsultasi dan edukasi kesehatan untuk remaja.'
          }
        ]
      }
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
            id: 'lansia-detail',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/usia_lansia.png`,
            title: 'Pelayanan Kesehatan Lanjut Usia',
            subtitle: 'Lanjut Usia',
            description: 'Perawatan komprehensif untuk lansia, termasuk pencegahan penyakit degeneratif.'
          }
        ]
      }
    ]
  },
  'klaster-4': {
    mainTitle: 'DAFTAR UNIT PELAYANAN KLASTER 4 KESEHATAN LINGKUNGAN',
    description: 'Klaster ini berfokus pada kesehatan lingkungan dan pencegahan penyakit.',
    subKategoris: [
      {
        id: 'pencegahan-respon',
        name: 'Pencegahan, Kewaspadaan Dini dan Respon',
        bannerText: 'Pencegahan Penyakit',
        detailItems: [
          {
            id: 'pencegahan',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/pencegahan.png`,
            title: 'Pencegahan Penyakit',
            subtitle: 'Pencegahan',
            description: 'Program pencegahan penyakit menular dan tidak menular.'
          },
          {
            id: 'kewaspadaan-respon',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/kewaspadaan_respon.png`,
            title: 'Kewaspadaan Dini dan Respon',
            subtitle: 'Respon Cepat',
            description: 'Sistem deteksi dini dan tanggap cepat terhadap masalah kesehatan masyarakat.'
          }
        ]
      },
      {
        id: 'kualitas-lingkungan',
        name: 'Pengawasan Kualitas Lingkungan',
        bannerText: 'Kualitas Lingkungan',
        detailItems: [
          {
            id: 'pengawasan-lingkungan',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/lingkungan.png`,
            title: 'Pengawasan Lingkungan',
            subtitle: 'Lingkungan Sehat',
            description: 'Memastikan lingkungan yang sehat dan aman bagi masyarakat.'
          }
        ]
      }
    ]
  },
  'klaster-5': {
    mainTitle: 'DAFTAR UNIT PELAYANAN KLASTER 5 PENUNJANG MEDIS',
    description: 'Klaster ini menyediakan layanan penunjang medis utama.',
    subKategoris: [
      {
        id: 'penunjang-medis',
        name: 'Pelayanan Gawat Darurat, Rawat Inap, Kefarmasian, dan Laboratorium',
        bannerText: 'Penunjang Medis',
        detailItems: [
          {
            id: 'gawat-darurat',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/gawat_darurat.png`,
            title: 'Unit Gawat Darurat',
            subtitle: 'UGD',
            description: 'Pelayanan medis darurat 24 jam.'
          },
          {
            id: 'rawat-inap',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/rawat_inap.png`,
            title: 'Rawat Inap',
            subtitle: 'Rawat Inap',
            description: 'Fasilitas rawat inap untuk pasien yang memerlukan observasi lebih lanjut.'
          },
          {
            id: 'kefarmasian',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/kefarmasian.png`,
            title: 'Kefarmasian',
            subtitle: 'Farmasi',
            description: 'Penyediaan obat-obatan dan konseling farmasi.'
          },
          {
            id: 'laboratorium',
            imageUrl: `${process.env.PUBLIC_URL}/assets/icons/laboratorium.png`,
            title: 'Laboratorium',
            subtitle: 'Lab',
            description: 'Pemeriksaan laboratorium sederhana untuk diagnosis.'
          }
        ]
      }
    ]
  }
};

export default layananData;