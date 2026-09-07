import { useEffect, useState } from "react";
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
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labelFilter, uncertainOnly]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Prediction history
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">All classes</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={uncertainOnly}
              onChange={(e) => setUncertainOnly(e.target.checked)}
            />
            Uncertain / OOD only
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No predictions yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Image</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Corrected</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-2">
                  <img
                    src={`/uploads/predictions/${item.image_filename}`}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                </td>
                <td className="capitalize">{item.predicted_label}</td>
                <td>
                  <ConfidenceBadge
                    confidence={item.calibrated_confidence}
                    uncertain={item.uncertainty_flag}
                    ood={item.ood_flag}
                  />
                </td>
                <td className="capitalize text-slate-600">
                  {item.corrected ? item.corrected_label : "—"}
                </td>
                <td className="text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
