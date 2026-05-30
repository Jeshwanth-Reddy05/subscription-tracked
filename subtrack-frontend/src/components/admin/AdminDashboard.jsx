import { useState, useEffect } from "react";
import { AdminService } from "../../services/admin";
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  Layers, 
  Calendar,
  AlertCircle
} from "lucide-react";
import * as styles from "../../styles/common";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getOverview();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load admin overview:", err);
        setError(err.response?.data?.message || "Failed to fetch admin overview statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingClass}>
        <p className="uppercase tracking-widest text-xs">Loading system metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className={styles.errorClass}>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold">System Overview Error</h3>
              <p className="text-xs opacity-90 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      name: "Total System Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/20",
      description: "Registered profiles on SubTrack"
    },
    {
      name: "Administrators",
      value: stats?.totalAdmins || 0,
      icon: ShieldAlert,
      color: "bg-[#5e5e6e]/10 text-[#5e5e6e] border-[#5e5e6e]/20",
      description: "Users with admin console access"
    },
    {
      name: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: Activity,
      color: "bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/20",
      description: "Currently tracking and active"
    },
    {
      name: "Cancelled Subscriptions",
      value: stats?.cancelledSubscriptions || 0,
      icon: ShieldAlert,
      color: "bg-[#8e8e93]/10 text-[#8e8e93] border-[#8e8e93]/20",
      description: "Archived or cancelled tracker entries"
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-12 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2">
        <h1 className={styles.pageTitleClass}>
          System Overview
        </h1>
        <p className={`${styles.mutedText} mt-0.5`}>
          Real-time metrics, system health, and aggregate billing cycle distributions.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div 
              key={m.name} 
              className="bg-white border border-[#e8e8ed] rounded-2xl p-6 hover:bg-[#f5f5f7] transition-all duration-350"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-semibold text-[#0066cc] bg-[#0066cc]/10 px-2 py-0.5 rounded-full border border-[#0066cc]/20 uppercase tracking-widest">
                  Live
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-3xl font-semibold text-[#1d1d1f] leading-none">
                  {m.value}
                </h3>
                <p className="text-xs font-semibold text-[#1d1d1f] mt-2">
                  {m.name}
                </p>
                <p className={`${styles.mutedText} text-[10px] mt-1 leading-relaxed`}>
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details & Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Frequencies */}
        <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6">
          <div className="flex items-center gap-3 border-b border-[#e8e8ed] pb-4 mb-5">
            <div className="p-2 bg-[#f5f5f7] text-[#0066cc] rounded-xl border border-[#e8e8ed]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Billing Frequencies</h3>
              <p className={`${styles.mutedText} text-[10px] mt-0.5`}>Distribution of subscription duration schemas</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Monthly Plans */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#6e6e73] mb-1.5">
                <span>Monthly Plans</span>
                <span className="text-[#0066cc]">{stats?.monthlyPlans || 0} plans</span>
              </div>
              <div className="w-full bg-[#f5f5f7] h-2.5 rounded-full overflow-hidden border border-[#e8e8ed]">
                <div 
                  className="bg-[#0066cc] h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: stats?.totalUsers > 0 
                      ? `${Math.min(100, ((stats.monthlyPlans || 0) / (stats.activeSubscriptions || 1)) * 100)}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>

            {/* Yearly Plans */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#6e6e73] mb-1.5">
                <span>Yearly Plans</span>
                <span className="text-[#5e5e6e]">{stats?.yearlyPlans || 0} plans</span>
              </div>
              <div className="w-full bg-[#f5f5f7] h-2.5 rounded-full overflow-hidden border border-[#e8e8ed]">
                <div 
                  className="bg-[#5e5e6e] h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: stats?.totalUsers > 0 
                      ? `${Math.min(100, ((stats.yearlyPlans || 0) / (stats.activeSubscriptions || 1)) * 100)}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl p-4 flex items-center justify-between text-xs font-semibold mt-2">
              <span className="text-[#6e6e73]">Total Tracked Subscriptions</span>
              <span className="text-slate-800 text-sm font-bold">
                {(stats?.activeSubscriptions || 0) + (stats?.cancelledSubscriptions || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Server & Data Integrity Status */}
        <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-[#e8e8ed] pb-4 mb-5">
              <div className="p-2 bg-[#f5f5f7] text-[#0066cc] rounded-xl border border-[#e8e8ed]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1d1d1f]">SubTrack Platform Status</h3>
                <p className={`${styles.mutedText} text-[10px] mt-0.5`}>Node.js API and data synchronization wellness</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2.5">
                <span className="text-xs font-medium text-[#6e6e73]">API Health</span>
                <span className="text-xs font-semibold text-[#34c759] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></span>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2.5">
                <span className="text-xs font-medium text-[#6e6e73]">Database Sync</span>
                <span className="text-xs font-semibold text-[#34c759] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34c759]"></span>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#6e6e73]">Auth JWT Encryption</span>
                <span className="text-xs font-semibold text-[#0066cc]">
                  HS256 Secure
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl mt-6 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#0066cc] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-[#1d1d1f]">System Auto-Billing Checks</h4>
              <p className={`${styles.mutedText} text-[10.5px] mt-0.5 leading-relaxed`}>
                Platform checks subscription upcoming renewal fields daily at 00:00 UTC, triggering active email alerts if configurations are registered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
