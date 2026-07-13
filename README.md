# 🏟️ StadiumGenie — GenAI Smart Stadium Assistant

## FIFA World Cup 2026 · PromptWars Hackathon Submission

> *StadiumGenie is a GenAI-powered assistant that helps fans navigate, stay safe, and travel sustainably — while giving organizers a real-time AI co-pilot for crowd and incident management.*

---

## 📋 Chosen Vertical

**[Challenge 4] Smart Stadiums & Tournament Operations**

---

## 🎯 Problem Statement

During FIFA World Cup 2026 (16 host cities, 48 teams, millions of fans):

| Problem | Impact |
|---------|--------|
| Fans get lost / can't find fastest route to their gate | Poor experience, missed kickoff |
| Language barriers for international fans (50+ languages) | Exclusion, frustration |
| Crowd bottlenecks at gates during peak entry/exit | Safety hazards, delays |
| Staff can't process incident reports fast enough | Slow emergency response |
| No easy way to compare eco-friendly transport options | Higher carbon footprint |
| Accessibility for disabled/elderly fans is an afterthought | Exclusion, legal risk |

---

## 💡 Solution

Two connected apps sharing one AI brain (**Google Gemini API**):

| App | Users | Purpose |
|-----|-------|---------|
| **Fan Experience** (mobile-first) | Spectators | Multilingual AI chat, live crowd alerts, sustainable transport advisor, accessibility mode |
| **Ops Dashboard** | Staff / Organizers | Live gate heatmap, AI-prioritized incident feed, AI command center |

### Key Differentiator

AI is a **decision layer** over live stadium context — not just a chat widget. Gemini reasons over real-time gate occupancy + incident logs to produce actionable, structured decisions:

> *"Gate 4 is at 88% — redirect fans to Gate 7, deploy crowd control team immediately."*

---

## 🏗️ Architecture

```
┌──────────────────────┐
│   Landing Page        │ ← Choose: Fan App or Ops Dashboard
│   (React + Vite)      │
└──────────┬────────────┘
           │
    ┌──────┴──────┐
    ▼              ▼
┌──────────┐  ┌──────────────┐
│ Fan App  │  │Ops Dashboard │
│          │  │              │
│ • Chat   │  │ • Heatmap    │
│ • Crowd  │  │ • Incidents  │
│ • Transport│ │ • AI Command │
│ • Access.│  │ • Overview   │
└────┬─────┘  └─────┬────────┘
     │               │
     └───────┬───────┘
             ▼
┌─────────────────────────────┐
│     Shared Services          │
│                              │
│  gemini.js (5 AI functions)  │
│  crowdSimulator.js (live data│
│  simulation engine)          │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    ▼              ▼
┌──────────┐  ┌──────────────┐
│Google    │  │ Client-side   │
│Gemini API│  │ Crowd Sim     │
│(2.0-flash)│ │ (5s interval)│
└──────────┘  └──────────────┘
```

**Crowd data is simulated** by `crowdSimulator.js` — a deterministic-random engine that updates gate occupancy every 5 seconds within realistic match-day bounds. Architecture is designed so this swaps directly for real IoT sensor feeds.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite 6 | Component-based SPA |
| Styling | Tailwind CSS v4 + Inline Styles | Utility classes + component styles |
| AI Engine | Google Gemini API (2.0-flash) | Multilingual chat, crowd analysis, incident triage, transport ranking, staff recommendations |
| Icons | lucide-react | Consistent icon set |
| Animations | framer-motion + CSS | Smooth micro-interactions |
| Notifications | react-hot-toast | User feedback toasts |
| Testing | Vitest + Testing Library | Unit + component tests |
| Fonts | Google Fonts (Inter + Outfit) | Modern typography |

---

## ✨ Features

### Fan Experience App

