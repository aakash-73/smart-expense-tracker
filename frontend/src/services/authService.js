import api from './apiClient';

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
