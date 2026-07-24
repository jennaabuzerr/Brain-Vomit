// ============================================================
// Setup — load API key, create the Gemini client
// ============================================================
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ============================================================
// Categorize Task — sends raw brain-dump text to Gemini, gets
// back a structured { name, deadline, category, priority }
// ============================================================
async function categorizeTask(rawText) {
  const today = new Date().toISOString().split('T')[0];

  const instruction = `Categorize this task. Choose one category from: School, Events, Self Care, Clubs/Orgs, Chores, Work. Choose a priority from: High, Medium, Low. Display deadline date. Respond with only JSON containing these fields: name, deadline, category, priority. Use ${today} for today's date and demand the deadline to be formatted as YYYY-MM-DD. If the task mentions a specific time, include it in the deadline as a full date+time YYYY-MM-DDTHH:MM; otherwise just the date.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: `${instruction} Task: ${rawText}`,
  });

  // Gemini sometimes wraps its JSON in a Markdown code fence — strip it
  let aiText = response.text;
  aiText = aiText.replace('```json', '').replace('```', '').trim();

  const structuredTask = JSON.parse(aiText);
  return structuredTask;
}

module.exports = categorizeTask;