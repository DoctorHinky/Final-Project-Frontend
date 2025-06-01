import axios from 'axios';
import { authService } from './auth.service';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'https://final-project-backend-rsqk.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});


api.interceptors.request.use(config => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

   
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        authService.logout();
        window.location.href = '/login-register';
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          '/auth/refresh',
          {},
          {
            baseURL: 'https://final-project-backend-rsqk.onrender.com',
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          }
        );

        const newAccessToken = refreshResponse.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

       
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login-register';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
