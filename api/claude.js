const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function setCors(res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  let body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).send("Invalid JSON");
  }

  const allowed = ["messages", "system", "max_tokens", "model"];
  const payload = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (!payload.model) payload.model = "claude-sonnet-4-20250514";
  if (!payload.max_tokens) payload.max_tokens = 1000;

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  const data = await upstream.json();

  res.setHeader("Content-Type", "application/json");
  return res.status(upstream.status).json(data);
};
