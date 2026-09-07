"""Human-in-the-loop correction workflow."""

from __future__ import annotations

import logging

from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)

VALID_LABELS = {"tree", "human", "chair"}


def submit_correction(
    model: ClassifierModel,
    image_path: str,
    true_label: str,
    confidence_weight: float = 1.0,
) -> dict:
    """Apply a human correction and return the routing summary."""
    if true_label not in VALID_LABELS:
        raise ValueError(f"true_label must be one of {VALID_LABELS}, got '{true_label}'")

    summary = model.correct(
        image_path=image_path,
        true_label=true_label,
        confidence_weight=confidence_weight,
    )
    logger.info(
        "Correction applied: buffer_size=%s calibration_updated=%s fine_tuned=%s",
        summary.get("buffer_size"),
        summary.get("calibration_updated"),
        summary.get("fine_tuned"),
    )
    return summary