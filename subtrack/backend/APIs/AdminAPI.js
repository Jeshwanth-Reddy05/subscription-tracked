import express from "express";
import mongoose from "mongoose";
import User from "../models/UserTypeModel.js";
import Subscription from "../models/SubscriptionTypeModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Protect all admin endpoints
router.use(verifyToken("admin"));

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const handleServerError = (res, err) =>
  res.status(500).json({
    message: "Server error",
    error: err.message,
  });

// GET ALL USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// GET SINGLE USER
router.get("/users/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// UPDATE USER ROLE
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed values are 'user' or 'admin'",
      });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// DELETE USER
router.delete("/users/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// GET ALL SUBSCRIPTIONS
router.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate(
      "userId",
      "name email role",
    );

    res.status(200).json({
      message: "Subscriptions fetched successfully",
      subscriptions,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// GET SUBSCRIPTION BY ID
router.get("/subscriptions/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subscription ID",
      });
    }

    const subscription = await Subscription.findById(req.params.id).populate(
      "userId",
      "name email role",
    );

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      message: "Subscription fetched successfully",
      subscription,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// DELETE SUBSCRIPTION
router.delete("/subscriptions/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid subscription ID",
      });
    }

    const deletedSubscription = await Subscription.findByIdAndDelete(
      req.params.id,
    );

    if (!deletedSubscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      message: "Subscription deleted successfully",
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// GET SUBSCRIPTIONS FOR A SPECIFIC USER
router.get("/users/:id/subscriptions", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const subscriptions = await Subscription.find({
      userId: req.params.id,
    }).populate("userId", "name email role");

    res.status(200).json({
      message: "User subscriptions fetched successfully",
      subscriptions,
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

// GET ADMIN OVERVIEW
router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      activeSubscriptions,
      cancelledSubscriptions,
      monthlyPlans,
      yearlyPlans,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.countDocuments({ status: "cancelled" }),
      Subscription.countDocuments({ billingCycle: "monthly" }),
      Subscription.countDocuments({ billingCycle: "yearly" }),
    ]);

    res.status(200).json({
      message: "Admin overview fetched successfully",
      overview: {
        totalUsers,
        totalAdmins,
        activeSubscriptions,
        cancelledSubscriptions,
        monthlyPlans,
        yearlyPlans,
      },
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

export default router;
