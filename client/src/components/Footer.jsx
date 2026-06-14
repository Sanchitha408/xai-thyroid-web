import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Activity, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark border-t border-border mt-auto py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/android-chrome-512x512.png"
                alt="XAI Thyroid"
                className="w-10 h-10 rounded-lg object-contain"
              />
              <span className="font-orbitron font-bold text-white text-lg tracking-wider">
                XAI THYROID
              </span>
            </div>
            <p className="font-poppins text-[#94A3B8] text-sm mb-6">
              Predict. Explain. Trust.
            </p>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col items-center md:items-center gap-2 text-center">
            <p className="font-poppins font-normal text-xs text-muted uppercase tracking-wide">
              Contact Us
            </p>
            <a
              href="mailto:xaithyroid@gmail.com"
              className="flex items-center gap-1.5 font-poppins font-normal text-sm transition-all duration-300"
              style={{ color: '#3B82F6' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#93C5FD';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3B82F6';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              <Mail size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
              xaithyroid@gmail.com
            </a>
          </div>

          {/* Quick Info / Credits */}
          <div className="text-center md:text-right font-poppins text-sm text-muted">
            <p>Designed with medical guidelines for clinicians and patients.</p>
            <p className="mt-1">
              Dataset credit: <span className="text-secondary font-medium">UCI Thyroid Disease</span>
            </p>
          </div>
        </div>

        <hr className="border-border mb-8" />

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-poppins text-xs text-muted max-w-2xl text-center md:text-left leading-relaxed">
            <span className="text-warning font-semibold uppercase">Disclaimer:</span> {t('footer.disclaimer')}
          </p>
          <p className="font-poppins text-xs text-muted text-center shrink-0">
            &copy; {currentYear} XAI Thyroid. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
