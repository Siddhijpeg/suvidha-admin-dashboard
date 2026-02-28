import { useState } from "react";
import { Download, TrendingUp, TrendingDown, RefreshCw, BarChart2, PieChart } from "lucide-react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import { useApi } from "../hooks/useApi";
import { analyticsService } from "../services/analyticsService";

// ── Mock data generator ────────────────────────────────────────────────────────
function genData(range) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const labels = Array.from({length:days},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-days+i+1);
    return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
  });
  const revenue  = labels.map(()=>Math.floor(Math.random()*40000+15000));
  const txns     = labels.map(()=>Math.floor(Math.random()*300+100));
  return {labels,revenue,txns};
}

const MOCK_OVERVIEW = { totalRevenue:312480, totalTxns:1284, avgSession:"3m 42s", conversionRate:94.8, dropOffRate:5.2, repeatRate:31, failureRate:1.8 };
const MOCK_DEPT = [
  { name:"Electricity", txns:512, revenue:128400, complaints:6, successRate:97.2, color:"#f97316" },
  { name:"Water",       txns:287, revenue:43050,  complaints:3, successRate:99.0, color:"#3b82f6" },
  { name:"Gas",         txns:198, revenue:39600,  complaints:4, successRate:95.8, color:"#ef4444" },
  { name:"Municipal",   txns:287, revenue:100450, complaints:1, successRate:98.6, color:"#6366f1" },
];
const MOCK_PEAK = [
  {hour:"8–9 AM",count:89},{hour:"9–10",count:143},{hour:"10–11",count:187},{hour:"11–12",count:221},
  {hour:"12–1 PM",count:98},{hour:"1–2",count:76},{hour:"2–3",count:156},{hour:"3–4",count:203},
  {hour:"4–5",count:256},{hour:"5–6",count:178},{hour:"6–7 PM",count:134},
];
const MOCK_LANG = [{lang:"Hindi",pct:42},{lang:"English",pct:28},{lang:"Tamil",pct:11},{lang:"Telugu",pct:9},{lang:"Marathi",pct:10}];

