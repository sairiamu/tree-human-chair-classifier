"""Pydantic request/response models for the API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    image_filename: str
    predicted_label: str
    raw_confidence: float
    calibrated_confidence: float
    uncertainty_flag: bool
    ood_flag: bool
    act_action: str
    conformal_set: list[str] | None
    corrected: bool
    corrected_label: str | None
    created_at: datetime


class CorrectionIn(BaseModel):
    true_label: str
    confidence_weight: float = 1.0


class CorrectionOut(BaseModel):
    prediction_id: str
    buffer_size: int | None = None
    calibration_updated: bool | None = None
    fine_tuned: bool | None = None


class SupportImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    class_name: str
    filename: str
    uploaded_at: datetime
    included_in_build: bool


class SupportSetSummary(BaseModel):
    class_counts: dict[str, int]
    pending_counts: dict[str, int]
    last_build_at: datetime | None
    checkpoint_path: str


class RebuildOut(BaseModel):
    build_id: str
    class_counts: dict[str, int]
    triggered_at: datetime