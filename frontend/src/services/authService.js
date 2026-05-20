import api from './apiClient';

/**
 * Pure HTTP layer — never touches localStorage or AuthContext.
 * Token storage is handled exclusively by AuthContext.loginContext().
 */

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // raw JWT string
};

export const register = async (username, email, password) => {
  // Backend returns 201 with no body on success
  await api.post('/auth/register', { username, email, password });
};
