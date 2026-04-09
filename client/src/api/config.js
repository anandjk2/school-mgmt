// In web (dev + prod) VITE_API_BASE_URL is empty → relative paths work fine.
// For Android builds set VITE_API_BASE_URL=http://<YOUR_PC_IP>:3001 in .env.android
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default API_BASE;
