import { useRef, useEffect } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { Bell, Info, AlertTriangle, X, CheckCircle, Calendar, CreditCard } from "lucide-react";

function NotificationCenter({ isOpen, onClose }) {
  const notifications = useSubscriptionStore((state) => state.notifications);
  const panelRef = useRef();

  // Close panel on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xl z-50 animate-fade-in origin-top-right overflow-hidden transition-all duration-300"
    >
      {/* Title */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Alerts & Reminders</h4>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
        {notifications.length === 0 ? (
          <div className="py-8 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300">All caught up!</h5>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              No active subscriptions require attention or renewal soon.
            </p>
          </div>
        ) : (
          notifications.map((alert) => {
            const isDanger = alert.type === "danger";
            const isWarning = alert.type === "warning";
            
            return (
              <div
                key={alert.id}
                className={`p-4 transition-all duration-200 flex gap-3 items-start ${
                  isDanger
                    ? "bg-red-50/[0.15] dark:bg-red-950/[0.05]"
                    : isWarning
                    ? "bg-amber-50/[0.15] dark:bg-amber-950/[0.05]"
                    : "hover:bg-slate-50/50 dark:hover:bg-zinc-800/20"
                }`}
              >
                {/* Visual indicator */}
                <div
                  className={`mt-0.5 w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 border ${
                    isDanger
                      ? "bg-red-50 border-red-200/50 text-red-500 dark:bg-red-950/30 dark:border-red-900/30"
                      : isWarning
                      ? "bg-amber-50 border-amber-200/50 text-amber-500 dark:bg-amber-950/30 dark:border-amber-900/30"
                      : "bg-blue-50 border-blue-200/50 text-blue-500 dark:bg-blue-950/30 dark:border-blue-900/30"
                  }`}
                >
                  {isDanger ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {alert.title}
                    </h5>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isDanger
                          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                          : isWarning
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                      }`}
                    >
                      {alert.diffDays < 0
                        ? "Overdue"
                        : alert.diffDays === 0
                        ? "Today"
                        : `${alert.diffDays}d`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal mb-2">
                    {alert.message}
                  </p>
                  
                  {/* Micro dashboard stats */}
                  <div className="flex items-center gap-4 text-[9px] text-slate-400 dark:text-zinc-500 font-semibold border-t border-slate-100/50 dark:border-zinc-800/40 pt-1.5 mt-1.5">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-slate-300 dark:text-zinc-600" />
                      {alert.sub?.paymentMethod || "UPI"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300 dark:text-zinc-600" />
                      {alert.sub?.billingCycle || "Monthly"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-950/20 text-center border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            {notifications.length} Active System Alerts
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
