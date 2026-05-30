import cron from "node-cron";
import Subscription from "../models/SubscriptionTypeModel.js";
import sendEmail from "./sendEmail.js";

// Helper function to check and send renewal reminders
export const runSubscriptionCheck = async () => {
  console.log("Running scheduled subscription renewal reminder check...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active subscriptions and populate owner details
    const subscriptions = await Subscription.find({ status: "active" }).populate(
      "userId",
      "name email emailNotifications"
    );

    let remindersSent = 0;

    for (const sub of subscriptions) {
      if (!sub.userId || !sub.userId.email) continue;

      // Skip email notification if the user has explicitly disabled it
      if (sub.userId.emailNotifications === false) {
        console.log(`Skipping email reminder for user ${sub.userId.email} on ${sub.serviceName} due to user preferences.`);
        continue;
      }

      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0, 0, 0, 0);

      // Calculate difference in calendar days
      const timeDiff = renewalDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // If the difference matches reminderDays, send notification
      if (daysDiff === sub.reminderDays) {
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
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${renewalDate.toLocaleDateString()}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Price</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">$${sub.price} (${sub.billingCycle})</td>
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
            text: `Hi ${sub.userId.name || "there"}, your subscription for ${sub.serviceName} is renewing on ${renewalDate.toLocaleDateString()} for $${sub.price} (${sub.billingCycle}).`,
          });
          remindersSent++;
        } catch (sendErr) {
          console.error(`Failed to send email to ${sub.userId.email} for subscription ${sub.serviceName}:`, sendErr.message);
        }
      }
    }
    console.log(`Renewal check finished. Sent ${remindersSent} reminders.`);
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
