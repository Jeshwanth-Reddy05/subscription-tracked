import cron from "node-cron";
import Subscription from "../models/SubscriptionTypeModel.js";
import sendEmail from "./sendEmail.js";
import { rollRenewalDateForward } from "./renewal.js";

/**
 * Checks whether a reminder should be sent for a subscription.
 *
 * @param {Date|string} today - Reference date
 * @param {Date|string} renewalDate - Subscription renewal date
 * @param {number} reminderDays - Window in days before renewal (e.g. 3)
 * @param {Date|string|null} lastReminderSentRenewalDate - Last renewal date for which a reminder was sent
 * @returns {boolean} True if reminder should be sent
 */
export const shouldSendReminder = (
  today,
  renewalDate,
  reminderDays,
  lastReminderSentRenewalDate = null,
) => {
  if (!renewalDate || !reminderDays) return false;

  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);

  const targetRenewal = new Date(renewalDate);
  targetRenewal.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (targetRenewal.getTime() - normalizedToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Must be in the window: between 0 (due today) and reminderDays prior
  if (daysRemaining < 0 || daysRemaining > reminderDays) {
    return false;
  }

  // If already sent for this renewal cycle, avoid duplicate sends
  if (lastReminderSentRenewalDate) {
    const sentDate = new Date(lastReminderSentRenewalDate);
    sentDate.setHours(0, 0, 0, 0);
    if (sentDate.getTime() === targetRenewal.getTime()) {
      return false;
    }
  }

  return true;
};

/**
 * Checks and sends renewal reminder emails for a specific user.
 *
 * @param {string} userId - User ID
 * @returns {Promise<{remindersSent: number, checkedCount: number}>}
 */
export const checkAndSendRemindersForUser = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subscriptions = await Subscription.find({
    userId,
    status: "active",
  }).populate("userId", "name email emailNotifications");

  let remindersSent = 0;
  const checkedCount = subscriptions.length;

  for (const sub of subscriptions) {
    if (!sub.userId || !sub.userId.email) continue;
    if (sub.userId.emailNotifications === false) continue;

    let renewalDate = new Date(sub.renewalDate);
    renewalDate.setHours(0, 0, 0, 0);

    if (renewalDate < today) {
      const nextDate = rollRenewalDateForward(sub.renewalDate, sub.billingCycle, today);
      sub.renewalDate = nextDate;
      sub.lastReminderSentRenewalDate = null;
      await Subscription.findByIdAndUpdate(sub._id, {
        $set: {
          renewalDate: nextDate,
          lastReminderSentRenewalDate: null,
        },
      });
      renewalDate = new Date(nextDate);
      renewalDate.setHours(0, 0, 0, 0);
    }

    if (shouldSendReminder(today, sub.renewalDate, sub.reminderDays, sub.lastReminderSentRenewalDate)) {
      const formattedDate = renewalDate.toLocaleDateString();
      const emailSubject = `Subscription Renewal Alert: ${sub.serviceName}`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Renewal Reminder</h2>
          <p>Hi ${sub.userId.name || "there"},</p>
          <p>This is a friendly reminder that your subscription for <strong>${sub.serviceName}</strong> is renewing soon.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Service</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${sub.serviceName} (${sub.category})</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Renewal Date</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Price</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${sub.price} (${sub.billingCycle})</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Method</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb;">${sub.paymentMethod}</td>
            </tr>
          </table>
          <p>To avoid service interruptions, please make sure your payment method is active.</p>
          <p>Thank you for using SubTrack!</p>
        </div>
      `;

      try {
        await sendEmail({
          to: sub.userId.email,
          subject: emailSubject,
          html: emailHtml,
          text: `Hi ${sub.userId.name || "there"}, your subscription for ${sub.serviceName} is renewing on ${formattedDate} for ₹${sub.price} (${sub.billingCycle}).`,
        });

        sub.lastReminderSentRenewalDate = sub.renewalDate;
        await Subscription.findByIdAndUpdate(sub._id, {
          $set: { lastReminderSentRenewalDate: sub.renewalDate },
        });

        remindersSent++;
      } catch (sendErr) {
        console.error(
          `Failed to send email to ${sub.userId.email} for subscription ${sub.serviceName}:`,
          sendErr.message,
        );
      }
    }
  }

  return { remindersSent, checkedCount };
};

// Helper function to check and send renewal reminders across all users (daily cron)
export const runSubscriptionCheck = async () => {
  console.log("Running scheduled subscription renewal reminder check...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions = await Subscription.find({ status: "active" }).populate(
      "userId",
      "name email emailNotifications",
    );

    let remindersSent = 0;
    let rollForwardCount = 0;

    for (const sub of subscriptions) {
      if (!sub.userId || !sub.userId.email) continue;

      let renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      // Roll forward renewal dates that have already passed
      if (renewalDate < today) {
        const nextDate = rollRenewalDateForward(sub.renewalDate, sub.billingCycle, today);
        sub.renewalDate = nextDate;
        sub.lastReminderSentRenewalDate = null;
        await Subscription.findByIdAndUpdate(sub._id, {
          $set: {
            renewalDate: nextDate,
            lastReminderSentRenewalDate: null,
          },
        });
        renewalDate = new Date(nextDate);
        renewalDate.setHours(0, 0, 0, 0);
        rollForwardCount++;
      }

      // Skip email notification if the user has explicitly disabled it
      if (sub.userId.emailNotifications === false) {
        continue;
      }

      // Check if reminder is due within window and not yet sent for this cycle
      if (shouldSendReminder(today, sub.renewalDate, sub.reminderDays, sub.lastReminderSentRenewalDate)) {
        const formattedDate = renewalDate.toLocaleDateString();
        const emailSubject = `Subscription Renewal Alert: ${sub.serviceName}`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Renewal Reminder</h2>
            <p>Hi ${sub.userId.name || "there"},</p>
            <p>This is a friendly reminder that your subscription for <strong>${sub.serviceName}</strong> is renewing soon.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f9fafb;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Service</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${sub.serviceName} (${sub.category})</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Renewal Date</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${formattedDate}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Price</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${sub.price} (${sub.billingCycle})</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Method</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${sub.paymentMethod}</td>
              </tr>
            </table>
            <p>To avoid service interruptions, please make sure your payment method is active.</p>
            <p>Thank you for using SubTrack!</p>
          </div>
        `;

        try {
          await sendEmail({
            to: sub.userId.email,
            subject: emailSubject,
            html: emailHtml,
            text: `Hi ${sub.userId.name || "there"}, your subscription for ${sub.serviceName} is renewing on ${formattedDate} for ₹${sub.price} (${sub.billingCycle}).`,
          });

          // Mark reminder as sent for this renewal cycle
          sub.lastReminderSentRenewalDate = sub.renewalDate;
          await Subscription.findByIdAndUpdate(sub._id, {
            $set: { lastReminderSentRenewalDate: sub.renewalDate },
          });

          remindersSent++;
        } catch (sendErr) {
          console.error(
            `Failed to send email to ${sub.userId.email} for subscription ${sub.serviceName}:`,
            sendErr.message,
          );
        }
      }
    }
    console.log(
      `Renewal check finished. Rolled forward: ${rollForwardCount}. Sent ${remindersSent} reminders.`,
    );
  } catch (error) {
    console.error("Error running subscription renewal check:", error);
  }
};

// Initialize node-cron daily schedule (runs daily at midnight)
export const initScheduler = () => {
  cron.schedule("0 0 * * *", runSubscriptionCheck);
  console.log("Daily subscription renewal reminder scheduler initialized.");
};

export default initScheduler;
