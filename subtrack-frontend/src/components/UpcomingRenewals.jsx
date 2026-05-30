import { useSubscriptionStore } from "../store/subscriptionStore";
import { Calendar, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import * as styles from "../styles/common";

function UpcomingRenewals({ onSelectSub }) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  const activeSubs = subscriptions.filter((sub) => sub.status === "active");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute days remaining and sort
  const upcomingRenewals = activeSubs
    .map((sub) => {
      const renewal = new Date(sub.renewalDate);
      renewal.setHours(0, 0, 0, 0);
      const diffTime = renewal.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...sub, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5);

  const getUrgencyStyles = (days) => {
    if (days < 0) {
      return {
        badge: "bg-[#ff3b30]/10 border-[#ff3b30]/20 text-[#cc2f26]",
        progress: "bg-[#ff3b30]",
        barBg: "bg-[#ff3b30]/10",
        label: "Overdue",
      };
    } else if (days === 0) {
      return {
        badge: "bg-[#ffcc00]/20 border-[#ffcc00]/30 text-[#b28f00] animate-pulse",
        progress: "bg-[#ffcc00]",
        barBg: "bg-[#ffcc00]/10",
        label: "Due Today",
      };
    } else if (days <= 3) {
      return {
        badge: "bg-[#ffcc00]/10 border-[#ffcc00]/20 text-[#b28f00]",
        progress: "bg-[#ffcc00]",
        barBg: "bg-[#ffcc00]/10",
        label: `Due in ${days}d`,
      };
    } else {
      return {
        badge: "bg-[#0066cc]/10 border-[#0066cc]/20 text-[#0066cc]",
        progress: "bg-[#0066cc]",
        barBg: "bg-[#0066cc]/10",
        label: `Due in ${days}d`,
      };
    }
  };

  const getServiceInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "SU";
  };

  return (
    <div className={`${styles.cardClass} border border-[#e8e8ed] flex flex-col font-sans select-none cursor-default`}>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] tracking-tight">
            Upcoming Renewals
          </h3>
          <p className="text-[10px] text-[#6e6e73] mt-0.5">
            Chronological payment deadlines
          </p>
        </div>
        <Calendar className="w-4.5 h-4.5 text-[#0066cc]" />
      </div>

      <div className="space-y-4">
        {upcomingRenewals.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#a1a1a6] font-semibold leading-relaxed flex flex-col items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#34c759] mb-2.5" />
            <span>Zero pending payments. Beautiful!</span>
          </div>
        ) : (
          upcomingRenewals.map((sub) => {
            const urgency = getUrgencyStyles(sub.diffDays);
            
            // Calculate a stylized progress ratio (cap at 100%, minimum 0%)
            const maxTrackDays = 30; // 30 day visualization
            const percentage = sub.diffDays < 0 
              ? 100 
              : Math.max(0, Math.min(100, ((maxTrackDays - sub.diffDays) / maxTrackDays) * 100));

            return (
              <div
                key={sub._id}
                onClick={() => onSelectSub && onSelectSub(sub)}
                className="cursor-pointer bg-white hover:bg-[#f5f5f7] p-2.5 rounded-2xl border border-[#e8e8ed] transition duration-200 group"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#ebebf0] text-[#1d1d1f] border border-[#d2d2d7] font-extrabold flex items-center justify-center text-[10px] shrink-0 uppercase">
                      {getServiceInitials(sub.serviceName)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1d1d1f] truncate">
                        {sub.serviceName}
                      </h4>
                      <p className="text-[9px] text-[#6e6e73] leading-none mt-0.5">
                        ${sub.price.toFixed(2)} / {sub.billingCycle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-lg border ${urgency.badge}`}
                  >
                    {sub.diffDays <= 0 && <AlertTriangle className="w-3 h-3 shrink-0" />}
                    {urgency.label}
                  </span>
                </div>

                {/* Relative visual progress bar */}
                <div className="space-y-1.5">
                  <div className={`w-full h-1.5 rounded-full ${urgency.barBg} overflow-hidden`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${urgency.progress}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[8.5px] text-[#6e6e73] font-bold">
                    <span>
                      {new Date(sub.renewalDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 text-[#0066cc] flex items-center gap-0.5 transition-all duration-300">
                      Inspect details
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default UpcomingRenewals;
