import axios from 'axios';
import { getToken, clearTokens } from './token';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if the server returns 401, clear storage and redirect to login
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // token missing/invalid - clear and navigate to login
      clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
