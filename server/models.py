from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    question: str
    top_k: int = 3
    active_names: List[str] = []

class Source(BaseModel):
    source: str
    content: str
    page: Optional[int] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]

class UploadResponse(BaseModel):
    filename: str
    status: str
    message: str
