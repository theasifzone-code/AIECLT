import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IS_DEV = import.meta.env.DEV;

// AXIOS INSTANCE
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // Token attach
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dev logging 
    if (IS_DEV) {
      const method = config.method?.toUpperCase();
      const url = config.url;
      console.log(`${method} ${url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);


//  RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    if (IS_DEV) {
      const method = response.config.method?.toUpperCase();
      const url = response.config.url;
      console.log(`📥 ${method} ${url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const currentPath = window.location.pathname;
    const isPublicPath =
      currentPath.includes('/login') ||
      currentPath.includes('/register') ||
      currentPath.includes('/forgot-password') ||
      currentPath.includes('/reset-password') ||
      currentPath.includes('/verify-email');

    if (status === 401) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      if (!isPublicPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window._sessionExpiredToastShown) {
          window._sessionExpiredToastShown = true;
          toast.error('Session expired. Please login again.');

          setTimeout(() => {
            window._sessionExpiredToastShown = false;
          }, 3000);
        }

        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    //  403 FORBIDDEN
    if (status === 403) {
      const message =
        error.response?.data?.message ||
        'You do not have permission to perform this action.';
      toast.error(message);
    }

    //  404 NOT FOUND
    if (status === 404) {
      const message = error.response?.data?.message || 'Resource not found.';
      toast.error(message);
    }

    if (status === 429) {
      toast.error(
        error.response?.data?.message ||
        'Too many requests. Please slow down.'
      );
    }

    if (status >= 500) {
      toast.error(
        error.response?.data?.message ||
        'Server error. Please try again later.'
      );
    }

    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    }

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection.');
    }

    if (IS_DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

api.getWithParams = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response;
};

api.postWithData = async (url, data = {}) => {
  const response = await api.post(url, data);
  return response;
};

api.putWithData = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response;
};

api.patchWithData = async (url, data = {}) => {
  const response = await api.patch(url, data);
  return response;
};

api.deleteWithData = async (url) => {
  const response = await api.delete(url);
  return response;
};

api.uploadFile = async (url, formData, onProgress = null) => {
  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response;
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

api.extractCenterFromImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.uploadFile('/ocr/extract-center', formData, onProgress);
};


api.searchCenterByCode = async (centerCode) => {
  return api.postWithData('/ocr/manual-center', { centerCode });
};

api.getCenters = async (filters = {}) => {
  return api.getWithParams('/ocr/centers', filters);
};

api.getCities = async () => {
  return api.get('/ocr/cities');
};

api.getRouteToCenter = async (originLat, originLng, centerId) => {
  return api.postWithData('/route/to-center', {
    originLat,
    originLng,
    centerId,
  });
};

api.getMyNotifications = async (page = 1, limit = 20) => {
  return api.getWithParams('/notifications/my', { page, limit });
};

api.getUnreadCount = async () => {
  return api.get('/notifications/unread-count');
};
api.getStudentSchedules = async () => {
  return api.get('/schedules/student');
};


export default api;