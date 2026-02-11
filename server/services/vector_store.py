import os
from langchain_pinecone import PineconeVectorStore
from langchain_chroma import Chroma
from server.config import settings
from loguru import logger
from pinecone import Pinecone, ServerlessSpec

def get_vector_store(embeddings):
    """
    Returns a LangChain VectorStore object (Pinecone or local Chroma fallback).
    """
    # Try Pinecone first
    if settings.PINECONE_API_KEY and settings.PINECONE_API_KEY != "placeholder-key":
        try:
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            
            # Ensure index exists
            active_indexes = pc.list_indexes().names()
            if settings.PINECONE_INDEX_NAME not in active_indexes:
                # Set dimension based on model type
                dimension = 1536 if settings.EMBEDDING_MODEL_TYPE == "openai" else 384
                
                logger.info(f"Creating Pinecone index: {settings.PINECONE_INDEX_NAME} (dimension={dimension})")
                pc.create_index(
                    name=settings.PINECONE_INDEX_NAME,
                    dimension=dimension,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region=settings.PINECONE_ENVIRONMENT)
                )
            
            return PineconeVectorStore(
                index_name=settings.PINECONE_INDEX_NAME,
                embedding=embeddings,
                pinecone_api_key=settings.PINECONE_API_KEY
            )
        except Exception as e:
            logger.warning(f"Pinecone connection failed: {e}. Falling back to local Chroma.")

    # Fallback to Chroma
    logger.info("Initializing local Chroma vector store.")
    persist_directory = "data/chroma_db"
    os.makedirs(persist_directory, exist_ok=True)
    
    return Chroma(
        collection_name="research_papers",
        embedding_function=embeddings,
        persist_directory=persist_directory
    )
