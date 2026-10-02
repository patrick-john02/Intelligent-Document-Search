from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv 
from langchain_ollama.chat_models import ChatOllama
from langchain_ollama import OllamaEmbeddings
import os

load_dotenv()

class AppSettings(BaseSettings):
    DATABASE_URL: str
    CORS_ORIGINS: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int
    HOST: str
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen3:8b"
    VISION_LLM: str = "qwen2-vl:7b"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    EMBEDDING_TOKENIZER: str = "Qwen/Qwen2.5-0.5B"
    RERANKER_MODEL: str = "qwen2.5:1.5b-instruct"
    RERANKER_ENABLED: bool = True
    RERANKER_CANDIDATE_POOL: int = 20
    RERANKER_TOP_K: int = 5
    DOCUMENT_PATH: str = "./documents/"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
app_settings = AppSettings()

ollama_host = app_settings.OLLAMA_BASE_URL.replace("/v1", "").rstrip("/")
ollama_url = ollama_host

chat_model = ChatOllama(
    model=app_settings.LLM_MODEL,
    base_url=ollama_host,
    temperature=0.1
)

vision_model = ChatOllama(
    model=app_settings.VISION_LLM,
    base_url=ollama_host,
    temperature=0.1
)

embedding_model = OllamaEmbeddings(
    model=app_settings.EMBEDDING_MODEL,
    base_url=ollama_host
)
