"""CLI entrypoint.

Usage:
    python main.py build                          # build support set + save checkpoint
    python main.py predict --image path/to/img.jpg
    python main.py correct --image path/to/img.jpg --label tree
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from classifier.config import load_settings
from classifier.feedback import submit_correction
from classifier.model import ClassifierModel
from classifier.predict import run_prediction

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def cmd_build(args: argparse.Namespace) -> None:
    settings = load_settings(args.config)
    model = ClassifierModel(settings.adaptshot_config)
    model.fit(settings.support_set_dir, settings.classes)
    model.save(settings.checkpoint_path)
    print(f"Checkpoint saved to {settings.checkpoint_path}")


def cmd_predict(args: argparse.Namespace) -> None:
    settings = load_settings(args.config)
    model = ClassifierModel.load(settings.checkpoint_path)
    summary = run_prediction(model, args.image)
    print(json.dumps(summary, indent=2))


def cmd_correct(args: argparse.Namespace) -> None:
    settings = load_settings(args.config)
    model = ClassifierModel.load(settings.checkpoint_path)
    summary = submit_correction(model, args.image, args.label)
    model.save(settings.checkpoint_path)
    print(json.dumps(summary, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Tree / human / chair classifier")
    parser.add_argument("--config", default="config/settings.yaml")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("build").set_defaults(func=cmd_build)

    predict_parser = subparsers.add_parser("predict")
    predict_parser.add_argument("--image", required=True)
    predict_parser.set_defaults(func=cmd_predict)

    correct_parser = subparsers.add_parser("correct")
    correct_parser.add_argument("--image", required=True)
    correct_parser.add_argument("--label", required=True, choices=["tree", "human", "chair"])
    correct_parser.set_defaults(func=cmd_correct)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()