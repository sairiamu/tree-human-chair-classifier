import { useState } from "react";
import { TreePine, User, Armchair, LayoutDashboard, History, Settings2 } from "lucide-react";
import UploadCard from "./components/UploadCard";
import HistoryTable from "./components/HistoryTable";
import SupportSetManager from "./components/SupportSetManager";
import type { Prediction } from "./types";

type Tab = "classify" | "history" | "support-set";

export default function App() {
  const [tab, setTab] = useState<Tab>("classify");
  const [, setLastPrediction] = useState<Prediction | null>(null);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "classify", label: "Classify", icon: LayoutDashboard },
    { id: "history", label: "History", icon: History },
    { id: "support-set", label: "Support set", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen bg-hub-950 text-slate-100 selection:bg-brand-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-brand-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5 p-2 clay-surface ring-1 ring-white/10">
              <TreePine className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <User className="h-5 w-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              <Armchair className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Vision<span className="text-brand-400">Hub</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Few-Shot Neural Classifier
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 p-1 bg-hub-950/40 rounded-xl border border-white/5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                  tab === t.id
                    ? "bg-slate-800 text-white shadow-clay-sm ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <t.icon className={`h-3.5 w-3.5 transition-transform duration-300 ${tab === t.id ? "scale-110 text-brand-400" : "group-hover:scale-110"}`} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="clay-card p-1 shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl">
          <div className="bg-hub-900/40 rounded-[calc(theme('borderRadius.2xl')-4px)] p-6 min-h-[500px]">
            {tab === "classify" && <UploadCard onPredicted={setLastPrediction} />}
            {tab === "history" && <HistoryTable />}
            {tab === "support-set" && <SupportSetManager />}
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs text-slate-600 font-medium">
            Powered by <span className="text-slate-400">AdaptShot Engine</span> • 2024 High-Performance Vision
          </p>
        </footer>
      </main>
    </div>
  );
}
