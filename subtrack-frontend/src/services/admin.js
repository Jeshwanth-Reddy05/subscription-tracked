import API from "./api";

export const AdminService = {
  async getOverview() {
    const res = await API.get("/admin/overview");
    return res.data;
  },

  async getUsers() {
    const res = await API.get("/admin/users");
    return res.data; // Expected response structure: { users } or array
  },

  async updateUserRole(userId, role) {
    const res = await API.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  async deleteUser(userId) {
    const res = await API.delete(`/admin/users/${userId}`);
    return res.data;
  },

  async getSubscriptions() {
    const res = await API.get("/admin/subscriptions");
    return res.data;
  }
};
