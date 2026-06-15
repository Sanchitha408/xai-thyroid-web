// contexts/AuthContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';
import { getMe } from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('xai_user') || 'null'),
  token: localStorage.getItem('xai_token') || null,
  loading: false,
  initialized: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('xai_token', action.payload.token);
      localStorage.setItem('xai_user', JSON.stringify(action.payload.user));
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('xai_token');
      localStorage.removeItem('xai_user');
      return { ...state, user: null, token: null, loading: false };
    case 'UPDATE_USER':
      const updated = { ...state.user, ...action.payload };
      localStorage.setItem('xai_user', JSON.stringify(updated));
      return { ...state, user: updated };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify token on mount
  useEffect(() => {
    const verify = async () => {
      if (state.token) {
        try {
          const result = await getMe();
          dispatch({ type: 'UPDATE_USER', payload: result.user });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      }
      dispatch({ type: 'SET_INITIALIZED' });
    };
    verify();
  }, []); // eslint-disable-line

  const login = (token, user) => dispatch({ type: 'LOGIN', payload: { token, user } });
  const logout = () => dispatch({ type: 'LOGOUT' });
  const updateUser = (fields) => dispatch({ type: 'UPDATE_USER', payload: fields });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
