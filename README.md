# AI Research Assistant Demo

A scalable RAG-based AI assistant built with FastAPI, React + TypeScript, and LangChain.

## Features
- **User File Uploads**: Upload research PDFs directly through the UI.
- **RAG-powered QA**: Ask questions and get answers cited from your documents.
- **Scalable Architecture**: Modular backend services and containerized deployment.
- **Configurable Embeddings**: Toggle between OpenAI and open-source models.

## Tech Stack
- **Backend**: FastAPI, LangChain, Pinecone, Pydantic.
- **Frontend**: React, TypeScript, Vite, Lucide React.
- **Deployment**: Docker, Docker Compose.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Pinecone API Key (Placeholder support included)

### Local Setup

1. **Clone the repository**
2. **Setup Backend**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment**
   - Copy `.env.example` to `.env` and fill in your keys.
4. **Run Backend**
   ```bash
   python -m uvicorn server.main:app --reload
   ```
5. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Running with Docker
```bash
docker-compose up --build
```

## Scalability & Production Readiness
- **Multi-stage Docker builds**: Optimized for small image size and security.
- **Pydantic Settings**: Centralized and validated configuration.
- **Modular Services**: Separate logic for ingestion, retrieval, and embedding generation.
- **CORS & Error Handling**: Robust middleware and structured logging.
