import os
from dotenv import load_dotenv
from pinecone import Pinecone
from server.config import settings

def check_index():
    load_dotenv()
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    
    try:
        index_name = settings.PINECONE_INDEX_NAME
        description = pc.describe_index(index_name)
        print(f"Index Name: {index_name}")
        print(f"Dimension: {description.dimension}")
        print(f"Metric: {description.metric}")
        print(f"Status: {description.status['ready']}")
        print(f"Spec: {description.spec}")
    except Exception as e:
        print(f"Error describing index: {e}")

if __name__ == "__main__":
    check_index()
