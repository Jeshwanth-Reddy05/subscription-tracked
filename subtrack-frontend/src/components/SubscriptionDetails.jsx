import { useMemo } from "react";
import { X, Calendar, Tag, CreditCard, Clock, FileText, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import * as styles from "../styles/common";

function SubscriptionDetails({ sub, onClose, onEdit, onDelete, onToggleStatus }) {

  if (!sub) return null;

  const isCancelled = sub.status === "cancelled";
  
  // Calculate historical usage stats
  const stats = useMemo(() => {
    const today = new Date();
    const created = new Date(sub.createdAt || sub.renewalDate);
    const monthsDiff = Math.max(1, (today.getFullYear() - created.getFullYear()) * 12 + today.getMonth() - created.getMonth());
    
    let cyclesPaid = monthsDiff;
    if (sub.billingCycle === "yearly") {
      cyclesPaid = Math.max(1, Math.ceil(monthsDiff / 12));
    }
    
    const totalPaid = cyclesPaid * sub.price;

    return {
      monthsDiff,
      cyclesPaid,
      totalPaid,
    };
  }, [sub]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "SU";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity duration-300"></div>

      {/* Modal Dialog */}
      <div className="relative bg-white border border-[#e8e8ed] rounded-2xl w-full max-w-lg mx-4 p-8 z-10 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#ebebf0] text-[#1d1d1f] font-bold flex items-center justify-center text-sm uppercase">
              {getInitials(sub.serviceName)}
            </div>
            <div>
              <h3 className={styles.subHeadingClass}>
                {sub.serviceName}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-1.5 ${
                isCancelled 
                  ? "bg-[#ff3b30]/10 text-[#cc2f26]" 
                  : "bg-[#34c759]/10 text-[#248a3d]"
              }`}>
                {isCancelled ? <AlertTriangle className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                {sub.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl">
            <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider block">Cost Rate</span>
            <h4 className="text-lg font-bold text-[#1d1d1f] mt-1">
              ${sub.price.toFixed(2)}
            </h4>
            <span className="text-[10px] text-[#a1a1a6] capitalize mt-1.5 block font-semibold">{sub.billingCycle} billing cycle</span>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl">
            <span className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider block">Total Spent (Est.)</span>
            <h4 className="text-lg font-bold text-[#1d1d1f] mt-1">
              ${stats.totalPaid.toFixed(2)}
            </h4>
            <span className="text-[10px] text-[#a1a1a6] mt-1.5 block font-semibold">Across {stats.cyclesPaid} payment cycles</span>
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-[#1d1d1f]">
            <Tag className="w-4.5 h-4.5 text-[#a1a1a6] shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider leading-none mb-1">Service Category</p>
              <span className="font-semibold text-sm">{sub.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-[#1d1d1f]">
            <Calendar className="w-4.5 h-4.5 text-[#a1a1a6] shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider leading-none mb-1">Next Payment Due</p>
              <span className="font-semibold text-sm">{formatDate(sub.renewalDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-[#1d1d1f]">
            <CreditCard className="w-4.5 h-4.5 text-[#a1a1a6] shrink-0" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider leading-none mb-1">Payment Channel</p>
              <span className="font-semibold text-sm">{sub.paymentMethod || "UPI"}</span>
            </div>
          </div>

          {sub.notes && (
            <div className="flex items-start gap-3 text-sm text-[#1d1d1f] border-t border-[#e8e8ed] pt-4 mt-2">
              <FileText className="w-4.5 h-4.5 text-[#a1a1a6] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider leading-none mb-1.5">Additional Notes</p>
                <div className="bg-[#f5f5f7] border border-[#e8e8ed] p-3 rounded-xl text-xs leading-relaxed text-[#6e6e73]">
                  {sub.notes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Timeline visualizer */}
        <div className="mb-6 p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl">
          <p className="text-[10px] font-bold text-[#6e6e73] uppercase tracking-wider leading-none mb-4">Billing Cycle Timeline</p>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#34c759]"></div>
            <div className="h-0.5 flex-1 bg-[#34c759]/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#0066cc]"></div>
            <div className="h-0.5 flex-1 border-t border-dashed border-[#d2d2d7]"></div>
            <div className="w-2.5 h-2.5 rounded-full border-2 border-[#d2d2d7] bg-white"></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#6e6e73] mt-2 font-semibold">
            <span>First Paid</span>
            <span className="text-[#0066cc] font-bold">Upcoming Due</span>
            <span>Next Cycle</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex justify-between items-center border-t border-[#e8e8ed] pt-4 mt-6">
          <button
            onClick={() => onToggleStatus && onToggleStatus(sub)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer select-none border ${
              isCancelled 
                ? "bg-[#34c759]/10 border-[#34c759]/20 text-[#248a3d] hover:bg-[#34c759]/20" 
                : "bg-[#ff9500]/10 border-[#ff9500]/20 text-[#bf7000] hover:bg-[#ff9500]/20"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isCancelled ? "Resume Active" : "Pause Tracker"}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onEdit(sub);
                onClose();
              }}
              className={styles.secondaryBtn}
            >
              Modify
            </button>
            <button
              onClick={() => {
                onDelete(sub._id);
                onClose();
              }}
              className="bg-[#ff3b30] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#d62c23] transition-colors cursor-pointer text-sm"
            >
              Remove
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SubscriptionDetails;
