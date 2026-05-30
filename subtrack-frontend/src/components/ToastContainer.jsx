import { useToastStore } from "../store/toastStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none font-sans">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error" || toast.type === "danger";
        
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border bg-white shadow-sm transition-all duration-300 animate-slideIn ${
              isSuccess
                ? "border-[#34c759]/20 text-[#248a3d]"
                : isError
                ? "border-[#ff3b30]/20 text-[#cc2f26]"
                : "border-[#0066cc]/20 text-[#0066cc]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess ? (
                <CheckCircle className="w-4 h-4 text-[#34c759]" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-[#ff3b30]" />
              ) : (
                <Info className="w-4 h-4 text-[#0066cc]" />
              )}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded-full hover:bg-black/5 transition text-[#a1a1a6] hover:text-[#1d1d1f] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
