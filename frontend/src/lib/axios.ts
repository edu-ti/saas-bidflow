import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  // withCredentials only needed for cookie-based Sanctum SPA auth.
  // Since we're using Bearer tokens, set this to false to avoid CORS wildcard issues.
  withCredentials: false,
});

// Interceptor: attach Bearer token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('api_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: handle 403 TENANT_SUSPENDED
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.code === 'TENANT_SUSPENDED') {
      window.location.href = '/suspended';
    }
    return Promise.reject(error);
  }
);

export default api;
