from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from dataclasses import dataclass
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVectorStore
import httpx


from core.database import SessionLocal 
from core.configurations import(
    ollama_url, chat_model,
)



async def get_db()->AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
            
            


@dataclass
class Deps:
    http_client: httpx.AsyncClient
    embedding_client: OllamaEmbeddings
    vector_store: PGVectorStore
    # role: 
    
    
# async def get_services()-> AsyncGenerator[Deps, None]:
#     ollama_client = chat_model(
#         base_url=f"{ollama_url}",
#         api_key=f"{ollama_client}",

#     )

#     try:
#         yield ollama_client 
#     except Exception as e:
#         ollama_client.close()
    
