/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        xai: {
          bg: '#0A0F1E',
          bgAlt: '#0D1526',
          card: '#111827',
          accent: '#3B82F6',
          text: '#FFFFFF',
          muted: '#94A3B8',
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
          border: 'rgba(255,255,255,0.08)',
          glass: 'rgba(255,255,255,0.04)',
        },
        bg: {
          dark: '#0A0F1E',
          card: '#111827',
        },
        primary: {
          DEFAULT: '#3B82F6',
          glow: 'rgba(59,130,246,0.25)',
        },
        muted: '#94A3B8',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(59,130,246,0.4)',
        'glow-sm': '0 0 10px rgba(59,130,246,0.25)',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'float-up': 'floatUp 8s ease-in-out infinite',
        bounce: 'bounce 1.5s infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.6' },
          '50%': { transform: 'translateY(-20px)', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1)', opacity: '0.3' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
