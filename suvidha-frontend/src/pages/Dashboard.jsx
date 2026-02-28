import { useState, useEffect } from "react";
import {
  Monitor, MonitorOff, Users, CreditCard, TrendingUp,
  MessageSquare, XCircle, Activity, ArrowUp, ArrowDown,
  RefreshCw, MapPin, Clock, Zap
} from "lucide-react";

// ─── Metric Card ──────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, trend, color, bgColor, pulse }) {
  const trendUp = trend > 0;
  return (
    <div className="bg-white dark:bg-[#131f2e] rounded-2xl p-5 border border-slate-200 dark:border-white/10 flex flex-col gap-3 hover:shadow-md dark:hover:shadow-black/30 transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor} relative`}>
          <Icon size={20} className={color} />
          {pulse && (
            <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#131f2e] animate-pulse" />
          )}
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              trendUp ? "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400"
                      : "text-red-500 bg-red-50 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {trendUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────
function MiniBar({ data, label, color = "#2563eb" }) {
  const max = Math.max(...data);
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex items-end gap-1 h-14">
        {data.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${(v / max) * 100}%`,
              backgroundColor: i === data.length - 1 ? color : color + "55",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    online:      "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
    offline:     "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    maintenance: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
    success:     "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
    failed:      "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    pending:     "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    open:        "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    resolved:    "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] || ""}`}>
      {status}
    </span>
  );
}

// ─── Mock Data ────────────────────────────────────────────────
const recentTransactions = [
  { id: "TXN-8821", dept: "Electricity", service: "Pay Bill", amount: "₹1,240", status: "success", kiosk: "Delhi-07", time: "2 min ago" },
  { id: "TXN-8820", dept: "Water", service: "View Bill", amount: "₹0", status: "success", kiosk: "Mumbai-03", time: "5 min ago" },
  { id: "TXN-8819", dept: "Gas", service: "Pay Bill", amount: "₹890", status: "failed", kiosk: "Chennai-01", time: "8 min ago" },
  { id: "TXN-8818", dept: "Municipal", service: "Tax Payment", amount: "₹3,500", status: "success", kiosk: "Pune-05", time: "12 min ago" },
  { id: "TXN-8817", dept: "Electricity", service: "Bill History", amount: "₹0", status: "pending", kiosk: "Hyderabad-02", time: "18 min ago" },
];

const recentComplaints = [
  { id: "CMP-441", dept: "Electricity", issue: "Bill amount mismatch", status: "open", time: "10 min ago" },
  { id: "CMP-440", dept: "Water", issue: "Payment not reflected", status: "resolved", time: "1 hr ago" },
  { id: "CMP-439", dept: "Gas", issue: "Receipt not printed", status: "open", time: "2 hr ago" },
];

const kioskAlerts = [
  { id: "KSK-007", location: "Delhi Zone-B", issue: "Printer offline", severity: "warning" },
  { id: "KSK-013", location: "Mumbai Central", issue: "Network timeout", severity: "error" },
  { id: "KSK-022", location: "Chennai South", issue: "Maintenance mode", severity: "info" },
];

const weeklyRevenue = [18500, 22000, 19800, 24500, 21000, 28000, 31500];
const weeklyTransactions = [120, 145, 132, 167, 140, 189, 201];

const severityColors = {
  warning: "border-l-orange-400 bg-orange-50 dark:bg-orange-500/5",
  error:   "border-l-red-400 bg-red-50 dark:bg-red-500/5",
  info:    "border-l-blue-400 bg-blue-50 dark:bg-blue-500/5",
};
const severityDot = {
  warning: "bg-orange-400",
  error:   "bg-red-400",
  info:    "bg-blue-400",
};

