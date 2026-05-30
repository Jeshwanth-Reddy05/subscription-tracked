import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    reminderDays: {
      type: Number,
      default: 3,
    },

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    platformNotifications: {
      type: Boolean,
      default: true,
    },

    upcomingWeekly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
