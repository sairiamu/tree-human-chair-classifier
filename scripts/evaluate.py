"""Run the saved model over a held-out folder and report accuracy + coverage.

Expected layout for the eval set (same shape as the support set):
    data/eval_set/tree/*.jpg
    data/eval_set/human/*.jpg
    data/eval_set/chair/*.jpg

Usage:
    python scripts/evaluate.py --eval-dir data/eval_set
"""

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from classifier.config import load_settings
from classifier.dataset import load_support_set
from classifier.model import ClassifierModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate the trained classifier")
    parser.add_argument("--eval-dir", type=Path, required=True)
    args = parser.parse_args()

    settings = load_settings()
    model = ClassifierModel.load(settings.checkpoint_path)

    image_paths, true_labels = load_support_set(args.eval_dir, settings.classes)

    correct = 0
    covered = 0  # true label present in the conformal set
    total = len(image_paths)

    for path, true_label in zip(image_paths, true_labels):
        result = model.predict(path)
        if result.prediction == true_label:
            correct += 1
        if result.conformal_set and true_label in result.conformal_set:
            covered += 1

    logger.info("Accuracy:            %.2f%% (%d/%d)", 100 * correct / total, correct, total)
    logger.info("Conformal coverage:  %.2f%% (%d/%d)", 100 * covered / total, covered, total)


if __name__ == "__main__":
    main()