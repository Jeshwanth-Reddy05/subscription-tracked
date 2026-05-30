import { useState, useEffect } from "react";
import { AdminService } from "../../services/admin";
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  FolderMinus, 
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import * as styles from "../../styles/common";

function SystemAnalytics() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGlobalSubscriptions = async () => {
    try {
      if (subscriptions.length === 0) setLoading(true);
      else setIsRefreshing(true);

      const data = await AdminService.getSubscriptions();
      const subsList = data.subscriptions || data || [];
      setSubscriptions(subsList);
      setError(null);
    } catch (err) {
      console.error("Failed to load global subscriptions:", err);
      setError(err.response?.data?.message || "Failed to fetch platform subscription datasets.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalSubscriptions();
  }, []);

  // Compute Platform analytics
  const activeSubs = subscriptions.filter(s => s.status === "active");
  const cancelledSubs = subscriptions.filter(s => s.status !== "active");
  
  // Calculate MRR (Monthly Recurring Revenue equivalents)
  const calculateMRR = () => {
    return activeSubs.reduce((acc, sub) => {
      const price = parseFloat(sub.price) || 0;
      if (sub.billingCycle === "yearly") {
        return acc + price / 12;
      }
      return acc + price;
    }, 0);
  };

  const platformMRR = calculateMRR();
  const avgCost = activeSubs.length > 0 ? (activeSubs.reduce((acc, sub) => acc + (parseFloat(sub.price) || 0), 0) / activeSubs.length) : 0;

  // Category distributions
  const categoriesMap = {};
  activeSubs.forEach(sub => {
    const cat = sub.category || "Other";
    const price = parseFloat(sub.price) || 0;
    const monthlyVal = sub.billingCycle === "yearly" ? price / 12 : price;
    categoriesMap[cat] = (categoriesMap[cat] || 0) + monthlyVal;
  });

  const categoryData = Object.keys(categoriesMap).map(key => ({
    name: key,
    value: Math.round(categoriesMap[key] * 100) / 100
  })).sort((a, b) => b.value - a.value);

  // SVG Donut Config
  const totalCatVal = categoryData.reduce((a, b) => a + b.value, 0) || 1;
  let cumulativePercent = 0;
  
  const colors = [
    "#0066cc", // Primary Blue highlight
    "#5e5e6e", // Slate gray
    "#8e8e93", // Medium gray
    "#aeaeb2", // Light gray
    "#d1d1d6", // Secondary light gray
    "#6e6e73", // Text gray
    "#1d1d1f"  // Charcoal
  ];

  return (
    <div className="space-y-8 font-sans pb-12 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={styles.pageTitleClass}>
            System Analytics
          </h1>
          <p className={`${styles.mutedText} mt-1`}>
            Global subscription metrics, cumulative network volumes, and micro-analytics.
          </p>
        </div>

        <button 
          onClick={fetchGlobalSubscriptions}
          disabled={isRefreshing}
          className={styles.secondaryBtn}
        >
          <RefreshCw className={`w-3.5 h-3.5 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingClass}>
          <p className="uppercase tracking-widest text-xs">Processing analytics ledger...</p>
        </div>
      ) : error ? (
        <div className={styles.errorClass}>
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Failed to aggregate global analytics</h3>
              <p className="text-xs opacity-95 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cumulative Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Platform MRR */}
            <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className={`${styles.mutedText} text-[9px] font-bold uppercase tracking-wider`}>Cumulative Monthly MRR</p>
                <div className="p-1.5 bg-[#0066cc]/10 border border-[#0066cc]/20 rounded-lg text-[#0066cc]">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#1d1d1f]">
                  ${platformMRR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className={`${styles.mutedText} text-[10px] mt-1 leading-relaxed`}>
                  Sum of monthly active subscription equivalent spends across all platform users.
                </p>
              </div>
            </div>

            {/* Platform Average Spend */}
            <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className={`${styles.mutedText} text-[9px] font-bold uppercase tracking-wider`}>Average Price Per Sub</p>
                <div className="p-1.5 bg-[#5e5e6e]/10 border border-[#5e5e6e]/20 rounded-lg text-[#5e5e6e]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#1d1d1f]">
                  ${avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className={`${styles.mutedText} text-[10px] mt-1 leading-relaxed`}>
                  Average raw base price calculated across all {activeSubs.length} active platform subscriptions.
                </p>
              </div>
            </div>

            {/* Tracking Efficiency */}
            <div className="bg-white border border-[#e8e8ed] rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <p className={`${styles.mutedText} text-[9px] font-bold uppercase tracking-wider`}>Tracking Activity Ratio</p>
                <div className="p-1.5 bg-[#0066cc]/10 border border-[#0066cc]/20 rounded-lg text-[#0066cc]">
                  <FolderMinus className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-[#1d1d1f]">
                  {subscriptions.length > 0 
                    ? Math.round((activeSubs.length / subscriptions.length) * 100) 
                    : 0}%
                </h3>
                <p className={`${styles.mutedText} text-[10px] mt-1 leading-relaxed`}>
                  {activeSubs.length} active trackers out of {subscriptions.length} cumulative registered database rows.
                </p>
              </div>
            </div>
          </div>

          {/* Core Analytics Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Donut Chart (3 cols width) */}
            <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 lg:col-span-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Category Spend Breakdown</h3>
                <p className={`${styles.mutedText} text-[10px] mt-0.5`}>Spends normalized to monthly equivalents across all active profiles</p>
              </div>

              {categoryData.length === 0 ? (
                <div className={styles.emptyStateClass}>
                  No categories to display. Create subscriptions to view breakdown.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center mt-6">
                  {/* SVG Donut Circle */}
                  <div className="flex justify-center">
                    <svg className="w-40 h-40 transform -rotate-90 shrink-0" viewBox="0 0 42 42">
                      <circle
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke="#f5f5f7"
                        strokeWidth="5"
                      />
                      {categoryData.map((item, idx) => {
                        const percent = (item.value / totalCatVal) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = 100 - cumulativePercent + 25;
                        cumulativePercent += percent;
                        
                        return (
                          <circle
                            key={item.name}
                            cx="21"
                            cy="21"
                            r="15.915"
                            fill="transparent"
                            stroke={colors[idx % colors.length]}
                            strokeWidth="5.1"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500 hover:stroke-[6px] cursor-pointer"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legends */}
                  <div className="space-y-2.5">
                    {categoryData.slice(0, 6).map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          />
                          <span className="font-medium text-[#6e6e73]">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#1d1d1f]">
                          ${item.value.toFixed(2)}
                          <span className="text-[10px] text-[#a1a1a6] font-normal ml-1">
                            ({Math.round((item.value / totalCatVal) * 100)}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* High-Volume Services Table (2 cols width) */}
            <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0066cc]" />
                  Premium Platform Services
                </h3>
                <p className={`${styles.mutedText} text-[10px] mt-0.5`}>Most common subscription services in database</p>
              </div>

              <div className="mt-6 flex-1 divide-y divide-[#e8e8ed]">
                {activeSubs.length === 0 ? (
                  <div className={styles.emptyStateClass}>
                    No records to analyze.
                  </div>
                ) : (
                  // Group by service name
                  Object.entries(
                    activeSubs.reduce((acc, sub) => {
                      const name = sub.serviceName || "Other";
                      acc[name] = (acc[name] || 0) + 1;
                      return acc;
                    }, {})
                  )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between py-2.5 text-xs font-semibold">
                      <span className="text-[#6e6e73] capitalize">{name}</span>
                      <span className="bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {count} tracking {count === 1 ? 'instance' : 'instances'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SystemAnalytics;
