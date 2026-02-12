from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    question: str
    top_k: int = 3
    active_names: List[str] = []
    complexity: str = "Undergraduate"
    session_id: Optional[str] = None

class Source(BaseModel):
    source: str
    content: str
    page: Optional[int] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatSession(BaseModel):
    id: str
    title: str
    messages: List[ChatMessage]
    date: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    session_id: Optional[str] = None

class UploadResponse(BaseModel):
    filename: str
    status: str
    message: str
