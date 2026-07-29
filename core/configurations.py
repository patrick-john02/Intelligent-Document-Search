from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv 
from langchain_ollama.chat_models import ChatOllama
from langchain_ollama import OllamaEmbeddings

import os


load_dotenv()

ollama_url=os.getenv("OLLAMA_BASE_URL")
chat_model = ChatOllama("qwen3:8b", base_url=ollama_url)
embedding_model = OllamaEmbeddings(model="nomic-embed-text")


class AppSettings(BaseSettings):
    DATABASE_URL: str
    CORS_ORIGINS: str
    
    
    
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
app_settings = AppSettings()