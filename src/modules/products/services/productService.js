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

  uploadImage(id, imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    return api.post(`/products/image/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
