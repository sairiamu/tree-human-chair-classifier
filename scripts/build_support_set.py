"""Build the support set from data/support_set/{tree,human,chair}/*.jpg
and save a checkpoint the rest of the project loads from.

Usage:
    python scripts/build_support_set.py
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from classifier.config import load_settings
from classifier.model import ClassifierModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    settings = load_settings()

    model = ClassifierModel(settings.adaptshot_config)
    model.fit(settings.support_set_dir, settings.classes)
    model.save(settings.checkpoint_path)

    logger.info("Done. Checkpoint at %s", settings.checkpoint_path)


if __name__ == "__main__":
    main()