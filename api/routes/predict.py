"""POST /predict — upload an image, get a classification back, persist it."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from api.config import settings
from api.database import get_db
from api.dependencies import get_model
from api.models import PredictionRecord
from api.schemas import PredictionOut
from api.storage import save_upload
from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", response_model=PredictionOut)
def predict(
    file: UploadFile,
    db: Session = Depends(get_db),
    model: ClassifierModel = Depends(get_model),
) -> PredictionRecord:
    try:
        filename, path = save_upload(file, settings.upload_dir / "predictions")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        result = model.predict(str(path))
    except Exception as exc:  # AdaptShotError subclasses
        logger.exception("Prediction failed for %s", path)
        raise HTTPException(status_code=422, detail=f"Prediction failed: {exc}") from exc

    record = PredictionRecord(
        image_filename=filename,
        image_path=str(path),
        predicted_label=str(result.prediction),
        raw_confidence=result.raw_confidence,
        calibrated_confidence=result.calibrated_confidence,
        uncertainty_flag=result.uncertainty_flag,
        ood_flag=result.ood_flag,
        act_action=result.act_action,
        conformal_set=result.conformal_set,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record