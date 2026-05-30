import { Calendar, Tag, CreditCard, Edit, Trash2, Eye } from "lucide-react";

function SubscriptionCard({ sub, onEdit, onDelete, onInspect }) {
  const isCancelled = sub.status === "cancelled";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewal = new Date(sub.renewalDate);
  renewal.setHours(0, 0, 0, 0);
  const diffTime = renewal.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getServiceInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "SU";
  };

  const getStatusBadge = (days) => {
    if (isCancelled) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f5f7] border border-[#e8e8ed] text-[#86868b]">
          Paused
        </span>
      );
    }
    if (days < 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#cc2f26]">
          Overdue
        </span>
      );
    } else if (days === 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff9500]/15 border border-[#ff9500]/30 text-[#bf7000]">
          Due Today
        </span>
      );
    } else if (days <= 3) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff9500]/10 border border-[#ff9500]/20 text-[#bf7000]">
          Due in {days}d
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0066cc]/10 border border-[#0066cc]/20 text-[#0066cc]">
          Due in {days}d
        </span>
      );
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border bg-white flex flex-col justify-between font-sans relative transition-all duration-200 ${
        isCancelled
          ? "opacity-65 border-[#e8e8ed]"
          : "border-[#e8e8ed] hover:border-[#d2d2d7] hover:bg-[#f5f5f7]/25"
      }`}
    >
      <div>
        {/* Header info */}
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 uppercase border ${
                isCancelled
                  ? "bg-[#e8e8ed] text-[#86868b] border-[#e8e8ed]"
                  : "bg-[#f5f5f7] text-[#1d1d1f] border-[#e8e8ed]"
              }`}
            >
              {getServiceInitials(sub.serviceName)}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[#1d1d1f] truncate">
                {sub.serviceName}
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#6e6e73] truncate mt-0.5">
                <Tag className="w-3 h-3 text-[#a1a1a6] shrink-0" />
                {sub.category}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base font-bold text-[#1d1d1f] block leading-none">
              ${sub.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-[#a1a1a6] tracking-wide capitalize mt-1.5 block">
              {sub.billingCycle}
            </span>
          </div>
        </div>

        {/* Date / Status block */}
        <div className="flex justify-between items-center py-1 mt-4">
          <span className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
            <Calendar className="w-3.5 h-3.5 text-[#a1a1a6]" />
            {new Date(sub.renewalDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>

          {getStatusBadge(diffDays)}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-[#e8e8ed] pt-3.5 mt-5">
        <span className="flex items-center gap-1.5 text-xs text-[#6e6e73]">
          <CreditCard className="w-3.5 h-3.5 text-[#a1a1a6]" />
          {sub.paymentMethod || "Card"}
        </span>

        <div className="flex gap-1">
          <button
            onClick={() => onInspect && onInspect(sub)}
            className="p-1.5 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition cursor-pointer"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit && onEdit(sub)}
            className="p-1.5 rounded-full text-[#0066cc] hover:text-[#004499] hover:bg-[#0066cc]/5 transition cursor-pointer"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete && onDelete(sub._id)}
            className="p-1.5 rounded-full text-[#ff3b30] hover:text-[#d62c23] hover:bg-[#ff3b30]/5 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
