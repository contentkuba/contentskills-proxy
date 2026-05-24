const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function setCors(res) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

async function fetchWebsiteText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentSkillsBot/1.0)" },
    signal: AbortSignal.timeout(7000),
    redirect: "follow",
  });
  if (!res.ok) return null;
  const html = await res.text();
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2500);
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

  // Optional: inject scraped website content into system prompt
  if (body.url_context && typeof body.url_context === "string") {
    try {
      const text = await fetchWebsiteText(body.url_context);
      if (text) {
        payload.system =
          `[WEBSITE CONTEXT scraped from ${body.url_context}]\n${text}\n[END WEBSITE CONTEXT]\n\n` +
          (payload.system || "");
      }
    } catch (_) {
      // Silently proceed without website context
    }
  }

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
