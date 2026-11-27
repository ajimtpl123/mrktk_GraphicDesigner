/* =====================================================================
   FILE UNTUK MENAMBAH KARYA  (tidak perlu bisa coding, cukup copy-paste)
   =====================================================================
   LANGKAH SINGKAT:
   1. Taruh file gambar (PNG) ke folder  images/karya/
   2. Tulis nama filenya di daftar "gambar" di bawah ini (harus sama persis,
      huruf besar-kecilnya juga, dan jangan pakai spasi, contoh: poster-1.png)
      -> gambar PALING ATAS otomatis jadi cover folder
   3. Untuk video TikTok, tempel LINK videonya di daftar "video"
   4. Simpan. Selesai!

   ATURAN PENTING:
   - Setiap nama/link ditulis di dalam tanda kutip '...' dan diakhiri koma ,
   - Tanda // di depan baris artinya baris itu DIABAIKAN (cuma catatan).
     Hapus // untuk mengaktifkannya.

   CATATAN: Folder 01 "Merch & Clothing Design" punya halaman showcase sendiri
   (bukan lewat file ini). Cara menggantinya ada di CARA-TAMBAH-KARYA.txt
   ===================================================================== */

/* GANTI dengan link akun TikTok-mu (buka profil TikTok-mu, salin link-nya) */
var TIKTOK_AKUN = 'https://www.tiktok.com/@_mrktk';

var KARYA = {

  /* Folder 02: Social Media Design */
  social: {
    gambar: [
      // 'social-1.png',
    ],
    video: [],
  },

  /* Folder 03: Branding */
  branding: {
    gambar: [
      // 'branding-1.png',
    ],
    video: [],
  },

  /* Folder 04: Poster */
  poster: {
    gambar: [
      // 'poster-1.png',
    ],
    video: [],
  },

  /* Folder 05: Digital Illustration */
  illustration: {
    gambar: [
      // 'illustration-1.png',
    ],
    video: [],
  },

  /* Folder 06: Content Video (video TikTok) */
  content: {
    gambar: [
      'content-cover.webp',
    ],
    /* THUMBNAIL video: taruh gambarnya di images/karya/ lalu tulis namanya di cover: '...' (contoh cover: 'video-1.jpg').
       Kalau cover dikosongkan, tampil kotak gelap dengan tombol play. Video diputar saat kursor diarahkan / diketuk. */
    video: [
      { url: 'https://www.tiktok.com/@_mrktk/video/7597496001318128916', cover: '' },
      { url: 'https://www.tiktok.com/@_mrktk/video/7690229701100440853', cover: '' },
      { url: 'https://www.tiktok.com/@_mrktk/video/7593727479043378439', cover: '' },
      { url: 'https://www.tiktok.com/@_mrktk/video/7667231356140801298', cover: '' },
      { url: 'https://www.tiktok.com/@_mrktk/video/7651982727234833684', cover: '' },
    ],
  },

};
