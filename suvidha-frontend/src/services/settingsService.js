import { api } from "./api";

export const settingsService = {
  get:           ()       => api.get("/settings"),
  update:        (data)   => api.put("/settings", data),
  getPayment:    ()       => api.get("/settings/payment"),
  updatePayment: (data)   => api.put("/settings/payment", data),
  getAuditLogs:  (params) => api.get(`/settings/audit-logs?${new URLSearchParams(params)}`),
  blacklistPhone:(phone)  => api.post("/settings/blacklist", { phone }),
  getBlacklist:  ()       => api.get("/settings/blacklist"),
  removeBlacklist:(id)    => api.delete(`/settings/blacklist/${id}`),
  getCMS:        ()       => api.get("/settings/cms"),
  updateCMS:     (data)   => api.put("/settings/cms", data),
};
