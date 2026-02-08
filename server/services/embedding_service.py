from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from server.config import settings
from loguru import logger

def get_embedding_model():
    """
    Returns the configured embedding model.
    """
    if settings.EMBEDDING_MODEL_TYPE == "openai":
        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key missing for OpenAI embeddings.")
            raise ValueError("OPENAI_API_KEY is required for OpenAI embeddings.")
        
        logger.info("Initializing OpenAI embeddings.")
        return OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model="text-embedding-3-small"
        )
    else:
        logger.info(f"Initializing open-source embeddings: {settings.EMBEDDING_MODEL_NAME}")
        return HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL_NAME,
            cache_folder=".cache/huggingface"
        )
