import { useEffect, useState } from "react";
import { History, Filter, RefreshCw, Calendar, Search, CheckCircle2 } from "lucide-react";
import { fetchHistory } from "../api/client";
import { CLASSES } from "../types";
import type { Prediction } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";

export default function HistoryTable() {
  const [items, setItems] = useState<Prediction[]>([]);
  const [labelFilter, setLabelFilter] = useState<string>("");
  const [uncertainOnly, setUncertainOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchHistory({
        label: labelFilter || undefined,
        uncertainOnly,
        limit: 50,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load history:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelFilter, uncertainOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 clay-surface flex items-center justify-center ring-1 ring-white/10">
            <History className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Neural History</h2>
            <p className="text-sm text-slate-400">Review past classifications and audit results.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="recessed-well appearance-none pl-9 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 outline-none transition-all focus:ring-1 focus:ring-brand-500/50"
            >
              <option value="">All Streams</option>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 px-4 py-2 recessed-well transition-all hover:bg-white/5">
            <input
              type="checkbox"
              checked={uncertainOnly}
              onChange={(e) => setUncertainOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-hub-900 text-brand-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Mode</span>
          </label>

          <button
            onClick={load}
            disabled={loading}
            className="skeuo-button group"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 group-hover:text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 recessed-well">
          <RefreshCw className="mb-4 h-10 w-10 text-brand-500/50 animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse uppercase tracking-[0.2em]">Synchronizing Logs...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 recessed-well">
          <Search className="mb-4 h-10 w-10 text-slate-700" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No matching records</p>
        </div>
      ) : (
        <div className="recessed-well overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-hub-950/40">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Asset</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Classification</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Confidence</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Manual Audit</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 rounded-xl border border-white/10 overflow-hidden shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-2">
                      <img
                        src={`/uploads/predictions/${item.image_filename}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold capitalize text-white tracking-wide">{item.predicted_label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <ConfidenceBadge
                      confidence={item.calibrated_confidence}
                      uncertain={item.uncertainty_flag}
                      ood={item.ood_flag}
                    />
                  </td>
                  <td className="px-6 py-4">
                    {item.corrected ? (
                      <span className="inline-flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-400 ring-1 ring-brand-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.corrected_label}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Calendar className="h-3.5 w-3.5 text-slate-700" />
                      {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
