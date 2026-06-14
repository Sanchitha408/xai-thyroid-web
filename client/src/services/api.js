import axios from 'axios';

const BASE_URL = 'https://xai-thyroid-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('xai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xai_token');
    }
    return Promise.reject(error);
  }
);

export default api;
