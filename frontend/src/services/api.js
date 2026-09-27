import axios from 'axios';

/**
 * Centralized API client.
 *
 * - Base URL comes from VITE_API_URL (falls back to the dev proxy path /api).
 * - Attaches the JWT automatically to every request.
 * - Normalizes responses ({ success, message, data, meta }) and errors so
 *   pages never deal with raw Axios structures.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

/** Origin of the backend (empty string when using the dev proxy). */
export const API_ORIGIN = /^https?:\/\//i.test(API_URL) ? API_URL.replace(/\/api\/?$/, '') : '';

const TOKEN_KEY = 'karigor_admin_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Error thrown by the API layer - carries a friendly message + details. */
export class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

// --- Request: attach bearer token ---
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: unwrap payload, normalize errors ---
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Network / timeout
    if (!error.response) {
      const message =
        error.code === 'ECONNABORTED'
          ? 'The server took too long to respond. Please try again.'
          : 'Cannot reach the server. Please check your connection.';
      return Promise.reject(new ApiRequestError(message, 0));
    }

    const { status, data } = error.response;
    const message = (data && data.message) || 'Something went wrong. Please try again.';
    const details = data && data.details;

    // Session expired / invalid token -> clean up and let the app redirect.
    if (status === 401 && getStoredToken()) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('karigor:unauthorized'));
    }

    return Promise.reject(new ApiRequestError(message, status, details));
  }
);

export default api;
