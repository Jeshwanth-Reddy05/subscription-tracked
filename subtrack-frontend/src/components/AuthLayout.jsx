import { ShieldCheck, Sparkles, TrendingUp, CalendarDays } from "lucide-react";
import * as styles from "../styles/common";

function AuthLayout({ children }) {
  return (
    <div className={`flex flex-col md:flex-row ${styles.pageBackground}`}>
      {/* Visual Splash Side */}
      <div className="md:w-1/2 bg-[#f5f5f7] p-8 md:p-16 flex flex-col justify-between border-r border-[#e8e8ed]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0066cc] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1d1d1f]">SubTrack</h1>
            <p className={styles.mutedText}>Subscription Premium Intelligence</p>
          </div>
        </div>

        {/* Core Value Pitch */}
        <div className="my-auto py-12 max-w-md">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-[#1d1d1f] mb-6">
            Master your recurring expenses.
            <span className="block mt-2 text-[#0066cc]">
              effortlessly and elegantly.
            </span>
          </h2>
          <p className={`${styles.bodyText} mb-10`}>
            Automate tracking, analyze payment distribution trends, receive smart alerts prior to renewals, and unlock system optimization metrics inside a premium glassmorphic portal.
          </p>

          {/* Micro-Features grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#d2d2d7] flex items-center justify-center mt-0.5">
                <TrendingUp className="w-4 h-4 text-[#0066cc]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">Expense Analytics</h4>
                <p className="text-[10px] text-[#6e6e73]">Animated custom graphs</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#d2d2d7] flex items-center justify-center mt-0.5">
                <CalendarDays className="w-4 h-4 text-[#0066cc]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">Renewal Alerts</h4>
                <p className="text-[10px] text-[#6e6e73]">Never miss a cycle</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#d2d2d7] flex items-center justify-center mt-0.5">
                <ShieldCheck className="w-4 h-4 text-[#0066cc]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">Secure Control</h4>
                <p className="text-[10px] text-[#6e6e73]">Role-based admin access</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#d2d2d7] flex items-center justify-center mt-0.5">
                <Sparkles className="w-4 h-4 text-[#0066cc]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f]">SubTrack Core</h4>
                <p className="text-[10px] text-[#6e6e73]">Tailored light & dark mode</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#a1a1a6] flex justify-between items-center">
          <p>© {new Date().getFullYear()} SubTrack Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#1d1d1f] cursor-pointer transition">Privacy</span>
            <span className="hover:text-[#1d1d1f] cursor-pointer transition">Terms</span>
          </div>
        </div>
      </div>

      {/* Form Container Side */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-16 relative">
        <div className="absolute top-4 right-4 text-xs font-semibold text-[#a1a1a6] flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></span>
          Backend API Online
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
