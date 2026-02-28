import { api } from "./api";

export const authService = {
  login: async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    return data;
  },

  logout: async () => {
    localStorage.removeItem("suvidha_token");
    localStorage.removeItem("suvidha_user");
  },

  getMe: async () => {
    return api.get("/auth/me");
  },
};