import express from "express";
import Subscription from "../models/SubscriptionTypeModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isOwnerOrAdmin } from "../middlewares/checkRole.js";
import { rollRenewalDateForward } from "../utils/renewal.js";
import { checkAndSendRemindersForUser } from "../utils/scheduler.js";

const router = express.Router();

const ALLOWED_CYCLES = ["monthly", "yearly"];
const ALLOWED_STATUSES = ["active", "cancelled"];

// Helper to auto-roll active subscription renewal dates that are in the past
const autoRollSubscription = async (sub) => {
  if (sub.status !== "active") return sub;

  const currentRenewal = new Date(sub.renewalDate);
  const nextRenewal = rollRenewalDateForward(currentRenewal, sub.billingCycle);

  if (nextRenewal.getTime() !== currentRenewal.getTime()) {
    sub.renewalDate = nextRenewal;
    await Subscription.findByIdAndUpdate(sub._id, {
      $set: { renewalDate: nextRenewal },
    });
  }

  return sub;
};

// ADD SUBSCRIPTION
router.post("/", verifyToken(), async (req, res) => {
  try {
    const {
      serviceName,
      category,
      price,
      billingCycle,
      renewalDate,
      reminderDays,
      status,
      paymentMethod,
      notes,
    } = req.body;

    if (!serviceName || typeof serviceName !== "string" || !serviceName.trim()) {
      return res.status(400).json({ message: "Service name is required" });
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }

    if (!billingCycle || !ALLOWED_CYCLES.includes(billingCycle)) {
      return res.status(400).json({ message: "Billing cycle must be either 'monthly' or 'yearly'" });
    }

    if (!renewalDate || isNaN(new Date(renewalDate).getTime())) {
      return res.status(400).json({ message: "A valid renewal date is required" });
    }

    const cleanSubscription = {
      userId: req.user.id, // Strictly bind to authenticated user, prevent spoofing
      serviceName: serviceName.trim(),
      category: category.trim(),
      price: numPrice,
      billingCycle,
      renewalDate: new Date(renewalDate),
      reminderDays: reminderDays !== undefined ? Math.max(1, Number(reminderDays) || 3) : 3,
      status: status && ALLOWED_STATUSES.includes(status) ? status : "active",
      paymentMethod: paymentMethod && typeof paymentMethod === "string" ? paymentMethod.trim() : "UPI",
      notes: notes && typeof notes === "string" ? notes.trim() : "",
    };

    const subscription = await Subscription.create(cleanSubscription);

    res.status(201).json({
      message: "Subscription added successfully",
      subscription,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET ALL SUBSCRIPTIONS FOR LOGGED IN USER
router.get("/", verifyToken(), async (req, res) => {
  try {
    const rawSubscriptions = await Subscription.find({ userId: req.user.id }).sort({ renewalDate: 1 });

    // Roll forward any past renewal dates on active subscriptions
    const subscriptions = await Promise.all(rawSubscriptions.map(autoRollSubscription));

    res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET SINGLE SUBSCRIPTION
router.get("/:id", verifyToken(), isOwnerOrAdmin, async (req, res) => {
  try {
    const subscription = await autoRollSubscription(req.subscription);

    res.status(200).json({
      subscription,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// UPDATE SUBSCRIPTION
router.put("/:id", verifyToken(), isOwnerOrAdmin, async (req, res) => {
  try {
    const {
      serviceName,
      category,
      price,
      billingCycle,
      renewalDate,
      reminderDays,
      status,
      paymentMethod,
      notes,
    } = req.body;

    const updates = {};

    if (serviceName !== undefined) {
      if (typeof serviceName !== "string" || !serviceName.trim()) {
        return res.status(400).json({ message: "Service name must be a non-empty string" });
      }
      updates.serviceName = serviceName.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({ message: "Category must be a non-empty string" });
      }
      updates.category = category.trim();
    }

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ message: "Price must be a non-negative number" });
      }
      updates.price = numPrice;
    }

    if (billingCycle !== undefined) {
      if (!ALLOWED_CYCLES.includes(billingCycle)) {
        return res.status(400).json({ message: "Billing cycle must be either 'monthly' or 'yearly'" });
      }
      updates.billingCycle = billingCycle;
    }

    if (renewalDate !== undefined) {
      const parsedDate = new Date(renewalDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid renewal date" });
      }
      updates.renewalDate = parsedDate;
    }

    if (reminderDays !== undefined) {
      const days = Number(reminderDays);
      if (isNaN(days) || days < 1 || days > 30) {
        return res.status(400).json({ message: "Reminder days must be between 1 and 30" });
      }
      updates.reminderDays = days;
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Status must be either 'active' or 'cancelled'" });
      }
      updates.status = status;
    }

    if (paymentMethod !== undefined) {
      updates.paymentMethod = typeof paymentMethod === "string" ? paymentMethod.trim() : "UPI";
    }

    if (notes !== undefined) {
      updates.notes = typeof notes === "string" ? notes.trim() : "";
    }

    // Explicitly update only allowed fields; userId cannot be modified
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Subscription updated successfully",
      updatedSubscription,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// DELETE SUBSCRIPTION
router.delete("/:id", verifyToken(), isOwnerOrAdmin, async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Subscription deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// TRIGGER SUBSCRIPTION DUE REMINDERS FOR LOGGED-IN USER
router.post("/send-due-reminders", verifyToken(), async (req, res) => {
  try {
    const result = await checkAndSendRemindersForUser(req.user.id);

    res.status(200).json({
      message:
        result.remindersSent > 0
          ? `Sent ${result.remindersSent} subscription due reminder(s) to your registered email.`
          : "No subscription dues are pending reminder at this moment.",
      remindersSent: result.remindersSent,
      checkedCount: result.checkedCount,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send due reminders",
      error: err.message,
    });
  }
});

export default router;
