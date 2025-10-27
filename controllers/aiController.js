const crypto = require('crypto');
const AIResult = require('../models/AIResult');
const User = require('../models/User');
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HfInference } = require('@huggingface/inference');

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// AI Search (Anonymous users can use this)
exports.aiSearch = async (req, res) => {
  try {
    const { query, source = 'chatgpt' } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    let result;
    let error = '';
    let isSuccessful = true;
    
    try {
      switch (source) {
        case 'chatgpt':
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an AI assistant that helps with investment scam detection and financial education." },
              { role: "user", content: query }
            ],
            max_tokens: 1000
          });
          result = chatCompletion.choices[0].message.content;
          break;
          
        case 'gemini':
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const geminiResult = await model.generateContent(query);
          result = geminiResult.response.text();
          break;
          
        case 'llama':
          const llamaResult = await hf.textGeneration({
            model: 'meta-llama/Llama-2-7b-chat-hf',
            inputs: query,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.7
            }
          });
          result = llamaResult.generated_text;
          break;
          
        default:
          throw new Error('Unsupported AI source');
      }
    } catch (aiError) {
      isSuccessful = false;
      error = aiError.message;
      result = 'Unable to process your request at this time. Please try again later.';
    }
    
    // Create AI result record
    const aiResult = new AIResult({
      userId: req.user ? req.user.id : null, // Anonymous users won't have user ID
      sessionId: crypto.randomBytes(16).toString('hex'),
      query,
      type: 'search',
      result: {
        text: result,
        source,
        isSuccessful,
        error
      },
      isSuccessful,
      error,
      source,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });
    
    await aiResult.save();
    
    res.status(200).json({
      success: true,
      message: 'AI search completed',
      result,
      isSuccessful,
      error,
      source,
      sessionId: aiResult.sessionId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI search failed',
      error: error.message
    });
  }
};

// AI Analyze (Requires login)
exports.aiAnalyze = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { query, source = 'chatgpt' } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    let result;
    let error = '';
    let isSuccessful = true;
    
    try {
      switch (source) {
        case 'chatgpt':
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an AI assistant that analyzes investment opportunities and detects potential scams." },
              { role: "user", content: query }
            ],
            max_tokens: 1000
          });
          result = chatCompletion.choices[0].message.content;
          break;
          
        case 'gemini':
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const geminiResult = await model.generateContent(query);
          result = geminiResult.response.text();
          break;
          
        case 'llama':
          const llamaResult = await hf.textGeneration({
            model: 'meta-llama/Llama-2-7b-chat-hf',
            inputs: query,
            parameters: {
              max_new_tokens: 1000,
              temperature: 0.7
            }
          });
          result = llamaResult.generated_text;
          break;
          
        default:
          throw new Error('Unsupported AI source');
      }
    } catch (aiError) {
      isSuccessful = false;
      error = aiError.message;
      result = 'Unable to process your request at this time. Please try again later.';
    }
    
    // Create AI result record
    const aiResult = new AIResult({
      userId: req.user.id,
      sessionId: crypto.randomBytes(16).toString('hex'),
      query,
      type: 'analyze',
      result: {
        text: result,
        source,
        isSuccessful,
        error
      },
      isSuccessful,
      error,
      source,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });
    
    await aiResult.save();
    
    res.status(200).json({
      success: true,
      message: 'AI analysis completed',
      result,
      isSuccessful,
      error,
      source,
      sessionId: aiResult.sessionId
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI analysis failed',
      error: error.message
    });
  }
};

// Get AI history
exports.getAIHistory = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { type, page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const filter = { userId: req.user.id };
    if (type) {
      filter.type = type;
    }
    
    const results = await AIResult.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await AIResult.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: 'AI history retrieved successfully',
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI history',
      error: error.message
    });
  }
};