import { useState } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { AlertCircle, X, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import * as styles from "../styles/common";

function ReminderBanner() {
  const notifications = useSubscriptionStore((state) => state.notifications);
  const [dismissed, setDismissed] = useState(false);

  const overdueAlerts = notifications.filter((notif) => notif.type === "danger");
  const todayAlerts = notifications.filter((notif) => notif.type === "warning");
  
  if (dismissed || (overdueAlerts.length === 0 && todayAlerts.length === 0)) {
    return null;
  }

  const alertCount = overdueAlerts.length + todayAlerts.length;

  return (
    <div className={`${styles.errorClass} mb-6 flex items-center justify-between font-sans`}>
      {/* Content */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-[#cc2f26]" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase text-[#cc2f26]">Critical Billing Attention Required</h4>
          <p className="text-[11px] text-[#cc2f26] leading-relaxed mt-0.5 max-w-xl">
            You have <span className="font-extrabold underline">{alertCount} active subscriptions</span> that are overdue or due today! Please review your payment details to avoid service interruptions.
          </p>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
          to="/dashboard/subscriptions"
          className="hidden sm:inline-flex items-center gap-1 border border-[#ff3b30]/20 text-[#cc2f26] font-bold px-3 py-1 rounded-xl text-[10px] uppercase tracking-wide hover:bg-[#ff3b30]/10 transition cursor-pointer select-none"
        >
          <span>Resolve Now</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-[#cc2f26]/70 hover:text-[#cc2f26] hover:bg-[#ff3b30]/10 cursor-pointer transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ReminderBanner;
