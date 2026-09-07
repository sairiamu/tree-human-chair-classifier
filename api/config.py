"""Runtime settings for the API service, loaded from environment / .env."""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApiSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://classifier:classifier@localhost:5432/classifier"
    upload_dir: Path = Path("uploads")
    support_set_dir: Path = Path("data/support_set")
    checkpoint_path: Path = Path("checkpoints/tree_human_chair.json")
    classes: list[str] = ["tree", "human", "chair"]
    cors_origins: list[str] = ["http://localhost:5173"]


settings = ApiSettings()


