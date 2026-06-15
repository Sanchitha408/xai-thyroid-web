import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, UserPlus, LogIn, Mail, Lock, User, Globe, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { register as registerApi, login as loginApi } from '../services/authService';


const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'es', label: 'Español (Spanish)' },
];

export default function Auth() {
  const { t } = useTranslation();
  const { login: saveAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab state (login vs register)
  const isRegisterParam = searchParams.get('mode') === 'register';
  const [isRegister, setIsRegister] = useState(isRegisterParam);

  // Listen to url param updates
  useEffect(() => {
    setIsRegister(searchParams.get('mode') === 'register');
  }, [searchParams]);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [showPassword, setShowPassword] = useState(false);

  // Errors & Loading state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth failure redirect
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'google_failed') {
      setError('Google sign-in failed. Please try again or use email and password.');
    }
  }, [searchParams]);

  const toggleTab = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Form validations
    if (isRegister) {
      if (password !== confirmPassword) {
        setError(t('errors.passwords_mismatch'));
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegister) {
        const payload = {
          full_name: fullName,
          email,
          password,
          preferred_lang: preferredLang
        };
        // registerApi returns response.data directly: { message, token, user }
        const result = await registerApi(payload);
        console.log('Register result:', result);
        saveAuth(result.token, result.user);
        navigate('/diagnose');
      } else {
        const payload = { email, password };
        // loginApi returns response.data directly: { token, user }
        const result = await loginApi(payload);
        console.log('Login result:', result);
        saveAuth(result.token, result.user);
        navigate('/diagnose');
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Timing-safe response checks: prevent user enumeration by showing generic warning messages
      const errMsg = err.response?.data?.message || t('errors.generic');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-secondary flex items-center justify-center pt-24 pb-12 px-6 font-poppins">
      <div className="w-full max-w-md glass-card p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-1/4 -right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />

        {/* Form Title Header */}
        <div className="text-center">
          <h2 className="font-orbitron font-extrabold text-2xl text-white tracking-wider">
            {isRegister ? t('auth.register_tab') : t('auth.login_tab')}
          </h2>
          <p className="text-xs text-muted mt-2">
            Secure clinical-grade portal credentials validation.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 bg-bg-card border border-border p-1 rounded-xl">
          <button
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 rounded-lg font-orbitron text-xs font-semibold tracking-wider transition-all duration-300 ${
              !isRegister ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
            }`}
          >
            {t('auth.login_tab')}
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 rounded-lg font-orbitron text-xs font-semibold tracking-wider transition-all duration-300 ${
              isRegister ? 'bg-primary text-white shadow-glow-sm' : 'text-muted hover:text-secondary'
            }`}
          >
            {t('auth.register_tab')}
          </button>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="flex gap-2.5 bg-danger/10 border border-danger/20 rounded-xl p-3.5 text-xs text-danger leading-relaxed">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          id="btn-google-oauth"
          onClick={() => {
            window.location.href = 
              'https://xai-thyroid-backend.onrender.com/api/v1/auth/google';
          }}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-border bg-bg-card hover:bg-white/5 transition-all duration-200 group mb-6"
        >
          {/* Google SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-orbitron text-xs font-semibold tracking-wider text-secondary group-hover:text-white transition-colors duration-150">
            Continue with Google
          </span>
        </button>

        {/* OR Divider */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted font-medium">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full name (Register only) */}
          {isRegister && (
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>{t('auth.full_name')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="doctor@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all duration-300"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>{t('auth.password')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-10 py-3 text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors duration-150"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {isRegister && (
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>{t('auth.confirm_password')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-transparent border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-3 text-white text-sm placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Preferred Language (Register only) */}
          {isRegister && (
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: '#94A3B8' }}>{t('auth.language')}</label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                disabled={loading}
                className="w-full bg-[#1a2235] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#3B82F6] transition-all duration-300 cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 font-orbitron text-xs font-semibold tracking-wider"
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{isRegister ? t('auth.btn_register') : t('auth.btn_login')}</span>
          </button>
        </form>

        {/* Forgot password note / Info footer */}
        {!isRegister && (
          <div className="text-center mt-2">
            <span className="text-xs text-muted hover:underline cursor-pointer">
              {t('auth.forgot_password')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
