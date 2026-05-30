import API from "./api";

export const AuthService = {
  async login(email, password) {
    const res = await API.post("/auth/login", { email, password });
    return res.data; // Expected response structure: { token, user }
  },

  async register(name, email, password, role) {
    const res = await API.post("/auth/register", { name, email, password, role });
    return res.data;
  },

  async logout() {
    const res = await API.post("/auth/logout");
    return res.data;
  },

  async getProfile() {
    const res = await API.get("/users/profile");
    return res.data; // Expected response structure: { user }
  },

  async updateProfile(userId, profileData) {
    const res = await API.put(`/users/profile/${userId}`, profileData);
    return res.data; // Expected response structure: { updatedUser }
  }
};
