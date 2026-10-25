"use strict";

// Portfolio facts used by the assistant. Keep this aligned with the public page.
module.exports = {
  portfolio_navigation: [
    {name:"Developer",url:"/developer/",purpose:"Ide, kode, tools, dan karya yang bisa dipakai. Empat showcase: TEAMcut, Bagong Lapar, Armature Monitoring, Jidan Quest."},
    {name:"Both Worlds",url:"/?view=both",purpose:"Dua sisi, satu cerita. Pengenalan Dion, pengalaman produksi, karya digital, perjalanan, dan kontak."},
    {name:"Manufacturing",url:"/manufacturing/",purpose:"Pengalaman di lantai produksi, material/kanban, proses perakitan, pencatatan harian, dan prototipe personal Armature Monitoring."},
  ],
  developer_perspective_tools: ["VS Code", "HTML", "CSS", "JavaScript", "Node.js", "Supabase", "MySQL", "Cloudflare", "GitHub", "ChatGPT", "Codex"],
  profile: {
    name: "Dion Pratama Syahputra",
    role: "Operator Produksi / Web Developer",
    location: "Indonesia",
    origin: "Malang, Jawa Timur",
    currentLocation: "Cikarang, Jawa Barat",
    focus: [
      "Websites",
      "Interfaces",
      "Digital experiences",
      "Software development",
      "AI",
      "Data",
      "Automation",
    ],
  },

  education: [
    {
      school: "SMKN 8 Malang",
      program: "Rekayasa Perangkat Lunak (RPL)",
      period: "2021 – 2024",
      status: "Lulus",
      focus: ["Programming", "Web development", "Databases", "Software fundamentals"],
    },
  ],

  experience: [
    {
      company: "PT Denso Manufacturing Indonesia",
      role: "Production Operator",
      period: "2 Juli 2024 – sekarang (sesuai CV V4, 22 Oktober 2026; verifikasi ulang sebelum publikasi)",
      location: "Cikarang Barat, Jawa Barat",
      area: "Manufacturing",
      work: [
        "Material flow",
        "Blower Motor Assy",
        "Production-line processes",
        "Mizusumashi",
        "Kanban dan koordinasi suplai material",
        "Manual stamping press untuk yoke/stator",
        "Armature Bearing Press",
        "Holder Press & Tokusei",
        "Stamping & Screw Tightening",
      ],
      perspective:
        "Pengalaman manufacturing memberi perspektif tentang proses, kualitas, konsistensi, akurasi, dan tantangan operasional.",
    },
  ],

  internship: [
    {
      organization: "PT Universal Big Data (UBIG)",
      role: "Software Development & AI Intern",
      period: "Januari 2023 – Mei 2023",
      location: "Malang, Jawa Timur",
      type: "PKL / vocational school internship",
      skills: ["Python", "Natural Language Processing (NLP)"],
    },
  ],

  working_style: [
    "Mulai dari ide atau rasa penasaran lalu mengeksplorasi kemungkinan.",
    "Belajar melalui praktik langsung dan eksperimen.",
    "Menggunakan AI sebagai alat bantu untuk ideation, coding, debugging, dan eksplorasi.",
    "Lebih suka membangun sesuatu yang bisa diuji daripada berhenti di teori.",
    "Melakukan iterasi: mencoba, menemukan masalah, memperbaiki, lalu mengevaluasi.",
  ],

  projects: [
    {
      id: "jidan-quest",
      name: "Jidan Quest",
      status: "Proyek personal; tampilan mockup, bukan data belajar live",
      description: "Jalur belajar yang Dion buat untuk adiknya: materi per bab, checkpoint, dan progres yang dapat didampingi dari jauh. Desain memiliki tampilan student dan admin. URL aplikasi belum tersedia di sumber portfolio.",
    },
    {
      id: "armature-monitoring",
      name: "Armature Monitoring",
      status: "Prototipe pribadi / studi kasus portofolio",
      description: "Terinspirasi kebutuhan informasi material selama tugas BOP/Mizusumashi. Dion merancang pemantauan material, status mesin, formulir permintaan, tampilan berdasarkan peran, dan riwayat status pending, ongoing, done. Tidak terhubung ke data produksi, belum menjadi sistem resmi perusahaan. Tidak ada bukti adopsi atau efisiensi terukur.",
    },
    {
      id: "teamcut",
      name: "TEAMcut",
      status: "selected",
      category: "Website barbershop; tidak mengklaim proyek berbayar",
      description:
        "Presentasi mobile-only untuk pengalaman booking dan antrean barbershop. Screenshot memperlihatkan informasi antrean, pemilihan cabang dan hairstylist, layanan, serta form booking.",
      capabilities: ["UI/UX", "Frontend", "Database", "Deployment"],
      live_url: "https://teamcut.pages.dev/",
    },
    {
      id: "dua-saudara",
      name: "Dua Saudara",
      status: "selected",
      category: "Business website · Furniture",
      description:
        "Website bisnis furnitur yang menampilkan halaman beranda, produk, katalog, dan detail produk. Screenshot desktop tersedia sebagai tampilan utama.",
      capabilities: ["Web design", "Frontend", "Content structure", "Deployment"],
      live_url: "https://dua-saudara.pages.dev/",
    },
    {
      id: "bagong-lapar",
      name: "Bagong Lapar",
      status: "selected",
      category: "Proyek personal · katalog sewa perlengkapan outdoor",
      description:
        "Website penyewaan perlengkapan outdoor dengan screenshot desktop dan mobile. Keduanya ditampilkan sebagai bagian dari project.",
      capabilities: ["Visual direction", "Web design", "Frontend", "Deployment"],
    },
    {
      id: "our-museum",
      name: "Our Museum",
      status: "archive",
      category: "Project archive",
    },
    {
      id: "yonngpt",
      name: "Yonn Assistant / YonnGPT",
      status: "archive",
      category: "AI assistant project",
    },
    {
      id: "yonn-apotek",
      name: "Yonn Apotek",
      status: "archive",
      category: "Project archive",
    },
    {
      id: "quranibot",
      name: "QuraniBotWithNLP",
      status: "archive",
      category: "Project archive",
    },
    {
      id: "whatsapp-bot",
      name: "Bot WhatsApp",
      status: "archive",
      category: "Project archive",
    },
    {
      id: "multiuser-php-native",
      name: "MultiUser PHP Native",
      status: "archive",
      category: "Project archive",
    },
    {
      id: "text-to-speech",
      name: "TextToSpeech",
      status: "archive",
      category: "Project archive",
    },
  ],

  skills: [
    "HTML",
    "CSS",
    "JavaScript",
    "Python",
    "PHP",
    "PHP Native",
    "Laravel",
    "MySQL",
    "Java",
    "JSON",
    "Natural Language Processing",
    "Chatbot Development",
    "Automation",
    "AI-assisted Development",
  ],

  tools: ["VS Code", "GitHub", "XAMPP", "ChatGPT", "Claude"],

  certifications: [
    { name: "AI Fundamentals", issuer: "IBM SkillsBuild", year: "2026" },
    { name: "AI Literacy", issuer: "IBM SkillsBuild", year: "2026" },
    { name: "Data Fundamentals", issuer: "IBM SkillsBuild", year: "2026" },
    { name: "Java Foundations", issuer: "Oracle Academy", year: "2024" },
    { name: "Database Foundations", issuer: "Oracle Academy", year: "2024" },
    { name: "Software Development & AI Internship", issuer: "UBIG", location: "Malang" },
  ],

  links: {
    email: "dionpratamaart@gmail.com",
    github: "https://github.com/dionnsadboyy",
    linkedin: "https://www.linkedin.com/in/dionnnprtma",
    instagram: "https://instagram.com/dionnnprtma_",
    credly: "https://www.credly.com/users/dion-pratama/badges/credly",
    teamcut: "https://teamcut.pages.dev/",
    dua_saudara: "https://dua-saudara.pages.dev/",
  },
};
