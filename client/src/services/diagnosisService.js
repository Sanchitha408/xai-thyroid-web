// services/diagnosisService.js
import api from './api';

export const predict = (payload) => api.post('/diagnosis/predict', payload);
export const getHistory = (page = 1, limit = 10) =>
  api.get(`/diagnosis/history?page=${page}&limit=${limit}`);
export const getRecord = (id) => api.get(`/diagnosis/history/${id}`);
export const deleteRecord = (id) => api.delete(`/diagnosis/history/${id}`);
export const downloadReport = (recordId) => api.get(`/report/download/${recordId}`);
