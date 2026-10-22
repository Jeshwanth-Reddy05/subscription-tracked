import test from "node:test";
import assert from "node:assert/strict";
import { rollRenewalDateForward } from "../utils/renewal.js";
import { shouldSendReminder } from "../utils/scheduler.js";

test("rollRenewalDateForward advances past monthly date to next cycle", () => {
  const reference = new Date("2026-10-22T00:00:00.000Z");
  // Renewal date was in July 2026
  const pastRenewal = new Date("2026-07-15T00:00:00.000Z");

  const next = rollRenewalDateForward(pastRenewal, "monthly", reference);

  // Should have rolled forward past Oct 22 to Nov 15
  assert.equal(next.getFullYear(), 2026);
  assert.equal(next.getMonth(), 10); // 10 is November (0-indexed)
  assert.equal(next.getDate(), 15);
});

test("rollRenewalDateForward advances past yearly date to next cycle", () => {
  const reference = new Date("2026-10-22T00:00:00.000Z");
  const pastRenewal = new Date("2024-05-10T00:00:00.000Z");

  const next = rollRenewalDateForward(pastRenewal, "yearly", reference);

  // Should have rolled forward to 2027-05-10
  assert.equal(next.getFullYear(), 2027);
  assert.equal(next.getMonth(), 4); // 4 is May
  assert.equal(next.getDate(), 10);
});

test("rollRenewalDateForward keeps future and same-day dates intact", () => {
  const reference = new Date("2026-10-22T00:00:00.000Z");
  const future = new Date("2026-11-20T00:00:00.000Z");
  const today = new Date("2026-10-22T00:00:00.000Z");

  const nextFuture = rollRenewalDateForward(future, "monthly", reference);
  assert.equal(new Date(nextFuture).getTime(), future.getTime());

  const nextToday = rollRenewalDateForward(today, "monthly", reference);
  assert.equal(new Date(nextToday).getTime(), today.getTime());
});

test("shouldSendReminder returns true within reminder window", () => {
  const today = new Date("2026-10-22T00:00:00.000Z");
  const renewalDate = new Date("2026-10-25T00:00:00.000Z"); // 3 days remaining

  assert.equal(shouldSendReminder(today, renewalDate, 3), true);
  assert.equal(shouldSendReminder(today, renewalDate, 5), true);
});

test("shouldSendReminder recovers if a run was missed (e.g. 1 day remaining)", () => {
  const today = new Date("2026-10-22T00:00:00.000Z");
  const renewalDate = new Date("2026-10-23T00:00:00.000Z"); // 1 day remaining, reminderDays is 3

  assert.equal(shouldSendReminder(today, renewalDate, 3), true);
});

test("shouldSendReminder returns false outside reminder window", () => {
  const today = new Date("2026-10-22T00:00:00.000Z");
  const renewalDate = new Date("2026-10-30T00:00:00.000Z"); // 8 days remaining

  assert.equal(shouldSendReminder(today, renewalDate, 3), false);
});

test("shouldSendReminder avoids duplicate sends when already sent for this cycle", () => {
  const today = new Date("2026-10-22T00:00:00.000Z");
  const renewalDate = new Date("2026-10-24T00:00:00.000Z");
  const lastSent = new Date("2026-10-24T00:00:00.000Z"); // Already recorded as sent for this date

  assert.equal(shouldSendReminder(today, renewalDate, 3, lastSent), false);
});
