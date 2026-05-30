import { AlertCircle, X, Trash2, PauseCircle, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

function DeleteSubscriptionModal({ isOpen, subName, onConfirmDelete, onConfirmPause, onCancel, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans select-none">
      {/* Backdrop */}
      <div onClick={onCancel} className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity duration-300"></div>

      {/* Alert Box Container */}
      <div className="relative bg-white border border-[#e8e8ed] rounded-2xl w-full max-w-md mx-4 p-8 z-10">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center shrink-0 text-[#cc2f26]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className={styles.subHeadingClass}>
                Remove {subName}?
              </h3>
              <p className="text-[10px] font-semibold text-[#cc2f26] uppercase tracking-wider mt-0.5">Irreversible Action</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="space-y-4 mb-6">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-[#1d1d1f]">"{subName}"</span>? This will permanently delete its pricing logs, renewal histories, and dashboard statistics from your account.
          </p>

          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl">
            <p className="text-[11px] text-[#6e6e73] leading-relaxed">
              💡 <span className="font-semibold text-[#1d1d1f]">Pro-Tip:</span> Consider pausing (changing the status to <span className="underline font-semibold text-[#1d1d1f]">cancelled</span>) instead. This stops renewal reminders but preserves all historical cost stats in your analytics dashboards.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-[#e8e8ed]">
          <button
            type="button"
            onClick={onCancel}
            className={styles.secondaryBtn}
          >
            Cancel
          </button>

          {onConfirmPause && (
            <button
              type="button"
              disabled={loading}
              onClick={onConfirmPause}
              className="border border-[#ff9500]/20 bg-[#ff9500]/10 hover:bg-[#ff9500]/20 text-[#bf7000] font-semibold px-4 py-2 rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Pause Instead</span>
            </button>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={onConfirmDelete}
            className="bg-[#ff3b30] hover:bg-[#d62c23] text-white font-semibold px-5 py-2 rounded-full text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default DeleteSubscriptionModal;
