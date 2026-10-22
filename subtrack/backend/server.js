import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "dns";

// Force IPv4-first DNS resolution to avoid ENETUNREACH on platforms lacking IPv6 routing (e.g. Render)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

import authApi from "./APIs/CommonAPI.js";
import userApi from "./APIs/UserAPI.js";
import subscriptionApi from "./APIs/SubscriptionAPI.js";
import adminApi from "./APIs/AdminAPI.js";

import errorHandler from "./middlewares/errorHandler.js";
import initScheduler from "./utils/scheduler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Root endpoint for deployment status check
app.get("/", (req, res) => {
  res.status(200).json({
    name: "SubTrack API",
    status: "online",
    message: "SubTrack Subscription Management API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/auth",
      users: "/users",
      subscriptions: "/subscriptions",
      admin: "/admin",
      health: "/health",
      testEmail: "/users/test-email"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "connecting/disconnected";
  res.status(200).json({
    status: "healthy",
    database: dbState,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Direct alias for test-email
app.get("/test-email", (req, res) => {
  res.redirect("/users/test-email");
});

// ROUTES
app.use("/auth", authApi);
app.use("/users", userApi);
app.use("/subscriptions", subscriptionApi);
app.use("/admin", adminApi);

// 404 handler for unmatched routes (returns clean JSON)
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    suggestion: "Visit / or /health to check available endpoints"
  });
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log("DB connection success");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
      // Initialize cron scheduler
      initScheduler();
    });
  } catch (err) {
    console.error("failed to connect db", err.message);
  }
};

connectDB();
