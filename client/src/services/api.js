import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
           'https://xai-thyroid-backend.onrender.com/api/v1',
  withCredentials: true,
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
