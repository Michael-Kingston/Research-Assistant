from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Pinecone
    PINECONE_API_KEY: str = "placeholder-key"
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "research-papers"

    # Embeddings
    EMBEDDING_MODEL_TYPE: str = "sentence-transformers" # "openai" or "sentence-transformers"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"

    # OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
