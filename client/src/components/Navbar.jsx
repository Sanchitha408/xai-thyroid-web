import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogOut, Activity } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import { initNavbarAnimation } from '../animations/gsapAnimations';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    initNavbarAnimation(navRef);
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.diagnose'), path: '/diagnose' },
    { name: t('nav.dashboard'), path: '/dashboard', protected: true },
    { name: t('nav.about'), path: '/about' }
  ];

  const filteredNavItems = navItems.filter(item => !item.protected || user);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg-dark/95 backdrop-blur-glass border-b border-border py-4 shadow-card'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Activity className="text-primary group-hover:rotate-12 transition-transform duration-300" size={28} />
          <span className="font-orbitron font-bold text-xl tracking-wider text-secondary group-hover:text-primary transition-colors duration-300">
            XAI THYROID
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link font-poppins text-sm font-medium ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-poppins text-muted">
                {user.full_name}
              </span>
              <button onClick={handleLogout} className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
                <LogOut size={16} />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="btn-secondary py-2 px-4 text-sm">
                {t('nav.login')}
              </Link>
              <Link to="/auth?mode=register" className="btn-primary py-2 px-4 text-sm">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-secondary hover:text-primary transition-colors duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-bg-card border-b border-border shadow-card backdrop-blur-glass p-6 flex flex-col gap-6 z-50">
          <div className="flex flex-col gap-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-poppins text-base font-medium py-2 hover:text-primary transition-colors duration-200 ${
                  location.pathname === item.path ? 'text-primary' : 'text-muted'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-poppins text-muted">Language</span>
              <LanguageSwitcher />
            </div>

            {user ? (
              <div className="flex flex-col gap-4">
                <span className="text-sm font-poppins text-secondary">{user.full_name}</span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-secondary w-full py-2.5 text-center text-sm"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth?mode=register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary w-full py-2.5 text-center text-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
