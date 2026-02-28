import { useState, useEffect } from "react";
import { Save, Shield, CreditCard, Settings2, FileText, Bell, Ban, Plus, Trash2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import Card from "../components/ui/Card";
import Loader from "../components/ui/Loader";
import { useApi } from "../hooks/useApi";
import { settingsService } from "../services/settingsService";
import { useToast } from "../context/ToastContext";

const MOCK_SETTINGS = {
  sessionTimeout:5, defaultLanguage:"hi", audioGuidance:true, loggingLevel:"info",
  uiTheme:"light", printerModel:"Epson TM-T88VI", printerBaudRate:9600,
};
const MOCK_PAYMENT = {
  mode:"live", txnFee:2.5, razorpayKeyId:"rzp_live_xxxxxx", razorpayKeySecret:"•••••••••••••••••",
  enabledMethods:["upi","card","netbanking"], gatewayErrors: [],
};
const MOCK_AUDIT = [
  { _id:"a1", action:"Config changed",  user:"superadmin@suvidha.gov.in", ip:"103.12.45.67", time:"2026-02-27 09:31", detail:"Session timeout: 10→5 min" },
  { _id:"a2", action:"Admin login",     user:"dept@suvidha.gov.in",       ip:"192.168.1.10",  time:"2026-02-27 08:15", detail:"Successful login" },
  { _id:"a3", action:"Kiosk disabled",  user:"superadmin@suvidha.gov.in", ip:"103.12.45.67", time:"2026-02-26 17:44", detail:"KSK-007 disabled manually" },
  { _id:"a4", action:"Failed login",    user:"unknown@test.com",          ip:"45.33.121.99",  time:"2026-02-26 14:20", detail:"Invalid credentials (3rd attempt)" },
  { _id:"a5", action:"Payment updated", user:"superadmin@suvidha.gov.in", ip:"103.12.45.67", time:"2026-02-26 11:05", detail:"Switched to live mode" },
];
const MOCK_BLACKLIST = [
  { _id:"b1", phone:"9876500000", reason:"Suspicious activity", addedAt:"2026-02-20" },
  { _id:"b2", phone:"9876500001", reason:"Spam complaints",     addedAt:"2026-02-18" },
];
const MOCK_CMS = [
  { _id:"cms1", type:"announcement", title:"Scheduled Maintenance",         message:"SUVIDHA kiosks will be offline on 2 Mar 2026 from 2–4 AM.", active:true  },
  { _id:"cms2", type:"holiday",      title:"Holi Holiday Notice",           message:"Services unavailable on 14 March. Happy Holi!",             active:false },
];

const TABS = [
  { id:"kiosk",    icon:Settings2,  label:"Kiosk" },
  { id:"payment",  icon:CreditCard, label:"Payment" },
  { id:"cms",      icon:Bell,       label:"CMS" },
  { id:"security", icon:Shield,     label:"Security" },
  { id:"audit",    icon:FileText,   label:"Audit Logs" },
];

function Toggle({ checked, onChange }) {
  return (
    <button onClick={()=>onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked?"left-5":"left-0.5"}`}/>
    </button>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/8 last:border-0 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ── Kiosk Settings Tab ─────────────────────────────────────────────────────────
function KioskTab() {
  const toast = useToast();
  const { data:apiData } = useApi(()=>settingsService.get().catch(()=>({settings:MOCK_SETTINGS})),[]);
  const [form, setForm] = useState(MOCK_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{if(apiData?.settings)setForm(apiData.settings);},[apiData]);

  const save = async () => {
    setSaving(true);
    await settingsService.update(form).catch(()=>null);
    toast("Kiosk settings saved","success");
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <Card>
        <p className="font-bold text-slate-800 dark:text-white mb-1">Session & Display</p>
        <Row label="Session Timeout" sub="Auto-logout timer on kiosk (minutes)">
          <select value={form.sessionTimeout} onChange={e=>setForm({...form,sessionTimeout:+e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            {[2,3,5,10,15].map(v=><option key={v} value={v}>{v} minutes</option>)}
          </select>
        </Row>
        <Row label="Default Language" sub="Language shown on kiosk home screen">
          <select value={form.defaultLanguage} onChange={e=>setForm({...form,defaultLanguage:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            {[["hi","Hindi"],["en","English"],["ta","Tamil"],["te","Telugu"],["mr","Marathi"],["bn","Bengali"],["gu","Gujarati"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </Row>
        <Row label="Audio Guidance" sub="Enable voice guidance for citizens"><Toggle checked={form.audioGuidance} onChange={v=>setForm({...form,audioGuidance:v})}/></Row>
        <Row label="UI Theme" sub="Kiosk display theme">
          <select value={form.uiTheme} onChange={e=>setForm({...form,uiTheme:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="light">Light</option><option value="dark">Dark</option><option value="high-contrast">High Contrast</option>
          </select>
        </Row>
      </Card>
      <Card>
        <p className="font-bold text-slate-800 dark:text-white mb-1">Printer & Logging</p>
        <Row label="Printer Model" sub="Receipt printer model installed">
          <input value={form.printerModel} onChange={e=>setForm({...form,printerModel:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none w-48"/>
        </Row>
        <Row label="Logging Level" sub="System log verbosity">
          <select value={form.loggingLevel} onChange={e=>setForm({...form,loggingLevel:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="error">Error only</option><option value="warn">Warnings</option><option value="info">Info</option><option value="debug">Debug (verbose)</option>
          </select>
        </Row>
      </Card>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-60">
          {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save size={14}/>}
          {saving?"Saving...":"Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Payment Config Tab ─────────────────────────────────────────────────────────
function PaymentTab() {
  const toast = useToast();
  const [form, setForm] = useState(MOCK_PAYMENT);
  const [saving, setSaving] = useState(false);
  const methods = ["upi","card","netbanking","wallet"];

  const toggleMethod = (m) => {
    setForm(f=>({...f,enabledMethods:f.enabledMethods.includes(m)?f.enabledMethods.filter(x=>x!==m):[...f.enabledMethods,m]}));
  };

  const save = async () => {
    setSaving(true);
    await settingsService.updatePayment(form).catch(()=>null);
    toast("Payment settings saved","success");
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <Card>
        <p className="font-bold text-slate-800 dark:text-white mb-1">Razorpay Configuration</p>
        <Row label="Mode" sub="Toggle between test and live environment">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${form.mode==="live"?"text-green-600 dark:text-green-400":"text-orange-500"}`}>{form.mode==="live"?"● Live":"● Test"}</span>
            <Toggle checked={form.mode==="test"} onChange={v=>setForm({...form,mode:v?"test":"live"})}/>
            <span className="text-xs text-slate-400">{form.mode==="test"?"Test mode active":"Live mode active"}</span>
          </div>
        </Row>
        {form.mode==="test" && (
          <div className="px-3 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-500"/>
            <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">Test mode is active. No real money will be charged.</p>
          </div>
        )}
        <Row label="Razorpay Key ID" sub="Public API key">
          <input value={form.razorpayKeyId} onChange={e=>setForm({...form,razorpayKeyId:e.target.value})} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-mono text-slate-700 dark:text-slate-300 outline-none w-56"/>
        </Row>
        <Row label="Transaction Fee (%)" sub="Platform fee added to each transaction">
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={10} step={0.5} value={form.txnFee} onChange={e=>setForm({...form,txnFee:+e.target.value})} className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none text-right"/>
            <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
          </div>
        </Row>
      </Card>
      <Card>
        <p className="font-bold text-slate-800 dark:text-white mb-3">Enabled Payment Methods</p>
        <div className="grid grid-cols-2 gap-2">
          {methods.map(m=>(
            <button key={m} onClick={()=>toggleMethod(m)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${form.enabledMethods.includes(m)?"bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-400":"border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white dark:bg-white/5 hover:border-slate-300"}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form.enabledMethods.includes(m)?"bg-blue-600 border-blue-600":"border-slate-300 dark:border-slate-600"}`}>
                {form.enabledMethods.includes(m) && <CheckCircle2 size={10} className="text-white"/>}
              </div>
              {m==="upi"?"UPI":m==="card"?"Debit/Credit Card":m==="netbanking"?"Net Banking":"Wallet"}
            </button>
          ))}
        </div>
      </Card>
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 disabled:opacity-60">
          {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<Save size={14}/>}
          {saving?"Saving...":"Save Payment Settings"}
        </button>
      </div>
    </div>
  );
}

// ── CMS Tab ────────────────────────────────────────────────────────────────────
function CmsTab() {
  const toast = useToast();
  const [items, setItems] = useState(MOCK_CMS);
  const [newItem, setNew] = useState({ type:"announcement", title:"", message:"", active:true });
  const [adding, setAdding] = useState(false);

  const save = async () => {
    if (!newItem.title || !newItem.message) return toast("Title and message are required","warning");
    await settingsService.updateCMS({...newItem}).catch(()=>null);
    setItems([...items,{...newItem,_id:"cms"+Date.now()}]);
    setNew({type:"announcement",title:"",message:"",active:true});
    setAdding(false);
    toast("Announcement published","success");
  };

  const toggle = (id) => setItems(prev=>prev.map(i=>i._id===id?{...i,active:!i.active}:i));
  const remove = (id) => { setItems(prev=>prev.filter(i=>i._id!==id)); toast("Removed","success"); };

  const typeColors = { announcement:"bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400", holiday:"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400", outage:"bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400", alert:"bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage messages shown on kiosk home screens.</p>
        <button onClick={()=>setAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
          <Plus size={14}/> New Announcement
        </button>
      </div>

      {adding && (
        <Card>
          <p className="font-bold text-slate-800 dark:text-white mb-3">New Announcement</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Type</label>
                <select value={newItem.type} onChange={e=>setNew({...newItem,type:e.target.value})} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
                  <option value="announcement">Announcement</option><option value="holiday">Holiday</option><option value="outage">Service Outage</option><option value="alert">Emergency Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title</label>
                <input value={newItem.title} onChange={e=>setNew({...newItem,title:e.target.value})} placeholder="Announcement title" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Message</label>
              <textarea value={newItem.message} onChange={e=>setNew({...newItem,message:e.target.value})} rows={2} placeholder="Message text for citizens..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none resize-none placeholder:text-slate-400"/>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold">Publish</button>
            </div>
          </div>
        </Card>
      )}

      {items.map(item=>(
        <Card key={item._id}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColors[item.type]}`}>{item.type}</span>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{item.title}</p>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.active?"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400":"bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400"}`}>{item.active?"Active":"Inactive"}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.message}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Toggle checked={item.active} onChange={()=>toggle(item._id)}/>
              <button onClick={()=>remove(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={14}/></button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Security Tab ───────────────────────────────────────────────────────────────
function SecurityTab() {
  const toast = useToast();
  const [blacklist, setBlacklist] = useState(MOCK_BLACKLIST);
  const [newPhone, setNewPhone]   = useState("");
  const [reason, setReason]       = useState("");

  const addBlacklist = async () => {
    if (newPhone.length !== 10) return toast("Enter a valid 10-digit number","warning");
    await settingsService.blacklistPhone(newPhone).catch(()=>null);
    setBlacklist([...blacklist,{_id:"b"+Date.now(),phone:newPhone,reason:reason||"Manual blacklist",addedAt:new Date().toLocaleDateString("en-IN")}]);
    setNewPhone(""); setReason("");
    toast("Phone number blacklisted","success");
  };

  const remove = async (id) => {
    await settingsService.removeBlacklist(id).catch(()=>null);
    setBlacklist(blacklist.filter(b=>b._id!==id));
    toast("Removed from blacklist","success");
  };

  return (
    <div className="space-y-5">
      <Card>
        <p className="font-bold text-slate-800 dark:text-white mb-3">Blacklist Phone Number</p>
        <div className="flex gap-3 flex-wrap">
          <input value={newPhone} onChange={e=>setNewPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit phone number" className="flex-1 min-w-[160px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"/>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason (optional)" className="flex-1 min-w-[160px] px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"/>
          <button onClick={addBlacklist} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-md shadow-red-600/20">
            <Ban size={14}/> Blacklist
          </button>
        </div>
      </Card>
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
          <p className="font-bold text-slate-800 dark:text-white">Blacklisted Numbers ({blacklist.length})</p>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {blacklist.map(b=>(
            <div key={b._id} className="px-5 py-3 flex items-center gap-4 hover:bg-red-50/30 dark:hover:bg-red-500/5 transition-colors">
              <Ban size={14} className="text-red-400 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-slate-800 dark:text-white">{b.phone}</p>
                <p className="text-xs text-slate-400">{b.reason} &nbsp;·&nbsp; Added {b.addedAt}</p>
              </div>
              <button onClick={()=>remove(b._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"><Trash2 size={14}/></button>
            </div>
          ))}
          {blacklist.length===0 && <p className="px-5 py-8 text-center text-slate-400 text-sm">No numbers blacklisted.</p>}
        </div>
      </Card>
    </div>
  );
}

// ── Audit Logs Tab ─────────────────────────────────────────────────────────────
function AuditTab() {
  const { data:apiData, loading, refetch } = useApi(
    ()=>settingsService.getAuditLogs({}).catch(()=>({logs:MOCK_AUDIT})),[]
  );
  const logs = apiData?.logs || MOCK_AUDIT;

  const actionColors = {
    "Config changed":"bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "Admin login":"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
    "Kiosk disabled":"bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
    "Failed login":"bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    "Payment updated":"bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">All admin actions are logged for compliance.</p>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 bg-white dark:bg-white/5">
          <RefreshCw size={13} className={loading?"animate-spin":""}/> Refresh
        </button>
      </div>
      <Card padding={false}>
        {loading ? <Loader text="Loading logs..."/> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
                  {["Action","User","IP Address","Details","Time"].map(h=>(
                    <th key={h} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l,i)=>(
                  <tr key={l._id} className={`border-t border-slate-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/3 transition-colors ${i%2===1?"bg-slate-50/30 dark:bg-white/[0.01]":""}`}>
                    <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${actionColors[l.action]||"bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"}`}>{l.action}</span></td>
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400">{l.user}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{l.ip}</td>
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[220px] truncate">{l.detail}</td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{l.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Full Transactions page with pagination ─────────────────────────────────────
// ── Main Settings Page ─────────────────────────────────────────────────────────
export default function Settings() {
  const [tab, setTab] = useState("kiosk");

  const tabContent = { kiosk:<KioskTab/>, payment:<PaymentTab/>, cms:<CmsTab/>, security:<SecurityTab/>, audit:<AuditTab/> };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-black text-slate-800 dark:text-white">System Settings</h2>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-2xl p-1 flex-wrap">
        {TABS.map(({id,icon:Icon,label})=>(
          <button key={id} onClick={()=>setTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 min-w-fit justify-center ${tab===id?"bg-white dark:bg-[#1a2942] text-slate-800 dark:text-white shadow-sm":"text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {tabContent[tab]}
    </div>
  );
}
