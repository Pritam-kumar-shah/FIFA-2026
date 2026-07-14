import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiCache } from "./cache";

// Initialize Gemini SDK once (Singleton)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
let cachedModel = null;

/**
 * Returns the generative model instance (Lazy/Singleton).
 */
function getModel() {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }
  if (!cachedModel) {
    cachedModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return cachedModel;
}

// Simple sliding window rate limiter
const MAX_REQUESTS = 30; // Max requests per window
const WINDOW_SIZE_MS = 60000; // 1 minute
const requestTimestamps = [];

function checkRateLimit() {
  const now = Date.now();
  // Filter out timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - WINDOW_SIZE_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS) {
    throw new Error('Rate limit exceeded. Please wait a moment before sending another request.');
  }
  requestTimestamps.push(now);
}

/**
 * Validates and sanitizes input to prevent prompt injection and XSS.
 * @param {string} text - User message
 * @returns {string} Sanitized text
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') {
    throw new TypeError('Input must be a string');
  }
  const sanitized = text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags and content completely
    .replace(/<[^>]*>/g, '') // Strip other HTML tags
    .substring(0, 1000); // Reasonable character limit
  if (!sanitized) {
    throw new Error('Input cannot be empty');
  }
  return sanitized;
}

/**
 * Executes a call to the Gemini API with a timeout protection.
 * @param {Object} contents - Call contents
 * @param {Object} config - Generation configuration
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<string>} AI response text
 */
async function callGeminiWithTimeout(contents, config = {}, timeoutMs = 12000) {
  checkRateLimit();
  const model = getModel();

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
  );

  // Create the API call promise
  const apiPromise = (async () => {
    const result = await model.generateContent({
      contents,
      generationConfig: config,
    });
    return result.response.text();
  })();

  // Race API call against timeout
  return Promise.race([apiPromise, timeoutPromise]);
}

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

/**
 * Fan AI Concierge - answers general fan inquiries.
 * @param {string} message - User message
 * @param {Array} [gateData] - Live gate status
 * @returns {Promise<string>} AI response
 */
