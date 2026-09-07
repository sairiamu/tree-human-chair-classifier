import { useState } from "react";
import UploadCard from "./components/UploadCard";
import HistoryTable from "./components/HistoryTable";
import SupportSetManager from "./components/SupportSetManager";
import type { Prediction } from "./types";

type Tab = "classify" | "history" | "support-set";

export default function App() {
  const [tab, setTab] = useState<Tab>("classify");
  const [, setLastPrediction] = useState<Prediction | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "classify", label: "Classify" },
    { id: "history", label: "History" },
    { id: "support-set", label: "Support set" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">
          🌳 Tree / Human / Chair Classifier
        </h1>
        <p className="text-sm text-slate-500">
          CPU-only few-shot vision, powered by AdaptShot
        </p>
      </header>

      <nav className="flex gap-1 border-b border-slate-200 bg-white px-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {tab === "classify" && <UploadCard onPredicted={setLastPrediction} />}
        {tab === "history" && <HistoryTable />}
        {tab === "support-set" && <SupportSetManager />}
      </main>
    </div>
  );
}
