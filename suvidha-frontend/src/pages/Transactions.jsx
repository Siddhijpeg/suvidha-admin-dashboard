import { useState } from "react";
import { Download, Search, X, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Eye } from "lucide-react";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Loader from "../components/ui/Loader";
import { useApi } from "../hooks/useApi";
import { transactionService } from "../services/transactionService";
import { useToast } from "../context/ToastContext";
import { exportCSV } from "../utils/exportCSV";
import { formatDateTime } from "../utils/formatDate";

const MOCK_TXNS = Array.from({length:42},(_,i)=>{
  const depts  = ["Electricity","Water","Gas","Municipal","Transport"];
  const svcs   = { Electricity:["Pay Bill","View Bill","Bill History","New Connection"], Water:["Pay Bill","View Bill","New Connection"], Gas:["Pay Bill","New Connection"], Municipal:["Property Tax","Trade License","Birth Certificate"], Transport:["RC Status","DL Check"] };
  const statuses = ["success","success","success","success","failed","pending"];
  const methods  = ["UPI","Card","Net Banking","UPI","Card"];
  const dept     = depts[i%depts.length];
  const service  = (svcs[dept]||["Service"])[i%3%svcs[dept]?.length||0];
  const amount   = service.toLowerCase().includes("view")||service.toLowerCase().includes("history")||service.toLowerCase().includes("status")?0:Math.floor(Math.random()*5000+200);
  const d = new Date(); d.setMinutes(d.getMinutes()-(i*7));
  return {
    _id:`t${i}`, txnId:`TXN-${8821-i}`, paymentId:`PAY-RZP-${(i+1).toString().padStart(3,"0")}`,
    dept, service, account:`${dept.slice(0,2).toUpperCase()}${Math.floor(Math.random()*9e9+1e9)}`,
    amount, method:amount>0?methods[i%methods.length]:"—",
    status:statuses[i%statuses.length], kiosk:`KSK-${String((i%12)+1).padStart(3,"0")}`,
    location:["Delhi","Mumbai","Chennai","Pune","Hyderabad"][i%5], createdAt:d.toISOString(),
  };
});

const PAGE_SIZE = 12;

const statusStyles = {
  success:"bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  failed: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
  pending:"bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
};

