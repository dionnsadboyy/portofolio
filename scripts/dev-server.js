"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function loadLocalEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;

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

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function sendJson(response, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body));
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": payload.length,
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function serveStatic(request, response, pathname) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    return response.end("Method not allowed");
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400);
    return response.end("Bad request");
  }

  const directoryRoutes = ["/manufacturing", "/developer", "/welcome"];
  if (directoryRoutes.includes(decodedPath)) {
    response.writeHead(308, { Location: `${decodedPath}/${new URL(request.url, "http://localhost").search}` });
    return response.end();
  }
  const relativePath = decodedPath === "/" ? "index.html"
    : directoryRoutes.some((route) => decodedPath === `${route}/`) ? `${decodedPath.slice(1)}index.html`
    : decodedPath.slice(1);
  const segments = relativePath.split(/[\\/]/);
  if (
    segments.some((segment) => !segment || segment.startsWith(".")) ||
    segments[0] === "api" ||
    segments[0] === "scripts"
  ) {
    response.writeHead(404);
    return response.end("Not found");
  }

  const publicFiles = new Set(["index.html", "manufacturing/index.html", "developer/index.html", "welcome/index.html", "perspectives.css", "reading-bar.css", "reading-bar.js", "assistant.css", "assistant.js", "script.js", "perspectives.js", "both-worlds.css", "both-worlds.js", "mode-scenes.css", "mode-scenes.js", "welcome.css", "welcome.js"]);
  if (!publicFiles.has(relativePath) && !relativePath.startsWith("assets/")) {
    response.writeHead(404);
    return response.end("Not found");
  }

  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(404);
    return response.end("Not found");
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      return response.end("Not found");
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stats.size,
      "Cache-Control": "no-cache",
    });
    if (request.method === "HEAD") return response.end();
    fs.createReadStream(filePath).pipe(response);
  });
}

async function main() {
  loadLocalEnv();
  const assistant = require("../api/portfolio-assistant");
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || "0.0.0.0";

  const server = http.createServer(async (request, response) => {
    let pathname;
    try {
      pathname = new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname;
    } catch {
      response.writeHead(400);
      return response.end("Bad request");
    }

    if (pathname !== "/api/portfolio-assistant") {
      return serveStatic(request, response, pathname);
    }

    let rawBody = "";
    for await (const chunk of request) {
      rawBody += chunk;
      if (rawBody.length > 32_000) {
        return sendJson(response, 413, { success: false, error: "Request too large." });
      }
    }

    let body = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return sendJson(response, 400, { success: false, error: "Invalid JSON body." });
      }
    }

    let statusCode = 200;
    const endpointResponse = {
      setHeader() {},
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        sendJson(response, statusCode, data);
      },
    };

    try {
      await assistant({ method: request.method, body }, endpointResponse);
    } catch (error) {
      console.error("[local-server] assistant request failed:", error.message);
      if (!response.headersSent) {
        sendJson(response, 500, { success: false, error: "Assistant request failed." });
      }
    }
  });

  server.listen(port, host, () => {
    console.log(`Portfolio: http://localhost:${port}`);
    console.log("AI endpoint: /api/portfolio-assistant");
    console.log(`LAN access: http://<this-device-ip>:${port}`);
  });
}

main().catch((error) => {
  console.error(`Could not start local server: ${error.message}`);
  process.exitCode = 1;
});
