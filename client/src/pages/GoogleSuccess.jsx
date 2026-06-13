// pages/GoogleSuccess.jsx
// Consumes the `?token=` query parameter from the Google OAuth callback redirect,
// persists it into localStorage, fetches the user profile, and redirects to /diagnose.
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getMe } from '../services/authService';

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: saveAuth } = useAuth();
  const [status, setStatus] = useState('Completing sign-in…');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // No token present — something went wrong
      navigate('/auth?error=google_failed', { replace: true });
      return;
    }

    // Immediately store token so the API interceptor can attach it
    localStorage.setItem('xai_token', token);

    // Remove token from URL history immediately (replace state)
    window.history.replaceState(null, '', '/auth/google/success');

    const finishLogin = async () => {
      try {
        setStatus('Loading your profile…');
        const { data } = await getMe();
        saveAuth(token, data.user);
        setStatus('Success! Redirecting…');
        // Brief 800ms delay to show success feedback
        await new Promise((r) => setTimeout(r, 800));
        navigate('/diagnose', { replace: true });
      } catch {
        // Token invalid or network error
        localStorage.removeItem('xai_token');
        navigate('/auth?error=google_failed', { replace: true });
      }
    };

    finishLogin();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-6 font-poppins">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-l-transparent border-r-transparent border-b-transparent animate-spin" />
      </div>

      {/* Google logo mark */}
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="font-orbitron text-sm font-bold text-white tracking-wider">Google Sign-In</span>
      </div>

      <p className="text-sm text-muted animate-pulse">{status}</p>
    </div>
  );
}
