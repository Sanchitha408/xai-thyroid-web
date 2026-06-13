// hooks/useGroqChat.js — Stateful chat hook managing session + messages
import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/groqService';

export default function useGroqChat(language = 'en') {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;
      setError(null);

      // Optimistically add user message
      const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const { data } = await sendChatMessage(text, sessionId, language);
        setSessionId(data.session_id);

        const assistantMsg = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Sorry, something went wrong. Please try again.';
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: errMsg, timestamp: new Date().toISOString(), isError: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, language]
  );

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearSession, sessionId };
}
