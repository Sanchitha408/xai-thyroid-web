// controllers/chatController.js — Groq chatbot with prompt injection prevention
const axios = require('axios');
const { ChatSession } = require('../models');
const logger = require('../utils/logger');
const crypto = require('crypto');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-8b-8192';
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
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, session_id, language = 'en' } = req.body;
    const userId = req.user.id;

    // Validate message length
    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    // OWASP LLM: Prompt injection check
    if (detectInjection(message)) {
      logger.warn('Prompt injection attempt blocked', {
        userId,
        contentHash: crypto.createHash('sha256').update(message).digest('hex').slice(0, 16),
      });
      return res.status(400).json({
        message: 'Your message contains restricted content and cannot be processed.',
      });
    }

    // Load or create session
    let session = null;
    if (session_id) {
      session = await ChatSession.findOne({
        where: { id: session_id, user_id: userId }, // ownership check
      });
    }
    if (!session) {
      session = await ChatSession.create({
        user_id: userId,
        language,
        messages: [],
      });
    }

    // Build conversation history (last MAX_HISTORY_MESSAGES)
    const history = (session.messages || []).slice(-MAX_HISTORY_MESSAGES);
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: message },
    ];

    // Call Groq API
    let reply = '';
    if (!process.env.GROQ_API_KEY) {
      reply =
        'The AI assistant is not configured. Please set GROQ_API_KEY in the server environment.';
    } else {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: groqMessages,
          max_tokens: 300,
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );
      reply = response.data.choices[0].message.content.trim();
    }

    // Append messages to session
    const timestamp = new Date().toISOString();
    const updatedMessages = [
      ...history,
      { role: 'user', content: message, timestamp },
      { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
    ].slice(-MAX_HISTORY_MESSAGES * 2);

    await session.update({ messages: updatedMessages, language });

    return res.status(200).json({ reply, session_id: session.id });
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).json({ message: 'AI service is busy. Please try again shortly.' });
    }
    logger.error('Chat error', { error: err.message });
    next(err);
  }
};

// ─── GET /api/v1/chat/sessions ──────────────────────────────────────────────────
exports.getSessions = async (req, res, next) => {
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
