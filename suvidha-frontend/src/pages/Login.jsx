import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

const demoAccounts = [
  { label: "Super Admin", email: "superadmin@suvidha.gov.in", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Dept Admin", email: "dept@suvidha.gov.in", color: "bg-green-100 text-green-700 border-green-200" },
  { label: "Operator", email: "operator@suvidha.gov.in", color: "bg-blue-100 text-blue-700 border-blue-200" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (email) => {
    setForm({ email, password: "Admin@123" });
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)" }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-xl tracking-wide">SUVIDHA</p>
            <p className="text-blue-200 text-xs">e-Governance Portal</p>
          </div>
        </div>

        {/* Middle: Hero text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            सुविधा /<br />Admin Portal
          </h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-sm">
            Centralized command & monitoring system for all deployed SUVIDHA kiosks across India.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {[
              "Real-time kiosk fleet monitoring",
              "Transaction & revenue management",
              "Complaint resolution tracking",
              "Department-level analytics",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <p className="text-blue-100 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <p className="relative z-10 text-blue-300 text-xs">
          Government of India &nbsp;·&nbsp; Secure & Verified &nbsp;·&nbsp; Ministry of Electronics & IT
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">SUVIDHA Admin</p>
              <p className="text-slate-400 text-xs">e-Governance Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in with your authorized credentials</p>

          {/* Demo accounts */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 font-medium mb-2">Quick demo access:</p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc.email)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all hover:scale-105 ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">Password for all: <code className="bg-slate-100 px-1 rounded">Admin@123</code></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@suvidha.gov.in"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In to Admin Portal"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            Authorized personnel only &nbsp;·&nbsp; All activity is monitored and logged
          </p>
        </div>
      </div>
    </div>
  );
}
