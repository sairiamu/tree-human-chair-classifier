import { useEffect, useRef, useState } from "react";
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Support set</h2>
        <button
          onClick={handleRebuild}
          disabled={rebuilding || totalPending === 0}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        >
          {rebuilding
            ? "Rebuilding…"
            : `Rebuild model${totalPending ? ` (${totalPending} new)` : ""}`}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CLASSES.map((className) => (
          <div
            key={className}
            className="rounded-lg border border-slate-200 p-4"
          >
            <p className="mb-1 font-medium capitalize text-slate-900">
              {className}
            </p>
            <p className="mb-3 text-xs text-slate-500">
              {summary?.class_counts[className] ?? 0} in model
              {summary?.pending_counts[className]
                ? ` · ${summary.pending_counts[className]} pending`
                : ""}
            </p>
            <button
              onClick={() => inputRefs.current[className]?.click()}
              disabled={uploading === className}
              className="w-full rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 hover:border-brand-500 hover:text-brand-700 disabled:opacity-50"
            >
              {uploading === className ? "Uploading…" : "Add images"}
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
        <p className="mt-4 text-xs text-slate-400">
          Last rebuilt {new Date(summary.last_build_at).toLocaleString()}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
