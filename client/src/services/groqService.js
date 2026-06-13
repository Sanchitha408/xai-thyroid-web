// services/groqService.js — Proxied through backend, never direct
import api from './api';

export const sendChatMessage = (message, sessionId, language) =>
  api.post('/chat/message', { message, session_id: sessionId, language });

export const getChatSessions = () => api.get('/chat/sessions');
