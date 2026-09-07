"""GET /history — paginated, filterable prediction history for the dashboard."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.database import get_db
from api.models import PredictionRecord
from api.schemas import PredictionOut

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[PredictionOut])
def list_history(
    db: Session = Depends(get_db),
    label: str | None = Query(default=None, description="Filter by predicted_label"),
    uncertain_only: bool = Query(default=False),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[PredictionRecord]:
    stmt = select(PredictionRecord).order_by(PredictionRecord.created_at.desc())

    if label:
        stmt = stmt.where(PredictionRecord.predicted_label == label)
    if uncertain_only:
        stmt = stmt.where(
            (PredictionRecord.uncertainty_flag.is_(True))
            | (PredictionRecord.ood_flag.is_(True))
        )

    stmt = stmt.offset(offset).limit(limit)
    return list(db.scalars(stmt))


@router.get("/{prediction_id}", response_model=PredictionOut)
def get_prediction(prediction_id: str, db: Session = Depends(get_db)):
    from fastapi import HTTPException

    record = db.get(PredictionRecord, prediction_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return record