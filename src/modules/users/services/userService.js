import api from "@/services/api";

const userService = {
  async getAll() {
    const response = await api.get("/users");

    return response.data;
  },

  async create(data) {
    const response = await api.post('/users', data)

    return response.data
  },
};

export default userService;
