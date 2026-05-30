import { create } from "zustand";
import { SubscriptionService } from "../services/sub";

const computeAlerts = (subscriptions) => {
  if (subscriptions.length === 0) return [];
  const alerts = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  subscriptions.forEach((sub) => {
    if (sub.status !== "active") return;

    const renewal = new Date(sub.renewalDate);
    renewal.setHours(0, 0, 0, 0);

    const diffTime = renewal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const reminderDays = sub.reminderDays || 3;

    if (diffDays < 0) {
      alerts.push({
        id: `overdue-${sub._id}`,
        type: "danger",
        title: `Overdue: ${sub.serviceName}`,
        message: `Was due on ${renewal.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Please renew or cancel.`,
        sub,
        diffDays,
      });
    } else if (diffDays === 0) {
      alerts.push({
        id: `today-${sub._id}`,
        type: "warning",
        title: `Renewal Today: ${sub.serviceName}`,
        message: `Due today! Cost: $${sub.price}`,
        sub,
        diffDays,
      });
    } else if (diffDays <= reminderDays) {
      alerts.push({
        id: `upcoming-${sub._id}`,
        type: "info",
        title: `Renewal Soon: ${sub.serviceName}`,
        message: `Due in ${diffDays} days (${renewal.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}). Cost: $${sub.price}`,
        sub,
        diffDays,
      });
    }
  });
  return alerts;
};

export const useSubscriptionStore = create((set, get) => ({
  subscriptions: [],
  loading: false,
  error: null,
  notifications: [],

  refreshSubscriptions: async () => {
    set({ loading: true });
    try {
      const res = await SubscriptionService.getSubscriptions();
      const list = res.subscriptions || res || [];
      set({ 
        subscriptions: list, 
        notifications: computeAlerts(list), 
        error: null 
      });
    } catch (err) {
      console.error("Error refreshing subscriptions:", err);
      set({ error: err.response?.data?.message || "Failed to sync subscriptions" });
    } finally {
      set({ loading: false });
    }
  },

  addSubscription: async (formData) => {
    set({ loading: true, error: null });
    try {
      await SubscriptionService.createSubscription(formData);
      await get().refreshSubscriptions();
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create subscription" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateSubscription: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      await SubscriptionService.updateSubscription(id, formData);
      await get().refreshSubscriptions();
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to update subscription" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteSubscription: async (id) => {
    set({ loading: true, error: null });
    try {
      await SubscriptionService.deleteSubscription(id);
      await get().refreshSubscriptions();
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete subscription" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  toggleStatus: async (sub) => {
    const newStatus = sub.status === "active" ? "cancelled" : "active";
    await get().updateSubscription(sub._id, { status: newStatus });
  },

  clearStore: () => {
    set({ subscriptions: [], notifications: [], error: null });
  }
}));
