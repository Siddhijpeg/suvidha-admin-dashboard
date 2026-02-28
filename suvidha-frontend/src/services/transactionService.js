import { api } from "./api";

export const transactionService = {
  getAll:      (params = {}) => api.get(`/transactions?${new URLSearchParams(params)}`),
  getById:     (id)          => api.get(`/transactions/${id}`),
  exportCSV:   (params = {}) => api.get(`/transactions/export/csv?${new URLSearchParams(params)}`),
  exportPDF:   (params = {}) => api.get(`/transactions/export/pdf?${new URLSearchParams(params)}`),
  getRevenue:  (range)       => api.get(`/transactions/revenue?range=${range}`),
  reconcile:   (date)        => api.get(`/transactions/reconcile?date=${date}`),
};
