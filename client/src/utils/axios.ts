import axios from 'axios';
import { getToken } from './token';

const instance = axios.create({
  baseURL: '/api',
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// if the server returns 401, clear storage and redirect to login
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // token missing/invalid - clear and navigate to login
      import('./token').then(({ clearToken }) => {
        clearToken();
        window.location.href = '/login';
      });
    }
    return Promise.reject(error);
  }
);

export default instance;
