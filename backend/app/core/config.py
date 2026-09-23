import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nemotron AXIOM"
    PROJECT_SUBTITLE: str = (
        "Autonomous Neuro-Symbolic Verification & Provably Correct Code Synthesizer"
    )
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Nebius Token Factory Configuration
    NEBIUS_API_KEY: str = Field(
        default_factory=lambda: os.getenv("NEBIUS_API_KEY", "")
    )
    NEBIUS_BASE_URL: str = Field(
        default="https://api.tokenfactory.nebius.com/v1/"
    )
    NEMOTRON_MODEL: str = Field(
        default="nvidia/llama-3.1-nemotron-70b-instruct"
    )

    # Tavily API Configuration
    TAVILY_API_KEY: str = Field(
        default_factory=lambda: os.getenv("TAVILY_API_KEY", "")
    )

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
