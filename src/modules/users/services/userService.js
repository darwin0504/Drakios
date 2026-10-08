import api from "@/services/api";

const userService = {
  async getAll() {
    const response = await api.get("/users");

    return response.data;
  },
};

export default userService;