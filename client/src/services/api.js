import axios from 'axios';

// In production, use the hardcoded Render backend URL.
// In development, probe localhost ports dynamically.
const PRODUCTION_API = 'https://complete-lms.onrender.com/api';
const isProduction = import.meta.env.PROD; // Vite sets this to true on build

const explicitUrl = import.meta.env.VITE_API_URL;

let baseURL = explicitUrl || (isProduction ? PRODUCTION_API : null) || 'http://localhost:5000/api';
let dynamicResolved = isProduction || !!explicitUrl;
let resolvingPromise = null;

async function probePort(port) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);
  try {
    const res = await fetch(`http://localhost:${port}/api/ping`, { method: 'GET', cache: 'no-store', signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

async function resolveDynamicBase() {
  if (dynamicResolved) return baseURL;
  const ports = [5000, 5001, 5002, 5003, 5004];
  for (const p of ports) {
    if (await probePort(p)) {
      baseURL = `http://localhost:${p}/api`;
      dynamicResolved = true;
      api.defaults.baseURL = baseURL;
      console.log('[api] dynamic backend resolved ->', baseURL);
      return baseURL;
    }
  }
  console.warn('[api] No backend detected on candidate ports, keeping default', baseURL);
  return baseURL;
}

if (!dynamicResolved) {
  resolvingPromise = new Promise((resolve) => setTimeout(resolve, 300)).then(resolveDynamicBase);
} else {
  resolvingPromise = Promise.resolve(baseURL);
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    try {
      if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    if (!error.response && !dynamicResolved && resolvingPromise) {
      await resolvingPromise;
      error.config.baseURL = baseURL;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export const getApiBaseURL = () => baseURL;
export const waitForApiBaseURL = () => resolvingPromise || Promise.resolve(baseURL);

export default api;
