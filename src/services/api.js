import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://financialbackend-production-3be5.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract error messages & handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // If 401 Unauthorized, clear local authentication if expired
      if (error.response.status === 401) {
        // Only redirect if we previously had a token (session expired)
        if (localStorage.getItem('pf_token')) {
          localStorage.removeItem('pf_token');
          localStorage.removeItem('pf_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        }
      }

      const message =
        error.response.data?.message ||
        error.response.data?.errors?.[0]?.message ||
        'An unexpected server error occurred';

      return Promise.reject({
        message,
        status: error.response.status,
        errors: error.response.data?.errors || [],
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection or backend server.',
        status: 0,
      });
    } else {
      return Promise.reject({
        message: error.message || 'Request setup error',
        status: -1,
      });
    }
  }
);

export default api;
