import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { AuthService } from "../services/auth";
import { SubscriptionService } from "../services/sub";
import { Bell, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

function NotificationSettings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      reminderDays: 3,
      emailNotifications: true,
      platformNotifications: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingDues, setSendingDues] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  // Sync settings with authenticated user state from database
  useEffect(() => {
    if (user) {
      reset({
        reminderDays: user.reminderDays !== undefined ? user.reminderDays : 3,
        emailNotifications:
          user.emailNotifications !== undefined ? user.emailNotifications : true,
        platformNotifications:
          user.platformNotifications !== undefined
            ? user.platformNotifications
            : true,
      });
    }
  }, [user, reset]);

  const reminderDays = watch("reminderDays");
  const emailNotifications = watch("emailNotifications");
  const platformNotifications = watch("platformNotifications");

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await AuthService.updateProfile(user.id || user._id, {
        reminderDays: data.reminderDays,
        emailNotifications: data.emailNotifications,
        platformNotifications: data.platformNotifications,
      });

      if (res.updatedUser) {
        const updated = {
          ...user,
          ...res.updatedUser,
        };
        setUser(updated);
        addToast("Notification preferences saved successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      addToast(
        err.response?.data?.message || "Failed to update notification settings.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field, currentVal) => {
    setValue(field, !currentVal);
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const res = await AuthService.testEmail();
      addToast(res.message || "Test email dispatched! Check your inbox.", "success");
    } catch (err) {
      addToast(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send test email. Check your SMTP settings in .env",
        "error"
      );
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendDueReminders = async () => {
    setSendingDues(true);
    try {
      const res = await SubscriptionService.sendDueReminders();
      addToast(res.message, "success");
    } catch (err) {
      addToast(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send due reminders.",
        "error"
      );
    } finally {
      setSendingDues(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-[#e8e8ed] rounded-2xl p-6 font-sans select-none space-y-6"
    >
      <div className="border-b border-[#e8e8ed] pb-3">
        <h3 className={styles.subHeadingClass}>Alert Preferences</h3>
        <p className={`${styles.mutedText} text-[11px] mt-0.5`}>
          Configure automated email and in-app renewal reminders
        </p>
      </div>

      {/* Reminder slider selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className={styles.labelClass}>Default Reminder Window</label>
          <span className="text-xs font-semibold text-[#0066cc]">
            {reminderDays} Days Prior
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="14"
          {...register("reminderDays", { valueAsNumber: true })}
          className="w-full h-1 bg-[#e8e8ed] rounded-lg appearance-none cursor-pointer accent-[#0066cc] focus:outline-none"
        />

        <p className={`${styles.mutedText} text-[10px] leading-relaxed font-normal`}>
          The system monitors renewal dates and triggers alerts before the renewal window closes.
        </p>
      </div>

      {/* Channels checklist */}
      <div className="space-y-3.5 pt-4 border-t border-[#e8e8ed]">
        <label className={styles.labelClass}>Alert Delivery Channels</label>

        <div className="space-y-2.5">
          {/* Email toggle */}
          <div
            onClick={() => handleToggle("emailNotifications", emailNotifications)}
            className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] rounded-2xl cursor-pointer hover:bg-[#f5f5f7] transition duration-200"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4.5 h-4.5 text-[#0066cc]" />
              <div>
                <h4 className="text-xs font-semibold text-[#1d1d1f]">
                  Email Notifications
                </h4>
                <p className={`${styles.mutedText} text-[10px] mt-0.5`}>
                  Receive renewal notices and login security alerts at {user?.email}
                </p>
              </div>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 transition duration-300 ${
                emailNotifications ? "bg-[#0066cc]" : "bg-[#d2d2d7]"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition duration-300 transform ${
                  emailNotifications ? "translate-x-3.5" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>

          {/* In-app platform toggle */}
          <div
            onClick={() =>
              handleToggle("platformNotifications", platformNotifications)
            }
            className="flex items-center justify-between p-3.5 bg-white border border-[#e8e8ed] rounded-2xl cursor-pointer hover:bg-[#f5f5f7] transition duration-200"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4.5 h-4.5 text-[#0066cc]" />
              <div>
                <h4 className="text-xs font-semibold text-[#1d1d1f]">
                  Platform Notification Center
                </h4>
                <p className={`${styles.mutedText} text-[10px] mt-0.5`}>
                  Show notification bell badges and urgency banners in the app
                </p>
              </div>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 transition duration-300 ${
                platformNotifications ? "bg-[#0066cc]" : "bg-[#d2d2d7]"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition duration-300 transform ${
                  platformNotifications ? "translate-x-3.5" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Email Actions */}
      <div className="space-y-3 pt-4 border-t border-[#e8e8ed]">
        <label className={styles.labelClass}>Instant Email Actions</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSendDueReminders}
            disabled={sendingDues}
            className="flex-1 px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-[#e8e8ed] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {sendingDues ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0066cc]" />
            ) : (
              <Send className="w-4 h-4 text-[#0066cc]" />
            )}
            Send Due Alerts Now
          </button>

          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={sendingTest}
            className="flex-1 px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-[#e8e8ed] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {sendingTest ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#34c759]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
            )}
            Test SMTP Connection
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`${styles.primaryBtn} flex items-center justify-center gap-2 min-w-[140px]`}
        >
          {loading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : (
            "Save Preferences"
          )}
        </button>
      </div>
    </form>
  );
}

export default NotificationSettings;
