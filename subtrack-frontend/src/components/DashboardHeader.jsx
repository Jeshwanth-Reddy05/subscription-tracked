import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Plus, Search, CalendarDays } from "lucide-react";

function DashboardHeader({ onAddClick, onSearchChange }) {
  const user = useAuthStore((state) => state.user);
  const [greeting, setGreeting] = useState("Welcome");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Set greeting based on current hour
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Format current date
    const options = { weekday: "long", month: "short", day: "numeric" };
    setCurrentDate(new Date().toLocaleDateString(undefined, options));
  }, []);

  return (
    <header className="mb-8 font-sans flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
      {/* Greets & Date */}
      <div>
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 font-semibold text-[10px] uppercase tracking-wider">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{currentDate}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mt-1.5">
          {greeting}, <span className="text-blue-600 dark:text-blue-400">{user?.name?.split(" ")[0]}</span>
        </h2>
        <p className="text-slate-400 dark:text-zinc-550 text-xs mt-0.5 leading-relaxed">
          Here is your subscription intelligence overview for today.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3.5 self-start md:self-center w-full md:w-auto">
        {onSearchChange && (
          <div className="relative flex-1 md:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search subscription..."
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full md:w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
            />
          </div>
        )}

        {onAddClick && (
          <button
            onClick={onAddClick}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 flex items-center gap-1.5 text-xs cursor-pointer select-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default DashboardHeader;
