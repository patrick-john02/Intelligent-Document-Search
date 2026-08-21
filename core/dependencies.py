from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from dataclasses import dataclass
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector
from core.configurations import app_settings
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
            
http_client = httpx.AsyncClient()
embedding_client = OllamaEmbeddings(
    model = "nomic-embed-text",
    base_url=ollama_url,
)
vector_store = PGVector(
    connection = app_settings.DATABASE_URL,
    embeddings=embedding_client,
    async_mode=True,
    create_extension=False,
)

@dataclass
class Deps:
    http_client: httpx.AsyncClient
    embedding_client: OllamaEmbeddings
    vector_store: PGVector
    # role: 


deps = Deps(
    http_client=http_client,
    embedding_client=embedding_client,
    vector_store=vector_store
)

async def get_deps()->Deps:
    return deps
    
    
# async def get_services()-> AsyncGenerator[Deps, None]:
#     ollama_client = chat_model(
#         base_url=f"{ollama_url}",
#         api_key=f"{ollama_client}",

#     )

#     try:
#         yield ollama_client 
#     except Exception as e:
#         ollama_client.close()
    
