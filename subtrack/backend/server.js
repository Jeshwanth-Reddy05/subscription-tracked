import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

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

// ROUTES
app.use("/auth", authApi);
app.use("/users", userApi);
app.use("/subscriptions", subscriptionApi);
app.use("/admin", adminApi);

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
