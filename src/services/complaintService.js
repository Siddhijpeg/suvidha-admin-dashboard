import { api } from "./api";

export const complaintService = {
  getAll:       (params = {}) => api.get(`/complaints?${new URLSearchParams(params)}`),
  getById:      (id)          => api.get(`/complaints/${id}`),
  updateStatus: (id, status, remarks) => api.patch(`/complaints/${id}/status`, { status, remarks }),
  assign:       (id, operatorId)      => api.patch(`/complaints/${id}/assign`, { operatorId }),
  escalate:     (id)          => api.post(`/complaints/${id}/escalate`),
  getStats:     ()            => api.get("/complaints/stats"),
};
