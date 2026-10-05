import api from "@/services/api";

export const productService = {
  getAll() {
    return api.get("/products");
  },

  getById(id) {
    return api.get(`/products/${id}`);
  },

  create(data) {
    return api.post("/products", data);
  },

  update(id, data) {
    return api.patch(`/products/${id}`, data);
  },

  delete(id) {
    return api.delete(`/products/${id}`);
  },
};
