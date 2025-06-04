import axios from "axios";
import { authService } from "./auth.service";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

console.log("Axios instance created with base URL:", api.defaults.baseURL);

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("[axios] Token zum Request hinzugefügt");
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nutze authService für den Token-Refresh
      try {
        await authService.refreshAccessToken();

        // Hole den neuen Token über authService
        const newAccessToken = authService.getAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // authService.refreshAccessToken() kümmert sich bereits um Logout und Redirect
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
