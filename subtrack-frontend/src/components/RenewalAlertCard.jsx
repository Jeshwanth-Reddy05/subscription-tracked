import { AlertCircle, Calendar, CreditCard, ChevronRight } from "lucide-react";

function RenewalAlertCard({ alert, onActionClick }) {
  const isOverdue = alert.diffDays < 0;
  const isToday = alert.diffDays === 0;

  return (
    <div
      className={`p-4 rounded-3xl border font-sans select-none flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 group hover:shadow-lg ${
        isOverdue
          ? "bg-red-50/40 dark:bg-red-950/10 border-red-200/50 dark:border-red-900/30"
          : isToday
          ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30"
          : "bg-orange-50/30 dark:bg-orange-950/5 border-orange-200/40 dark:border-orange-900/20"
      }`}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border ${
              isOverdue
                ? "bg-red-100 border-red-200 text-red-500 dark:bg-red-950/40 dark:border-red-900/40"
                : "bg-amber-100 border-amber-200 text-amber-500 dark:bg-amber-950/40 dark:border-amber-900/40"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[120px]">
              {alert.sub?.serviceName}
            </h4>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                isOverdue
                  ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
              }`}
            >
              {isOverdue ? "Overdue" : isToday ? "Today" : `Due in ${alert.diffDays}d`}
            </span>
          </div>
        </div>

        <span className="text-sm font-black text-slate-800 dark:text-white">
          ${alert.sub?.price.toFixed(2)}
        </span>
      </div>

      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal mb-4">
        {alert.message}
      </p>

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/40 pt-2.5 mt-auto text-[9px] text-slate-400 dark:text-zinc-500 font-bold">
        <span className="flex items-center gap-1">
          <CreditCard className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-650" />
          {alert.sub?.paymentMethod || "UPI"}
        </span>

        <button
          onClick={() => onActionClick && onActionClick(alert.sub)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-0.5 cursor-pointer"
        >
          <span>Manage</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default RenewalAlertCard;
