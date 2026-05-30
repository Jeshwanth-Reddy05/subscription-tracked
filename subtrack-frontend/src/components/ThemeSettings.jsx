import { Sun, ShieldCheck, HelpCircle } from "lucide-react";
import * as styles from "../styles/common";

function ThemeSettings() {
  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 font-sans select-none space-y-5">
      <div className="border-b border-[#e8e8ed] pb-3">
        <h3 className={styles.subHeadingClass}>Visual Customization</h3>
        <p className={`${styles.mutedText} text-[11px] mt-0.5`}>Unified application visual standard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Light theme selector - Active */}
        <div className="border border-[#0066cc] p-4 bg-[#f5f5f7] rounded-2xl flex flex-col justify-between transition-all duration-200">
          <div className="flex justify-between items-center mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center border border-[#0066cc]/20">
              <Sun className="w-4 h-4" />
            </div>
            <ShieldCheck className="w-4.5 h-4.5 text-[#0066cc]" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#1d1d1f]">Apple Light</h4>
            <p className={`${styles.mutedText} text-[10px] mt-0.5 leading-normal`}>
              Clean visual margins, high legibility, and premium light aesthetics based strictly on common.js guidelines.
            </p>
          </div>
        </div>

        {/* Informative placeholder or legacy block */}
        <div className="border border-[#e8e8ed] p-4 rounded-2xl flex flex-col justify-between bg-white opacity-60">
          <div className="flex justify-between items-center mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6e6e73]/10 text-[#6e6e73] flex items-center justify-center border border-[#e8e8ed]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#6e6e73] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
              Standard
            </span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#6e6e73]">Other themes locked</h4>
            <p className={`${styles.mutedText} text-[10px] mt-0.5 leading-normal`}>
              Custom dark themes and neon effects are deprecated in favor of a single, premium layout.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-white border border-[#e8e8ed] rounded-2xl flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#a1a1a6] mt-0.5" />
        <p className={`${styles.mutedText} text-[10.5px] leading-relaxed font-normal`}>
          Theme preferences are locked to the unified Apple Light theme. This ensures a clean, minimalistic aesthetic and consistent rendering of dashboard analytics.
        </p>
      </div>
    </div>
  );
}

export default ThemeSettings;
