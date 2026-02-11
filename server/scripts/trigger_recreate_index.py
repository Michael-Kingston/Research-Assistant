from dotenv import load_dotenv
from server.services import embedding_service, vector_store

def trigger_recreation():
    load_dotenv()
    print("Initializing embedding model...")
    embeddings = embedding_service.get_embedding_model()
    print("Accessing vector store (this should trigger recreation if missing)...")
    vstore = vector_store.get_vector_store(embeddings)
    print("Done.")

if __name__ == "__main__":
    trigger_recreation()
