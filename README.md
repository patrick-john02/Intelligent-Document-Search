Intelligent Document Searching System

stack used: LangChain, Langgraph, FASTAPI, Posgresql, 
llm: local Ollama

# setup the docker
type on terminal vscode : 

cd deployment
docker compose up -d
docker compose up -d pgadmin - for the UI on browser
docker compose up -d redis

#CELERY Run two workers (in two terminals on Windows)
uv run celery -A rag.worker worker -Q ocr -n ocr@%h --pool=solo -l info
uv run celery -A rag.worker worker -Q default -n default@%h --pool=solo -l info
c
watchfiles --filter python "celery -A rag.worker worker --loglevel=info --pool=solo -Q default,ocr"
uv run celery -A rag.worker worker -Q default,ocr --pool=solo -l info


# creds
Email: admin@admin.com
Password: admin


#  model/database migrations
alembic init -t async alembic
uv run alembic revision --autogenerate -m "create documents table"
uv run alembic upgrade head


new update: i used Anydoc on the part of ingestion.py for text extraction, rather than doing if else manully on python.


agents to be created: 
1. supervisor agent 
2. ingestion and tagging agent (archiving agent)
3. semantic search agent(researcher agent)
4. document analysis agent
5. report generator agent

test
uv run python -m test.try_alon 27


LLM used on development - Qwen3.5:2B and Qwen3.5:4B. groq api key