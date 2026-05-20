import api from './apiClient';

const enc = (userId) => encodeURIComponent(userId);

export const getSummary  = (userId) =>
  api.get(`/analytics/summary/${enc(userId)}`).then((r) => r.data);

export const getMonthly  = (userId) =>
  api.get(`/analytics/monthly/${enc(userId)}`).then((r) => r.data);

export const getCategories = (userId) =>
  api.get(`/analytics/categories/${enc(userId)}`).then((r) => r.data);
