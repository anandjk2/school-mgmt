// In web (dev + prod) VITE_API_BASE_URL is empty → relative paths work fine.
// For Android builds set VITE_API_BASE_URL=http://<YOUR_PC_IP>:3001 in .env.android
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default API_BASE;

export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
};
