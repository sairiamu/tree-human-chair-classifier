import { ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";

interface Props {
  confidence: number;
  uncertain: boolean;
  ood: boolean;
}

export default function ConfidenceBadge({ confidence, uncertain, ood }: Props) {
  const pct = Math.round(confidence * 100);

  if (ood) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-400 backdrop-blur-md">
        <HelpCircle className="h-3.5 w-3.5" />
        OOD Detection
      </span>
    );
  }

  if (uncertain) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 backdrop-blur-md">
        <AlertTriangle className="h-3.5 w-3.5" />
        Uncertain · {pct}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.1)]">
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified · {pct}%
    </span>
  );
}

