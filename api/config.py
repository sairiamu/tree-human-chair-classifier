"""Runtime settings for the API service, loaded from environment / .env."""

from __future__ import annotations

from pathlib import Path

from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ApiSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./classifier.db"
    upload_dir: Path = Path("uploads")
    support_set_dir: Path = Path("data/support_set")
    checkpoint_path: Path = Path("checkpoints/tree_human_chair.json")
    classes: Any = ["tree", "human", "chair"]
    cors_origins: Any = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("classes", "cors_origins", mode="before")
    @classmethod
    def parse_comma_list(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            # If it looks like a JSON list, try to parse it, otherwise split by comma
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


settings = ApiSettings()


