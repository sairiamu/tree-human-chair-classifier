"""Support-set management: upload new class examples, then rebuild the model."""

from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from api.config import settings
from api.database import get_db
from api.dependencies import get_model_lock, get_project_settings, set_model
from api.models import ModelBuildRecord, SupportImageRecord
from api.schemas import RebuildOut, SupportImageOut, SupportSetSummary
from api.storage import save_upload
from classifier.dataset import class_counts, load_support_set
from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support-set", tags=["support-set"])


@router.post("/{class_name}", response_model=SupportImageOut)
def upload_support_image(
    class_name: str,
    file: UploadFile,
    db: Session = Depends(get_db),
) -> SupportImageRecord:
    project_settings = get_project_settings()
    if class_name not in project_settings.classes:
        raise HTTPException(
            status_code=400,
            detail=f"class_name must be one of {project_settings.classes}",
        )

    target_dir = project_settings.support_set_dir / class_name
    try:
        filename, path = save_upload(file, target_dir)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    record = SupportImageRecord(
        class_name=class_name,
        filename=filename,
        path=str(path),
        included_in_build=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("", response_model=SupportSetSummary)
def get_support_set_summary(db: Session = Depends(get_db)) -> SupportSetSummary:
    project_settings = get_project_settings()

    _, labels = load_support_set(project_settings.support_set_dir, project_settings.classes)
    counts = class_counts(labels, classes=project_settings.classes)

    pending_rows = db.execute(
        select(SupportImageRecord.class_name, func.count())
        .where(SupportImageRecord.included_in_build.is_(False))
        .group_by(SupportImageRecord.class_name)
    ).all()
    pending_counts = {name: count for name, count in pending_rows}

    last_build = db.execute(
        select(ModelBuildRecord).order_by(ModelBuildRecord.triggered_at.desc()).limit(1)
    ).scalar_one_or_none()

    return SupportSetSummary(
        class_counts=counts,
        pending_counts=pending_counts,
        last_build_at=last_build.triggered_at if last_build else None,
        checkpoint_path=str(project_settings.checkpoint_path),
    )


@router.post("/rebuild", response_model=RebuildOut)
def rebuild_model(db: Session = Depends(get_db)) -> RebuildOut:
    """Re-fit the learner on the full support set on disk and swap it in."""
    project_settings = get_project_settings()
    lock = get_model_lock()

    with lock:
        # Verify we have images for all required classes before attempting a rebuild
        image_paths, labels = load_support_set(project_settings.support_set_dir, project_settings.classes)
        counts = class_counts(labels, classes=project_settings.classes)

        missing_classes = [c for c, count in counts.items() if count == 0]
        if missing_classes:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot rebuild: The following classes have no images: {missing_classes}. "
                       "Please upload at least one image for each class."
            )

        try:
            new_model = ClassifierModel(project_settings.adaptshot_config)
            new_model.fit(project_settings.support_set_dir, project_settings.classes)
            new_model.save(project_settings.checkpoint_path)
        except Exception as exc:
            logger.exception("Rebuild failed")
            raise HTTPException(status_code=422, detail=f"Rebuild failed: {exc}") from exc

        set_model(new_model)

    _, labels = load_support_set(project_settings.support_set_dir, project_settings.classes)
    counts = class_counts(labels, classes=project_settings.classes)

    db.query(SupportImageRecord).update({SupportImageRecord.included_in_build: True})

    build = ModelBuildRecord(
        class_counts=counts,
        checkpoint_path=str(project_settings.checkpoint_path),
    )
    db.add(build)
    db.commit()
    db.refresh(build)

    return RebuildOut(
        build_id=build.id,
        class_counts=counts,
        triggered_at=build.triggered_at,
    )