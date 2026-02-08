import tempfile
import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Pinecone as PineconeStore
from server.services import embedding_service, document_service
from server.config import settings
from loguru import logger

async def process_pdf(filename: str, content: bytes):
    """
    Processes a PDF file: loads, chunks, embeds, and stores in Pinecone.
    """
    logger.info(f"Starting ingestion for {filename}")
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Load
        loader = PyMuPDFLoader(tmp_path)
        documents = loader.load()
        
        # Split
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        
        # Add metadata
        for split in splits:
            split.metadata["source"] = filename
            
        # Embed and Store
        embeddings = embedding_service.get_embedding_model()
        vectorstore = vector_store.get_vector_store(embeddings)
        
        # Ingest into vector store
        vectorstore.add_documents(splits)
        
        document_service.add_document(filename, len(content))
        logger.info(f"Successfully processed and indexed {len(splits)} chunks from {filename}")
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
