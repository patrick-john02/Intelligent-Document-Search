from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv 
from langchain_ollama.chat_models import ChatOllama
from langchain_ollama import OllamaEmbeddings

import os


load_dotenv()

ollama_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").replace("/v1", "").rstrip("/")
chat_model = ChatOllama(model=os.getenv("LLM_MODEL", "qwen3:8b"), base_url=ollama_url)
vision_model = ChatOllama(model=os.getenv("VISION_LLM", "qwen2-vl:7b"))
embedding_model = OllamaEmbeddings(model=os.getenv("EMBEDDING_MODEL", "nomic-embed-text"), base_url=ollama_url)


class AppSettings(BaseSettings):
    DATABASE_URL: str
    CORS_ORIGINS: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB:str
    POSTGRES_PORT:int
    HOST: str
    
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "qwen3:8b"
    VISION_LLM: str = "qwen22-vl:7b"
    EMBEDDING_MODEL: str = "nomic-embed-text"
    DOCUMENT_PATH: str = "./documents/"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
app_settings = AppSettings()

ollama_host = app_settings.OLLAMA_BASE_URL.replace("/v1", "").rstrip("/")

chat_model = ChatOllama(
    model=app_settings.LLM_MODEL,
    base_url=app_settings.LLM_MODEL,
    temperature=0.1
)

vision_model = ChatOllama(
    model=app_settings.VISION_LLM,
    base_url=ollama_host,
    temperature=0.1
)

embedding_model_model=OllamaEmbeddings(
    model=app_settings.EMBEDDING_MODEL,
    base_url=ollama_host
)
