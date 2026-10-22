import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/UserTypeModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        message: "A valid email address is required",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check user exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - explicitly enforce 'user' role to prevent privilege escalation
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    // Send welcome registration email
    sendEmail({
      to: normalizedEmail,
      subject: "Welcome to SubTrack! 🎉",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0066cc; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Welcome to SubTrack, ${name.trim()}!</h2>
          <p>Your account has been registered successfully.</p>
          <p>With SubTrack, you can:</p>
          <ul>
            <li>Track recurring subscriptions across monthly and yearly cycles</li>
            <li>Monitor renewal deadlines and calculate your monthly burn rate</li>
            <li>Receive automated email reminders before payment dates</li>
          </ul>
          <div style="background-color: #f5f5f7; border-left: 4px solid #34c759; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 13px; color: #1d1d1f;">
            <strong>Registered Email:</strong> ${normalizedEmail}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #a1a1a6; border-top: 1px solid #e8e8ed; padding-top: 10px;">
            Thank you for choosing SubTrack.
          </p>
        </div>
      `,
      text: `Hi ${name.trim()}, welcome to SubTrack! Your account has been registered with ${normalizedEmail}.`,
    })
      .then(() => console.log(`Welcome email dispatched to ${normalizedEmail}`))
      .catch((err) => console.warn(`Welcome email delivery failed for ${normalizedEmail}:`, err.message));

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Use uniform response for non-existent user or wrong password to prevent user enumeration
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(res, user._id, user.role);

    // Send login security alert email
    const loginTime = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    sendEmail({
      to: user.email,
      subject: "Security Alert: New login to your SubTrack account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #0066cc; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Account Login Detected</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We detected a new login to your <strong>SubTrack</strong> subscription manager account on <strong>${loginTime}</strong>.</p>
          <div style="background-color: #f5f5f7; border-left: 4px solid #0066cc; padding: 12px; margin: 15px 0; border-radius: 4px; font-size: 13px; color: #1d1d1f;">
            <strong>Account Email:</strong> ${user.email}<br />
            <strong>Timestamp:</strong> ${loginTime}
          </div>
          <p>If this was you, you can safely disregard this message.</p>
          <p style="color: #ff3b30; font-size: 13px;">If you did not initiate this login, please sign in immediately and update your password from your Settings menu.</p>
          <p style="margin-top: 20px; font-size: 12px; color: #a1a1a6; border-top: 1px solid #e8e8ed; padding-top: 10px;">
            Thank you for using SubTrack.
          </p>
        </div>
      `,
      text: `Hi ${user.name}, a new login was detected on your SubTrack account at ${loginTime}. If this was not you, please change your password immediately.`,
    })
      .then(() => console.log(`Login alert dispatched to ${user.email}`))
      .catch((emailErr) => {
        console.warn("Could not send login notification email:", emailErr.message);
      });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
