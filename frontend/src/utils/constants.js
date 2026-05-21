import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
export const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

console.log('🔧 Frontend Config:', {
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  BACKEND_URL,
  API
});
