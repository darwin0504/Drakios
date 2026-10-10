
import api from "@/services/api";

export const rolesService = {
  getAll() {
    return api.get("/roles");
  },

  getById(id) {
    return api.get(`/roles/${id}`);
  },

  create(data) {
    return api.post("/roles", data);
  },

  update(id, data) {
    return api.patch(`/roles/${id}`, data);
  },

  remove(id) {
    return api.delete(`/roles/${id}`);
  },

  getAllPermissions() {
    return api.get("/roles/permissions");
  },

  getRolePermissions(id) {
    return api.get(`/roles/permissions/${id}`);
  },

  assignPermissions(id, permissionIds) {
    return api.patch(`/roles/permissions/${id}`, {
      permissionIds,
    });
  },
};
