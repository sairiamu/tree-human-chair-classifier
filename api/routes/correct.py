"""POST /correct/{prediction_id} — human-in-the-loop correction."""

from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import get_db
from api.dependencies import get_model, get_model_lock, get_project_settings
from api.models import PredictionRecord
from api.schemas import CorrectionIn, CorrectionOut
from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/correct", tags=["correct"])


@router.post("/{prediction_id}", response_model=CorrectionOut)
def correct(
    prediction_id: str,
    payload: CorrectionIn,
    db: Session = Depends(get_db),
    model: ClassifierModel = Depends(get_model),
) -> CorrectionOut:
    record = db.get(PredictionRecord, prediction_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Prediction not found")

    project_settings = get_project_settings()
    if payload.true_label not in project_settings.classes:
        raise HTTPException(
            status_code=400,
            detail=f"true_label must be one of {project_settings.classes}",
        )

    lock = get_model_lock()
    with lock:
        try:
            summary = model.correct(
                image_path=record.image_path,
                true_label=payload.true_label,
                confidence_weight=payload.confidence_weight,
            )
            model.save(project_settings.checkpoint_path)
        except Exception as exc:
            logger.exception("Correction failed for %s", prediction_id)
            raise HTTPException(status_code=422, detail=f"Correction failed: {exc}") from exc

    record.corrected = True
    record.corrected_label = payload.true_label
    record.corrected_at = datetime.utcnow()
    db.commit()

    return CorrectionOut(
        prediction_id=prediction_id,
        buffer_size=summary.get("buffer_size"),
        calibration_updated=summary.get("calibration_updated"),
        fine_tuned=summary.get("fine_tuned"),
    )