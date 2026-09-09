import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Classify Image</h2>
          <p className="text-sm text-slate-400">Analyze objects using few-shot learning.</p>
        </div>
        <div className="h-10 w-10 clay-surface flex items-center justify-center ring-1 ring-white/10">
          <ImageIcon className="h-5 w-5 text-brand-400" />
        </div>
      </div>

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
        className={`group relative recessed-well cursor-pointer overflow-hidden p-12 text-center transition-all duration-500 ${
          dragOver ? "ring-2 ring-brand-500/50 bg-brand-500/5" : "hover:bg-white/5"
        }`}
      >
        {preview ? (
          <div className="relative z-10">
            <img
              src={preview}
              alt="preview"
              className="mx-auto max-h-64 rounded-xl object-contain shadow-2xl ring-4 ring-hub-900"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 clay-surface px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 ring-1 ring-white/20 backdrop-blur-md">
              Image Loaded
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-hub-900 shadow-clay-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UploadCloud className="h-10 w-10 text-brand-400" />
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-200">Drop your image here</p>
            <p className="text-sm text-slate-500">or click to browse from files</p>
          </div>
        )}

        {/* Decorative Grid for recessed well */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

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

      {loading && (
        <div className="flex items-center justify-center gap-3 py-4 text-sm font-medium text-brand-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="tracking-wide">Neural engine analyzing...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 backdrop-blur-md">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {result && (
        <div className="mt-4">
          <PredictionCard prediction={result} onCorrected={(p) => setResult(p)} />
        </div>
      )}
    </div>
  );
}
