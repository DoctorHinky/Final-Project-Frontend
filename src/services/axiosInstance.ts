import axios from "axios";
import { authService } from "./auth.service";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("Axios instance created with base URL:", api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      let refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        refreshToken = sessionStorage.getItem("refresh_token");
      }
      if (!refreshToken) {
        authService.logout();
        window.location.href = "/login-register";
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          "/auth/refresh",
          {},
          {
            baseURL: import.meta.env.VITE_BASE_URL,
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = refreshResponse.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = "/login-register";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
