const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

async function askClaude(systemPrompt, userMessage) {
  const result = await model.generateContent([
    { text: `${systemPrompt}\n\nUser message: ${userMessage}` },
  ]);
  return result.response.text();
}

module.exports = { askClaude };