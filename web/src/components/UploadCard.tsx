import { useState, useRef } from "react";
import { predictImage } from "../api/client";
import type { Prediction } from "../types";
import PredictionCard from "./PredictionCard";

interface Props {
  onPredicted: (p: Prediction) => void;
}

export default function UploadCard({ onPredicted }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const prediction = await predictImage(file);
      setResult(prediction);
      onPredicted(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Classify an image</h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-slate-400"
        }`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="mb-3 max-h-48 rounded-lg object-contain" />
        ) : (
          <p className="text-sm text-slate-500">Drag & drop an image, or click to browse</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {loading && <p className="mt-4 text-sm text-slate-500">Classifying…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4">
          <PredictionCard prediction={result} onCorrected={(p) => setResult(p)} />
        </div>
      )}
    </div>
  );
}
