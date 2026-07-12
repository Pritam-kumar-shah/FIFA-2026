import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeIncident(incidentText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are an incident management AI at FIFA World Cup 2026, Estadio Azteca, Mexico City.

Incident report: "${incidentText}"

Return ONLY a JSON object (no markdown, no code fences):
{
  "summary": "One clear sentence (max 12 words)",
  "priority": "low" | "medium" | "high" | "critical",
  "category": "medical" | "security" | "crowd" | "facility" | "lost_found" | "other",
  "suggestedAction": "Immediate staff action required (max 20 words)",
  "estimatedResponseTime": "X-Y minutes",
  "zone": "Affected zone name if mentioned, else General"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    return {
      summary: incidentText.substring(0, 60) + "...",
      priority: "medium",
      category: "other",
      suggestedAction: "Dispatch nearest staff to investigate immediately.",
      estimatedResponseTime: "5-8 minutes",
      zone: "General",
    };
  }
}

export async function generateStaffRecommendations(gateData, incidents) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const gateInfo = gateData.map((g) => `${g.name}: ${g.occupancy}% (${g.status})`).join("\n");
  const incidentSummary = incidents
    .slice(0, 5)
    .map((i) => `[${i.priority?.toUpperCase()}] ${i.summary}`)
    .join("\n");

  const prompt = `You are an AI operations commander for FIFA World Cup 2026 at Estadio Azteca.

CURRENT GATE OCCUPANCY:
${gateInfo}

RECENT INCIDENTS:
${incidentSummary}

Generate 3-4 actionable staff recommendations. Return ONLY a JSON array:
[
  {
    "priority": "critical" | "high" | "medium",
    "action": "Specific action (max 15 words)",
    "rationale": "Why this is needed (max 15 words)",
    "assignTo": "Security Team | Medical | Gate Staff | Crowd Control | All Staff",
    "timeframe": "Immediate | Within 5 min | Within 15 min"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    return [
      {
        priority: "high",
        action: "Monitor all gates above 80% occupancy",
        rationale: "Prevent dangerous overcrowding near kickoff",
        assignTo: "Gate Staff",
        timeframe: "Immediate",
      },
    ];
  }
}
