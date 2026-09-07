"""Prediction-facing helper used by main.py and scripts/evaluate.py."""

from __future__ import annotations

import logging

from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)


def run_prediction(model: ClassifierModel, image_path: str) -> dict:
    """Predict one image and return a plain-dict summary, safe for JSON/CLI output."""
    result = model.predict(image_path)

    summary = {
        "image": image_path,
        "prediction": result.prediction,
        "calibrated_confidence": round(result.calibrated_confidence, 4),
        "raw_confidence": round(result.raw_confidence, 4),
        "uncertainty_flag": result.uncertainty_flag,
        "act_action": result.act_action,
        "ood_flag": result.ood_flag,
        "conformal_set": result.conformal_set,
    }

    if result.uncertainty_flag or result.ood_flag:
        logger.warning(
            "Low-confidence / OOD prediction for %s -> %s (conf=%.2f)",
            image_path, result.prediction, result.calibrated_confidence,
        )

    return summary