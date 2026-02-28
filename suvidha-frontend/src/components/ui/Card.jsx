export default function Card({ children, className = "", padding = true }) {
  return (
    <div
      className={`bg-white dark:bg-[#131f2e] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm ${
        padding ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
