import api from './apiClient';

const enc = (userId) => encodeURIComponent(userId);

export const getBudgets = (userId) =>
  api.get(`/budgets/user/${enc(userId)}`).then((r) => r.data);

export const createBudget = (budget) =>
  api.post('/budgets', budget).then((r) => r.data);

export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`);
