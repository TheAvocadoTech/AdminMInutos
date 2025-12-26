// src/utils/api.js
import axios from 'axios';
// eslint-disable-next-line perfectionist/sort-imports
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'https://api.minutos.in', // HARD-CODED URL
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
