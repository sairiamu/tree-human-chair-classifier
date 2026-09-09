import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Sliders } from "lucide-react";
import { correctPrediction } from "../api/client";
import { CLASSES } from "../types";
import type { Prediction } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  prediction: Prediction;
  onCorrected: (p: Prediction) => void;
}

export default function PredictionCard({ prediction, onCorrected }: Props) {
  const [correcting, setCorrecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitCorrection(label: string) {
    setCorrecting(true);
    setError(null);
    try {
      await correctPrediction(prediction.id, label);
      onCorrected({ ...prediction, corrected: true, corrected_label: label });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Correction failed");
    } finally {
      setCorrecting(false);
    }
  }

  return (
    <div className="clay-card border-none bg-hub-900/50 p-6 ring-1 ring-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-brand-500/20 p-3 shadow-clay-sm ring-1 ring-brand-500/30">
            <Sparkles className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Predicted Class</p>
            <h3 className="text-3xl font-black capitalize tracking-tight text-white">
              {prediction.predicted_label}
            </h3>
            {prediction.conformal_set && prediction.conformal_set.length > 1 && (
              <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Ambiguity detected:{" "}
                <span className="text-slate-200">
                  {prediction.conformal_set
                    .filter((c) => c !== prediction.predicted_label)
                    .join(", ")}
                </span>
              </p>
            )}
          </div>
        </div>
        <ConfidenceBadge
          confidence={prediction.calibrated_confidence}
          uncertain={prediction.uncertainty_flag}
          ood={prediction.ood_flag}
        />
      </div>

      {prediction.corrected ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium">
            Verified as <span className="capitalize text-emerald-300">{prediction.corrected_label}</span>
          </p>
        </div>
      ) : (
        <div className="mt-8 border-t border-white/5 pt-6">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Sliders className="h-3.5 w-3.5" />
            <span>Manual Calibration</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {CLASSES.filter((c) => c !== prediction.predicted_label).map(
              (label) => (
                <button
                  key={label}
                  disabled={correcting}
                  onClick={() => submitCorrection(label)}
                  className="skeuo-button text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 text-xs font-semibold text-red-400 flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}
