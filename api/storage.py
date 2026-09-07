"""Disk storage helpers for uploaded images."""

from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def validate_image_upload(upload: UploadFile) -> str:
    """Return a sanitized extension, or raise ValueError."""
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type '{suffix}'. Allowed: {ALLOWED_EXTENSIONS}")
    return suffix


def save_upload(upload: UploadFile, target_dir: Path) -> tuple[str, Path]:
    """Save an UploadFile to target_dir with a UUID-prefixed filename.

    Returns:
        (stored_filename, full_path)
    """
    target_dir.mkdir(parents=True, exist_ok=True)
    suffix = validate_image_upload(upload)
    stored_filename = f"{uuid.uuid4().hex}{suffix}"
    full_path = target_dir / stored_filename

    with full_path.open("wb") as f:
        f.write(upload.file.read())

    return stored_filename, full_path