function TxnDetailModal({ txn, open, onClose }) {
  if (!txn) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Transaction ${txn.txnId}`} size="md">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Transaction ID",txn.txnId],["Payment ID",txn.paymentId],["Department",txn.dept],
          ["Service",txn.service],["Account No.",txn.account],["Amount",txn.amount>0?`₹${txn.amount.toLocaleString()}`:"Free"],
          ["Payment Method",txn.method],["Status",txn.status],["Kiosk",txn.kiosk],
          ["Location",txn.location],["Date & Time",formatDateTime(txn.createdAt)],
        ].map(([l,v])=>(
          <div key={l} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 col-span-1">
            <p className="text-[11px] text-slate-400 mb-0.5">{l}</p>
            <p className={`text-sm font-semibold capitalize ${l==="Status"?statusStyles[v]?.split(" ")[2]||"text-slate-800 dark:text-white":"text-slate-800 dark:text-white"}`}>{v}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function Transactions() {
  const toast = useToast();
  const { data:apiData, loading, error, refetch } = useApi(
    ()=>transactionService.getAll().catch(()=>({transactions:MOCK_TXNS})),[]
  );
  const allTxns = apiData?.transactions || MOCK_TXNS;

  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("all");
  const [deptF, setDeptF]       = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [page, setPage]         = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const depts = [...new Set(allTxns.map(t=>t.dept))];

  const filtered = allTxns.filter(t=>{
    const ms = t.txnId.toLowerCase().includes(search.toLowerCase())||t.account.toLowerCase().includes(search.toLowerCase())||t.dept.toLowerCase().includes(search.toLowerCase())||t.service.toLowerCase().includes(search.toLowerCase());
    const st = statusF==="all"||t.status===statusF;
    const dp = deptF==="all"||t.dept===deptF;
    const df = !dateFrom||new Date(t.createdAt)>=new Date(dateFrom);
    const dt = !dateTo||new Date(t.createdAt)<=new Date(dateTo+"T23:59:59");
    return ms&&st&&dp&&df&&dt;
  });

  const totalPages = Math.ceil(filtered.length/PAGE_SIZE);
  const paginated  = filtered.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);

  const totalRevenue = filtered.filter(t=>t.status==="success").reduce((s,t)=>s+t.amount,0);
  const successCount = filtered.filter(t=>t.status==="success").length;
  const failCount    = filtered.filter(t=>t.status==="failed").length;

  const handleExport = () => {
    exportCSV(filtered.map(t=>({
      "TXN ID":t.txnId,"Payment ID":t.paymentId,"Department":t.dept,"Service":t.service,
      "Account":t.account,"Amount":t.amount,"Method":t.method,"Status":t.status,
      "Kiosk":t.kiosk,"Location":t.location,"Date":formatDateTime(t.createdAt),
    })),"suvidha-transactions.csv");
    toast("Export downloaded","success");
  };

  const clearFilters = () => { setSearch(""); setStatusF("all"); setDeptF("all"); setDateFrom(""); setDateTo(""); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Transactions & Revenue</h2>
        <div className="flex gap-2">
          <button onClick={refetch} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 bg-white dark:bg-white/5 transition-colors">
            <RefreshCw size={14} className={loading?"animate-spin":""}/> Refresh
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-blue-600/20">
            <Download size={14}/> Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Filtered",  filtered.length,                 "text-blue-600",  "bg-blue-50 dark:bg-blue-500/10"],
          ["Total Revenue",   `₹${totalRevenue.toLocaleString()}`,"text-green-600","bg-green-50 dark:bg-green-500/10"],
          ["Successful",      successCount,                    "text-green-600", "bg-green-50 dark:bg-green-500/10"],
          ["Failed",          failCount,                       "text-red-500",   "bg-red-50 dark:bg-red-500/10"],
        ].map(([l,v,c,bg])=>(
          <Card key={l}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Download size={15} className={c}/>
            </div>
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
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search TXN ID, account, dept..." className="bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none w-full"/>
            {search&&<button onClick={()=>{setSearch("");setPage(1);}}><X size={13} className="text-slate-400"/></button>}
          </div>
          <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Status</option><option value="success">Success</option><option value="failed">Failed</option><option value="pending">Pending</option>
          </select>
          <select value={deptF} onChange={e=>{setDeptF(e.target.value);setPage(1);}} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="all">All Departments</option>
            {depts.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none"/>
          <input type="date" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 outline-none"/>
          {(search||statusF!=="all"||deptF!=="all"||dateFrom||dateTo) && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors">
              <X size={13}/> Clear
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2">{filtered.length} transactions found</p>
      </Card>

      {/* Table */}
      {loading ? <Loader text="Loading transactions..."/> : error ? (
        <Card><div className="flex items-center gap-2 text-red-500"><AlertCircle size={16}/><p className="text-sm">{error}</p></div></Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
                  {["TXN ID","Dept","Service","Account","Amount","Method","Status","Kiosk","Date",""].map(h=>(
                    <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((t,i)=>(
                  <tr key={t._id} className={`border-t border-slate-50 dark:border-white/5 hover:bg-blue-50/50 dark:hover:bg-white/3 transition-colors ${i%2===1?"bg-slate-50/30 dark:bg-white/[0.01]":""}`}>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{t.txnId}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 font-medium">{t.dept}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[130px] truncate">{t.service}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{t.account}</td>
                    <td className="px-4 py-3 font-bold text-xs text-slate-800 dark:text-white">{t.amount>0?`₹${t.amount.toLocaleString()}`:"—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t.method}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[t.status]}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{t.kiosk}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>{setSelected(t);setDetailOpen(true);}} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginated.length===0 && <p className="text-center py-12 text-slate-400 text-sm">No transactions match your filters.</p>}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <p className="text-xs text-slate-400">Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE,filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={14}/>
                </button>
                {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                  const p = Math.min(Math.max(page-2,1),totalPages-4)+i;
                  if(p<1||p>totalPages) return null;
                  return (
                    <button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${p===page?"bg-blue-600 text-white shadow-md shadow-blue-600/20":"border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}>{p}</button>
                  );
                })}
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      <TxnDetailModal txn={selected} open={detailOpen} onClose={()=>setDetailOpen(false)}/>
    </div>
  );
}
