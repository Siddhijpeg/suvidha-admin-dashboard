import { useState } from "react";
import { Search, X, AlertCircle, MessageSquareWarning, CheckCircle2, Clock4, ArrowUpCircle, ChevronDown, User, RefreshCw } from "lucide-react";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import { useApi, useMutation } from "../hooks/useApi";
import { complaintService } from "../services/complaintService";
import { useToast } from "../context/ToastContext";

const MOCK_COMPLAINTS = [
  { _id:"c1", complaintId:"CMP-441", dept:"Electricity", category:"Bill amount mismatch",      account:"EL123456789", status:"open",        assignedTo:"",           kiosk:"KSK-001", createdAt:new Date(Date.now()-600000).toISOString(),  resolution:"",                      priority:"high"   },
  { _id:"c2", complaintId:"CMP-440", dept:"Water",       category:"Payment not reflected",      account:"WA987654321", status:"resolved",     assignedTo:"Priya Singh",kiosk:"KSK-002", createdAt:new Date(Date.now()-3600000).toISOString(),  resolution:"Payment manually confirmed", priority:"medium" },
  { _id:"c3", complaintId:"CMP-439", dept:"Gas",         category:"Receipt not printed",        account:"GA556677889", status:"in_progress",  assignedTo:"Amit Jha",   kiosk:"KSK-007", createdAt:new Date(Date.now()-7200000).toISOString(),  resolution:"",                      priority:"low"    },
  { _id:"c4", complaintId:"CMP-438", dept:"Municipal",   category:"Wrong service charged",      account:"MU112233445", status:"open",         assignedTo:"",           kiosk:"KSK-013", createdAt:new Date(Date.now()-86400000).toISOString(), resolution:"",                      priority:"high"   },
  { _id:"c5", complaintId:"CMP-437", dept:"Electricity", category:"Session timeout during pay", account:"EL998877665", status:"closed",       assignedTo:"Ravi Kumar", kiosk:"KSK-022", createdAt:new Date(Date.now()-172800000).toISOString(),resolution:"Refund initiated",       priority:"medium" },
  { _id:"c6", complaintId:"CMP-436", dept:"Water",       category:"Account not linked",         account:"WA112233445", status:"escalated",    assignedTo:"",           kiosk:"KSK-031", createdAt:new Date(Date.now()-259200000).toISOString(),resolution:"",                      priority:"high"   },
];

const OPERATORS = ["Ravi Kumar","Priya Singh","Amit Jha","Sunita Rao","Deepak Verma"];

const STATUS_FLOW = ["open","in_progress","resolved","closed"];

const statusStyles = {
  open:        "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  in_progress: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
  resolved:    "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  closed:      "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400",
  escalated:   "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
};

const priorityStyles = {
  high:   "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  low:    "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400",
};

