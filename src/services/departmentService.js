import { api } from "./api";

export const departmentService = {
  getAll:          ()               => api.get("/departments"),
  getById:         (id)             => api.get(`/departments/${id}`),
  create:          (data)           => api.post("/departments", data),
  update:          (id, data)       => api.put(`/departments/${id}`, data),
  delete:          (id)             => api.delete(`/departments/${id}`),
  enable:          (id)             => api.patch(`/departments/${id}/enable`),
  disable:         (id)             => api.patch(`/departments/${id}/disable`),
  getServices:     (id)             => api.get(`/departments/${id}/services`),
  createService:   (id, data)       => api.post(`/departments/${id}/services`, data),
  updateService:   (id, svcId, data)=> api.put(`/departments/${id}/services/${svcId}`, data),
  deleteService:   (id, svcId)      => api.delete(`/departments/${id}/services/${svcId}`),
  enableService:   (id, svcId)      => api.patch(`/departments/${id}/services/${svcId}/enable`),
  disableService:  (id, svcId)      => api.patch(`/departments/${id}/services/${svcId}/disable`),
};
