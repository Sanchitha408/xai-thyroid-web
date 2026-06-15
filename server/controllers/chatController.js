// controllers/chatController.js — Groq chatbot with prompt injection prevention
const axios = require('axios');
const { ChatSession } = require('../models');
const logger = require('../utils/logger');
const crypto = require('crypto');
const fetch = globalThis.fetch || require('node-fetch');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1000;

// OWASP LLM: Prompt injection blocklist (case-insensitive)
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all instructions/i,
  /system:/i,
  /you are now/i,
  /pretend you are/i,
  /act as\b/i,
  /jailbreak/i,
  /\bDAN\b/,
  /developer mode/i,
  /override previous/i,
  /new instructions/i,
  /forget your instructions/i,
];

const SYSTEM_PROMPT = `You are XAI Thyroid Assistant, a helpful, compassionate AI assistant for the XAI Thyroid web platform. You answer questions about thyroid health, thyroid conditions (hypothyroidism, hyperthyroidism, normal), blood test values (TSH, T3, T4, FTI), and how AI is used to explain predictions. You always advise users to consult a doctor for medical decisions. You are NOT a replacement for clinical advice.
If asked anything outside thyroid health or this platform, say: 'I can only help with thyroid-related questions on this platform.'
Always respond in the language the user is writing in.
Keep responses concise (under 150 words).`;

function detectInjection(message) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

// ─── POST /api/v1/chat/message ──────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  console.log('GROQ KEY EXISTS:', !!process.env.GROQ_API_KEY);
  try {
    const { message, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        message: 'Message too long. Max 1000 characters.' 
      });
    }

    // Prompt injection check
    const injectionPatterns = [
      'ignore previous instructions',
      'system:',
      'you are now',
      'pretend you are',
      'jailbreak',
      'act as',
      'DAN',
    ];
    const lowerMsg = message.toLowerCase();
    if (injectionPatterns.some((p) => lowerMsg.includes(p))) {
      return res.status(400).json({ 
        message: 'Invalid message content.' 
      });
    }

    // System prompt for Groq
    const systemPrompt = `You are XAI Thyroid Assistant, a helpful 
and compassionate AI assistant for the XAI Thyroid web platform. 
You answer questions about thyroid health, thyroid conditions 
(hypothyroidism, hyperthyroidism, normal), blood test values 
(TSH, T3, T4, FTI), and how AI is used to explain predictions. 
You always advise users to consult a doctor for medical decisions. 
You are NOT a replacement for clinical advice. If asked anything 
outside thyroid health, say: I can only help with thyroid-related 
questions on this platform. Keep responses under 150 words. 
Respond in the same language the user writes in.`;

    // Call Groq API
    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 300,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message.trim() },
          ],
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();

      console.error('GROQ RAW ERROR:', {
        status: groqResponse.status,
        body: errorText,
      });

      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const reply =
      groqData.choices?.[0]?.message?.content ||
      'I am having trouble connecting right now. Please try again.';

    return res.status(200).json({ 
      reply,
      session_id: null 
    });

  } catch (err) {
    console.error('GROQ API FULL ERROR:', {
      message: err.message,
      status: err.status,
      stack: err.stack,
      groqKeyExists: !!process.env.GROQ_API_KEY
    });
    return res.status(200).json({
      reply:
        'I am having trouble connecting right now. ' +
        'Please try again in a moment. For urgent thyroid ' +
        'questions, please consult a doctor.',
      session_id: null,
    });
  }
};

// ─── GET /api/v1/chat/sessions ──────────────────────────────────────────────────
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'language', 'created_at'],
    });

    // Include first user message as preview
    const sessionPreviews = sessions.map((s) => {
      const firstMsg = (s.messages || []).find((m) => m.role === 'user');
      return {
        id: s.id,
        language: s.language,
        created_at: s.created_at,
        preview: firstMsg ? firstMsg.content.slice(0, 100) : '(empty)',
      };
    });

    return res.status(200).json({ sessions: sessionPreviews });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, getSessions };
