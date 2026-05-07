import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Gateway Service
  timeout: 5000,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  if (response.data) {
    localStorage.setItem('token', response.data);
  }
  return response.data;
};

export const register = async (username, password, email) => {
  const response = await api.post('/auth/register', { username, password, email });
  return response.data;
};

export default api;
