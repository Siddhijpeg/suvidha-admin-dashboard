import { api } from "./api";

export const analyticsService = {
  getOverview:       (range = "7d")  => api.get(`/analytics/overview?range=${range}`),
  getDeptStats:      (range = "7d")  => api.get(`/analytics/departments?range=${range}`),
  getKioskStats:     (range = "7d")  => api.get(`/analytics/kiosks?range=${range}`),
  getPeakHours:      (date)          => api.get(`/analytics/peak-hours?date=${date}`),
  getRevenueChart:   (range = "7d")  => api.get(`/analytics/revenue?range=${range}`),
  getTxnChart:       (range = "7d")  => api.get(`/analytics/transactions?range=${range}`),
  getBehavioral:     ()              => api.get("/analytics/behavioral"),
  exportReport:      (type, params)  => api.get(`/analytics/export/${type}?${new URLSearchParams(params)}`),
};
