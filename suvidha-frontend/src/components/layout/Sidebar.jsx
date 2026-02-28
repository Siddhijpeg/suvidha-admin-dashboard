import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Monitor,
  CreditCard,
  MessageSquare,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["super_admin", "department_admin", "operator"] },
  { to: "/kiosks", icon: Monitor, label: "Kiosk Fleet", roles: ["super_admin", "operator"] },
  { to: "/transactions", icon: CreditCard, label: "Transactions", roles: ["super_admin", "department_admin"] },
  { to: "/complaints", icon: MessageSquare, label: "Complaints", roles: ["super_admin", "department_admin", "operator"] },
  { to: "/departments", icon: Building2, label: "Departments", roles: ["super_admin"] },
  { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["super_admin", "department_admin"] },
  { to: "/settings", icon: Settings, label: "Settings", roles: ["super_admin"] },
];

const roleLabels = {
  super_admin: "Super Admin",
  department_admin: "Dept Admin",
  operator: "Operator",
};

const roleBadgeColors = {
  super_admin: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  department_admin: "bg-green-500/20 text-green-300 border border-green-500/30",
  operator: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filtered = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#0f1923] text-white transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{ boxShadow: "4px 0 20px rgba(0,0,0,0.3)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-base leading-tight tracking-wide">SUVIDHA</p>
            <p className="text-[11px] text-slate-400 leading-tight">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-400 truncate mb-2">{user?.email}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColors[user?.role]}`}>
            {roleLabels[user?.role]}
          </span>
        </div>
      )}

      {collapsed && (
        <div className="mx-2 mt-4 flex justify-center">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]}
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 mt-5 px-2 flex flex-col gap-1 overflow-y-auto">
        {filtered.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 transition-opacity z-50">
                    {label}
                  </div>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 group ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
