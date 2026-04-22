from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkerSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    api_base_url: str = Field(default="http://localhost:8000", alias="API_BASE_URL")
    worker_queue: str = Field(default="default", alias="WORKER_QUEUE")


@lru_cache
def get_settings() -> WorkerSettings:
    return WorkerSettings()


settings = get_settings()

