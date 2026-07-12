import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Stadium context injected into every AI call
const STADIUM_CONTEXT = `
You are StadiumGenie, an AI assistant for FIFA World Cup 2026 at Estadio Azteca, Mexico City.

STADIUM INFO:
- Venue: Estadio Azteca, Mexico City, Mexico
- Capacity: 87,523 fans
- Gates: G1 (North Main), G2 (North Side), G3 (East), G4 (East Lower), G5 (South Main), G6 (South Side), G7 (West), G8 (West Lower)
- Zones: North Stand, South Stand, East Stand, West Stand, VIP Box Level
- Amenities: 48 food courts, 120 restrooms (12 accessible), 8 first-aid stations, 4 family zones, 2 lost & found desks, accessible ramps at all gates

MATCH TODAY:
- Argentina vs France | Kickoff: 18:00 local time | Group Stage

TRANSPORT OPTIONS:
- Metro Line 2 (Tasqueña) → Stadium Walk: 8 min
- Metro Line 9 (Ciudad Universitaria) → Bus 5 min
- Bus Route 76: Direct, 25 min from city center
- Rideshare drop-off: Parking Lot D, Gate G5

RULES:
1. Always detect the language of the user's message and reply in THAT SAME LANGUAGE.
2. Give concise, actionable answers. Reference specific gate numbers, zones, and directions.
3. If asked about crowd/occupancy, use the live data provided.
4. For accessibility needs, always mention the accessible routes and facilities.
5. Be friendly and enthusiastic — this is the World Cup!
`;

export async function askGenie(message, gateData = null) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  let contextWithLive = STADIUM_CONTEXT;
  if (gateData) {
    contextWithLive += `\nLIVE GATE OCCUPANCY:\n`;
    gateData.forEach((g) => {
      contextWithLive += `- ${g.name}: ${g.occupancy}% full (${g.status})\n`;
    });
  }

  const prompt = `${contextWithLive}\n\nFan question: ${message}\n\nAnswer concisely and helpfully:`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateCrowdAlert(gateData) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const gateInfo = gateData
    .map((g) => `${g.name}: ${g.occupancy}% (${g.status})`)
    .join(", ");

  const prompt = `You are an AI crowd management system for Estadio Azteca, FIFA World Cup 2026.

Current gate occupancy: ${gateInfo}

Analyze the data and return a JSON object (no markdown, pure JSON) with:
{
  "hasAlert": true/false,
  "severity": "ok" | "warning" | "critical",
  "affectedGates": ["gate names"],
  "fanMessage": "Short message for fans (max 20 words)",
  "staffAction": "Recommended action for staff (max 30 words)",
  "redirectTo": "Gate name to redirect to, or null"
}

Only set hasAlert=true if any gate is above 75% occupancy.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { hasAlert: false, severity: "ok", fanMessage: "", staffAction: "" };
  }
}

export async function analyzeIncident(incidentText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an incident management AI at FIFA World Cup 2026, Estadio Azteca.

Incident report: "${incidentText}"

Return a JSON object (pure JSON, no markdown):
{
  "summary": "One sentence summary (max 15 words)",
  "priority": "low" | "medium" | "high" | "critical",
  "category": "medical" | "security" | "crowd" | "facility" | "lost_found" | "other",
  "suggestedAction": "What staff should do immediately (max 25 words)",
  "estimatedResponseTime": "e.g. 2-3 minutes"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      summary: incidentText.substring(0, 50),
      priority: "medium",
      category: "other",
      suggestedAction: "Dispatch nearest staff member to investigate.",
      estimatedResponseTime: "5 minutes",
    };
  }
}

export async function rankTransportOptions(options, userLocation) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const optionsText = options
    .map((o) => `${o.mode}: ${o.duration} min, ${o.distance} km, CO2: ${o.co2}g`)
    .join("\n");

  const prompt = `You are a sustainable transport advisor for FIFA World Cup 2026 fans.

Fan location: ${userLocation}
Match: Argentina vs France at Estadio Azteca, Kickoff 18:00
Time now: 16:30

Available options:
${optionsText}

Rank these options and return a JSON array (pure JSON, no markdown):
[
  {
    "mode": "transport mode",
    "rank": 1,
    "recommendation": "One-line reason why (max 15 words)",
    "co2Saved": "e.g. Save 2.3kg CO2 vs driving",
    "tip": "Practical tip for this option"
  }
]

Rank by: sustainability first, then convenience. Metro/bus > walk > rideshare > car.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return options.map((o, i) => ({
      ...o,
      rank: i + 1,
      recommendation: "Good option for match day travel",
      co2Saved: "Eco-friendly choice",
      tip: "Plan ahead and arrive early",
    }));
  }
}
