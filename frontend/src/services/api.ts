import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur: ajouter le token automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kronyx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur: gérer les 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kronyx_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; company_name?: string; timezone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Partial<{ company_name: string; timezone: string; notification_emails: string[]; synthesis_tone: string }>) =>
    api.put('/users/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/users/me/password', data),
};

// Competitors
export const competitorsApi = {
  list: () => api.get('/competitors'),
  create: (data: { name: string; website: string }) => api.post('/competitors', data),
  get: (id: string) => api.get(`/competitors/${id}`),
  update: (id: string, data: Partial<{ name: string; website: string; is_active: boolean }>) =>
    api.put(`/competitors/${id}`, data),
  delete: (id: string) => api.delete(`/competitors/${id}`),
  getPages: (id: string) => api.get(`/competitors/${id}/pages`),
  addPage: (id: string, data: { url: string; type: string }) =>
    api.post(`/competitors/${id}/pages`, data),
};

// Pages
export const pagesApi = {
  update: (id: string, data: Partial<{ is_active: boolean; url: string }>) =>
    api.put(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
};

// Changes
export const changesApi = {
  list: (params?: {
    competitor_id?: string;
    category?: string;
    impact_level?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/changes', { params }),
  get: (id: string) => api.get(`/changes/${id}`),
};

// Reports
export const reportsApi = {
  list: () => api.get('/reports'),
  get: (date: string) => api.get(`/reports/${date}`),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  recentChanges: () => api.get('/dashboard/recent-changes'),
};
