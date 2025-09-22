import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies for authentication
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        });
      }

      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    (error) => {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - clear auth token and redirect to login
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else if (error.response?.status === 403) {
        // Forbidden
        toast.error('You do not have permission to perform this action');
      } else if (error.response?.status >= 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        toast.error('Request timeout. Please check your connection.');
      } else if (!error.response) {
        // Network error
        toast.error('Network error. Please check your connection.');
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Auth token management
const AUTH_TOKEN_KEY = 'pms_auth_token';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// Create singleton instance
const apiClient = createApiClient();

// Hook for using API client in components
export const useApiClient = () => {
  return apiClient;
};

// Utility functions for common API operations
export const apiUtils = {
  // Authentication
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.data.accessToken) {
      setAuthToken(response.data.data.accessToken);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  // Generic CRUD operations
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config),

  // File upload
  uploadFile: async (url: string, file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
};

// Export the client instance and utilities
export { apiClient, setAuthToken, clearAuthToken, getAuthToken };
export default apiClient;
