"""Scan a directory of class-labelled image folders into (paths, labels)."""

from __future__ import annotations

from pathlib import Path

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

    Raises:
        FileNotFoundError: if a class subfolder is missing.
        ValueError: if a class subfolder has no usable images.
    """
    image_paths: list[str] = []
    labels: list[str] = []

    for class_name in classes:
        class_dir = support_set_dir / class_name
        if not class_dir.is_dir():
            raise FileNotFoundError(
                f"Expected class folder not found: {class_dir}"
            )

        class_images = sorted(
            p for p in class_dir.iterdir()
            if p.suffix.lower() in IMAGE_EXTENSIONS
        )
        if not class_images:
            raise ValueError(f"No images found for class '{class_name}' in {class_dir}")

        image_paths.extend(str(p) for p in class_images)
        labels.extend([class_name] * len(class_images))

    return image_paths, labels


def class_counts(labels: list[str]) -> dict[str, int]:
    """Quick sanity check helper: how many images per class."""
    counts: dict[str, int] = {}
    for label in labels:
        counts[label] = counts.get(label, 0) + 1
    return counts