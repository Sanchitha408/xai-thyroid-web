// hooks/useAuth.js — Convenience hook for accessing AuthContext
import { useAuthContext } from '../contexts/AuthContext';
export default function useAuth() { return useAuthContext(); }
