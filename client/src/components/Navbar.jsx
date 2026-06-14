import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import gsap from 'gsap';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GSAP animation for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('xai_token');
      await logout();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  // We can use static titles if translation keys don't exist for Compare
  const navLinks = [
    { name: t('nav.home') || 'Home', path: '/' },
    { name: t('nav.diagnose') || 'Diagnose', path: '/diagnose' },
    { name: t('nav.compare') || 'Compare', path: '/compare' },
    { name: t('nav.dashboard') || 'Dashboard', path: '/dashboard' },
    { name: t('nav.about') || 'About', path: '/about' },
  ];

  const filteredLinks = navLinks.filter(link => {
    if ((link.path === '/dashboard' || link.path === '/compare') && !user) return false;
    return true;
  });

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[rgba(10,15,30,0.95)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        : 'bg-transparent border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LEFT — Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <svg width="32" height="32" viewBox="0 0 32 32" className="group-hover:stroke-dashoffset-0" style={{ strokeDasharray: 100, strokeDashoffset: 0, transition: 'stroke-dashoffset 0.5s ease' }}>
            <polyline 
              points="2,16 6,16 8,8 10,24 12,12 14,20 16,16 30,16"
              fill="none" 
              stroke="#3B82F6" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-orbitron font-bold text-lg text-white tracking-wider group-hover:text-primary transition-colors duration-300">
            XAI THYROID
          </span>
        </Link>

        {/* CENTER — Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-1 py-2 font-poppins font-medium text-sm transition-colors duration-300 ${
                isActive(link.path) ? 'text-white' : 'text-muted hover:text-white'
              } group`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-in-out ${
                isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </div>

        {/* RIGHT — Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="font-poppins font-medium text-sm text-secondary border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-all duration-300">
                {t('nav.login') || 'Login'}
              </Link>
              <Link to="/auth?mode=register" className="bg-primary text-white font-poppins font-semibold text-sm px-4 py-2 rounded-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer transition-colors hover:bg-primary/30"
              >
                <span className="font-orbitron text-primary font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-12 right-0 bg-[#111827] border border-border rounded-xl shadow-2xl p-2 min-w-[192px] flex flex-col gap-1">
                  <div className="px-4 py-2 text-sm font-poppins text-muted border-b border-border mb-1 cursor-default">
                    👤 Profile
                  </div>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="px-4 py-2 font-poppins text-sm text-secondary hover:bg-bg-glass hover:text-white rounded-lg transition-colors duration-200">
                    📊 My Dashboard
                  </Link>
                  <Link to="/compare" onClick={() => setDropdownOpen(false)} className="px-4 py-2 font-poppins text-sm text-secondary hover:bg-bg-glass hover:text-white rounded-lg transition-colors duration-200">
                    📋 Compare
                  </Link>
                  <hr className="border-border my-1" />
                  <button onClick={handleLogout} className="px-4 py-2 font-poppins text-sm text-secondary hover:bg-bg-glass hover:text-danger rounded-lg transition-colors duration-200 text-left">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU PANEL */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden absolute top-16 left-0 w-full bg-[rgba(10,15,30,0.98)] backdrop-blur-[20px] border-b border-border py-4 px-6 flex flex-col shadow-2xl"
        >
          <div className="flex flex-col">
            {filteredLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-3 font-poppins font-medium border-b border-border/50 transition-colors ${
                  isActive(link.path) ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {!user ? (
              <>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-center font-poppins font-medium text-sm text-secondary border border-border px-4 py-3 rounded-lg hover:border-primary hover:text-primary transition-all duration-300">
                  {t('nav.login') || 'Login'}
                </Link>
                <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)} className="text-center bg-primary text-white font-poppins font-semibold text-sm px-4 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                  Get Started
                </Link>
              </>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-center font-poppins font-medium text-sm text-danger border border-danger/30 px-4 py-3 rounded-lg hover:bg-danger/10 transition-all duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
