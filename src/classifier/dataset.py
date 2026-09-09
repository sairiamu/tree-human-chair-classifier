"""Scan a directory of class-labelled image folders into (paths, labels)."""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def load_support_set(
    support_set_dir: Path,
    classes: list[str],
) -> tuple[list[str], list[str]]:
    """Walk support_set_dir/<class_name>/*.jpg into flat parallel lists.

    Expected layout:
        support_set_dir/
            tree/   *.jpg
            human/  *.jpg
            chair/  *.jpg

    Returns:
        (image_paths, labels) — same length, one label per path.
    """
    image_paths: list[str] = []
    labels: list[str] = []

    if not support_set_dir.exists():
        logger.warning(f"Support set directory does not exist: {support_set_dir}")
        return [], []

    for class_name in classes:
        class_dir = support_set_dir / class_name
        if not class_dir.exists():
            logger.warning(f"Class folder not found: {class_dir}. Skipping.")
            continue

        if not class_dir.is_dir():
            logger.warning(f"Path is not a directory: {class_dir}. Skipping.")
            continue

        class_images = sorted(
            p for p in class_dir.iterdir()
            if p.suffix.lower() in IMAGE_EXTENSIONS
        )
        if not class_images:
            logger.info(f"No images found for class '{class_name}' in {class_dir}")
            continue

        image_paths.extend(str(p) for p in class_images)
        labels.extend([class_name] * len(class_images))

    return image_paths, labels


def class_counts(labels: list[str], classes: list[str] | None = None) -> dict[str, int]:
    """Quick sanity check helper: how many images per class."""
    if classes:
        counts = {c: 0 for c in classes}
    else:
        counts = {}

    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return counts
