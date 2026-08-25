"use strict";

// This is the single source of portfolio knowledge sent to the model. Every
// item below is represented by information already displayed in index.html.
module.exports = {
  profile: { name: "Dion Pratama Syaputra", role: "Digital product builder", origin: "Malang, Jawa Timur", currentLocation: "Cikarang, Jawa Barat" },
  education: [{ program: "Rekayasa Perangkat Lunak (RPL)", completed: "2024", note: "Portfolio states 'Lulus RPL'; no school name is listed." }],
  experience: [{ company: "PT Denso Manufacturing Indonesia", area: "Blower Motor Assy", duration: "More than two years in manufacturing", work: ["Material flow", "Production-line processes", "Mizusumashi", "Armature Bearing Press", "Holder Press & Tokusei", "Stamping & Screw Tightening"], note: "The portfolio emphasizes accuracy, workflow, consistency, and quality in manufacturing." }],
  internship: [{ organization: "UBIG", location: "Malang", note: "Listed as an internship credential; no role or date is provided in the portfolio." }],
  projects: [
    { id: "yonngpt", name: "YonnGPT", year: "2026", category: "Personal Finance · AI Product", description: "A personal finance product exploring AI-assisted workflows, budgeting, and a cleaner way to understand everyday spending." },
    { id: "our-museum", name: "Our Museum", year: "2026", category: "Personal Web Experience", description: "A personal web experience built around storytelling, visual presentation, and a more immersive way to browse content." },
    { id: "quranibot", name: "QuraniBot", year: "2023", category: "WhatsApp Bot · NLP · Database", description: "A WhatsApp chatbot project combining NLP, database-backed responses, and conversational interaction." },
    { id: "yonn-apotek", name: "Yonn Apotek", year: "2024", category: "School Project · Laravel · MySQL", description: "A pharmacy management project built around practical application development and database workflows." },
  ],
  skills: ["Website and application development", "AI in workflow for ideation, coding, debugging, and experimentation", "Product building and experimentation", "Automation and bot experiments", "NLP and database-backed conversational interaction (QuraniBot)", "Laravel and MySQL (Yonn Apotek)", "PHP Native and MySQL (archived multi-user system)", "JSON-based bot automation (archived WhatsApp Bot)"],
  certifications: [{ name: "AI Fundamentals", issuer: "IBM SkillsBuild", year: "2026" }, { name: "Data Fundamentals", issuer: "IBM SkillsBuild", year: "2026" }, { name: "AI Literacy", issuer: "IBM SkillsBuild", year: "2026" }, { name: "Java Fundamentals", issuer: "Oracle Academy", year: "2024" }, { name: "Java Foundations", issuer: "Oracle Academy", year: "2024" }, { name: "Database Foundations", issuer: "Oracle Academy", year: "2024" }, { name: "Internship", issuer: "UBIG", location: "Malang" }],
  tools: ["Laravel", "MySQL", "PHP Native", "Java", "JSON"],
  links: { email: "dionpratamaart@gmail.com", whatsapp: "https://wa.me/6287773058338", github: "https://github.com/dionnsadboyy", linkedin: "https://www.linkedin.com/in/dionnnprtma", credly: "https://www.credly.com/users/dion-pratama/badges/credly" },
};
