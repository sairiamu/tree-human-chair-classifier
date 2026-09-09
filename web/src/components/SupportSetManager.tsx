import { useEffect, useRef, useState } from "react";
import { Database, RefreshCw, Upload, Plus, AlertCircle, Calendar } from "lucide-react";
import {
  fetchSupportSetSummary,
  rebuildModel,
  uploadSupportImage,
} from "../api/client";
import { CLASSES } from "../types";
import type { SupportSetSummary } from "../types";

export default function SupportSetManager() {
  const [summary, setSummary] = useState<SupportSetSummary | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    setSummary(await fetchSupportSetSummary());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(className: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(className);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadSupportImage(className, file);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function handleRebuild() {
    setRebuilding(true);
    setError(null);
    try {
      await rebuildModel();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rebuild failed");
    } finally {
      setRebuilding(false);
    }
  }

  const totalPending = summary
    ? Object.values(summary.pending_counts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 clay-surface flex items-center justify-center ring-1 ring-white/10">
            <Database className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Support Library</h2>
            <p className="text-sm text-slate-400">Manage the reference set for few-shot adaptation.</p>
          </div>
        </div>

        <button
          onClick={handleRebuild}
          disabled={rebuilding || totalPending === 0}
          className="skeuo-button-primary flex items-center justify-center gap-3 px-6 py-3 min-w-[200px]"
        >
          <RefreshCw className={`h-4 w-4 ${rebuilding ? "animate-spin" : ""}`} />
          <span className="text-xs font-black uppercase tracking-widest">
            {rebuilding
              ? "Rebuilding Library..."
              : `Optimize Model${totalPending ? ` (${totalPending} NEW)` : ""}`}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CLASSES.map((className) => (
          <div
            key={className}
            className="clay-card group relative flex flex-col justify-between overflow-hidden bg-hub-900/40 p-6 ring-1 ring-white/5 transition-all hover:ring-white/20"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg font-black capitalize tracking-tight text-white">
                  {className}
                </p>
                {summary?.pending_counts[className] ? (
                  <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-brand-400 ring-1 ring-brand-500/30">
                    New Data
                  </span>
                ) : null}
              </div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {summary?.class_counts[className] ?? 0}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Samples in model
                </span>
              </div>
            </div>

            <button
              onClick={() => inputRefs.current[className]?.click()}
              disabled={uploading === className}
              className="skeuo-button w-full flex items-center justify-center gap-2 group-hover:border-brand-500/50"
            >
              {uploading === className ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-400" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand-400" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                {uploading === className ? "Uploading..." : "Inject Samples"}
              </span>
            </button>

            <input
              ref={(el) => (inputRefs.current[className] = el)}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(className, e.target.files)}
            />
          </div>
        ))}
      </div>

      {summary?.last_build_at && (
        <div className="flex items-center justify-center gap-2 rounded-xl recessed-well p-4">
          <Calendar className="h-3.5 w-3.5 text-slate-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Last architectural synchronization: {new Date(summary.last_build_at).toLocaleString()}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-md">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
