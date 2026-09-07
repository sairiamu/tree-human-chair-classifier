export interface Prediction {
  id: string;
  image_filename: string;
  predicted_label: string;
  raw_confidence: number;
  calibrated_confidence: number;
  uncertainty_flag: boolean;
  ood_flag: boolean;
  act_action: string;
  conformal_set: string[] | null;
  corrected: boolean;
  corrected_label: string | null;
  created_at: string;
}

export interface CorrectionResult {
  prediction_id: string;
  buffer_size: number | null;
  calibration_updated: boolean | null;
  fine_tuned: boolean | null;
}

export interface SupportSetSummary {
  class_counts: Record<string, number>;
  pending_counts: Record<string, number>;
  last_build_at: string | null;
  checkpoint_path: string;
}

export const CLASSES = ["tree", "human", "chair"] as const;
export type ClassName = (typeof CLASSES)[number];

