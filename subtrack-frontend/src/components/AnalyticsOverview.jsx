import { useMemo, useEffect } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import ExpenseChart from "./ExpenseChart";
import CategoryPieChart from "./CategoryPieChart";
import { BarChart3 } from "lucide-react";
import * as styles from "../styles/common";

function AnalyticsOverview() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const loading = useSubscriptionStore((state) => state.loading);
  const refreshSubscriptions = useSubscriptionStore((state) => state.refreshSubscriptions);

  // Fetch subscriptions immediately on mount to populate the charts
  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  const activeSubs = subscriptions.filter((sub) => sub.status === "active");

  const analyticsStats = useMemo(() => {
    let monthlyBurn = 0;
    let highestPrice = 0;
    let highestSubName = "N/A";
    const categoryCounts = {};

    activeSubs.forEach((sub) => {
      const price = sub.price || 0;
      const mPrice = sub.billingCycle === "monthly" ? price : price / 12;
      monthlyBurn += mPrice;

      if (price > highestPrice) {
        highestPrice = price;
        highestSubName = sub.serviceName;
      }

      categoryCounts[sub.category] = (categoryCounts[sub.category] || 0) + 1;
    });

    // Find most used category
    let maxCount = 0;
    let topCategory = "N/A";
    Object.keys(categoryCounts).forEach((cat) => {
      if (categoryCounts[cat] > maxCount) {
        maxCount = categoryCounts[cat];
        topCategory = cat;
      }
    });

    return {
      monthlyBurn,
      highestPrice,
      highestSubName,
      topCategory,
      activeCount: activeSubs.length,
    };
  }, [activeSubs]);

  // Render simple, elegant loading fallback spinner while database is synchronizing
  if (loading && subscriptions.length === 0) {
    return (
      <div className={styles.loadingClass}>
        <p className="uppercase tracking-widest text-xs font-semibold">Synchronizing analytics database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans select-none">
      {/* Overview Title Banner */}
      <div>
        <h2 className={styles.headingClass}>
          Analytics & Trends
        </h2>
        <p className={`${styles.mutedText} mt-0.5`}>
          Unlock platform cost analytics and smart financial insights.
        </p>
      </div>

      {/* Grid containing SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <ExpenseChart subscriptions={subscriptions} />
        </div>
        <div className="lg:col-span-2">
          <CategoryPieChart subscriptions={subscriptions} />
        </div>
      </div>

      {/* Analysis Grid - Cost Parameters */}
      <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 space-y-5">
        <h3 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e8e8ed] pb-3">
          <BarChart3 className="w-4 h-4 text-[#0066cc]" />
          Cost Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed]">
            <span className={`${styles.mutedText} text-[9px] uppercase tracking-widest block`}>Highest Service Charge</span>
            <h4 className="text-base font-bold text-[#1d1d1f] mt-1.5 truncate">
              {analyticsStats.highestSubName} 
              <span className="text-sm text-[#0066cc] font-bold pl-2">${analyticsStats.highestPrice.toFixed(2)}</span>
            </h4>
          </div>

          <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed]">
            <span className={`${styles.mutedText} text-[9px] uppercase tracking-widest block`}>Concentrated Category</span>
            <h4 className="text-base font-bold text-[#1d1d1f] mt-1.5 capitalize">
              {analyticsStats.topCategory}
            </h4>
          </div>

          <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed]">
            <span className={`${styles.mutedText} text-[9px] uppercase tracking-widest block`}>Core Monthly Burn</span>
            <h4 className="text-base font-bold text-[#1d1d1f] mt-1.5">
              ${analyticsStats.monthlyBurn.toFixed(2)}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverview;
