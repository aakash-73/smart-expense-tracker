import api from './apiClient';

const enc = (userId) => encodeURIComponent(userId);

export const getTransactions = (userId) =>
  api.get(`/transactions/user/${enc(userId)}`).then((r) => r.data);

export const getRecentTransactions = (userId) =>
  api.get(`/transactions/user/${enc(userId)}/recent`).then((r) => r.data);

export const createTransaction = (tx) =>
  api.post('/transactions', tx).then((r) => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`);
