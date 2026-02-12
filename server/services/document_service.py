import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from collections import Counter
from loguru import logger

DOCUMENTS_FILE = "data/documents.json"

def _ensure_data_dir():
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DOCUMENTS_FILE):
        with open(DOCUMENTS_FILE, "w") as f:
            json.dump([], f)

def get_all_documents() -> List[Dict]:
    _ensure_data_dir()
    try:
        with open(DOCUMENTS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading documents: {e}")
        return []

def add_document(filename: str, size: int, status: str = "Processed"):
    _ensure_data_dir()
    docs = get_all_documents()
    
    # Check if exists, update or add
    existing = next((d for d in docs if d["name"] == filename), None)
    
    new_doc = {
        "name": filename,
        "size": f"{(size / (1024 * 1024)):.1f} MB",
        "status": status,
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    
    if existing:
        docs.remove(existing)
    
    docs.insert(0, new_doc)
    
    with open(DOCUMENTS_FILE, "w") as f:
        json.dump(docs, f, indent=2)
    logger.info(f"Document record updated ({status}): {filename}")

def delete_document(filename: str):
    _ensure_data_dir()
    docs = get_all_documents()
    docs = [d for d in docs if d["name"] != filename]
    
    with open(DOCUMENTS_FILE, "w") as f:
        json.dump(docs, f, indent=2)
    
    # Also delete the physical file if it exists
    file_path = f"uploads/{filename}"
    if os.path.exists(file_path):
        os.remove(file_path)
        logger.info(f"Physical file deleted: {file_path}")
        
    logger.info(f"Document record deleted: {filename}")
QUERIES_FILE = "data/queries.json"

def _ensure_query_file():
    _ensure_data_dir()
    if not os.path.exists(QUERIES_FILE):
        with open(QUERIES_FILE, "w") as f:
            json.dump([], f)

def log_query(question: str, active_docs: List[str], themes: List[str] = []):
    _ensure_query_file()
    try:
        with open(QUERIES_FILE, "r") as f:
            queries = json.load(f)
    except:
        queries = []
        
    queries.append({
        "timestamp": datetime.now().isoformat(),
        "question": question,
        "docs": active_docs,
        "themes": themes
    })
    
    with open(QUERIES_FILE, "w") as f:
        json.dump(queries[-500:], f, indent=2) # Keep last 500
    logger.info(f"Query logged with {len(themes)} themes: {question[:30]}...")

def get_stats() -> Dict:
    _ensure_query_file()
    docs = get_all_documents()
    try:
        with open(QUERIES_FILE, "r") as f:
            queries = json.load(f)
    except:
        queries = []
        
    # Activity Trend
    today = datetime.now().date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]
    activity_map = {day.isoformat(): 0 for day in days}
    for q in queries:
        try:
            q_date = datetime.fromisoformat(q["timestamp"]).date().isoformat()
            if q_date in activity_map: activity_map[q_date] += 1
        except: continue
    
    # Doc Distribution
    doc_counts = Counter()
    theme_counts = Counter()
    for q in queries:
        doc_counts.update(q.get("docs", []))
        theme_counts.update(q.get("themes", []))
    
    # Storage Calculation (Assuming 1GB limit)
    LIMIT_BYTES = 1024 * 1024 * 1024
    total_bytes = 0
    for doc in docs:
        try:
            # Parse size string back to MB if bytes not available
            size_str = doc.get("size", "0 MB")
            val = float(size_str.split()[0])
            total_bytes += int(val * 1024 * 1024)
        except: continue
        
    storage_percent = min(100, round((total_bytes / LIMIT_BYTES) * 100, 1))

    return {
        "total_docs": len(docs),
        "total_queries": len(queries),
        "last_activity": queries[-1]["timestamp"] if queries else None,
        "activity_series": [{"name": datetime.fromisoformat(d).strftime("%a"), "queries": c} for d, c in activity_map.items()],
        "doc_distribution": [{"topic": n[:15] + "..." if len(n) > 15 else n, "count": c} for n, c in doc_counts.most_common(5)],
        "theme_distribution": [{"theme": t, "count": c} for t, c in theme_counts.most_common(10)],
        "time_saved_hours": round(len(queries) * 0.45, 1),
        "storage_percentage": storage_percent
    }
