import express from "express";
import User from "../models/UserTypeModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// GET CURRENT USER PROFILE
router.get("/profile", verifyToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// UPDATE USER
router.put("/profile/:id", verifyToken(), async (req, res) => {
  try {
    // Only allow users to update their own profile unless they are an admin
    if (req.user.role !== "admin" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        message: "Forbidden. You can only update your own profile",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// DELETE USER
router.delete("/profile/:id", verifyToken(), async (req, res) => {
  try {
    // Only allow users to delete their own profile unless they are an admin
    if (req.user.role !== "admin" && req.user.id.toString() !== req.params.id) {
      return res.status(403).json({
        message: "Forbidden. You can only delete your own profile",
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
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// TEST EMAIL SMTP CONFIGURATION
router.post("/test-email", verifyToken(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const testSubject = "SubTrack SMTP Diagnostic Email";
    const testMessage = `Hello ${user.name},\n\nThis is a diagnostic email sent from your SubTrack subscription management application.\n\nIf you are receiving this message, your SMTP configurations (host, port, credentials) are configured and working correctly!\n\nBest regards,\nThe SubTrack Team`;
    const testHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #0066cc; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">SMTP Diagnostic Success</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>This is a diagnostic email sent from your <strong>SubTrack</strong> subscription management application.</p>
        <div style="background-color: #34c759/10; border-left: 4px solid #34c759; padding: 12px; margin: 15px 0; border-radius: 4px; color: #248a3d; font-size: 14px;">
          <strong>Connection Successful:</strong> Your SMTP configuration (host, port, credentials) is working perfectly!
        </div>
        <p>You will now receive live billing and renewal reminder emails according to your alert thresholds.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #a1a1a6; border-top: 1px solid #e8e8ed; padding-top: 10px;">
          Thank you for using SubTrack.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: testSubject,
      text: testMessage,
      html: testHtml,
    });

    res.status(200).json({
      message: "Diagnostic email sent successfully! Please check your inbox.",
    });
  } catch (err) {
    res.status(500).json({
      message: "SMTP configuration or connection error. Please verify your credentials.",
      error: err.message,
    });
  }
});

export default router;
