import express from "express";
import mongoose from "mongoose";
import Subscription from "../models/SubscriptionTypeModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { isOwnerOrAdmin } from "../middlewares/checkRole.js";

const router = express.Router();

// ADD SUBSCRIPTION
router.post("/", verifyToken(), async (req, res) => {
  try {
    // Automatically set the userId to the authenticated user's ID
    const subscriptionData = {
      ...req.body,
      userId: req.user.id,
    };

    const subscription = await Subscription.create(subscriptionData);

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
    // Only return subscriptions belonging to the logged-in user
    const subscriptions = await Subscription.find({ userId: req.user.id });

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
    // The subscription has already been fetched and verified by the isOwnerOrAdmin middleware
    res.status(200).json({
      subscription: req.subscription,
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
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
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

export default router;
