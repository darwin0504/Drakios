import { defineStore } from "pinia";
import { authService } from "@/modules/auth/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("access_token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    permissions: [],
    permissionsLoaded: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    hasPermission(permission) {
      return this.permissions.includes(permission);
    },

    async loadPermissions() {
      if (this.permissionsLoaded || !this.token) {
        return;
      }

      try {
        const response = await authService.getMyPermissions();
        this.permissions = Array.isArray(response.data?.permissions)
          ? response.data.permissions
          : [];
      } finally {
        this.permissionsLoaded = true;
      }
    },

    setSession(token, user) {
      this.token = token;
      this.user = user;
      this.permissions = [];
      this.permissionsLoaded = false;

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    clearSession() {
      this.token = null;
      this.user = null;
      this.permissions = [];
      this.permissionsLoaded = false;

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
  },
});
