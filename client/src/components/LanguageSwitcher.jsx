import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
import useAuth from '../hooks/useAuth';
import { updateLanguage } from '../services/authService';
import logger from '../utils/logger'; // in client we don't have server logger, but let's just use console or a dummy

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
];

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = async (code) => {
    try {
      await i18n.changeLanguage(code);
      localStorage.setItem('lang', code);
      
      if (user) {
        // Update user preference in database
        await updateLanguage(code);
        updateUser({ preferred_lang: code });
      }
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  const currentLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative group">
      <button className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-sm">
        <span>{currentLangObj.flag}</span>
        <span className="hidden md:inline font-poppins font-medium">{currentLangObj.label}</span>
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-bg-card border border-border rounded-lg shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <ul className="py-1">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm font-poppins flex items-center gap-2 hover:bg-primary/10 hover:text-white transition-colors duration-200 ${
                  currentLang === lang.code ? 'text-primary bg-primary/5 font-semibold' : 'text-muted'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
