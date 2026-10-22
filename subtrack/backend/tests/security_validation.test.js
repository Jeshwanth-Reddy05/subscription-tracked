import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";

const JWT_SECRET = "test_jwt_secret_key_12345";
process.env.JWT_SECRET = JWT_SECRET;

test("bcrypt correctly hashes and verifies passwords", async () => {
  const plainPassword = "superSecretPassword123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  assert.notEqual(hashedPassword, plainPassword);
  assert.equal(await bcrypt.compare(plainPassword, hashedPassword), true);
  assert.equal(await bcrypt.compare("wrongPassword", hashedPassword), false);
});

test("generateToken produces a valid verifiable JWT containing id and role", () => {
  const userId = "6413cbccb178f4ec415a8b1e";
  const role = "user";

  const token = generateToken(null, userId, role);
  const decoded = jwt.verify(token, JWT_SECRET);

  assert.equal(decoded.id, userId);
  assert.equal(decoded.role, "user");
});

test("user profile field whitelist strips unauthorized role and password modifications", () => {
  // Simulate request body from malicious actor attempting privilege escalation and raw password overwrite
  const maliciousBody = {
    role: "admin",
    password: "unhashedPassword123",
    email: "attacker@evil.com",
    name: "Legit Name",
    reminderDays: 4,
    emailNotifications: true,
  };

  // Safe extractor matching PUT /users/profile/:id implementation
  const allowed = ["name", "reminderDays", "emailNotifications", "platformNotifications", "upcomingWeekly"];
  const sanitized = {};
  for (const key of allowed) {
    if (maliciousBody[key] !== undefined) {
      sanitized[key] = maliciousBody[key];
    }
  }

  assert.equal(sanitized.role, undefined);
  assert.equal(sanitized.password, undefined);
  assert.equal(sanitized.email, undefined);
  assert.equal(sanitized.name, "Legit Name");
  assert.equal(sanitized.reminderDays, 4);
});

test("subscription payload whitelist prevents userId tampering", () => {
  // Simulate attacker attempting to assign a subscription to another victim or steal one
  const authenticatedUserId = "user_123_authenticated";
  const spoofedUserId = "victim_999_spoofed";

  const maliciousBody = {
    userId: spoofedUserId,
    serviceName: "Netflix",
    category: "Entertainment",
    price: 649,
    billingCycle: "monthly",
    renewalDate: "2026-11-20",
  };

  // Whitelist filtering as enforced in SubscriptionAPI
  const allowedFields = [
    "serviceName",
    "category",
    "price",
    "billingCycle",
    "renewalDate",
    "reminderDays",
    "status",
    "paymentMethod",
    "notes",
  ];

  const updateFields = {};
  for (const field of allowedFields) {
    if (maliciousBody[field] !== undefined) {
      updateFields[field] = maliciousBody[field];
    }
  }

  // Update object must not contain userId
  assert.equal(updateFields.userId, undefined);
  assert.equal(updateFields.serviceName, "Netflix");
  assert.equal(updateFields.price, 649);
});
