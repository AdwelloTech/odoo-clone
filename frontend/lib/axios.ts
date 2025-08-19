// lib/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
