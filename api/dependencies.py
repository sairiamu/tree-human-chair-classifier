"""Process-wide singletons: the loaded model, guarded by a lock for writes."""

from __future__ import annotations

import logging
import threading

from classifier.config import load_settings
from classifier.model import ClassifierModel

logger = logging.getLogger(__name__)

_model_lock = threading.Lock()
_model: ClassifierModel | None = None
_project_settings = load_settings()


def get_model() -> ClassifierModel:
    """Return the process-wide model, loading it from checkpoint on first use."""
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                logger.info("Loading model from checkpoint...")
                _model = ClassifierModel.load(_project_settings.checkpoint_path)
    return _model


def get_model_lock() -> threading.Lock:
    """Mutating operations (correct, rebuild) must hold this — AdaptShot's
    learner is not documented as thread-safe for concurrent writes."""
    return _model_lock


def set_model(model: ClassifierModel) -> None:
    global _model
    _model = model


def get_project_settings():
    return _project_settings