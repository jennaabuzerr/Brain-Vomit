// read key from .env
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

//create GoogleGenAI client, allowing interaction with the API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Categorize task using AI
async function categorizeTask(rawText) {
    // todays date
    const today = new Date().toISOString().split('T')[0];

    // instruction for the AI
    const instruction = `Categorize this task. Choose one category from: School, Events, Self Care, Clubs/Orgs, Chores, Work. Choose a priority from: High, Medium, Low. Display deadline date. Respond with only JSON containing these fields: name, deadline, category, priority. Use ${today} for today's date and demand the deadline to be formatted as YYYY-MM-DD. If the task mentions a specific time, include it in the deadline as a full date+time YYYY-MM-DDTHH:MM; otherwise just the date.`;

    // AI call waits for response
    const response = await ai.models.generateContent({
    // The AI model to use
    model: "gemini-flash-latest",
    // The input text for the AI
    contents: `${instruction} Task: ${rawText}`,
    });

    // Get AI response
    let aiText = response.text;

    // Parse AI response
    aiText = aiText.replace('```json', '').replace('```', '').trim();
    const structuredTask = JSON.parse(aiText);
    return structuredTask;
}

// Export the function for use in other modules
module.exports = categorizeTask;