import api from './api';

export const predict = async (data) => {
  const response = await api.post('/diagnosis/predict', data);
  return response.data;
};

export const getHistory = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/diagnosis/history?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getRecord = async (id) => {
  const response = await api.get(`/diagnosis/history/${id}`);
  return response.data;
};

export const deleteRecord = async (id) => {
  const response = await api.delete(`/diagnosis/history/${id}`);
  return response.data;
};

export const downloadReport = (recordId) =>
  api.get(`/report/download/${recordId}`);
