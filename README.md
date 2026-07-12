# StadiumGenie — GenAI Smart Stadium Assistant
## FIFA World Cup 2026 · Hackathon Submission

> *StadiumGenie is a GenAI-powered assistant that helps fans navigate, stay safe, and travel sustainably — while giving organizers a real-time AI co-pilot for crowd and incident management.*

---

## Chosen Vertical
**Smart Stadiums & Tournament Operations**

## Problem
During FIFA World Cup 2026 (16 host cities, millions of fans, many languages):
- Fans get lost / don't know the fastest safe route to their gate
- Language barriers for international fans (50+ languages at the venue)
- Crowd bottlenecks at gates during peak entry/exit times
- Staff can't process incident reports fast enough
- No easy way to compare eco-friendly transport options
- Accessibility for disabled/elderly fans is an afterthought

## Solution

Two connected apps sharing one AI brain (**Google Gemini API**):

| App | Users | Purpose |
|---|---|---|
| **Fan App** (mobile-first) | Spectators | Multilingual chat concierge, live crowd alerts, accessibility mode, sustainable transport advisor |
| **Ops Dashboard** | Staff / Organizers | Live gate heatmap, AI-prioritized incident feed, AI command center |

**Key differentiator:** AI is a *decision layer* over live stadium context — not just a chat widget. Gemini reasons over real-time gate occupancy + incident logs to produce actionable, structured decisions: *"Gate 4 is at 88% — redirect fans to Gate 7, deploy crowd control."*

---

## Architecture

```
┌──────────────────┐        ┌─────────────────────────────┐
│  Fan App (React)  │◄──────►│        Firebase              │
│  - AI Chat (mult) │  SDK   │  - Firestore (live data)     │
│  - Crowd Alerts   │        │  - Real-time listeners       │
│  - Transport Adv. │        └─────────────────────────────┘
│  - Accessibility  │                    ▲
└──────────────────┘                    │
                                        │ Gemini API calls
┌──────────────────┐        ┌─────────────────────────────┐
│  Ops Dashboard    │◄──────►│    Google Gemini API         │
│  - Live Heatmap   │        │    (gemini-1.5-flash)        │
│  - Incident Feed  │        │    - Chat (multilingual)     │
│  - AI Command     │        │    - Crowd alert generation  │
└──────────────────┘        │    - Incident analysis       │
                              │    - Transport ranking       │
                              │    - Staff recommendations   │
                              └─────────────────────────────┘
```

**Crowd data is simulated** by `crowdSimulator.js` — a deterministic-random engine that updates gate occupancy every 5 seconds within realistic match-day bounds. Architecture is designed so this swaps directly for real IoT sensor feeds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Fan App | React 18 + Vite + Tailwind CSS v4 |
| Ops Dashboard | React 18 + Vite + Tailwind CSS v4 |
| Database / Realtime | Firebase Firestore |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Hosting | Firebase Hosting / Vercel |
| Icons | lucide-react |

---

## Features

### Fan App
- 🌍 **Multilingual AI Concierge** — auto-detects language, responds in same language (Hindi, Spanish, French, Arabic, etc.)
- 🚨 **Live Crowd Alerts** — Gemini analyzes gate occupancy, pushes fan-facing alerts when gates hit 75%+
- 🚪 **Gate Status** — real-time occupancy grid with color-coded status (ok/warning/critical)
- 🌿 **Transport Advisor** — AI ranks 4 transport options by sustainability + convenience, shows CO₂ savings
- ♿ **Accessibility Mode** — larger fonts, text-to-speech (Web Speech API), accessible route guide, amenity finder

### Ops Dashboard
- 🗺️ **Live Stadium Heatmap** — oval stadium visualization with per-gate occupancy bars updating every 5 seconds
- 📋 **Incident Feed** — submit incident text → Gemini returns priority + category + AI-suggested action in seconds
- 🤖 **AI Command Center** — Gemini analyzes crowd + incident data, generates 3-4 ranked staff actions with assignee and timeframe
- 📊 **Overview Stats** — total fans, avg occupancy, critical gates, open incidents — all live

---

## Setup & Run Locally

### Prerequisites
- Node.js 18+
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))
- Gemini API key (get at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/stadium-genie.git
cd stadium-genie

cd client-fan && npm install && cd ..
cd client-dashboard && npm install && cd ..
```

### 2. Configure Environment
Copy `.env.example` to `.env` in each client folder and fill in values:

```bash
# In client-fan/.env and client-dashboard/.env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=fifa-2026-dc664.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fifa-2026-dc664
VITE_FIREBASE_STORAGE_BUCKET=fifa-2026-dc664.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> **Get Firebase config:** Firebase Console → Project Settings → Your Apps → Web App → Config

### 3. Run

**Fan App** (port 5173):
```bash
cd client-fan && npm run dev
```

**Ops Dashboard** (port 5174):
```bash
cd client-dashboard && npm run dev
```

---

## Simulated Data

Real-time stadium sensor/IoT data and FIFA venue APIs are not publicly available for a hackathon. Occupancy data is simulated via `crowdSimulator.js` — a deterministic-random generator that updates gate occupancy every 5 seconds within realistic match-day patterns.

**One venue modeled in depth:** Estadio Azteca, Mexico City (87,523 capacity, 8 gates, 4 zones). This is intentional scoping — one venue done excellently vs 16 venues done superficially.

Architecture is production-ready: swapping in real IoT sensor feeds requires only changing the data source in `crowdSimulator.js` — the AI decision layer, alerts, and dashboard remain unchanged.

---

## Security Notes
See [SECURITY.md](./SECURITY.md)

---

## Team
**Pritam Kumar** — FIFA World Cup 2026 Hackathon
