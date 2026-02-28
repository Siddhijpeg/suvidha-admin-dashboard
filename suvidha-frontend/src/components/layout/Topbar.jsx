import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { useState } from "react";

const routeLabels = {
  "/dashboard": "Dashboard",
  "/kiosks": "Kiosk Fleet Management",
  "/transactions": "Transactions & Revenue",
  "/complaints": "Complaint Management",
  "/departments": "Departments & Services",
  "/analytics": "Analytics & Reports",
  "/settings": "System Settings",
};

const mockNotifications = [
  { id: 1, text: "Kiosk #KSK-007 went offline", time: "2 min ago", type: "warning" },
  { id: 2, text: "3 new complaints raised today", time: "15 min ago", type: "info" },
  { id: 3, text: "Payment gateway error detected", time: "1 hr ago", type: "error" },
];

export default function Topbar() {
  const { darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const label = routeLabels[location.pathname] || "SUVIDHA Admin";

  const notifColors = {
    warning: "bg-orange-400",
    info: "bg-blue-400",
    error: "bg-red-400",
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#131f2e] border-b border-slate-200 dark:border-white/10 z-20 flex-shrink-0">
      {/* Left: Page title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white">{label}</h1>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          SUVIDHA Admin Portal &nbsp;·&nbsp; Government of India
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 w-52">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
          title="Toggle theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all relative"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#131f2e]" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white dark:bg-[#1a2942] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
              </div>
              {mockNotifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-slate-50 dark:border-white/5 last:border-0"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifColors[n.type]}`} />
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">Live</span>
        </div>
      </div>
    </header>
  );
}
