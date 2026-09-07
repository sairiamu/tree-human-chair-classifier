"""Few-shot tree / human / chair image classifier built on AdaptShot."""
"""FastAPI service exposing the ClassifierModel over HTTP."""

from classifier.config import load_settings
from classifier.model import ClassifierModel

__all__ = ["load_settings", "ClassifierModel"]
__version__ = "0.1.0"

