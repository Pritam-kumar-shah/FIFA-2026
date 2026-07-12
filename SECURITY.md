# Security Policy — StadiumGenie

## API Key Protection

| Key | Storage | Exposed to Frontend? |
|---|---|---|
| `VITE_GEMINI_API_KEY` | `.env` file (git-ignored) | Build-time only via Vite env — NOT in source |
| `VITE_FIREBASE_API_KEY` | `.env` file (git-ignored) | Firebase web API key is designed to be public — secured by Firestore rules |

> **Note for production:** Gemini API calls should be moved to Firebase Cloud Functions (server-side) to fully protect the API key. In this hackathon demo, the key is in the Vite `.env` and never committed to git.

## `.gitignore` Coverage
The following are never committed:
- `.env` / `.env.local` (all variants)
- `node_modules/`
- `dist/` / `build/`

## Input Validation
- All user input to the Gemini API is passed as **user turn content**, clearly separated from the system prompt
- System prompt instructs the model to only answer stadium/navigation questions
- Max message length enforced client-side (textarea character limit)

## Rate Limiting
For production deployment, the following would be added:
- Firebase App Check to prevent unauthorized API usage
- Cloud Function rate limiting per IP (100 req/min)
- Gemini API usage quotas via Google AI Studio console

## No PII Storage
- Chat conversations are not stored — all AI calls are stateless
- No user accounts or personal data collected
- Incident reports contain only operational text — no fan identification

## CORS
- Firebase Hosting automatically handles CORS for same-origin requests
- For Cloud Functions in production: configured to allow only deployed frontend origins

## Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gates readable by anyone (fan app)
    match /gates/{gate} {
      allow read: if true;
      allow write: if false; // Only simulator writes
    }
    // Incidents: read/write for authenticated staff
    match /incidents/{incident} {
      allow read, write: if true; // Simplified for hackathon demo
    }
  }
}
```

## Responsible Disclosure
If you discover a security issue, please open a GitHub issue marked `[SECURITY]` or contact the author directly.
