import { useState } from "react";
import { Plus, Pencil, Trash2, Search, X, AlertCircle, ChevronRight, ChevronDown, RefreshCw, DollarSign } from "lucide-react";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import { useApi } from "../hooks/useApi";
import { departmentService } from "../services/departmentService";
import { useToast } from "../context/ToastContext";

const MOCK_DEPTS = [
  { _id:"d1", name:"Electricity", icon:"⚡", color:"#f97316", enabled:true,  description:"Electricity billing and utility services", serviceHours:"24/7", services:[
    { _id:"s1", name:"View Current Bill",  fee:0,   enabled:true  },
    { _id:"s2", name:"Pay Bill",           fee:2.5, enabled:true  },
    { _id:"s3", name:"Bill History",       fee:0,   enabled:true  },
    { _id:"s4", name:"New Connection",     fee:50,  enabled:true  },
    { _id:"s5", name:"Raise Complaint",    fee:0,   enabled:true  },
    { _id:"s6", name:"Load Enhancement",  fee:100, enabled:false },
  ]},
  { _id:"d2", name:"Water", icon:"💧", color:"#3b82f6", enabled:true,  description:"Water supply, billing and connection services", serviceHours:"9 AM – 6 PM", services:[
    { _id:"s7",  name:"View Bill",       fee:0,  enabled:true  },
    { _id:"s8",  name:"Pay Bill",        fee:2.5,enabled:true  },
    { _id:"s9",  name:"New Connection",  fee:75, enabled:true  },
    { _id:"s10", name:"Raise Complaint", fee:0,  enabled:true  },
  ]},
  { _id:"d3", name:"Gas", icon:"🔥", color:"#ef4444", enabled:true,  description:"Gas connection, billing and safety services", serviceHours:"9 AM – 5 PM", services:[
    { _id:"s11", name:"Pay Bill",        fee:2.5, enabled:true  },
    { _id:"s12", name:"New Connection",  fee:100, enabled:true  },
    { _id:"s13", name:"Raise Complaint", fee:0,   enabled:true  },
  ]},
  { _id:"d4", name:"Municipal", icon:"🏛️", color:"#6366f1", enabled:true,  description:"Municipal corporation tax and civic services", serviceHours:"10 AM – 4 PM", services:[
    { _id:"s14", name:"Property Tax",    fee:2.5, enabled:true  },
    { _id:"s15", name:"Trade License",   fee:5,   enabled:true  },
    { _id:"s16", name:"Birth Certificate",fee:20, enabled:true  },
    { _id:"s17", name:"Raise Complaint", fee:0,   enabled:true  },
  ]},
  { _id:"d5", name:"Transport", icon:"🚌", color:"#10b981", enabled:false, description:"Vehicle registration and permit services", serviceHours:"10 AM – 3 PM", services:[
    { _id:"s18", name:"RC Status",         fee:0,  enabled:true  },
    { _id:"s19", name:"Driving License",   fee:0,  enabled:true  },
    { _id:"s20", name:"Vehicle Permit",    fee:10, enabled:false },
  ]},
];

const EMPTY_DEPT = { name:"", icon:"🏢", color:"#3b82f6", description:"", serviceHours:"9 AM – 5 PM", enabled:true };
const EMPTY_SERVICE = { name:"", fee:0, enabled:true };

