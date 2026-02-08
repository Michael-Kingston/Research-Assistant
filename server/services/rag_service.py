from typing import List
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from server.services import embedding_service, vector_store, document_service
from server.config import settings
from loguru import logger

async def _extract_themes(question: str, llm: ChatOpenAI) -> List[str]:
    """Extracts 1-3 conceptual research themes from the question."""
    try:
        prompt = f"Extract 1-3 high-level research themes (e.g., 'Methodology', 'Data Analysis', 'Literature Review') from this question: '{question}'. Return ONLY a comma-separated list of themes."
        response = await llm.ainvoke(prompt)
        themes = [t.strip().strip("'\"") for t in response.content.split(",") if t.strip()]
        return themes[:3]
    except Exception as e:
        logger.warning(f"Theme extraction failed: {e}")
        return ["Research"]

async def query_rag(question: str, top_k: int = 3, active_names: List[str] = []):
    """
    Performs RAG query using LangChain with metadata filtering.
    """
    logger.info(f"RAG query: {question} (Active Docs: {active_names})")
    
    try:
        # Initialize components
        embeddings = embedding_service.get_embedding_model()
        vectorstore = vector_store.get_vector_store(embeddings)
        
        # Setup LLM
        if not settings.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY missing. Returning mock response.")
            # Log query with default theme
            document_service.log_query(question, active_names, ["Research"])
            return {
                "answer": "I found some relevant information, but I need an OpenAI API key to generate a natural language response. Please check your .env file.",
                "sources": [{"source": name, "content": "Context snippet...", "page": 1} for name in active_names[:2]]
            }

        llm = ChatOpenAI(model="gpt-3.5-turbo", api_key=settings.OPENAI_API_KEY)
        
        # Extract themes conceptually
        themes = await _extract_themes(question, llm)
        
        # Log query for statistics with extracted themes
        document_service.log_query(question, active_names, themes)
        
        # Prepare filter if active_names provided
        search_kwargs = {"k": top_k}
        if active_names:
            search_kwargs["filter"] = {"source": {"$in": active_names}}
        
        # Setup QA Chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs=search_kwargs),
            return_source_documents=True
        )
        
        # Execute
        result = await qa_chain.ainvoke({"query": question})
        
        # Format sources
        sources = []
        for doc in result["source_documents"]:
            sources.append({
                "source": doc.metadata.get("source", "Unknown"),
                "content": doc.page_content[:200] + "...",
                "page": doc.metadata.get("page", 0) + 1 
            })
            
        return {
            "answer": result["result"],
            "sources": sources
        }
        
    except Exception as e:
        logger.error(f"Error in query_rag: {e}")
        return {
            "answer": f"Error: Failed to process research query. {str(e)}",
            "sources": []
        }
