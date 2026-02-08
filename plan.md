
AI Research Assistant Demo – Plan
Objective
Build a demo AI assistant that lets users query a curated set of scientific papers (PDFs) and get semantic answers with source references.


Features:


Semantic search using Pinecone


Retrieval-Augmented Generation (RAG) using LangChain


Optional front-end interface (Streamlit / React)


Cost-efficient: ~$0–$10/month



2️⃣ Architecture Overview
+-------------+       +----------------+       +-----------------+
 | PDF Corpus  | --->  | LangChain PDF  | --->  | Embeddings (vec)|
 | 50-100 PDFs |       | Loader         |       | Stored in       |
 +-------------+       +----------------+       | Pinecone        |
                                                   |
                                                   v
                                         +-----------------+
                                         | LLM (local/remote)|
                                         | GPT3.5 / LLaMA   |
                                         +-----------------+
                                                   |
                                                   v
                                         +-----------------+
                                         | Frontend / Demo  |
                                         | Streamlit/React  |
                                         +-----------------+

Flow:
User uploads PDFs (or we pre-load demo set)


PDFs are split into chunks → embeddings generated → stored in Pinecone


User asks a question → LangChain retrieves top matching chunks from Pinecone


LLM generates an answer from retrieved chunks → displays answer + sources



Tech Stack
Component
Tool / Library
Document ingestion
LangChain PDF loader, PyMuPDF, PDFPlumber
Chunking
LangChain RecursiveCharacterTextSplitter
Embeddings
Open-source (SentenceTransformers: all-MiniLM-L6-v2) or OpenAI embeddings
Vector DB
Pinecone (Free Tier for demo)
RAG / QA
LangChain RetrievalQA or ConversationalRetrievalChain
LLM
GPT-3.5-turbo (OpenAI API, low cost) or local LLaMA-7B / MPT
Frontend
Streamlit / Gradio for quick demo OR React + TypeScript
Hosting
Local laptop for demo / optional Azure Function App (~$10/mo)


4️⃣ Step-by-Step Implementation
Step 1: Collect / Prepare Data
Choose 50–100 PDFs relevant to your target audience.


Optionally, pre-process PDFs:


Remove unnecessary pages


Extract text + tables using PyMuPDF or PDFPlumber



Step 2: Chunk Documents
Use LangChain TextSplitter:


from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,  # ~1 page per chunk
    chunk_overlap=200
)
chunks = text_splitter.split_text(pdf_text)

Each chunk will be a unit for embedding & retrieval



Step 3: Generate Embeddings
Option A: Open-source


from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")
embeddings = [model.encode(chunk) for chunk in chunks]

Option B: OpenAI API (higher quality, minimal cost for demo)


from openai import OpenAI
client = OpenAI()
response = client.embeddings.create(input=chunks, model="text-embedding-3-small")


Step 4: Store in Pinecone
import pinecone

pinecone.init(api_key="YOUR_API_KEY", environment="us-west1-gcp")
index = pinecone.Index("demo-papers")

# Upsert embeddings
for i, emb in enumerate(embeddings):
    index.upsert([(str(i), emb, {"source": pdf_name})])

Each embedding is associated with a metadata dictionary, e.g., source: PDF title.



Step 5: Build Retrieval + QA Chain
from langchain.vectorstores import Pinecone
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# Connect Pinecone to LangChain
vectorstore = Pinecone(index, embedding_function=model.encode)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0),
    retriever=retriever
)

# Ask a question
query = "Summarize the key findings about Transformer models."
answer = qa_chain.run(query)
print(answer)

k=3 → retrieves top 3 relevant chunks for context



Step 6: Build Frontend Demo
Option 1: Streamlit (fastest)


import streamlit as st

st.title("AI Research Assistant Demo")
query = st.text_input("Ask a question:")
if query:
    answer = qa_chain.run(query)
    st.write(answer)

Option 2: React + FastAPI backend (more professional, production-ready)



Step 7: Optional Enhancements
Show Sources: Include chunk.metadata['source'] in response


Highlight Text: Return text snippets with answer


Tables / Figures: Extract via OCR if needed (Tesseract or AWS Textract)


Continuous ingestion: Schedule a cron job to pull new PDFs



5️⃣ Cost Optimization (Demo Version)
Pinecone Free tier → $0


Open-source embeddings → $0


OpenAI embeddings → <$1 for 50 PDFs


LLM (GPT3.5-turbo) → ~$1–$2 for 100 queries


Hosting → free with local Streamlit / ngrok or ~$10/month for Azure

Total: $0–$10/month

6️⃣ MVP / Pitch Strategy
Curate domain-specific PDFs for demo


Showcase semantic search + RAG QA in a 1-minute live demo


Highlight:


Multi-document reasoning


Answer + source attribution


Potential to scale for corporate knowledge bases or research departments.