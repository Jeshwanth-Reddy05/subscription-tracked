import API from "./api";

export const SubscriptionService = {
  async getSubscriptions() {
    const res = await API.get("/subscriptions");
    return res.data; // Expected response structure: { subscriptions }
  },

  async createSubscription(formData) {
    const res = await API.post("/subscriptions", formData);
    return res.data;
  },

  async updateSubscription(id, formData) {
    const res = await API.put(`/subscriptions/${id}`, formData);
    return res.data;
  },

  async deleteSubscription(id) {
    const res = await API.delete(`/subscriptions/${id}`);
    return res.data;
  }
};
