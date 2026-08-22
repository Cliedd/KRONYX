import axios from 'axios';
import type { User } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const BACKEND_URL =
  import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Intercepteur: gérer les 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; company_name?: string; timezone?: string }) =>
    api.post<User>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<User>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
};

// Users
export const usersApi = {
  getMe: () => api.get<User>('/users/me'),
  updateMe: (data: Partial<{ company_name: string; timezone: string; notification_emails: string[]; synthesis_tone: string }>) =>
    api.put<User>('/users/me', data),
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

// Billing
export const billingApi = {
  checkout: () => api.post<{ checkout_url: string }>('/billing/checkout'),
  portal: () => api.post<{ portal_url: string }>('/billing/portal'),
};