| Feature | Description | AI Integration |
|---------|-------------|----------------|
| 🌍 **Multilingual AI Concierge** | Chat with the AI in any language — auto-detects and responds in same language (Hindi, Spanish, French, Arabic, etc.) | `askGenie()` via Gemini |
| 🚨 **Live Crowd Alerts** | Gemini analyzes gate occupancy and pushes fan-facing alerts when gates hit 75%+ | `generateCrowdAlert()` |
| 🚪 **Gate Status Grid** | Real-time occupancy grid with color-coded + icon-coded status (colorblind-safe) | Live simulation data |
| 🌿 **Transport Advisor** | AI ranks 4 transport options by sustainability + convenience, shows CO₂ savings | `rankTransportOptions()` |
| ♿ **Accessibility Mode** | Large text, high contrast, text-to-speech (Web Speech API), accessible route guide, amenity finder | Client-side APIs |

### Ops Dashboard

| Feature | Description | AI Integration |
|---------|-------------|----------------|
| 🗺️ **Live Stadium Heatmap** | Oval stadium visualization with per-gate occupancy bars updating every 5 seconds | Live simulation |
| 📋 **Incident Feed** | Submit incident text → Gemini returns priority + category + AI-suggested action | `analyzeIncident()` |
| 🤖 **AI Command Center** | Gemini analyzes crowd + incident data, generates 3-4 ranked staff actions with assignee and timeframe | `generateStaffRecommendations()` |
| 📊 **Overview Stats** | Total fans, avg occupancy, critical gates, open incidents — all live | Derived from simulation |

---

## 🚀 Setup & Run Locally

### Prerequisites

