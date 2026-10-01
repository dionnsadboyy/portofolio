"use strict";

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("File .env tidak ditemukan. Buat dari .env.example dulu.");
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const entry = line.trim();
    if (!entry || entry.startsWith("#")) continue;
    const separator = entry.indexOf("=");
    if (separator < 1) continue;

    const name = entry.slice(0, separator).trim();
    const value = entry.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[name]) process.env[name] = value;
  }
}

async function askQuestion() {
  const fallback = "Ceritain soal TEAMcut dan pengalaman yang ditampilkan di portfolio.";
  if (!stdin.isTTY) return fallback;

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  try {
    const answer = await prompt.question(`Pertanyaan untuk AI [Enter untuk contoh]:\n> `);
    return answer.trim() || fallback;
  } finally {
    prompt.close();
  }
}

async function main() {
  loadLocalEnv();
  if (!process.env.LLM_API_KEY) {
    throw new Error("LLM_API_KEY belum diisi di .env.");
  }

  const message = (await askQuestion()).trim();
  if (!message) throw new Error("Pertanyaan tidak boleh kosong.");

  const handler = require("../api/portfolio-assistant");
  const result = { statusCode: 200, body: null };
  const response = {
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(body) {
      result.body = body;
      return this;
    },
  };

  await handler(
    {
      method: "POST",
      body: { message, section: "work", project: "teamcut", history: [] },
    },
    response,
  );

  if (result.statusCode !== 200 || !result.body?.success) {
    throw new Error(
      `AI test gagal (HTTP ${result.statusCode}): ${result.body?.error || "respons tidak valid"}`,
    );
  }

  console.log("AI test berhasil (HTTP 200).\n");
  console.log(`Pertanyaan: ${message}\n`);
  console.log(`Jawaban AI:\n${result.body.answer}`);
}

main().catch((error) => {
  console.error(`AI test gagal: ${error.message}`);
  process.exitCode = 1;
});
