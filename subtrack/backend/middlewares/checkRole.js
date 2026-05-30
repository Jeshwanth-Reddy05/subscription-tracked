import Subscription from "../models/SubscriptionTypeModel.js";

// Middleware to verify if user has admin role
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin role required." });
  }
};

// Middleware to verify if user is owner of the subscription or an admin
export const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const subscriptionId = req.params.id;
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required" });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Check ownership or admin status
    if (
      req.user.role === "admin" ||
      subscription.userId.toString() === req.user.id.toString()
    ) {
      req.subscription = subscription; // Attach for route optimization
      next();
    } else {
      res.status(403).json({
        message: "Forbidden. You do not have permission to access this subscription",
      });
    }
  } catch (error) {
    console.error("Error in isOwnerOrAdmin middleware:", error);
    res.status(500).json({
      message: "Server error checking subscription ownership",
      error: error.message,
    });
  }
};
