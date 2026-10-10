import api from "@/services/api";

export const authService = {
  register(data) {
    return api.post("/auth/register", data);
  },

  login(data) {
    return api.post("/auth/login", data);
  },

  logout() {
    return api.post("/auth/logout");
  },

  forgotPassword(data) {
    return api.post("/auth/forgot-password", data);
  },

  resetPassword(data) {
    return api.post("/auth/reset-password", data);
  },

  changePassword(data) {
    return api.post("/auth/change-password", data);
  },

  verifyEmail(data) {
    return api.post("/auth/verify-email", data);
  },

  getMyPermissions() {
    return api.get('/auth/me/permissions')
  },
};
