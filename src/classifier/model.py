"""Thin wrapper around AdaptShot's FewShotLearner for this project."""

from __future__ import annotations

import logging
from pathlib import Path

from adaptshot import AdaptShotConfig, FewShotLearner
from adaptshot import AdaptShotError

from classifier.dataset import class_counts, load_support_set

logger = logging.getLogger(__name__)


class ClassifierModel:
    """Wraps a FewShotLearner scoped to the tree/human/chair task."""

    def __init__(self, config: AdaptShotConfig) -> None:
        self._config = config
        self._learner = FewShotLearner(config=config)
        self._is_fitted = False

    @property
    def is_fitted(self) -> bool:
        return self._is_fitted

    def fit(self, support_set_dir: Path, classes: list[str]) -> None:
        """Load images from disk and build the support set / calibration."""
        image_paths, labels = load_support_set(support_set_dir, classes)
        logger.info("Support set loaded: %s", class_counts(labels))

        try:
            self._learner.load_support_images(image_paths=image_paths, labels=labels)
        except AdaptShotError:
            logger.exception("Failed to load support set")
            raise

        self._is_fitted = True

    def predict(self, image_path: str):
        """Predict a single image. Returns a PredictionResult."""
        if not self._is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() or load() first.")
        return self._learner.predict(image_path)

    def correct(self, image_path: str, true_label: str, confidence_weight: float = 1.0):
        """Feed a human correction back into calibration / continual learning."""
        if not self._is_fitted:
            raise RuntimeError("Model is not fitted. Call fit() or load() first.")
        return self._learner.correct(
            image_path=image_path,
            true_label=true_label,
            confidence_weight=confidence_weight,
        )

    def save(self, checkpoint_path: Path) -> None:
        checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
        self._learner.save(str(checkpoint_path))
        logger.info("Checkpoint saved to %s", checkpoint_path)

    @classmethod
    def load(cls, checkpoint_path: Path) -> "ClassifierModel":
        """Restore a previously saved learner. Skips fit()."""
        if not checkpoint_path.exists():
            raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

        instance = cls.__new__(cls)
        instance._learner = FewShotLearner.load(str(checkpoint_path))
        instance._config = instance._learner._config if hasattr(
            instance._learner, "_config"
        ) else None
        instance._is_fitted = True
        logger.info("Checkpoint loaded from %s", checkpoint_path)
        return instance