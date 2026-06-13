import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Diagnose from './pages/Diagnose';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import About from './pages/About';
import GoogleSuccess from './pages/GoogleSuccess';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import useAuth from './hooks/useAuth';
import { initPageTransition } from './animations/gsapAnimations';

// Wrapper to animate page transitions and scroll to top on path changes
function RouteWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    initPageTransition();
  }, [location.pathname]);

  return children;
}

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <span className="font-orbitron font-bold text-sm text-muted animate-pulse">
          INITIALIZING...
        </span>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-bg-dark text-secondary selection:bg-primary/30 selection:text-white">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                <Route
                  path="/"
                  element={
                    <RouteWrapper>
                      <Home />
                    </RouteWrapper>
                  }
                />
                <Route
                  path="/diagnose"
                  element={
                    <RouteWrapper>
                      <Diagnose />
                    </RouteWrapper>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <RouteWrapper>
                        <Dashboard />
                      </RouteWrapper>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <RouteWrapper>
                      <Auth />
                    </RouteWrapper>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <RouteWrapper>
                      <About />
                    </RouteWrapper>
                  }
                />
                {/* Google OAuth success landing — no Navbar/Footer needed, renders immediately */}
                <Route path="/auth/google/success" element={<GoogleSuccess />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <ChatBot />
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
