import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },

    renewalDate: {
      type: Date,
      required: true,
    },

    reminderDays: {
      type: Number,
      default: 3,
    },

    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },

    paymentMethod: {
      type: String,
      default: "UPI",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
