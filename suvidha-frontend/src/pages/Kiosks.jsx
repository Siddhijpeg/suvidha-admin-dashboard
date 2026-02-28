import { useState, useCallback } from "react";
import {
  Monitor, MapPin, Power, RefreshCw, LogOut, Wrench, Upload,
  Search, X, AlertCircle, Activity, Clock, Eye, Globe
} from "lucide-react";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import { useApi } from "../hooks/useApi";
import { kioskService } from "../services/kioskService";
import { useToast } from "../context/ToastContext";

const MOCK_KIOSKS = [
  { _id:"k1", kioskId:"KSK-001", location:"Delhi Zone-A",    city:"New Delhi",  state:"Delhi",        ip:"192.168.1.101", status:"online",      uptime:99.2, currentSession:"Active",  printerStatus:"ok",    networkStatus:"ok",   lastOnline:new Date().toISOString(),              softwareVersion:"v2.4.1", totalSessions:1842, todaySessions:23 },
  { _id:"k2", kioskId:"KSK-002", location:"Delhi Zone-B",    city:"New Delhi",  state:"Delhi",        ip:"192.168.1.102", status:"online",      uptime:98.7, currentSession:"Idle",    printerStatus:"ok",    networkStatus:"ok",   lastOnline:new Date(Date.now()-60000).toISOString(), softwareVersion:"v2.4.1", totalSessions:1620, todaySessions:18 },
  { _id:"k3", kioskId:"KSK-007", location:"Mumbai Central",  city:"Mumbai",     state:"Maharashtra",  ip:"192.168.2.107", status:"offline",     uptime:87.3, currentSession:"None",    printerStatus:"error", networkStatus:"down", lastOnline:new Date(Date.now()-720000).toISOString(),softwareVersion:"v2.3.8", totalSessions:980,  todaySessions:0  },
  { _id:"k4", kioskId:"KSK-013", location:"Chennai South",   city:"Chennai",    state:"Tamil Nadu",   ip:"192.168.3.113", status:"maintenance", uptime:94.1, currentSession:"None",    printerStatus:"ok",    networkStatus:"ok",   lastOnline:new Date(Date.now()-3600000).toISOString(),softwareVersion:"v2.4.0", totalSessions:1340, todaySessions:0  },
  { _id:"k5", kioskId:"KSK-022", location:"Pune East",       city:"Pune",       state:"Maharashtra",  ip:"192.168.4.122", status:"online",      uptime:99.8, currentSession:"Active",  printerStatus:"ok",    networkStatus:"ok",   lastOnline:new Date().toISOString(),              softwareVersion:"v2.4.1", totalSessions:2105, todaySessions:31 },
  { _id:"k6", kioskId:"KSK-031", location:"Hyderabad West",  city:"Hyderabad",  state:"Telangana",    ip:"192.168.5.131", status:"online",      uptime:97.4, currentSession:"Idle",    printerStatus:"ok",    networkStatus:"ok",   lastOnline:new Date(Date.now()-120000).toISOString(),softwareVersion:"v2.4.1", totalSessions:1755, todaySessions:19 },
];

