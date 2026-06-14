// services/groqService.js — Proxied through backend, never direct
import api from './api';

export const sendMessage = async (message, sessionId, language) => {
  const response = await api.post('/chat/message', {
    message,
    session_id: sessionId,
    language: language || 'en',
  });
  return response.data;
};

export const sendChatMessage = (message, sessionId, language) =>
  api.post('/chat/message', { message, session_id: sessionId, language });

export const getChatSessions = () => api.get('/chat/sessions');
