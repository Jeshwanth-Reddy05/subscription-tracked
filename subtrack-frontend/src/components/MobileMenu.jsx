import { useEffect } from "react";
import { X } from "lucide-react";

function MobileMenu({ isOpen, onClose, children }) {
  // Prevent body scroll when menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 shadow-2xl p-4 flex flex-col transition-transform duration-300 transform translate-x-0 border-r border-slate-200/50 dark:border-zinc-800/80">
        {/* Close Button Header */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Children (Sidebar content) */}
        <div className="flex-1 overflow-y-auto" onClick={onClose}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
