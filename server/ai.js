// ============================================================
// Setup — load API key, create the Anthropic client
// ============================================================
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================
// Categorize Task — sends raw brain-dump text to Claude, gets
// back a structured { name, deadline, category, priority }
// ============================================================
async function categorizeTask(rawText) {
  const today = new Date().toISOString().split('T')[0];

  const instruction = `Categorize this task. Choose one category from: School, Events, Self Care, Clubs/Orgs, Chores, Work. Choose a priority from: High, Medium, Low. Display deadline date. Respond with only JSON containing these fields: name, deadline, category, priority. Use ${today} for today's date and format the deadline as YYYY-MM-DD. If the task mentions a specific time, include it in the deadline as YYYY-MM-DDTHH:MM; otherwise just the date.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      { role: "user", content: `${instruction} Task: ${rawText}` }
    ],
  });

  // Extract and clean the response text
  let aiText = response.content[0].text;
  aiText = aiText.replace('```json', '').replace('```', '').trim();

  const structuredTask = JSON.parse(aiText);
  return structuredTask;
}

module.exports = categorizeTask;