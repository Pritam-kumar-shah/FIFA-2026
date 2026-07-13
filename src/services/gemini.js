import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const STADIUM_CONTEXT = `You are StadiumGenie, an AI assistant for FIFA World Cup 2026 at Estadio Azteca, Mexico City.

STADIUM INFO:
- Venue: Estadio Azteca, Coyoacán, Mexico City, Mexico
- Capacity: 87,523 fans
- Gates: G1 (North Main), G2 (North Side), G3 (East), G4 (East Lower), G5 (South Main), G6 (South Side), G7 (West), G8 (West Lower)
- Zones: North Stand, South Stand, East Stand, West Stand, VIP Box Level
- Amenities: 48 food courts, 120 restrooms (12 accessible), 8 first-aid stations, 4 family zones, 2 lost & found desks
- Accessible: Ramps at all gates, 850 wheelchair spaces, 12 accessible restrooms, audio description available

MATCH TODAY:
- Argentina vs France | Kickoff: 18:00 local time | Group Stage
- Expected attendance: 85,000+

TRANSPORT OPTIONS:
- Metro Line 2 (Tasqueña) → 8 min walk to Gate 1
- Metro Line 9 (Ciudad Universitaria) → Bus 5 min to Gate 3
- Bus Route 76: Direct, 25 min from city center
- Rideshare drop-off: Parking Lot D, Gate G5

RULES:
1. Detect the user's language and ALWAYS reply in that SAME language.
2. Give concise, actionable answers with specific gate numbers, zones, and directions.
3. If asked about crowd/occupancy, use live gate data provided.
4. For accessibility needs, always mention accessible routes and facilities.
5. Be friendly and enthusiastic — this is the FIFA World Cup!
6. If unsure, say so honestly and suggest asking a stadium volunteer.`;

export async function askGenie(message, gateData = null) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  let ctx = STADIUM_CONTEXT;
  if (gateData && gateData.length) {
    ctx += `\n\nLIVE GATE OCCUPANCY:\n`;
    gateData.forEach(g => {
      ctx += `- ${g.name}: ${g.occupancy}% full (${g.status})\n`;
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${ctx}\n\nFan question: ${message}\n\nAnswer concisely and helpfully:` }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
  });
  return result.response.text();
}

export async function generateCrowdAlert(gateData) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const gateInfo = gateData.map(g => `${g.name}: ${g.occupancy}% (${g.status})`).join(", ");

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `You are an AI crowd management system for Estadio Azteca, FIFA World Cup 2026.

Current gate occupancy: ${gateInfo}

Analyze and return ONLY a JSON object (no markdown, no fences):
{
  "hasAlert": true/false,
  "severity": "ok" | "warning" | "critical",
  "affectedGates": ["gate names"],
  "fanMessage": "Short message for fans (max 20 words)",
  "staffAction": "Recommended action for staff (max 30 words)",
  "redirectTo": "Gate name to redirect to, or null"
}

Only set hasAlert=true if any gate is above 75%.` }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
  });

  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); }
  catch { return { hasAlert: false, severity: "ok", fanMessage: "", staffAction: "" }; }
}

export async function analyzeIncident(incidentText) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `You are an incident management AI for FIFA World Cup 2026, Estadio Azteca.

Incident report: "${incidentText}"

Return ONLY a JSON object (no markdown):
{
  "summary": "One sentence summary (max 15 words)",
  "priority": "low" | "medium" | "high" | "critical",
  "category": "medical" | "security" | "crowd" | "facility" | "lost_found" | "other",
  "suggestedAction": "What staff should do immediately (max 25 words)",
  "estimatedResponseTime": "e.g. 2-3 minutes"
}` }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
  });

  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); }
  catch {
    return { summary: incidentText.substring(0, 50), priority: "medium", category: "other",
      suggestedAction: "Dispatch nearest staff member to investigate.", estimatedResponseTime: "5 minutes" };
  }
}

export async function rankTransportOptions(options, userLocation) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const optionsText = options.map(o => `${o.mode}: ${o.duration} min, ${o.distance} km, CO2: ${o.co2}g`).join("\n");

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `You are a sustainable transport advisor for FIFA World Cup 2026.

Fan location: ${userLocation}
Match: Argentina vs France at Estadio Azteca, Kickoff 18:00

Available options:
${optionsText}

Rank these and return ONLY a JSON array (no markdown):
[{"mode":"...","rank":1,"recommendation":"One-line why (max 15 words)","co2Saved":"e.g. Save 2.3kg CO2 vs driving","tip":"Practical tip"}]

Rank by: sustainability first, then convenience.` }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
  });

  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); }
  catch {
    return options.map((o, i) => ({ ...o, rank: i + 1, recommendation: "Good option for match day", co2Saved: "Eco-friendly", tip: "Arrive early" }));
  }
}

export async function generateStaffRecommendations(gateData, incidents) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const gateInfo = gateData.map(g => `${g.name}: ${g.occupancy}% (${g.status})`).join("\n");
  const incidentSummary = incidents.slice(0, 5).map(i => `[${i.priority?.toUpperCase()}] ${i.summary}`).join("\n");

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `You are an AI operations commander for FIFA World Cup 2026 at Estadio Azteca.

GATE OCCUPANCY:
${gateInfo}

RECENT INCIDENTS:
${incidentSummary || "No incidents"}

Generate 3-4 actionable staff recommendations. Return ONLY a JSON array (no markdown):
[{"priority":"critical"|"high"|"medium","action":"Specific action (max 15 words)","rationale":"Why (max 15 words)","assignTo":"Security Team|Medical|Gate Staff|Crowd Control|All Staff","timeframe":"Immediate|Within 5 min|Within 15 min"}]` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
  });

  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try { return JSON.parse(text); }
  catch {
    return [{ priority: "high", action: "Monitor gates above 80% occupancy", rationale: "Prevent overcrowding near kickoff", assignTo: "Gate Staff", timeframe: "Immediate" }];
  }
}
