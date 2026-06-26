import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot, User as UserIcon, Volume2, VolumeX } from 'lucide-react';
import i18n from '../i18n/i18n';
import { animateChatOpen } from '../animations/gsapAnimations';

export default function ChatBot() {
  const { t } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatPanelRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Trigger GSAP open animation when isOpen becomes true
  useEffect(() => {
    if (isOpen) {
      animateChatOpen(chatPanelRef);
      scrollToBottom();
    } else {
      // On chatbot close (when panel closes)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakText = (text, language) => {
    if (!voiceEnabled) return;
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map app language codes to BCP-47 speech codes
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      kn: 'kn-IN',
      ta: 'ta-IN',
      fr: 'fr-FR',
      es: 'es-ES',
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage 
    }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://xai-thyroid-backend.onrender.com/api/v1/chat/message',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage, 
            language: currentLanguage || 'en' 
          }),
        }
      );

      const data = await response.json();
      
      const replyText = data.reply || 'Sorry, I could not process that.';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: replyText 
      }]);
      speakText(replyText, currentLanguage);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t('chatbot.error')
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-poppins">
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <div className="relative group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open chat assistant"
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 50,
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '9999px',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(59,130,246,0.4)',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 14px 35px rgba(59,130,246,0.65)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(59,130,246,0.4)';
            }}
          >
            <MessageCircle size={24} color="white" />
          </button>
          {/* Tooltip */}
          <span
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: '1.5rem',
              zIndex: 50,
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              fontSize: '0.7rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            }}
            className="group-hover:!opacity-100"
          >
            {t('chatbot.title')}
          </span>
        </div>
      )}

      {/* Expanded Chat Panel */}
      {isOpen && (
        <div
          ref={chatPanelRef}
          className="w-[380px] h-[520px] max-w-[calc(100vw-2rem)] bg-bg-card/95 border border-border rounded-2xl shadow-card backdrop-blur-glass flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-primary" size={22} />
              <span className="font-orbitron font-semibold text-sm tracking-wider text-secondary">
                {t('chatbot.title')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="w-8 h-8 rounded-full bg-bg-glass border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-all duration-200"
                title={voiceEnabled ? t('chatbot.mute') : t('chatbot.unmute')}
              >
                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-secondary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto chat-messages flex flex-col gap-4">
            {/* Welcome message */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="bg-bg-glass border border-border py-2 px-3.5 rounded-2xl rounded-tl-none max-w-[80%] text-sm text-secondary">
                {t('chatbot.welcome')}
              </div>
            </div>

            {/* Render conversation */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLastMessage = index === messages.length - 1;
              return (
                <div key={index} className="flex flex-col gap-2">
                  <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Bot size={16} className="text-primary" />
                        </div>
                        {isLastMessage && isSpeaking && (
                          <div className="flex items-end gap-[2px] h-4 px-1">
                            <span className="equalizer-bar"></span>
                            <span className="equalizer-bar"></span>
                            <span className="equalizer-bar"></span>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`py-2 px-3.5 rounded-2xl text-sm ${
                        isUser
                          ? 'bg-primary text-white rounded-tr-none max-w-[80%] shadow-glow-sm'
                          : 'bg-bg-glass border border-border rounded-tl-none max-w-[80%] text-secondary'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-bg-glass border border-border flex items-center justify-center shrink-0">
                        <UserIcon size={16} className="text-muted" />
                      </div>
                    )}
                  </div>
                  {/* Stop button below the last assistant message if currently speaking */}
                  {!isUser && isLastMessage && isSpeaking && (
                    <button
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        setIsSpeaking(false);
                      }}
                      className="mt-1 ml-[44px] self-start flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-glass border border-border text-xs text-muted hover:text-primary hover:border-primary transition-all duration-200 shadow-sm"
                    >
                      <span>⏹</span> {t('chatbot.stop')}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot size={16} className="text-primary" />
                </div>
                <div className="bg-bg-glass border border-border py-3.5 px-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer & input */}
          <div className="p-3 bg-bg-card border-t border-border flex flex-col gap-2">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
                className="form-input flex-1 py-2 text-sm bg-bg-glass"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="btn-primary py-2 px-3.5 shadow-none shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
            <div className="text-[10px] text-muted text-center flex items-center justify-center gap-1">
              <span>{t('chatbot.powered_by')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