// ── SVG Line Chart ─────────────────────────────────────────────────────────────
function LineChart({ labels, values, color="#2563eb", height=160 }) {
  if (!values?.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const W = 800, H = height;
  const pad = { top:16, bottom:28, left:48, right:16 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const pts = values.map((v,i)=>`${pad.left + (i/(values.length-1))*iw},${pad.top + (1-(v-min)/range)*ih}`);
  const area = `M${pts[0]} ${pts.slice(1).map(p=>`L${p}`).join(" ")} L${pad.left+iw},${pad.top+ih} L${pad.left},${pad.top+ih} Z`;
  const line = `M${pts[0]} ${pts.slice(1).map(p=>`L${p}`).join(" ")}`;

  // Y axis labels
  const yTicks = [min, min+range*0.5, max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height}}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0,0.25,0.5,0.75,1].map(f=>(
        <line key={f} x1={pad.left} y1={pad.top+ih*f} x2={pad.left+iw} y2={pad.top+ih*f} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1"/>
      ))}
      {/* Y labels */}
      {yTicks.map((v,i)=>(
        <text key={i} x={pad.left-6} y={pad.top + ih*(1-(v-min)/range)+4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.45">
          {v>=1000?`${(v/1000).toFixed(0)}k`:v}
        </text>
      ))}
      {/* Area */}
      <path d={area} fill={`url(#grad-${color.replace("#","")})`}/>
      {/* Line */}
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots */}
      {pts.map((p,i)=>{
        const [x,y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="white" strokeWidth="1.5"/>;
      })}
      {/* X labels — show every nth */}
      {labels.map((l,i)=>{
        const step = Math.max(1,Math.floor(labels.length/7));
        if(i%step!==0 && i!==labels.length-1) return null;
        const x = pad.left + (i/(labels.length-1))*iw;
        return <text key={i} x={x} y={H-4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">{l}</text>;
      })}
    </svg>
  );
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────────
function BarChart({ labels, values, color="#2563eb", height=140 }) {
  if (!values?.length) return null;
  const max = Math.max(...values);
  const W = 800, H = height;
  const pad = { top:8, bottom:24, left:8, right:8 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const bw = iw / values.length;
  const gap = bw * 0.3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height}}>
      {values.map((v,i)=>{
        const bh = (v/max)*ih;
        const x  = pad.left + i*bw + gap/2;
        const y  = pad.top + ih - bh;
        const isLast = i === values.length-1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw-gap} height={bh} rx="3" fill={isLast ? color : color+"88"}/>
            {labels && <text x={x+(bw-gap)/2} y={H-4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s,d)=>s+d.pct,0);
  let offset = 0;
  const cx=80,cy=80,r=60,stroke=22;
  const circ = 2*Math.PI*r;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((d,i)=>{
          const dash = (d.pct/total)*circ;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset*(circ/total)}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += d.pct;
          return seg;
        })}
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">{total}%</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.5">coverage</text>
      </svg>
      <div className="flex flex-col gap-2">
        {data.map(d=>(
          <div key={d.lang} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{backgroundColor:d.color}}/>
            <span className="text-xs text-slate-600 dark:text-slate-400">{d.lang}</span>
            <span className="text-xs font-bold text-slate-800 dark:text-white ml-auto pl-4">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat row ───────────────────────────────────────────────────────────────────
function StatRow({ label, value, trend, up }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/8 last:border-0">
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
        {trend && (
          <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${up?"text-green-600 dark:text-green-400":"text-red-500"}`}>
            {up ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}{trend}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [range, setRange] = useState("7d");

  const chartData = genData(range);
  const overview  = MOCK_OVERVIEW;

  const langColors = ["#2563eb","#16a34a","#f97316","#8b5cf6","#06b6d4"];
  const langData   = MOCK_LANG.map((l,i)=>({...l,color:langColors[i]}));

  const maxPeak = Math.max(...MOCK_PEAK.map(p=>p.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Analytics & Reports</h2>
        <div className="flex gap-2">
          {["7d","30d","90d"].map(r=>(
            <button key={r} onClick={()=>setRange(r)} className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${range===r?"bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20":"border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 bg-white dark:bg-white/5"}`}>
              {r==="7d"?"Last 7 days":r==="30d"?"Last 30 days":"Last 90 days"}
            </button>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-white/5">
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Revenue",   `₹${(overview.totalRevenue/1000).toFixed(1)}k`, "+7%",  true,  "text-blue-600",   "bg-blue-50 dark:bg-blue-500/10"],
          ["Total Txns",      overview.totalTxns.toLocaleString(),            "+12%", true,  "text-green-600",  "bg-green-50 dark:bg-green-500/10"],
          ["Conversion Rate", `${overview.conversionRate}%`,                  "+2%",  true,  "text-purple-600", "bg-purple-50 dark:bg-purple-500/10"],
          ["Failure Rate",    `${overview.failureRate}%`,                     "-0.5%",true,  "text-red-500",    "bg-red-50 dark:bg-red-500/10"],
        ].map(([l,v,t,up,c,bg])=>(
          <Card key={l}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <BarChart2 size={17} className={c}/>
            </div>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{l}</p>
            <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${up?"text-green-600 dark:text-green-400":"text-red-500"}`}>
              {up?<TrendingUp size={10}/>:<TrendingDown size={10}/>}{t} vs prev period
            </span>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Revenue Trend</p>
            <p className="text-xs text-slate-400 mt-0.5">Daily revenue for the selected period</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold border border-green-100 dark:border-green-500/20">↑ 7% this period</span>
        </div>
        <LineChart labels={chartData.labels} values={chartData.revenue} color="#2563eb" height={180}/>
      </Card>

      {/* Transactions chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Transaction Volume</p>
            <p className="text-xs text-slate-400 mt-0.5">Daily transactions for the selected period</p>
          </div>
        </div>
        <BarChart labels={chartData.labels} values={chartData.txns} color="#16a34a" height={140}/>
      </Card>

      {/* Department table + Peak hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding={false}>
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
            <p className="font-bold text-slate-800 dark:text-white">Department Performance</p>
          </div>
          <div className="p-5 space-y-3">
            {MOCK_DEPT.map(d=>(
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor:d.color}}/>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{d.name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{d.txns} txns</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{(d.revenue/1000).toFixed(0)}k</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{d.successRate}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width:`${d.successRate}%`,backgroundColor:d.color}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak hours */}
        <Card>
          <p className="font-bold text-slate-800 dark:text-white mb-4">Peak Usage Hours</p>
          <div className="space-y-2">
            {MOCK_PEAK.map(p=>(
              <div key={p.hour} className="flex items-center gap-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">{p.hour}</p>
                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-full h-3.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${p.count===maxPeak?"bg-blue-600":"bg-blue-400"}`} style={{width:`${(p.count/maxPeak)*100}%`}}/>
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{p.count}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row: Language + Behavioral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="font-bold text-slate-800 dark:text-white mb-4">Language Distribution</p>
          <DonutChart data={langData}/>
        </Card>
        <Card>
          <p className="font-bold text-slate-800 dark:text-white mb-2">Behavioral Metrics</p>
          <div>
            <StatRow label="Avg Session Duration"  value={overview.avgSession}       trend="+8s"   up={true}  />
            <StatRow label="Payment Conversion"    value={`${overview.conversionRate}%`} trend="+2%"up={true}  />
            <StatRow label="Drop-off Rate"         value={`${overview.dropOffRate}%`} trend="-1%"  up={true}  />
            <StatRow label="Repeat User Rate"      value={`${overview.repeatRate}%`}  trend="+3%"  up={true}  />
            <StatRow label="Payment Failure Rate"  value={`${overview.failureRate}%`} trend="-0.5%" up={true} />
            <StatRow label="Most Common Complaint" value="Bill Mismatch"                                      />
            <StatRow label="Most Abandoned Step"   value="OTP Verification"                                   />
          </div>
        </Card>
      </div>
    </div>
  );
}
