import assistant from "../../api/portfolio-assistant.js";

const MAX_REQUEST_BYTES = 32_000;

function jsonResponse(status, data, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

// Keep the same body limit as the local Node server, including streamed bodies.
async function readBody(request) {
  if (Number(request.headers.get("Content-Length")) > MAX_REQUEST_BYTES) {
    return { error: jsonResponse(413, { success: false, error: "Request too large." }) };
  }
  if (!request.body) return { body: {} };

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { error: jsonResponse(413, { success: false, error: "Request too large." }) };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  try {
    return { body: text ? JSON.parse(text) : {} };
  } catch {
    return { error: jsonResponse(400, { success: false, error: "Invalid JSON body." }) };
  }
}

// Pages supplies runtime secrets through context.env. Pass them per request;
// never copy secrets into process.env or share mutable configuration globally.
export async function onRequest({ request, env }) {
  try {
    let body = {};
    if (request.method === "POST") {
      const parsed = await readBody(request);
      if (parsed.error) return parsed.error;
      body = parsed.body;
    }

    let status = 200;
    let payload;
    const headers = {};
    await assistant({ method: request.method, body }, {
      setHeader(name, value) {
        headers[name] = value;
      },
      status(code) {
        status = code;
        return this;
      },
      json(data) {
        payload = data;
      },
    }, env);

    return jsonResponse(status, payload, headers);
  } catch {
    console.error("[portfolio-assistant] Pages request failed.");
    return jsonResponse(500, { success: false, error: "Assistant request failed." });
  }
}
