import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('rentora_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle automatic refresh or 401 expiration
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/register') && !originalRequest.url?.includes('/auth/token/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = sessionStorage.getItem('rentora_refresh_token');
        const refreshResponse = await axios.post('/api/v1/auth/token/refresh', {
          refreshToken: storedRefreshToken
        }, { withCredentials: true });

        const { accessToken, refreshToken } = refreshResponse.data?.data || {};

        if (accessToken) {
          sessionStorage.setItem('rentora_token', accessToken);
          if (refreshToken) {
            sessionStorage.setItem('rentora_refresh_token', refreshToken);
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('rentora_token');
        sessionStorage.removeItem('rentora_refresh_token');
        sessionStorage.removeItem('rentora_user');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
