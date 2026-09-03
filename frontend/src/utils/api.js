
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==================== CREATE AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, 
});

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  (config) => {
    // Add token to headers
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ==================== UNAUTHORIZED (401) ====================
    if (error.response?.status === 401) {
      // Prevent infinite loop
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show toast notification
      toast.error('Session expired. Please login again.');
      
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // ==================== FORBIDDEN (403) ====================
    if (error.response?.status === 403) {
      toast.error(error.response?.data?.message || 'You do not have permission to perform this action.');
    }

    // ==================== NOT FOUND (404) ====================
    if (error.response?.status === 404) {
      toast.error(error.response?.data?.message || 'Resource not found.');
    }

    // ==================== SERVER ERROR (500) ====================
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // ==================== NETWORK ERROR ====================
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection.');
    }

    // ==================== LOG ERROR ====================
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    // ==================== RETURN ERROR WITH USER-FRIENDLY MESSAGE ====================
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    error.userMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// ==================== HELPER METHODS ====================

/**
 * GET request with error handling
 * @param {string} url - Endpoint URL
 * @param {Object} params - Query parameters
 * @returns {Promise} - Axios response
 */
api.getWithParams = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params });
    return response;
  } catch (error) {
    throw error;
  }
};


api.postWithData = async (url, data = {}) => {
  try {
    const response = await api.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};


api.putWithData = async (url, data = {}) => {
  try {
    const response = await api.put(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};


api.deleteWithData = async (url) => {
  try {
    const response = await api.delete(url);
    return response;
  } catch (error) {
    throw error;
  }
};


api.uploadFile = async (url, formData, onProgress = null) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}${url}`, formData, {
      headers: {

        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': undefined, 
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


api.isAuthenticated = () => {
  return !!localStorage.getItem('token');
};


api.getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};


api.setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};


api.clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// ==================== EXPORT ====================
export default api;