import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from "../assets/logo.png";

const links = [
  { name: 'Home', href: '/', key: 'nav.home' },
  { name: 'Diagnose', href: '/diagnose', key: 'nav.diagnose' },
  { name: 'About', href: '/about', key: 'nav.about' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mobileMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('[data-hamburger]')
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // GSAP mobile menu animation
  useEffect(() => {
    if (mobileOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [mobileOpen]);

  const isActive = (href) => location.pathname === href;

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('xai_token');
      navigate('/');
      setDropdownOpen(false);
      setMobileOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Filter protected links
  const visibleLinks = links.filter(
    (l) => (l.href !== '/compare' && l.href !== '/dashboard' && l.href !== '/ultrasound') || user
  );

  return (
    <>
      {/* ── FLOATING NAVBAR ── */}
      <nav
        className={`fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 rounded-full px-6 py-3 transition-all duration-500 ${scrolled
          ? 'bg-[rgba(10,15,30,0.95)] border border-[rgba(255,255,255,0.12)] shadow-[0_8px_40px_rgba(0,0,0,0.6)]'
          : 'bg-[rgba(10,15,30,0.75)] border border-[rgba(255,255,255,0.08)] shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
          }`}
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between">

          {/* ── LEFT: LOGO ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={Logo}
              alt="XAI Thyroid"
              className="w-10 h-10 bg-white p-1 rounded-lg object-contain border-2 border-red-500"
              />
            <span className="font-orbitron font-bold text-base text-white tracking-wider group-hover:text-[#3B82F6] transition-colors duration-300 hidden sm:block">
              XAI THYROID
            </span>
          </Link>

          {/* ── CENTER: NAV LINKS (desktop) ── */}
          <div className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 rounded-full font-poppins font-medium text-sm transition-all duration-300 ${isActive(link.href)
                  ? 'bg-[rgba(59,130,246,0.15)] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                  }`}
              >
                {t(link.key)}
                {isActive(link.href) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3B82F6]" />
                )}
              </Link>
            ))}
          </div>

          {/* ── RIGHT: ACTIONS ── */}
          <div className="flex items-center gap-2">

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Not logged in */}
            {!user && (
              <>
                <Link to="/auth">
                  <button className="hidden sm:flex items-center px-4 py-2 rounded-full font-poppins font-medium text-sm text-[#94A3B8] border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(59,130,246,0.5)] hover:bg-[rgba(59,130,246,0.08)] transition-all duration-300">
                    {t('nav.login')}
                  </button>
                </Link>
                <Link to="/auth?mode=register">
                  <button className="flex items-center px-4 py-2 rounded-full font-poppins font-semibold text-sm text-white bg-[#3B82F6] hover:bg-[#2563EB] hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 active:scale-95">
                    {t('nav.getStarted')}
                  </button>
                </Link>
              </>
            )}

            {/* Logged in — avatar + dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center font-orbitron font-bold text-sm text-[#3B82F6] hover:bg-[rgba(59,130,246,0.25)] hover:border-[#3B82F6] hover:scale-110 transition-all duration-300"
                >
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </button>

                {dropdownOpen && (
                  <div className="absolute top-12 right-0 w-52 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 mb-1 border-b border-[rgba(255,255,255,0.06)]">
                      <p className="font-poppins font-semibold text-white text-sm truncate">
                        {user?.full_name}
                      </p>
                      <p className="font-poppins text-[#94A3B8] text-xs truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    {[
                      { label: '🩺 Diagnose', href: '/diagnose' },
                      { label: '🔬 Ultrasound Analysis', href: '/image-analysis' },
                      { label: '📊 Compare Diagnoses', href: '/compare' },
                      { label: '📋 My Dashboard', href: '/dashboard' },
                      { label: '👤 About', href: '/about' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 rounded-xl font-poppins text-sm text-[#94A3B8] hover:bg-[rgba(255,255,255,0.06)] hover:text-white transition-all duration-200 w-full"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <div className="my-1 border-t border-[rgba(255,255,255,0.06)]" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 rounded-xl font-poppins text-sm text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200"
                    >
                      🚪 {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              data-hamburger
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.12)] hover:scale-110 transition-all duration-300"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU PANEL ── */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed top-20 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-4"
          style={{
            background: 'rgba(10,15,30,0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl font-poppins font-medium text-sm transition-all duration-200 ${isActive(link.href)
                  ? 'bg-[rgba(59,130,246,0.15)] text-white'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
                  }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>

          <div className="my-3 border-t border-[rgba(255,255,255,0.06)]" />

          {/* Auth section */}
          {!user ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl font-poppins font-medium text-sm text-[#94A3B8] border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(59,130,246,0.5)] hover:bg-[rgba(59,130,246,0.08)] transition-all duration-300 text-center"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/auth?mode=register"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl font-poppins font-semibold text-sm text-white bg-[#3B82F6] hover:bg-[#2563EB] transition-all duration-300 text-center"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="px-4 font-poppins font-semibold text-white text-sm truncate">
                {user?.full_name}
              </p>
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl font-poppins text-sm text-[#EF4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200 text-center"
              >
                🚪 {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