// ── Department Form Modal ──────────────────────────────────────────────────────
function DeptModal({ open, onClose, initial, onSave }) {
  const toast = useToast();
  const [form, setForm] = useState(initial || EMPTY_DEPT);
  const [loading, setLoading] = useState(false);

  const isEdit = !!initial?._id;

  const handleSave = async () => {
    if (!form.name.trim()) return toast("Department name is required","warning");
    setLoading(true);
    try {
      const result = isEdit
        ? await departmentService.update(initial._id, form).catch(()=>({...initial,...form}))
        : await departmentService.create(form).catch(()=>({...form,_id:"d"+Date.now(),services:[]}));
      toast(`Department ${isEdit?"updated":"created"} successfully`,"success");
      onSave(result);
      onClose();
    } catch { toast("Failed to save department","error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit?"Edit Department":"Add Department"} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Department Name *</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Electricity" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Icon (emoji)</label>
            <input value={form.icon} onChange={e=>setForm({...form,icon:e.target.value})} placeholder="⚡" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Hours</label>
            <input value={form.serviceHours} onChange={e=>setForm({...form,serviceHours:e.target.value})} placeholder="9 AM – 5 PM" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"/>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} placeholder="Short description..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"/>
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status:</span>
            <button onClick={()=>setForm({...form,enabled:!form.enabled})} className={`relative w-11 h-6 rounded-full transition-all ${form.enabled?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.enabled?"left-5":"left-0.5"}`}/>
            </button>
            <span className={`text-sm font-semibold ${form.enabled?"text-green-600 dark:text-green-400":"text-red-500"}`}>{form.enabled?"Active":"Disabled"}</span>
          </div>
        </div>
        <div className="flex gap-2 pt-1 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-60 shadow-md shadow-blue-600/20">
            {loading?<span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</span>:"Save Department"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Service Form Modal ─────────────────────────────────────────────────────────
function ServiceModal({ open, onClose, deptId, initial, onSave }) {
  const toast = useToast();
  const [form, setForm] = useState(initial || EMPTY_SERVICE);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?._id;

  const handleSave = async () => {
    if (!form.name.trim()) return toast("Service name is required","warning");
    setLoading(true);
    try {
      const result = isEdit
        ? await departmentService.updateService(deptId, initial._id, form).catch(()=>({...initial,...form}))
        : await departmentService.createService(deptId, form).catch(()=>({...form,_id:"s"+Date.now()}));
      toast(`Service ${isEdit?"updated":"added"}`,"success");
      onSave(result, isEdit);
      onClose();
    } catch { toast("Failed to save service","error"); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit?"Edit Service":"Add Service"} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Name *</label>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Pay Bill" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Fee (₹)</label>
          <input type="number" value={form.fee} min={0} onChange={e=>setForm({...form,fee:+e.target.value})} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"/>
          <p className="text-[11px] text-slate-400 mt-1">Enter 0 for free services</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enabled:</span>
          <button onClick={()=>setForm({...form,enabled:!form.enabled})} className={`relative w-11 h-6 rounded-full transition-all ${form.enabled?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.enabled?"left-5":"left-0.5"}`}/>
          </button>
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold disabled:opacity-60">
            {loading?"Saving...":"Save Service"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Departments() {
  const toast = useToast();
  const { data:apiData, loading, error, refetch } = useApi(
    ()=>departmentService.getAll().catch(()=>({departments:MOCK_DEPTS})),[]
  );

  const [depts, setDepts]           = useState(null);
  const data                         = depts || apiData?.departments || MOCK_DEPTS;
  const [expanded, setExpanded]     = useState({});
  const [deptModal, setDeptModal]   = useState({ open:false, dept:null });
  const [svcModal, setSvcModal]     = useState({ open:false, deptId:null, service:null });
  const [search, setSearch]         = useState("");

  const filtered = data.filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));

  const toggleDept = async (dept) => {
    const fn = dept.enabled ? departmentService.disable : departmentService.enable;
    await fn(dept._id).catch(()=>null);
    setDepts(prev=>(prev||data).map(d=>d._id===dept._id?{...d,enabled:!d.enabled}:d));
    toast(`${dept.name} ${dept.enabled?"disabled":"enabled"}`,"success");
  };

  const toggleService = async (deptId, svc) => {
    const fn = svc.enabled ? departmentService.disableService : departmentService.enableService;
    await fn(deptId, svc._id).catch(()=>null);
    setDepts(prev=>(prev||data).map(d=>d._id===deptId?{...d,services:d.services.map(s=>s._id===svc._id?{...s,enabled:!s.enabled}:s)}:d));
  };

  const deleteService = async (deptId, svcId, svcName) => {
    if (!window.confirm(`Delete service "${svcName}"?`)) return;
    await departmentService.deleteService(deptId, svcId).catch(()=>null);
    setDepts(prev=>(prev||data).map(d=>d._id===deptId?{...d,services:d.services.filter(s=>s._id!==svcId)}:d));
    toast("Service deleted","success");
  };

  const handleDeptSave = (saved) => {
    setDepts(prev=>{
      const list = prev || data;
      if(saved._id && list.find(d=>d._id===saved._id)) return list.map(d=>d._id===saved._id?{...d,...saved}:d);
      return [...list,{...saved,services:[]}];
    });
  };

  const handleSvcSave = (saved, isEdit) => {
    setDepts(prev=>(prev||data).map(d=>{
      if(d._id!==svcModal.deptId) return d;
      if(isEdit) return {...d,services:d.services.map(s=>s._id===saved._id?saved:s)};
      return {...d,services:[...d.services,saved]};
    }));
  };

  if (loading) return <Loader text="Loading departments..."/>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Departments & Services</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
            <Search size={14} className="text-slate-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search departments..." className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-36"/>
          </div>
          <button onClick={()=>setDeptModal({open:true,dept:null})} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
            <Plus size={14}/> Add Department
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(dept=>(
          <Card key={dept._id} padding={false}>
            {/* Department header */}
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{backgroundColor:`${dept.color}20`,border:`1.5px solid ${dept.color}40`}}>
                {dept.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800 dark:text-white">{dept.name}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${dept.enabled?"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400":"bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400"}`}>{dept.enabled?"Active":"Disabled"}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{dept.description} &nbsp;·&nbsp; {dept.serviceHours}</p>
                <p className="text-xs text-slate-400">{dept.services.length} services &nbsp;·&nbsp; {dept.services.filter(s=>s.enabled).length} enabled</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Enable/disable toggle */}
                <button onClick={()=>toggleDept(dept)} className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${dept.enabled?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${dept.enabled?"left-5":"left-0.5"}`}/>
                </button>
                <button onClick={()=>setDeptModal({open:true,dept})} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Pencil size={14}/></button>
                <button onClick={()=>setExpanded(prev=>({...prev,[dept._id]:!prev[dept._id]}))} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                  {expanded[dept._id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </button>
              </div>
            </div>

            {/* Services list (expandable) */}
            {expanded[dept._id] && (
              <div className="border-t border-slate-100 dark:border-white/10 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Services</p>
                  <button onClick={()=>setSvcModal({open:true,deptId:dept._id,service:null})} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold transition-colors">
                    <Plus size={12}/> Add Service
                  </button>
                </div>
                <div className="space-y-2">
                  {dept.services.map(svc=>(
                    <div key={svc._id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-blue-50/50 dark:hover:bg-white/8 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${svc.enabled?"text-slate-800 dark:text-white":"text-slate-400 line-through"}`}>{svc.name}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <DollarSign size={10}/>
                          {svc.fee > 0 ? `₹${svc.fee} service fee` : "Free service"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>setSvcModal({open:true,deptId:dept._id,service:svc})} className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-white/10 transition-colors"><Pencil size={12}/></button>
                        <button onClick={()=>deleteService(dept._id,svc._id,svc.name)} className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-red-500 border border-slate-200 dark:border-white/10 transition-colors"><Trash2 size={12}/></button>
                      </div>
                      {/* Service toggle */}
                      <button onClick={()=>toggleService(dept._id,svc)} className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${svc.enabled?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${svc.enabled?"left-4":"left-0.5"}`}/>
                      </button>
                    </div>
                  ))}
                  {dept.services.length===0 && <p className="text-sm text-slate-400 italic py-2">No services yet. Add one above.</p>}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <DeptModal open={deptModal.open} initial={deptModal.dept} onClose={()=>setDeptModal({open:false,dept:null})} onSave={handleDeptSave}/>
      <ServiceModal open={svcModal.open} deptId={svcModal.deptId} initial={svcModal.service} onClose={()=>setSvcModal({open:false,deptId:null,service:null})} onSave={handleSvcSave}/>
    </div>
  );
}
