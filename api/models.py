"""ORM tables: prediction history and support-set uploads."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from api.database import Base


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    image_filename: Mapped[str] = mapped_column(String(255))
    image_path: Mapped[str] = mapped_column(String(512))

    predicted_label: Mapped[str] = mapped_column(String(50))
    raw_confidence: Mapped[float] = mapped_column(Float)
    calibrated_confidence: Mapped[float] = mapped_column(Float)
    uncertainty_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    ood_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    act_action: Mapped[str] = mapped_column(String(50))
    conformal_set: Mapped[list | None] = mapped_column(JSON, nullable=True)

    corrected: Mapped[bool] = mapped_column(Boolean, default=False)
    corrected_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    corrected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SupportImageRecord(Base):
    __tablename__ = "support_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    class_name: Mapped[str] = mapped_column(String(50))
    filename: Mapped[str] = mapped_column(String(255))
    path: Mapped[str] = mapped_column(String(512))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    included_in_build: Mapped[bool] = mapped_column(Boolean, default=False)


class ModelBuildRecord(Base):
    """One row per rebuild — lets the dashboard show when the model last changed."""

    __tablename__ = "model_builds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    class_counts: Mapped[dict] = mapped_column(JSON)
    checkpoint_path: Mapped[str] = mapped_column(String(512))