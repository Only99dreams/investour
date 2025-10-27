// services/aiService.js
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeInvestment = async (text, source = 'chatgpt') => {
  try {
    if (source === 'gemini') {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(
        `Analyze this investment for scam risk: ${text}`
      );
      return result.response.text();
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an investment scam detection expert.' },
          { role: 'user', content: `Analyze for scam risk: ${text}` }
        ]
      });
      return completion.choices[0].message.content;
    }
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};