function timeAgo(iso) {
  const diff = (Date.now()-new Date(iso))/1000;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// ── Manage Complaint Modal ──────────────────────────────────────────────────────
function ManageModal({ complaint, open, onClose, onSave }) {
  const toast = useToast();
  const [status, setStatus]     = useState(complaint?.status || "open");
  const [assignedTo, setAssigned] = useState(complaint?.assignedTo || "");
  const [resolution, setResolution] = useState(complaint?.resolution || "");
  const [loading, setLoading]   = useState(false);

  if (!complaint) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await complaintService.updateStatus(complaint._id, status, resolution).catch(()=>null);
      if (assignedTo && assignedTo !== complaint.assignedTo) {
        await complaintService.assign(complaint._id, assignedTo).catch(()=>null);
      }
      toast("Complaint updated successfully","success");
      onSave({ ...complaint, status, assignedTo, resolution });
      onClose();
    } catch { toast("Failed to update complaint","error"); }
    finally { setLoading(false); }
  };

  const handleEscalate = async () => {
    setLoading(true);
    try {
      await complaintService.escalate(complaint._id).catch(()=>null);
      toast("Complaint escalated","warning");
      onSave({ ...complaint, status:"escalated" });
      onClose();
    } catch { toast("Failed to escalate","error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Manage ${complaint.complaintId}`} size="md">
      <div className="space-y-4">
        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          {[["Department",complaint.dept],["Category",complaint.category],["Account",complaint.account],["Kiosk",complaint.kiosk],["Raised",timeAgo(complaint.createdAt)],["Priority",complaint.priority]].map(([l,v])=>(
            <div key={l} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-[11px] text-slate-400 mb-0.5">{l}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">{v}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Update Status</label>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FLOW.map(s=>(
              <button key={s} onClick={()=>setStatus(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${status===s?"bg-blue-600 text-white border-blue-600":"border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600"}`}>
                {s.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>

        {/* Assign */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assign To</label>
          <select value={assignedTo} onChange={e=>setAssigned(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Unassigned —</option>
            {OPERATORS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Resolution notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Resolution Notes</label>
          <textarea value={resolution} onChange={e=>setResolution(e.target.value)} rows={3} placeholder="Add resolution details or remarks..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"/>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={handleEscalate} disabled={loading||complaint.status==="escalated"} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40">
            <ArrowUpCircle size={14}/> Escalate
          </button>
          <div className="flex-1"/>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 shadow-md shadow-blue-600/20">
            {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</span>:"Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Complaints() {
  const toast = useToast();
  const { data:apiData, loading, error, refetch } = useApi(
    ()=>complaintService.getAll().catch(()=>({complaints:MOCK_COMPLAINTS})),[]
  );

  const [complaints, setComplaints] = useState(null);
  const data = complaints || apiData?.complaints || MOCK_COMPLAINTS;

  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [deptF, setDeptF]       = useState("all");
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const depts = [...new Set(data.map(c=>c.dept))];
  const filtered = data.filter(c=>{
    const ms = c.complaintId.toLowerCase().includes(search.toLowerCase())||c.category.toLowerCase().includes(search.toLowerCase())||c.account.includes(search);
    return ms && (statusF==="all"||c.status===statusF) && (deptF==="all"||c.dept===deptF);
  });

  const counts = {
    total: data.length,
    open: data.filter(c=>c.status==="open").length,
    inProgress: data.filter(c=>c.status==="in_progress").length,
    escalated: data.filter(c=>c.status==="escalated").length,
    resolved: data.filter(c=>c.status==="resolved"||c.status==="closed").length,
  };

  const handleSave = (updated) => {
    setComplaints(prev=>(prev||data).map(c=>c._id===updated._id?updated:c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Complaint Management</h2>
        <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
          <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          [MessageSquareWarning,"Total",      counts.total,      "text-blue-600",   "bg-blue-50 dark:bg-blue-500/10"],
          [Clock4,              "Open",        counts.open,       "text-orange-500", "bg-orange-50 dark:bg-orange-500/10"],
          [ArrowUpCircle,       "In Progress", counts.inProgress, "text-yellow-600", "bg-yellow-50 dark:bg-yellow-500/10"],
          [AlertCircle,         "Escalated",   counts.escalated,  "text-red-600",    "bg-red-50 dark:bg-red-500/10"],
          [CheckCircle2,        "Resolved",    counts.resolved,   "text-green-600",  "bg-green-50 dark:bg-green-500/10"],
        ].map(([Icon,l,v,c,bg])=>(
          <Card key={l}>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}><Icon size={16} className={c}/></div>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ID, category, account..." className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"/>
            {search && <button onClick={()=>setSearch("")}><X size={13} className="text-slate-400"/></button>}
          </div>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Status</option>
            {["open","in_progress","escalated","resolved","closed"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
          </select>
          <select value={deptF} onChange={e=>setDeptF(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Departments</option>
            {depts.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      {loading ? <Loader text="Loading complaints..."/> : error ? (
        <Card><div className="flex items-center gap-2 text-red-500"><AlertCircle size={16}/><p className="text-sm">{error}</p></div></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
                  {["ID","Department","Category","Account","Priority","Status","Assigned To","Raised","Actions"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c,i)=>(
                  <tr key={c._id} className={`border-t border-slate-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/3 transition-colors ${i%2===1?"bg-slate-50/30 dark:bg-white/[0.01]":""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{c.complaintId}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 font-medium">{c.dept}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{c.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{c.account}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityStyles[c.priority]}`}>{c.priority}</span></td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[c.status]}`}>{c.status.replace("_"," ")}</span></td>
                    <td className="px-4 py-3">
                      {c.assignedTo ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400"><User size={11}/>{c.assignedTo}</div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>{setSelected(c);setModalOpen(true);}} className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <p className="text-center py-12 text-slate-400 text-sm">No complaints match your filters.</p>}
          </div>
        </Card>
      )}

      <ManageModal complaint={selected} open={modalOpen} onClose={()=>setModalOpen(false)} onSave={handleSave}/>
    </div>
  );
}
