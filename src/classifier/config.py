"""Load project settings and translate them into an AdaptShotConfig."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml
from adaptshot import AdaptShotConfig


@dataclass(frozen=True)
class Settings:
    """Typed view over config/settings.yaml."""

    adaptshot_config: AdaptShotConfig
    support_set_dir: Path
    classes: list[str]
    checkpoint_path: Path


def load_settings(path: str | Path = "config/settings.yaml") -> Settings:
    """Read the YAML config and build a Settings object.

    Raises:
        FileNotFoundError: if the config file does not exist.
        ValueError: if required keys are missing.
    """
    config_path = Path(path)
    if not config_path.is_absolute() and str(path) == "config/settings.yaml":
        project_root = Path(__file__).resolve().parents[2]
        config_path = project_root / config_path
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with config_path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    try:
        model_cfg = raw["model"]
        data_cfg = raw["data"]
        paths_cfg = raw["paths"]
    except KeyError as exc:
        raise ValueError(f"Missing required config section: {exc}") from exc

    adaptshot_config = AdaptShotConfig(
        backbone=model_cfg.get("backbone", "mobilenet_v3_small"),
        device=model_cfg.get("device", "cpu"),
        seed=model_cfg.get("seed", 42),
        inference_mode=model_cfg.get("inference_mode", "prototypical"),
        calibration_method=model_cfg.get("calibration_method", "temperature"),
        conformal_alpha=model_cfg.get("conformal_alpha", 0.05),
        conformal_mode=model_cfg.get("conformal_mode", "split"),
        uncertainty_mode=model_cfg.get("uncertainty_mode", "ensemble"),
        max_buffer_size=model_cfg.get("max_buffer_size", 100),
    )

    project_root = config_path.parent.parent
    return Settings(
        adaptshot_config=adaptshot_config,
        support_set_dir=_resolve_project_path(data_cfg["support_set_dir"], project_root),
        classes=list(data_cfg["classes"]),
        checkpoint_path=_resolve_project_path(paths_cfg["checkpoint"], project_root),
    )


def _resolve_project_path(path: str | Path, project_root: Path) -> Path:
    resolved_path = Path(path)
    return resolved_path if resolved_path.is_absolute() else project_root / resolved_path