import tempfile
import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Pinecone as PineconeStore
from server.services import embedding_service, document_service, vector_store
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
        logger.info(f"Loading PDF content for {filename}...")
        loader = PyMuPDFLoader(tmp_path)
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} pages from {filename}")
        
        # Split
        logger.info(f"Splitting {filename} into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        logger.info(f"Created {len(splits)} chunks from {filename}")
        
        # Add metadata
        for split in splits:
            split.metadata["source"] = filename
            
        # Embed and Store
        logger.info(f"Generating embeddings for {len(splits)} chunks...")
        embeddings = embedding_service.get_embedding_model()
        logger.info("Initializing vector store...")
        vectorstore = vector_store.get_vector_store(embeddings)
        
        # Ingest into vector store
        logger.info(f"Uploading vectors to Pinecone for {filename}...")
        vectorstore.add_documents(splits)
        
        document_service.add_document(filename, len(content))
        logger.info(f"Successfully processed and indexed {len(splits)} chunks from {filename}")
        
    except Exception as e:
        logger.error(f"Failed to process PDF {filename}: {e}")
        # Update document status to error if document_service supports it
        # document_service.update_status(filename, "Error")
        
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
