import os
from dotenv import load_dotenv
from loguru import logger
from server.services import embedding_service, vector_store
from server.config import settings

def test_connection():
    load_dotenv()
    logger.info("Testing Pinecone Connection...")
    
    try:
        # Check if settings are picked up
        if settings.PINECONE_API_KEY == "placeholder-key":
            logger.error("PINECONE_API_KEY is still the placeholder. Please update your .env file.")
            return

        embeddings = embedding_service.get_embedding_model()
        vstore = vector_store.get_vector_store(embeddings)
        
        # Check if it's actually PineconeVectorStore
        from langchain_pinecone import PineconeVectorStore
        if isinstance(vstore, PineconeVectorStore):
            logger.success("Successfully initialized Pinecone Vector Store!")
            logger.info(f"Index: {settings.PINECONE_INDEX_NAME}")
        else:
            logger.warning("Initialized fallback vector store (Chroma). Check your Pinecone credentials.")
            
    except Exception as e:
        logger.error(f"Connection test failed: {e}")

if __name__ == "__main__":
    test_connection()
