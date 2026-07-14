# Security Policy — StadiumGenie

## API Key Protection

| Key | Storage | Exposed to Frontend? |
|---|---|---|
| `VITE_GEMINI_API_KEY` | `.env` file (git-ignored) | Build-time only via Vite env — NOT in source |

> **Note for production:** Gemini API calls should be moved to a backend proxy or serverless function to fully protect the API key. In this hackathon demo, the key is loaded from the Vite `.env` and never committed to git.

## Content Security Policy (CSP)

A robust Content Security Policy is configured in the `index.html` file to mitigate XSS (Cross-Site Scripting) and data injection vulnerabilities:
- Only loads scripts from the same origin (`'self'`).
- Style sources are limited to the same origin and Google Fonts.
- Connections are restricted to the same origin and `https://generativelanguage.googleapis.com` (Gemini API endpoint).

## Input Sanitization & XSS Protection

- All user inputs sent to the Gemini API are sanitized using `sanitizeInput()` inside `src/services/gemini.js`.
- HTML tags and potential script injections are stripped via regular expressions before being processed by the AI.
- React's default auto-escaping pipeline prevents rendering of raw HTML in the browser.

## Rate Limiting

- A sliding window rate limiter is implemented client-side in `src/services/gemini.js` to protect the Gemini API from abuse and exhaustion.
- Enforces a maximum limit of 30 requests per minute.

## Request Timeout Protection

- All Gemini API calls are wrapped in a racing promise mechanism (`callGeminiWithTimeout`).
- If an API request hangs or does not resolve within 12 seconds, it is automatically aborted to release resources and display a fallback experience to the user.

## No PII Storage

- Chat conversations are stateless and never logged or stored.
- No personal data or user accounts are collected.
