import { api } from "./api";

export const kioskService = {
  getAll:          (params = {}) => api.get(`/kiosks?${new URLSearchParams(params)}`),
  getById:         (id)          => api.get(`/kiosks/${id}`),
  enable:          (id)          => api.patch(`/kiosks/${id}/enable`),
  disable:         (id)          => api.patch(`/kiosks/${id}/disable`),
  setMaintenance:  (id)          => api.patch(`/kiosks/${id}/maintenance`),
  forceLogout:     (id)          => api.post(`/kiosks/${id}/force-logout`),
  restart:         (id)          => api.post(`/kiosks/${id}/restart`),
  pushUpdate:      (id, payload) => api.post(`/kiosks/${id}/update`, payload),
  getStats:        (id)          => api.get(`/kiosks/${id}/stats`),
};