// ─── Dashboard Page ───────────────────────────────────────────
export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Live Overview</h2>
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Clock size={12} />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Monitor} label="Total Kiosks" value="48" sub="Across 12 cities" bgColor="bg-blue-50 dark:bg-blue-500/10" color="text-blue-600 dark:text-blue-400" trend={4} />
        <MetricCard icon={Activity} label="Active Kiosks" value="41" sub="7 offline / 2 maintenance" bgColor="bg-green-50 dark:bg-green-500/10" color="text-green-600 dark:text-green-400" pulse trend={2} />
        <MetricCard icon={Users} label="Active Sessions" value="127" sub="Right now" bgColor="bg-purple-50 dark:bg-purple-500/10" color="text-purple-600 dark:text-purple-400" trend={12} />
        <MetricCard icon={MonitorOff} label="Offline Kiosks" value="7" sub="2 in maintenance" bgColor="bg-red-50 dark:bg-red-500/10" color="text-red-500 dark:text-red-400" trend={-3} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={CreditCard} label="Transactions Today" value="1,284" sub="+201 in last hour" bgColor="bg-cyan-50 dark:bg-cyan-500/10" color="text-cyan-600 dark:text-cyan-400" trend={8} />
        <MetricCard icon={TrendingUp} label="Revenue Today" value="₹3.12L" sub="vs ₹2.89L yesterday" bgColor="bg-emerald-50 dark:bg-emerald-500/10" color="text-emerald-600 dark:text-emerald-400" trend={7} />
        <MetricCard icon={MessageSquare} label="Complaints Today" value="14" sub="9 open · 5 resolved" bgColor="bg-orange-50 dark:bg-orange-500/10" color="text-orange-600 dark:text-orange-400" trend={-5} />
        <MetricCard icon={XCircle} label="Failed Payments" value="23" sub="1.8% failure rate" bgColor="bg-rose-50 dark:bg-rose-500/10" color="text-rose-500 dark:text-rose-400" trend={-2} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131f2e] rounded-2xl p-5 border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-white">Revenue (Last 7 Days)</p>
              <p className="text-sm text-slate-400 mt-0.5">Total: ₹1,65,300</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold border border-green-100 dark:border-green-500/20">
              ↑ 7% this week
            </span>
          </div>
          <MiniBar data={weeklyRevenue} label="Daily Revenue (₹)" color="#2563eb" />
          <div className="flex justify-between mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <p key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</p>
            ))}
          </div>
        </div>

        {/* Transactions chart */}
        <div className="bg-white dark:bg-[#131f2e] rounded-2xl p-5 border border-slate-200 dark:border-white/10">
          <p className="text-base font-bold text-slate-800 dark:text-white mb-1">Transactions</p>
          <p className="text-sm text-slate-400 mb-4">Last 7 days</p>
          <MiniBar data={weeklyTransactions} label="Daily count" color="#16a34a" />
          <div className="flex justify-between mt-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <p key={i} className="text-[10px] text-slate-400 flex-1 text-center">{d}</p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-black text-green-600 dark:text-green-400">98.2%</p>
              <p className="text-[11px] text-slate-400">Success rate</p>
            </div>
            <div>
              <p className="text-lg font-black text-slate-800 dark:text-white">1,094</p>
              <p className="text-[11px] text-slate-400">Total this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131f2e] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <p className="font-bold text-slate-800 dark:text-white">Recent Transactions</p>
            <a href="/transactions" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
                  <th className="px-5 py-2.5 text-left font-semibold">TXN ID</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Dept</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Amount</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Status</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Kiosk</th>
                  <th className="px-5 py-2.5 text-left font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={`border-t border-slate-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/3 transition-colors ${
                      i % 2 === 0 ? "" : "bg-slate-50/30 dark:bg-white/[0.01]"
                    }`}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">{tx.id}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-300 text-xs">{tx.dept}</td>
                    <td className="px-3 py-3 font-bold text-slate-800 dark:text-white text-xs">{tx.amount}</td>
                    <td className="px-3 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1">
                      <MapPin size={10} />{tx.kiosk}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Alerts + Complaints */}
        <div className="flex flex-col gap-4">
          {/* Kiosk Alerts */}
          <div className="bg-white dark:bg-[#131f2e] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Zap size={15} className="text-orange-500" />
                Kiosk Alerts
              </p>
              <span className="text-xs bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">3</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {kioskAlerts.map((a) => (
                <div
                  key={a.id}
                  className={`border-l-4 rounded-r-xl px-3 py-2.5 ${severityColors[a.severity]}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDot[a.severity]}`} />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{a.id}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.location}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{a.issue}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="bg-white dark:bg-[#131f2e] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <p className="font-bold text-slate-800 dark:text-white">Complaints</p>
              <a href="/complaints" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View all →</a>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {recentComplaints.map((c) => (
                <div key={c.id} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/8 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{c.id}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{c.issue}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{c.dept} · {c.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
