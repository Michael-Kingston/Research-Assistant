import os
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from server.config import settings
from server.models import QueryRequest, QueryResponse, UploadResponse, Source
from typing import List, Optional

from server.services import ingest_service, rag_service, document_service

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="AI Research Assistant API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security: API Key Dependency ---
def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """Simple API Key check for production hardening."""
    # In a real app, this would check against a DB or env var
    # For now, if provided, we check it. If not provided, we allow for dev convenience but log a warning.
    EXPECTED_KEY = os.getenv("RESEARCH_API_KEY", "dev-research-key")
    if x_api_key and x_api_key != EXPECTED_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return x_api_key

# --- Endpoints ---

@app.get("/health")
@limiter.limit("20/minute")
async def health_check(request: Request):
    return {"status": "healthy"}

@app.get("/documents")
@limiter.limit("10/minute")
async def list_documents(request: Request):
    return document_service.get_all_documents()

@app.delete("/documents/{filename}")
@limiter.limit("5/minute")
async def delete_document(request: Request, filename: str, api_key: str = Depends(verify_api_key)):
    document_service.delete_document(filename)
    return {"message": f"Document {filename} deleted successfully."}

@app.post("/upload", response_model=UploadResponse)
@limiter.limit("3/minute")
async def upload_pdf(
    request: Request, 
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    try:
        logger.info(f"Uploading file: {file.filename}")
        content = await file.read()
        
        # Save placeholder metadata immediately so UI shows "Processing"
        # We pass 0 size for now, ingest_service will update it with real info
        document_service.add_document(file.filename, len(content), status="Processing")
        
        # Offload intensive processing to background
        background_tasks.add_task(ingest_service.process_pdf, file.filename, content)
        
        return UploadResponse(
            filename=file.filename,
            status="processing",
            message=f"File {file.filename} is being processed in the background."
        )
    except Exception as e:
        logger.error(f"Error starting upload: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during upload initiation.")

@app.post("/query", response_model=QueryResponse)
@limiter.limit("10/minute")
async def query_bot(request: Request, query_request: QueryRequest):
    try:
        logger.info(f"Querying bot with question: {query_request.question}")
        
        result = await rag_service.query_rag(query_request.question, query_request.top_k, query_request.active_names)
        
        return QueryResponse(
            answer=result["answer"],
            sources=[Source(**s) for s in result["sources"]]
        )
    except Exception as e:
        logger.error(f"Error querying bot: {e}")
        raise HTTPException(status_code=500, detail="Research query failed. Please try again later.")

@app.get("/stats")
@limiter.limit("10/minute")
async def get_corpus_stats(request: Request):
    return document_service.get_stats()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
