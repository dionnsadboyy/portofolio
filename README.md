# Portfolio Dion Pratama Syahputra

Satu project vanilla HTML, CSS, JavaScript dan API Node.js untuk Both Worlds, Developer, Manufacturing, welcome, serta Yon Assistant. Semua perspektif memakai satu development server.

## Install dan jalankan

Gunakan Node.js 20 atau lebih baru. Website dan build tidak memerlukan npm install atau dependency runtime tambahan.

Dari folder project, jalankan:

```powershell
node scripts/dev-server.js
```

Buka http://localhost:3000. PORT dan HOST dapat diatur melalui environment; port default 3000. Jangan menjalankan salinan dev server lain pada port yang sama.

## Route

- `/`: welcome pada kunjungan pertama, lalu perspektif terakhir yang dipilih.
- `/welcome/`: selalu membuka pemilih perspektif.
- `/?view=both`: Both Worlds.
- `/developer/` dan `/manufacturing/`: perspektif masing-masing.
- Direct link dan anchor lama tetap tersedia. Pergantian perspektif memakai kapsul pilihan di bagian atas. Welcome tetap tersedia melalui /welcome/.

Pilihan terakhir disimpan di localStorage. Histori dan draft Yon disimpan per tab melalui sessionStorage. Tanpa backend AI terkonfigurasi, Yon menyediakan bantuan navigasi dan menyatakan chat belum tersedia.

Bilah baca yang sama tersedia di seluruh perspektif dan welcome. Warnanya mengikuti section aktif; garis bawah menunjukkan progres scroll sebenarnya. SFX selalu aktif tanpa tombol on/off atau pengaturan mute di website, dan dimulai sesudah klik, tap, atau penekanan tombol pertama sesuai izin audio browser. Tidak ada suara berulang otomatis atau loading buatan.

## Build dan pemeriksaan

```powershell
node scripts/render-pages.js
node scripts/check.js
```

Edit sumber di scripts/, lalu render ulang; jangan mengedit HTML hasil build secara terpisah. Setelah mengubah CSS atau JavaScript, jalankan build juga untuk memperbarui versi aset dan mencegah cache kode lama. check.js memeriksa build deterministik, referensi lokal, metadata aset, sintaks, dan kontrak API tanpa memanggil provider.

Pemeriksaan browser opsional: node scripts/check-browser.cjs saat server aktif dan Playwright tersedia. DION_QA_MODULES dapat menunjuk instalasi tooling, DION_BROWSER memilih Chromium, dan DION_PREVIEW_URL mengubah URL pengujian. Pengujian tidak menghasilkan folder laporan atau screenshot. Skenario error assistant hanya menguji kegagalan endpoint nyata; tidak menyediakan jawaban AI palsu.

## Struktur

- index.html, developer/, manufacturing/, welcome/: empat halaman hasil render dengan URL fisik.
- perspectives.*, both-worlds.*, mode-scenes.*, welcome.*: layout, navigasi dan motion; reduced motion dihormati.
- reading-bar.*: bilah section, progres scroll, warna adaptif, serta audio bersama.
- assistant.*, script.js: Yon dan archive preview.
- scripts/: generator halaman, fragment Both Worlds, data proyek/ukuran aset, server, serta pemeriksaan yang dapat diulang.
- api/: endpoint portfolio-assistant dan fakta portfolio terverifikasi.
- assets/: foto/screenshot asli dan versi web, sertifikat, dekorasi SVG/audio, font lokal beserta lisensi. Aset asli tetap tersedia untuk direct link; tidak ada duplikat byte yang ditemukan.

## Konfigurasi Yon

Salin .env.example menjadi .env bila ingin mengaktifkan provider. Isi LLM_BASE_URL, LLM_API_KEY, dan LLM_MODEL dengan konfigurasi server yang benar, lalu restart development server. Secret tetap di environment/server dan diabaikan Git; jangan memasukkannya ke frontend.

Konfigurasi lokal menggunakan KoboiLLM dengan model `openai/gpt-4.1-mini`. Key hanya disimpan di .env yang diabaikan Git; .env.example tetap tanpa key. Yon menjawab tentang Dion dan portfolio berdasarkan api/portfolio-context.js, termasuk sapaan serta pertanyaan lanjutan. Jawaban singkat dan histori terbatas menjaga penggunaan token. Request provider dibatasi 20 detik; kegagalan ditampilkan dengan opsi coba lagi.

Pertanyaan calon klien soal sistem, fitur, jasa, harga, jadwal, dan kerja sama dipahami bersama histori, tanpa filter kata kunci yang memblokir pertanyaan sebelum sampai ke model. Yon dapat membantu memperjelas kebutuhan dan mengaitkannya dengan karya terverifikasi. Kemampuan menyelesaikan pesanan, penawaran harga, serta ketersediaan tetap perlu dikonfirmasi langsung ke Dion; Yon tidak menerima pesanan atau menjanjikan pengerjaan.

GET /api/portfolio-assistant memeriksa ketersediaan konfigurasi tanpa mengirim pesan. POST baru dilakukan sesudah interaksi pengguna. Koneksi dan jawaban provider asli telah diuji secara lokal. Tanpa credential, bantuan navigasi tetap berfungsi. Static hosting saja tidak menjalankan API ini: gunakan handler Node di api/ atau adapter Cloudflare Pages Functions di functions/api/portfolio-assistant.js.

### Cloudflare Pages

Konfigurasi Pages yang dicatat dalam paket perbaikan: direktori root repository, build command `exit 0`, output `.`, dan branch production `main`. Folder `functions/` dikompilasi otomatis oleh integrasi Git Cloudflare menjadi endpoint `/api/portfolio-assistant`.

Di Workers & Pages → portofolio → Settings → Variables and secrets, pilih Production dan isi:

| Nama | Tipe | Nilai |
| --- | --- | --- |
| LLM_BASE_URL | Text | https://api.koboillm.com/v1 |
| LLM_MODEL | Text | openai/gpt-4.1-mini |
| LLM_API_KEY | Secret | Key provider yang dipakai di `.env` lokal |

Simpan lalu redeploy supaya konfigurasi berlaku pada deployment baru. Jangan upload `.env`, memasukkan key ke kode/frontend, atau memakai awalan environment frontend seperti `VITE_`. Preview memakai environment terpisah; aktifkan hanya bila diperlukan.

Adapter memakai handler dan konteks portfolio yang sama dengan server lokal. Environment Cloudflare diteruskan per request tanpa mengubah `process.env`, dan ukuran body tetap dibatasi 32 KB. Tidak memerlukan Workers AI binding atau Cloudflare Tunnel.

`node scripts/check.js` juga menjalankan pemeriksaan adapter Pages: konfigurasi antar-request tetap terpisah, validasi pesan/histori/JSON, batas body termasuk stream UTF-8, metode HTTP, serta kegagalan provider. Pemeriksaan ini tidak memanggil AI live.

Validasi lokal integrasi: kompilasi Wrangler 4.152.0 serta health check dan satu jawaban provider asli lewat bundle hasil kompilasi (dijalankan di Node) berhasil. Emulator workerd pada Windows ini crash saat startup, sehingga runtime Cloudflare penuh belum diverifikasi. Konfigurasi dashboard dan deployment produksi tidak diubah.