- **Node.js 18+** ([download](https://nodejs.org/))
- **Gemini API Key** (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/stadium-genie.git
cd stadium-genie
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Gemini API key:

```bash
cp .env.example .env
```

Then edit `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id  # optional
```

> 💡 **Get a free Gemini API key:** Go to [Google AI Studio](https://aistudio.google.com) → Get API Key → Create

### 3. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run Tests

```bash
npm run test
```

### 5. Build for Production

```bash
npm run build
```

---

## 🧪 Testing

| Test File | Coverage |
|-----------|----------|
| `crowdSimulator.test.js` | Gate data integrity, occupancy bounds, status transitions, color mapping |
| `gemini.test.js` | All 5 AI functions, mock Gemini responses, JSON parsing, error fallbacks |
| `App.test.jsx` | App renders, landing page content, keyboard accessibility, navigation |

Run all tests:
```bash
npm run test
```

---

## ♿ Accessibility

StadiumGenie implements comprehensive accessibility following WCAG 2.1 guidelines:

| Feature | Implementation |
|---------|----------------|
| **Skip to Content** | Skip link visible on keyboard focus |
| **Keyboard Navigation** | Full tab order, focus-visible outlines, ARIA roles |
| **Screen Reader** | ARIA labels on all interactive elements, live regions for updates |
| **Reduced Motion** | `prefers-reduced-motion` media query disables animations |
| **Large Text Mode** | Toggle in Fan App increases base font size |
| **High Contrast** | Toggle increases text contrast ratios |
| **Text-to-Speech** | Web Speech API integration for content reading |
| **Colorblind Safe** | Status uses icons + text alongside color (not color-only) |
| **Semantic HTML** | `nav`, `main`, `section`, `article`, `button`, `h1-h3` hierarchy |
| **Unique IDs** | Every interactive element has a descriptive unique ID |

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for full details.

| Measure | Status |
|---------|--------|
| API keys in `.env` (git-ignored) | ✅ |
| Input validation on all user inputs | ✅ |
| System prompt isolation (user input separate from instructions) | ✅ |
| No PII storage | ✅ |
| Rate limiting on AI calls (client-side) | ✅ |
| XSS protection (React auto-escaping) | ✅ |
| Firestore security rules documented | ✅ |

---

## 📊 Simulated Data

Real-time stadium sensor/IoT data and FIFA venue APIs are not publicly available for a hackathon.

**Simulation approach:**
- `crowdSimulator.js` generates realistic gate occupancy data
- Updates every 5 seconds with bounded random deltas
- Status thresholds: OK (<70%), Warning (70-85%), Critical (>85%)

**One venue modeled in depth:** Estadio Azteca, Mexico City (87,523 capacity, 8 gates, 4 zones). This is intentional scoping — one venue done excellently vs 16 venues done superficially.

**Production-ready architecture:** Swapping in real IoT sensor feeds requires only changing the data source in `crowdSimulator.js` — the AI decision layer, alerts, and dashboard remain unchanged.

---

## 📁 Project Structure

```
stadium-genie/
├── index.html                          # HTML entry with SEO meta tags
├── package.json                        # Dependencies & scripts
├── vite.config.js                      # Vite + React + Tailwind config
├── .env.example                        # Environment variable template
├── .gitignore                          # Git ignore rules
├── SECURITY.md                         # Security policy
├── README.md                           # This file
├── public/
│   └── favicon.svg                     # App icon
└── src/
    ├── main.jsx                        # React entry point
    ├── App.jsx                         # Root router (hash-based)
    ├── index.css                       # Tailwind v4 + global tokens
    ├── components/
    │   ├── shared/
    │   │   └── LandingPage.jsx         # Welcome screen
    │   ├── fan/
    │   │   ├── FanApp.jsx              # Fan app shell
    │   │   ├── AIChatbot.jsx           # Multilingual AI chat
    │   │   ├── CrowdAlerts.jsx         # Live crowd status
    │   │   ├── TransportAdvisor.jsx    # Sustainable transport
    │   │   └── AccessibilityGuide.jsx  # Accessibility features
    │   └── ops/
    │       ├── OpsApp.jsx              # Ops dashboard shell
    │       ├── Sidebar.jsx             # Navigation sidebar
    │       ├── StadiumHeatmap.jsx      # Oval stadium heatmap
    │       ├── AIRecommendations.jsx   # AI staff recommendations
    │       └── IncidentFeed.jsx        # Incident reporting + AI triage
    ├── services/
    │   ├── gemini.js                   # 5 Gemini AI functions
    │   └── crowdSimulator.js           # Gate occupancy simulation
    └── test/
        ├── setup.js                    # Vitest setup
        ├── crowdSimulator.test.js      # Simulator unit tests
        ├── gemini.test.js              # AI service mock tests
        └── App.test.jsx                # Component render tests
```

---

## 🧠 Approach & Logic

### Design Philosophy
1. **AI as a Decision Layer** — Not just a chatbot. Gemini analyzes structured data (gate occupancy, incidents) and produces actionable recommendations.
2. **Two Personas, One Brain** — Fan App and Ops Dashboard share the same AI service but present information appropriate to each user type.
3. **Fail Gracefully** — Every AI call has fallback data. The app never shows a blank screen if Gemini is unavailable.
4. **Production Architecture** — Simulated data uses the same interface as real IoT feeds. Swap one file to go live.

### AI Integration Points
| Function | Input | Output | Used By |
|----------|-------|--------|---------|
| `askGenie()` | User message + gate data | Multilingual text response | Fan Chat |
| `generateCrowdAlert()` | Gate occupancy array | Structured JSON alert | Fan Crowd |
| `analyzeIncident()` | Free-text incident report | Priority + category + action | Ops Incidents |
| `rankTransportOptions()` | Transport options + location | Ranked + sustainability scored | Fan Transport |
| `generateStaffRecommendations()` | Gates + incidents | Prioritized action items | Ops AI Command |

### Assumptions
- One venue (Estadio Azteca) for deep demonstration vs shallow multi-venue
- Match: Argentina vs France (Group Stage) as the demo scenario
- Crowd data simulated client-side (no backend server needed)
- Gemini API key provided by user (free tier sufficient for demo)

---

## 👤 Team

**Pritam Kumar** — FIFA World Cup 2026 Smart Stadium Hackathon

---

## 📄 License

This project was built for the PromptWars Virtual Hackathon 2026.
