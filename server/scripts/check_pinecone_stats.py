import os
from dotenv import load_dotenv
from pinecone import Pinecone
from server.config import settings

def check_stats():
    load_dotenv()
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    try:
        index_name = settings.PINECONE_INDEX_NAME
        index = pc.Index(index_name)
        stats = index.describe_index_stats()
        print(f"Index Name: {index_name}")
        print(f"Total Vector Count: {stats.total_vector_count}")
        print(f"Namespaces: {stats.namespaces}")
    except Exception as e:
        print(f"Error checking stats: {e}")

if __name__ == "__main__":
    check_stats()
