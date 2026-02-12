import json
import os
import uuid
from datetime import datetime
from typing import List, Optional
from server.models import ChatSession, ChatMessage
from loguru import logger

HISTORY_FILE = "data/chat_history.json"

def _load_history() -> List[ChatSession]:
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            data = json.load(f)
            return [ChatSession(**session) for session in data]
    except Exception as e:
        logger.error(f"Failed to load chat history: {e}")
        return []

def _save_history(sessions: List[ChatSession]):
    try:
        os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
        with open(HISTORY_FILE, "w") as f:
            json.dump([s.model_dump() for s in sessions], f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save chat history: {e}")

def get_all_sessions() -> List[ChatSession]:
    return _load_history()

def get_session(session_id: str) -> Optional[ChatSession]:
    sessions = _load_history()
    for s in sessions:
        if s.id == session_id:
            return s
    return None

def create_session(title: str) -> ChatSession:
    sessions = _load_history()
    new_session = ChatSession(
        id=str(uuid.uuid4()),
        title=title,
        messages=[],
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    sessions.insert(0, new_session)  # Newest first
    _save_history(sessions)
    return new_session

def add_message(session_id: str, role: str, content: str):
    sessions = _load_history()
    for s in sessions:
        if s.id == session_id:
            s.messages.append(ChatMessage(
                role=role,
                content=content,
                timestamp=datetime.now().strftime("%H:%M:%S")
            ))
            _save_history(sessions)
            return True
    return False

def delete_session(session_id: str):
    sessions = _load_history()
    sessions = [s for s in sessions if s.id != session_id]
    _save_history(sessions)
