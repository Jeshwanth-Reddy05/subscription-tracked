import { useSubscriptionStore } from "../store/subscriptionStore";
import { ChevronRight, Calendar, Tag } from "lucide-react";
import * as styles from "../styles/common";

function RecentSubscriptions({ onSelectSub }) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);

  // Get 5 most recently created subscriptions
  const recentSubs = [...subscriptions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getServiceInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : "SU";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={`${styles.cardClass} border border-[#e8e8ed] flex flex-col font-sans select-none cursor-default`}>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#1d1d1f] tracking-tight">
            Recently Added
          </h3>
          <p className="text-[10px] text-[#6e6e73] mt-0.5">
            Your latest tracks in the platform
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#0066cc] bg-[#0066cc]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Feed Active
        </span>
      </div>

      <div className="divide-y divide-[#e8e8ed]">
        {recentSubs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#a1a1a6] font-semibold leading-relaxed">
            No subscriptions tracked yet. Click "Add Service" to start!
          </div>
        ) : (
          recentSubs.map((sub) => (
            <div
              key={sub._id}
              onClick={() => onSelectSub && onSelectSub(sub)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-white rounded-xl px-2 -mx-2 transition-all duration-200 group"
            >
              {/* Left Column: Icon & Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#ebebf0] text-[#1d1d1f] border border-[#d2d2d7] font-extrabold flex items-center justify-center text-xs shrink-0 uppercase transition-transform duration-300">
                  {getServiceInitials(sub.serviceName)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#1d1d1f] truncate">
                    {sub.serviceName}
                  </h4>
                  <div className="flex items-center gap-3 text-[9px] text-[#6e6e73] font-semibold mt-0.5">
                    <span className="flex items-center gap-0.5 truncate">
                      <Tag className="w-2.5 h-2.5 text-[#a1a1a6]" />
                      {sub.category}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5 text-[#a1a1a6]" />
                      {formatDate(sub.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Price & Action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-black text-[#1d1d1f] block">
                    ${(sub.price || 0).toFixed(2)}
                  </span>
                  <span className="text-[9px] font-bold text-[#a1a1a6] capitalize mt-0.5 block leading-none">
                    {sub.billingCycle}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a1a1a6] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentSubscriptions;
