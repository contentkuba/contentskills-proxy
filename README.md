# contentskills-proxy

A one-endpoint Vercel Edge Function that proxies requests from the Content Skills setup wizard to the Anthropic API. Your API key stays server-side. Users don't need their own key.

## Deploy in 15 minutes

### 1. Fork or clone this repo

```bash
git clone https://github.com/[your-username]/contentskills-proxy.git
cd contentskills-proxy
```

### 2. Install the Vercel CLI

```bash
npm install -g vercel
```

### 3. Deploy to Vercel

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: `contentskills-proxy` (or anything you like)
- Directory: `.` (current directory)

Vercel will give you a URL like `https://contentskills-proxy-abc123.vercel.app`.

### 4. Add your environment variables

In the Vercel dashboard → your project → Settings → Environment Variables, add:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your Anthropic API key) |
| `ALLOWED_ORIGIN` | `https://your-website.com` (your website's domain) |

Then redeploy to pick up the variables:

```bash
vercel --prod
```

### 5. Update the wizard

In `contentskills/setup-wizard.html`, find this line near the top of the `<script>`:

```js
const API_URL = "https://your-proxy.vercel.app/api/claude";
```

Replace with your actual Vercel URL:

```js
const API_URL = "https://contentskills-proxy-abc123.vercel.app/api/claude";
```

### 6. Add the wizard to your website

Drop `setup-wizard.html` anywhere on your site. It works as a standalone page — no framework needed. On Webflow, upload it as a static file or embed it in an iframe.

---

## Security

**`ALLOWED_ORIGIN`** locks the proxy to your domain. If someone else finds your proxy URL, they can't use it from their own site — the browser will block the CORS preflight.

In development, set `ALLOWED_ORIGIN=*` so localhost works. In production, always set it to your specific domain.

**Your API key** never touches the browser. All Anthropic calls go from Vercel's servers, not from the user's browser.

---

## Cost

Each setup wizard session uses approximately:
- 15 conversation turns × ~500 tokens average = ~7,500 tokens
- 1 extraction call = ~8,000 tokens input + ~3,000 tokens output

Total per session: ~18,500 tokens ≈ **$0.05–0.10** on Claude Sonnet 4.

At 100 sessions/month: ~$5–10. Vercel's free tier covers the hosting.

---

## Local development

```bash
vercel dev
```

This runs the edge function locally at `http://localhost:3000/api/claude`. Update `API_URL` in the wizard to point there while testing.
