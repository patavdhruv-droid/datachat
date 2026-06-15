import axios from 'axios';

// Backend URL - change this when deploying
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('datachat_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('datachat_token');
      localStorage.removeItem('datachat_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  return axios.post(`${API_BASE_URL}/api/auth/login`, formData);
};
export const getMe = () => api.get('/api/auth/me');

// ==================== DATASETS ====================
export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const listDatasets = () => api.get('/api/datasets');
export const getDataset = (id) => api.get(`/api/datasets/${id}`);
export const deleteDataset = (id) => api.delete(`/api/datasets/${id}`);

// ==================== ANALYSES ====================
export const createAnalysis = (dataset_id, title) => api.post('/api/analyses', { dataset_id, title });
export const listAnalyses = () => api.get('/api/analyses');
export const getAnalysis = (id) => api.get(`/api/analyses/${id}`);
export const deleteAnalysis = (id) => api.delete(`/api/analyses/${id}`);

// ==================== CHAT ====================
export const sendMessage = (analysis_id, question) => api.post('/api/chat', { analysis_id, question });

// ==================== INSIGHTS ====================
export const getInsights = () => api.get('/api/insights');

// ==================== ACCOUNT ====================
export const getAccountStats = () => api.get('/api/account/stats');

export { API_BASE_URL };
export default api;