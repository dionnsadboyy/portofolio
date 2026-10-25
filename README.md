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

Bilah baca yang sama tersedia di seluruh perspektif dan welcome. Warnanya mengikuti section aktif; garis bawah menunjukkan progres scroll sebenarnya. SFX aktif secara default dan dimulai sesudah klik, tap, atau penekanan tombol pertama sesuai izin audio browser. Tombol SFX menyimpan pilihan nyala/mati antarhalaman di localStorage; tidak ada suara berulang otomatis atau loading buatan.

## Build dan pemeriksaan

```powershell
node scripts/render-pages.js
node scripts/check.js
```

Edit sumber di scripts/, lalu render ulang; jangan mengedit HTML hasil build secara terpisah. check.js memeriksa build deterministik, referensi lokal, metadata aset, sintaks, dan kontrak API tanpa memanggil provider.

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

GET /api/portfolio-assistant memeriksa ketersediaan tanpa mengirim pesan. POST baru dilakukan sesudah interaksi pengguna. Tanpa credential, bantuan navigasi tetap berfungsi; jawaban provider live belum dapat diverifikasi. Static hosting saja tidak menjalankan API ini: hosting yang digunakan harus mendukung handler Node di api/. Tidak ada deployment yang dilakukan dalam konsolidasi ini.
