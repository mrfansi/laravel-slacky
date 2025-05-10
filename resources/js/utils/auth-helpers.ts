import axios from 'axios';

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return false;
  
  // Check if the user has a session cookie
  return document.cookie.includes('laravel_session=');
};

/**
 * Set up axios interceptors to handle authentication
 */
export const setupAxiosInterceptors = (): void => {
  // Add a response interceptor to handle 401 errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If we get a 401 error, redirect to login
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Initialize Echo only if the user is authenticated
 */
export const initializeEcho = (): void => {
  if (!isAuthenticated() || !window.Echo) return;
  
  // Set up Echo with the CSRF token
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken && window.Echo) {
    // Access Echo connector in a type-safe way
    const echo = window.Echo as any;
    if (echo.connector?.options?.auth?.headers) {
      echo.connector.options.auth.headers['X-CSRF-TOKEN'] = csrfToken;
    }
  }
};
