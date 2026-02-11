import os
from dotenv import load_dotenv
from pinecone import Pinecone
from server.config import settings

def delete_index():
    load_dotenv()
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    index_name = settings.PINECONE_INDEX_NAME
    try:
        print(f"Deleting index: {index_name}...")
        pc.delete_index(index_name)
        print("Index deleted successfully.")
    except Exception as e:
        print(f"Error deleting index: {e}")

if __name__ == "__main__":
    delete_index()
