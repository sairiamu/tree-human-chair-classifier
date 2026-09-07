import { useState } from "react";
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
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-semibold capitalize text-slate-900">
            {prediction.predicted_label}
          </p>
          {prediction.conformal_set && prediction.conformal_set.length > 1 && (
            <p className="text-xs text-slate-500">
              Could also be:{" "}
              {prediction.conformal_set
                .filter((c) => c !== prediction.predicted_label)
                .join(", ")}
            </p>
          )}
        </div>
        <ConfidenceBadge
          confidence={prediction.calibrated_confidence}
          uncertain={prediction.uncertainty_flag}
          ood={prediction.ood_flag}
        />
      </div>

      {prediction.corrected ? (
        <p className="mt-3 text-sm text-brand-700">
          Corrected to{" "}
          <span className="font-medium capitalize">
            {prediction.corrected_label}
          </span>{" "}
          — thanks, this feeds back into calibration.
        </p>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-sm text-slate-500">
            Wrong? Tell it the right answer:
          </p>
          <div className="flex gap-2">
            {CLASSES.filter((c) => c !== prediction.predicted_label).map(
              (label) => (
                <button
                  key={label}
                  disabled={correcting}
                  onClick={() => submitCorrection(label)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm capitalize hover:border-brand-500 hover:text-brand-700 disabled:opacity-50"
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