export async function askGenie(message, gateData = null) {
  try {
    const cleanMessage = sanitizeInput(message);
    let ctx = STADIUM_CONTEXT;
    if (gateData && gateData.length) {
      ctx += `\n\nLIVE GATE OCCUPANCY:\n`;
      gateData.forEach(g => {
        ctx += `- ${g.name}: ${g.occupancy}% full (${g.status})\n`;
      });
    }

    const cacheKey = `ask:${cleanMessage}:${JSON.stringify(gateData)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await callGeminiWithTimeout(
      [{ role: "user", parts: [{ text: `${ctx}\n\nFan question: ${cleanMessage}\n\nAnswer concisely and helpfully:` }] }],
      { temperature: 0.7, maxOutputTokens: 500 }
    );

    apiCache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error('askGenie error:', error);
    return 'I\'m having trouble connecting right now. Please check the gate status board nearby or ask a stadium volunteer for help!';
  }
}

/**
 * Generates live crowd alerts.
 * @param {Array} gateData - Current gates info
 * @returns {Promise<Object>} Alert JSON
 */
export async function generateCrowdAlert(gateData) {
  try {
    if (!gateData || !gateData.length) {
      throw new Error('Gate data is required for crowd alerts.');
    }

    const gateInfo = gateData.map(g => `${g.name}: ${g.occupancy}% (${g.status})`).join(", ");
    const cacheKey = `crowd:${gateInfo}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await callGeminiWithTimeout(
      [{ role: "user", parts: [{ text: `You are an AI crowd management system for Estadio Azteca, FIFA World Cup 2026.

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
      { temperature: 0.3, maxOutputTokens: 300 }
    );

    const text = response.trim().replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);
    apiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('generateCrowdAlert error:', error);
    return { hasAlert: false, severity: "ok", fanMessage: "", staffAction: "" };
  }
}

/**
 * Triage incident reports.
 * @param {string} incidentText - Incident detail
 * @returns {Promise<Object>} Triage JSON
 */
export async function analyzeIncident(incidentText) {
  try {
    const cleanIncident = sanitizeInput(incidentText);
    const cacheKey = `incident:${cleanIncident}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await callGeminiWithTimeout(
      [{ role: "user", parts: [{ text: `You are an incident management AI for FIFA World Cup 2026, Estadio Azteca.

Incident report: "${cleanIncident}"

Return ONLY a JSON object (no markdown):
{
  "summary": "One sentence summary (max 15 words)",
  "priority": "low" | "medium" | "high" | "critical",
  "category": "medical" | "security" | "crowd" | "facility" | "lost_found" | "other",
  "suggestedAction": "What staff should do immediately (max 25 words)",
  "estimatedResponseTime": "e.g. 2-3 minutes"
}` }] }],
      { temperature: 0.2, maxOutputTokens: 200 }
    );

    const text = response.trim().replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);
    apiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('analyzeIncident error:', error);
    return {
      summary: incidentText.substring(0, 50),
      priority: "medium",
      category: "other",
      suggestedAction: "Dispatch nearest staff member to investigate.",
      estimatedResponseTime: "5 minutes"
    };
  }
}

/**
 * Rank sustainable transport options.
 * @param {Array} options - List of transport modes
 * @param {string} userLocation - Fan location context
 * @returns {Promise<Array>} Ranked transport option list
 */
export async function rankTransportOptions(options, userLocation) {
  try {
    if (!options || !options.length) {
      throw new Error('Transport options are required.');
    }
    const cleanLocation = sanitizeInput(userLocation);
    const optionsText = options.map(o => `${o.mode}: ${o.duration} min, ${o.distance} km, CO2: ${o.co2}g`).join("\n");

    const cacheKey = `transport:${optionsText}:${cleanLocation}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await callGeminiWithTimeout(
      [{ role: "user", parts: [{ text: `You are a sustainable transport advisor for FIFA World Cup 2026.

Fan location: ${cleanLocation}
Match: Argentina vs France at Estadio Azteca, Kickoff 18:00

Available options:
${optionsText}

Rank these and return ONLY a JSON array (no markdown):
[{"mode":"...","rank":1,"recommendation":"One-line why (max 15 words)","co2Saved":"e.g. Save 2.3kg CO2 vs driving","tip":"Practical tip"}]

Rank by: sustainability first, then convenience.` }] }],
      { temperature: 0.3, maxOutputTokens: 400 }
    );

    const text = response.trim().replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);
    apiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('rankTransportOptions error:', error);
    return options.map((o, i) => ({
      ...o,
      rank: i + 1,
      recommendation: "Good option for match day",
      co2Saved: "Eco-friendly",
      tip: "Arrive early"
    }));
  }
}

/**
 * Generate commander action suggestions.
 * @param {Array} gateData - Gate states
 * @param {Array} incidents - Current incident records
 * @returns {Promise<Array>} Commander suggestions
 */
export async function generateStaffRecommendations(gateData, incidents) {
  try {
    if (!gateData || !gateData.length) {
      throw new Error('Gate data is required for staff recommendations.');
    }

    const gateInfo = gateData.map(g => `${g.name}: ${g.occupancy}% (${g.status})`).join("\n");
    const incidentSummary = incidents.slice(0, 5).map(i => `[${i.priority?.toUpperCase()}] ${i.summary}`).join("\n");

    const cacheKey = `staff:${gateInfo}:${incidentSummary}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await callGeminiWithTimeout(
      [{ role: "user", parts: [{ text: `You are an AI operations commander for FIFA World Cup 2026 at Estadio Azteca.

GATE OCCUPANCY:
${gateInfo}

RECENT INCIDENTS:
${incidentSummary || "No incidents"}

Generate 3-4 actionable staff recommendations. Return ONLY a JSON array (no markdown):
[{"priority":"critical"|"high"|"medium","action":"Specific action (max 15 words)","rationale":"Why (max 15 words)","assignTo":"Security Team|Medical|Gate Staff|Crowd Control|All Staff","timeframe":"Immediate|Within 5 min|Within 15 min"}]` }] }],
      { temperature: 0.4, maxOutputTokens: 400 }
    );

    const text = response.trim().replace(/```json|```/g, "").trim();
    const result = JSON.parse(text);
    apiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('generateStaffRecommendations error:', error);
    return [{
      priority: "high",
      action: "Monitor gates above 80% occupancy",
      rationale: "Prevent overcrowding near kickoff",
      assignTo: "Gate Staff",
      timeframe: "Immediate"
    }];
  }
}
