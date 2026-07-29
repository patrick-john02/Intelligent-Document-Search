from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import SessionLocal 
from dataclasses import dataclass
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVectorStore
import httpx





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
    
    
    