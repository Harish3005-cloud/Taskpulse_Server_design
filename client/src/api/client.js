import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      // Only redirect if not already on login/landing page
      if (!['/login', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
