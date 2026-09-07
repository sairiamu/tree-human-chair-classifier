import type { CorrectionResult, Prediction, SupportSetSummary } from "../types";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function predictImage(file: File): Promise<Prediction> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    body: formData,
  });
  return handle<Prediction>(res);
}

export async function correctPrediction(
  predictionId: string,
  trueLabel: string,
): Promise<CorrectionResult> {
  const res = await fetch(`${BASE}/correct/${predictionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ true_label: trueLabel }),
  });
  return handle<CorrectionResult>(res);
}

export async function fetchHistory(params: {
  label?: string;
  uncertainOnly?: boolean;
  limit?: number;
}): Promise<Prediction[]> {
  const query = new URLSearchParams();
  if (params.label) query.set("label", params.label);
  if (params.uncertainOnly) query.set("uncertain_only", "true");
  if (params.limit) query.set("limit", String(params.limit));

  const res = await fetch(`${BASE}/history?${query.toString()}`);
  return handle<Prediction[]>(res);
}

export async function uploadSupportImage(
  className: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/support-set/${className}`, {
    method: "POST",
    body: formData,
  });
  await handle(res);
}

export async function fetchSupportSetSummary(): Promise<SupportSetSummary> {
  const res = await fetch(`${BASE}/support-set`);
  return handle<SupportSetSummary>(res);
}

export async function rebuildModel(): Promise<void> {
  const res = await fetch(`${BASE}/support-set/rebuild`, { method: "POST" });
  await handle(res);
}