const statusStyles = {
  online:      "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  offline:     "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
  maintenance: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
};
const statusDot = { online:"bg-green-500", offline:"bg-red-500", maintenance:"bg-orange-400" };

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />{status}
    </span>
  );
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function ConfirmModal({ open, onClose, onConfirm, title, message, danger, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className={`px-4 py-2 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing...</span> : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

function KioskDetailModal({ kiosk, open, onClose, onAction }) {
  if (!kiosk) return null;
  const remoteActions = [
    { label:"Force Logout", icon:LogOut,    action:"force-logout", danger:true,  disabled: kiosk.currentSession === "None" },
    { label:"Enable",       icon:Power,     action:"enable",       danger:false, show: kiosk.status !== "online" },
    { label:"Disable",      icon:Power,     action:"disable",      danger:true,  show: kiosk.status === "online" },
    { label:"Maintenance",  icon:Wrench,    action:"maintenance",  danger:false, show: kiosk.status !== "maintenance" },
    { label:"Restart",      icon:RefreshCw, action:"restart",      danger:true  },
    { label:"Push Update",  icon:Upload,    action:"push-update",  danger:false },
  ].filter(a => a.show !== false);

  return (
    <Modal open={open} onClose={onClose} title={`${kiosk.kioskId} — ${kiosk.location}`} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={kiosk.status} />
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${kiosk.printerStatus==="ok"?"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400":"bg-red-100 dark:bg-red-500/10 text-red-500"}`}>
            🖨 Printer: {kiosk.printerStatus==="ok"?"OK":"Error"}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${kiosk.networkStatus==="ok"?"bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400":"bg-red-100 dark:bg-red-500/10 text-red-500"}`}>
            🌐 Network: {kiosk.networkStatus==="ok"?"Connected":"Down"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[["IP Address",kiosk.ip,Globe],["Last Online",timeAgo(kiosk.lastOnline),Clock],["Uptime",`${kiosk.uptime}%`,Activity],["Software",kiosk.softwareVersion,Upload],["Total Sessions",kiosk.totalSessions.toLocaleString(),Monitor],["Today's Sessions",kiosk.todaySessions,Activity]].map(([label,value,Icon])=>(
            <div key={label} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><Icon size={11} className="text-slate-400"/><p className="text-[11px] text-slate-400">{label}</p></div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Remote Controls</p>
          <div className="grid grid-cols-2 gap-2">
            {remoteActions.map(({label,icon:Icon,action,danger,disabled})=>(
              <button key={action} disabled={disabled} onClick={()=>onAction(kiosk,action)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${danger?"bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-500/20":"bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-white/10"}`}>
                <Icon size={13}/>{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Kiosks() {
  const toast = useToast();
  const { data:apiData, loading, error, refetch } = useApi(()=>kioskService.getAll().catch(()=>({kiosks:MOCK_KIOSKS})),[]);
  const kiosks = apiData?.kiosks || MOCK_KIOSKS;

  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("all");
  const [cityF, setCityF]     = useState("all");
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const cities = [...new Set(kiosks.map(k=>k.city))];
  const filtered = kiosks.filter(k=>{
    const ms = k.kioskId.toLowerCase().includes(search.toLowerCase())||k.location.toLowerCase().includes(search.toLowerCase())||k.city.toLowerCase().includes(search.toLowerCase());
    return ms && (statusF==="all"||k.status===statusF) && (cityF==="all"||k.city===cityF);
  });

  const counts = { total:kiosks.length, online:kiosks.filter(k=>k.status==="online").length, offline:kiosks.filter(k=>k.status==="offline").length, maintenance:kiosks.filter(k=>k.status==="maintenance").length };

  const handleAction = useCallback((kiosk, action)=>{
    const map = {
      "enable":       { label:`Enable ${kiosk.kioskId}?`,           message:"This will bring the kiosk back online.",                   danger:false },
      "disable":      { label:`Disable ${kiosk.kioskId}?`,          message:"Citizens will not be able to use this kiosk.",             danger:true  },
      "force-logout": { label:`Force logout ${kiosk.kioskId}?`,     message:"The active citizen session will be immediately terminated.",danger:true  },
      "maintenance":  { label:`Set ${kiosk.kioskId} to maintenance?`,message:"Kiosk will show a maintenance screen to citizens.",       danger:false },
      "restart":      { label:`Restart ${kiosk.kioskId}?`,          message:"The kiosk will restart and current session will be lost.",  danger:true  },
      "push-update":  { label:`Push update to ${kiosk.kioskId}?`,   message:"The latest software version will be deployed.",            danger:false },
    };
    setDetailOpen(false);
    setConfirm({kiosk, action, ...map[action]});
  },[]);

  const executeAction = async ()=>{
    if(!confirm) return;
    setActionLoading(true);
    try {
      const {kiosk,action} = confirm;
      const svcMap = { "enable":()=>kioskService.enable(kiosk._id), "disable":()=>kioskService.disable(kiosk._id), "force-logout":()=>kioskService.forceLogout(kiosk._id), "maintenance":()=>kioskService.setMaintenance(kiosk._id), "restart":()=>kioskService.restart(kiosk._id), "push-update":()=>kioskService.pushUpdate(kiosk._id,{}) };
      await svcMap[action]().catch(()=>null);
      toast(`✓ "${action}" executed on ${kiosk.kioskId}`,"success");
      refetch();
    } catch { toast("Action failed. Try again.","error"); }
    finally { setActionLoading(false); setConfirm(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Kiosk Fleet Management</h2>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
          <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["Total",counts.total,"text-blue-600","bg-blue-50 dark:bg-blue-500/10"],["Online",counts.online,"text-green-600","bg-green-50 dark:bg-green-500/10"],["Offline",counts.offline,"text-red-500","bg-red-50 dark:bg-red-500/10"],["Maintenance",counts.maintenance,"text-orange-500","bg-orange-50 dark:bg-orange-500/10"]].map(([l,v,c,bg])=>(
          <Card key={l}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Monitor size={17} className={c}/></div>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{l} Kiosks</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID, location, city..." className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"/>
            {search && <button onClick={()=>setSearch("")}><X size={13} className="text-slate-400"/></button>}
          </div>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Status</option><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option>
          </select>
          <select value={cityF} onChange={e=>setCityF(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Cities</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <Loader text="Loading kiosks..."/> : error ? (
        <Card><div className="flex items-center gap-2 text-red-500"><AlertCircle size={16}/><p className="text-sm">{error}</p></div></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
                  {["Kiosk ID","Location","Status","Uptime","Session","Printer","Network","Last Seen","Version","Actions"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((k,i)=>(
                  <tr key={k._id} className={`border-t border-slate-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/3 transition-colors ${i%2===1?"bg-slate-50/30 dark:bg-white/[0.01]":""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{k.kioskId}</td>
                    <td className="px-4 py-3"><div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"><MapPin size={10} className="text-slate-400"/>{k.location}</div><p className="text-[11px] text-slate-400 ml-3.5">{k.city}</p></td>
                    <td className="px-4 py-3"><StatusBadge status={k.status}/></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"><div className={`h-full rounded-full ${k.uptime>95?"bg-green-500":k.uptime>85?"bg-orange-400":"bg-red-400"}`} style={{width:`${k.uptime}%`}}/></div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{k.uptime}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium ${k.currentSession==="Active"?"text-green-600 dark:text-green-400":"text-slate-400"}`}>{k.currentSession}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold ${k.printerStatus==="ok"?"text-green-600 dark:text-green-400":"text-red-500"}`}>{k.printerStatus==="ok"?"✓ OK":"✗ Err"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold ${k.networkStatus==="ok"?"text-green-600 dark:text-green-400":"text-red-500"}`}>{k.networkStatus==="ok"?"✓ OK":"✗ Down"}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{timeAgo(k.lastOnline)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{k.softwareVersion}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>{setSelected(k);setDetailOpen(true);}} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title="View Details"><Eye size={13}/></button>
                        <button onClick={()=>handleAction(k,k.status==="online"?"disable":"enable")} className={`p-1.5 rounded-lg transition-colors ${k.status==="online"?"bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100":"bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100"}`} title={k.status==="online"?"Disable":"Enable"}><Power size={13}/></button>
                        <button onClick={()=>handleAction(k,"restart")} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors" title="Restart"><RefreshCw size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <p className="text-center py-12 text-slate-400 text-sm">No kiosks match your filters.</p>}
          </div>
        </Card>
      )}

      <KioskDetailModal kiosk={selected} open={detailOpen} onClose={()=>setDetailOpen(false)} onAction={handleAction}/>
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={executeAction} title={confirm?.label||""} message={confirm?.message||""} danger={confirm?.danger} loading={actionLoading}/>
    </div>
  );
}
