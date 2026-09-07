"""Minimal smoke tests. Extend with real fixtures once you have sample images."""

from __future__ import annotations

from pathlib import Path

import pytest
from adaptshot import AdaptShotConfig

from classifier.model import ClassifierModel


def test_model_raises_before_fit(tmp_path: Path) -> None:
    model = ClassifierModel(AdaptShotConfig(device="cpu"))
    assert not model.is_fitted
    with pytest.raises(RuntimeError):
        model.predict("nonexistent.jpg")


def test_load_missing_checkpoint_raises(tmp_path: Path) -> None:
    missing = tmp_path / "does_not_exist.json"
    with pytest.raises(FileNotFoundError):
        ClassifierModel.load(missing)